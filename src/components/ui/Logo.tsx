import { cn } from '@/lib/utils';

/**
 * The Veilguard brand marks.
 *
 *  - <Logo>      the full lockup: the square icon + "Veilguard" set as real text
 *                (crisp at any size, unlike the exported wordmark PNG). Sized by
 *                icon HEIGHT; the word scales with it. `tone="onDark"` for dark
 *                backgrounds (white word).
 *  - <LogoIcon>  the square icon mark alone — `yellow` (default) for dark chips
 *                and the dashboard, `dark` for light chips/avatars.
 */
export function LogoIcon({
  size = 32,
  variant = 'yellow',
  className,
}: {
  size?: number;
  variant?: 'yellow' | 'dark';
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === 'dark' ? '/logos/logo-icon-dark.png' : '/logos/logo-icon.png'}
      alt="Veilguard"
      width={size}
      height={size}
      draggable={false}
      className={cn('select-none', className)}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

/** Back-compat alias — the square yellow mark. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return <LogoIcon size={size} className={className} />;
}

export default function Logo({
  size = 28,
  tone = 'default',
  className,
}: {
  /** Icon height in px; the wordmark scales with it. */
  size?: number;
  /** `onDark` renders the word in white for dark backgrounds. */
  tone?: 'default' | 'onDark';
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center select-none', className)}
      style={{ gap: Math.round(size * 0.34) }}
      aria-label="Veilguard"
    >
      <LogoIcon size={size} />
      <span
        style={{
          fontFamily: 'var(--font-hanken), sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontSize: Math.round(size * 0.74),
          lineHeight: 1,
          color: tone === 'onDark' ? '#fff' : '#0A0A0A',
        }}
      >
        Veilguard
      </span>
    </span>
  );
}
