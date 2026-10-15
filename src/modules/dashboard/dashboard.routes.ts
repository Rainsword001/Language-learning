import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getMyDashboard } from './dashboard.controller';

const router = Router();

router.get('/dashboard', authenticate, getMyDashboard);

export default router;