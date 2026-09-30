import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'ORG_OWNER'), usersController.getAll);
router.post('/', requireRole('ADMIN', 'ORG_OWNER'), usersController.create);
router.put('/:id', requireRole('ADMIN', 'ORG_OWNER'), usersController.update);
router.delete('/:id', requireRole('ADMIN', 'ORG_OWNER'), usersController.delete);

export default router;
