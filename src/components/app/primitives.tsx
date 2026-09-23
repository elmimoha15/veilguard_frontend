import { useId } from 'react';
import { cn } from '@/lib/utils';
import ActionButton from '@/components/ui/ActionButton';
import { GRADE_TINT, SEV_TINT, SEV_COLOR, HEAT_RAMP, type Grade, type Sev } from '@/components/app/data';

/**
 * Shared app-UI primitives, one source of truth so screens compose the same
 * hairline card, pill button, segmented control, grade chip, etc. Design: pure
 * white surfaces, 1px `#EDEDED` hairlines, NO card shadows, 14px card radii,
 * fully-rounded pill buttons, color used only as grade language.
 */

/* ---- Card: white, one hairline border, flat (no shadow), 14px radius ------ */
export function Card({
  children,
  className,
  onClick,
  interactive,
  flat,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  /** Borderless region: no vg-surface box, for hairline-divided section groups. */
  flat?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  if (onClick || interactive) {
    return (
      <button
        onClick={onClick}
        className={cn('vg-surface vg-card vg-press block w-full text-left cursor-pointer', className)}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={cn(flat ? undefined : 'vg-surface', className)} {...rest}>
      {children}
    </div>
  );
}

/** Mono uppercase eyebrow label. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('kicker', className)}>{children}</div>;
}

/**
 * The one page-title block: 29px/600/-.035em title, 14px muted subtitle 7px
 * below, optional right slot.
 */
export function PageHeading({
  title,
  subtitle,
  right,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between flex-wrap gap-4 mb-8', className)}>
      <div>
        <h1 className="text-[29px] font-medium tracking-[-0.035em] leading-[1.1] m-0">{title}</h1>
        {subtitle && <p className="text-muted mt-[7px] text-[14px] max-w-[70ch]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/** A single metric cell: big tabular number over a muted label. */
export function Metric({
  value,
  label,
  color,
  className,
}: {
  value: React.ReactNode;
  label: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="tnum text-[22px] font-medium leading-none" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[12.5px] text-muted mt-[7px]">{label}</div>
    </div>
  );
}

/* ---- Pill button: the interactive ActionButton (label→icon slide + tooltip,
   black→yellow on hover). Pass `icon`/`tooltip` per action. ------------------ */
export function PillButton({
  variant = 'primary',
  icon,
  tooltip,
  className,
  children,
  ...rest
}: {
  variant?: 'primary' | 'outline' | 'danger' | 'danger-solid' | 'cancel';
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <ActionButton variant={variant} icon={icon} tooltip={tooltip} className={className} {...rest}>
      {children}
    </ActionButton>
  );
}

/* ---- Severity tiles: Critical / Warnings / Passed as three prominent stat
   tiles (critical + warnings carry the color emphasis). Shared by the scan-result
   and findings views so the counts read identically everywhere. ------------- */
export function SeverityTiles({
  critical,
  warnings,
  passed,
  className,
}: {
  critical: number;
  warnings: number;
  passed: number;
  className?: string;
}) {
  const tiles = [
    { n: critical, label: 'Critical', sev: 'CRITICAL' as Sev },
    { n: warnings, label: 'Warnings', sev: 'WARNING' as Sev },
    { n: passed, label: 'Passed', sev: 'PASSED' as Sev },
  ];
  return (
    <div className={cn('grid grid-cols-3 divide-x divide-border', className)}>
      {tiles.map((t, i) => {
        const active = t.n > 0;
        return (
          <div key={t.label} className={cn('px-4 py-[6px]', i === 0 ? 'pl-0' : 'pl-5', i === tiles.length - 1 ? 'pr-0' : undefined)}>
            <div className="flex items-center gap-2">
              <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ background: SEV_COLOR[t.sev] }} />
              <span className="text-[12.5px] font-medium" style={{ color: '#737373' }}>{t.label}</span>
            </div>
            <div className="tnum text-[26px] font-semibold leading-none mt-[10px]" style={{ color: active ? SEV_TINT[t.sev].fg : '#A3A3A3' }}>{t.n}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Grade square (tables, app-detail, history) --------------------------- */
export function GradeSquare({ grade, size = 32, className }: { grade?: Grade; size?: number; className?: string }) {
  const t = grade ? GRADE_TINT[grade] : { bg: '#F5F5F5', fg: '#A3A3A3' };
  // Just a colored letter, no background box (green A/B, amber C, red D/F).
  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0 tnum', className)}
      style={{ width: size, height: size, color: t.fg, fontSize: Math.round(size * 0.55), fontWeight: 700 }}
    >
      {grade ?? '—'}
    </span>
  );
}

/* ---- Sidebar grade chip (19px, mono) -------------------------------------- */
export function GradeChip({ grade }: { grade?: Grade }) {
  const t = grade ? GRADE_TINT[grade] : { bg: '#F5F5F5', fg: '#A3A3A3' };
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 font-mono font-bold"
      style={{ width: 19, height: 19, fontSize: 12.5, color: t.fg }}
    >
      {grade ?? '—'}
    </span>
  );
}

/** Legacy grade chip kept for existing callers (maps to GradeSquare sizes). */
const GRADE_SIZE = { sm: 28, md: 32, lg: 42 } as const;
export function GradeBadge({ grade, size = 'md', className }: { grade?: Grade; size?: keyof typeof GRADE_SIZE; className?: string }) {
  return <GradeSquare grade={grade} size={GRADE_SIZE[size]} className={className} />;
}

/* ---- Severity chip (CRITICAL / WARNING / PASSED) -------------------------- */
export function SeverityChip({ sev, className }: { sev: Sev; className?: string }) {
  const t = SEV_TINT[sev];
  return (
    <span
      className={cn('inline-flex items-center rounded-[6px] px-[8px] py-[3px] text-[11px] font-medium tracking-[0.02em]', className)}
      style={{ background: t.bg, color: t.fg }}
    >
      {sev}
    </span>
  );
}

/* ---- Severity as plain colored text (no background tint) ------------------ */
export function SeverityText({ sev, className }: { sev: Sev; className?: string }) {
  return (
    <span className={cn('text-[11px] font-semibold tracking-[0.06em]', className)} style={{ color: SEV_COLOR[sev] }}>
      {sev}
    </span>
  );
}

/* ---- "NEW" badge (freshly-introduced finding) ---------------------------- */
// Same red tint as a critical severity, so "new" reads as attention-grabbing and
// looks identical across the Monitoring card, Alerts feed, and finding detail.
export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center shrink-0 rounded-[6px] px-[9px] py-[3px] text-[11px] font-medium tracking-[0.02em]', className)}
      style={{ background: SEV_TINT.CRITICAL.bg, color: SEV_TINT.CRITICAL.fg }}
    >
      NEW
    </span>
  );
}

/* ---- Segmented control (raised white active pill) ------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { id: T; label: React.ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-[3px] p-[3px] rounded-[9px]', className)} style={{ background: 'var(--color-fill)' }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="inline-flex items-center gap-[7px] px-[12px] h-[30px] rounded-[7px] text-[13px] transition-colors"
            style={on ? { background: '#fff', fontWeight: 600, boxShadow: 'var(--shadow-seg)' } : { color: 'var(--color-muted)', fontWeight: 500 }}
            aria-pressed={on}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Stat bar (posture rows) ---------------------------------------------- */
export function StatBar({
  label,
  value,
  pct,
  color,
  note,
}: {
  label: string;
  value: React.ReactNode;
  pct: number;
  color: string;
  note: string;
}) {
  return (
    <div className="py-[11px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13.5px] font-medium">{label}</span>
        <span className="text-[15px] font-medium tnum" style={{ color }}>{value}</span>
      </div>
      <div className="mt-[8px] h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--color-track)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
      </div>
      <div className="mt-[7px] text-[12.5px]" style={{ color: 'var(--color-faint)' }}>{note}</div>
    </div>
  );
}

/* ---- Scan-activity heatmap (28 cells, 5-step green ramp) ------------------- */
export function Heatmap({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const step = (v: number) => (v <= 0 ? 0 : Math.min(4, 1 + Math.floor((v / max) * 3.999)));
  return (
    <div className="flex flex-wrap gap-[4px]">
      {data.map((v, i) => (
        <span
          key={i}
          title={`${data.length - i}d ago · ${v ? `${v} scans` : 'no scans'}`}
          style={{ width: 13, height: 13, borderRadius: 3, background: HEAT_RAMP[step(v)] }}
        />
      ))}
    </div>
  );
}

/* ---- Security-over-time line chart ---------------------------------------- */
export function ScoreChart({ points, reduce = false }: { points: number[]; reduce?: boolean }) {
  const gid = 'a' + useId().replace(/[:]/g, '');
  if (points.length < 2) {
    return (
      <div className="h-[206px] flex items-center justify-center text-[13px]" style={{ color: 'var(--color-faint)' }}>
        Not enough scans yet to chart a trend.
      </div>
    );
  }
  const n = points.length;
  const x = (i: number) => (i / (n - 1)) * 720;
  const y = (s: number) => 170 - (Math.max(0, Math.min(100, s)) / 100) * 150;
  const line = points.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(0)} ${y(s).toFixed(0)}`).join(' ');
  const area = `${line} L720 200 L0 200 Z`;
  return (
    <svg viewBox="0 0 720 200" preserveAspectRatio="none" style={{ width: '100%', height: 206 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A0A0A" stopOpacity="0.13" />
          <stop offset="1" stopColor="#0A0A0A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 70, 120, 170].map((gy) => (
        <line key={gy} x1="0" y1={gy} x2="720" y2={gy} stroke="#F2F2F2" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={reduce ? undefined : 'vg-draw'}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={720} cy={y(points[n - 1])} r="4.5" fill="#0A0A0A" />
    </svg>
  );
}

/* ---- Generic area trend (scales to the data's own range) ------------------- */
export function AreaTrend({ points, color = '#0A0A0A', reduce = false }: { points: number[]; color?: string; reduce?: boolean }) {
  const gid = 'a' + useId().replace(/[:]/g, '');
  if (points.length < 2) return null;
  const n = points.length;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const x = (i: number) => (i / (n - 1)) * 720;
  const y = (v: number) => 176 - ((v - min) / span) * 152;
  const line = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(0)} ${y(v).toFixed(0)}`).join(' ');
  const area = `${line} L720 200 L0 200 Z`;
  return (
    <svg viewBox="0 0 720 200" preserveAspectRatio="none" style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.16" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[24, 74, 124, 174].map((gy) => <line key={gy} x1="0" y1={gy} x2="720" y2={gy} stroke="#F2F2F2" strokeWidth="1" />)}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className={reduce ? undefined : 'vg-draw'} vectorEffect="non-scaling-stroke" />
      <circle cx={720} cy={y(points[n - 1])} r="4.5" fill={color} />
    </svg>
  );
}

/* ---- Donut (segmented ring; severity colors) ------------------------------ */
export function Donut({
  segments,
  size = 148,
  thickness = 4,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerValue?: React.ReactNode;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  // Precompute each arc's length + offset with a reduce (no render-time mutation).
  const arcs = segments.filter((s) => s.value > 0).reduce<{ color: string; pct: number; offset: number }[]>((acc, s) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset - prev.pct : 25; // first arc starts at 12 o'clock
    acc.push({ color: s.color, pct: (s.value / total) * 100, offset });
    return acc;
  }, []);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F2F2F2" strokeWidth={thickness} />
        {arcs.map((a, i) => (
          <circle key={i} cx="21" cy="21" r="15.915" fill="none" stroke={a.color} strokeWidth={thickness} strokeDasharray={`${a.pct} ${100 - a.pct}`} strokeDashoffset={a.offset} />
        ))}
      </svg>
      {(centerValue != null || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue != null && <span className="tnum text-[22px] font-semibold leading-none">{centerValue}</span>}
          {centerLabel && <span className="text-[11px] mt-[3px]" style={{ color: '#A3A3A3' }}>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ---- Tiny sparkline (per-app trend) --------------------------------------- */
export function Sparkline({ points, color = '#0A0A0A', width = 84, height = 26 }: { points: number[]; color?: string; width?: number; height?: number }) {
  if (points.length < 2) return <span style={{ width, height, display: 'inline-block' }} />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * width;
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Progress bar --------------------------------------------------------- */
export function ProgressBar({ value, total, color = '#16A34A' }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  return (
    <div className="h-[10px] rounded-full overflow-hidden" style={{ background: 'var(--color-track)' }}>
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
