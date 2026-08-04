'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { useApps, findActiveApp, GRADE_TINT, timeAgo, type App } from '@/lib/hooks';
import { saveApps, upsertApp, type ScanDoc } from '@/lib/scans';
import { api } from '@/lib/api';
import { checkUrl } from '@/lib/url';
import { GRADE_COLOR } from '@/lib/adapters';
import { GradeRing } from './ui';
import { RepoPicker } from './RepoPicker';
import FindingsScreen from './FindingsScreen';
import MonitoringScreen from './MonitoringScreen';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'findings', label: 'Findings' },
  { id: 'monitoring', label: 'Monitoring' },
] as const;

/**
 * Per-app detail page (route: /app?key=<encoded app.key>). One project seen
 * through both lenses (URL + Deep), with its latest grade, both lens statuses,
 * monitoring config and full scan history. Running a scan happens here (the
 * actions moved off the Apps list, which is now just a list of links).
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';

function gradePct(grade?: string): number {
  return { A: 95, B: 82, C: 67, D: 50, F: 25 }[grade ?? ''] ?? 0;
}

export default function AppDetailScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { setModal, setActiveSite, setPendingScanId, toast } = useApp();
  const { user, profile } = useAuth();
  const { apps, records, loading } = useApps();
  const paid = isPaid(profile); // deep scan is a Pro feature

  const key = params.get('key');
  const app = findActiveApp(apps, key ? decodeURIComponent(key) : null);

  const [repoOpen, setRepoOpen] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);

  const openResult = (scanId: string) => { if (app) setActiveSite(app.host); router.push(`/scan?scan=${scanId}`); };
  const resume = (scanId: string) => { if (app) setActiveSite(app.host); router.push(`/scanning?scanId=${scanId}`); };
  const afterStart = (scanId: string) => { setPendingScanId(scanId); resume(scanId); };

  const runUrl = async () => {
    if (!app) return;
    const c = checkUrl(app.url ?? '');
    if (!c.ok) { setUrlOpen(true); return; }
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start scan', '#E5484D'); return; }
    afterStart(r.data.scanId);
  };

  const submitUrlLink = async (raw: string) => {
    if (!app) return;
    const c = checkUrl(raw);
    if (!c.ok) { toast(c.error!, '#E5484D'); return; }
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start scan', '#E5484D'); return; }
    if (user) await saveApps(user.uid, upsertApp(records, { url: c.url!, githubRepo: app.githubRepo, name: app.name }));
    setUrlOpen(false);
    afterStart(r.data.scanId);
  };

  const startDeep = async (fullName: string): Promise<boolean> => {
    if (!app) return false;
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5484D'); return false; }
    if (user) await saveApps(user.uid, upsertApp(records, { url: app.url, githubRepo: fullName, name: app.name }));
    setRepoOpen(false);
    afterStart(r.data.scanId);
    return true;
  };

  if (loading) return <div className="vg-skel h-[400px] rounded-[12px]" />;

  if (!app) {
    return (
      <div className="vg-fade">
        <BackLink onClick={() => router.push('/apps')} />
        <div className="vg-surface p-10 text-center">
          <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3.2a2 2 0 0 1 1.6.8l.9 1.2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-semibold text-[18px]">App not found</h2>
          <p className="text-muted text-[15.5px] mt-1 mb-5">It may have been removed. Head back to your apps.</p>
          <button onClick={() => router.push('/apps')} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-6 py-3">Back to My Apps</button>
        </div>
      </div>
    );
  }

  const grade = app.latest?.grade;
  const latest = app.latest;
  const c = latest?.counts;
  const warnings = (c?.high ?? 0) + (c?.medium ?? 0) + (c?.low ?? 0);
  const cadence = app.monitoring?.cadence ?? 'off';
  const sub = app.url || (app.githubRepo ? `github.com/${app.githubRepo}` : app.host);

  // Which tab this hub shows (from ?tab=); Findings/Monitoring are now tabs here
  // rather than separate pages. Switching tabs replaces the URL so back works.
  const tab = ((): 'overview' | 'findings' | 'monitoring' => {
    const t = params.get('tab');
    return t === 'findings' || t === 'monitoring' ? t : 'overview';
  })();
  const goTab = (t: string, scanId?: string) =>
    router.replace(`/app?key=${encodeURIComponent(app.key)}&tab=${t}${scanId ? `&scan=${scanId}` : ''}`);

  // Rescan re-runs the latest lens (deep needs its repo; else the URL); uploads
  // are one-shot so fall back to the New-scan chooser.
  const rescan = () => {
    if (latest?.type === 'deep' && app.githubRepo) {
      if (!paid) { toast('Deep scan is a Pro feature — upgrade to re-scan your code.', '#E0932F'); router.push('/billing'); return; }
      void startDeep(app.githubRepo);
      return;
    }
    if (app.url) { void runUrl(); return; }
    setModal('addApp');
  };

  return (
    <div className="vg-fade">
      <BackLink onClick={() => router.push('/apps')} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="font-semibold text-[24px] tracking-[-0.02em] m-0 truncate">{app.name}</h1>
          <p className="text-muted mt-[6px] text-[15.5px] font-mono truncate max-w-[420px]">{sub}</p>
        </div>
        <span className="shrink-0 w-12 h-12 rounded-[12px] flex items-center justify-center font-semibold text-[24px] tnum" style={{ background: grade ? GRADE_TINT[grade].bg : '#F2F2EF', color: grade ? GRADE_TINT[grade].fg : '#9B9B96' }}>{grade ?? '…'}</span>
      </div>

      {/* Tabs — everything about this app lives here */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        {TABS.map((t) => {
          const on = tab === t.id;
          const crit = t.id === 'findings' ? (c?.critical ?? 0) : 0;
          return (
            <button key={t.id} onClick={() => goTab(t.id)} className="relative pb-[11px] text-[14px] cursor-pointer transition-colors" style={{ color: on ? '#0A0A0A' : '#8b8a86', fontWeight: on ? 600 : 500 }}>
              <span className="inline-flex items-center gap-[7px]">
                {t.label}
                {crit > 0 && <span className="tnum text-[11px] font-semibold px-[7px] py-[1px] rounded-full" style={{ background: '#FBEAEA', color: '#C23B3F' }}>{crit}</span>}
                {t.id === 'monitoring' && cadence !== 'off' && <span className="w-[6px] h-[6px] rounded-full bg-green" />}
              </span>
              {on && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink rounded-full" />}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
      <>
      {/* Latest scan */}
      {latest ? (
        <div className="vg-surface p-[26px] flex items-center gap-[22px] flex-wrap">
          <GradeRing size={112} pct={gradePct(grade)} color={grade ? GRADE_COLOR[grade] : '#B0B0AC'} strokeWidth={9}>
            <span className="font-semibold text-[46px] tnum" style={{ color: grade ? GRADE_COLOR[grade] : '#B0B0AC' }}>{grade ?? '…'}</span>
          </GradeRing>
          <div className="min-w-0 flex-1">
            <div className="kicker">Latest scan</div>
            <div className="text-[16px] text-ink font-semibold mt-[6px]">
              {latest.status === 'done' ? `${c?.critical ?? 0} critical · ${warnings} warnings · ${c?.passed ?? 0} passed` : latest.status}
            </div>
            <div className="text-[13px] text-muted mt-[2px]">{timeAgo(latest.createdAt)}</div>
            <div className="flex items-center gap-[10px] mt-4">
              <button onClick={() => goTab('findings', latest.id)} className="vg-press cursor-pointer bg-ink text-white font-medium text-[14px] rounded-[10px] px-[16px] py-[9px]">View findings</button>
              <button onClick={rescan} className="vg-press cursor-pointer bg-white border border-border text-ink font-medium text-[14px] rounded-[10px] px-[16px] py-[9px] inline-flex items-center gap-[7px]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Rescan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="vg-surface p-8 text-center">
          <p className="text-muted text-[15.5px] mb-4">No scans yet for this app.</p>
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-6 py-3">Run a scan</button>
        </div>
      )}

      {/* Scan history */}
      <div className="vg-surface p-[22px] mt-4">
        <div className="font-semibold text-[14px] mb-[14px]">Scan history</div>
        {app.scans.length === 0 ? (
          <div className="text-[14.5px] text-muted">No scans recorded yet.</div>
        ) : (
          <div className="flex flex-col">
            {app.scans.map((s, i) => {
              const lens = s.type === 'deep' ? 'Deep' : s.type === 'upload' ? 'Upload' : 'URL';
              const running = isRunning(s);
              return (
                <button
                  key={s.id}
                  onClick={() => (running ? resume(s.id) : openResult(s.id))}
                  className="vg-row cursor-pointer flex items-center gap-3 py-[13px] px-2 -mx-2 rounded-[8px] text-left"
                  style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}
                >
                  <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: s.grade ? GRADE_TINT[s.grade].fg : '#9B9B96' }} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold">{lens} scan</span>
                    <span className="block font-mono text-[12px] text-faint mt-[2px] tnum">{running ? (s.progress?.phase ?? 'scanning…') : s.status} · {timeAgo(s.createdAt)}</span>
                  </span>
                  {s.grade && <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-semibold text-[15px] tnum" style={{ background: GRADE_TINT[s.grade].bg, color: GRADE_TINT[s.grade].fg }}>{s.grade}</span>}
                  <svg className="text-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              );
            })}
          </div>
        )}
        <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer w-full mt-4 inline-flex items-center justify-center gap-[7px] bg-bg-soft border border-border rounded-[10px] py-[11px] font-medium text-[14.5px] text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          New scan
        </button>
      </div>
      </>
      )}

      {tab === 'findings' && <FindingsScreen app={app} initialScanId={params.get('scan')} />}
      {tab === 'monitoring' && <MonitoringScreen app={app} records={records} />}

      {repoOpen && (
        <RepoPicker
          onClose={() => setRepoOpen(false)}
          onScan={startDeep}
          onNeedsConnect={() => { setRepoOpen(false); router.push('/settings'); }}
        />
      )}
      {urlOpen && (
        <UrlLinkModal app={app} onClose={() => setUrlOpen(false)} onSubmit={submitUrlLink} />
      )}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="vg-press cursor-pointer inline-flex items-center gap-[6px] bg-none text-label font-semibold text-[15px] mb-5 hover:text-ink transition-colors">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Back to My Apps
    </button>
  );
}

