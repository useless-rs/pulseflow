import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Topbar } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { useLocalTasks } from '../lib/hooks';
import { api, isAuthed } from '../lib/api';
import { useRealtime } from '../lib/realtime';
import { TaskDrawer, type TaskPatch } from '../components/TaskDrawer';

const cols = [['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']];
const STATUSES = ['todo', 'doing', 'done'];
const WIP_LIMITS: Record<string, number> = { todo: 5, doing: 2 };

interface Task {
  id: string;
  title: string;
  status: string;
  tag: string;
  description: string;
  tags: string[];
  dueDate?: string;
}

function DuePill({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return null;
  const overdue = new Date(dueDate).getTime() < Date.now();
  const label = overdue
    ? `overdue ${new Date(dueDate).toLocaleDateString()}`
    : `due ${new Date(dueDate).toLocaleDateString()}`;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full ${overdue ? 'bg-[#FF5C7A]/15 text-[#FF5C7A] font-semibold' : 'bg-white/10 text-white/70'}`}>
      {label}
    </span>
  );
}

function DraggableCard({ task, onMove, onOpen }: { task: Task; onMove: (id: string, status: string) => void; onOpen: (id: string) => void }) {
  const { ref, handleRef } = useDraggable({ id: task.id });
  return (
    <div ref={ref} className="cursor-grab active:cursor-grabbing">
      <Card>
        <div className="flex items-start gap-1.5">
          <button ref={handleRef} aria-label={`Drag ${task.title} to reorder`} title="Drag to reorder" className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/70 text-sm leading-none px-0.5 select-none">⋮⋮</button>
          <button onClick={() => onOpen(task.id)} aria-label={`Open details for ${task.title}`} className="font-medium text-sm text-left hover:text-[#00E5CC] flex-1">{task.title}</button>
        </div>
        <div className="mt-2 flex gap-1.5 items-center flex-wrap">
          <Badge>{task.tag}</Badge>
          <DuePill dueDate={task.dueDate} />
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

function DroppableColumn({ status, label, tasks, total, limit, onMove, onOpen }: { status: string; label: string; tasks: Task[]; total: number; limit?: number; onMove: (id: string, status: string) => void; onOpen: (id: string) => void }) {
  const { ref } = useDroppable({ id: status });
  const over = typeof limit === 'number' && total > limit;
  return (
    <div ref={ref} data-testid={`col-${status}`} className={`bg-white/[0.02] rounded-2xl p-3 border min-h-40 ${over ? 'border-[#FF5C7A]/60' : 'border-white/5'}`}>
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          {typeof limit === 'number' && (
            <span className={`text-[11px] ${over ? 'text-[#FF5C7A] font-semibold' : 'text-white/40'}`}>
              WIP {total}/{limit}{over ? ' — over' : ''}
            </span>
          )}
          <Badge>{tasks.length}</Badge>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map(t => <DraggableCard key={t.id} task={t} onMove={onMove} onOpen={onOpen} />)}
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { events } = useRealtime();

  useEffect(() => {
    if (!isAuthed()) return;
    api.tasks()
      .then(r => {
        setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task', description: t.description ?? '', tags: t.tags ?? [], dueDate: t.dueDate })));
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
        setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task', description: t.description ?? '', tags: t.tags ?? [], dueDate: t.dueDate })));
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
  const selected = tasks.find(t => t.id === selectedId) ?? null;

  const saveTask = async (id: string, patch: TaskPatch) => {
    const prev = tasks.find(t => t.id === id);
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, ...patch, tag: patch.tags[0] ?? t.tag } : t)));
    if (live && id.startsWith('t_')) {
      try { await api.patchTask(id, patch); }
      catch { if (prev) setTasks(ts => ts.map(t => (t.id === id ? prev : t))); }
    }
    setSelectedId(null);
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks(ts => ts.filter(t => t.id !== id));
    if (live && id.startsWith('t_')) {
      try { await api.deleteTask(id); }
      catch { setTasks(prev); }
    }
    setSelectedId(null);
  };

  return (
    <div>
      <Topbar title="Kanban" />
      <div className="flex items-center gap-3 mb-3">
        <input value={filter} onChange={e => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} placeholder="Filter tasks…" aria-label="Filter tasks" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-56" />
        {live && <Badge>live api</Badge>}
        {syncedAt && <span className="text-xs text-[#00E5CC]">• synced {new Date(syncedAt).toLocaleTimeString()}</span>}
        <span className="text-xs text-white/40">drag cards by the grip</span>
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
            <DroppableColumn key={key} status={key} label={label} tasks={visible.filter(t => t.status === key)} total={tasks.filter(t => t.status === key).length} limit={WIP_LIMITS[key]} onMove={moveTask} onOpen={setSelectedId} />
          ))}
        </div>
      </DragDropProvider>
      <div className="mt-4"><Button>＋ New task (connects to /api/tasks)</Button></div>
      {selected && (
        <TaskDrawer
          key={selected.id}
          task={selected}
          onClose={() => setSelectedId(null)}
          onSave={(patch) => void saveTask(selected.id, patch)}
          onDelete={() => void deleteTask(selected.id)}
        />
      )}
    </div>
  );
}
