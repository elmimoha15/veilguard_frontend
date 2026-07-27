import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The Veilguard mark: the redesigned angular "V", ink-black on a rounded yellow
 * square. Rendered from the brand PNG (public/logos/logo-icon.png) so it stays
 * pixel-identical to the exported brand asset across the site and favicons. The
 * yellow chip reads on both light and dark backgrounds. Optionally followed by
 * the wordmark.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logos/logo-mark.png"
      alt="Veilguard"
      width={size}
      height={size}
      className={cn('rounded-[22%] select-none', className)}
      priority
    />
  );
}

export default function Logo({
  size = 32,
  wordmark = true,
  className,
  wordmarkClassName,
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-[11px]', className)}>
      <LogoMark size={size} />
      {wordmark && (
        <span
          // Pinned to Hanken so the wordmark keeps its brand type while the rest
          // of the UI runs on Inter (--font-sans).
          style={{ fontFamily: 'var(--font-hanken), sans-serif' }}
          className={cn('font-bold tracking-[-0.02em] text-[21px] leading-none', wordmarkClassName)}
        >
          Veilguard
        </span>
      )}
    </span>
  );
}
