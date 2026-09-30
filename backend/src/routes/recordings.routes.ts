import { Router } from 'express';
import { recordingsController } from '../controllers/recordings.controller';

const router = Router();

// Streaming endpoint is protected by expiring HMAC signature in query params
router.get('/stream/:key', recordingsController.streamMedia);

export default router;
