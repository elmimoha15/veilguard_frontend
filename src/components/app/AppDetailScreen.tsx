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

/**
 * Per-app detail page (route: /app?key=<encoded app.key>). One project seen
 * through both lenses (URL + Deep), with its latest grade, both lens statuses,
 * monitoring config and full scan history. Running a scan happens here (the
 * actions moved off the Apps list, which is now just a list of links).
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';
const isDone = (s?: ScanDoc | null): boolean => s?.status === 'done';

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

  // Tapping a lens: resume if running, reveal result if done, else start it.
  const openLens = (scan: ScanDoc | null, start: () => void) => {
    if (isRunning(scan)) return resume(scan!.id);
    if (isDone(scan)) return openResult(scan!.id);
    start();
  };

  const runUrl = async () => {
    if (!app) return;
    const c = checkUrl(app.url ?? '');
    if (!c.ok) { setUrlOpen(true); return; }
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start scan', '#E5352B'); return; }
    afterStart(r.data.scanId);
  };

  const submitUrlLink = async (raw: string) => {
    if (!app) return;
    const c = checkUrl(raw);
    if (!c.ok) { toast(c.error!, '#E5352B'); return; }
    const r = await api.createScan(c.url!);
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start scan', '#E5352B'); return; }
    if (user) await saveApps(user.uid, upsertApp(records, { url: c.url!, githubRepo: app.githubRepo, name: app.name }));
    setUrlOpen(false);
    afterStart(r.data.scanId);
  };

  const startDeep = async (fullName: string): Promise<boolean> => {
    if (!app) return false;
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5352B'); return false; }
    if (user) await saveApps(user.uid, upsertApp(records, { url: app.url, githubRepo: fullName, name: app.name }));
    setRepoOpen(false);
    afterStart(r.data.scanId);
    return true;
  };

  if (loading) return <div className="vg-skel h-[400px] rounded-[20px]" />;

  if (!app) {
    return (
      <div className="vg-fade">
        <BackLink onClick={() => router.push('/apps')} />
        <div className="bg-card border border-border-2 rounded-[20px] p-10 text-center">
          <div className="text-[40px] mb-2">🗂️</div>
          <h2 className="font-extrabold text-[20px]">App not found</h2>
          <p className="text-muted text-[14.5px] mt-1 mb-5">It may have been removed. Head back to your apps.</p>
          <button onClick={() => router.push('/apps')} className="vg-press bg-yellow text-ink font-bold rounded-[11px] px-6 py-3">Back to My Apps →</button>
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

  return (
    <div className="vg-fade">
      <BackLink onClick={() => router.push('/apps')} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="font-extrabold text-[28px] tracking-[-0.02em] m-0 truncate">{app.name}</h1>
          <p className="text-muted mt-[6px] text-[14.5px] font-mono truncate max-w-[420px]">{sub}</p>
        </div>
        <span className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-[24px]" style={{ background: grade ? GRADE_TINT[grade].bg : 'rgba(0,0,0,.05)', color: grade ? GRADE_TINT[grade].fg : '#9a9a95' }}>{grade ?? '…'}</span>
      </div>

      {/* Latest-scan summary */}
      {latest ? (
        <button onClick={() => { setActiveSite(app.host); router.push(`/findings?scan=${latest.id}`); }} className="w-full text-left vg-lift bg-ink rounded-[20px] p-[26px] flex items-center gap-[22px] flex-wrap">
          <GradeRing size={112} pct={gradePct(grade)} color={grade ? GRADE_COLOR[grade] : '#8a8a85'} strokeWidth={9}>
            <span className="font-extrabold text-[46px]" style={{ color: grade ? GRADE_COLOR[grade] : '#8a8a85' }}>{grade ?? '…'}</span>
          </GradeRing>
          <div className="min-w-0">
            <div className="font-mono text-[11px] tracking-[0.12em]" style={{ color: grade ? GRADE_COLOR[grade] : '#8a8a85' }}>LATEST SCAN · {timeAgo(latest.createdAt)}</div>
            <div className="text-[15px] text-white font-semibold mt-1">
              {latest.status === 'done' ? `${c?.critical ?? 0} critical · ${warnings} warnings · ${c?.passed ?? 0} passed` : latest.status}
            </div>
            <div className="text-[13px] text-white/55 mt-[8px]">View all findings →</div>
          </div>
        </button>
      ) : (
        <div className="bg-card border border-border-2 rounded-[20px] p-8 text-center">
          <p className="text-muted text-[14.5px] mb-4">No scans yet for this app. Run one below.</p>
        </div>
      )}

      {/* Two lens cards */}
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-4 mt-4">
        <LensCard
          title="URL scan"
          hint="Outside-in — what an attacker sees"
          accent="ink"
          scan={app.latestUrlScan}
          onClick={() => openLens(app.latestUrlScan, runUrl)}
        />
        <LensCard
          title="Deep scan"
          hint="Inside-out — your code + database"
          accent="yellow"
          scan={app.latestDeepScan}
          onClick={() => openLens(app.latestDeepScan, () => {
            if (!paid) { toast('Deep scan is a Pro feature — upgrade to scan your code.', '#F2851F'); router.push('/billing'); return; }
            setRepoOpen(true);
          })}
        />
      </div>

      {/* Monitoring summary */}
      <button onClick={() => { setActiveSite(app.host); router.push('/monitoring'); }} className="w-full text-left vg-lift bg-card border border-border-2 rounded-[18px] p-5 mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[15px]">Monitoring</div>
          <div className="text-[13px] text-muted mt-[3px]">
            {cadence === 'off' ? 'Off — not automatically re-scanned' : `Auto re-scan ${cadence}${app.monitoring?.emailAlerts ? ' · email alerts on' : ''}`}
          </div>
        </div>
        <span className="shrink-0 text-[13px] font-bold text-yellow-dark">Configure →</span>
      </button>

      {/* Scan history */}
      <div className="bg-card border border-border-2 rounded-[20px] p-[22px] mt-4">
        <div className="font-bold text-[15px] mb-[14px]">Scan history</div>
        {app.scans.length === 0 ? (
          <div className="text-[13.5px] text-muted">No scans recorded yet.</div>
        ) : (
          <div className="flex flex-col">
            {app.scans.map((s, i) => {
              const lens = s.type === 'deep' ? 'Deep' : s.type === 'upload' ? 'Upload' : 'URL';
              const running = isRunning(s);
              return (
                <button
                  key={s.id}
                  onClick={() => (running ? resume(s.id) : openResult(s.id))}
                  className="flex items-center gap-3 py-[13px] text-left"
                  style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-border-2)' }}
                >
                  <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: s.grade ? GRADE_TINT[s.grade].fg : '#9a9a95' }} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold">{lens} scan</span>
                    <span className="block font-mono text-[11px] text-faint mt-[2px]">{running ? (s.progress?.phase ?? 'scanning…') : s.status} · {timeAgo(s.createdAt)}</span>
                  </span>
                  {s.grade && <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-extrabold text-[14px]" style={{ background: GRADE_TINT[s.grade].bg, color: GRADE_TINT[s.grade].fg }}>{s.grade}</span>}
                  <span className="text-faint text-[15px]">›</span>
                </button>
              );
            })}
          </div>
        )}
        <button onClick={() => setModal('addApp')} className="vg-press w-full mt-4 bg-bg-soft border border-border-2 rounded-[11px] py-[11px] font-bold text-[13.5px] text-muted">＋ New scan</button>
      </div>

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
  return <button onClick={onClick} className="vg-press bg-none text-label font-semibold text-[14px] mb-5 hover:text-ink transition-colors">← Back to My Apps</button>;
}

