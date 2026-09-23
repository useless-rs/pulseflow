import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isAuthed } from '../lib/api';

interface Item {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

const PAGES: Array<{ to: string; label: string; keys: string }> = [
  { to: '/', label: 'Go to Dashboard', keys: 'home overview' },
  { to: '/kanban', label: 'Go to Kanban', keys: 'board tasks' },
  { to: '/analytics', label: 'Go to Analytics', keys: 'stats charts' },
  { to: '/calendar', label: 'Go to Calendar', keys: 'schedule' },
  { to: '/notifications', label: 'Go to Notifications', keys: 'alerts bell' },
  { to: '/settings', label: 'Go to Settings', keys: 'preferences' },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<Element | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setIndex(0);
    (restoreRef.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        restoreRef.current = document.activeElement;
        setOpen(v => !v);
      }
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (isAuthed()) {
      api.tasks().then(r => setTasks(r.tasks.map(t => ({ id: t.id, title: t.title, status: t.status })))).catch(() => {});
    }
  }, [open ]);

  const needle = q.trim().toLowerCase();
  const pageItems: Item[] = PAGES.filter(p => !needle || `${p.label} ${p.keys}`.toLowerCase().includes(needle)).map(p => ({
    id: p.to, label: p.label, hint: 'page', run: () => navigate(p.to),
  }));
  const taskItems: Item[] = (needle ? tasks.filter(t => t.title.toLowerCase().includes(needle)) : []).slice(0, 5).map(t => ({
    id: t.id, label: t.title, hint: t.status, run: () => navigate(`/kanban?q=${encodeURIComponent(t.title)}`),
  }));
  const items = [...pageItems, ...taskItems];
  const active = items[Math.min(index, Math.max(0, items.length - 1))];

  useEffect(() => setIndex(0), [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center pt-24" role="dialog" aria-modal="true" aria-labelledby="pf-palette-title">
      <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141F] shadow-2xl overflow-hidden h-fit">
        <h2 id="pf-palette-title" className="sr-only">Command palette</h2>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(i + 1, items.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && active) { active.run(); close(); }
          }}
          placeholder="Type a command or search tasks…"
          aria-label="Command palette"
          aria-expanded="true"
          aria-controls="pf-palette-list"
          aria-activedescendant={active ? `pf-opt-${active.id}` : undefined}
          role="combobox"
          aria-autocomplete="list"
          className="w-full bg-transparent px-5 py-4 text-sm outline-none placeholder:text-white/30"
        />
        <ul id="pf-palette-list" role="listbox" className="max-h-72 overflow-auto border-t border-white/5 p-2">
          {items.map((item, i) => (
            <li
              key={item.id}
              id={`pf-opt-${item.id}`}
              role="option"
              aria-selected={item === active}
              onClick={() => { item.run(); close(); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm cursor-pointer ${item === active ? 'bg-white/10 text-white' : 'text-white/70'}`}
            >
              <span className="flex-1">{item.label}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{item.hint}</span>
            </li>
          ))}
          {items.length === 0 && <li className="px-3 py-4 text-sm text-white/40">No matches — try a page name or task title.</li>}
        </ul>
        <div className="border-t border-white/5 px-4 py-2 text-[11px] text-white/40">↑↓ navigate · Enter open · Esc close</div>
      </div>
    </div>
  );
}
