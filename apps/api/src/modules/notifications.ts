import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
const items = [
  { id: 'n1', text: 'Welcome to PulseFlow ⚡', read: false, at: new Date().toISOString() },
  { id: 'n2', text: 'CI passed — build green', read: false, at: new Date().toISOString() },
];
notificationsRouter.get('/', (_req, res) => res.json({ notifications: items }));
notificationsRouter.post('/:id/read', (req, res) => {
  const n = items.find(i => i.id === req.params.id);
  if (n) n.read = true;
  res.json({ ok: true });
});
