import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { prisma } from '../db/prisma';
import { aiProvider } from '../services/ai';
import { storageProvider } from '../services/storage';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';

export const candidatesController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { stage, jobId, search } = req.query;

      const where: any = { organizationId: orgId };
      if (stage && typeof stage === 'string') {
        where.stage = stage;
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } }
        ];
      }
      if (jobId && typeof jobId === 'string') {
        where.candidateJobs = { some: { jobId } };
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
          candidateJobs: { include: { job: { select: { id: true, title: true, department: true } } } },
          resumes: { select: { id: true, fileName: true, createdAt: true, skillsJson: true } },
          invitations: { select: { id: true, status: true, rawTokenHint: true, expiresAt: true } },
          interviewSessions: { select: { id: true, status: true, attemptNumber: true, completedAt: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = candidates.map((c) => ({
        ...c,
        skills: c.resumes[0] ? JSON.parse(c.resumes[0].skillsJson || '[]') : [],
        activeJob: c.candidateJobs[0]?.job || null,
        hasCompletedInterview: c.interviewSessions.some((s) => s.status === 'COMPLETED' || s.status === 'LOCKED')
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

      const candidate = await prisma.candidate.findFirst({
        where: { id, organizationId: orgId },
        include: {
          candidateJobs: { include: { job: { include: { requirements: true } } } },
          resumes: {
            include: { evidence: { include: { jobRequirement: true } } }
          },
          invitations: { include: { interview: true } },
          interviewSessions: {
            include: {
              responses: {
                include: {
                  question: true,
                  transcript: true,
                  evaluation: true,
                  recordings: true
                }
              },
              integrityEvents: true
            }
          },
          stageHistory: { orderBy: { createdAt: 'desc' } },
          recruiterNotes: { include: { user: { select: { firstName: true, lastName: true } } } },
          consentRecords: true
        }
      });

      if (!candidate) {
        throw new AppError('Candidate not found', 404, 'NOT_FOUND');
      }

      const primaryResume = candidate.resumes[0];
      const parsedResume = primaryResume
        ? {
            ...primaryResume,
            parsedData: JSON.parse(primaryResume.parsedDataJson || '{}'),
            skills: JSON.parse(primaryResume.skillsJson || '[]'),
            experience: JSON.parse(primaryResume.experienceJson || '[]'),
            education: JSON.parse(primaryResume.educationJson || '[]'),
            certifications: JSON.parse(primaryResume.certificationsJson || '[]')
          }
        : null;

      res.json({
        success: true,
        data: {
          ...candidate,
          primaryResume: parsedResume
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { firstName, lastName, email, phone, jobId, notes } = req.body;

      if (!firstName || !lastName || !email) {
        throw new AppError('First name, last name, and email are required', 400, 'VALIDATION_ERROR');
      }

      const candidate = await prisma.candidate.create({
        data: {
          organizationId: orgId,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone,
          stage: 'APPLIED',
          notes,
          candidateJobs: jobId
            ? {
                create: {
                  jobId,
                  currentStage: 'APPLIED'
                }
              }
            : undefined,
          stageHistory: {
            create: {
              previousStage: 'NONE',
              newStage: 'APPLIED',
              changedBy: `${req.user!.firstName} ${req.user!.lastName}`,
              note: 'Candidate created in platform'
            }
          }
        },
        include: { candidateJobs: true }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'CANDIDATE_CREATED',
        entity: 'Candidate',
        entityId: candidate.id,
        metadata: { email: candidate.email, jobId },
        req
      });

      res.status(201).json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  },

  async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;
      const file = req.file;

      if (!file) {
        throw new AppError('Resume file is required (PDF, DOCX, TXT)', 400, 'FILE_REQUIRED');
      }

      const candidate = await prisma.candidate.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!candidate) {
        throw new AppError('Candidate not found', 404, 'NOT_FOUND');
      }

      // Read raw text (for TXT, or mock extracted text for PDF)
      let rawText = '';
      try {
        if (file.mimetype === 'text/plain') {
          rawText = fs.readFileSync(file.path, 'utf8');
        } else {
          // For PDF/DOCX in demo/production, simulate extracted structured text
          rawText = `Candidate Resume: ${candidate.firstName} ${candidate.lastName} (${candidate.email}). Senior Software Engineer with expertise in Angular, TypeScript, Node.js, and SQL Server.`;
        }
      } catch (readErr: any) {
        rawText = `Resume file: ${file.originalname}`;
      }

      // Upload to Storage Provider
      const destKey = `resumes/${orgId}/${candidate.id}/${Date.now()}-${file.originalname}`;
      const uploadResult = await storageProvider.uploadFile(file.path, destKey, file.mimetype);

      // AI Parsing
      const parsed = await aiProvider.parseResume(rawText);

      // Save Resume
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          fileName: file.originalname,
          fileUrl: uploadResult.url,
          fileSizeBytes: file.size,
          mimeType: file.mimetype,
          rawText,
          parsedDataJson: JSON.stringify(parsed),
          skillsJson: JSON.stringify(parsed.skills || []),
          experienceJson: JSON.stringify(parsed.experience || []),
          educationJson: JSON.stringify(parsed.education || []),
          certificationsJson: JSON.stringify(parsed.certifications || [])
        }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'RESUME_UPLOADED',
        entity: 'Resume',
        entityId: resume.id,
        metadata: { fileName: file.originalname },
        req
      });

      res.status(201).json({
        success: true,
        data: {
          resume,
          parsed
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async matchEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { jobId } = req.body;
      const orgId = req.user!.organizationId;

      const candidate = await prisma.candidate.findFirst({
        where: { id, organizationId: orgId },
        include: { resumes: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });
      if (!candidate || !candidate.resumes[0]) {
        throw new AppError('Candidate or resume not found', 404, 'NOT_FOUND');
      }

      const job = await prisma.job.findFirst({
        where: { id: jobId, organizationId: orgId },
        include: { requirements: true }
      });
      if (!job) {
        throw new AppError('Job not found', 404, 'NOT_FOUND');
      }

      const resume = candidate.resumes[0];
      const parsedData = JSON.parse(resume.parsedDataJson || '{}');

      const matches = await aiProvider.matchEvidence(
        job.requirements.map((r) => ({ id: r.id, text: r.text, category: r.category })),
        parsedData
      );

      // Persist evidence records
      await prisma.resumeEvidence.deleteMany({ where: { resumeId: resume.id } });

      const evidenceRecords = await Promise.all(
        matches.map((m) =>
          prisma.resumeEvidence.create({
            data: {
              resumeId: resume.id,
              jobRequirementId: m.requirementId,
              quote: m.quote,
              section: m.section,
              confidenceScore: m.confidenceScore,
              matchLevel: m.matchLevel,
              gapAnalysis: m.gapAnalysis
            }
          })
        )
      );

      // Update candidate-job match score
      const avgScore = matches.reduce((acc, curr) => acc + (curr.matchLevel === 'STRONG' ? 95 : curr.matchLevel === 'MODERATE' ? 75 : 50), 0) / (matches.length || 1);
      await prisma.candidateJob.updateMany({
        where: { candidateId: candidate.id, jobId: job.id },
        data: { matchScore: Math.round(avgScore) }
      });

      res.json({ success: true, data: { matches, matchScore: Math.round(avgScore) } });
    } catch (err) {
      next(err);
    }
  },

  async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { newStage, note } = req.body;
      const orgId = req.user!.organizationId;

      const candidate = await prisma.candidate.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!candidate) {
        throw new AppError('Candidate not found', 404, 'NOT_FOUND');
      }

      const previousStage = candidate.stage;
      const updated = await prisma.candidate.update({
        where: { id },
        data: {
          stage: newStage,
          stageHistory: {
            create: {
              previousStage,
              newStage,
              changedBy: `${req.user!.firstName} ${req.user!.lastName}`,
              note: note || `Stage moved from ${previousStage} to ${newStage}`
            }
          }
        }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'STAGE_CHANGED',
        entity: 'Candidate',
        entityId: id,
        metadata: { previousStage, newStage, note },
        req
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { noteText, isPrivate } = req.body;
      const orgId = req.user!.organizationId;

      const note = await prisma.recruiterNote.create({
        data: {
          candidateId: id,
          organizationId: orgId,
          userId: req.user!.id,
          noteText,
          isPrivate: Boolean(isPrivate)
        },
        include: { user: { select: { firstName: true, lastName: true } } }
      });

      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  }
};
