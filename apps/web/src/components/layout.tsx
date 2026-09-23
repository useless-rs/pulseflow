import { Link, useLocation } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/kanban', 'Kanban'],
  ['/analytics', 'Analytics'],
  ['/calendar', 'Calendar'],
  ['/settings', 'Settings'],
];

export function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="w-60 shrink-0 border-r border-white/10 p-5 hidden md:flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C5CFF] to-[#00E5CC]" />
        <div>
          <div className="font-extrabold">PulseFlow</div>
          <div className="text-xs text-white/50">ride the pulse</div>
        </div>
      </div>
      {links.map(([to, label]) => (
        <Link key={to} to={to} className={`px-3 py-2 rounded-lg text-sm ${loc.pathname === to ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
          {label}
        </Link>
      ))}
      <div className="mt-auto text-xs text-white/40">v1.0 · realtime ●</div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <a href="/api/export/tasks.csv" className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5">⬇ CSV</a>
        <span className="text-xs px-2 py-1 rounded-full bg-[#00E5CC]/15 text-[#00E5CC]">● live</span>
        <input placeholder="⌘K search…" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-44" />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C5CFF] to-[#00E5CC] grid place-items-center font-bold text-black">D</div>
      </div>
    </header>
  );
}
