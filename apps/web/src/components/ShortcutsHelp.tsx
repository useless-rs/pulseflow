import { useEffect, useRef, useState } from 'react';

const SHORTCUTS: Array<[string, string]> = [
  ['⌘K / Ctrl+K', 'Open command palette'],
  ['/', 'Focus board search'],
  ['?', 'Open this help'],
  ['↑ ↓', 'Move in palette results'],
  ['Enter', 'Open highlighted result'],
  ['Esc', 'Close dialog'],
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (e.key === '?' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141F] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Keyboard shortcuts</h2>
          <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close shortcuts help" className="px-2 py-1 rounded-lg border border-white/10 text-sm hover:bg-white/5">✕</button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map(([keys, what]) => (
            <li key={keys} className="flex items-center justify-between text-sm">
              <span className="text-white/70">{what}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono">{keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
