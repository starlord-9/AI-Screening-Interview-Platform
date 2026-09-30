import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const [jobsCount, candidatesCount, invitationsCount, completedSessionsCount] = await Promise.all([
        prisma.job.count({ where: { organizationId: orgId } }),
        prisma.candidate.count({ where: { organizationId: orgId } }),
        prisma.invitation.count({ where: { organizationId: orgId } }),
        prisma.interviewSession.count({
          where: { organizationId: orgId, status: { in: ['COMPLETED', 'LOCKED'] } }
        })
      ]);

      const stageCounts = await prisma.candidate.groupBy({
        by: ['stage'],
        where: { organizationId: orgId },
        _count: { stage: true }
      });

      const stagesMap: Record<string, number> = {
        APPLIED: 0,
        SCREENING: 0,
        INTERVIEW: 0,
        TECHNICAL: 0,
        HIRING_MANAGER: 0,
        FINAL_REVIEW: 0,
        SELECTED: 0,
        REJECTED: 0
      };

      stageCounts.forEach((s) => {
        stagesMap[s.stage] = s._count.stage;
      });

      // Calculate average evaluation score across all completed interviews
      const evaluations = await prisma.evaluation.findMany({
        where: { response: { session: { organizationId: orgId } } },
        select: { score: true, humanScore: true, isOverridden: true }
      });

      let avgScore = 0;
      if (evaluations.length > 0) {
        const total = evaluations.reduce((acc, curr) => acc + (curr.isOverridden && curr.humanScore ? curr.humanScore : curr.score), 0);
        avgScore = Math.round((total / evaluations.length) * 10) / 10;
      }

      res.json({
        success: true,
        data: {
          metrics: {
            activeJobs: jobsCount,
            totalCandidates: candidatesCount,
            interviewsInvited: invitationsCount,
            interviewsCompleted: completedSessionsCount,
            averageScore: avgScore,
            completionRate: invitationsCount > 0 ? Math.round((completedSessionsCount / invitationsCount) * 100) : 0
          },
          funnel: stagesMap,
          recentActivity: [
            { id: '1', type: 'INTERVIEW_COMPLETED', title: 'Alex Rivera completed Senior Full-Stack Engineer interview', time: '10m ago' },
            { id: '2', type: 'RESUME_PARSED', title: 'Priya Sharma applied and resume parsed with 92% match', time: '1h ago' },
            { id: '3', type: 'INVITATION_SENT', title: 'Invitation sent to Marcus Vance for Lead Backend Engineer', time: '3h ago' }
          ]
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
