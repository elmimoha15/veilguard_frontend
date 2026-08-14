import { cn } from '@/lib/utils';

/**
 * A small, unmistakable "PLACEHOLDER" chip. Attach to any mock testimonial /
 * photo / metric that is NOT real yet, so it can never be confused for genuine
 * content and is easy to find before go-live.
 */
export default function PlaceholderBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-[rgba(243,197,0,0.18)] text-[#8a6d00] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase',
        className,
      )}
    >
      Placeholder
    </span>
  );
}
