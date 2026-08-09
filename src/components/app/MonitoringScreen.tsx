'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import { useMonitorEvents, GRADE_TINT, scanLabel, repoDisplay, type App } from '@/lib/hooks';
import { setAppMonitoring, type Cadence, type AppMonitoring, type ScanDoc, type AppRecord } from '@/lib/scans';
import { api } from '@/lib/api';
import { Toggle } from './ui';
import { Card, SectionLabel } from './primitives';
import { RepoPicker } from './RepoPicker';

/** Coarse relative time from an ISO timestamp — no external date lib. */
function ago(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

/**
 * Monitoring config for ONE app — rendered as a tab inside the app hub. The app
 * (and the registry records needed to persist) are passed in; no app-switcher.
 */
export default function MonitoringScreen({ app, records }: { app: App; records: AppRecord[] }) {
  const { setPendingScanId, toast } = useApp();
  const { user, profile } = useAuth();
  const router = useRouter();
  const paid = isPaid(profile); // monitoring is a Pro feature
  const { events } = useMonitorEvents();

  const active = app;
  const mon: AppMonitoring = active.monitoring ?? { cadence: 'off', emailAlerts: true };
  const [busy, setBusy] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  // A brand-new app shows a "Configure" CTA first; options appear once the user
  // has ever saved a config (app.monitoring exists) or clicks Configure.
  const [configuring, setConfiguring] = useState(false);
  const hasConfig = !!active.monitoring;
  const hasRepo = !!active.githubRepo;
  const startConfigure = () => {
    if (!paid) { toast('Monitoring is a Pro feature — upgrade to enable auto re-scans.', '#E0932F'); router.push(billingHref()); return; }
    setConfiguring(true);
  };

  // Attach/scan a repo so an app becomes push-monitorable (same flow as the New-scan chooser).
  const startDeep = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5484D'); return false; }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    router.push(`/scanning?scanId=${r.data.scanId}`);
    return true;
  };
  const openRepoPicker = () => {
    if (!paid) { toast('Monitoring is a Pro feature — upgrade to enable auto re-scans.', '#E0932F'); router.push(billingHref()); return; }
    setRepoOpen(true);
  };

  // Returns whether the write actually persisted, so callers only toast success
  // on success. On failure we surface the real error (e.g. backend unreachable)
  // instead of a generic message.
  const save = async (patch: Partial<AppMonitoring>): Promise<boolean> => {
    if (!active || !user) return false;
    setBusy(true);
    try {
      await setAppMonitoring(user.uid, records, { url: active.url, githubRepo: active.githubRepo, name: active.name }, { ...mon, ...patch });
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save — try again', '#E5484D');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const pickCadence = async (c: Cadence) => {
    if (!paid) { toast('Monitoring is a Pro feature — upgrade to enable auto re-scans.', '#E0932F'); router.push(billingHref()); return; }
    if (c === 'push' && !active?.githubRepo) { toast('Connect a repo to scan on every push', '#E0932F'); return; }
    const ok = await save({ cadence: c });
    if (ok) toast(c === 'off' ? 'Monitoring turned off' : 'Monitoring schedule saved', '#1F9D57');
  };

  const history: ScanDoc[] = active?.scans ?? [];
  const appEvents = active ? events.filter((e) => e.appId === active.key) : [];

  return (
    <div className="vg-fade">
      {!(hasConfig || configuring) ? (
        /* Never configured → a minimal, box-less prompt centered on the page. */
        <div className="text-center max-w-[520px] mx-auto">
          <h2 className="font-semibold text-[20px] tracking-[-0.02em]">Set up monitoring</h2>
          <p className="text-muted text-[15px] mt-2 leading-[1.55]">We’ll automatically re-scan {repoDisplay(active.name)} and alert you the moment a new hole appears — you only hear from us when something changes.</p>
          <button onClick={startConfigure} className="cursor-pointer mt-4 inline-flex items-center gap-[6px] text-ink font-semibold text-[15px] hover:opacity-70 transition-opacity">
            Configure monitoring
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      ) : (
        <>
          {!paid && (
            <div className="rounded-[12px] p-4 mb-4 flex items-center gap-3" style={{ background: 'rgba(243,197,0,.12)', border: '1px solid rgba(243,197,0,.4)' }}>
              <span className="shrink-0" style={{ color: '#8a6d00' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px]">Monitoring is a Pro feature</div>
                <div className="text-[13.5px] text-muted">Upgrade to auto re-scan this app and get alerted when a new hole appears.</div>
              </div>
              <button onClick={() => router.push(billingHref())} className="vg-press cursor-pointer shrink-0 rounded-[10px] px-[14px] py-2 text-[14px] font-medium bg-ink text-white">Upgrade</button>
            </div>
          )}

          {/* Schedule + email — clean toggles */}
          <Card className="p-5" style={{ opacity: paid ? (busy ? 0.7 : 1) : 0.6 }}>
            <SectionLabel>Automatic re-scans</SectionLabel>
            <div className="mt-2">
              <div className="flex items-start justify-between gap-4 py-[14px]">
                <div className="min-w-0">
                  <div className="font-semibold text-[15px]">Re-scan after every deploy</div>
                  <div className="text-[13.5px] text-muted mt-[2px]">
                    {hasRepo
                      ? 'We re-scan on each push — catches regressions the moment they ship.'
                      : <>Connect a repo to watch this app on every deploy. <button onClick={openRepoPicker} className="cursor-pointer text-ink font-semibold underline">Connect a repo</button></>}
                  </div>
                </div>
                <Toggle on={mon.cadence === 'push'} onClick={() => void pickCadence(mon.cadence === 'push' ? 'off' : 'push')} label="Auto re-scan" />
              </div>
              <div className="flex items-start justify-between gap-4 py-[14px]" style={{ borderTop: '1px solid var(--color-hairline)' }}>
                <div className="min-w-0">
                  <div className="font-semibold text-[15px]">Email me when a new issue appears</div>
                  <div className="text-[13.5px] text-muted mt-[2px]">We stay silent when nothing changes — you only hear from us when it matters.</div>
                </div>
                <Toggle on={mon.emailAlerts} onClick={() => void save({ emailAlerts: !mon.emailAlerts })} label="Email alerts" />
              </div>
            </div>
          </Card>

          {/* Alerts + timeline */}
          <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-4 mt-4">
            <Card className="p-5">
              <SectionLabel>Alerts</SectionLabel>
              {appEvents.length === 0 ? (
                <div className="text-[14px] text-muted mt-3">No alerts yet. When an automatic scan finds a new issue, it shows up here.</div>
              ) : (
                <div className="flex flex-col mt-2">
                  {appEvents.slice(0, 8).map((e, i) => {
                    const drop = e.gradeBefore && e.gradeAfter && e.gradeBefore !== e.gradeAfter;
                    const top = e.newFindings[0];
                    const clean = e.newFindings.length === 0;
                    return (
                      <div key={e.id} className="flex gap-[10px] py-[13px]" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                        <span className="shrink-0 mt-[5px] w-2 h-2 rounded-full" style={{ background: clean ? '#1F9D57' : '#E5484D' }} />
                        <div className="flex-1 min-w-0">
                          {clean ? (
                            <div className="text-[14.5px] leading-[1.45]">Re-scanned — no new issues.</div>
                          ) : (
                            <div className="text-[14.5px] font-semibold leading-[1.45]">
                              {e.newFindings.length} new {e.newFindings.length === 1 ? 'issue' : 'issues'}{top ? ` · ${top.title}` : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[12px] font-mono text-faint mt-[3px]">
                            <span>{ago(e.createdAt)}</span>
                            {drop && (
                              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: '#E5484D' }}>
                                grade {e.gradeBefore}
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                {e.gradeAfter}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <SectionLabel>Scan timeline</SectionLabel>
              {history.length === 0 ? (
                <div className="text-[14px] text-muted mt-3">No scans yet.</div>
              ) : (
                <div className="flex flex-col mt-2">
                  {history.slice(0, 10).map((s, i, arr) => {
                    const tint = s.grade ? GRADE_TINT[s.grade] : { bg: '#F2F2EF', fg: '#9B9B96' };
                    const title = i === arr.length - 1 ? 'First scan' : s.origin === 'monitor' ? 'Auto re-scan' : s.type === 'deep' ? 'Deep scan' : 'Re-scan';
                    return (
                      <div key={s.id} className="flex gap-[14px]">
                        <div className="flex flex-col items-center">
                          <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-semibold text-[15px] tnum" style={{ background: tint.bg, color: tint.fg }}>{s.grade ?? '…'}</span>
                          {i < arr.length - 1 && <span className="flex-1 w-[2px] bg-border my-[2px]" />}
                        </div>
                        <div className="pb-4 min-w-0">
                          <div className="font-semibold text-[15px] truncate">{title} — {repoDisplay(scanLabel(s))}</div>
                          <div className="font-mono text-[12.5px] text-faint mt-[2px]">{ago(s.createdAt)} · {s.status === 'done' ? `${s.counts?.critical ?? 0} critical` : s.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {repoOpen && (
        <RepoPicker onClose={() => setRepoOpen(false)} onScan={startDeep} onNeedsConnect={() => { setRepoOpen(false); router.push('/settings'); }} />
      )}
    </div>
  );
}
