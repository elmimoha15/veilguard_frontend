'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeLetter } from './ui';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts } from '@/lib/adapters';
import { scanLabel, useApps } from '@/lib/hooks';
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

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [scanMissing, setScanMissing] = useState(false);

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

  return (
    <div className="vg-fade">
      {/* grade hero — light canvas */}
      <div className="text-center pt-6 pb-2">
        <div className="flex justify-center">
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_HEX[grade] : '#B0B0AC'} size={130} className="vg-pop" />
        </div>
        <div className="font-mono text-[13px] tracking-[0.1em] mt-1" style={{ color: hero?.labelColor ?? '#9B9B96' }}>{hero?.label ?? 'RESULT'}</div>
        <h1 className="font-semibold text-[24px] tracking-[-0.02em] mt-[10px] mb-1">{hero?.headline ?? 'Scan complete.'}</h1>
        <div className="text-[15px] text-muted mb-[16px]">Just scanned {scan ? scanLabel(scan) : '…'}</div>
        <div className="flex gap-[8px] flex-wrap justify-center">
          <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.CRITICAL.bg, color: SEV_TINT.CRITICAL.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.CRITICAL }} />{counts.critical} critical</span>
          <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.WARNING.bg, color: SEV_TINT.WARNING.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.WARNING }} />{counts.warnings} warnings</span>
          {counts.passed > 0 && <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.PASSED.bg, color: SEV_TINT.PASSED.fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.PASSED }} />{counts.passed} passed</span>}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <button onClick={openFindings} className="vg-press cursor-pointer bg-ink text-white font-medium text-[16px] rounded-[10px] px-[24px] py-[13px]">
          View all <span className="tnum">{findings.length}</span> findings
        </button>
        <button onClick={() => router.push('/dashboard')} className="vg-press cursor-pointer bg-card border border-border text-muted font-medium text-[16px] rounded-[10px] px-[20px] py-[13px]">Back to overview</button>
      </div>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={scan} />

      {/* top findings preview */}
      {top.length > 0 && (
        <div className="mt-6">
          <div className="font-semibold text-[14px] mb-3 text-muted">Top issues</div>
          <div className="flex flex-col gap-[10px]">
            {top.map((f) => (
              <button key={f.id} onClick={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)} className="vg-card vg-press cursor-pointer flex items-center gap-[14px] vg-surface px-[18px] py-4 text-left">
                <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: f.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[16.5px]">{f.title}</div>
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
