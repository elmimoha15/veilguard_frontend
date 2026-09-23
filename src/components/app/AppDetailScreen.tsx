'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { useApps, findActiveApp, timeAgo, repoDisplay, type App } from '@/lib/hooks';
import { saveApps, upsertApp, aiUsageLabel, getFindings, type BackendFinding, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiFinding } from '@/lib/adapters';
import { scanFailure, startFailure } from '@/lib/scanError';
import { api } from '@/lib/api';
import { GradeHelp } from './GradeHelp';
import { checkUrl, billingHref } from '@/lib/url';
import { Card, SectionLabel, PageHeading, Segmented, PillButton, GradeSquare } from './primitives';
import type { Grade } from './data';
import { RepoPicker } from './RepoPicker';
import FindingsScreen from './FindingsScreen';
import TodoScreen from './TodoScreen';
import GradeExplainer from './GradeExplainer';
import MonitoringScreen from './MonitoringScreen';

/** Worst-first over the raw 5-level severity. */
const sevRank = (s: BackendFinding['severity']) => ({ critical: 5, high: 4, medium: 3, low: 2, info: 1 }[s] ?? 0);

type TabId = 'overview' | 'findings' | 'todo' | 'monitoring';

/**
 * Per-app detail page (route: /app?key=<encoded app.key>). One project seen
 * through both lenses (URL + Deep), with its latest grade, both lens statuses,
 * monitoring config and full scan history. Running a scan happens here.
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';

export default function AppDetailScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { setModal, setActiveSite, setPendingScanId, toast } = useApp();
  const { user, profile } = useAuth();
  const { apps, records, loading } = useApps();
  const paid = isPaid(profile); // deep scan is a Pro feature

  const key = params.get('key');
  const decodedKey = key ? decodeURIComponent(key) : null;
  // A derived app's key is `derived:<label>`; also match on the bare label so a stale
  // link keeps working after the app is promoted to a registry entry (which changes its
  // key), e.g. when the user toggles monitoring or connects a repo.
  const bareKey = decodedKey ? decodedKey.replace(/^derived:/, '') : null;
  // Resolve a specific ?key= by key / host / label / repo (tolerating the derived
  // prefix), falling back to null so a genuinely unknown/deleted key still shows
  // "App not found", never silently the first app. No key → forgiving resolution.
  const app = decodedKey
    ? (apps.find((a) =>
        a.key === decodedKey ||
        a.host === decodedKey || a.host === bareKey ||
        a.labels.includes(decodedKey) || (!!bareKey && a.labels.includes(bareKey)) ||
        (!!bareKey && a.githubRepo === bareKey),
      ) ?? null)
    : findActiveApp(apps, null);

  const [repoOpen, setRepoOpen] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [starting, setStarting] = useState(false); // in-flight guard for scan starts (no duplicate scans)

  // Top open findings for the latest done scan → feeds the Overview grade explainer.
  // Keyed by scan id so a null/changed scan derives to [] without a sync setState.
  const [ov, setOv] = useState<{ id: string; items: UiFinding[] }>({ id: '', items: [] });
  const latestDoneId = app?.latest?.status === 'done' ? app.latest.id : null;
  useEffect(() => {
    if (!latestDoneId) return;
    let cancelled = false;
    getFindings(latestDoneId).then((items) => {
      if (!cancelled) setOv({ id: latestDoneId, items: items.map(toUiFinding).sort((a, b) => sevRank(b.severity) - sevRank(a.severity)) });
    });
    return () => { cancelled = true; };
  }, [latestDoneId]);
  const ovFindings = ov.id === latestDoneId && latestDoneId ? ov.items : [];

  const openResult = (scanId: string) => { if (app) setActiveSite(app.host); router.push(`/scan?scan=${scanId}`); };
  const resume = (scanId: string) => { if (app) setActiveSite(app.host); router.push(`/scanning?scanId=${scanId}`); };
  const afterStart = (scanId: string) => { setPendingScanId(scanId); resume(scanId); };

  // Friendly toast for a failed scan-start (never the raw error; that's logged).
  const startToast = (status: number, data: { error?: string; code?: string }) => {
    if (data.error) console.error('[app detail] scan start failed:', data.error);
    const f = startFailure(status, data);
    const color = f.quota ? '#D97706' : f.tone === 'user' && !f.upsell ? '#E0932F' : '#C23B3F';
    toast(f.message, color);
    if (f.upsell && !paid) router.push(billingHref());
  };

  const runUrl = async () => {
    if (!app || starting) return;
    const target = app.url ?? app.latestUrlScan?.target.value ?? (app.latest?.target.type === 'url' ? app.latest.target.value : '');
    const c = checkUrl(target ?? '');
    if (!c.ok) { setUrlOpen(true); return; }
    setStarting(true);
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { startToast(r.status, r.data); setStarting(false); return; }
    afterStart(r.data.scanId);
  };

  const submitUrlLink = async (raw: string) => {
    if (!app || starting) return;
    const c = checkUrl(raw);
    if (!c.ok) { toast(c.error!, '#E5484D'); return; }
    setStarting(true);
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { startToast(r.status, r.data); setStarting(false); return; }
    if (user) await saveApps(user.uid, upsertApp(records, { url: c.url!, githubRepo: app.githubRepo, name: app.name }));
    setUrlOpen(false);
    afterStart(r.data.scanId);
  };

  const startDeep = async (fullName: string): Promise<boolean> => {
    if (!app || starting) return false;
    setStarting(true);
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) {
      if (r.data.error) console.error('[app detail] deep scan start failed:', r.data.error);
      if (r.status === 409) { toast('Your GitHub connection needs refreshing, reconnect it in Settings, then try again.', '#C23B3F'); setRepoOpen(false); router.push('/settings'); }
      else if (r.status === 502) { toast('We couldn’t verify that repo with GitHub. Give it a moment and try again.', '#C23B3F'); }
      else startToast(r.status, r.data);
      setStarting(false);
      return false;
    }
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
        <div className="py-10 text-center">
          <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3.2a2 2 0 0 1 1.6.8l.9 1.2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-medium text-[18px]">App not found</h2>
          <p className="text-muted text-[15.5px] mt-1 mb-5">It may have been removed. Head back to your apps.</p>
          <button onClick={() => router.push('/apps')} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-6 py-3">Back to My Apps</button>
        </div>
      </div>
    );
  }

  const grade = app.latest?.grade;
  const latest = app.latest;
  const downloadReport = async () => {
    if (!latest) return;
    setReportBusy(true);
    const r = await api.downloadReport(latest.id);
    setReportBusy(false);
    if (!r.ok) toast(r.error || 'Could not generate the report', '#E5484D');
  };
  const c = latest?.counts;
  const warnings = (c?.high ?? 0) + (c?.medium ?? 0) + (c?.low ?? 0);
  const sub = app.url || (app.githubRepo ? `github.com/${repoDisplay(app.githubRepo)}` : app.host);

  // Which tab this hub shows (from ?tab=); Findings/Monitoring are now tabs here
  // rather than separate pages. Switching tabs replaces the URL so back works.
  // Monitoring only makes sense for a repo-connected app, it re-scans the code on
  // new deploys. A URL-only app has nothing to re-pull, so it gets no monitoring.
  // Monitoring only makes sense for a repo-connected app (it re-scans code on
  // each deploy), a URL-only app has nothing to watch, so it gets no Monitoring
  // tab. MonitoringScreen handles the Pro upsell for free users.
  const showMonitoring = !!app?.githubRepo;
  const tab = ((): TabId => {
    const t = params.get('tab');
    if (t === 'monitoring') return showMonitoring ? 'monitoring' : 'overview';
    if (t === 'todo') return latest?.status === 'done' ? 'todo' : 'overview';
    return t === 'findings' ? 'findings' : 'overview';
  })();
  const goTab = (t: string, scanId?: string) =>
    router.replace(`/app?key=${encodeURIComponent(app.key)}&tab=${t}${scanId ? `&scan=${scanId}` : ''}`);

  // Rescan re-runs the SAME lens the app was last scanned with, so the button
  // never dumps the user into the scan chooser. Deep needs its repo, resolve it
  // from the app, the scan's sources, or a `connected:<repo>` target (monitor
  // "Deploy scan"s don't always carry `sources.githubRepo`). Uploads are one-shot
  // (we keep no files) so they must re-pick a folder via the chooser.
  const rescanRepo =
    app.githubRepo ??
    latest?.sources?.githubRepo ??
    (latest?.target?.value?.startsWith('connected:') ? latest.target.value.slice('connected:'.length) : undefined) ??
    (latest?.target?.type === 'repo' ? latest.target.value : undefined);
  const rescan = () => {
    if (starting) return; // guard against a double-click starting two scans
    // Repo / deep scan (either an explicit deep scan or any repo-backed app).
    if (latest?.type === 'deep' || (rescanRepo && latest?.type !== 'upload')) {
      if (!rescanRepo) { toast('Reconnect this repo in Settings to re-scan its code.', '#E0932F'); router.push('/settings'); return; }
      if (!paid) { toast('Deep scan is a Pro feature, upgrade to re-scan your code.', '#E0932F'); router.push(billingHref()); return; }
      void startDeep(rescanRepo);
      return;
    }
    // Upload scan, one-shot; the user has to re-select the folder to re-scan.
    if (latest?.type === 'upload') {
      toast('Re-upload your folder to scan the latest code.', '#E0932F');
      setModal('addApp');
      return;
    }
    // URL scan.
    if (app.url || latest?.target?.type === 'url') { void runUrl(); return; }
    setModal('addApp');
  };

  const critN = c?.critical ?? 0;
  const summary = latest?.status !== 'done'
    ? ''
    : critN > 0
      ? `Fix the ${critN} critical issue${critN === 1 ? '' : 's'} first, those let a stranger reach your data. The rest can wait.`
      : warnings > 0
        ? `No criticals, ${warnings} warning${warnings === 1 ? '' : 's'} to tidy up when you can.`
        : 'Clean scan, nothing urgent right now.';

  const tabOptions: { id: TabId; label: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'findings', label: <span className="inline-flex items-center gap-[7px]">Findings{critN > 0 && <span className="tnum text-[11px] font-medium px-[7px] py-[1px] rounded-[6px]" style={{ background: '#FEF2F2', color: '#DC2626' }}>{critN}</span>}</span> },
    ...(showMonitoring ? [{ id: 'monitoring' as const, label: 'Monitoring' }] : []),
  ];

  return (
    <div className="vg-fade">
      <BackLink onClick={() => router.push('/apps')} />

      {/* Header */}
      <PageHeading
        title={<span className="truncate block max-w-[460px]">{repoDisplay(app.name)}</span>}
        subtitle={<span className="font-mono truncate block max-w-[460px] text-[13px]">{sub}</span>}
        right={
          <div className="flex items-center gap-3 shrink-0">
            {latest?.status === 'done' && (
              <PillButton variant="outline" onClick={downloadReport} disabled={reportBusy} tooltip="PDF report" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}>{reportBusy ? 'Preparing…' : 'Report (PDF)'}</PillButton>
            )}
            <GradeHelp />
            <GradeSquare grade={grade as Grade | undefined} size={42} />
          </div>
        }
      />

      {/* Segmented tabs, with "What to do" as a separate button beside them. */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Segmented options={tabOptions} value={tab} onChange={(t) => goTab(t)} />
        {latest?.status === 'done' && (
          <PillButton
            variant={tab === 'todo' ? 'primary' : 'outline'}
            onClick={() => goTab('todo', latest.id)}
            aria-pressed={tab === 'todo'}
            tooltip="Your prioritized checklist"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          >
            What to do
          </PillButton>
        )}
      </div>

      {tab === 'overview' && (
      <>
      {/* Latest scan */}
      {latest ? (
        <Card flat className="py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <SectionLabel>Latest scan</SectionLabel>
              <div className="text-[19px] font-medium mt-[8px]">
                {latest.status === 'done'
                  ? `${critN} critical · ${warnings} warnings · ${c?.passed ?? 0} passed`
                  : latest.status === 'error'
                    ? scanFailure(latest).title
                    : isRunning(latest) ? 'Scanning…' : 'Queued…'}
              </div>
            </div>
            {latest.status === 'done' && (
              <span className="flex flex-col items-center shrink-0">
                <GradeSquare grade={grade as Grade | undefined} size={44} />
                <span className="font-mono text-[10.5px] mt-[5px]" style={{ letterSpacing: '0.06em', color: '#A3A3A3' }}>GRADE</span>
              </span>
            )}
          </div>
          {summary && <p className="text-[13.5px] mt-[7px] leading-[1.55] max-w-[62ch]" style={{ color: '#737373' }}>{summary}</p>}
          {aiUsageLabel(latest.aiUsage) && <p className="font-mono text-[11.5px] mt-[6px]" style={{ color: '#A3A3A3' }}>{aiUsageLabel(latest.aiUsage)}</p>}
          <div className="flex items-center gap-[10px] mt-5 flex-wrap">
            {latest.status === 'error' ? (
              <PillButton onClick={() => openResult(latest.id)}>See what happened</PillButton>
            ) : (
              <PillButton onClick={() => goTab('findings', latest.id)} tooltip="See every issue" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}>View findings</PillButton>
            )}
            <PillButton variant="outline" onClick={rescan} disabled={starting} tooltip="Re-scan now" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}>{starting ? 'Starting…' : latest.status === 'error' ? 'Try again' : 'Re-scan'}</PillButton>
          </div>
        </Card>
      ) : (
        <Card flat className="py-10 text-center">
          <p className="text-[14px] mb-4" style={{ color: '#737373' }}>No scans yet for this app.</p>
          <PillButton onClick={() => setModal('addApp')}>Run a scan</PillButton>
        </Card>
      )}

      {/* Why you got this grade (real passes + what needs attention). */}
      {latest?.status === 'done' && (
        <GradeExplainer
          grade={grade as Grade | undefined}
          critical={critN}
          warnings={warnings}
          passed={latest.passed}
          attention={ovFindings.slice(0, 5)}
          paid={paid}
          onViewFix={(f) => router.push(`/finding?scan=${latest.id}&id=${f.id}`)}
          onSeeAll={() => goTab('todo', latest.id)}
          onUpgrade={() => router.push(billingHref())}
        />
      )}

      {/* Scan history */}
      <Card flat className="py-7 border-t border-border">
        <h2 className="text-[16px] font-medium pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>Scan history</h2>
        {app.scans.length === 0 ? (
          <div className="text-[14px] pt-4" style={{ color: '#A3A3A3' }}>No scans recorded yet.</div>
        ) : (
          <div>
            {app.scans.map((s, i) => {
              const lens = s.type === 'deep' ? 'Deploy' : s.type === 'upload' ? 'Upload' : 'Manual';
              const running = isRunning(s);
              return (
                <button
                  key={s.id}
                  onClick={() => (running ? resume(s.id) : openResult(s.id))}
                  className="vg-row cursor-pointer flex items-center gap-3 w-full py-[14px] text-left"
                  style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-medium">{lens} scan</span>
                    <span className="block font-mono text-[11.5px] mt-[2px] tnum" style={{ color: '#A3A3A3' }}>{running ? (s.progress?.phase ?? 'scanning…') : s.status === 'error' ? 'Failed' : s.status === 'done' ? 'Complete' : s.status} · {timeAgo(s.createdAt)}</span>
                  </span>
                  <GradeSquare grade={s.grade as Grade | undefined} size={29} />
                </button>
              );
            })}
          </div>
        )}
      </Card>
      </>
      )}

      {tab === 'findings' && <FindingsScreen app={app} initialScanId={params.get('scan')} onWhatToDo={() => goTab('todo', params.get('scan') ?? latest?.id)} />}
      {tab === 'todo' && <TodoScreen app={app} initialScanId={params.get('scan')} />}
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
    <button onClick={onClick} className="vg-press cursor-pointer inline-flex items-center gap-[5px] font-medium text-[13.5px] mb-4 hover:text-ink transition-colors" style={{ color: '#737373' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      My apps
    </button>
  );
}

