import { Router } from 'express';
import { db, seed } from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { taskSchema, taskPatchSchema, taskQuerySchema } from '../schemas/index.js';
import { broadcast } from '../lib/websocket.js';
import { logActivity } from '../lib/activity.js';
import { randomUUID } from 'crypto';

seed();
export const tasksRouter = Router();
tasksRouter.use(authenticate);

tasksRouter.get('/', validateQuery(taskQuerySchema), (req, res) => {
  const { status, q, page, limit } = req.query as unknown as { status?: 'todo' | 'doing' | 'done'; q?: string; page: number; limit: number };
  let items = db.tasks;
  if (status) items = items.filter(t => t.status === status);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(needle));
  }
  const total = items.length;
  res.json({ tasks: items.slice((page - 1) * limit, page * limit), total, page, limit });
});

tasksRouter.get('/stats', (_req, res) => {
  const byStatus = { todo: 0, doing: 0, done: 0 };
  for (const t of db.tasks) byStatus[t.status] += 1;
  res.json({ total: db.tasks.length, byStatus });
});

tasksRouter.post('/', validateBody(taskSchema), (req, res) => {
  const t = { id: `t_${randomUUID().slice(0, 8)}`, ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.tasks.push(t);
  broadcast('task.created', t);
  logActivity('task.created', req.user?.email ?? 'unknown', t.id, t.title);
  res.status(201).json(t);
});

tasksRouter.patch('/:id', validateBody(taskPatchSchema), (req, res) => {
  const t = db.tasks.find(x => x.id === req.params.id);
  if (!t) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const { id: _ignored, createdAt: _pinned, ...patch } = req.body as Record<string, unknown>;
  Object.assign(t, patch, { updatedAt: new Date().toISOString() });
  broadcast('task.updated', t);
  logActivity('task.updated', req.user?.email ?? 'unknown', t.id, t.title);
  res.json(t);
});

tasksRouter.delete('/:id', (req, res) => {
  const i = db.tasks.findIndex(x => x.id === req.params.id);
  if (i < 0) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const [gone] = db.tasks.splice(i, 1);
  broadcast('task.deleted', gone);
  logActivity('task.deleted', req.user?.email ?? 'unknown', gone.id, gone.title);
  res.status(204).send();
});
