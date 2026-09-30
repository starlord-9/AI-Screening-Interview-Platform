import { Router } from 'express';
import { organizationsController } from '../controllers/organizations.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/current', organizationsController.getCurrent);
router.put('/current', requireRole('ADMIN', 'ORG_OWNER'), organizationsController.updateCurrent);
router.put('/retention', requireRole('ADMIN', 'ORG_OWNER'), organizationsController.updateRetentionPolicy);

export default router;
