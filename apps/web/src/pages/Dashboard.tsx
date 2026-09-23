import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { api, isAuthed, type TaskDto } from '../lib/api';

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const previewStats = { total: 6, byStatus: { todo: 3, doing: 2, done: 1 } };
const dayMs = 864e5;
const previewTasks: TaskDto[] = [
  { id: 'p1', title: 'Design logo system', description: '', status: 'done', projectId: 'p_pulse', tags: ['brand'], dueDate: new Date(Date.now() - dayMs).toISOString() },
  { id: 'p2', title: 'Build Express API', description: '', status: 'doing', projectId: 'p_pulse', tags: ['backend'], dueDate: new Date(Date.now() - dayMs).toISOString() },
  { id: 'p3', title: 'Ship Kanban UI', description: '', status: 'doing', projectId: 'p_pulse', tags: ['frontend'], dueDate: new Date(Date.now() + 2 * dayMs).toISOString() },
];

export function Dashboard() {
  const authed = isAuthed();
  const [loading, setLoading] = useState(authed);
  const [failed, setFailed] = useState(false);
  const [stats, setStats] = useState(previewStats);
  const [tasks, setTasks] = useState<TaskDto[]>(previewTasks);
  const [notifs, setNotifs] = useState<Array<{ id: string; text: string }>>([]);

  const load = async () => {
    if (!isAuthed()) return;
    setLoading(true);
    setFailed(false);
    try {
      const [s, t, n] = await Promise.all([api.taskStats(), api.tasks(), api.notifications()]);
      setStats({ total: s.total, byStatus: s.byStatus });
      setTasks(t.tasks);
      setNotifs(n.notifications.slice(0, 4));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const kpis: Array<[string, number, string]> = [
    ['Total tasks', stats.total, authed ? 'live' : 'preview'],
    ['To do', stats.byStatus.todo ?? 0, authed ? 'live' : 'preview'],
    ['Doing', stats.byStatus.doing ?? 0, authed ? 'live' : 'preview'],
    ['Done', stats.byStatus.done ?? 0, authed ? 'live' : 'preview'],
  ];
  const recent = tasks.slice(0, 4);
  const donePct = stats.total ? Math.round(((stats.byStatus.done ?? 0) / stats.total) * 100) : 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < todayStart.getTime());

  return (
    <div>
      <Topbar title="Good evening — here's your pulse" />
      {!authed && (
        <Card className="mb-4 flex items-center gap-3">
          <div className="text-sm text-white/70 flex-1">You're viewing a preview. Sign in to see live data from the API.</div>
          <Link to="/login"><Button>Sign in</Button></Link>
        </Card>
      )}
      {failed && (
        <Card className="mb-4 flex items-center gap-3">
          <div className="text-sm text-[#FF5C7A] flex-1">Couldn't load live data — showing last preview instead.</div>
          <Button variant="ghost" onClick={load}>Retry</Button>
        </Card>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(([k, v, d]) => (
          <Card key={k}>
            <div className="text-xs text-white/50 flex items-center gap-2">{k} {loading ? <Badge>…</Badge> : <Badge>{d}</Badge>}</div>
            <div className="text-2xl font-extrabold mt-1">{loading ? '–' : v}</div>
            <div className="text-xs text-[#00E5CC] mt-1">{k === 'Total tasks' ? `${donePct}% done` : `${stats.total} total`}</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <div className="font-semibold mb-1">Needs attention</div>
          <div className="text-xs text-white/50 mb-2" data-testid="overdue-count">
            {overdue.length === 0 ? 'All clear — nothing overdue.' : `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`}
          </div>
          {overdue.slice(0, 5).map(t => (
            <div key={t.id} className="text-sm py-1.5 border-b border-white/5 flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-[#FF5C7A] shrink-0" />
              <span className="flex-1 text-white/80">{t.title}</span>
              <span className="text-[11px] text-[#FF5C7A]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</span>
            </div>
          ))}
          <Link to="/kanban" className="inline-block mt-2 text-xs text-[#00E5CC] hover:underline">Open board →</Link>
        </Card>
        <Card className="lg:col-span-2">
          <div className="font-semibold mb-3">Status distribution {authed && !loading && <Badge>live</Badge>}</div>
          {(['todo', 'doing', 'done'] as const).map(s => {
            const n = stats.byStatus[s] ?? 0;
            const pct = stats.total ? Math.round((n / stats.total) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-3 py-1.5">
                <span className="w-14 text-xs text-white/50 capitalize">{s}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC]" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right text-xs text-white/70">{n} · {pct}%</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <div className="font-semibold mb-3">Activity</div>
          {recent.map(t => (
            <div key={t.id} className="text-sm text-white/70 py-1.5 border-b border-white/5 flex gap-2">
              <Badge>{t.status}</Badge><span className="flex-1">{t.title}</span>
            </div>
          ))}
          {notifs.map(n => (
            <div key={n.id} className="text-sm text-white/70 py-1.5 border-b border-white/5 flex gap-2">
              <Badge>note</Badge><span className="flex-1">{n.text}</span>
            </div>
          ))}
          <div className="text-[11px] text-white/40 mt-2">Updated {timeAgo(new Date().toISOString())} · {authed ? 'live' : 'preview'}</div>
        </Card>
      </div>
    </div>
  );
}
