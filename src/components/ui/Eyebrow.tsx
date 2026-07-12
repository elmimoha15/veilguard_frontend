import { cn } from '@/lib/utils';

/** Mono kicker label, e.g. "// THE PROBLEM". */
export default function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('eyebrow', className)}>{children}</p>;
}
