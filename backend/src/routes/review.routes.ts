import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/sessions/:sessionId', reviewController.getSessionReview);
router.post(
  '/evaluations/:evaluationId/override',
  requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER', 'HIRING_MANAGER'),
  reviewController.overrideEvaluation
);
router.post(
  '/integrity-events/:eventId',
  requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER', 'HIRING_MANAGER'),
  reviewController.reviewIntegrityEvent
);

export default router;
