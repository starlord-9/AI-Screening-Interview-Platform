import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { aiProvider } from '../services/ai';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';

export const jobsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { status, search } = req.query;

      const where: any = { organizationId: orgId };
      if (status && typeof status === 'string') {
        where.status = status;
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search } },
          { department: { contains: search } },
          { location: { contains: search } }
        ];
      }

      const jobs = await prisma.job.findMany({
        where,
        include: {
          requirements: true,
          _count: {
            select: { candidateJobs: true, interviews: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = jobs.map((j) => ({
        ...j,
        responsibilities: JSON.parse(j.responsibilitiesJson || '[]'),
        requiredSkills: JSON.parse(j.requiredSkillsJson || '[]'),
        preferredSkills: JSON.parse(j.preferredSkillsJson || '[]'),
        screeningCriteria: JSON.parse(j.screeningCriteriaJson || '[]'),
        candidateCount: j._count.candidateJobs,
        interviewCount: j._count.interviews
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

      const job = await prisma.job.findFirst({
        where: { id, organizationId: orgId },
        include: {
          requirements: true,
          interviews: {
            include: { questions: { orderBy: { orderIndex: 'asc' } } }
          },
          candidateJobs: {
            include: { candidate: true }
          }
        }
      });

      if (!job) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          ...job,
          responsibilities: JSON.parse(job.responsibilitiesJson || '[]'),
          requiredSkills: JSON.parse(job.requiredSkillsJson || '[]'),
          preferredSkills: JSON.parse(job.preferredSkillsJson || '[]'),
          screeningCriteria: JSON.parse(job.screeningCriteriaJson || '[]')
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const {
        title,
        department,
        location,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        currency,
        description,
        responsibilities,
        requiredSkills,
        preferredSkills,
        education,
        certifications,
        screeningCriteria,
        interviewDurationMinutes,
        interviewMode,
        status,
        requirements
      } = req.body;

      if (!title || !description) {
        throw new AppError('Job title and description are required', 400, 'VALIDATION_ERROR');
      }

      const job = await prisma.job.create({
        data: {
          organizationId: orgId,
          title,
          department: department || 'Engineering',
          location: location || 'Remote',
          employmentType: employmentType || 'FULL_TIME',
          experienceLevel: experienceLevel || 'MID',
          salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
          salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
          currency: currency || 'USD',
          description,
          responsibilitiesJson: JSON.stringify(responsibilities || []),
          requiredSkillsJson: JSON.stringify(requiredSkills || []),
          preferredSkillsJson: JSON.stringify(preferredSkills || []),
          education,
          certifications,
          screeningCriteriaJson: JSON.stringify(screeningCriteria || []),
          interviewDurationMinutes: interviewDurationMinutes ? parseInt(interviewDurationMinutes, 10) : 30,
          interviewMode: interviewMode || 'MIXED',
          status: status || 'ACTIVE',
          requirements: {
            create: (requirements || []).map((r: any) => ({
              category: r.category || 'TECHNICAL',
              text: r.text,
              weight: r.weight || 1.0,
              isMandatory: r.isMandatory !== false,
              sourceParagraph: r.sourceParagraph || 'Job Description'
            }))
          }
        },
        include: { requirements: true }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'JOB_CREATED',
        entity: 'Job',
        entityId: job.id,
        metadata: { title: job.title },
        req
      });

      res.status(201).json({
        success: true,
        data: {
          ...job,
          responsibilities: JSON.parse(job.responsibilitiesJson || '[]'),
          requiredSkills: JSON.parse(job.requiredSkillsJson || '[]'),
          preferredSkills: JSON.parse(job.preferredSkillsJson || '[]'),
          screeningCriteria: JSON.parse(job.screeningCriteriaJson || '[]')
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const existing = await prisma.job.findFirst({ where: { id, organizationId: orgId } });
      if (!existing) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      const {
        title,
        department,
        location,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        currency,
        description,
        responsibilities,
        requiredSkills,
        preferredSkills,
        education,
        certifications,
        screeningCriteria,
        interviewDurationMinutes,
        interviewMode,
        status
      } = req.body;

      const updated = await prisma.job.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          department: department ?? existing.department,
          location: location ?? existing.location,
          employmentType: employmentType ?? existing.employmentType,
          experienceLevel: experienceLevel ?? existing.experienceLevel,
          salaryMin: salaryMin !== undefined ? parseInt(salaryMin, 10) : existing.salaryMin,
          salaryMax: salaryMax !== undefined ? parseInt(salaryMax, 10) : existing.salaryMax,
          currency: currency ?? existing.currency,
          description: description ?? existing.description,
          responsibilitiesJson: responsibilities ? JSON.stringify(responsibilities) : existing.responsibilitiesJson,
          requiredSkillsJson: requiredSkills ? JSON.stringify(requiredSkills) : existing.requiredSkillsJson,
          preferredSkillsJson: preferredSkills ? JSON.stringify(preferredSkills) : existing.preferredSkillsJson,
          education: education ?? existing.education,
          certifications: certifications ?? existing.certifications,
          screeningCriteriaJson: screeningCriteria ? JSON.stringify(screeningCriteria) : existing.screeningCriteriaJson,
          interviewDurationMinutes:
            interviewDurationMinutes !== undefined
              ? parseInt(interviewDurationMinutes, 10)
              : existing.interviewDurationMinutes,
          interviewMode: interviewMode ?? existing.interviewMode,
          status: status ?? existing.status
        },
        include: { requirements: true }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'JOB_UPDATED',
        entity: 'Job',
        entityId: id,
        metadata: { title: updated.title, status: updated.status },
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const existing = await prisma.job.findFirst({ where: { id, organizationId: orgId } });
      if (!existing) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      await prisma.job.delete({ where: { id } });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'JOB_DELETED',
        entity: 'Job',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async analyzeRawJD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const description = req.body.description || req.body.rawText;
      if (!description || description.trim().length < 10) {
        throw new AppError('Job description text is required', 400, 'VALIDATION_ERROR');
      }

      const analysis = await aiProvider.analyzeJobDescription(description);
      res.json({ success: true, data: analysis });
    } catch (err) {
      next(err);
    }
  }
};
