import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';

export const auditController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { action, entity, limit = '50', offset = '0' } = req.query;

      const where: any = { organizationId: orgId };
      if (action && typeof action === 'string') {
        where.action = action;
      }
      if (entity && typeof entity === 'string') {
        where.entity = entity;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          take: parseInt(limit as string, 10),
          skip: parseInt(offset as string, 10),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.auditLog.count({ where })
      ]);

      const formatted = logs.map((l) => ({
        ...l,
        metadata: JSON.parse(l.metadataJson || '{}')
      }));

      res.json({
        success: true,
        data: {
          total,
          logs: formatted
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
