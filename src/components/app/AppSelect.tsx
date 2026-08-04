'use client';

import { useState } from 'react';
import { type App, appKind, GRADE_TINT } from '@/lib/hooks';
import { GitHubIcon } from '@/components/ui/BrandIcons';

type Kind = 'Repo' | 'URL' | 'Upload';
const KIND_STYLE: Record<Kind, { bg: string; fg: string }> = {
  Repo: { bg: '#F2F2EF', fg: '#6E6E6A' },
  URL: { bg: '#F2F2EF', fg: '#6E6E6A' },
  Upload: { bg: '#EAF6EF', fg: '#157A43' },
};

function KindIcon({ kind }: { kind: Kind }) {
  if (kind === 'Repo') return <GitHubIcon size={11} className="text-ink" />;
  if (kind === 'URL') return <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.8" /></svg>;
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

/**
 * Shared app/target picker used by the Monitoring and Findings pages, so the user
 * can choose WHICH repo / URL / folder they're looking at instead of being locked
 * to the most-recently-scanned one. Same popover pattern as FindingsScreen's
 * ScanPicker. With ≤1 app it renders a static label (nothing to pick).
 */
export function AppSelect({ apps, activeKey, onSelect }: { apps: App[]; activeKey: string; onSelect: (app: App) => void }) {
  const [open, setOpen] = useState(false);
  const active = apps.find((a) => a.key === activeKey) ?? apps[0];
  if (!active) return null;

  if (apps.length <= 1) {
    return (
      <div className="inline-flex items-center gap-[10px] bg-card border border-border rounded-[12px] px-4 py-[9px]">
        <GradeSquare grade={active.grade} />
        <span className="text-[15px] font-semibold truncate max-w-[240px]">{active.name}</span>
        <KindBadge kind={appKind(active)} />
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="vg-press flex items-center gap-[10px] bg-card border border-border rounded-[12px] px-4 py-[9px] min-w-[280px]">
        <GradeSquare grade={active.grade} />
        <span className="flex-1 text-left min-w-0">
          <span className="block text-[15px] font-semibold truncate">{active.name}</span>
          <span className="block font-mono text-[11.5px] text-faint">{appKind(active)} · tap to switch app</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-faint"><path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] left-0 w-[320px] max-h-[360px] overflow-y-auto bg-card border border-border rounded-[12px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            <div className="font-mono text-[11px] tracking-[0.12em] text-faint px-[10px] pt-[8px] pb-[4px]">YOUR APPS</div>
            {apps.map((a) => {
              const on = a.key === active.key;
              return (
                <button key={a.key} onClick={() => { onSelect(a); setOpen(false); }} className="flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left hover:bg-bg-soft" style={{ background: on ? 'rgba(243,197,0,.12)' : undefined }}>
                  <GradeSquare grade={a.grade} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14.5px] font-semibold truncate">{a.name}</span>
                  </span>
                  <KindBadge kind={appKind(a)} />
                  {on && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: '#8a6d00' }}><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: Kind }) {
  const s = KIND_STYLE[kind];
  return (
    <span className="shrink-0 inline-flex items-center gap-[4px] text-[11.5px] font-semibold px-[8px] py-[3px] rounded-full" style={{ background: s.bg, color: s.fg }}>
      <KindIcon kind={kind} /> {kind}
    </span>
  );
}

function GradeSquare({ grade }: { grade?: 'A' | 'B' | 'C' | 'D' | 'F' }) {
  return (
    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-[16px]" style={{ background: grade ? GRADE_TINT[grade].bg : '#F2F2EF', color: grade ? GRADE_TINT[grade].fg : '#B0B0AC' }}>{grade ?? '…'}</span>
  );
}
