/// <reference types="vite/client" />

export const API_URL = import.meta.env.VITE_API_URL ?? '';

export function wsUrl(path: string): string {
  if (API_URL) return API_URL.replace(/^http/, 'ws') + path;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  // In dev the page is served by Vite (:5173) but the socket lives on the API (:3000)
  const host = location.port === '5173' ? `${location.hostname}:3000` : location.host;
  return `${proto}://${host}${path}`;
}

export function isAuthed(): boolean {
  return Boolean(localStorage.getItem('pf_token'));
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  projectId: string;
  tags: string[];
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pf_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string; user: { id: string; name: string; email: string; role: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  tasks: () => req<{ tasks: TaskDto[]; total: number; page: number; limit: number }>('/api/tasks?limit=100'),
  taskStats: () => req<{ total: number; byStatus: Record<TaskDto['status'], number> }>('/api/tasks/stats'),
  patchTask: (id: string, patch: Partial<TaskDto>) =>
    req<TaskDto>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  notifications: () => req<{ notifications: Array<{ id: string; text: string; read: boolean; at: string }> }>('/api/notifications'),
  markRead: (id: string) => req<{ ok: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}
