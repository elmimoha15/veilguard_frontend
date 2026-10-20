'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { GradeLetter } from './ui';
import { GradeHelp } from './GradeHelp';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { claimScanForUser } from '@/lib/claim';
import { postAuthDestination } from '@/lib/onboardingFlow';
import { useApp } from './state';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts, GRADE_COLOR, activeFindings, isConfirmed } from '@/lib/adapters';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import { scanFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';
import { SeverityTiles, SeverityText } from './primitives';

const HERO: Record<string, { label: string; labelColor: string; headline: string }> = {
  A: { label: 'LOOKING GOOD', labelColor: '#1F9D57', headline: 'Your app looks safe to charge money.' },
  B: { label: 'LOOKING GOOD', labelColor: '#1F9D57', headline: 'Your app is in good shape.' },
  C: { label: 'NEEDS WORK', labelColor: '#E0932F', headline: 'A few things to fix before you charge money.' },
  D: { label: 'CRITICAL RISK', labelColor: '#E5484D', headline: 'Your app isn’t safe to charge money yet.' },
  F: { label: 'CRITICAL RISK', labelColor: '#E5484D', headline: 'Your app isn’t safe to charge money yet.' },
};

/** How many issues the one-screen result previews before "+ N more". */
const PREVIEW = 3;

export default function ResultsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scanId');
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useApp();

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [scanMissing, setScanMissing] = useState(false);
  const [handingOff, setHandingOff] = useState(false);
  const handoffRan = useRef(false);
  const notFound = !scanId || scanMissing;

  useEffect(() => {
    if (!scanId) return;
    const u1 = subscribeScan(scanId, (s) => { setScan(s); if (s === null) setScanMissing(true); });
    const u2 = subscribeFindings(scanId, setRaw);
    return () => { u1(); u2(); };
  }, [scanId, user]);

  // Already signed in, scan still anonymous: claim it onto the account
  // (idempotent), then onboarding (new account) or the dashboard. Never re-scans.
  const handoff = useCallback(async () => {
    if (!scanId || handoffRan.current) return;
    handoffRan.current = true;
    setHandingOff(true);
    const c = await claimScanForUser(scanId).catch(() => null);
    if (c?.status === 409) {
      setHandingOff(false);
      handoffRan.current = false;
      toast('This scan is saved on another account. Sign in with that account to see it.', '#E5484D');
      return;
    }
    // Transient (offline / 5xx): onboarding claims it again on finish.
    if (c && !c.ok && c.status !== 404) toast('We’ll finish saving your scan in a moment.', '#E0932F');
    const p = profile ?? (await refreshProfile());
    router.replace(postAuthDestination({ onboarded: !!p?.onboarded, scanId }));
  }, [scanId, profile, refreshProfile, router, toast]);

  // Signed out: the full sign-up page, carrying this scan so it's claimed after.
  const signupHref = scanId ? `/onboarding?scan=${encodeURIComponent(scanId)}` : '/onboarding';

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-6">
        <div className="text-[18px] font-semibold mb-2">Scan not found</div>
        <button onClick={() => router.push('/')} className="cursor-pointer text-ink font-semibold hover:underline">Run a new scan</button>
      </div>
    );
  }

  const findings = activeFindings(raw.map(toUiFinding)).sort((a, b) => rank(b.sev) - rank(a.sev));
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
            <Logo size={28} />
            <span className="ml-auto font-mono text-[13.5px] text-label">{scan ? repoDisplay(scanLabel(scan)) : '…'}</span>
          </div>
        </div>
        <div className="max-w-[560px] mx-auto px-6 pt-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={f.tone === 'ours' ? '#5b5a56' : '#C23B3F'} strokeWidth="1.8" aria-hidden className="mx-auto mb-3">
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="0.7" fill={f.tone === 'ours' ? '#5b5a56' : '#C23B3F'} stroke="none" />
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
              We found these before the scan stopped, run again for a complete result.
            </p>
            <div className="flex flex-col divide-y divide-border border-y border-border opacity-90">
              {findings.map((f2) => (
                <div key={f2.id} className="py-5">
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

  const issues = findings.filter((f) => f.sev !== 'PASSED');
  // The preview leads with confirmed findings; "possible: verify" ones never headline.
  const preview = issues.filter(isConfirmed).slice(0, PREVIEW);
  const more = issues.length - preview.length;
  const host = scan ? repoDisplay(scanLabel(scan)) : '…';

  if (running) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <ResultsHeader host={host} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-border border-t-ink animate-spin mb-4" aria-hidden />
          <h1 className="font-semibold text-[22px] tracking-[-0.02em]">Grading your app…</h1>
          <p className="text-[14.5px] text-muted mt-2">This usually takes under a minute.</p>
        </div>
      </div>
    );
  }

  const ctaClass = 'vg-press cursor-pointer inline-flex items-center justify-center bg-ink text-white font-medium text-[16px] rounded-[12px] px-7 h-[52px] w-full sm:w-auto disabled:opacity-70';

  return (
    <div className="min-h-screen bg-bg flex flex-col vg-fade">
      <ResultsHeader host={host} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-5">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          {/* grade: the letter alone on its line so it sits dead center */}
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_COLOR[grade] : '#B0B0AC'} size={88} className="vg-pop text-center" />
          <div className="mt-2 flex items-center justify-center gap-[6px] font-mono text-[12.5px] tracking-[0.1em]" style={{ color: hero?.labelColor ?? '#5b5a56' }}>
            {hero?.label ?? 'RESULT'}
            <GradeHelp />
          </div>
          <h1 className="font-semibold text-[clamp(22px,3vw,28px)] tracking-[-0.02em] mt-2 text-center text-balance">
            {hero?.headline ?? 'Scan complete.'}
          </h1>

          {/* counts: plain columns, no tinted pills (matches the in-app result) */}
          <SeverityTiles critical={counts.critical} warnings={counts.warnings} passed={counts.passed} className="mt-5 w-full max-w-[460px]" />

          {/* top issues preview */}
          <div className="mt-5 w-full border-t border-border">
            {preview.length === 0 ? (
              <p className="py-5 text-center text-[15px] text-muted">No issues found. Nice work.</p>
            ) : (
              preview.map((f, i) => {
                // Only the top issue is readable; the next ones tease (blurred).
                const hidden = i > 0;
                return (
                <Link key={f.id} href={user ? '#' : signupHref}
                  onClick={(e) => { if (user) { e.preventDefault(); void handoff(); } }}
                  className="group flex items-start gap-3 sm:gap-4 py-[11px] border-b border-border">
                  <div className="flex-1 min-w-0">
                    <SeverityText sev={f.sev} />
                    <div aria-hidden={hidden} className={hidden ? 'select-none blur-[5px]' : undefined}>
                      <div className="font-medium text-[15.5px] text-ink mt-[3px] truncate">{f.title}</div>
                      <div className="hidden sm:block text-[13.5px] text-muted mt-[2px] truncate">{f.what}</div>
                    </div>
                    {hidden && <span className="sr-only">Hidden issue, sign up to see it</span>}
                  </div>
                  <span className="shrink-0 mt-[9px] sm:mt-[18px] inline-flex items-center gap-[6px] text-[13.5px] font-medium text-ink group-hover:underline">
                    <LockIcon /><span className="hidden sm:inline">View fix</span>
                  </span>
                </Link>
                );
              })
            )}
            {more > 0 && (
              <p className="pt-3 text-center text-[14px] text-muted">
                + <span className="tnum font-medium text-ink">{more}</span> more {more === 1 ? 'issue' : 'issues'}
              </p>
            )}
          </div>

          {/* one clear next step */}
          <div className="mt-5 w-full flex flex-col items-center">
            {user ? (
              scan.ownerUid == null ? (
                <button onClick={() => void handoff()} disabled={handingOff} className={ctaClass}>{handingOff ? 'Saving…' : 'Save to my account'}</button>
              ) : (
                <Link href="/dashboard" className={ctaClass}>Go to dashboard</Link>
              )
            ) : (
              <Link href={signupHref} className={ctaClass}>
                {issues.length > 0 ? 'Sign up free to see how to fix these' : 'Sign up free to monitor your app'}
              </Link>
            )}
            <p className="mt-2 text-[13px] text-faint text-center">Free. Your scan is saved to your account, no re-scan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultsHeader({ host }: { host: string }) {
  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
      <div className="max-w-[960px] mx-auto flex items-center gap-[11px]">
        <Logo size={28} />
        <span className="ml-auto font-mono text-[13.5px] text-label truncate">{host}</span>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
