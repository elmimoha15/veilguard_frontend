'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, GRADE_TINT, timeAgo, repoDisplay, type App } from '@/lib/hooks';
import { api } from '@/lib/api';
import type { ScanDoc, Cadence } from '@/lib/scans';
import { Card, PageHeading, GradeBadge } from './primitives';

/**
 * My Apps — a list of every project the user is protecting. Each row rolls up an
 * app's two lenses (URL + Deep) with at-a-glance stats (grade, open criticals,
 * warnings, lenses, monitoring, last scan) and links to its detail page
 * (/app?key=…), where scans are run and history lives.
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';
const isDone = (s?: ScanDoc | null): boolean => s?.status === 'done';

const CADENCE_LABEL: Record<Cadence, string> = {
  off: 'Off', push: 'On push', daily: 'Daily', weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly',
};

function PlusIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AppsScreen() {
  const router = useRouter();
  const { setModal, setActiveSite, toast } = useApp();
  const { apps, loading } = useApps();

  // Delete-app flow: a type-the-name confirm modal (mirrors "delete account").
  const [toDelete, setToDelete] = useState<App | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const confirmName = toDelete ? repoDisplay(toDelete.name) : '';

  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };
  const askDelete = (app: App) => { setConfirmText(''); setToDelete(app); };

  const doDelete = async () => {
    if (!toDelete || confirmText.trim() !== confirmName) return;
    setDeleting(true);
    // Registry apps carry a stable id (= key); derived apps don't — match those by
    // repo/url instead. The live scans + registry subscriptions refresh the list.
    const res = await api.deleteApp({
      appId: toDelete.derived ? undefined : toDelete.key,
      githubRepo: toDelete.githubRepo || undefined,
      url: toDelete.url || (toDelete.githubRepo ? undefined : toDelete.host),
    });
    setDeleting(false);
    if (!res.ok) { toast(res.data.error || 'Could not delete the app', '#E5484D'); return; }
    setToDelete(null); setConfirmText('');
    toast('App deleted', '#0A0A0A');
  };

  return (
    <div className="vg-fade">
      <PageHeading
        title="My apps"
        right={
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer inline-flex items-center gap-[7px] bg-ink text-white rounded-[10px] px-[16px] py-[10px] font-medium text-[14px]">
            <PlusIcon color="#fff" /> New scan
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
        </div>
      ) : apps.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3.2a2 2 0 0 1 1.6.8l.9 1.2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-semibold text-[18px]">No apps scanned yet</h2>
          <p className="text-muted text-[14px] mt-1 mb-5 max-w-[42ch] mx-auto">Start with a URL scan (~60s, no access) or connect a repo for a Deep scan.</p>
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-6 py-[11px] text-[14px]">Scan your first app</button>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            {apps.map((app, i) => (
              <AppRow key={app.key} app={app} first={i === 0} onClick={() => openApp(app)} onDelete={() => askDelete(app)} />
            ))}
          </Card>
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer mt-3 w-full flex items-center justify-center gap-2 rounded-[12px] py-[14px] text-muted font-medium text-[14px]" style={{ border: '1.5px dashed #DCDCD8' }}>
            <PlusIcon size={18} color="#9B9B96" /> Scan another app
          </button>
        </>
      )}

      {/* delete-app confirmation — type the app name to confirm (mirrors delete account) */}
      {toDelete && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !deleting && setToDelete(null)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
            <h2 className="font-semibold text-[19px] tracking-[-0.02em]">Delete “{confirmName}”?</h2>
            <p className="text-[14.5px] text-muted mt-2 leading-[1.55]">
              This permanently deletes <span className="text-ink font-medium">everything</span> about this app — all its scans,
              findings, fixes, monitoring runs, alerts, and usage records. This cannot be undone. Your account and GitHub/Supabase
              connections are not affected.
            </p>
            <label className="block text-[13px] text-muted mt-5 mb-[7px]">Type <span className="font-mono text-ink">{confirmName}</span> to confirm</label>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && confirmText.trim() === confirmName && !deleting) void doDelete(); }}
              aria-label="Type the app name to confirm deletion"
              placeholder={confirmName}
              className="w-full bg-bg-soft rounded-[10px] px-[13px] py-[11px] text-[15px] font-mono outline-none focus:shadow-[0_0_0_2px_#F3C500] transition-shadow"
              style={{ outline: 'none' }}
            />
            <div className="flex gap-[10px] mt-6">
              <button onClick={() => setToDelete(null)} disabled={deleting} className="vg-press cursor-pointer flex-1 bg-card border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted disabled:opacity-60">Keep app</button>
              <button
                onClick={doDelete}
                disabled={deleting || confirmText.trim() !== confirmName}
                className="vg-press cursor-pointer flex-1 rounded-[10px] py-[12px] font-medium text-[15px] text-white disabled:opacity-50"
                style={{ background: '#C23B3F' }}
              >
                {deleting ? 'Deleting…' : 'Delete app'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function AppRow({ app, first, onClick, onDelete }: { app: App; first: boolean; onClick: () => void; onDelete: () => void }) {
  const grade = app.latest?.grade;
  const counts = app.latest?.counts;
  const crit = counts?.critical ?? 0;
  const warn = (counts?.high ?? 0) + (counts?.medium ?? 0) + (counts?.low ?? 0);
  const running = isRunning(app.latestUrlScan) || isRunning(app.latestDeepScan);
  const sub = app.url || (app.githubRepo ? `github.com/${repoDisplay(app.githubRepo)}` : app.host);
  const urlGrade = isDone(app.latestUrlScan) ? app.latestUrlScan!.grade : undefined;
  const deepGrade = isDone(app.latestDeepScan) ? app.latestDeepScan!.grade : undefined;
  const cadence = app.monitoring?.cadence ?? 'off';
  const monitored = cadence !== 'off';

  const dot = running ? '#F3C500' : grade ? GRADE_TINT[grade].fg : '#B0B0AC';

  return (
    <div
      className="vg-row flex items-center gap-2 flex-wrap pr-3"
      style={{ borderTop: first ? undefined : '1px solid var(--color-hairline)' }}
    >
      {/* Clickable open area (name + stats). A separate delete button lives outside
          it, so we can't keep the whole row as a single <button>. */}
      <button onClick={onClick} className="cursor-pointer text-left flex items-center gap-4 flex-wrap flex-1 min-w-0 pl-4 py-[14px] bg-transparent border-0">
        {/* App name + url */}
        <span className="flex items-center gap-[11px] min-w-0 flex-1 basis-[200px]">
          <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: dot }} />
          <span className="min-w-0">
            <span className="block font-semibold text-[15px] truncate">{repoDisplay(app.name)}</span>
            <span className="block font-mono text-[12px] text-faint truncate">{sub}</span>
          </span>
        </span>

        {/* Stats cluster */}
        <span className="flex items-center gap-4 flex-wrap justify-end shrink-0">
          {running ? (
            <span className="rounded-full px-[10px] py-[5px] text-[12px] font-semibold bg-[rgba(243,197,0,.16)] text-yellow-dark">Scanning…</span>
          ) : (
            <>
              <Stat value={crit} label={crit === 1 ? 'critical' : 'criticals'} color={crit ? '#C23B3F' : '#B0B0AC'} />
              <Stat value={warn} label="warnings" color={warn ? '#9A6412' : '#B0B0AC'} />
            </>
          )}

          {(urlGrade || deepGrade) && (
            <span className="hidden md:flex items-center gap-[6px]">
              {urlGrade && <LensChip label="URL" grade={urlGrade} />}
              {deepGrade && <LensChip label="Deep" grade={deepGrade} />}
            </span>
          )}

          <span className="hidden lg:flex items-center gap-[6px] text-[13px]" title="Monitoring">
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: monitored ? '#1F9D57' : '#D8D8D4' }} />
            <span className={monitored ? 'text-muted' : 'text-faint'}>{CADENCE_LABEL[cadence]}</span>
          </span>

          {app.latest && (
            <span className="hidden sm:block font-mono text-[12px] text-faint w-[92px] text-right tnum">{timeAgo(app.latest.createdAt)}</span>
          )}

          <GradeBadge grade={grade} size="md" />
        </span>
      </button>

      {/* Delete this app */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete ${repoDisplay(app.name)}`}
        title="Delete app"
        className="vg-press cursor-pointer shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center text-[#B0B0AC] hover:text-[#C23B3F] hover:bg-[rgba(229,72,77,.10)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span className="text-center min-w-[52px]">
      <span className="block font-semibold text-[15px] leading-none tnum" style={{ color }}>{value}</span>
      <span className="block text-[11px] text-faint mt-[3px]">{label}</span>
    </span>
  );
}

function LensChip({ label, grade }: { label: string; grade: string }) {
  return (
    <span className="rounded-full px-[9px] py-[4px] text-[11.5px] font-semibold text-muted bg-bg-soft border border-border tnum">
      {label} · <span style={{ color: GRADE_TINT[grade].fg }}>{grade}</span>
    </span>
  );
}
