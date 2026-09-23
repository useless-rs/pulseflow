export const API_URL = (import.meta as any).env?.VITE_API_URL ?? '';

async function req(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('pf_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (email: string, password: string) => req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/api/auth/me'),
  tasks: () => req('/api/tasks'),
  createTask: (t: any) => req('/api/tasks', { method: 'POST', body: JSON.stringify(t) }),
  patchTask: (id: string, patch: any) => req(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  projects: () => req('/api/projects'),
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}
