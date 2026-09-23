import { Router } from 'express';
import { db, seed } from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { taskSchema } from '../schemas/index.js';
import { broadcast } from '../lib/websocket.js';

seed();
export const tasksRouter = Router();
tasksRouter.use(authenticate);

tasksRouter.get('/', (req, res) => {
  const status = req.query.status as string | undefined;
  const q = (req.query.q as string | undefined)?.toLowerCase();
  let items = db.tasks;
  if (status) items = items.filter(t => t.status === status);
  if (q) items = items.filter(t => (t.title + t.description).toLowerCase().includes(q));
  res.json({ tasks: items, total: items.length });
});

tasksRouter.post('/', validate(taskSchema), (req, res) => {
  const t = { id: `t_${Date.now()}`, ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.tasks.push(t);
  broadcast('task.created', t);
  res.status(201).json(t);
});

tasksRouter.patch('/:id', (req, res) => {
  const t = db.tasks.find(x => x.id === req.params.id);
  if (!t) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  Object.assign(t, req.body, { updatedAt: new Date().toISOString() });
  broadcast('task.updated', t);
  res.json(t);
});

tasksRouter.delete('/:id', (req, res) => {
  const i = db.tasks.findIndex(x => x.id === req.params.id);
  if (i < 0) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  const [gone] = db.tasks.splice(i, 1);
  broadcast('task.deleted', gone);
  res.status(204).send();
});
