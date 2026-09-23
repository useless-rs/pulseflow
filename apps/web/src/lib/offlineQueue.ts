import { api } from './api';

export type TaskPatchPayload = {
  title?: string;
  description?: string;
  tags?: string[];
  status?: 'todo' | 'doing' | 'done';
  dueDate?: string;
};

export type NewOp =
  | { kind: 'patch'; taskId: string; payload: TaskPatchPayload }
  | { kind: 'delete'; taskId: string }
  | { kind: 'create'; tempId: string; payload: { title: string; projectId: string; description?: string; tags?: string[] } };

export type QueuedOp = NewOp & { id: string };

const KEY = 'pf_offline_queue';

function uid() {
  return `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function isNetworkError(e: unknown): boolean {
  return e instanceof TypeError;
}

export function loadQueue(): QueuedOp[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(ops: QueuedOp[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ops));
  } catch { /* storage full or unavailable — queue stays in memory only */ }
}

export function enqueueOp(op: NewOp): QueuedOp {
  const entry: QueuedOp = { ...op, id: uid() };
  saveQueue([...loadQueue(), entry]);
  return entry;
}

export function dropOp(id: string) {
  saveQueue(loadQueue().filter(o => o.id !== id));
}

export async function flushQueue(applyServerId: (tempId: string, realId: string) => void): Promise<number> {
  for (const op of loadQueue()) {
    try {
      if (op.kind === 'patch') { await api.patchTask(op.taskId, op.payload); }
      else if (op.kind === 'delete') { await api.deleteTask(op.taskId); }
      else {
        const t = await api.createTask(op.payload);
        replaceTempId(op.tempId, t.id);
        applyServerId(op.tempId, t.id);
      }
      dropOp(op.id);
    } catch (e) {
      if (isNetworkError(e)) break;
      dropOp(op.id);
    }
  }
  return loadQueue().length;
}

export function replaceTempId(tempId: string, realId: string) {
  saveQueue(
    loadQueue().map(o => {
      if (o.kind === 'create' && o.tempId === tempId) return { ...o, tempId: realId };
      if ((o.kind === 'patch' || o.kind === 'delete') && o.taskId === tempId) return { ...o, taskId: realId };
      return o;
    })
  );
}
