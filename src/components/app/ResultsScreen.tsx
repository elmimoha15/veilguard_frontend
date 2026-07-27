'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { GradeLetter } from './ui';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts, GRADE_COLOR } from '@/lib/adapters';
import { scanLabel } from '@/lib/hooks';

const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#4FD897', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#4FD897', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#F2851F', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#FF6B5E', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#FF6B5E', headline: 'Your app isn’t safe to charge money yet.' },
};

export default function ResultsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scanId');
  const { user } = useAuth();

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [scanMissing, setScanMissing] = useState(false);
  const notFound = !scanId || scanMissing;

  useEffect(() => {
    if (!scanId) return;
    const u1 = subscribeScan(scanId, (s) => { setScan(s); if (s === null) setScanMissing(true); });
    const u2 = subscribeFindings(scanId, setRaw);
    return () => { u1(); u2(); };
  }, [scanId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-6">
        <div className="text-[18px] font-bold mb-2">Scan not found</div>
        <button onClick={() => router.push('/')} className="text-yellow-dark font-semibold">← Run a new scan</button>
      </div>
    );
  }

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  const grade = scan?.grade;
  const hero = grade ? HERO[grade] : null;
  const running = !scan || scan.status === 'queued' || scan.status === 'running';

  return (
    <div className="min-h-screen bg-bg vg-fade pb-28">
      <div className="bg-card border-b border-border-2 px-6 py-4">
        <div className="max-w-[960px] mx-auto flex items-center gap-[11px]">
          <Logo size={32} wordmarkClassName="text-[17px]" />
          <span className="ml-auto font-mono text-[12.5px] text-label">{scan ? scanLabel(scan) : '…'}</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-9">
        {/* grade hero */}
        <div className="relative overflow-hidden bg-ink rounded-[24px] p-9 flex flex-wrap gap-8 items-center">
          <div aria-hidden className="absolute inset-0 bg-dots-dark" />
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_COLOR[grade] : '#8a8a85'} size={150} className="relative vg-pop" />
          <div className="relative flex-1 min-w-[220px]">
            <div className="font-mono text-[12px] tracking-[0.14em]" style={{ color: hero?.labelColor ?? '#F3C500' }}>
              {running ? 'SCANNING…' : (hero?.label ?? 'RESULT')}
            </div>
            <h1 className="font-extrabold text-[28px] tracking-[-0.02em] text-white mt-[6px] mb-[14px]">
              {running ? 'Grading your app…' : (hero?.headline ?? 'Scan complete.')}
            </h1>
            <div className="flex gap-[10px] flex-wrap">
              <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(229,53,43,.16)', color: '#FF6B5E' }}>
                <span className="w-2 h-2 rounded-full bg-red" style={{ animation: 'vgPulse 1.6s ease-in-out infinite' }} />{counts.critical} critical
              </span>
              <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(242,133,31,.16)', color: '#F2851F' }}>{counts.warnings} warnings</span>
              {counts.passed > 0 && <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: 'rgba(31,184,107,.16)', color: '#4FD897' }}>{counts.passed} passed</span>}
            </div>
          </div>
        </div>

        {/* findings with locked fixes */}
        <div className="mt-6 flex flex-col gap-3">
          {findings.length === 0 && running && <div className="text-center text-muted py-10">Findings will appear here as they’re found…</div>}
          {findings.length === 0 && !running && <div className="text-center text-muted py-10">No issues found. 🎉</div>}
          {findings.map((f, i) => (
            <div
              key={f.id}
              className="block bg-card border border-border-2 rounded-2xl p-5 vg-rise"
              style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-[5px] w-[11px] h-[11px] rounded-[3px]" style={{ background: f.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[9px] flex-wrap">
                    <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: f.color }}>{f.sev}</span>
                    <span className="font-mono text-[10px] text-faint">{f.cat}</span>
                  </div>
                  <div className="font-bold text-[16px] mt-[3px]">{f.title}</div>
                  <div className="text-[14px] leading-[1.5] text-muted mt-[3px]">{f.what}</div>
                  {f.where && <div className="font-mono text-[11.5px] text-faint mt-[6px]">{f.where}</div>}
                  <div className="relative mt-3 rounded-[10px] overflow-hidden border border-[#EEEDE8]">
                    <div className="blur-[6px] select-none p-[14px] bg-ink-tile font-mono text-[12px] text-[#8fae9c] leading-[1.6]">
                      {/* the real fix is server-only (locked) */}
                      # the exact fix for this issue is here
                      <br />
                      # unlock to reveal the copy-paste code + AI prompt
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(30,29,27,.35)' }}>
                      <span className="inline-flex items-center gap-[7px] bg-yellow text-ink font-bold text-[13px] px-[14px] py-2 rounded-full">🔒 Fix locked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* sticky upgrade / save bar */}
      {!running && findings.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-ink border-t border-white/10 px-6 py-[14px]">
          <div className="max-w-[960px] mx-auto flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-bold text-[16px] text-white">Unlock all {findings.length} fixes + monitoring</div>
              <div className="text-[13px] text-white/60">Copy-paste code, AI prompts, and auto re-scans.</div>
            </div>
            {user ? (
              scan && scan.ownerUid == null ? (
                <button onClick={async () => { await api.claimScan(scanId!); router.push('/dashboard'); }} className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-[26px] py-[14px]">Save to my account →</button>
              ) : (
                <Link href="/dashboard" className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-[26px] py-[14px]">Go to dashboard →</Link>
              )
            ) : (
              <Link href="/signup" className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-[26px] py-[14px]">Unlock fixes →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
