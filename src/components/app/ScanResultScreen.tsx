'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeHelp } from './GradeHelp';
import { subscribeScan, subscribeFindings, aiUsageLabel, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts } from '@/lib/adapters';
import { scanLabel, repoDisplay, useApps } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useAuth, isPaid } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import { useApp } from './state';
import { scanFailure, startFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';
import { type Grade } from './data';
import { Card, PillButton, SeverityChip, GradeSquare, SectionLabel, SeverityTiles } from './primitives';
import DeepScanHints from './DeepScanHints';
import GradeExplainer from './GradeExplainer';

/**
 * The ONE-TIME, in-app result reveal shown immediately after a signed-in user
 * runs a new scan (routed here by the scanning screen). It is NOT a persistent
 * destination, to review a scan later the user opens the Findings tab.
 */
const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#157A43', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#157A43', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#9A6412', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#C23B3F', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#C23B3F', headline: 'Your app isn’t safe to charge money yet.' },
};

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#C7C7C2' }}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

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
  const { profile } = useAuth();
  const paid = isPaid(profile);
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
    return <div className="vg-fade text-center text-muted py-20">Scan not found. <button onClick={() => router.push('/dashboard')} className="cursor-pointer text-ink font-semibold hover:underline">Back to overview</button></div>;
  }

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  const grade = scan?.grade;
  const hero = grade ? HERO[grade] : null;
  const top = findings.slice(0, 5);

  // Re-run the same scan and hand off to the fresh run (uploads have no file to
  // resend → send back to My Apps to pick the folder again).
  const retry = async () => {
    if (!scan || retrying) return;
    const kind: ScanKind = scan.type === 'upload' ? 'upload' : scan.type === 'deep' ? 'deep' : 'url';
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
  if (scan?.status === 'error') {
    const f = scanFailure(scan);
    const primaryLabel = f.action === 'reupload' ? 'Upload again' : f.action === 'reconnect' ? 'Reconnect' : retrying ? 'Starting…' : 'Try again';
    const onPrimary = f.action === 'reupload' ? () => router.push('/apps') : f.action === 'reconnect' ? () => router.push('/settings') : retry;
    return (
      <div className="vg-fade max-w-[620px] mx-auto pt-10">
        <Card flat className="py-10 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={f.tone === 'ours' ? '#9A6412' : '#C23B3F'} strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="0.7" fill={f.tone === 'ours' ? '#9A6412' : '#C23B3F'} stroke="none" />
          </svg>
          <h1 className="font-medium text-[22px] text-ink tracking-[-0.02em]">{f.title}</h1>
          <div className="font-mono text-[12.5px] mt-1" style={{ color: '#A3A3A3' }}>{scan ? repoDisplay(scanLabel(scan)) : ''}</div>
          <p className="text-[15px] text-muted mt-3 leading-[1.5] max-w-[46ch] mx-auto">{f.body}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <PillButton onClick={onPrimary} disabled={retrying}>{primaryLabel}</PillButton>
            <PillButton variant="outline" onClick={() => router.push('/dashboard')}>Back to overview</PillButton>
          </div>
          {f.showSupport && <a href={SUPPORT_LINK} className="block mt-5 text-[13.5px] text-muted hover:text-ink underline">Still stuck? Contact support</a>}
        </Card>
        {findings.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Found before the scan stopped</SectionLabel>
            <div className="border-y border-border overflow-hidden mt-2">
              {findings.map((f2, i) => (
                <FindingRow key={f2.id} f={f2} first={i === 0} onClick={() => router.push(`/finding?scan=${scanId}&id=${f2.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Opened while still in flight, calm in-progress note, not a fake grade.
  if (!scan || scan.status === 'queued' || scan.status === 'running') {
    return (
      <div className="vg-fade max-w-[620px] mx-auto pt-12">
        <Card flat className="py-10 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-border border-t-ink animate-spin mb-4" aria-hidden />
          <h1 className="font-medium text-[20px] text-ink tracking-[-0.02em]">This scan is still running</h1>
          <p className="font-mono text-[12.5px] mt-1" style={{ color: '#A3A3A3' }}>{scan ? repoDisplay(scanLabel(scan)) : ''}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <PillButton onClick={() => router.push(`/scanning?scanId=${scanId}`)}>Watch progress</PillButton>
            <PillButton variant="outline" onClick={() => router.push('/dashboard')}>Back to overview</PillButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="vg-fade max-w-[860px] mx-auto">
      {/* result summary card (matches the dashboard's card system) */}
      <Card flat className="py-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <GradeSquare grade={grade as Grade | undefined} size={52} className="shrink-0 vg-pop" />
            <div className="min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className="text-[11.5px] font-semibold tracking-[0.06em]" style={{ color: hero?.labelColor ?? '#9B9B96' }}>{hero?.label ?? 'RESULT'}</span>
                <GradeHelp />
              </div>
              <h1 className="font-medium text-[20px] tracking-[-0.02em] mt-[5px]">{hero?.headline ?? 'Scan complete.'}</h1>
              <div className="text-[13.5px] text-muted mt-[3px]">Just scanned {scan ? repoDisplay(scanLabel(scan)) : '…'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PillButton onClick={openFindings} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>} tooltip="See every issue">View all {findings.length} findings</PillButton>
            <PillButton variant="outline" onClick={() => router.push('/dashboard')}>Overview</PillButton>
          </div>
        </div>
        <SeverityTiles critical={counts.critical} warnings={counts.warnings} passed={counts.passed} className="mt-5" />
        {aiUsageLabel(scan?.aiUsage) && <div className="font-mono text-[11.5px] mt-[14px]" style={{ color: '#A3A3A3' }}>{aiUsageLabel(scan?.aiUsage)}</div>}
      </Card>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={scan} />

      {/* Why you got this grade: what's protecting you + what needs attention. */}
      <GradeExplainer
        grade={grade as Grade | undefined}
        critical={counts.critical}
        warnings={counts.warnings}
        passed={scan.passed}
        attention={top}
        paid={paid}
        onViewFix={(f) => router.push(`/finding?scan=${scanId}&id=${f.id}`)}
        onSeeAll={openFindings}
        onUpgrade={() => router.push(billingHref())}
      />
    </div>
  );
}

function FindingRow({ f, first, onClick }: { f: ReturnType<typeof toUiFinding>; first?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="vg-row flex items-start gap-3 w-full px-[18px] py-4 text-left cursor-pointer" style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>
      <span className="pt-[1px]"><SeverityChip sev={f.sev} /></span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[14.5px]">{f.title}</div>
        <div className="font-mono text-[11.5px] mt-[4px] truncate" style={{ color: '#A3A3A3' }}>{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
      </div>
      <span className="pt-[2px]"><Chevron /></span>
    </button>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
