import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  organizationId: string;
  type: 'INVITATION' | 'REMINDER' | 'INTERVIEW_COMPLETED' | 'REVIEW_READY';
  bodyText: string;
  payload?: any;
}

export const notificationService = {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    logger.info('NotificationService: sending notification', {
      to: options.to,
      subject: options.subject,
      type: options.type
    });

    try {
      await prisma.notification.create({
        data: {
          organizationId: options.organizationId,
          recipientEmail: options.to,
          subject: options.subject,
          type: options.type,
          payloadJson: JSON.stringify(options.payload || {}),
          status: 'SENT',
          sentAt: new Date()
        }
      });
      return true;
    } catch (err: any) {
      logger.error('Failed to record notification', { error: err.message });
      return false;
    }
  }
};
