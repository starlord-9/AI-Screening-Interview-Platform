import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';

export const retentionService = {
  async executeRetentionPolicies(): Promise<{ deletedRecordings: number; deletedResumes: number }> {
    logger.info('Executing automated data retention cleanup...');
    const now = new Date();

    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { autoDeleteEnabled: true }
    });

    let totalDeletedRecordings = 0;
    let totalDeletedResumes = 0;

    for (const policy of policies) {
      const recordingCutoff = new Date(now.getTime() - policy.recordingRetentionDays * 24 * 60 * 60 * 1000);
      const resumeCutoff = new Date(now.getTime() - policy.resumeRetentionDays * 24 * 60 * 60 * 1000);

      // Find sessions belonging to organization
      const sessions = await prisma.interviewSession.findMany({
        where: { organizationId: policy.organizationId },
        select: { id: true }
      });
      const sessionIds = sessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        const deletedRecordings = await prisma.recording.deleteMany({
          where: {
            sessionId: { in: sessionIds },
            createdAt: { lt: recordingCutoff }
          }
        });
        totalDeletedRecordings += deletedRecordings.count;
      }

      // Cleanup old candidate resumes if expired
      const candidates = await prisma.candidate.findMany({
        where: { organizationId: policy.organizationId },
        select: { id: true }
      });
      const candidateIds = candidates.map((c) => c.id);

      if (candidateIds.length > 0) {
        const deletedResumes = await prisma.resume.deleteMany({
          where: {
            candidateId: { in: candidateIds },
            createdAt: { lt: resumeCutoff }
          }
        });
        totalDeletedResumes += deletedResumes.count;
      }
    }

    logger.info('Data retention cleanup complete', { totalDeletedRecordings, totalDeletedResumes });
    return { deletedRecordings: totalDeletedRecordings, deletedResumes: totalDeletedResumes };
  }
};
