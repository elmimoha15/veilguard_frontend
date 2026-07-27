'use client';

import { useApp } from './state';

/* -------------------------------------------------------------------------- */
/* Toast stack — top-right, auto-dismissing (managed by AppStateProvider).     */
/* -------------------------------------------------------------------------- */
export function ToastStack() {
  const { toasts } = useApp();
  return (
    <div className="fixed z-[9998] top-[18px] right-[18px] flex flex-col gap-[10px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-[10px] bg-ink text-white px-4 py-3 rounded-xl min-w-[220px] shadow-[0_14px_34px_-14px_rgba(0,0,0,.55)]"
          style={{ animation: 'vgToast .3s ease both' }}
        >
          <span className="w-[9px] h-[9px] rounded-full" style={{ background: t.color }} />
          <span className="text-[13.5px] font-medium">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confetti burst — fires while `celebrate` is true.                           */
/* -------------------------------------------------------------------------- */
const CONFETTI_COLORS = ['#F3C500', '#1FB86B', '#F2851F', '#E5352B'];

// Positions are derived from the piece index with a deterministic hash — NOT
// Math.random(), which evaluates independently on the server and the client and
// would yield different values, tripping a hydration mismatch if this ever
// rendered during SSR. A fixed spread keeps the burst identical everywhere.
const frac = (n: number) => {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
};
const CONFETTI_PIECES = Array.from({ length: 26 }, (_, i) => ({
  left: frac(i + 1) * 100,
  color: CONFETTI_COLORS[i % 4],
  dur: 1.3 + frac(i + 7) * 0.9,
  delay: frac(i + 13) * 0.3,
}));

export function ConfettiOverlay() {
  const { celebrate } = useApp();
  if (!celebrate) return null;
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {CONFETTI_PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute top-[-10px] w-[9px] h-[9px] rounded-[2px]"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animation: `vgConfetti ${p.dur.toFixed(2)}s ease-in forwards`,
            animationDelay: `${p.delay.toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Grade ring — a circular progress dial. `pct` drives the stroke offset.      */
/* -------------------------------------------------------------------------- */
export function GradeRing({
  size = 120,
  pct,
  color,
  track = 'rgba(255,255,255,.12)',
  strokeWidth = 9,
  animate = false,
  children,
}: {
  size?: number;
  pct: number;
  color: string;
  track?: string;
  strokeWidth?: number;
  animate?: boolean;
  children?: React.ReactNode;
}) {
  const r = 60 - strokeWidth / 2 - 1;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={animate ? { transition: 'stroke-dashoffset .3s linear' } : undefined}
        />
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Big halftone grade letter (A / C / D / F heroes).                           */
/* -------------------------------------------------------------------------- */
export function GradeLetter({
  letter,
  color,
  size = 150,
  halftone = true,
  className,
}: {
  letter: string;
  color: string;
  size?: number;
  halftone?: boolean;
  className?: string;
}) {
  return (
    <div
      className={halftone ? `grade-halftone ${className ?? ''}` : className}
      style={{
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.8,
        ...(halftone
          ? {
              // Longhand (NOT the `background` shorthand) so background-clip:text
              // from .grade-halftone isn't reset to border-box — otherwise the
              // halftone fills the whole box and the transparent glyph vanishes.
              backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,.22) 1.5px, transparent 2.1px)',
              backgroundSize: '11px 11px',
              backgroundColor: color,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }
          : { color }),
      }}
    >
      {letter}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Toggle switch.                                                              */
/* -------------------------------------------------------------------------- */
export function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className="relative w-11 h-[26px] rounded-full border-0 transition-colors"
      style={{ background: on ? '#1FB86B' : '#cfceca' }}
    >
      <span
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-[left]"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Small inline spinner (button loading state).                                */
/* -------------------------------------------------------------------------- */
export function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="inline-block w-[15px] h-[15px] rounded-full vg-spin"
      style={{
        border: `2px solid ${dark ? 'rgba(30,29,27,.3)' : 'rgba(255,255,255,.3)'}`,
        borderTopColor: dark ? '#1E1D1B' : '#fff',
      }}
    />
  );
}
