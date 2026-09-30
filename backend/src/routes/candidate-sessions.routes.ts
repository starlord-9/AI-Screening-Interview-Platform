import { Router } from 'express';
import { candidateSessionsController } from '../controllers/candidate-sessions.controller';
import { mediaUpload } from '../middleware/upload';
import { candidateInvitationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Candidate zero-registration session routes
router.post('/start', candidateInvitationLimiter, candidateSessionsController.startSession);
router.get('/:sessionId', candidateSessionsController.getSessionState);
router.post('/:sessionId/responses', candidateSessionsController.submitResponse);
router.post(
  '/:sessionId/recordings',
  mediaUpload.single('recording'),
  candidateSessionsController.uploadRecording
);
router.post('/:sessionId/code-run', candidateSessionsController.runCodeSnippet);
router.post('/:sessionId/integrity-events', candidateSessionsController.recordIntegrityEvent);
router.post('/:sessionId/complete', candidateSessionsController.completeSession);

export default router;
