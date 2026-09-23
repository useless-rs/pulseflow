import { Router } from 'express';

const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' },
    status: { type: 'string', enum: ['todo', 'doing', 'done'] }, projectId: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    dueDate: { type: 'string', format: 'date-time' },
  },
};

export const docsRouter = Router();
docsRouter.get('/openapi.json', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'PulseFlow API', version: '1.0.0', description: 'Realtime productivity platform API' },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: { Task: taskSchema },
    },
    security: [{ bearer: [] }],
    paths: {
      '/health': { get: { summary: 'Health check', security: [] } },
      '/api/auth/register': { post: { summary: 'Register', security: [] } },
      '/api/auth/login': { post: { summary: 'Login, returns JWT', security: [] } },
      '/api/auth/me': { get: { summary: 'Current user' } },
      '/api/tasks': {
        get: {
          summary: 'List tasks (filter, search, paginate)',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'doing', 'done'] } },
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
        },
        post: { summary: 'Create task' },
      },
      '/api/tasks/stats': { get: { summary: 'Task counts by status' } },
      '/api/tasks/{id}': { patch: { summary: 'Patch task (id/createdAt immutable)' }, delete: { summary: 'Delete task' } },
      '/api/projects': { get: { summary: 'List projects with task counts' }, post: { summary: 'Create project' } },
      '/api/projects/{id}': { get: { summary: 'Project detail with tasks' } },
      '/api/notifications': { get: { summary: 'List notifications' } },
      '/api/notifications/read-all': { post: { summary: 'Mark all notifications read' } },
      '/api/export/tasks.csv': { get: { summary: 'Export tasks as CSV' } },
      '/api/activity': { get: { summary: 'Board activity log (newest first)' } },
    },
  });
});
