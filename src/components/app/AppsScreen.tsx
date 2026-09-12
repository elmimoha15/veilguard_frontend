'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, timeAgo, repoDisplay, type App } from '@/lib/hooks';
import { api } from '@/lib/api';
import type { ScanDoc } from '@/lib/scans';
import { PageHeading, GradeSquare, PillButton } from './primitives';
import ActionButton from '@/components/ui/ActionButton';
import type { Grade } from './data';
import { EmptyState } from './EmptyState';

const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';

type GradeFilter = 'any' | 'pass' | 'warn' | 'fail';
type TimeFilter = 'all' | '30d' | '7d';
const GRADE_FILTER_LABEL: Record<GradeFilter, string> = { any: 'Any grade', pass: 'Passing (A, B)', warn: 'Warnings (C)', fail: 'Failing (D, F)' };
const TIME_FILTER_LABEL: Record<TimeFilter, string> = { all: 'Any time', '30d': 'Last 30 days', '7d': 'Last 7 days' };
const GRADE_OPTIONS = (Object.keys(GRADE_FILTER_LABEL) as GradeFilter[]).map((id) => ({ id, label: GRADE_FILTER_LABEL[id] }));
const TIME_OPTIONS = (Object.keys(TIME_FILTER_LABEL) as TimeFilter[]).map((id) => ({ id, label: TIME_FILTER_LABEL[id] }));

/**
 * My apps, a hairline table of every project the user has pointed Veilguard at.
 * Each row rolls up issues + last scan + grade and links to the detail page.
 */
