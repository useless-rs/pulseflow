import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authLimiter } from '../src/middleware/rateLimit.js';

const app = createApp();

describe('health', () => {
  it('returns ok', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
  });
});

describe('auth', () => {
  it('demo login works', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'password123' });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeDefined();
  });
  it('rejects bad creds', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'no@x.io', password: 'badpass123' });
    expect([401, 422]).toContain(r.status);
  });
});

describe('tasks', () => {
  it('requires auth', async () => {
    const r = await request(app).get('/api/tasks');
    expect(r.status).toBe(401);
  });
  it('CRUD flow', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'password123' });
    const token = login.body.token;
    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBeGreaterThan(0);
    expect(list.body.page).toBe(1);
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Loop test', projectId: 'p_pulse', status: 'todo' });
    expect(created.status).toBe(201);
    const patched = await request(app).patch(`/api/tasks/${created.body.id}`).set('Authorization', `Bearer ${token}`).send({ status: 'doing' });
    expect(patched.body.status).toBe('doing');
  });
  it('rejects invalid PATCH + guards id', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'password123' });
    const token = login.body.token;
    const bad = await request(app).patch('/api/tasks/t_nope').set('Authorization', `Bearer ${token}`).send({ status: 'shipped' });
    expect(bad.status).toBe(422);
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Guard test', projectId: 'p_pulse' });
    const guard = await request(app).patch(`/api/tasks/${created.body.id}`).set('Authorization', `Bearer ${token}`).send({ id: 'hacked', status: 'done' });
    expect(guard.body.id).toBe(created.body.id);
  });
  it('paginates + stats', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'password123' });
    const token = login.body.token;
    const p1 = await request(app).get('/api/tasks?page=1&limit=2').set('Authorization', `Bearer ${token}`);
    expect(p1.body.tasks.length).toBeLessThanOrEqual(2);
    const stats = await request(app).get('/api/tasks/stats').set('Authorization', `Bearer ${token}`);
    expect(stats.body.total).toBe(stats.body.byStatus.todo + stats.body.byStatus.doing + stats.body.byStatus.done);
  });
});

describe('auth brute-force guard', () => {
  it('returns 429 after 10 rapid attempts', async () => {
    authLimiter.reset();
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const r = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'wrongpass' });
      last = r.status;
    }
    expect(last).toBe(429);
    authLimiter.reset();
  });
});

describe('platform', () => {
  it('serves openapi + request ids + rate headers', async () => {
    const docs = await request(app).get('/docs/openapi.json');
    expect(docs.status).toBe(200);
    expect(docs.body.openapi).toBeDefined();
    const h = await request(app).get('/health');
    expect(h.headers['x-request-id']).toBeDefined();
    expect(h.headers['x-ratelimit-limit']).toBeDefined();
  });
  it('notifications + export + project detail', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'demo@pulseflow.io', password: 'password123' });
    const token = login.body.token;
    const n = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(n.body.notifications.length).toBeGreaterThan(0);
    const csv = await request(app).get('/api/export/tasks.csv').set('Authorization', `Bearer ${token}`);
    expect(csv.text).toContain('id,title,status');
    const p = await request(app).get('/api/projects/p_pulse').set('Authorization', `Bearer ${token}`);
    expect(p.body.tasks).toBeDefined();
    expect(await request(app).get('/api/projects/nope').set('Authorization', `Bearer ${token}`).then(r => r.status)).toBe(404);
  });
});
