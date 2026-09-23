import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db, seed } from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { projectSchema } from '../schemas/index.js';

seed();
export const projectsRouter = Router();
projectsRouter.use(authenticate);

projectsRouter.get('/', (_req, res) => {
  const out = db.projects.map(p => ({ ...p, taskCount: db.tasks.filter(t => t.projectId === p.id).length }));
  res.json({ projects: out });
});
projectsRouter.get('/:id', (req, res) => {
  const p = db.projects.find(x => x.id === req.params.id);
  if (!p) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.json({ ...p, tasks: db.tasks.filter(t => t.projectId === p.id) });
});
projectsRouter.post('/', validateBody(projectSchema), (req, res) => {
  const p = { id: `p_${randomUUID().slice(0, 8)}`, ...req.body, ownerId: req.user!.sub, createdAt: new Date().toISOString() };
  db.projects.push(p);
  res.status(201).json(p);
});
