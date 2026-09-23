import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Topbar } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { useLocalTasks } from '../lib/hooks';
import { api, isAuthed } from '../lib/api';
import { useRealtime } from '../lib/realtime';

const cols = [['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']];
const STATUSES = ['todo', 'doing', 'done'];

interface Task {
  id: string;
  title: string;
  status: string;
  tag: string;
}

function DraggableCard({ task, onMove }: { task: Task; onMove: (id: string, status: string) => void }) {
  const { ref } = useDraggable({ id: task.id });
  return (
    <div ref={ref} className="cursor-grab active:cursor-grabbing">
      <Card>
        <div className="font-medium text-sm">{task.title}</div>
        <div className="mt-2 flex gap-1.5 items-center">
          <Badge>{task.tag}</Badge>
          <div className="ml-auto flex gap-1">
            {cols.filter(([k]) => k !== task.status).map(([k, l]) => (
              <button key={k} onClick={() => onMove(task.id, k)} aria-label={`Move ${task.title} to ${l}`} className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 hover:bg-white/10">→ {l}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DroppableColumn({ status, label, tasks, onMove }: { status: string; label: string; tasks: Task[]; onMove: (id: string, status: string) => void }) {
  const { ref } = useDroppable({ id: status });
  return (
    <div ref={ref} data-testid={`col-${status}`} className="bg-white/[0.02] rounded-2xl p-3 border border-white/5 min-h-40">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="font-semibold">{label}</span>
        <Badge>{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.map(t => <DraggableCard key={t.id} task={t} onMove={onMove} />)}
      </div>
    </div>
  );
}

export function Kanban() {
  const { tasks, move, setTasks } = useLocalTasks();
  const [params, setParams] = useSearchParams();
  const filter = params.get('q') ?? '';
  const [live, setLive] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const { events } = useRealtime();

  useEffect(() => {
    if (!isAuthed()) return;
    api.tasks()
      .then(r => {
        setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task' })));
        setLive(true);
      })
      .catch(() => {});
  }, [setTasks]);

  useEffect(() => {
    if (!events.length || !isAuthed()) return;
    let type = '';
    try { type = (JSON.parse(events[0]).event as string) ?? ''; } catch { return; }
    if (type === 'hello' || !type.startsWith('task.')) return;
    api.tasks()
      .then(r => {
        setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task' })));
        setSyncedAt(new Date().toISOString());
      })
      .catch(() => {});
  }, [events, setTasks]);

  const moveTask = async (id: string, status: string) => {
    const prev = tasks.find(t => t.id === id)?.status;
    move(id, status);
    if (live && id.startsWith('t_')) {
      try { await api.patchTask(id, { status: status as 'todo' | 'doing' | 'done' }); }
      catch { move(id, prev ?? status); }
    }
  };

  const visible = tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <Topbar title="Kanban" />
      <div className="flex items-center gap-3 mb-3">
        <input value={filter} onChange={e => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} placeholder="Filter tasks…" aria-label="Filter tasks" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-56" />
        {live && <Badge>live api</Badge>}
        {syncedAt && <span className="text-xs text-[#00E5CC]">• synced {new Date(syncedAt).toLocaleTimeString()}</span>}
        <span className="text-xs text-white/40">drag cards between columns</span>
      </div>
      <DragDropProvider onDragEnd={(event) => {
        if (event.canceled) return;
        const sourceId = String(event.operation?.source?.id ?? '');
        const targetId = String(event.operation?.target?.id ?? '');
        if (!sourceId || !targetId) return;
        const targetStatus = STATUSES.includes(targetId)
          ? targetId
          : tasks.find(t => t.id === targetId)?.status;
        if (!targetStatus) return;
        const current = tasks.find(t => t.id === sourceId)?.status;
        if (current && current !== targetStatus) void moveTask(sourceId, targetStatus);
      }}>
        <div className="grid md:grid-cols-3 gap-4">
          {cols.map(([key, label]) => (
            <DroppableColumn key={key} status={key} label={label} tasks={visible.filter(t => t.status === key)} onMove={moveTask} />
          ))}
        </div>
      </DragDropProvider>
      <div className="mt-4"><Button>＋ New task (connects to /api/tasks)</Button></div>
    </div>
  );
}
