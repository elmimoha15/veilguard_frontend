'use client';

import { cn } from '@/lib/utils';

/**
 * Underline tabs (ElevenLabs-style, per the Voices/Settings/Developers screens):
 * plain text, muted when inactive; the active tab is ink with a 2px ink underline
 * sitting on the container's bottom hairline. No pills, no color. Controlled.
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: readonly { id: T; label: React.ReactNode }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-6 border-b border-border', className)}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative -mb-px py-[11px] text-[14px] font-medium transition-colors cursor-pointer"
            style={{ color: on ? '#0A0A0A' : '#6E6E6A' }}
          >
            {t.label}
            {on && <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-ink" />}
          </button>
        );
      })}
    </div>
  );
}