function LensCard({ title, hint, accent, scan, onClick }: { title: string; hint: string; accent: 'ink' | 'yellow'; scan: ScanDoc | null; onClick: () => void }) {
  const running = isRunning(scan);
  const done = isDone(scan);
  const grade = done ? scan!.grade : undefined;
  const p = scan?.progress;
  const pct = p && p.total > 0 ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;
  const cta = running ? 'Resume →' : done ? 'View result →' : 'Run scan →';
  const btnClass = accent === 'ink' ? 'bg-ink text-white' : 'bg-yellow text-ink';

  return (
    <div className="bg-card border border-border-2 rounded-[18px] p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-bold text-[15px]">{title}</div>
          <div className="text-[12.5px] text-muted mt-[2px]">{hint}</div>
        </div>
        {grade && <span className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[16px]" style={{ background: GRADE_TINT[grade].bg, color: GRADE_TINT[grade].fg }}>{grade}</span>}
      </div>

      {running ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] mb-[6px]">
            <span className="font-bold text-yellow-dark">{pct > 0 ? `Scanning… ${pct}%` : 'Scanning…'}</span>
            <span className="font-mono text-faint truncate max-w-[45%] text-right">{p?.phase ?? 'starting'}</span>
          </div>
          {pct > 0 ? (
            <div className="h-[6px] bg-border-2 rounded-full overflow-hidden">
              <div className="h-full bg-yellow rounded-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
          ) : (
            <div className="vg-skel h-[6px] rounded-full" />
          )}
        </div>
      ) : (
        <button onClick={onClick} className={`vg-press mt-4 w-full rounded-[11px] py-[11px] font-bold text-[13.5px] ${btnClass}`}>{cta}</button>
      )}
    </div>
  );
}

function UrlLinkModal({ app, onClose, onSubmit }: { app: App; onClose: () => void; onSubmit: (raw: string) => void }) {
  const [url, setUrl] = useState('');
  if (typeof document === 'undefined') return null;
  // Portal to <body> so this fixed overlay escapes the `vg-fade` transform on the
  // page root (which would otherwise become its containing block).
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(30,29,27,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[20px] p-7 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
        <h2 className="font-extrabold text-[22px] tracking-[-0.02em] mb-[6px]">Add a URL scan</h2>
        <p className="text-[14.5px] text-muted mb-[18px]">Add the live URL for <span className="font-semibold">{app.name}</span> to also grade it from the outside.</p>
        <label className="flex items-center gap-[9px] bg-bg-soft border-2 border-border-2 rounded-xl px-[15px] min-h-[56px] focus-within:border-yellow">
          <span className="font-mono text-tertiary text-[15px]">https://</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit(url)} placeholder="your-app.com" aria-label="App URL" className="flex-1 border-0 outline-none bg-transparent text-[16px] min-w-0" autoFocus />
        </label>
        <div className="flex gap-[10px] mt-5">
          <button onClick={onClose} className="vg-press flex-1 bg-card border border-border-2 rounded-[11px] py-[13px] font-bold text-[14.5px] text-muted">Cancel</button>
          <button onClick={() => onSubmit(url)} className="vg-press flex-1 bg-yellow text-ink rounded-[11px] py-[13px] font-bold text-[14.5px]">Scan URL →</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
