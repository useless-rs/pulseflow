import { useEffect, useState } from 'react';
import { Topbar } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { useLocalTasks } from '../lib/hooks';
import { api, isAuthed } from '../lib/api';

const cols = [['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']];

export function Kanban() {
  const { tasks, move, setTasks } = useLocalTasks();
  const [filter, setFilter] = useState('');
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!isAuthed()) return;
    api.tasks()
      .then(r => {
        setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task' })));
        setLive(true);
      })
      .catch(() => {});
  }, [setTasks]);

  const moveTask = async (id: string, status: string) => {
    move(id, status);
    if (live && id.startsWith('t_')) {
      try { await api.patchTask(id, { status: status as 'todo' | 'doing' | 'done' }); }
      catch { move(id, tasks.find(t => t.id === id)?.status ?? status); }
    }
  };

  const visible = tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <Topbar title="Kanban" />
      <div className="flex items-center gap-3 mb-3">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter tasks…" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-56" />
        {live && <Badge>live api</Badge>}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map(([key, label]) => (
          <div key={key} className="bg-white/[0.02] rounded-2xl p-3 border border-white/5">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="font-semibold">{label}</span>
              <Badge>{visible.filter(t => t.status === key).length}</Badge>
            </div>
            <div className="space-y-2">
              {visible.filter(t => t.status === key).map(t => (
                <Card key={t.id}>
                  <div className="font-medium text-sm">{t.title}</div>
                  <div className="mt-2 flex gap-1.5 items-center">
                    <Badge>{t.tag}</Badge>
                    <div className="ml-auto flex gap-1">
                      {cols.filter(([k]) => k !== t.status).map(([k, l]) => (
                        <button key={k} onClick={() => moveTask(t.id, k)} className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 hover:bg-white/10">→ {l}</button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4"><Button>＋ New task (connects to /api/tasks)</Button></div>
    </div>
  );
}
