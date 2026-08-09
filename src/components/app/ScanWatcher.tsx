'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { subscribeScan, type ScanDoc } from '@/lib/scans';
import { scanLabel, repoDisplay } from '@/lib/hooks';

/**
 * Watches the scan the user most recently started (`pendingScanId`) and shows a
 * small docked progress chip (bottom-right) instead of taking over the screen —
 * so the user keeps browsing while the scan runs. On completion the chip becomes
 * "View results" (it never auto-navigates). Mounted app-wide at the (app) layout
 * so it survives navigation. The onboarding + anonymous first-run flows don't set
 * `pendingScanId` and keep their full-screen /scanning reveal.
 */
export default function ScanWatcher() {
  const router = useRouter();
  const { pendingScanId, setPendingScanId } = useApp();
  const { refreshProfile } = useAuth();
  const [tracked, setTracked] = useState<{ id: string; doc: ScanDoc } | null>(null);
  // Which scan we've already refreshed the profile for, so the usage meter updates
  // exactly once per scan (the moment it lands) without a manual page reload.
  const refreshedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingScanId) return;
    const id = pendingScanId;
    return subscribeScan(id, (doc) => {
      if (!doc) return;
      setTracked({ id, doc });
      // On terminal (done/error) → pull fresh usage so the meter reflects it live.
      if ((doc.status === 'done' || doc.status === 'error') && refreshedFor.current !== id) {
        refreshedFor.current = id;
        void refreshProfile();
      }
    });
  }, [pendingScanId, refreshProfile]);

  // Only render for the current pending scan (guards the brief window after a new
  // scan starts but before its first snapshot arrives).
  if (!pendingScanId || !tracked || tracked.id !== pendingScanId) return null;

  const { id, doc } = tracked;
  const p = doc.progress;
  const pct = p && p.total > 0 ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;
  const label = repoDisplay(scanLabel(doc));

  const dismiss = () => setPendingScanId(null);
  const view = () => { setPendingScanId(null); router.push(`/scan?scan=${id}`); };

  const DismissX = (
    <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 -mr-1 -mt-1 w-6 h-6 rounded-md flex items-center justify-center text-tertiary hover:bg-[#F2F2EF] transition-colors">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </button>
  );

  return (
    <div className="fixed z-[9997] bottom-4 right-4 w-[320px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-[12px] p-4 shadow-[0_16px_40px_-14px_rgba(0,0,0,.3)] vg-pop">
      {doc.status === 'error' ? (
        <>
          <div className="flex items-start gap-[10px]">
            <span className="shrink-0 mt-[3px] w-[9px] h-[9px] rounded-full bg-red" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">Scan failed</div>
              <div className="font-mono text-[11.5px] text-faint truncate mt-[2px]">{label}</div>
            </div>
            {DismissX}
          </div>
          <button onClick={view} className="vg-press mt-3 w-full rounded-[10px] py-[9px] font-semibold text-[13.5px] bg-ink text-white">See why</button>
        </>
      ) : doc.status === 'done' ? (
        <>
          <div className="flex items-start gap-[10px]">
            <span className="shrink-0 mt-[1px] w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: '#EAF6EF' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">Scan complete{doc.grade ? ` · ${doc.grade}` : ''}</div>
              <div className="font-mono text-[11.5px] text-faint truncate mt-[2px]">{label}</div>
            </div>
            {DismissX}
          </div>
          <button onClick={view} className="vg-press mt-3 w-full rounded-[10px] py-[9px] font-semibold text-[13.5px] bg-ink text-white">View results</button>
        </>
      ) : (
        <>
          <div className="flex items-start gap-[10px]">
            <span className="shrink-0 mt-[4px] w-[9px] h-[9px] rounded-full" style={{ background: '#F3C500', animation: 'vgPulse 1.4s ease-in-out infinite' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-[14px] truncate">Scanning {label}</div>
                <span className="shrink-0 font-semibold text-[13px] text-yellow-dark">{pct > 0 ? `${pct}%` : ''}</span>
              </div>
              <div className="font-mono text-[11.5px] text-faint truncate mt-[2px]">{p?.phase ?? 'starting…'}</div>
            </div>
            {DismissX}
          </div>
          <div className="mt-3">
            {pct > 0 ? (
              <div className="h-[6px] bg-border-2 rounded-full overflow-hidden">
                <div className="h-full bg-yellow rounded-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            ) : (
              <div className="vg-skel h-[6px] rounded-full" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
