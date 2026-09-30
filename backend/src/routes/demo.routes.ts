import { Router } from 'express';
import { demoController } from '../controllers/demo.controller';

const router = Router();

router.post('/reset', demoController.resetDemoData);
router.get('/reset', demoController.resetDemoData);

export default router;
