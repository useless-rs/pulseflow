export type TaskStatus = 'todo' | 'doing' | 'done';
export interface User { id: string; name: string; email: string; passwordHash: string; role: 'admin' | 'user'; createdAt: string; }
export interface Project { id: string; name: string; description: string; ownerId: string; createdAt: string; }
export type TaskPriority = 'low' | 'medium' | 'high';
export interface Task { id: string; title: string; description: string; status: TaskStatus; projectId: string; assigneeId?: string; tags: string[]; dueDate?: string; priority?: TaskPriority; createdAt: string; updatedAt: string; }

import { randomUUID } from 'crypto';

function uid(p: string) { return `${p}_${randomUUID().slice(0, 8)}`; }
function now() { return new Date().toISOString(); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 864e5).toISOString(); }

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
  const seedTasks: Array<[string, TaskStatus, string, number?, TaskPriority?]> = [
    ['Design logo system', 'done', p1.id, undefined, 'low'],
    ['Build Express API', 'doing', p1.id, 2, 'high'],
    ['Ship Kanban UI', 'doing', p1.id, 4, 'high'],
    ['Write README that gets stars', 'todo', p2.id, -1, 'medium'],
    ['Add realtime WS hub', 'todo', p1.id, 7, 'medium'],
    ['Docker + CI gates', 'todo', p2.id, undefined, 'low'],
  ];
  seedTasks.forEach(([title, status, projectId, dueIn, priority], i) => {
    db.tasks.push({ id: uid('t'), title, description: `${title} — auto-seeded`, status, projectId, tags: i % 2 ? ['frontend'] : ['backend'], dueDate: dueIn === undefined ? undefined : daysFromNow(dueIn), priority, createdAt: now(), updatedAt: now() });
  });
}
