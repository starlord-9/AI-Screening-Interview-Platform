import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { cryptoUtil } from '../utils/crypto';
import { notificationService } from '../services/notifications/notification.service';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

export const invitationsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, interviewId, expiresInDays, singleUseStart, sendEmailNotification } = req.body;

      if (!candidateId || !interviewId) {
        throw new AppError('Candidate ID and Interview ID are required', 400, 'VALIDATION_ERROR');
      }

      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, organizationId: orgId }
      });
      if (!candidate) {
        throw new AppError('Candidate not found', 404, 'NOT_FOUND');
      }

      const interview = await prisma.interview.findFirst({
        where: { id: interviewId, organizationId: orgId },
        include: { job: true }
      });
      if (!interview) {
        throw new AppError('Interview not found', 404, 'NOT_FOUND');
      }

      if (!interview.isPublished) {
        throw new AppError('Interview must be published before sending invitations', 400, 'INTERVIEW_NOT_PUBLISHED');
      }

      // Generate secure high-entropy token
      const rawToken = cryptoUtil.generateToken(32);
      const tokenHash = cryptoUtil.hashToken(rawToken);
      const rawTokenHint = cryptoUtil.getHint(rawToken);

      const days = expiresInDays ? parseInt(expiresInDays, 10) : 7;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const invitation = await prisma.invitation.create({
        data: {
          organizationId: orgId,
          candidateId,
          interviewId,
          tokenHash,
          rawTokenHint,
          status: 'PENDING',
          expiresAt,
          singleUseStart: Boolean(singleUseStart)
        }
      });

      const inviteLink = `${config.applicationUrl}/candidate/interview/${rawToken}`;

      if (sendEmailNotification) {
        await notificationService.sendEmail({
          to: candidate.email,
          subject: `Interview Invitation: ${interview.job.title} at ${interview.job.department}`,
          organizationId: orgId,
          type: 'INVITATION',
          bodyText: `Hello ${candidate.firstName},\n\nYou have been invited to participate in a digital interview for the ${interview.job.title} position.\nPlease click the secure link below to review the instructions, verify your device, and begin your interview:\n\n${inviteLink}\n\nThis invitation expires on ${expiresAt.toLocaleDateString()}.\n\nBest regards,\nTalent Acquisition Team`,
          payload: { inviteLink, expiresAt }
        });
      }

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'INVITATION_CREATED',
        entity: 'Invitation',
        entityId: invitation.id,
        metadata: { candidateId, interviewId, rawTokenHint },
        req
      });

      res.status(201).json({
        success: true,
        data: {
          id: invitation.id,
          token: rawToken, // Returned once upon creation for copy-paste
          inviteLink,
          rawTokenHint,
          expiresAt,
          status: invitation.status
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const invitation = await prisma.invitation.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!invitation) {
        throw new AppError('Invitation not found', 404, 'NOT_FOUND');
      }

      const updated = await prisma.invitation.update({
        where: { id },
        data: { status: 'REVOKED' }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'INVITATION_REVOKED',
        entity: 'Invitation',
        entityId: id,
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async publicValidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      if (!token) {
        throw new AppError('Invitation token required', 400, 'TOKEN_REQUIRED');
      }

      const tokenHash = cryptoUtil.hashToken(token);
      const invitation = await prisma.invitation.findUnique({
        where: { tokenHash },
        include: {
          organization: { select: { id: true, name: true, logoUrl: true } },
          candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
          interview: {
            include: {
              job: { select: { title: true, department: true, location: true } },
              questions: { select: { id: true, orderIndex: true, timeLimitSeconds: true, answerType: true } }
            }
          },
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!invitation) {
        throw new AppError('Invalid invitation link. Please check your URL.', 404, 'INVITATION_NOT_FOUND');
      }

      if (invitation.status === 'REVOKED') {
        throw new AppError('This interview invitation has been revoked.', 403, 'INVITATION_REVOKED');
      }

      if (new Date() > invitation.expiresAt) {
        throw new AppError('This interview invitation has expired.', 403, 'INVITATION_EXPIRED');
      }

      const lastSession = invitation.sessions[0];
      const isCompleted = lastSession?.status === 'COMPLETED' || lastSession?.status === 'LOCKED';

      res.json({
        success: true,
        data: {
          organizationName: invitation.organization.name,
          organizationLogo: invitation.organization.logoUrl,
          candidateName: `${invitation.candidate.firstName} ${invitation.candidate.lastName}`,
          jobTitle: invitation.interview.job.title,
          department: invitation.interview.job.department,
          location: invitation.interview.job.location,
          interviewTitle: invitation.interview.title,
          interviewDescription: invitation.interview.description,
          timeLimitMinutes: invitation.interview.timeLimitMinutes,
          questionCount: invitation.interview.questions.length,
          expiresAt: invitation.expiresAt,
          isCompleted,
          existingSessionId: lastSession ? lastSession.id : null,
          existingSessionStatus: lastSession ? lastSession.status : null
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
