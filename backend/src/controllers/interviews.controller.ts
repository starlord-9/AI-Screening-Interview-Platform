import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { aiProvider } from '../services/ai';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';

export const interviewsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { jobId } = req.query;

      const where: any = { organizationId: orgId };
      if (jobId && typeof jobId === 'string') {
        where.jobId = jobId;
      }

      const interviews = await prisma.interview.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, department: true } },
          questions: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { invitations: true, sessions: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = interviews.map((inv) => ({
        ...inv,
        scoringRubric: JSON.parse(inv.scoringRubricJson || '{}'),
        invitationsCount: inv._count.invitations,
        sessionsCount: inv._count.sessions
      }));

      res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: orgId },
        include: {
          job: { include: { requirements: true } },
          questions: { orderBy: { orderIndex: 'asc' } },
          invitations: { include: { candidate: true } }
        }
      });

      if (!interview) {
        throw new AppError('Interview plan not found', 404, 'NOT_FOUND');
      }

      const formattedQuestions = interview.questions.map((q) => ({
        ...q,
        scoringCriteria: JSON.parse(q.scoringCriteriaJson || '{}'),
        followUpRules: JSON.parse(q.followUpRulesJson || '[]'),
        codeTestCases: q.codeTestCasesJson ? JSON.parse(q.codeTestCasesJson) : []
      }));

      res.json({
        success: true,
        data: {
          ...interview,
          scoringRubric: JSON.parse(interview.scoringRubricJson || '{}'),
          questions: formattedQuestions
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { jobId, title, description, timeLimitMinutes, scoringRubric, questions } = req.body;

      if (!jobId || !title) {
        throw new AppError('Job ID and Title are required', 400, 'VALIDATION_ERROR');
      }

      const job = await prisma.job.findFirst({ where: { id: jobId, organizationId: orgId } });
      if (!job) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      const interview = await prisma.interview.create({
        data: {
          organizationId: orgId,
          jobId,
          title,
          description: description || `Interview plan for ${job.title}`,
          version: 1,
          isPublished: false,
          timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : 30,
          totalQuestions: (questions || []).length,
          scoringRubricJson: JSON.stringify(
            scoringRubric || {
              technicalWeight: 40,
              problemSolvingWeight: 25,
              communicationWeight: 20,
              behavioralWeight: 15
            }
          ),
          createdBy: `${req.user!.firstName} ${req.user!.lastName}`,
          questions: {
            create: (questions || []).map((q: any, idx: number) => ({
              orderIndex: idx,
              questionText: q.questionText,
              category: q.category || 'TECHNICAL',
              difficulty: q.difficulty || 'MEDIUM',
              expectedCompetency: q.expectedCompetency || 'Technical Proficiency',
              timeLimitSeconds: q.timeLimitSeconds ? parseInt(q.timeLimitSeconds, 10) : 180,
              answerType: q.answerType || 'VIDEO',
              isRequired: q.isRequired !== false,
              scoringCriteriaJson: JSON.stringify(q.scoringCriteria || {}),
              followUpRulesJson: JSON.stringify(q.followUpRules || []),
              codeStarterSnippet: q.codeStarterSnippet,
              codeTestCasesJson: q.codeTestCases ? JSON.stringify(q.codeTestCases) : null
            }))
          }
        },
        include: { questions: true }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'INTERVIEW_CREATED',
        entity: 'Interview',
        entityId: interview.id,
        req
      });

      res.status(201).json({ success: true, data: interview });
    } catch (err) {
      next(err);
    }
  },

  async generatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { jobId, durationMinutes } = req.body;

      const job = await prisma.job.findFirst({
        where: { id: jobId, organizationId: orgId },
        include: { requirements: true }
      });
      if (!job) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      const generatedQuestions = await aiProvider.generateInterviewPlan(
        job.title,
        job.requirements.map((r) => ({ text: r.text, category: r.category })),
        durationMinutes || 30
      );

      res.json({
        success: true,
        data: {
          title: `${job.title} - AI Structured Interview`,
          description: `Evidence-based interview plan mapped to ${job.title} requirements.`,
          timeLimitMinutes: durationMinutes || 30,
          questions: generatedQuestions
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: orgId },
        include: { questions: true }
      });
      if (!interview) {
        throw new AppError('Interview not found', 404, 'NOT_FOUND');
      }

      if (interview.questions.length === 0) {
        throw new AppError('Cannot publish an interview with zero questions', 400, 'NO_QUESTIONS');
      }

      const updated = await prisma.interview.update({
        where: { id },
        data: {
          isPublished: true,
          totalQuestions: interview.questions.length
        }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'INTERVIEW_PUBLISHED',
        entity: 'Interview',
        entityId: id,
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;
      const q = req.body;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: orgId },
        include: { questions: true }
      });
      if (!interview) {
        throw new AppError('Interview not found', 404, 'NOT_FOUND');
      }

      const nextOrder = interview.questions.length;

      const question = await prisma.interviewQuestion.create({
        data: {
          interviewId: id,
          orderIndex: nextOrder,
          questionText: q.questionText,
          category: q.category || 'TECHNICAL',
          difficulty: q.difficulty || 'MEDIUM',
          expectedCompetency: q.expectedCompetency || 'Competency',
          timeLimitSeconds: q.timeLimitSeconds ? parseInt(q.timeLimitSeconds, 10) : 180,
          answerType: q.answerType || 'VIDEO',
          isRequired: q.isRequired !== false,
          scoringCriteriaJson: JSON.stringify(q.scoringCriteria || {}),
          followUpRulesJson: JSON.stringify(q.followUpRules || []),
          codeStarterSnippet: q.codeStarterSnippet,
          codeTestCasesJson: q.codeTestCases ? JSON.stringify(q.codeTestCases) : null
        }
      });

      await prisma.interview.update({
        where: { id },
        data: { totalQuestions: nextOrder + 1 }
      });

      res.status(201).json({ success: true, data: question });
    } catch (err) {
      next(err);
    }
  },

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const questionId = req.params.questionId as string;
      const orgId = req.user!.organizationId;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!interview) {
        throw new AppError('Interview not found', 404, 'NOT_FOUND');
      }

      await prisma.interviewQuestion.delete({ where: { id: questionId } });

      const remaining = await prisma.interviewQuestion.findMany({
        where: { interviewId: id },
        orderBy: { orderIndex: 'asc' }
      });

      for (let i = 0; i < remaining.length; i++) {
        await prisma.interviewQuestion.update({
          where: { id: remaining[i].id },
          data: { orderIndex: i }
        });
      }

      await prisma.interview.update({
        where: { id },
        data: { totalQuestions: remaining.length }
      });

      res.json({ success: true, message: 'Question deleted' });
    } catch (err) {
      next(err);
    }
  }
};
