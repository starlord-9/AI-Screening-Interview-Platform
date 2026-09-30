import { Router } from 'express';
import { interviewsController } from '../controllers/interviews.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', interviewsController.getAll);
router.post('/', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), interviewsController.create);
router.post('/generate-plan', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), interviewsController.generatePlan);
router.get('/:id', interviewsController.getById);
router.post('/:id/publish', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), interviewsController.publish);
router.post('/:id/questions', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), interviewsController.addQuestion);
router.delete('/:id/questions/:questionId', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), interviewsController.deleteQuestion);

export default router;
