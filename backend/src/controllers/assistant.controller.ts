import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { aiProvider } from '../services/ai';
import { AppError } from '../middleware/errorHandler';

export const assistantController = {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { query, candidateId, jobId, sessionId } = req.body;

      if (!query || query.trim().length === 0) {
        throw new AppError('Query string is required', 400, 'QUERY_REQUIRED');
      }

      let candidateName = 'the candidate';
      let jobTitle = 'the role';
      let resumeSummary = '';
      const transcripts: Array<{ questionText: string; answerText: string }> = [];
      const evaluations: Array<{ competency: string; score: number; summary: string }> = [];
      let integritySummary = '';

      if (candidateId) {
        const candidate = await prisma.candidate.findFirst({
          where: { id: candidateId, organizationId: orgId },
          include: {
            resumes: { take: 1, orderBy: { createdAt: 'desc' } },
            candidateJobs: { include: { job: true }, take: 1 }
          }
        });
        if (candidate) {
          candidateName = `${candidate.firstName} ${candidate.lastName}`;
          if (candidate.candidateJobs[0]) {
            jobTitle = candidate.candidateJobs[0].job.title;
          }
          if (candidate.resumes[0]) {
            const parsed = JSON.parse(candidate.resumes[0].parsedDataJson || '{}');
            resumeSummary = parsed.summary || '';
          }
        }
      }

      if (sessionId) {
        const session = await prisma.interviewSession.findFirst({
          where: { id: sessionId, organizationId: orgId },
          include: {
            interview: { include: { job: true } },
            responses: {
              include: { question: true, transcript: true, evaluation: true }
            },
            integrityEvents: true
          }
        });

        if (session) {
          jobTitle = session.interview.job.title;
          session.responses.forEach((r) => {
            if (r.transcript) {
              transcripts.push({
                questionText: r.question.questionText,
                answerText: r.transcript.fullText
              });
            }
            if (r.evaluation) {
              evaluations.push({
                competency: r.evaluation.competency,
                score: r.evaluation.score,
                summary: r.evaluation.summary
              });
            }
          });

          if (session.integrityEvents.length > 0) {
            integritySummary = `Recorded ${session.integrityEvents.length} events: ${session.integrityEvents.map((e) => `${e.eventType} (${e.severity})`).join(', ')}`;
          }
        }
      }

      const answer = await aiProvider.queryRecruiterAssistant(query, {
        candidateName,
        jobTitle,
        resumeSummary,
        transcripts,
        evaluations,
        integritySummary
      });

      res.json({ success: true, data: answer });
    } catch (err) {
      next(err);
    }
  }
};
