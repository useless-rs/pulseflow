import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

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
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Loop test', projectId: 'p_pulse', status: 'todo' });
    expect(created.status).toBe(201);
    const patched = await request(app).patch(`/api/tasks/${created.body.id}`).set('Authorization', `Bearer ${token}`).send({ status: 'doing' });
    expect(patched.body.status).toBe('doing');
  });
});
