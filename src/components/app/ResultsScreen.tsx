'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { GradeLetter } from './ui';
import { GradeHelp } from './GradeHelp';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts, GRADE_COLOR } from '@/lib/adapters';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import { scanFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';
import { SEV_TINT, SEV_COLOR } from './data';

const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#1F9D57', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#1F9D57', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#E0932F', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#E5484D', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#E5484D', headline: 'Your app isn’t safe to charge money yet.' },
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
        <div className="text-[18px] font-semibold mb-2">Scan not found</div>
        <button onClick={() => router.push('/')} className="cursor-pointer text-ink font-semibold hover:underline">Run a new scan</button>
      </div>
    );
  }

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  const grade = scan?.grade;
  const hero = grade ? HERO[grade] : null;
  const running = !scan || scan.status === 'queued' || scan.status === 'running';

  // A failed scan must never render as an empty success. Show the plain-English
  // reason + a real next action; keep any partial findings that streamed in.
  if (scan?.status === 'error') {
    const f = scanFailure(scan);
    const kind: ScanKind = scan.type === 'upload' ? 'upload' : scan.type === 'deep' ? 'deep' : 'url';
    const doRetry = async () => {
      if (f.action === 'reconnect') { router.push('/settings'); return; }
      if (kind === 'url') {
        const res = await api.createScan(scan.sources?.url || scan.target.value);
        if (res.ok && res.data?.scanId) { router.replace(`/scanning?scanId=${res.data.scanId}`); return; }
      }
      router.push(kind === 'url' ? '/' : '/apps');
    };
    const primaryLabel = f.action === 'reupload' ? 'Upload again' : f.action === 'reconnect' ? 'Reconnect' : 'Try again';
    return (
      <div className="min-h-screen bg-bg vg-fade pb-16">
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="max-w-[960px] mx-auto flex items-center gap-[11px]">
            <Logo size={32} wordmarkClassName="text-[17px]" />
            <span className="ml-auto font-mono text-[13.5px] text-label">{scan ? repoDisplay(scanLabel(scan)) : '…'}</span>
          </div>
        </div>
        <div className="max-w-[560px] mx-auto px-6 pt-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={f.tone === 'ours' ? '#8a6d00' : '#C23B3F'} strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="0.7" fill={f.tone === 'ours' ? '#8a6d00' : '#C23B3F'} stroke="none" />
          </svg>
          <h1 className="font-semibold text-[24px] text-ink">{f.title}</h1>
          <p className="text-[15.5px] text-muted mt-3 leading-[1.5]">{f.body}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={doRetry} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-3">{primaryLabel}</button>
          </div>
          {f.showSupport && (
            <a href={SUPPORT_LINK} className="block mt-5 text-[13.5px] text-muted hover:text-ink underline">Still stuck? Contact support</a>
          )}
        </div>
        {findings.length > 0 && (
          <div className="max-w-[960px] mx-auto px-6 mt-12">
            <p className="text-center text-[14px] text-muted mb-4">
              We found these before the scan stopped — run again for a complete result.
            </p>
            <div className="flex flex-col gap-3 opacity-90">
              {findings.map((f2) => (
                <div key={f2.id} className="vg-card block vg-surface p-5">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-[5px] w-[9px] h-[9px] rounded-full" style={{ background: f2.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[9px] flex-wrap">
                        <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: f2.color }}>{f2.sev}</span>
                        <span className="font-mono text-[11px] text-faint">{f2.cat}</span>
                      </div>
                      <div className="font-semibold text-[17px] mt-[3px]">{f2.title}</div>
                      <div className="text-[15px] leading-[1.5] text-muted mt-[3px]">{f2.what}</div>
                      {f2.where && <div className="font-mono text-[12.5px] text-faint mt-[6px]">{f2.where}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg vg-fade pb-28">
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-[960px] mx-auto flex items-center gap-[11px]">
          <Logo size={32} wordmarkClassName="text-[17px]" />
          <span className="ml-auto font-mono text-[13.5px] text-label">{scan ? repoDisplay(scanLabel(scan)) : '…'}</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-10">
        {/* grade hero */}
        <div className="text-center">
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_COLOR[grade] : '#B0B0AC'} size={130} className="inline-block vg-pop" />
          <div className="mt-1 inline-flex items-center gap-[7px] font-mono text-[13px] tracking-[0.1em]" style={{ color: hero?.labelColor ?? '#8a6d00' }}>
            {running ? 'SCANNING…' : (hero?.label ?? 'RESULT')}
            {!running && <GradeHelp />}
          </div>
          <h1 className="font-semibold text-[clamp(24px,3.2vw,30px)] tracking-[-0.02em] mt-[14px]">
            {running ? 'Grading your app…' : (hero?.headline ?? 'Scan complete.')}
          </h1>
          <div className="flex gap-2 flex-wrap justify-center mt-4">
            <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.CRITICAL.bg, color: SEV_TINT.CRITICAL.fg }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.CRITICAL }} />{counts.critical} critical
            </span>
            <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.WARNING.bg, color: SEV_TINT.WARNING.fg }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.WARNING }} />{counts.warnings} warnings
            </span>
            {counts.passed > 0 && (
              <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT.PASSED.bg, color: SEV_TINT.PASSED.fg }}>
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR.PASSED }} />{counts.passed} passed
              </span>
            )}
          </div>
        </div>

        {/* findings with locked fixes */}
        <div className="mt-6 flex flex-col gap-3">
          {findings.length === 0 && running && <div className="text-center text-muted py-10">Findings will appear here as they’re found…</div>}
          {findings.length === 0 && !running && <div className="text-center text-muted py-10">No issues found.</div>}
          {findings.map((f, i) => (
            <div
              key={f.id}
              className="vg-card block vg-surface p-5 vg-rise"
              style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-[5px] w-[9px] h-[9px] rounded-full" style={{ background: f.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[9px] flex-wrap">
                    <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: f.color }}>{f.sev}</span>
                    <span className="font-mono text-[11px] text-faint">{f.cat}</span>
                  </div>
                  <div className="font-semibold text-[17px] mt-[3px]">{f.title}</div>
                  <div className="text-[15px] leading-[1.5] text-muted mt-[3px]">{f.what}</div>
                  {f.where && <div className="font-mono text-[12.5px] text-faint mt-[6px]">{f.where}</div>}
                  <div className="relative mt-3 rounded-[10px] overflow-hidden border border-border">
                    <div className="blur-[6px] select-none p-[14px] bg-bg-soft font-mono text-[13px] text-label leading-[1.6]">
                      {/* the real fix is server-only (locked) */}
                      # the exact fix for this issue is here
                      <br />
                      # unlock to reveal the copy-paste code + AI prompt
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex items-center gap-[7px] bg-ink text-white font-semibold text-[13.5px] px-[14px] py-2 rounded-full">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="5" y="11" width="14" height="9" rx="2" stroke="#fff" strokeWidth="1.8" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="1.8" />
                        </svg>
                        Fix locked
                      </span>
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
        <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border px-6 py-[14px]">
          <div className="max-w-[960px] mx-auto flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-semibold text-[16.5px] text-ink">Unlock all <span className="tnum">{findings.length}</span> fixes + monitoring</div>
              <div className="text-[14px] text-muted">Copy-paste code, AI prompts, and auto re-scans.</div>
            </div>
            {user ? (
              scan && scan.ownerUid == null ? (
                <button onClick={async () => { await api.claimScan(scanId!); router.push('/dashboard'); }} className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px]">Save to my account</button>
              ) : (
                <Link href="/dashboard" className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px]">Go to dashboard</Link>
              )
            ) : (
              <Link href="/signup" className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px]">Unlock fixes</Link>
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