function UrlLinkModal({ app, onClose, onSubmit }: { app: App; onClose: () => void; onSubmit: (raw: string) => void | Promise<void> }) {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (submitting || !url.trim()) return;
    setSubmitting(true);
    await onSubmit(url);
    setSubmitting(false); // reset if the submit failed and the modal stayed open
  };
  if (typeof document === 'undefined') return null;
  // Portal to <body> so this fixed overlay escapes the `vg-fade` transform on the
  // page root (which would otherwise become its containing block).
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(10,10,10,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[12px] p-7 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
        <h2 className="font-medium text-[19px] tracking-[-0.02em] mb-[6px]">Add a URL scan</h2>
        <p className="text-[14px] text-muted mb-[18px]">Add the live URL for <span className="font-medium">{repoDisplay(app.name)}</span> to also grade it from the outside.</p>
        <label className="flex items-center gap-[9px] bg-bg-soft border border-border rounded-[10px] px-[13px] min-h-[46px] focus-within:shadow-[0_0_0_2px_#0A0A0A] transition-shadow">
          <span className="font-mono text-tertiary text-[14px]">https://</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="your-app.com" aria-label="App URL" style={{ outline: 'none' }} className="flex-1 border-0 outline-none bg-transparent text-[15px] min-w-0" autoFocus />
        </label>
        <div className="flex gap-[10px] mt-5">
          <button onClick={onClose} className="vg-press vg-card cursor-pointer flex-1 bg-white border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted">Cancel</button>
          <button onClick={submit} disabled={submitting} className="vg-press cursor-pointer flex-1 bg-ink text-white rounded-[10px] py-[12px] font-medium text-[15px] disabled:opacity-60 disabled:cursor-default">{submitting ? 'Starting…' : 'Scan URL'}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
