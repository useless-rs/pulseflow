export type TaskStatus = 'todo' | 'doing' | 'done';
export interface User { id: string; name: string; email: string; passwordHash: string; role: 'admin' | 'user'; createdAt: string; }
export interface Project { id: string; name: string; description: string; ownerId: string; createdAt: string; }
export interface Task { id: string; title: string; description: string; status: TaskStatus; projectId: string; assigneeId?: string; tags: string[]; createdAt: string; updatedAt: string; }

import { randomUUID } from 'crypto';

function uid(p: string) { return `${p}_${randomUUID().slice(0, 8)}`; }
function now() { return new Date().toISOString(); }

export const db = {
  users: [] as User[],
  projects: [] as Project[],
  tasks: [] as Task[],
};

export function seed() {
  if (db.users.length) return;
  const demoId = 'u_demo';
  // bcryptjs hash of 'password123' (10 rounds) — real hash, normal login path verifies it
  db.users.push({ id: demoId, name: 'Demo User', email: 'demo@pulseflow.io', passwordHash: '$2a$10$pYjm9wjigarFEnTtQ5hM3.xis7A89T/NkH.K7vGIaKMU/Vr83Bnrq', role: 'admin', createdAt: now() });
  const p1: Project = { id: 'p_pulse', name: 'PulseFlow Launch', description: 'Ship v1', ownerId: demoId, createdAt: now() };
  const p2: Project = { id: 'p_growth', name: 'Growth', description: 'Stars + docs', ownerId: demoId, createdAt: now() };
  db.projects.push(p1, p2);
  const seedTasks: Array<[string, TaskStatus, string]> = [
    ['Design logo system', 'done', p1.id],
    ['Build Express API', 'doing', p1.id],
    ['Ship Kanban UI', 'doing', p1.id],
    ['Write README that gets stars', 'todo', p2.id],
    ['Add realtime WS hub', 'todo', p1.id],
    ['Docker + CI gates', 'todo', p2.id],
  ];
  seedTasks.forEach(([title, status, projectId], i) => {
    db.tasks.push({ id: uid('t'), title, description: `${title} — auto-seeded`, status, projectId, tags: i % 2 ? ['frontend'] : ['backend'], createdAt: now(), updatedAt: now() });
  });
}
