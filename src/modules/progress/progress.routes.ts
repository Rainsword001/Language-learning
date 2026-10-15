import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as progressController from './progress.controller';

const router = Router();

router.post('/lessons/complete', authenticate, progressController.completeLesson);
router.get('/users/me/progress', authenticate, progressController.getMyProgress);

export default router;