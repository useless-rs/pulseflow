import { useEffect, useState } from 'react';
import { Topbar } from '../components/layout';
import { Card, Badge } from '../components/ui';
import { api, isAuthed } from '../lib/api';

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
  return (
    <div>
      <Topbar title="Calendar" />
      <Card><div className="text-white/60 text-sm">Sprint view — connect deadlines from tasks. Coming next loop: drag deadlines.</div></Card>
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
