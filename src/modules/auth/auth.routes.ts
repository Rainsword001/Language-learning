import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimiters';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
} from './auth.controller';
import { authenticate } from '../../middleware/authenticate';


const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, forgotPassword);

export default router;