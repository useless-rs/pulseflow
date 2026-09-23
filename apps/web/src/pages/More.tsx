import { useEffect, useState } from 'react';
import { Topbar } from '../components/layout';
import { Card, Badge } from '../components/ui';
import { api, isAuthed } from '../lib/api';
import { useLocalTasks } from '../lib/hooks';

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
  useEffect(() => {
    if (!isAuthed()) return;
    api.tasks()
      .then(r => setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, tag: t.tags[0] ?? 'task', description: t.description ?? '', tags: t.tags ?? [], dueDate: t.dueDate }))))
      .catch(() => {});
  }, [setTasks]);

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
          <div className="font-semibold">{first.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
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
                  <div key={t.id} title={t.title} className={`truncate text-[11px] px-1 py-0.5 rounded mt-0.5 ${key < todayKey && t.status !== 'done' ? 'bg-[#FF5C7A]/15 text-[#FF5C7A] font-semibold' : 'bg-white/5 text-white/75'}`}>
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && <div className="text-[10px] text-white/40">+{dayTasks.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <Topbar title="Settings" />
      <Card><div className="font-semibold">Workspace</div><div className="text-sm text-white/60 mt-1">Theme, API URL, token. Brand: #6C5CFF / #00E5CC on #0B0B14.</div></Card>
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
  return (
    <div>
      <Topbar title="Notifications" />
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
