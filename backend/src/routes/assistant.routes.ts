import { Router } from 'express';
import { assistantController } from '../controllers/assistant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/chat', assistantController.chat);

export default router;
