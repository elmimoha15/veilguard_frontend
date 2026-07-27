'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { useApps, findActiveApp, useMonitorEvents, appKind, GRADE_TINT, scanLabel } from '@/lib/hooks';
import { setAppMonitoring, type Cadence, type AppMonitoring, type ScanDoc } from '@/lib/scans';
import { api } from '@/lib/api';
import { Toggle } from './ui';
import { AppSelect } from './AppSelect';
import { RepoPicker } from './RepoPicker';
import { GitHubIcon } from '@/components/ui/BrandIcons';

// Only change-driven cadences: we re-scan when the code actually changes (a
// push), not on a timer against an unchanged repo. 'off' = manual only.
const CADENCES: { value: Cadence; label: string; hint: string; repoOnly?: boolean }[] = [
  { value: 'off', label: 'Off', hint: 'Only scan when I run it manually.' },
  { value: 'push', label: 'After every push', hint: 'Re-scan on each deploy — catches regressions the moment they ship.', repoOnly: true },
];

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

export default function MonitoringScreen() {
  const { activeSite, setActiveSite, setPendingScanId, toast } = useApp();
  const { user, profile } = useAuth();
  const router = useRouter();
  const paid = isPaid(profile); // monitoring is a Pro feature
  const { apps, records, loading } = useApps();
  const { events } = useMonitorEvents();

  const active = findActiveApp(apps, activeSite);
  const mon: AppMonitoring = active?.monitoring ?? { cadence: 'off', emailAlerts: true };
  // The one recommended cadence: re-scan on every push (needs a connected repo).
  const recommended: Cadence = 'push';
  const [busy, setBusy] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);

  // Attach/scan a repo so an app becomes push-monitorable (same flow as the New-scan chooser).
  const startDeep = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5352B'); return false; }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    router.push(`/scanning?scanId=${r.data.scanId}`);
    return true;
  };
  const openRepoPicker = () => {
    if (!paid) { toast('Monitoring is a Pro feature — upgrade to enable auto re-scans.', '#F2851F'); router.push('/billing'); return; }
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
      toast(e instanceof Error ? e.message : 'Could not save — try again', '#E5352B');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const pickCadence = async (c: Cadence) => {
    if (!paid) { toast('Monitoring is a Pro feature — upgrade to enable auto re-scans.', '#F2851F'); router.push('/billing'); return; }
    if (c === 'push' && !active?.githubRepo) { toast('Connect a repo to scan on every push', '#F2851F'); return; }
    const ok = await save({ cadence: c });
    if (ok) toast(c === 'off' ? 'Monitoring turned off' : 'Monitoring schedule saved', '#1FB86B');
  };

  const history: ScanDoc[] = active?.scans ?? [];
  const appEvents = active ? events.filter((e) => e.appId === active.key) : [];

  return (
    <div className="vg-fade">
      <h1 className="font-extrabold text-[28px] tracking-[-0.02em] mb-1">Monitoring &amp; alerts</h1>
      <p className="text-muted mb-4 text-[15px]">Pick an app to watch — we re-scan it automatically and alert you when a new hole appears.</p>

      {!loading && apps.length > 0 && active && (
        <div className="flex items-center gap-[10px] flex-wrap mb-5">
          <AppSelect apps={apps} activeKey={active.key} onSelect={(a) => setActiveSite(a.key)} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 min-[820px]:grid-cols-[1.4fr_1fr] gap-4">
          <div className="vg-skel h-[280px] rounded-[20px]" />
          <div className="vg-skel h-[280px] rounded-[20px]" />
        </div>
      ) : !active ? (
        <div className="bg-card border border-border-2 rounded-[20px] p-10 text-center">
          <div className="text-[40px] mb-2">📡</div>
          <h2 className="font-extrabold text-[20px]">Nothing to monitor yet</h2>
          <p className="text-muted text-[14.5px] mt-1">Scan an app first, then choose how often we re-check it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[820px]:grid-cols-[1.4fr_1fr] gap-4">
          {/* ── schedule + alert prefs ── */}
          <div className="flex flex-col gap-4">
            {!paid && (
              <div className="rounded-[16px] p-4 flex items-center gap-3" style={{ background: 'rgba(243,197,0,.12)', border: '1px solid rgba(243,197,0,.4)' }}>
                <span className="text-[20px]">🔒</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px]">Monitoring is a Pro feature</div>
                  <div className="text-[12.5px] text-muted">Upgrade to auto re-scan this app and get alerted when a new hole appears.</div>
                </div>
                <button onClick={() => router.push('/billing')} className="vg-press shrink-0 rounded-[10px] px-[14px] py-2 text-[13px] font-bold" style={{ background: '#F3C500', color: '#1E1D1B' }}>Upgrade</button>
              </div>
            )}
            <div className="bg-card border border-border-2 rounded-[20px] p-[22px]" style={{ opacity: paid ? 1 : 0.6 }}>
              <div className="font-bold text-[15px] mb-1">When should we re-scan {active.name}?</div>
              <p className="text-[13px] text-muted mb-4">Every automatic scan saves to this app just like a manual one, and alerts you if a new hole appears.</p>
              <div className="flex flex-col gap-[10px]">
                {CADENCES.map((c) => {
                  const on = mon.cadence === c.value;
                  const disabled = !!c.repoOnly && !active.githubRepo;
                  return (
                    <button
                      key={c.value}
                      onClick={() => void pickCadence(c.value)}
                      disabled={busy || disabled || !paid}
                      className="vg-press text-left rounded-[13px] p-[14px] border-2 flex items-start gap-3 disabled:opacity-55"
                      style={{ background: on ? '#FFF7D6' : '#fff', borderColor: on ? '#F3C500' : '#E4E3DE' }}
                    >
                      <span className="shrink-0 mt-[2px] w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center" style={{ borderColor: on ? '#F3C500' : '#cfceca' }}>
                        {on && <span className="w-[9px] h-[9px] rounded-full bg-yellow" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2 font-bold text-[14.5px]">
                          {c.label}
                          {c.value === recommended && <span className="text-[10px] font-bold px-[8px] py-[2px] rounded-full" style={{ background: 'rgba(31,184,107,.16)', color: '#158a4f' }}>VEILGUARD RECOMMENDED</span>}
                        </span>
                        <span className="block text-[12.5px] text-muted mt-[2px]">{disabled ? 'Connect a repo (Deep scan) to enable push-triggered scans.' : c.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {appKind(active) === 'URL' && (
                <div className="mt-3 text-[12.5px] text-muted">
                  This app has no connected repo, so push monitoring isn’t available.{' '}
                  <button onClick={openRepoPicker} className="text-yellow-dark font-semibold underline">Connect a repo</button> to watch it on every deploy.
                </div>
              )}
              {appKind(active) === 'Upload' && (
                <div className="mt-3 text-[12.5px] text-muted">Uploaded folders are one-shot — re-upload from “New scan” to re-check, or <button onClick={openRepoPicker} className="text-yellow-dark font-semibold underline">connect a repo</button> to monitor continuously.</div>
              )}
            </div>

            <div className="bg-card border border-border-2 rounded-[20px] p-[22px]">
              <div className="flex items-center justify-between py-[4px]">
                <div>
                  <div className="font-bold text-[14.5px]">Email me when a new issue appears</div>
                  <div className="text-[12.5px] text-muted mt-[2px]">We stay silent when nothing changes — you only hear from us when it matters.</div>
                </div>
                <Toggle on={mon.emailAlerts} onClick={() => void save({ emailAlerts: !mon.emailAlerts })} label="Email alerts" />
              </div>
            </div>
          </div>

          {/* ── alerts feed + timeline ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-card border border-border-2 rounded-[20px] p-[22px]">
              <div className="font-bold text-[15px] mb-3">Alerts</div>
              {appEvents.length === 0 ? (
                <div className="text-[13.5px] text-muted py-2">No alerts yet. When an automatic scan finds a new issue, it shows up here. 🎉</div>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {appEvents.slice(0, 8).map((e) => {
                    const drop = e.gradeBefore && e.gradeAfter && e.gradeBefore !== e.gradeAfter;
                    const top = e.newFindings[0];
                    const clean = e.newFindings.length === 0;
                    return (
                      <div key={e.id} className="p-[12px] rounded-xl" style={{ background: clean ? 'rgba(31,184,107,.07)' : 'rgba(229,53,43,.07)' }}>
                        <div className="flex items-center gap-2 text-[12px] font-mono text-faint">
                          <span>{ago(e.createdAt)}</span>
                          {drop && <span className="font-bold" style={{ color: '#E5352B' }}>grade {e.gradeBefore} → {e.gradeAfter}</span>}
                        </div>
                        {clean ? (
                          <div className="text-[13.5px] mt-[3px]">Re-scanned — no new issues.</div>
                        ) : (
                          <div className="text-[13.5px] font-semibold mt-[3px]">
                            {e.newFindings.length} new {e.newFindings.length === 1 ? 'issue' : 'issues'}{top ? ` · ${top.title}` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card border border-border-2 rounded-[20px] p-[22px]">
              <div className="font-bold text-[15px] mb-4">Scan timeline</div>
              {history.length === 0 ? (
                <div className="text-[13.5px] text-muted py-2">No scans yet.</div>
              ) : (
                <div className="flex flex-col">
                  {history.slice(0, 10).map((s, i, arr) => {
                    const tint = s.grade ? GRADE_TINT[s.grade] : { bg: 'rgba(0,0,0,.05)', fg: '#9a9a95' };
                    const title = i === arr.length - 1 ? 'First scan' : s.origin === 'monitor' ? 'Auto re-scan' : s.type === 'deep' ? 'Deep scan' : 'Re-scan';
                    return (
                      <div key={s.id} className="flex gap-[14px]">
                        <div className="flex flex-col items-center">
                          <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-extrabold text-[14px]" style={{ background: tint.bg, color: tint.fg }}>{s.grade ?? '…'}</span>
                          {i < arr.length - 1 && <span className="flex-1 w-[2px] bg-border-2 my-[2px]" />}
                        </div>
                        <div className="pb-4 min-w-0">
                          <div className="font-semibold text-[14px] truncate">{title} — {scanLabel(s)}</div>
                          <div className="font-mono text-[11.5px] text-faint mt-[2px]">{ago(s.createdAt)} · {s.status === 'done' ? `${s.counts?.critical ?? 0} critical` : s.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wide action at the very bottom: scan/attach a repo to monitor on every push. */}
      {!loading && (
        <button onClick={openRepoPicker} className="vg-press w-full mt-4 bg-ink text-white font-bold text-[15px] rounded-[14px] py-[16px] inline-flex items-center justify-center gap-2">
          <GitHubIcon size={18} /> Monitor a repo
        </button>
      )}

      {repoOpen && (
        <RepoPicker onClose={() => setRepoOpen(false)} onScan={startDeep} onNeedsConnect={() => { setRepoOpen(false); router.push('/settings'); }} />
      )}
    </div>
  );
}
