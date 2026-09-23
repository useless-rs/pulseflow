import { useState } from 'react';

export function useLocalTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design logo system', status: 'done', tag: 'brand', description: 'Refined pulse mark, mono/favicon/OG family, @theme tokens.', tags: ['brand'] },
    { id: '2', title: 'Build Express API', status: 'doing', tag: 'backend', description: 'Layered Express API with auth, validation, and realtime.', tags: ['backend'] },
    { id: '3', title: 'Ship Kanban UI', status: 'doing', tag: 'frontend', description: 'Board, drag-and-drop, filters, and live sync.', tags: ['frontend'] },
    { id: '4', title: 'Write README that gets stars', status: 'todo', tag: 'docs', description: 'Value prop, badges, quickstart, architecture.', tags: ['docs'] },
    { id: '5', title: 'Add realtime WS hub', status: 'todo', tag: 'realtime', description: 'Broadcast task events to every connected client.', tags: ['realtime'] },
    { id: '6', title: 'Docker + CI gates', status: 'todo', tag: 'devops', description: 'Multi-stage images and workspace-gated CI.', tags: ['devops'] },
  ]);
  const move = (id: string, status: string) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, status } : t)));
  return { tasks, move, setTasks };
}