export default function AppsScreen() {
  const router = useRouter();
  const { setModal, setActiveSite, toast } = useApp();
  const { apps, loading } = useApps();

  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('any');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [now] = useState(() => Date.now());

  const [toDelete, setToDelete] = useState<App | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const confirmName = toDelete ? repoDisplay(toDelete.name) : '';

  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };

  const filtered = apps.filter((a) => {
    const g = a.latest?.grade;
    if (gradeFilter === 'pass' && !(g === 'A' || g === 'B')) return false;
    if (gradeFilter === 'warn' && g !== 'C') return false;
    if (gradeFilter === 'fail' && !(g === 'D' || g === 'F')) return false;
    const cutoff = timeFilter === '30d' ? 30 : timeFilter === '7d' ? 7 : 0;
    if (cutoff && a.latest && now - +new Date(a.latest.createdAt) > cutoff * 86400000) return false;
    return true;
  });
  const allActive = gradeFilter === 'any' && timeFilter === 'all';

  const doDelete = async () => {
    if (!toDelete || confirmText.trim() !== confirmName) return;
    setDeleting(true);
    const res = await api.deleteApp({
      appId: toDelete.derived ? undefined : toDelete.key,
      githubRepo: toDelete.githubRepo || undefined,
      url: toDelete.url || (toDelete.githubRepo ? undefined : toDelete.host),
    });
    setDeleting(false);
    if (!res.ok) { toast(res.data.error || 'Could not delete the app', '#DC2626'); return; }
    setToDelete(null); setConfirmText('');
    toast('App deleted', '#0A0A0A');
  };

  return (
    <div className="vg-fade">
      <PageHeading
        title="My apps"
        subtitle="Everything you’ve pointed Veilguard at."
        right={<PillButton onClick={() => setModal('addApp')}>＋ Add app</PillButton>}
      />

      {/* filter chips (dropdowns) */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <FilterChip active={allActive} onClick={() => { setGradeFilter('any'); setTimeFilter('all'); }}>All apps</FilterChip>
        <FilterMenu label={GRADE_FILTER_LABEL[gradeFilter]} active={gradeFilter !== 'any'} options={GRADE_OPTIONS} value={gradeFilter} onSelect={setGradeFilter} />
        <FilterMenu label={TIME_FILTER_LABEL[timeFilter]} active={timeFilter !== 'all'} options={TIME_OPTIONS} value={timeFilter} onSelect={setTimeFilter} />
      </div>

      {loading ? (
        <div className="vg-skel h-[220px] rounded-[14px]" />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3.2a2 2 0 0 1 1.6.8l.9 1.2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>}
          title="No apps scanned yet"
          subtitle="Start with a URL scan (~60s, no access) or connect a repo for a Deep scan."
          action={{ label: 'Scan your first app', onClick: () => setModal('addApp') }}
        />
      ) : (
        <div className="border-y border-border overflow-hidden">
          {/* header */}
          <div className="flex items-center px-5 py-3 text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ borderBottom: '1px solid var(--color-border)', color: '#A3A3A3' }}>
            <span className="flex-1">APP</span>
            <span className="w-[90px] text-center">ISSUES</span>
            <span className="w-[96px]">LAST SCAN</span>
            <span className="w-[46px] text-center">GRADE</span>
            <span className="w-8" />
          </div>
          {filtered.map((app) => (
            <AppRow key={app.key} app={app} onClick={() => openApp(app)} onDelete={() => { setConfirmText(''); setToDelete(app); }} />
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-[14px]" style={{ color: '#A3A3A3' }}>No apps match this filter.</div>
          )}
          {/* scan another */}
          <button onClick={() => setModal('addApp')} className="vg-row w-full flex items-center justify-center gap-2 py-[15px] text-[14px] font-medium cursor-pointer" style={{ color: '#A3A3A3' }}>
            ＋ Scan another app
          </button>
        </div>
      )}

      {toDelete && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !deleting && setToDelete(null)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div role="dialog" aria-label="Delete app" onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] bg-card rounded-[16px] p-7 vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
            <h2 className="font-medium text-[19px] tracking-[-0.02em]">Delete “{confirmName}”?</h2>
            <p className="text-[14.5px] mt-2 leading-[1.55]" style={{ color: '#737373' }}>
              This permanently deletes <span className="text-ink font-medium">everything</span> about this app, all its scans,
              findings, fixes, monitoring runs, alerts, and usage records. This cannot be undone.
            </p>
            <label className="block text-[13px] mt-5 mb-[7px]" style={{ color: '#737373' }}>Type <span className="font-mono text-ink">{confirmName}</span> to confirm</label>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && confirmText.trim() === confirmName && !deleting) void doDelete(); }}
              aria-label="Type the app name to confirm deletion"
              placeholder={confirmName}
              className="w-full rounded-[10px] px-[13px] py-[11px] text-[15px] font-mono focus:shadow-[0_0_0_2px_#0A0A0A] transition-shadow"
              style={{ outline: 'none', background: '#F7F7F7' }}
            />
            <div className="flex gap-[10px] mt-6">
              <PillButton variant="cancel" onClick={() => setToDelete(null)} disabled={deleting} className="flex-1 h-[44px]">Keep app</PillButton>
              <ActionButton variant="danger-solid" onClick={doDelete} disabled={deleting || confirmText.trim() !== confirmName} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>} className="flex-1 h-[44px]">
                {deleting ? 'Deleting…' : 'Delete app'}
              </ActionButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function AppRow({ app, onClick, onDelete }: { app: App; onClick: () => void; onDelete: () => void }) {
  const grade = app.latest?.grade as Grade | undefined;
  const counts = app.latest?.counts;
  const crit = (counts?.critical ?? 0) + (counts?.high ?? 0);
  const warn = (counts?.medium ?? 0) + (counts?.low ?? 0);
  const running = isRunning(app.latestUrlScan) || isRunning(app.latestDeepScan);
  const sub = app.url || (app.githubRepo ? `github.com/${repoDisplay(app.githubRepo)}` : app.host);

  return (
    <div className="vg-row group flex items-center" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
      <button onClick={onClick} className="flex-1 flex items-center min-w-0 px-5 py-4 text-left cursor-pointer">
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-[14.5px] truncate">{repoDisplay(app.name)}</span>
          <span className="block font-mono text-[12px] truncate mt-[1px]" style={{ color: '#A3A3A3' }}>{sub}</span>
        </span>
        <span className="w-[90px] flex items-center justify-center gap-[6px]">
          {running ? (
            <span className="rounded-full px-[9px] py-[4px] text-[11px] font-medium" style={{ background: '#F5F5F5', color: '#737373' }}>Scanning</span>
          ) : (
            <span className="text-[14px] font-semibold tnum" style={{ color: crit ? '#DC2626' : warn ? '#B45309' : '#A3A3A3' }}>{crit + warn}</span>
          )}
        </span>
        <span className="w-[96px] font-mono text-[12px] tnum" style={{ color: '#A3A3A3' }}>{app.latest ? timeAgo(app.latest.createdAt) : ', '}</span>
        <span className="w-[46px] flex justify-center"><GradeSquare grade={grade} size={32} /></span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete ${repoDisplay(app.name)}`}
        className="vg-press shrink-0 w-8 h-8 mr-2 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: '#A3A3A3' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-full px-[14px] py-[7px] text-[13px] font-medium transition-colors cursor-pointer"
      style={active ? { background: '#0A0A0A', color: '#fff' } : { background: '#fff', color: '#0A0A0A', border: '1px solid #E5E5E5' }}
    >
      {children}
    </button>
  );
}

function FilterMenu<T extends string>({ label, active, options, value, onSelect }: { label: string; active: boolean; options: { id: T; label: string }[]; value: T; onSelect: (id: T) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[13px] font-medium transition-colors cursor-pointer"
        style={active ? { background: '#0A0A0A', color: '#fff' } : { background: '#fff', color: '#0A0A0A', border: '1px solid #E5E5E5' }}
        aria-expanded={open}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-[200px] bg-white border border-border rounded-[12px] p-[6px] vg-fade" style={{ boxShadow: 'var(--shadow-pop)' }}>
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => { onSelect(o.id); setOpen(false); }}
                className="vg-row flex items-center justify-between w-full rounded-[9px] px-[11px] py-[8px] text-left text-[13.5px] cursor-pointer"
                style={{ background: o.id === value ? 'var(--color-bg-soft)' : undefined, fontWeight: o.id === value ? 600 : 500 }}
              >
                {o.label}
                {o.id === value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
