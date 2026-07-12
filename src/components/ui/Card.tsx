import { cn } from '@/lib/utils';

/** White card on light sections. */
export default function Card({
  children,
  className,
  lift = false,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-[18px] p-7',
        lift && 'card-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}
