import { Request, Response, NextFunction } from 'express';
import { seedDatabase } from '../db/seed';

export const demoController = {
  async resetDemoData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await seedDatabase();
      res.json({
        success: true,
        message: 'Demo dataset initialized successfully.',
        data: {
          testAccounts: [
            { email: 'admin@acme-tech.example.com', password: 'Admin@123456', role: 'ADMIN' },
            { email: 'recruiter@acme-tech.example.com', password: 'Admin@123456', role: 'RECRUITER' }
          ],
          testCandidateInviteLink: 'http://localhost:4200/candidate/interview/priya-demo-active-invite-2026',
          completedReviewSessionToken: 'alex_rivera_demo_invitation_token_2026'
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
