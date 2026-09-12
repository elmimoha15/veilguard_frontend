'use client';

import { useState } from 'react';
import { type App, repoDisplay } from '@/lib/hooks';

/**
 * Minimal app/target picker: just the app name + a chevron, matching the flat SaaS
 * look (no card box, no grade chip, no type badge). With ≤1 app it renders a plain
 * name label (nothing to pick).
 */
export function AppSelect({ apps, activeKey, onSelect }: { apps: App[]; activeKey: string; onSelect: (app: App) => void }) {
  const [open, setOpen] = useState(false);
  const active = apps.find((a) => a.key === activeKey) ?? apps[0];
  if (!active) return null;

  if (apps.length <= 1) {
    return <span className="text-[15px] font-semibold text-ink truncate max-w-[240px]">{repoDisplay(active.name)}</span>;
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="vg-press inline-flex items-center gap-[6px] rounded-[8px] px-[8px] py-[5px] text-[15px] font-semibold text-ink hover:bg-bg-soft transition-colors cursor-pointer"
      >
        <span className="truncate max-w-[240px]">{repoDisplay(active.name)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-faint"><path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] right-0 w-[280px] max-h-[360px] overflow-y-auto bg-card border border-border rounded-[12px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            {apps.map((a) => {
              const on = a.key === active.key;
              return (
                <button
                  key={a.key}
                  onClick={() => { onSelect(a); setOpen(false); }}
                  className="flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left hover:bg-bg-soft"
                  style={{ background: on ? 'var(--color-bg-soft)' : undefined }}
                >
                  <span className="flex-1 min-w-0 text-[14.5px] font-semibold truncate">{repoDisplay(a.name)}</span>
                  {on && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: '#0A0A0A' }}><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
