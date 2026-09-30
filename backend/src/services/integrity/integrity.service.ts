import { prisma } from '../../db/prisma';
import { IntegrityEventType } from '../../types';
import { logger } from '../../utils/logger';

export interface RecordIntegrityEventParams {
  sessionId: string;
  candidateId: string;
  eventType: IntegrityEventType;
  durationSeconds?: number;
  source?: string;
  facts: string;
  evidence?: string;
  uncertainty?: 'LOW' | 'MEDIUM' | 'HIGH';
  browser?: string;
  device?: string;
  severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export const integrityService = {
  async recordEvent(params: RecordIntegrityEventParams) {
    logger.info('IntegrityService: logging browser signal event', {
      sessionId: params.sessionId,
      eventType: params.eventType,
      severity: params.severity
    });

    return prisma.integrityEvent.create({
      data: {
        sessionId: params.sessionId,
        candidateId: params.candidateId,
        eventType: params.eventType,
        durationSeconds: params.durationSeconds || 0,
        source: params.source || 'BROWSER',
        facts: params.facts,
        evidence: params.evidence,
        uncertainty: params.uncertainty || 'MEDIUM',
        browser: params.browser,
        device: params.device,
        severity: params.severity || 'INFO',
        reviewStatus: 'UNREVIEWED'
      }
    });
  },

  async getSessionTimeline(sessionId: string) {
    return prisma.integrityEvent.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    });
  },

  async updateReviewStatus(
    eventId: string,
    reviewerId: string,
    status: 'REVIEWED' | 'DISMISSED' | 'ACTIONED',
    comment?: string
  ) {
    return prisma.integrityEvent.update({
      where: { id: eventId },
      data: {
        reviewStatus: status,
        reviewerId,
        reviewComment: comment,
        resolution: status === 'DISMISSED' ? 'Dismissed after human review' : 'Noted by reviewer'
      }
    });
  }
};
