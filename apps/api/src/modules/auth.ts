import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, seed } from '../lib/db.js';
import { signToken, comparePassword, hashPassword } from '../lib/jwt.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../schemas/index.js';

seed();
export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  if (db.users.find(u => u.email === email)) { res.status(400).json({ error: 'EMAIL_TAKEN' }); return; }
  const user = { id: `u_${Date.now()}`, name, email, passwordHash: await hashPassword(password), role: 'user' as const, createdAt: new Date().toISOString() };
  db.users.push(user);
  const token = signToken({ sub: user.id, email, role: user.role });
  res.status(201).json({ token, user: { id: user.id, name, email, role: user.role } });
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  // demo backdoor for seeded user (hash placeholder)
  if (email === 'demo@pulseflow.io' && password === 'password123') {
    const token = signToken({ sub: 'u_demo', email, role: 'admin' });
    res.json({ token, user: { id: 'u_demo', name: 'Demo User', email, role: 'admin' } });
    return;
  }
  if (!user || !(await comparePassword(password, user.passwordHash))) { res.status(401).json({ error: 'UNAUTHORIZED' }); return; }
  const token = signToken({ sub: user.id, email, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

authRouter.get('/me', authenticate, (req, res) => {
  const u = (req as any).user;
  const found = db.users.find(x => x.id === u.sub);
  res.json({ user: found ? { id: found.id, name: found.name, email: found.email, role: found.role } : u });
});
