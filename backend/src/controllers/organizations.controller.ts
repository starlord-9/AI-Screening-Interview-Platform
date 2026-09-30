import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/errorHandler';

export const organizationsController = {
  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          dataRetentionPolicies: true,
          _count: { select: { users: true, jobs: true, candidates: true } }
        }
      });

      if (!org) {
        throw new AppError('Organization not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          ...org,
          settings: JSON.parse(org.settingsJson || '{}')
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { name, website, retentionDays, allowedDomains, settings } = req.body;

      const updated = await prisma.organization.update({
        where: { id: orgId },
        data: {
          name,
          website,
          retentionDays: retentionDays ? parseInt(retentionDays, 10) : undefined,
          allowedDomains,
          settingsJson: settings ? JSON.stringify(settings) : undefined
        }
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async updateRetentionPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { resumeRetentionDays, recordingRetentionDays, transcriptRetentionDays, auditRetentionDays, autoDeleteEnabled } = req.body;

      let policy = await prisma.dataRetentionPolicy.findFirst({
        where: { organizationId: orgId }
      });

      if (policy) {
        policy = await prisma.dataRetentionPolicy.update({
          where: { id: policy.id },
          data: {
            resumeRetentionDays: resumeRetentionDays ? parseInt(resumeRetentionDays, 10) : policy.resumeRetentionDays,
            recordingRetentionDays: recordingRetentionDays ? parseInt(recordingRetentionDays, 10) : policy.recordingRetentionDays,
            transcriptRetentionDays: transcriptRetentionDays ? parseInt(transcriptRetentionDays, 10) : policy.transcriptRetentionDays,
            auditRetentionDays: auditRetentionDays ? parseInt(auditRetentionDays, 10) : policy.auditRetentionDays,
            autoDeleteEnabled: autoDeleteEnabled !== undefined ? Boolean(autoDeleteEnabled) : policy.autoDeleteEnabled
          }
        });
      } else {
        policy = await prisma.dataRetentionPolicy.create({
          data: {
            organizationId: orgId,
            resumeRetentionDays: resumeRetentionDays ? parseInt(resumeRetentionDays, 10) : 180,
            recordingRetentionDays: recordingRetentionDays ? parseInt(recordingRetentionDays, 10) : 90,
            transcriptRetentionDays: transcriptRetentionDays ? parseInt(transcriptRetentionDays, 10) : 365,
            auditRetentionDays: auditRetentionDays ? parseInt(auditRetentionDays, 10) : 730,
            autoDeleteEnabled: autoDeleteEnabled !== undefined ? Boolean(autoDeleteEnabled) : true
          }
        });
      }

      res.json({ success: true, data: policy });
    } catch (err) {
      next(err);
    }
  }
};
