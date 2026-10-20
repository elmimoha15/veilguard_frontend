'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { checkUrl } from '@/lib/url';
import { saveOnboarding, subscribeScan, type ScanDoc, type OnboardingAnswers } from '@/lib/scans';
import { startUrlScan } from '@/lib/startScan';
import { claimScanForUser, claimPendingScan } from '@/lib/claim';
import {
  readEntry, resolveStep, nextStep, prevStep, questionSteps, shouldSkipBackend, detectedBackend,
  finishDestination, setPendingScan, getPendingScan, type ObStep,
} from '@/lib/onboardingFlow';
import Logo from '@/components/ui/Logo';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { PillButton } from './primitives';
import { GRADE_COLOR } from '@/lib/adapters';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import SignInButtons from '@/components/auth/SignInButtons';
import FullScreenLoader from '@/components/auth/FullScreenLoader';

// Short, value-first onboarding (see lib/onboardingFlow): the visitor usually
// arrives from /results with their scan already done. Sign up (only if signed
// out) → up to 3 skippable questions → dashboard. Backend is skipped when the
// scan already detected it. Plan choice and alert email are no longer steps:
// everyone starts on Free, and alerts default to the account email (Settings).

type Opt = { label: string; logo?: BrandLogoName };
const BUILT_WITH: Opt[] = [
  { label: 'Lovable', logo: 'lovable' }, { label: 'Bolt', logo: 'bolt' }, { label: 'Cursor', logo: 'cursor' },
  { label: 'Replit', logo: 'replit' }, { label: 'v0', logo: 'v0' },
  { label: 'Claude Code', logo: 'claude' }, { label: 'Windsurf', logo: 'windsurf' }, { label: 'Something else' },
];
const BACKEND: Opt[] = [
  { label: 'Supabase', logo: 'supabase' }, { label: 'Firebase', logo: 'firebase' },
  { label: 'Other' }, { label: 'Not sure' },
];
const HEARD_FROM: Opt[] = [
  { label: 'TikTok' }, { label: 'Instagram' }, { label: 'X' }, { label: 'Reddit' },
  { label: 'YouTube' }, { label: 'Google' }, { label: 'A friend' }, { label: 'Other' },
];

/** Issues on a finished scan (critical + warnings, as the results page counts them). */
function issueCount(scan: ScanDoc): number {
  const c = scan.counts;
  if (!c) return 0;
  return (c.critical ?? 0) + (c.high ?? 0) + (c.medium ?? 0) + (c.low ?? 0);
}

/** How long to wait for the profile before showing the questions anyway. */
const PROFILE_WAIT_MS = 8000;

