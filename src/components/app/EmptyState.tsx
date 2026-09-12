import { cn } from '@/lib/utils';
import { PillButton } from './primitives';

/**
 * The one empty-state recipe (ElevenLabs-style, per the Flows/Assets screens):
 * a centered muted line-icon in a rounded square, a bold line, a muted subline,
 * and a single black primary action. Calm, no color. Used across every app list.
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center text-center py-16 px-6', className)}>
      <div className="w-12 h-12 mb-4 rounded-[12px] bg-bg-soft border border-border flex items-center justify-center text-tertiary">
        {icon ?? <DefaultIcon />}
      </div>
      <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-muted text-[14px] mt-[5px] max-w-[42ch]">{subtitle}</p>}
      {action && (
        <div className="mt-5">
          <PillButton onClick={action.onClick}>{action.label}</PillButton>
        </div>
      )}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
