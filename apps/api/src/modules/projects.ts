import { Router } from 'express';
import { db, seed } from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { projectSchema } from '../schemas/index.js';

seed();
export const projectsRouter = Router();
projectsRouter.use(authenticate);

projectsRouter.get('/', (_req, res) => {
  const out = db.projects.map(p => ({ ...p, taskCount: db.tasks.filter(t => t.projectId === p.id).length }));
  res.json({ projects: out });
});
projectsRouter.post('/', validate(projectSchema), (req, res) => {
  const p = { id: `p_${Date.now()}`, ...req.body, ownerId: (req as any).user.sub, createdAt: new Date().toISOString() };
  db.projects.push(p);
  res.status(201).json(p);
});
