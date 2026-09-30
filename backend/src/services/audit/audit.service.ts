import { Request } from 'express';
import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';

export interface AuditLogParams {
  organizationId: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export const auditService = {
  async log(params: AuditLogParams): Promise<void> {
    try {
      const ipAddress = params.req?.ip || params.req?.socket?.remoteAddress;
      const userAgent = params.req?.headers['user-agent'];

      await prisma.auditLog.create({
        data: {
          organizationId: params.organizationId,
          actorId: params.actorId || 'system',
          actorEmail: params.actorEmail || 'system@talentmind.ai',
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadataJson: JSON.stringify(params.metadata || {}),
          ipAddress: typeof ipAddress === 'string' ? ipAddress : undefined,
          userAgent: typeof userAgent === 'string' ? userAgent : undefined
        }
      });
    } catch (err: any) {
      logger.error('Failed to write audit log', { error: err.message, action: params.action });
    }
  }
};
