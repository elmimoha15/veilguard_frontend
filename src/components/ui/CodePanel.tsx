import { cn } from '@/lib/utils';

/**
 * A dark code panel with a tinted header (used for the before/after
 * Supabase RLS comparison in the Find & Fix section).
 */
export default function CodePanel({
  tone,
  label,
  filename,
  action,
  children,
  className,
}: {
  tone: 'bad' | 'good';
  label: string;
  filename?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const bad = tone === 'bad';
  return (
    <div
      className={cn(
        'rounded-[18px] overflow-hidden border',
        bad ? 'border-red/40' : 'border-green/45',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-[18px] py-3 text-[12px] font-mono',
          bad ? 'bg-red/[0.12]' : 'bg-green/[0.12]',
        )}
      >
        <span className={cn('font-bold tracking-[0.06em]', bad ? 'text-red-light' : 'text-green-light')}>
          {label}
        </span>
        {filename && <span className="text-white/50">{filename}</span>}
        {action}
      </div>
      <pre className="bg-[#151412] text-[#d8d8d4] px-5 py-5 text-[13px] leading-[1.7] font-mono overflow-x-auto">
        {children}
      </pre>
    </div>
  );
}
