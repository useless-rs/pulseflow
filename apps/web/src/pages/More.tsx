import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/layout';
import { Card, Badge } from '../components/ui';
import { api, isAuthed } from '../lib/api';
import { useLocalTasks } from '../lib/hooks';
import { TaskDrawer, type TaskPatch } from '../components/TaskDrawer';
import { enqueueOp, flushQueue, loadQueue, isNetworkError } from '../lib/offlineQueue';

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Analytics() {
  const bars = [40, 65, 50, 80, 62, 90, 74];
  const [live, setLive] = useState<{ total: number; byStatus: Record<string, number> } | null>(null);
  useEffect(() => {
    if (isAuthed()) api.taskStats().then(setLive).catch(() => {});
  }, []);
  return (
    <div>
      <Topbar title="Analytics" />
      {live && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[['Total', live.total], ['To Do', live.byStatus.todo ?? 0], ['Doing', live.byStatus.doing ?? 0], ['Done', live.byStatus.done ?? 0]].map(([k, v]) => (
            <Card key={k as string}>
              <div className="text-xs text-white/50 flex gap-2 items-center">{k} <Badge>live</Badge></div>
              <div className="text-2xl font-extrabold mt-1">{v}</div>
            </Card>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-semibold mb-3">Throughput by day</div>
          <div className="flex items-end gap-2 h-36">
            {bars.map((h, i) => <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#6C5CFF] to-[#00E5CC]" style={{ height: `${h}%` }} />)}
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-3">Insights</div>
          <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
            <li>Doing WIP is healthy at 9 — cap at 12.</li>
            <li>Cycle time down 18% after WS realtime.</li>
            <li>Export CSV from API: <code>/api/tasks</code>.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function Calendar() {
  const { tasks, setTasks } = useLocalTasks();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(() => loadQueue().length);
  useEffect(() => {
    if (!isAuthed()) return;
    api.tasks()
      .then(r => setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task', description: t.description ?? '', tags: t.tags ?? [], dueDate: t.dueDate }))))
      .catch(() => {});
  }, [setTasks]);

  const refreshQueued = () => setQueuedCount(loadQueue().length);
  const flush = async () => {
    if (!isAuthed()) return;
    await flushQueue((tid, nid) => setTasks(ts => ts.map(x => (x.id === tid ? { ...x, id: nid } : x))));
    refreshQueued();
  };
  useEffect(() => {
    refreshQueued();
    const onOnline = () => { void flush(); };
    window.addEventListener('online', onOnline);
    void flush();
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const selected = tasks.find(t => t.id === selectedId) ?? null;
  const saveTask = async (id: string, patch: TaskPatch) => {
    const prev = tasks.find(t => t.id === id);
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, ...patch, tag: patch.tags[0] ?? t.tag } : t)));
    if (isAuthed() && id.startsWith('t_')) {
      try { await api.patchTask(id, patch); }
      catch (e) {
        if (isNetworkError(e)) { enqueueOp({ kind: 'patch', taskId: id, payload: patch }); refreshQueued(); }
        else if (prev) setTasks(ts => ts.map(t => (t.id === id ? prev : t)));
      }
    }
    setSelectedId(null);
  };
  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks(ts => ts.filter(t => t.id !== id));
    if (isAuthed() && id.startsWith('t_')) {
      try { await api.deleteTask(id); }
      catch (e) {
        if (isNetworkError(e)) { enqueueOp({ kind: 'delete', taskId: id }); refreshQueued(); }
        else setTasks(prev);
      }
    }
    setSelectedId(null);
  };

  const first = new Date(cursor.y, cursor.m, 1);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(new Date(cursor.y, cursor.m, 1 - first.getDay() + i));
  const byDay = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const key = ymd(new Date(t.dueDate));
    const list = byDay.get(key) ?? [];
    list.push(t);
    byDay.set(key, list);
  }
  const todayKey = ymd(new Date());
  const shift = (d: number) => {
    const n = new Date(cursor.y, cursor.m + d, 1);
    setCursor({ y: n.getFullYear(), m: n.getMonth() });
  };

  return (
    <div>
      <Topbar title="Calendar" />
      <Card>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5">‹</button>
          <div className="font-semibold">{first.toLocaleString('default', { month: 'long', year: 'numeric' })}{queuedCount > 0 && <button onClick={() => void flush()} title="Retry sync now" className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#FFC94D]/15 text-[#FFC94D]">● {queuedCount} queued</button>}</div>
          <div className="flex gap-2">
            <button onClick={() => { const n = new Date(); setCursor({ y: n.getFullYear(), m: n.getMonth() }); }} className="px-3 py-1 rounded-lg border border-white/10 text-sm hover:bg-white/5">Today</button>
            <button onClick={() => shift(1)} aria-label="Next month" className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/40 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map(d => {
            const key = ymd(d);
            const dayTasks = byDay.get(key) ?? [];
            const inMonth = d.getMonth() === cursor.m;
            return (
              <div key={key} data-testid="cal-cell" className={`min-h-16 rounded-lg border p-1 text-left ${!inMonth ? 'opacity-30' : ''} ${key === todayKey ? 'border-[#00E5CC]/60' : 'border-white/5'}`}>
                <div className="text-[11px] text-white/50">{d.getDate()}</div>
                {dayTasks.slice(0, 3).map(t => (
                  <button key={t.id} onClick={() => setSelectedId(t.id)} aria-label={`Open details for ${t.title}`} title={t.title} className={`block w-full truncate text-left text-[11px] px-1 py-0.5 rounded mt-0.5 ${key < todayKey && t.status !== 'done' ? 'bg-[#FF5C7A]/15 text-[#FF5C7A] font-semibold' : 'bg-white/5 text-white/75 hover:bg-white/10'}`}>
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <div className="text-[10px] text-white/40">+{dayTasks.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      </Card>
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

export function Settings() {
  const navigate = useNavigate();
  const authed = isAuthed();
  const signOut = () => {
    localStorage.removeItem('pf_token');
    navigate('/login', { replace: true });
  };
  return (
    <div>
      <Topbar title="Settings" />
      <Card><div className="font-semibold">Workspace</div><div className="text-sm text-white/60 mt-1">Theme, API URL, token. Brand: #6C5CFF / #00E5CC on #0B0B14.</div></Card>
      <div className="mt-4">
        <Card>
          <div className="font-semibold mb-1">Session</div>
          <div className="text-sm text-white/60 mb-3">{authed ? 'Signed in with a stored API token.' : 'Not signed in.'}</div>
          {authed && <button onClick={signOut} className="px-4 py-2 rounded-xl border border-[#FF5C7A]/40 text-[#FF5C7A] text-sm hover:bg-[#FF5C7A]/10">Sign out</button>}
        </Card>
      </div>
    </div>
  );
}

export function Notifications() {
  const [items, setItems] = useState<Array<{ id: string; text: string; read: boolean; at: string }>>([]);
  useEffect(() => {
    if (isAuthed()) api.notifications().then(r => setItems(r.notifications)).catch(() => {});
  }, []);
  const mark = async (id: string) => {
    await api.markRead(id).catch(() => {});
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAll = async () => {
    await api.markAllRead().catch(() => {});
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };
  const unread = items.filter(n => !n.read).length;
  return (
    <div>
      <Topbar title="Notifications" />
      {unread > 0 && (
        <div className="mb-3">
          <button onClick={() => void markAll()} className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5">Mark all read ({unread})</button>
        </div>
      )}
      <div className="space-y-2">
        {items.length === 0 && <Card><div className="text-sm text-white/50">{isAuthed() ? 'No notifications yet.' : 'Sign in to see notifications.'}</div></Card>}
        {items.map(n => (
          <Card key={n.id}>
            <div className="flex items-center gap-3">
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#00E5CC]" />}
              <div className="text-sm flex-1">{n.text}</div>
              {!n.read && <button onClick={() => mark(n.id)} className="text-xs px-2 py-1 rounded-full border border-white/10 hover:bg-white/10">mark read</button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
