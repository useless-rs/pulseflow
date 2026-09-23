import { Router } from 'express';
export const docsRouter = Router();
docsRouter.get('/openapi.json', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'PulseFlow API', version: '1.0.0' },
    paths: {
      '/health': { get: { summary: 'Health' } },
      '/api/auth/login': { post: { summary: 'Login' } },
      '/api/tasks': { get: { summary: 'List tasks' }, post: { summary: 'Create task' } },
      '/api/projects': { get: { summary: 'List projects' } },
    },
  });
});
