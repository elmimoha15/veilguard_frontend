'use client';

import { useState } from 'react';
import { type App, appKind, GRADE_TINT } from '@/lib/hooks';
import { GitHubIcon } from '@/components/ui/BrandIcons';

type Kind = 'Repo' | 'URL' | 'Upload';
const KIND_STYLE: Record<Kind, { bg: string; fg: string; icon: string }> = {
  Repo: { bg: 'rgba(0,0,0,.06)', fg: '#5b5a56', icon: '' },
  URL: { bg: 'rgba(0,0,0,.06)', fg: '#5b5a56', icon: '🌐' },
  Upload: { bg: 'rgba(31,184,107,.16)', fg: '#158a4f', icon: '📁' },
};

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
      <div className="inline-flex items-center gap-[10px] bg-card border border-border-2 rounded-[12px] px-4 py-[9px]">
        <GradeSquare grade={active.grade} />
        <span className="text-[14px] font-semibold truncate max-w-[240px]">{active.name}</span>
        <KindBadge kind={appKind(active)} />
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="vg-press flex items-center gap-[10px] bg-card border border-border-2 rounded-[12px] px-4 py-[9px] min-w-[280px]">
        <GradeSquare grade={active.grade} />
        <span className="flex-1 text-left min-w-0">
          <span className="block text-[14px] font-semibold truncate">{active.name}</span>
          <span className="block font-mono text-[10.5px] text-faint">{appKind(active)} · tap to switch app</span>
        </span>
        <span className="text-faint text-[11px]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] left-0 w-[320px] max-h-[360px] overflow-y-auto bg-card border border-border-2 rounded-[14px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            <div className="font-mono text-[10px] tracking-[0.12em] text-faint px-[10px] pt-[8px] pb-[4px]">YOUR APPS</div>
            {apps.map((a) => {
              const on = a.key === active.key;
              return (
                <button key={a.key} onClick={() => { onSelect(a); setOpen(false); }} className="flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left hover:bg-bg-soft" style={{ background: on ? 'rgba(243,197,0,.12)' : undefined }}>
                  <GradeSquare grade={a.grade} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold truncate">{a.name}</span>
                  </span>
                  <KindBadge kind={appKind(a)} />
                  {on && <span className="shrink-0 text-yellow-dark text-[13px]">✓</span>}
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
    <span className="shrink-0 inline-flex items-center gap-[4px] text-[10.5px] font-bold px-[8px] py-[3px] rounded-full" style={{ background: s.bg, color: s.fg }}>
      {kind === 'Repo' ? <GitHubIcon size={11} className="text-ink" /> : s.icon} {kind}
    </span>
  );
}

function GradeSquare({ grade }: { grade?: 'A' | 'B' | 'C' | 'D' | 'F' }) {
  return (
    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[15px]" style={{ background: grade ? GRADE_TINT[grade].bg : 'rgba(0,0,0,.05)', color: grade ? GRADE_TINT[grade].fg : '#9a9a95' }}>{grade ?? '…'}</span>
  );
}