function UrlLinkModal({ app, onClose, onSubmit }: { app: App; onClose: () => void; onSubmit: (raw: string) => void }) {
  const [url, setUrl] = useState('');
  if (typeof document === 'undefined') return null;
  // Portal to <body> so this fixed overlay escapes the `vg-fade` transform on the
  // page root (which would otherwise become its containing block).
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(10,10,10,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[12px] p-7 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
        <h2 className="font-semibold text-[20px] tracking-[-0.02em] mb-[6px]">Add a URL scan</h2>
        <p className="text-[15.5px] text-muted mb-[18px]">Add the live URL for <span className="font-semibold">{app.name}</span> to also grade it from the outside.</p>
        <label className="flex items-center gap-[9px] bg-bg-soft border-2 border-border rounded-xl px-[15px] min-h-[56px] focus-within:border-yellow">
          <span className="font-mono text-tertiary text-[16px]">https://</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit(url)} placeholder="your-app.com" aria-label="App URL" className="flex-1 border-0 outline-none bg-transparent text-[17px] min-w-0" autoFocus />
        </label>
        <div className="flex gap-[10px] mt-5">
          <button onClick={onClose} className="vg-press cursor-pointer flex-1 bg-card border border-border rounded-[10px] py-[13px] font-medium text-[15.5px] text-muted">Cancel</button>
          <button onClick={() => onSubmit(url)} className="vg-press cursor-pointer flex-1 bg-ink text-white rounded-[10px] py-[13px] font-medium text-[15.5px]">Scan URL</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
