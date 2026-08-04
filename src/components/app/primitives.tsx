import { cn } from '@/lib/utils';
import { GRADE_TINT } from '@/lib/hooks';

/**
 * Shared app-UI primitives — one source of truth so screens stop re-typing
 * divergent card/label/badge recipes. All surfaces use the single hairline
 * border + soft-depth `.vg-surface` (see globals.css `.app-theme`).
 */

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/** The one card recipe: white, hairline border, soft shadow, 12px radius. */
export function Card({
  children,
  className,
  onClick,
  interactive,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
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
    <div className={cn('vg-surface', className)} {...rest}>
      {children}
    </div>
  );
}

/** Refined uppercase section label (clean sans — mono is reserved for urls/code). */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('kicker', className)}>{children}</div>;
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
      <div className="tnum text-[20px] font-semibold leading-none" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[12px] text-muted mt-[6px]">{label}</div>
    </div>
  );
}

const GRADE_SIZE = {
  sm: 'w-7 h-7 text-[13px] rounded-[7px]',
  md: 'w-9 h-9 text-[15px] rounded-[9px]',
  lg: 'w-12 h-12 text-[22px] rounded-[11px]',
} as const;

/** Grade chip — single component, pulls the shared GRADE_TINT (no per-screen dupes). */
export function GradeBadge({
  grade,
  size = 'md',
  className,
}: {
  grade?: Grade;
  size?: keyof typeof GRADE_SIZE;
  className?: string;
}) {
  const tint = grade ? GRADE_TINT[grade] : { bg: '#F0F0EE', fg: '#9B9B96' };
  return (
    <span
      className={cn('inline-flex items-center justify-center font-semibold shrink-0', GRADE_SIZE[size], className)}
      style={{ background: tint.bg, color: tint.fg }}
    >
      {grade ?? '—'}
    </span>
  );
}
