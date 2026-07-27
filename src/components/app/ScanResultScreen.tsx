'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeLetter } from './ui';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts, GRADE_COLOR } from '@/lib/adapters';
import { scanLabel } from '@/lib/hooks';
import DeepScanHints from './DeepScanHints';

/**
 * The ONE-TIME, in-app result reveal shown immediately after a signed-in user
 * runs a new scan (routed here by the scanning screen). It is NOT a persistent
 * destination — nothing links back to it; to review a scan later the user opens
 * the Findings page. Public/anonymous scans use /results instead.
 */
const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#4FD897', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#4FD897', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#F2851F', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#FF6B5E', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#FF6B5E', headline: 'Your app isn’t safe to charge money yet.' },
};

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scan');

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
    return <div className="vg-fade text-center text-muted py-20">Scan not found. <button onClick={() => router.push('/dashboard')} className="text-yellow-dark font-semibold">Back to overview</button></div>;
  }

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  const grade = scan?.grade;
  const hero = grade ? HERO[grade] : null;
  const top = findings.slice(0, 4);

  return (
    <div className="vg-fade">
      {/* grade hero */}
      <div className="relative overflow-hidden bg-ink rounded-[24px] p-9 flex flex-wrap gap-8 items-center">
        <div aria-hidden className="absolute inset-0 bg-dots-dark" />
        <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_COLOR[grade] : '#8a8a85'} size={130} className="relative vg-pop" />
        <div className="relative flex-1 min-w-[240px]">
          <div className="font-mono text-[12px] tracking-[0.14em]" style={{ color: hero?.labelColor ?? '#F3C500' }}>{hero?.label ?? 'RESULT'}</div>
          <h1 className="font-extrabold text-[26px] tracking-[-0.02em] text-white mt-[6px] mb-1">{hero?.headline ?? 'Scan complete.'}</h1>
          <div className="text-[14px] text-white/55 mb-[14px]">Just scanned {scan ? scanLabel(scan) : '…'}</div>
          <div className="flex gap-[10px] flex-wrap">
            <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(229,53,43,.16)', color: '#FF6B5E' }}>{counts.critical} critical</span>
            <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(242,133,31,.16)', color: '#F2851F' }}>{counts.warnings} warnings</span>
            {counts.passed > 0 && <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(31,184,107,.16)', color: '#4FD897' }}>{counts.passed} passed</span>}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <button onClick={() => router.push(`/findings?scan=${scanId}`)} className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-[24px] py-[13px]">
          View all {findings.length} findings →
        </button>
        <button onClick={() => router.push('/dashboard')} className="vg-press bg-card border border-border-2 text-muted font-bold text-[15px] rounded-[11px] px-[20px] py-[13px]">Back to overview</button>
      </div>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={scan} />

      {/* top findings preview */}
      {top.length > 0 && (
        <div className="mt-6">
          <div className="font-bold text-[15px] mb-3 text-muted">Top issues</div>
          <div className="flex flex-col gap-[10px]">
            {top.map((f) => (
              <button key={f.id} onClick={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)} className="vg-lift flex items-center gap-[14px] bg-card border border-border-2 rounded-[14px] px-[18px] py-4 text-left">
                <span className="shrink-0 w-3 h-3 rounded-[3px]" style={{ background: f.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15.5px]">{f.title}</div>
                  <div className="font-mono text-[11.5px] text-faint mt-[2px]">{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
                </div>
                <span className="shrink-0 text-[12px] font-bold px-[11px] py-[5px] rounded-full" style={{ background: `${f.color}1e`, color: f.color }}>{f.sev}</span>
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
