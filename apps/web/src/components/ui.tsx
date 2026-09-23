export function Button({ children, onClick, variant = 'primary' }: { children: any; onClick?: () => void; variant?: 'primary' | 'ghost' }) {
  const cls = variant === 'primary'
    ? 'bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC] text-black font-semibold'
    : 'border border-white/15 text-white/80 hover:bg-white/5';
  return <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm transition ${cls}`}>{children}</button>;
}
export function Card({ children, className = '' }: { children: any; className?: string }) {
  return <div className={`pf-card bg-white/[0.04] p-5 backdrop-blur ${className}`}>{children}</div>;
}
export function Badge({ children }: { children: any }) {
  return <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{children}</span>;
}
