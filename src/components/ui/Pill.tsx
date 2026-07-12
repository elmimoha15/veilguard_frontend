import { cn } from '@/lib/utils';

/** Mono uppercase badge / pill. */
export default function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-mono font-bold text-[10px] tracking-[0.12em] uppercase px-[11px] py-[5px]',
        className,
      )}
    >
      {children}
    </span>
  );
}
