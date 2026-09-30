import { Router } from 'express';
import { jobsController } from '../controllers/jobs.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', jobsController.getAll);
router.post('/analyze-raw-jd', jobsController.analyzeRawJD);
router.post('/analyze-jd', jobsController.analyzeRawJD);
router.get('/:id', jobsController.getById);
router.post('/', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), jobsController.create);
router.put('/:id', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), jobsController.update);
router.delete('/:id', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), jobsController.delete);

export default router;
