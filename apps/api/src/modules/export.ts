import { Router } from 'express';
import { db } from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';

export const exportRouter = Router();
exportRouter.use(authenticate);
exportRouter.get('/tasks.csv', (_req, res) => {
  const rows = ['id,title,status,projectId,tags,dueDate,priority', ...db.tasks.map(t => `${t.id},"${t.title.replace(/"/g, '""')}",${t.status},${t.projectId},"${t.tags.join('|')}",${t.dueDate ?? ''},${t.priority ?? ''}`)];
  res.header('Content-Type', 'text/csv');
  res.send(rows.join('\n'));
});
