import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import languagesRoutes from './modules/languages/languages.routes';
import quizzesRoutes from './modules/quizzes/quizzes.routes';
import progressRoutes from './modules/progress/progress.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes';
import { webhook } from './modules/subscriptions/subscriptions.controller';
import { generalLimiter, paymentLimiter } from './middleware/rateLimiters';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());


// Apply globally, after helmet/cors, before routes
app.use(generalLimiter);


// Webhook route MUST come before express.json(), using raw body parsing
app.post(
  '/api/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body, Buffer.isBuffer(req.body));
    try {
      req.body = Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;
      next();
    } catch (err) {
      console.error('Failed to parse webhook body:', err);
      res.sendStatus(400);
    }
  },
  webhook
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', languagesRoutes);
app.use('/api', quizzesRoutes);
app.use('/api', progressRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', subscriptionsRoutes);
app.use(errorHandler);

export default app;