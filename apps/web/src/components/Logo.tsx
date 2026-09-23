export function LogoMark({ size = 36, mono = false }: { size?: number; mono?: boolean }) {
  const stroke = mono ? '#FFFFFF' : 'url(#pfLogoGrad)';
  const dot = mono ? '#FFFFFF' : '#00E5CC';
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="PulseFlow">
      {!mono && (
        <defs>
          <linearGradient id="pfLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6C5CFF" />
            <stop offset="1" stopColor="#00E5CC" />
          </linearGradient>
        </defs>
      )}
      {!mono && <rect width="512" height="512" rx="120" fill="#0B0B14" />}
      {!mono && <rect x="14" y="14" width="484" height="484" rx="110" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="2" />}
      <path d="M96 288 H216 L256 176 L296 352 L336 240 H384" fill="none" stroke={stroke} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="424" cy="288" r="20" fill={dot} />
    </svg>
  );
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={compact ? 28 : 36} />
      {!compact && (
        <span className="leading-none">
          <span className="block font-extrabold tracking-tight pf-font-display">PulseFlow</span>
          <span className="block text-[11px] text-white/50">ride the pulse</span>
        </span>
      )}
    </span>
  );
}
