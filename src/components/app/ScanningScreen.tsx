'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeRing } from './ui';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { subscribeScan, type ScanDoc } from '@/lib/scans';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useOnline } from '@/lib/net';
import { scanFailure, startFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';

// Black-box (URL) vs white-box (deep/repo) phase labels. The deep flow clones
// the repo first, so its first step is honest about that, the user always sees
// something in progress, never a silent freeze.
const URL_PHASES = [
  'Checking HTTPS & headers',
  'Hunting exposed secrets',
  'Testing database rules',
  'Reviewing auth & webhooks',
  'Checking dependencies',
];
const DEEP_PHASES = [
  'Fetching your code',
  'Scanning for exposed secrets',
  'Checking database & auth rules',
  'Reviewing APIs & webhooks',
  'Checking dependencies & config',
];

const UPLOAD_PHASES = [
  'Unpacking your upload',
  'Scanning for exposed secrets',
  'Checking database & auth rules',
  'Reviewing APIs & webhooks',
  'Checking dependencies & config',
];

export default function ScanningScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scanId');
  const flow = params.get('flow');
  const { user, loading } = useAuth();
  const { setActiveSite, toast } = useApp();
  const online = useOnline();

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [display, setDisplay] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [stalled, setStalled] = useState(false);
  const missing = !scanId;

  useEffect(() => {
    if (!scanId) return;
    return subscribeScan(scanId, setScan);
  }, [scanId]);

  // Re-run the SAME scan and hand off to the fresh run. URL/deep can re-create
  // from the stored target; an upload has no file to resend, so send the user
  // back to the picker to choose the folder again.
  const retry = async () => {
    if (!scan || retrying) return;
    const kind: ScanKind = scan.type === 'upload' ? 'upload' : scan.type === 'deep' ? 'deep' : 'url';
    if (kind === 'upload') { router.push('/apps'); return; }
    setRetrying(true);
    const res = kind === 'url'
      ? await api.createScan(scan.sources?.url || scan.target.value)
      : await api.createDeepScan({
          github: !!scan.sources?.githubRepo,
          githubRepo: scan.sources?.githubRepo,
          supabase: scan.sources?.supabase,
          url: scan.sources?.url,
        });
    const newId = res.data?.scanId;
    if (res.ok && newId) {
      setStalled(false);
      router.replace(`/scanning?scanId=${newId}${flow ? `&flow=${flow}` : ''}`);
      return;
    }
    const f = startFailure(res.status, res.data || {});
    if (res.data?.error) console.error('[retry] scan start failed:', res.data.error);
    toast(f.message, '#C23B3F');
    setRetrying(false);
  };

  // On completion, branch by flow:
  //  - anonymous OR the onboarding first-scan → public /results (the marketing
  //    reveal with the "go to dashboard" hand-off into the app).
  //  - a signed-in in-app scan → the ONE-TIME in-shell result page, and make the
  //    scanned host the active site so the whole app follows it.
  // Wait a beat after done so the number visibly lands on 100 before we leave.
  useEffect(() => {
    if (loading || scan?.status !== 'done' || !scanId || !scan) return;
    const t = setTimeout(() => {
      if (user && flow !== 'onboarding') {
        setActiveSite(scanLabel(scan));
        router.replace(`/scan?scan=${scanId}`);
      } else {
        router.replace(`/results?scanId=${scanId}`);
      }
    }, 650);
    return () => clearTimeout(t);
  }, [scan?.status, scanId, scan, user, loading, flow, setActiveSite, router]);

  // Smooth, always-moving progress. The worker's real progress arrives in bursts
  // (often nothing for the first seconds of a URL scan), so on its own the number
  // stalls and leaps, which reads as broken. Instead we show a time-based estimate
  // (fast at first, easing toward 92%) blended with real progress, eased every
  // frame so the number keeps ticking up and never goes backwards. It snaps
  // through to 100 on done.
  const realPct = scan?.progress ? Math.min(100, Math.round((scan.progress.done / Math.max(1, scan.progress.total)) * 100)) : 0;
  const finished = scan?.status === 'done';
  const isUpload = scan?.type === 'upload';
  // Deep + upload are both white-box "code" scans (same phase feel + routing).
  const isDeep = scan?.type === 'deep' || isUpload;
  const failed = scan?.status === 'error';
  const createdAt = scan?.createdAt;
  useEffect(() => {
    if (!scanId || failed) return;
    const mountedAt = performance.now();
    const startedMs = createdAt ? Date.parse(createdAt) : NaN;
    // A slow URL site still reaches ~90% by ~30s; code scans take minutes.
    const tau = isDeep ? 90_000 : 10_000;
    let raf = 0;
    let last = performance.now();
    // This effect restarts whenever real progress changes, so "now" here is when
    // the worker last reported. From there keep creeping toward 97 so a long
    // final step never parks the number.
    const realAt = performance.now();
    const realBase = realPct * 0.97;
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const elapsed = Number.isFinite(startedMs) ? Math.max(0, Date.now() - startedMs) : now - mountedAt;
      const estimate = 92 * (1 - Math.exp(-elapsed / tau));
      const fromReal = realBase > 0 ? realBase + (97 - realBase) * (1 - Math.exp(-(now - realAt) / (tau * 0.35))) : 0;
      const target = finished ? 100 : Math.min(97, Math.max(estimate, fromReal));
      setDisplay((d) => {
        if (d >= target) return d;
        // Ease toward the target with a floor speed (never looks frozen) and a
        // ceiling speed (a burst of real progress glides instead of leaping).
        const ease = (target - d) * (finished ? 0.12 : 0.05);
        const floor = (finished ? 0.08 : 0.004) * dt; // %/ms
        const ceiling = (finished ? 0.25 : 0.04) * dt; // 40%/s while running
        return Math.min(target, d + Math.min(ceiling, Math.max(ease, floor)));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scanId, failed, finished, realPct, createdAt, isDeep]);

  // Stuck-running watchdog. A scan that never resolves would spin the ring
  // forever. If it's still queued/running past a generous budget (URL ~2.5 min,
  // code ~16 min), we stop trusting the spinner and resolve the UI to a
  // "taking longer than expected" state with a real Try again, a scan is never
  // left silently stuck. New progress from the worker resets the clock.
  const inFlight = scan?.status === 'queued' || scan?.status === 'running';
  const progressDone = scan?.progress?.done ?? -1;
  useEffect(() => {
    if (!inFlight || !scan?.createdAt) { setStalled(false); return; }
    setStalled(false);
    const budgetMs = isDeep ? 16 * 60_000 : 2.5 * 60_000;
    const startedMs = Date.parse(scan.createdAt);
    const elapsed = Number.isFinite(startedMs) ? Date.now() - startedMs : 0;
    const remaining = budgetMs - elapsed;
    if (remaining <= 0) { setStalled(true); return; }
    const t = setTimeout(() => setStalled(true), remaining);
    return () => clearTimeout(t);
  }, [inFlight, scan?.createdAt, isDeep, progressDone]);

  const pct = Math.round(display);
  const phases = isUpload ? UPLOAD_PHASES : isDeep ? DEEP_PHASES : URL_PHASES;

  // One calm, specific failure card, reused by the error state and the
  // stuck-running watchdog. Never shows a raw error string; always offers a
  // working next action and (when useful) a support escape.
  const failView = (o: {
    title: string; body: string; tone: 'user' | 'ours';
    primaryLabel: string; onPrimary: () => void;
    secondaryLabel?: string; onSecondary?: () => void;
    showSupport: boolean;
  }) => (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center vg-fade">
      <div className="relative max-w-[460px]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={o.tone === 'ours' ? '#5b5a56' : '#C23B3F'} strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
          <path d="M12 3l9 16H3z" strokeLinejoin="round" />
          <path d="M12 10v4" strokeLinecap="round" />
          <circle cx="12" cy="16.8" r="0.7" fill={o.tone === 'ours' ? '#5b5a56' : '#C23B3F'} stroke="none" />
        </svg>
        <h1 className="font-semibold text-[24px] text-ink">{o.title}</h1>
        <p className="text-[15.5px] text-muted mt-3 leading-[1.5]">{o.body}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={o.onPrimary} disabled={retrying} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-3 disabled:opacity-60">
            {retrying ? 'Starting…' : o.primaryLabel}
          </button>
          {o.secondaryLabel && (
            <button onClick={o.onSecondary} className="vg-press cursor-pointer text-muted hover:text-ink font-medium rounded-[10px] px-4 py-3 border border-border">
              {o.secondaryLabel}
            </button>
          )}
        </div>
        {o.showSupport && (
          <a href={SUPPORT_LINK} className="block mt-5 text-[13.5px] text-muted hover:text-ink underline">
            Still stuck? Contact support
          </a>
        )}
      </div>
    </div>
  );

  if (missing) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="text-ink text-[18px] font-bold mb-3">No scan specified</div>
        <button onClick={() => router.push('/')} className="text-ink font-semibold hover:underline">Start a new scan</button>
      </div>
    );
  }

  if (scan?.status === 'error') {
    const f = scanFailure(scan);
    const primaryLabel = f.action === 'reupload' ? 'Upload again' : f.action === 'reconnect' ? 'Reconnect' : 'Try again';
    const onPrimary = f.action === 'reupload'
      ? () => router.push('/apps')
      : f.action === 'reconnect'
        ? () => router.push('/settings')
        : retry;
    return failView({
      title: f.title,
      body: f.body,
      tone: f.tone,
      primaryLabel,
      onPrimary,
      secondaryLabel: isDeep ? 'Back to My Apps' : 'Back to dashboard',
      onSecondary: () => router.push(isDeep ? '/apps' : '/dashboard'),
      showSupport: f.showSupport,
    });
  }

  // Watchdog tripped while still queued/running, resolve the spinner to a real
  // choice instead of leaving it stuck. The scan is still alive server-side.
  if (stalled && inFlight) {
    return failView({
      title: 'This is taking longer than expected',
      body: isDeep
        ? 'Large repos and uploads can run past our usual time. Try again, or leave it, it keeps scanning in the background and the result will be under My Apps.'
        : 'Your site is taking a while to respond. Try again, or leave it running, we’ll keep going in the background.',
      tone: 'ours',
      primaryLabel: 'Try again',
      onPrimary: retry,
      secondaryLabel: 'Run in background',
      onSecondary: () => router.push(isDeep ? '/apps' : '/dashboard'),
      showSupport: true,
    });
  }

  const line = (i: number) => {
    // Steps advance with the number the user sees, so they move together.
    const bandPct = finished ? 100 : display;
    const isDone = bandPct > (i + 1) * 20;
    const active = !isDone && (bandPct >= i * 20);
    return {
      text: phases[i] + (isDone ? '' : '…'),
      color: isDone ? '#1F9D57' : active ? '#0A0A0A' : '#B0B0AC',
      state: (isDone ? 'done' : active ? 'active' : 'pending') as 'done' | 'active' | 'pending',
    };
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 vg-fade">
      {/* Offline banner. The scan keeps running server-side and the Firestore
          listener auto-reconnects, so we reassure rather than alarm, and it
          clears itself the moment the connection is back. */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-ink/95 text-white text-[13.5px] font-medium text-center py-2 px-4">
          You’re offline, the scan keeps running and we’ll pick back up the moment you’re reconnected.
        </div>
      )}
      {/* Code scans take minutes, so let the user leave (it keeps running
          server-side). URL scans finish in seconds: no exit button. */}
      {isDeep && (
        <button
          onClick={() => router.push('/apps')}
          className="vg-press fixed top-5 left-5 z-10 flex items-center gap-2 text-muted hover:text-ink text-[14.5px] font-semibold rounded-[10px] px-3 py-2 bg-bg-soft border border-border transition-colors"
        >
          Run in background
        </button>
      )}
      <div className="relative flex flex-col items-center">
        <GradeRing size={200} pct={display} color="#0A0A0A" strokeWidth={8}>
          <span className="font-semibold text-[46px] text-ink leading-none">{pct}</span>
          <span className="text-[12px] text-faint font-semibold tracking-[0.05em]">SCANNING</span>
        </GradeRing>
        {/* Repo/target name + phase list share ONE fixed-width column so the name
            is centered directly over the steps. */}
        <div className="w-[300px] mt-7">
          <div className="font-mono text-[15px] text-label text-center truncate">{scan ? repoDisplay(scanLabel(scan)) : 'Starting…'}</div>
          <div className="flex flex-col gap-[9px] mt-[22px] text-left">
            {phases.map((_, i) => {
              const l = line(i);
              return (
                <div key={i} className="flex items-center gap-[10px] text-[14.5px]" style={{ color: l.color }}>
                  <span className="w-[16px] h-[16px] flex items-center justify-center shrink-0">
                    {l.state === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 12.5l4 4 10-11" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span
                        className="rounded-full"
                        style={{
                          width: l.state === 'active' ? 8 : 6,
                          height: l.state === 'active' ? 8 : 6,
                          background: l.state === 'active' ? '#0A0A0A' : '#D8D8D4',
                        }}
                      />
                    )}
                  </span>
                  <span>{l.text}</span>
                </div>
              );
            })}
          </div>
          {isDeep && (
            <div className="text-center text-faint text-[13px] mt-6 leading-[1.5]">
              Large repos can take a few minutes.<br />You can leave, it keeps scanning in the background.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
