import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { storageProvider } from '../services/storage';
import { integrityService } from '../services/integrity/integrity.service';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';

export const reviewController = {
  async getSessionReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const orgId = req.user!.organizationId;

      const session = await prisma.interviewSession.findFirst({
        where: { id: sessionId, organizationId: orgId },
        include: {
          candidate: {
            include: {
              resumes: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
          },
          interview: {
            include: {
              job: true,
              questions: { orderBy: { orderIndex: 'asc' } }
            }
          },
          responses: {
            include: {
              question: true,
              recordings: true,
              transcript: true,
              evaluation: true
            }
          },
          integrityEvents: { orderBy: { timestamp: 'asc' } },
          invitation: { include: { consentRecords: true } }
        }
      });

      if (!session) {
        throw new AppError('Interview session not found', 404, 'NOT_FOUND');
      }

      // Generate signed media download URLs for each recording
      const responsesWithSignedMedia = await Promise.all(
        session.responses.map(async (r) => {
          const recordingsWithSignedUrls = await Promise.all(
            r.recordings.map(async (rec) => {
              const signedUrl = await storageProvider.getSignedDownloadUrl(rec.blobKey, 120);
              return {
                ...rec,
                signedPlaybackUrl: signedUrl
              };
            })
          );

          return {
            ...r,
            recordings: recordingsWithSignedUrls,
            transcript: r.transcript
              ? {
                  ...r.transcript,
                  segments: JSON.parse(r.transcript.segmentsJson || '[]')
                }
              : null,
            evaluation: r.evaluation
              ? {
                  ...r.evaluation,
                  quoteEvidence: JSON.parse(r.evaluation.quoteEvidenceJson || '[]'),
                  strengths: JSON.parse(r.evaluation.strengthsJson || '[]'),
                  gaps: JSON.parse(r.evaluation.gapsJson || '[]')
                }
              : null
          };
        })
      );

      // Audit that recording was reviewed
      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'RECORDING_VIEWED',
        entity: 'InterviewSession',
        entityId: sessionId,
        req
      });

      res.json({
        success: true,
        data: {
          session: {
            id: session.id,
            status: session.status,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            ipAddress: session.ipAddress,
            browserInfo: JSON.parse(session.browserInfoJson || '{}'),
            deviceMetadata: JSON.parse(session.deviceMetadataJson || '{}')
          },
          candidate: session.candidate,
          job: session.interview.job,
          interview: {
            id: session.interview.id,
            title: session.interview.title,
            timeLimitMinutes: session.interview.timeLimitMinutes,
            scoringRubric: JSON.parse(session.interview.scoringRubricJson || '{}')
          },
          responses: responsesWithSignedMedia,
          integrityEvents: session.integrityEvents,
          consentRecords: session.invitation.consentRecords
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async overrideEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evaluationId = req.params.evaluationId as string;
      const { humanScore, overrideReason } = req.body;
      const orgId = req.user!.organizationId;

      if (humanScore === undefined || !overrideReason) {
        throw new AppError('Human score and justification reason are required', 400, 'VALIDATION_ERROR');
      }

      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId },
        include: { response: { include: { session: true } } }
      });

      if (!evaluation || evaluation.response.session.organizationId !== orgId) {
        throw new AppError('Evaluation not found', 404, 'NOT_FOUND');
      }

      const updated = await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          isOverridden: true,
          humanScore: parseFloat(humanScore),
          overrideReason,
          overriddenBy: `${req.user!.firstName} ${req.user!.lastName} (${req.user!.email})`,
          overriddenAt: new Date()
        }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'EVALUATION_OVERRIDDEN',
        entity: 'Evaluation',
        entityId: evaluationId,
        metadata: {
          aiScore: evaluation.score,
          humanScore,
          overrideReason
        },
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async reviewIntegrityEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.eventId as string;
      const { status, comment } = req.body;
      const orgId = req.user!.organizationId;

      const event = await prisma.integrityEvent.findUnique({
        where: { id: eventId },
        include: { session: true }
      });

      if (!event || event.session.organizationId !== orgId) {
        throw new AppError('Integrity event not found', 404, 'NOT_FOUND');
      }

      const updated = await integrityService.updateReviewStatus(
        eventId,
        `${req.user!.firstName} ${req.user!.lastName}`,
        status,
        comment
      );

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'INTEGRITY_EVENT_REVIEWED',
        entity: 'IntegrityEvent',
        entityId: eventId,
        metadata: { status, comment },
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
};
