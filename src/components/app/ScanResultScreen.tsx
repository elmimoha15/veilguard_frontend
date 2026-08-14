'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeLetter } from './ui';
import { GradeHelp } from './GradeHelp';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts } from '@/lib/adapters';
import { scanLabel, repoDisplay, useApps } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useApp } from './state';
import { scanFailure, startFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';
import { SEV_COLOR, SEV_TINT } from './data';
import DeepScanHints from './DeepScanHints';

/* Grade to flat light-canvas letter color (new ElevenLabs-style palette). */
const GRADE_HEX: Record<string, string> = { A: '#1F9D57', B: '#1F9D57', C: '#E0932F', D: '#E5484D', F: '#E5484D' };

/**
 * The ONE-TIME, in-app result reveal shown immediately after a signed-in user
 * runs a new scan (routed here by the scanning screen). It is NOT a persistent
 * destination — nothing links back to it; to review a scan later the user opens
 * the Findings page. Public/anonymous scans use /results instead.
 */
const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#157A43', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#157A43', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#9A6412', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#C23B3F', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#C23B3F', headline: 'Your app isn’t safe to charge money yet.' },
};

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scan');
  const { apps } = useApps();

  // Open this scan's findings inside its app hub (findings are a tab there now).
  const openFindings = () => {
    const owner = apps.find((a) => a.scans.some((s) => s.id === scanId));
    if (owner) router.push(`/app?key=${encodeURIComponent(owner.key)}&tab=findings&scan=${scanId}`);
    else router.push('/apps');
  };

  const { toast, setModal, setNewAppUrl } = useApp();
  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [scanMissing, setScanMissing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    const u1 = subscribeScan(scanId, (s) => { setScan(s); if (s === null) setScanMissing(true); });
    const u2 = subscribeFindings(scanId, setRaw);
    return () => { u1(); u2(); };
  }, [scanId]);

  if (!scanId || scanMissing) {
    return <div className="vg-fade text-center text-muted py-20">Scan not found. <button onClick={() => router.push('/dashboard')} className="cursor-pointer text-yellow-dark font-semibold">Back to overview</button></div>;
  }

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  const grade = scan?.grade;
  const hero = grade ? HERO[grade] : null;
  const top = findings.slice(0, 4);

  // Re-run the same scan and hand off to the fresh run (uploads have no file to
  // resend → send back to My Apps to pick the folder again).
  const retry = async () => {
    if (!scan || retrying) return;
    const kind: ScanKind = scan.type === 'upload' ? 'upload' : scan.type === 'deep' ? 'deep' : 'url';
    // A URL scan usually fails because of the address itself — reopen the New
    // scan modal prefilled so the user can correct or paste a different one,
    // rather than blindly re-running the same address.
    if (kind === 'url') { setNewAppUrl((scan.sources?.url || scan.target.value || '').replace(/^https?:\/\//, '')); setModal('addApp'); return; }
    if (kind === 'upload') { router.push('/apps'); return; }
    setRetrying(true);
    const res = await api.createDeepScan({ github: !!scan.sources?.githubRepo, githubRepo: scan.sources?.githubRepo, supabase: scan.sources?.supabase, url: scan.sources?.url });
    if (res.ok && res.data?.scanId) { router.replace(`/scanning?scanId=${res.data.scanId}`); return; }
    if (res.data?.error) console.error('[retry] scan start failed:', res.data.error);
    toast(startFailure(res.status, res.data || {}).message, '#C23B3F');
    setRetrying(false);
  };

  // A failed scan lands here from ScanWatcher's "See why" and the app history.
  // Never render it as an empty success — show the reason + a real retry, and
  // preserve any findings that streamed in before it stopped.
  if (scan?.status === 'error') {
    const f = scanFailure(scan);
    const primaryLabel = f.action === 'reupload' ? 'Upload again' : f.action === 'reconnect' ? 'Reconnect' : 'Try again';
    const onPrimary = f.action === 'reupload' ? () => router.push('/apps') : f.action === 'reconnect' ? () => router.push('/settings') : retry;
    return (
      <div className="vg-fade max-w-[560px] mx-auto text-center pt-12">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={f.tone === 'ours' ? '#8a6d00' : '#C23B3F'} strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
          <path d="M12 3l9 16H3z" strokeLinejoin="round" />
          <path d="M12 10v4" strokeLinecap="round" />
          <circle cx="12" cy="16.8" r="0.7" fill={f.tone === 'ours' ? '#8a6d00' : '#C23B3F'} stroke="none" />
        </svg>
        <h1 className="font-semibold text-[24px] text-ink">{f.title}</h1>
        <div className="text-[14px] text-muted mt-1">{scan ? repoDisplay(scanLabel(scan)) : ''}</div>
        <p className="text-[15.5px] text-muted mt-3 leading-[1.5]">{f.body}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={onPrimary} disabled={retrying} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-3 disabled:opacity-60">{retrying ? 'Starting…' : primaryLabel}</button>
          <button onClick={() => router.push('/dashboard')} className="vg-press cursor-pointer text-muted hover:text-ink font-medium rounded-[10px] px-4 py-3 border border-border">Back to overview</button>
        </div>
        {f.showSupport && <a href={SUPPORT_LINK} className="block mt-5 text-[13.5px] text-muted hover:text-ink underline">Still stuck? Contact support</a>}
        {findings.length > 0 && (
          <div className="mt-12 text-left">
            <p className="text-center text-[14px] text-muted mb-4">We found these before the scan stopped — run again for a complete result.</p>
            <div className="flex flex-col gap-[10px] opacity-90">
              {findings.map((f2) => (
                <div key={f2.id} className="vg-card flex items-center gap-[14px] vg-surface px-[18px] py-4">
                  <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: f2.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px]">{f2.title}</div>
                    <div className="font-mono text-[12.5px] text-faint mt-[2px]">{f2.cat}{f2.where ? ` · ${f2.where}` : ''}</div>
                  </div>
                  <span className="shrink-0 text-[13px] font-semibold px-[11px] py-[5px] rounded-full" style={{ background: `${f2.color}1e`, color: f2.color }}>{f2.sev}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Opened while still in flight (e.g. from a history row) — show a calm
  // in-progress note with a way to the live scanning view, not a fake grade.
  if (!scan || scan.status === 'queued' || scan.status === 'running') {
    return (
      <div className="vg-fade max-w-[560px] mx-auto text-center pt-16">
        <div className="inline-block w-8 h-8 rounded-full border-2 border-border border-t-yellow-dark animate-spin mb-4" aria-hidden />
        <h1 className="font-semibold text-[22px] text-ink">This scan is still running</h1>
        <p className="text-[15px] text-muted mt-2">{scan ? repoDisplay(scanLabel(scan)) : ''}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => router.push(`/scanning?scanId=${scanId}`)} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-3">Watch progress</button>
          <button onClick={() => router.push('/dashboard')} className="vg-press cursor-pointer text-muted hover:text-ink font-medium rounded-[10px] px-4 py-3 border border-border">Back to overview</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vg-fade">
      {/* grade hero — light canvas */}
      <div className="text-center pt-6 pb-2">
        <div className="flex justify-center">
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_HEX[grade] : '#B0B0AC'} size={130} className="vg-pop" />
        </div>
        <div className="flex items-center justify-center gap-[6px] mt-1">
          <span className="font-mono text-[13px] tracking-[0.1em]" style={{ color: hero?.labelColor ?? '#9B9B96' }}>{hero?.label ?? 'RESULT'}</span>
          <GradeHelp />
        </div>
        <h1 className="font-semibold text-[24px] tracking-[-0.02em] mt-[10px] mb-1">{hero?.headline ?? 'Scan complete.'}</h1>
        <div className="text-[15px] text-muted mb-[16px]">Just scanned {scan ? repoDisplay(scanLabel(scan)) : '…'}</div>
        <div className="flex gap-[8px] flex-wrap justify-center">
          <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.CRITICAL.bg, color: SEV_TINT.CRITICAL.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.CRITICAL }} />{counts.critical} critical</span>
          <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.WARNING.bg, color: SEV_TINT.WARNING.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.WARNING }} />{counts.warnings} warnings</span>
          {counts.passed > 0 && <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.PASSED.bg, color: SEV_TINT.PASSED.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.PASSED }} />{counts.passed} passed</span>}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <button onClick={openFindings} className="vg-press cursor-pointer bg-ink text-white font-medium text-[15px] rounded-[10px] px-[20px] py-[11px]">
          View all <span className="tnum">{findings.length}</span> findings
        </button>
        <button onClick={() => router.push('/dashboard')} className="vg-press cursor-pointer bg-card border border-border text-muted font-medium text-[15px] rounded-[10px] px-[18px] py-[11px]">Back to overview</button>
      </div>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={scan} />

      {/* top findings preview */}
      {top.length > 0 && (
        <div className="mt-6">
          <div className="kicker mb-3">Top issues</div>
          <div className="flex flex-col gap-[10px]">
            {top.map((f) => (
              <button key={f.id} onClick={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)} className="vg-card vg-press cursor-pointer flex items-center gap-[14px] vg-surface px-[18px] py-4 text-left">
                <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: f.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px]">{f.title}</div>
                  <div className="font-mono text-[12.5px] text-faint mt-[2px]">{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
                </div>
                <span className="shrink-0 text-[13px] font-semibold px-[11px] py-[5px] rounded-full" style={{ background: `${f.color}1e`, color: f.color }}>{f.sev}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
