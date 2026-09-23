import { useState } from 'react';

export function useLocalTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design logo system', status: 'done', tag: 'brand' },
    { id: '2', title: 'Build Express API', status: 'doing', tag: 'backend' },
    { id: '3', title: 'Ship Kanban UI', status: 'doing', tag: 'frontend' },
    { id: '4', title: 'Write README that gets stars', status: 'todo', tag: 'docs' },
    { id: '5', title: 'Add realtime WS hub', status: 'todo', tag: 'realtime' },
    { id: '6', title: 'Docker + CI gates', status: 'todo', tag: 'devops' },
  ]);
  const move = (id: string, status: string) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, status } : t)));
  return { tasks, move, setTasks };
}
