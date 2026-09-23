import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './modules/auth.js';
import { tasksRouter } from './modules/tasks.js';
import { projectsRouter } from './modules/projects.js';
import { docsRouter } from './modules/docs.js';
import { notificationsRouter } from './modules/notifications.js';
import { exportRouter } from './modules/export.js';
import { rateLimit, authLimiter } from './middleware/rateLimit.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(requestId);
  app.use(helmet());
  app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit);
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'pulseflow-api', time: new Date().toISOString() }));
  app.use('/docs', docsRouter);
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/export', exportRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
