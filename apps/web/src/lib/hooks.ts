import { useState } from 'react';

const daysFromNow = (n: number) => new Date(Date.now() + n * 864e5).toISOString();

export function useLocalTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design logo system', status: 'done', tag: 'brand', description: 'Refined pulse mark, mono/favicon/OG family, @theme tokens.', tags: ['brand'] },
    { id: '2', title: 'Build Express API', status: 'doing', tag: 'backend', description: 'Layered Express API with auth, validation, and realtime.', tags: ['backend'], dueDate: daysFromNow(2) },
    { id: '3', title: 'Ship Kanban UI', status: 'doing', tag: 'frontend', description: 'Board, drag-and-drop, filters, and live sync.', tags: ['frontend'], dueDate: daysFromNow(4) },
    { id: '4', title: 'Write README that gets stars', status: 'todo', tag: 'docs', description: 'Value prop, badges, quickstart, architecture.', tags: ['docs'], dueDate: daysFromNow(-1) },
    { id: '5', title: 'Add realtime WS hub', status: 'todo', tag: 'realtime', description: 'Broadcast task events to every connected client.', tags: ['realtime'], dueDate: daysFromNow(7) },
    { id: '6', title: 'Docker + CI gates', status: 'todo', tag: 'devops', description: 'Multi-stage images and workspace-gated CI.', tags: ['devops'] },
  ]);
  const move = (id: string, status: string) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, status } : t)));
  return { tasks, move, setTasks };
}
