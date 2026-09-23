import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getActivity } from '../lib/activity.js';

export const activityRouter = Router();
activityRouter.use(authenticate);

activityRouter.get('/', (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json({ activity: getActivity(Number.isFinite(limit) ? limit : 50) });
});
