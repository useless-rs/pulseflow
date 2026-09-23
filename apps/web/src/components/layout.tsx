import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { LogoLockup } from './Logo';

const links = [
  ['/', 'Dashboard'],
  ['/kanban', 'Kanban'],
  ['/analytics', 'Analytics'],
  ['/calendar', 'Calendar'],
  ['/notifications', 'Notifications'],
  ['/settings', 'Settings'],
];

export function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="w-60 shrink-0 border-r border-white/10 p-5 hidden md:flex flex-col gap-1">
      <div className="mb-6">
        <LogoLockup />
      </div>
      {links.map(([to, label]) => (
        <Link key={to} to={to} aria-current={loc.pathname === to ? 'page' : undefined} className={`px-3 py-2 rounded-lg text-sm ${loc.pathname === to ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
          {label}
        </Link>
      ))}
      <div className="mt-auto text-xs text-white/40">v2.0 · realtime ●</div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && e.ctrlKey === false) {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/kanban?q=${encodeURIComponent(q.trim())}` : '/kanban');
    if (location.pathname !== '/kanban') setQ('');
  };

  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <a href="/api/export/tasks.csv" className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5">⬇ CSV</a>
        <span className="text-xs px-2 py-1 rounded-full bg-[#00E5CC]/15 text-[#00E5CC]">● live</span>
        <form onSubmit={submit}>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="/ to search…" aria-label="Search tasks" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-44" />
        </form>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C5CFF] to-[#00E5CC] grid place-items-center font-bold text-black">D</div>
      </div>
    </header>
  );
}
