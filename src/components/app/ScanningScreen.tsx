'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeRing } from './ui';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { subscribeScan, type ScanDoc } from '@/lib/scans';
import { scanLabel, repoDisplay } from '@/lib/hooks';

// Black-box (URL) vs white-box (deep/repo) phase labels. The deep flow clones
// the repo first, so its first step is honest about that — the user always sees
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

type ScanKind = 'url' | 'deep' | 'upload';

/** Turn a raw worker error into scan-type-appropriate, human copy. */
function friendlyError(err: string | undefined, kind: ScanKind): { title: string; body: string } {
  const noun = kind === 'url' ? 'site' : kind === 'upload' ? 'upload' : 'repo';
  const e = (err || '').toLowerCase();

  if (e.includes('e_timeout') || e.includes('timed out') || e.includes('timeout') || e.includes('exceeded')) {
    if (kind === 'url') return { title: 'That site took too long', body: 'It didn’t respond in time. Double-check the URL is live and try again.' };
    return {
      title: `This ${noun} is large — the scan timed out`,
      body: `Big ${noun}s can run past our time limit. Try again${kind === 'deep' ? ', or upload the folder instead' : ''} — and remember you can leave the scan running in the background.`,
    };
  }
  if (e.includes('size cap') || e.includes('too large')) {
    return {
      title: `This ${noun}’s source is very large`,
      body: `It’s over our size limit even after skipping dependencies and build output. Trim large committed assets${kind === 'upload' ? ', or connect the repo on GitHub' : ''} and try again.`,
    };
  }
  if (kind === 'url' && (e.includes('unreachable') || e.includes('could not be reached') || e.includes('reach'))) {
    return { title: 'We couldn’t reach that site', body: 'The URL didn’t respond. Make sure it’s public and live, then try again.' };
  }
  if (kind !== 'url' && (e.includes('clone') || e.includes('repo path') || e.includes('not connected') || e.includes('github') || e.includes('archive'))) {
    return { title: `We couldn’t fetch that ${noun}`, body: 'Make sure it’s connected and we still have access, then try again.' };
  }
  return { title: `We couldn’t scan that ${noun}`, body: err || 'Something went wrong. Please try again.' };
}
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
  const { setActiveSite } = useApp();

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [display, setDisplay] = useState(0);
  const missing = !scanId;

  useEffect(() => {
    if (!scanId) return;
    return subscribeScan(scanId, setScan);
  }, [scanId]);

  // On completion, branch by flow:
  //  - anonymous OR the onboarding first-scan → public /results (the marketing
  //    reveal with the "go to dashboard" hand-off into the app).
  //  - a signed-in in-app scan → the ONE-TIME in-shell result page, and make the
  //    scanned host the active site so the whole app follows it.
  useEffect(() => {
    if (loading || scan?.status !== 'done' || !scanId || !scan) return;
    if (user && flow !== 'onboarding') {
      setActiveSite(scanLabel(scan));
      router.replace(`/scan?scan=${scanId}`);
    } else {
      router.replace(`/results?scanId=${scanId}`);
    }
  }, [scan?.status, scanId, scan, user, loading, flow, setActiveSite, router]);

  // Real progress from the worker. A deep scan clones the repo first (several
  // seconds) before it emits ANY progress. During that window we hold the number
  // modestly (soft cap ~14%) so it reads "just started — fetching" rather than
  // faking near-completion; once real progress arrives it jumps forward (never
  // backwards) toward 96%, then snaps to 100 on done. Phase lighting is driven by
  // REAL progress (below), so the steps stay honest.
  const realPct = scan?.progress ? Math.min(100, Math.round((scan.progress.done / Math.max(1, scan.progress.total)) * 100)) : 0;
  const finished = scan?.status === 'done';
  const isUpload = scan?.type === 'upload';
  // Deep + upload are both white-box "code" scans (same phase feel + routing).
  const isDeep = scan?.type === 'deep' || isUpload;
  useEffect(() => {
    if (finished) { setDisplay(100); return; }
    if (!scanId || scan?.status === 'error') return;
    const id = setInterval(() => {
      const softCap = realPct > 0 ? 96 : 14; // pre-progress (cloning) stays low
      setDisplay((d) => {
        const next = d + Math.max(0.3, (softCap - d) * 0.08);
        return Math.max(d, realPct, Math.min(softCap, next));
      });
    }, 150);
    return () => clearInterval(id);
  }, [finished, realPct, scanId, scan?.status]);
  // Resuming a scan that's already partway (e.g. reopened from the Deep Scan card
  // at 50%): jump the display straight to the real percent so it never flashes 0.
  useEffect(() => {
    if (realPct > 0) setDisplay((d) => Math.max(d, realPct));
  }, [realPct]);
  const pct = Math.round(display);
  const phases = isUpload ? UPLOAD_PHASES : isDeep ? DEEP_PHASES : URL_PHASES;
  // Which step is "active": before any real progress, step 0 (fetch/first check)
  // is the live one; after that, light steps by real progress in 20% bands.
  const cloning = realPct === 0 && !finished;

  if (missing) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="text-ink text-[18px] font-bold mb-3">No scan specified</div>
        <button onClick={() => router.push('/')} className="text-ink font-semibold hover:underline">Start a new scan</button>
      </div>
    );
  }

  if (scan?.status === 'error') {
    const kind: ScanKind = isUpload ? 'upload' : isDeep ? 'deep' : 'url';
    const { title, body } = friendlyError(scan.error, kind);
    const cta = kind === 'url'
      ? { label: 'Try another URL', to: '/dashboard' }
      : kind === 'upload'
        ? { label: 'Try another upload', to: '/apps' }
        : { label: 'Try another repo', to: '/apps' };
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center vg-fade">
        <div className="relative max-w-[460px]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="0.7" fill="#E5484D" stroke="none" />
          </svg>
          <h1 className="font-semibold text-[24px] text-ink">{title}</h1>
          <p className="text-[15.5px] text-muted mt-3 leading-[1.5]">{body}</p>
          <button onClick={() => router.push(cta.to)} className="vg-press cursor-pointer mt-6 bg-ink text-white font-medium rounded-[10px] px-5 py-3">{cta.label}</button>
        </div>
      </div>
    );
  }

  const line = (i: number) => {
    const bandPct = finished ? 100 : realPct;
    const isDone = bandPct > (i + 1) * 20;
    // Step 0 is live during the clone window even though real progress is still 0.
    const active = !isDone && (bandPct > i * 20 || (cloning && i === 0));
    return {
      text: phases[i] + (isDone ? '' : '…'),
      color: isDone ? '#1F9D57' : active ? '#0A0A0A' : '#B0B0AC',
      state: (isDone ? 'done' : active ? 'active' : 'pending') as 'done' | 'active' | 'pending',
    };
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 vg-fade">
      {/* Let the user leave — the scan keeps running server-side; they can reopen
          it from the My Apps list and resume at the live progress. */}
      <button
        onClick={() => router.push(isDeep ? '/apps' : '/dashboard')}
        className="vg-press fixed top-5 left-5 z-10 flex items-center gap-2 text-muted hover:text-ink text-[14.5px] font-semibold rounded-[10px] px-3 py-2 bg-bg-soft border border-border transition-colors"
      >
        Run in background
      </button>
      <div className="relative flex flex-col items-center">
        <GradeRing size={200} pct={pct} color="#F3C500" strokeWidth={8} animate>
          <span className="font-semibold text-[46px] text-ink leading-none">{pct}</span>
          <span className="font-mono text-[12px] text-yellow-dark tracking-[0.1em]">SCANNING</span>
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
                          background: l.state === 'active' ? '#F3C500' : '#D8D8D4',
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
              Large repos can take a few minutes.<br />You can leave — it keeps scanning in the background.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
