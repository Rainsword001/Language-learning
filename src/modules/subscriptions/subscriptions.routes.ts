import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { paymentLimiter } from '../../middleware/rateLimiters';
import * as subscriptionsController from './subscriptions.controller';

const router = Router();

router.get('/plans', subscriptionsController.getPlans); // public — no auth
router.post('/subscriptions/checkout', authenticate, paymentLimiter, subscriptionsController.checkout); // auth and rate limiting applied per-route
router.get('/users/me/subscription', authenticate, subscriptionsController.getMySubscription); // auth applied per-route

export default router;