export interface ActivityEntry {
  id: string;
  at: string;
  action: 'task.created' | 'task.updated' | 'task.deleted';
  actor: string;
  taskId: string;
  title: string;
}

const MAX_ENTRIES = 200;
let seq = 0;
const entries: ActivityEntry[] = [];

export function logActivity(action: ActivityEntry['action'], actor: string, taskId: string, title: string): ActivityEntry {
  const entry: ActivityEntry = {
    id: `a_${Date.now().toString(36)}${(seq++).toString(36)}`,
    at: new Date().toISOString(),
    action,
    actor,
    taskId,
    title,
  };
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  return entry;
}

export function getActivity(limit = 50): ActivityEntry[] {
  const n = Math.min(Math.max(limit, 1), 100);
  return entries.slice(-n).reverse();
}
