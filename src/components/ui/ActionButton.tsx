import { cn } from '@/lib/utils';

/**
 * Interactive button: on hover the label slides up and a function-specific icon
 * slides in, a tooltip fades in, and the fill transitions black → brand yellow
 * (primary). Styling lives in globals.css (`.vg-abtn*`), so this stays a plain
 * component usable from both server (marketing) and client trees.
 *
 * For internal-page links use `next/link` with `className="vg-abtn vg-abtn--…"`
 * and wrap the label in `<ActionInner icon={…}>Label</ActionInner>`.
 */
type Variant = 'primary' | 'outline' | 'danger' | 'danger-solid' | 'cancel';

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The two-layer sliding content (label + icon). Use inside a `.vg-abtn` element. */
export function ActionInner({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="vg-abtn__clip">
      <span className="vg-abtn__label">{children}</span>
      <span className="vg-abtn__icon">{icon ?? <ArrowIcon />}</span>
    </span>
  );
}

export default function ActionButton({
  variant = 'primary',
  icon,
  tooltip,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn('vg-abtn', `vg-abtn--${variant}`, className)} data-tip={tooltip || undefined} {...rest}>
      <ActionInner icon={icon}>{children}</ActionInner>
    </button>
  );
}
