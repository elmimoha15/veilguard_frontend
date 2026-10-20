'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { GradeLetter } from './ui';
import { GradeHelp } from './GradeHelp';
import { useAuth, consumeAuthError } from '@/lib/auth';
import { api } from '@/lib/api';
import { claimScanForUser } from '@/lib/claim';
import { setPendingScan, setHandoff, getHandoff, clearHandoff, postAuthDestination } from '@/lib/onboardingFlow';
import SignInButtons from '@/components/auth/SignInButtons';
import { useApp } from './state';
import { subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts, GRADE_COLOR } from '@/lib/adapters';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import { scanFailure, SUPPORT_LINK, type ScanKind } from '@/lib/scanError';
import GradeExplainer from './GradeExplainer';
import { SEV_TINT, SEV_COLOR, type Grade } from './data';

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
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useApp();

  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [scanMissing, setScanMissing] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [handingOff, setHandingOff] = useState(false);
  const handoffRan = useRef(false);
  const notFound = !scanId || scanMissing;

  useEffect(() => {
    if (!scanId) return;
    const u1 = subscribeScan(scanId, (s) => { setScan(s); if (s === null) setScanMissing(true); });
    const u2 = subscribeFindings(scanId, setRaw);
    return () => { u1(); u2(); };
  }, [scanId, user]);

  // Signed in from this page: claim the scan onto the account (idempotent, so it's
  // fine that the auth layer may have claimed it already), then go to onboarding
  // (new account) or the dashboard (existing account). Never re-scans.
  const handoff = useCallback(async () => {
    if (!scanId || handoffRan.current) return;
    handoffRan.current = true;
    setHandingOff(true);
    const c = await claimScanForUser(scanId).catch(() => null);
    clearHandoff();
    if (c?.status === 409) {
      setHandingOff(false);
      toast('This scan is saved on another account. Sign in with that account to see it.', '#E5484D');
      return;
    }
    if (!c || !c.ok) {
      // Transient (offline / 5xx): onboarding claims it again on finish.
      if (c?.status !== 404) toast('We’ll finish saving your scan in a moment.', '#E0932F');
    }
    const p = profile ?? (await refreshProfile());
    router.replace(postAuthDestination({ onboarded: !!p?.onboarded, scanId }));
  }, [scanId, profile, refreshProfile, router, toast]);

  // Back from the provider (redirect mode): finish the handoff once signed in.
  // A cancelled sign-in simply lands back here, still signed out, scan intact.
  useEffect(() => {
    if (!user || !scanId || getHandoff() !== scanId) return;
    queueMicrotask(() => void handoff());
  }, [user, scanId, handoff]);

  // Show why a redirect sign-in failed (stashed by the auth layer on return).
  useEffect(() => {
    if (user) return;
    const msg = consumeAuthError();
    if (msg) queueMicrotask(() => { setAuthError(msg); setSignupOpen(true); });
  }, [user]);

  const openSignup = () => { setAuthError(''); setSignupOpen(true); };
  // Remember the scan BEFORE sign-in starts, the redirect navigates away.
  const beforeSignIn = () => { if (scanId) { setPendingScan(scanId); setHandoff(scanId); } };

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

  return (
    <div className="min-h-screen bg-bg vg-fade pb-28">
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-[960px] mx-auto flex items-center gap-[11px]">
          <Logo size={28} />
          <span className="ml-auto font-mono text-[13.5px] text-label">{scan ? repoDisplay(scanLabel(scan)) : '…'}</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-10">
        {/* grade hero */}
        <div className="text-center">
          <GradeLetter letter={grade ?? '…'} color={grade ? GRADE_COLOR[grade] : '#B0B0AC'} size={130} className="inline-block vg-pop" />
          <div className="mt-1 inline-flex items-center gap-[7px] font-mono text-[13px] tracking-[0.1em]" style={{ color: hero?.labelColor ?? '#5b5a56' }}>
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

        {/* why you got this grade + what's protecting you (fixes stay locked below) */}
        {!running && grade && (
          <div className="mt-8">
            <GradeExplainer grade={grade as Grade} critical={counts.critical} warnings={counts.warnings} passed={scan?.passed} />
          </div>
        )}

        {/* findings with locked fixes */}
        <div className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {findings.length === 0 && running && <div className="text-center text-muted py-10">Findings will appear here as they’re found…</div>}
          {findings.length === 0 && !running && <div className="text-center text-muted py-10">No issues found.</div>}
          {findings.map((f, i) => (
            <div
              key={f.id}
              className="py-5 vg-rise"
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
                      <button type="button" onClick={user ? () => void handoff() : openSignup} className="vg-press cursor-pointer inline-flex items-center gap-[7px] bg-ink text-white font-semibold text-[13.5px] px-[14px] py-2 rounded-full border-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="5" y="11" width="14" height="9" rx="2" stroke="#fff" strokeWidth="1.8" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="1.8" />
                        </svg>
                        Fix locked
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* sticky sign-up / save bar */}
      {!running && scan?.status === 'done' && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border px-6 py-[14px]">
          <div className="max-w-[960px] mx-auto flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              {findings.length > 0 ? (
                <>
                  <div className="font-semibold text-[16.5px] text-ink">See how to fix all <span className="tnum">{findings.length}</span> issues</div>
                  <div className="text-[14px] text-muted">Your scan is saved to your account, no re-scan.</div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-[16.5px] text-ink">Keep it this way</div>
                  <div className="text-[14px] text-muted">Save this scan and get alerted if something breaks.</div>
                </>
              )}
            </div>
            {user ? (
              scan.ownerUid == null ? (
                <button onClick={() => void handoff()} disabled={handingOff} className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px] disabled:opacity-70">{handingOff ? 'Saving…' : 'Save to my account'}</button>
              ) : (
                <Link href="/dashboard" className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px]">Go to dashboard</Link>
              )
            ) : (
              <button onClick={openSignup} className="vg-press cursor-pointer bg-ink text-white font-medium text-[15.5px] rounded-[10px] px-[24px] py-[13px]">
                {findings.length > 0 ? 'Sign up free to see how to fix these' : 'Sign up free'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* sign-up sheet: sign-in starts HERE, so a cancelled sign-in returns here */}
      {signupOpen && !user && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0" onClick={() => setSignupOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="vg-signup-title" className="relative w-full max-w-[460px] bg-card rounded-[18px] p-6 sm:p-7 vg-fade" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSignupOpen(false)} aria-label="Close" className="absolute right-4 top-4 bg-transparent border-0 text-muted hover:text-ink cursor-pointer text-[20px] leading-none">×</button>
            <h2 id="vg-signup-title" className="font-semibold text-[21px] tracking-[-0.02em] text-center">Sign up free to see how to fix these</h2>
            <p className="text-[14.5px] text-muted text-center mt-2 mb-6 leading-[1.5]">This scan goes straight to your dashboard. Free includes one full fix, Guard unlocks the rest.</p>
            {authError && <p role="alert" className="mb-4 text-[14px] text-red font-semibold text-center">{authError}</p>}
            <SignInButtons onBeforeStart={beforeSignIn} onSuccess={() => void handoff()} />
          </div>
        </div>
      )}
    </div>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
