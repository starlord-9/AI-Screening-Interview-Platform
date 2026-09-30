import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('ADMIN', 'ORG_OWNER'), auditController.getAll);

export default router;
