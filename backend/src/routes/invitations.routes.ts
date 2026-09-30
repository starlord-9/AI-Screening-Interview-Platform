import { Router } from 'express';
import { invitationsController } from '../controllers/invitations.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { candidateInvitationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public token validation endpoint (Zero-registration candidate access)
router.get('/public/:token', candidateInvitationLimiter, invitationsController.publicValidate);

// Recruiter invitation management endpoints
router.use(authenticate);
router.post('/', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), invitationsController.create);
router.post('/:id/revoke', requireRole('ADMIN', 'ORG_OWNER', 'RECRUITER'), invitationsController.revoke);

export default router;