export default function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const entry = useMemo(() => readEntry(params), [params]);
  const { ob, setOb, clearOb, toast } = useApp();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [finishing, setFinishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  const [profileWaitOver, setProfileWaitOver] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanDoc | null>(null);
  const legacyStarted = useRef(false);
  const bounced = useRef(false);

  // The scan to claim: handed over in the URL (/results → ?scan=), else one this
  // browser was about to sign up for, else whatever the draft remembers.
  const scanId = entry.scanId ?? pending ?? ob.scanId;
  const plan = entry.plan === 'guard' || ob.plan === 'guard' ? 'guard' : 'free';
  const ctx = { signedIn: !!user, skipBackend: shouldSkipBackend(scan?.stack) };
  const at = resolveStep(ob.at, ctx);
  const questions = questionSteps(ctx);
  const isLegacy = !!entry.legacyUrl;

  // Read the pending claim marker after mount (localStorage is client-only).
  useEffect(() => {
    const id = getPendingScan();
    if (id) queueMicrotask(() => setPending(id));
  }, []);

  // Watch the scan for its detected backend (ownerless scans are public; once
  // claimed, only the owner can read it, which is us).
  useEffect(() => {
    if (!scanId) return;
    return subscribeScan(scanId, setScan);
  }, [scanId, user]);

  // Old `/onboarding?url=…` links (marketing scan boxes before this flow): start
  // the scan and show the result first, like the landing page does now.
  useEffect(() => {
    if (!entry.legacyUrl || loading || legacyStarted.current) return;
    legacyStarted.current = true;
    const c = checkUrl(entry.legacyUrl);
    if (!c.ok) { router.replace('/'); return; }
    void startUrlScan(c.url!).then((r) => {
      if (r.ok) router.replace(`/scanning?scanId=${encodeURIComponent(r.scanId)}`);
      else setLegacyError(r.message);
    });
  }, [entry.legacyUrl, loading, router]);

  // Already onboarded (an existing account that signed in from /results, or a
  // returning user on an old link): claim the scan, never show the questions.
  useEffect(() => {
    if (isLegacy || loading || !user || !profile?.onboarded || bounced.current) return;
    bounced.current = true;
    void (async () => {
      if (scanId) await claimScanForUser(scanId).catch(() => null);
      else await claimPendingScan();
      clearOb();
      router.replace(finishDestination(plan));
    })();
  }, [isLegacy, loading, user, profile, scanId, plan, clearOb, router]);

  // Don't hang on a loader if /me is slow or failing: after a while, show the
  // questions (finishing re-checks and never overwrites an onboarded profile).
  useEffect(() => {
    if (!user || profile) return;
    const t = setTimeout(() => setProfileWaitOver(true), PROFILE_WAIT_MS);
    return () => clearTimeout(t);
  }, [user, profile]);

  // Back from a cancelled OAuth (bfcache restore): never leave a stuck loader.
  useEffect(() => {
    const reset = () => setFinishing(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const toggle = (key: 'builtWith' | 'backend' | 'heardFrom', label: string) => {
    const cur = ob[key];
    setOb({ [key]: cur.includes(label) ? cur.filter((v) => v !== label) : [...cur, label] });
  };

  const finish = async () => {
    if (!user || finishing) return;
    setFinishing(true);
    setSaveError(null);

    // Claim first, so the scan is on the account before the dashboard loads.
    // Idempotent: a scan already claimed after the OAuth return is a no-op 200.
    if (scanId) {
      const c = await claimScanForUser(scanId).catch(() => null);
      if (c?.status === 409) toast('That scan belongs to another account, so it wasn’t added to yours.', '#E5484D');
    } else {
      await claimPendingScan();
    }

    // A profile that turned out to be onboarded already keeps its answers.
    const fresh = profile ?? (await refreshProfile());
    if (!fresh?.onboarded) {
      const detected = shouldSkipBackend(scan?.stack);
      const answers: OnboardingAnswers = {
        builtWith: ob.builtWith,
        backend: detected ? detectedBackend(scan?.stack) : ob.backend,
        ...(detected ? { backendDetected: true } : {}),
        heardFrom: ob.heardFrom,
        scanTarget: 'url',
      };
      // Must land: without onboarded:true, AuthGate would send them back here.
      let saved = false;
      for (let i = 0; i < 3 && !saved; i++) {
        try { await saveOnboarding(user.uid, answers); saved = true; }
        catch { await new Promise((r) => setTimeout(r, 600 * (i + 1))); }
      }
      if (!saved) {
        setFinishing(false);
        setSaveError('We couldn’t save your setup. Check your connection and try again.');
        return;
      }
      await refreshProfile();
    }
    clearOb();
    router.replace(finishDestination(plan));
  };

  const go = (dir: 'next' | 'prev') => {
    const to = dir === 'next' ? nextStep(at, ctx) : prevStep(at, ctx);
    if (to === 'done') { void finish(); return; }
    if (to) setOb({ at: to });
  };
  // Skip clears this question's answer and moves on (skipping the last one finishes).
  const skip = () => {
    if (at === 'builtWith') setOb({ builtWith: [] });
    if (at === 'backend') setOb({ backend: [] });
    if (at === 'heard') setOb({ heardFrom: [] });
    go('next');
  };

  // ── loaders / terminal states ──
  if (isLegacy) {
    if (!legacyError) return <FullScreenLoader variant="loading" />;
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
        <Logo size={28} />
        <h1 className="font-semibold text-[22px] mt-6">We couldn’t start your scan</h1>
        <p className="text-[15px] text-muted mt-2 max-w-[44ch]">{legacyError}</p>
        <div className="mt-6"><PillButton onClick={() => router.replace('/')}>Back to home</PillButton></div>
      </div>
    );
  }
  if (finishing) return <FullScreenLoader variant="creating" />;
  if (loading) return <FullScreenLoader variant="loading" />;
  if (user && profile?.onboarded) return <FullScreenLoader variant="loading" />;
  if (user && !profile && !profileWaitOver) return <FullScreenLoader variant="loading" />;

  const qIndex = questions.indexOf(at);
  const isLastQuestion = qIndex === questions.length - 1;
  const canGoBack = prevStep(at, ctx) !== null;

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="flex items-center justify-between px-6 sm:px-7 py-[22px]">
          <Logo size={28} />
          {at !== 'signup' && (
            <button onClick={skip} className="bg-transparent border-0 font-medium text-[15px] text-label hover:text-ink transition-colors cursor-pointer">Skip</button>
          )}
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-5 py-20">
        <div key={at} className="w-full max-w-[620px] vg-fade">
          {at === 'signup' && (
            <>
              {scan?.status === 'done' && scan.grade && (
                <div className="mx-auto mb-6 w-fit flex items-center gap-3 rounded-[12px] border border-border bg-card px-4 py-[10px]">
                  <span className="font-semibold text-[22px] leading-none tnum" style={{ color: GRADE_COLOR[scan.grade] }}>{scan.grade}</span>
                  <span className="text-[14px] text-muted">
                    <span className="tnum font-medium text-ink">{issueCount(scan)}</span> {issueCount(scan) === 1 ? 'issue' : 'issues'} found on <span className="font-mono text-ink">{repoDisplay(scanLabel(scan))}</span>
                  </span>
                </div>
              )}
              <StepHead
                q={scanId ? 'Sign up free to see how to fix these' : 'Create your free account'}
                hint={scanId
                  ? 'Your scan is saved and waiting. Sign in and it’s on your dashboard, no re-scan.'
                  : 'Sign in, answer a couple of quick questions, then scan your first app.'}
              />
              <SignInButtons
                onSuccess={() => { /* the signed-in user moves straight to the questions */ }}
                onBeforeStart={() => { if (scanId) setPendingScan(scanId); }}
              />
              {scanId && (
                <div className="mt-6 text-center">
                  <Link href={`/results?scanId=${encodeURIComponent(scanId)}`} className="text-[14px] text-muted hover:text-ink underline underline-offset-2">Back to your results</Link>
                </div>
              )}
            </>
          )}

          {at === 'builtWith' && (
            <CardGrid q="What did you build your app with?" hint="Pick all that apply, people often use more than one."
              options={BUILT_WITH} value={ob.builtWith} onPick={(l) => toggle('builtWith', l)} />
          )}

          {at === 'backend' && (
            <CardGrid q="What’s your backend?" hint="Where your data and users live. Pick all that apply."
              options={BACKEND} value={ob.backend} onPick={(l) => toggle('backend', l)} />
          )}

          {at === 'heard' && (
            <CardGrid q="Where did you hear about Veilguard?" hint="Helps us know what’s working. Pick all that apply."
              options={HEARD_FROM} value={ob.heardFrom} onPick={(l) => toggle('heardFrom', l)} />
          )}

          {saveError && <p role="alert" className="mt-6 text-center text-[14px] font-semibold text-red">{saveError}</p>}

          {at !== 'signup' && (
            <div className="mt-10 flex items-center justify-between gap-4">
              <button onClick={() => go('prev')} className="bg-transparent border-0 text-muted font-medium text-[15px] hover:text-ink transition-colors cursor-pointer" style={{ visibility: canGoBack ? 'visible' : 'hidden' }}>Back</button>
              <div className="flex gap-[7px]" aria-label={`Question ${qIndex + 1} of ${questions.length}`}>
                {questions.map((s: ObStep, i) => {
                  const active = i === qIndex; const doneStep = i < qIndex;
                  return <span key={s} className="h-[6px] rounded-full transition-all duration-200" style={{ width: active ? 22 : 6, background: active ? '#0A0A0A' : doneStep ? '#B0B0AC' : '#E2E2DF' }} />;
                })}
              </div>
              <PillButton onClick={() => go('next')}>{saveError ? 'Try again' : isLastQuestion ? 'Finish' : 'Continue'}</PillButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── small pieces ───────────────────────────────────────────────────────── */
function StepHead({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="text-center mb-[28px]">
      <h1 className="font-medium text-[clamp(23px,3.2vw,29px)] tracking-[-0.03em] m-0 text-balance">{q}</h1>
      <p className="text-[15px] text-muted mt-2 max-w-[52ch] mx-auto leading-[1.5]">{hint}</p>
    </div>
  );
}

function CardGrid({ q, hint, options, value, onPick }: { q: string; hint: string; options: Opt[]; value: string[]; onPick: (v: string) => void }) {
  return (
    <>
      <StepHead q={q} hint={hint} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {options.map((o) => {
          const selected = value.includes(o.label);
          return (
            <button key={o.label} onClick={() => onPick(o.label)} aria-pressed={selected}
              className="vg-press text-left bg-card rounded-[14px] p-4 flex items-center gap-3 min-h-[56px] border transition-colors"
              style={{ borderColor: selected ? '#0A0A0A' : 'var(--color-border)', background: selected ? 'var(--color-bg-soft)' : '#fff' }}>
              {o.logo && <BrandLogo name={o.logo} size={22} icon className="shrink-0" />}
              <span className="font-medium text-[15px] text-ink flex-1">{o.label}</span>
              {selected && (
                <span className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: '#0A0A0A' }} aria-hidden>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
