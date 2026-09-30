import { Router } from 'express';
import { candidatesController } from '../controllers/candidates.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { resumeUpload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', candidatesController.getAll);
router.post('/', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), candidatesController.create);
router.get('/:id', candidatesController.getById);
router.post(
  '/:id/resume',
  requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'),
  resumeUpload.single('resume'),
  candidatesController.uploadResume
);
router.post('/:id/match-evidence', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), candidatesController.matchEvidence);
router.post('/:id/stage', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER', 'HIRING_MANAGER'), candidatesController.updateStage);
router.post('/:id/notes', candidatesController.addNote);

export default router;
