'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeRing } from './ui';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { subscribeScan, type ScanDoc } from '@/lib/scans';
import { scanLabel } from '@/lib/hooks';

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
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="text-white text-[18px] font-bold mb-3">No scan specified</div>
        <button onClick={() => router.push('/')} className="text-yellow font-semibold">← Start a new scan</button>
      </div>
    );
  }

  if (scan?.status === 'error') {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center vg-fade">
        <div aria-hidden className="fixed inset-0 bg-dots-dark" />
        <div className="relative max-w-[440px]">
          <div className="text-[40px] mb-2">⚠️</div>
          <h1 className="font-extrabold text-[24px] text-white">We couldn’t scan that</h1>
          <p className="font-mono text-[13px] text-white/70 mt-3">{scan.error || 'The target could not be reached.'}</p>
          <button onClick={() => router.push('/')} className="mt-6 bg-yellow text-ink font-bold rounded-[11px] px-5 py-3">Try another URL</button>
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
      color: isDone ? '#4FD897' : active ? '#F3C500' : 'rgba(255,255,255,.35)',
      mark: isDone ? '✓' : active ? '▸' : '·',
    };
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 vg-fade">
      <div aria-hidden className="fixed inset-0 bg-dots-dark" />
      {/* Let the user leave — the scan keeps running server-side; they can reopen
          it from the My Apps list and resume at the live progress. */}
      <button
        onClick={() => router.push(isDeep ? '/apps' : '/dashboard')}
        className="fixed top-5 left-5 z-10 flex items-center gap-2 text-white/70 hover:text-white text-[13.5px] font-semibold rounded-[10px] px-3 py-2 bg-white/5 border border-white/10 transition-colors"
      >
        ← Run in background
      </button>
      <div className="relative flex flex-col items-center">
        <GradeRing size={200} pct={pct} color="#F3C500" strokeWidth={8} animate>
          <span className="font-extrabold text-[46px] text-white leading-none">{pct}</span>
          <span className="font-mono text-[11px] text-yellow tracking-[0.1em]">SCANNING</span>
        </GradeRing>
        {/* Repo/target name + phase list share ONE fixed-width column so the name
            is centered directly over the steps. */}
        <div className="w-[300px] mt-7">
          <div className="font-mono text-[14px] text-white/85 text-center truncate">{scan ? scanLabel(scan) : 'Starting…'}</div>
          <div className="flex flex-col gap-[9px] mt-[22px] text-left">
            {phases.map((_, i) => {
              const l = line(i);
              return (
                <div key={i} className="flex items-center gap-[10px] font-mono text-[13px]" style={{ color: l.color }}>
                  <span className="w-[14px] text-center">{l.mark}</span>
                  <span>{l.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
