import { cn } from '@/lib/utils';

/** Subtle gray sans eyebrow label, e.g. "Fixes" or "Monitoring" (ElevenLabs style). */
export default function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('text-[13.5px] font-medium tracking-[0.01em] text-label', className)}>{children}</p>;
}
