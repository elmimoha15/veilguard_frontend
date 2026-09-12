'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp, OB_KEY } from './state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { checkUrl } from '@/lib/url';
import { saveOnboarding, subscribeScan, subscribeFindings, type ScanDoc, type BackendFinding } from '@/lib/scans';
import { toUiFinding, toUiCounts } from '@/lib/adapters';
import { scanFailure, startFailure } from '@/lib/scanError';
import Logo from '@/components/ui/Logo';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { GradeRing } from './ui';
import { PillButton, SectionLabel, GradeSquare } from './primitives';
import { SEV_TINT, type Grade } from './data';
import SignInButtons from '@/components/auth/SignInButtons';
import FullScreenLoader from '@/components/auth/FullScreenLoader';

// Signup-first funnel: questions (1-4) → URL (5, skipped when it came from a
// marketing scan box) → sign up (6) → gated result (7, the scan runs here, on the
// account) → alert email (8) → pick plan (9, the final step; Guard goes straight
// to checkout) → dashboard.
const HEARD = 4; // "where did you hear about us?"
const URL_STEP = 5; // the URL step; skipped when the URL came from marketing
const SIGNUP = 6;
const RESULT = 7; // scan runs here (post-signup), shown gated
const EMAIL = 8;
const PLAN = 9;

type Opt = { label: string; logo?: BrandLogoName };
const BUILT_WITH: Opt[] = [
  { label: 'Lovable', logo: 'lovable' }, { label: 'Bolt', logo: 'bolt' }, { label: 'Cursor', logo: 'cursor' },
  { label: 'Replit', logo: 'replit' }, { label: 'v0', logo: 'v0' },
  { label: 'Claude Code', logo: 'claude' }, { label: 'Windsurf', logo: 'windsurf' }, { label: 'Something else' },
];
const BACKEND: Opt[] = [
  { label: 'Supabase', logo: 'supabase' }, { label: 'Firebase', logo: 'firebase' },
  { label: 'Other / custom' }, { label: 'Not sure' },
];
const HANDLES: string[] = [
  'User accounts & logins',
  'Payments or billing',
  'Personal data (names, emails)',
  'File or image uploads',
  'Emails or notifications',
  'An admin dashboard',
];
const HEARD_FROM: Opt[] = [
  { label: 'Google search' }, { label: 'X (Twitter)' }, { label: 'Reddit' },
  { label: 'YouTube' }, { label: 'Friend or colleague' }, { label: 'Somewhere else' },
];
const PLANS: { key: 'free' | 'guard'; name: string; price: string; features: string[]; featured?: boolean }[] = [
  { key: 'free', name: 'Free', price: '$0', features: ['URL security scan', 'Full A to F grade, every issue explained', 'One sample fix unlocked'] },
  { key: 'guard', name: 'Guard', price: '$19/mo', features: ['Everything in Free', 'GitHub repo + folder scans', 'All fixes, code + AI prompts', 'Monitoring + instant alerts'], featured: true },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { ob, setOb, clearOb, toast } = useApp();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  // Guards the post-signup scan kickoff so it fires exactly once (a ref, so toggling
  // it never re-renders / re-triggers the effect); `retryTick` lets a failed start
  // re-run the effect on demand, and `startError` surfaces a create failure.
  const scanStartRef = useRef(false);
  const [retryTick, setRetryTick] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  // The last "question" step before signup: marketing entrants already gave a URL,
  // so their questions end at HEARD; direct visitors also answer the URL step.
  const qLast = ob.fromMarketing ? HEARD : URL_STEP;
  // True while we're saving + navigating out (to dashboard / checkout). We render a
  // neutral loader instead of the wizard so step 1 never flashes during the redirect.
  const [finishing, setFinishing] = useState(false);
  // Which loader copy to show while finishing ('checkout' when heading to Polar).
  const [finishVariant, setFinishVariant] = useState<'creating' | 'loading' | 'checkout'>('creating');
  const step = ob.step;

  // Bounce an already-onboarded user to the dashboard, but ONLY if they land here
  // fresh (step 1, no scan in flight). If
  // they're mid-wizard, e.g. they signed up with an account that had onboarded
  // before, or just refreshed the plan step, let them resume/finish rather than
  // yanking them out and losing their place.
  useEffect(() => {
    if (loading || !user || !profile?.onboarded) return;
    if (ob.step > 1 || ob.scanId) return; // mid-onboarding → resume, don't bounce
    clearOb();
    router.replace('/dashboard');
  }, [loading, user, profile, ob.step, ob.scanId, router, clearOb]);
  // Prefill the URL from a marketing scan box (?url=…) once, and mark the entry so
  // onboarding skips its own URL step. Only seeds a fresh draft (step 1, no URL yet).
  useEffect(() => {
    const raw = params.get('url');
    if (!raw || ob.url || ob.step > 1) return;
    const c = checkUrl(raw);
    if (c.ok) setOb({ url: c.url!, fromMarketing: true });
  }, [params, ob.url, ob.step, setOb]);
  // Prefill the alert email from the account once signed in.
  useEffect(() => { if (user?.email && !ob.email) setOb({ email: user.email }); }, [user, ob.email, setOb]);
  // If we reach the signup step but the user is already signed in, skip it.
  useEffect(() => { if (step === SIGNUP && user) setOb({ step: RESULT }); }, [step, user, setOb]);
  // Post-signup: kick off the scan on the account when we land on the result step.
  // Runs for both popup and redirect sign-in (redirect resumes straight into RESULT).
  // A ref guards single-fire (never gates on `busy`, whose changes would otherwise
  // re-run this effect and drop the just-created scanId).
  useEffect(() => {
    if (step !== RESULT || !user || ob.scanId || scanStartRef.current) return;
    scanStartRef.current = true;
    (async () => {
      const c = checkUrl(ob.url);
      if (!c.ok) { setOb({ step: EMAIL }); return; } // nothing to scan, move on
      try {
        const r = await api.createScan(c.url!);
        if (!r.ok || !r.data.scanId) { scanStartRef.current = false; setStartError(r.data.error || 'We couldn’t start your scan.'); return; }
        setStartError(null);
        setOb({ scanId: r.data.scanId });
      } catch { scanStartRef.current = false; setStartError('Something went wrong starting your scan.'); }
    })();
  }, [step, user, ob.scanId, ob.url, retryTick, setOb]);
  // Resilience: coming Back from a cancelled OAuth/checkout (bfcache restore) must
  // never leave a stuck loader/spinner. Reset the transient flags on pageshow.
  useEffect(() => {
    const reset = () => { setFinishing(false); setBusy(false); };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  // Watchdog: if a start/save/checkout call never returns, clear the flags after a
  // while so the user can retry rather than staring at a frozen loader. (Answers
  // stay safe in sessionStorage.)
  useEffect(() => {
    if (!busy && !finishing) return;
    const t = setTimeout(() => { setBusy(false); setFinishing(false); }, 90_000);
    return () => clearTimeout(t);
  }, [busy, finishing]);

  const answers = () => ({
    builtWith: ob.builtWith, backend: ob.backend, handles: ob.handles,
    heardFrom: ob.heardFrom, scanTarget: 'url' as const,
  });

  const afterReveal = () => setOb({ step: EMAIL });
  const afterSignup = () => setOb({ step: RESULT });
  // Redirect sign-in navigates away, persist the post-signup step synchronously first
  // so the return resumes straight into the result step (where the scan kicks off).
  const persistPostSignup = () => { try { window.sessionStorage.setItem(OB_KEY, JSON.stringify({ ...ob, step: RESULT })); } catch { /* storage off */ } };

  const finishTo = async (path: string) => {
    setFinishVariant('loading');
    setFinishing(true);
    if (user) { await saveOnboarding(user.uid, answers(), ob.email).catch(() => {}); await refreshProfile(); }
    clearOb();
    router.replace(path);
  };

  // Final step (pick plan): user is signed in now, persist answers + email (sets
  // onboarded:true) then go to dashboard, or hand off to Polar checkout for Guard.
  // `finishing` flips first so the wizard never flashes step 1 during the redirect.
  const finishOnboarding = async () => {
    if (busy || finishing) return;
    if (!user) { setOb({ step: SIGNUP }); return; }
    setBusy(true);
    setFinishVariant(ob.plan === 'guard' ? 'checkout' : 'creating');
    setFinishing(true);
    await saveOnboarding(user.uid, answers(), ob.email).catch(() => {});
    if (ob.plan === 'guard') {
      const res = await api.createCheckout('/dashboard');
      // Answers are already saved server-side, so clear the local draft: a cancelled
      // checkout returns as an onboarded user with no stale draft (routed on cleanly).
      if (res.ok && res.data.url) { clearOb(); window.location.assign(res.data.url); return; }
      setBusy(false);
      setFinishing(false);
      toast(res.data.error || 'Could not start checkout, try again', '#E5484D');
      return;
    }
    await refreshProfile();
    clearOb();
    router.replace('/dashboard');
  };

  const onSkip = () => { if (user) void finishTo('/dashboard'); else setOb({ step: SIGNUP }); };

  const next = () => {
    if (step === qLast) return void setOb({ step: user ? RESULT : SIGNUP });
    if (step === RESULT) return void setOb({ step: EMAIL });
    if (step === PLAN) return void finishOnboarding();
    setOb({ step: step + 1 }); // HEARD → URL, URL → SIGNUP, EMAIL → PLAN, plain steps
  };
  const prev = () => {
    if (step === PLAN) { setOb({ step: EMAIL }); return; }
    if (step === EMAIL) { setOb({ step: RESULT }); return; }
    if (step === RESULT) { setOb({ step: user ? qLast : SIGNUP }); return; }
    if (step === SIGNUP) { setOb({ step: qLast }); return; }
    if (step > 1) setOb({ step: step - 1 });
  };

  const toggleHandle = (label: string) => {
    const has = ob.handles.includes(label);
    setOb({ handles: has ? ob.handles.filter((h) => h !== label) : [...ob.handles, label] });
  };
  const toggleBuiltWith = (label: string) => {
    const has = ob.builtWith.includes(label);
    setOb({ builtWith: has ? ob.builtWith.filter((b) => b !== label) : [...ob.builtWith, label] });
  };
  const toggleBackend = (label: string) => {
    const has = ob.backend.includes(label);
    setOb({ backend: has ? ob.backend.filter((b) => b !== label) : [...ob.backend, label] });
  };
  const toggleHeard = (label: string) => {
    const has = ob.heardFrom.includes(label);
    setOb({ heardFrom: has ? ob.heardFrom.filter((h) => h !== label) : [...ob.heardFrom, label] });
  };

  // Neutral loader while we redirect out (prevents the step-1 flash), and while an
  // already-onboarded user is being bounced to the dashboard.
  if (finishing) return <FullScreenLoader variant={finishVariant} />;
  if (!loading && user && profile?.onboarded) return <FullScreenLoader variant="loading" />;

  // ── Gated result (post-signup): the scan runs on the account, then we show the
  // grade + one finding, the rest locked behind an upgrade. ──
  if (step === RESULT) {
    const retryStart = () => { setStartError(null); scanStartRef.current = false; setRetryTick((t) => t + 1); };
    return (
      <div className="min-h-screen bg-bg relative">
        <div className="absolute inset-x-0 top-0 z-10"><Header onSkip={onSkip} busy={busy} /></div>
        <div className="min-h-screen flex items-center justify-center px-5 py-20">
          {!ob.scanId && startError ? (
            <div className="w-full max-w-[560px] text-center vg-fade">
              <div className="mx-auto mb-1 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: SEV_TINT.WARNING.bg }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={SEV_TINT.WARNING.fg} strokeWidth="1.8" aria-hidden><path d="M12 3l9 16H3z" strokeLinejoin="round" /><path d="M12 10v4" strokeLinecap="round" /><circle cx="12" cy="16.8" r="0.7" fill={SEV_TINT.WARNING.fg} stroke="none" /></svg>
              </div>
              <h1 className="font-semibold text-[24px] tracking-[-0.02em] mt-3">We couldn’t start your scan</h1>
              <p className="text-[15px] text-muted mt-2 max-w-[46ch] mx-auto leading-[1.55]">{startError}</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <PillButton onClick={retryStart}>Try again</PillButton>
                <PillButton variant="outline" onClick={afterReveal}>Skip</PillButton>
              </div>
            </div>
          ) : (
            <OnboardingResult scanId={ob.scanId} onContinue={afterReveal} onRetried={(id) => setOb({ scanId: id })} />
          )}
        </div>
      </div>
    );
  }

  const nextLabel = busy
    ? 'Just a sec…'
    : step === PLAN
      ? (ob.plan === 'guard' ? 'Continue to checkout' : 'Finish')
      : 'Continue';

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="absolute inset-x-0 top-0 z-10"><Header onSkip={onSkip} busy={busy} /></div>

      <div className="min-h-screen flex items-center justify-center px-5 py-20">
        <div key={step} className="w-full max-w-[620px] vg-fade">
          {step === 1 && (
            <CardGrid q="What did you build it with?" hint="Pick all that apply, people often use more than one." multi
              options={BUILT_WITH} value={ob.builtWith} onPick={toggleBuiltWith} />
          )}

          {step === 2 && (
            <CardGrid q="What’s your backend?" hint="Where your data and users live. Pick all that apply." multi
              options={BACKEND} value={ob.backend} onPick={toggleBackend} />
          )}

          {step === 3 && (
            <>
              <StepHead q="Does your app handle any of these?" hint="Pick all that apply. Helps us show what’s most at stake." />
              <div className="flex flex-col gap-2 max-w-[460px] mx-auto">
                {HANDLES.map((label) => {
                  const selected = ob.handles.includes(label);
                  return (
                    <button key={label} onClick={() => toggleHandle(label)}
                      className="vg-press flex items-center gap-3 rounded-[12px] px-4 py-[13px] text-left border transition-colors"
                      style={{ borderColor: selected ? '#0A0A0A' : 'var(--color-border)', background: selected ? 'var(--color-bg-soft)' : '#fff' }}>
                      <Checkbox on={selected} />
                      <span className="font-medium text-[15px] text-ink">{label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === HEARD && (
            <CardGrid q="Where did you hear about us?" hint="Helps us know what’s working. Pick all that apply." multi
              options={HEARD_FROM} value={ob.heardFrom} onPick={toggleHeard} />
          )}

          {step === URL_STEP && (
            <>
              <StepHead q="What’s your app’s live URL?" hint="We’ll scan it the way an attacker would, right after you sign up." />
              <label className="mx-auto max-w-[460px] flex items-center gap-[10px] bg-white rounded-[12px] px-[16px] min-h-[54px] border border-border focus-within:shadow-[0_0_0_2px_#0A0A0A] transition-shadow">
                <span className="font-mono text-tertiary text-[15px]">https://</span>
                <input value={ob.url} onChange={(e) => setOb({ url: e.target.value })} aria-label="App URL" placeholder="your-app.com" style={{ outline: 'none' }} className="flex-1 border-0 outline-none bg-transparent text-[16px] min-w-0" autoFocus />
              </label>
              {ob.url.trim() !== '' && !checkUrl(ob.url).ok && (
                <p className="mx-auto max-w-[460px] mt-2 text-[13.5px] text-left" style={{ color: '#C23B3F' }}>
                  {checkUrl(ob.url).error || 'That doesn’t look like a valid URL.'}
                </p>
              )}
            </>
          )}

          {step === EMAIL && (
            <>
              <StepHead q="Where should we send security alerts?" hint="Last step. We’ll email you the moment something breaks." />
              <input type="email" value={ob.email} onChange={(e) => setOb({ email: e.target.value })} aria-label="Alert email" placeholder="you@company.com" style={{ outline: 'none' }}
                className="mx-auto block w-full max-w-[460px] bg-white rounded-[12px] px-[16px] py-[15px] text-[16px] outline-none border border-border focus:shadow-[0_0_0_2px_#0A0A0A] transition-shadow" />
            </>
          )}

          {step === SIGNUP && (
            <>
              <StepHead q="Create your account to see your grade" hint="Sign in and we’ll scan your app right away, then show your security grade and what to fix." />
              <SignInButtons onSuccess={afterSignup} onBeforeRedirect={persistPostSignup} />
            </>
          )}

          {step === PLAN && (
            <>
              <StepHead q="Pick your plan" hint="Free grades any URL. Guard unlocks code scans, connections, monitoring and every AI fix. Change anytime in Billing." />
              <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                  const selected = ob.plan === p.key;
                  return (
                    <button key={p.key} onClick={() => setOb({ plan: p.key })}
                      className="vg-press relative overflow-hidden text-left bg-card rounded-[14px] p-5 flex flex-col border transition-colors"
                      style={{ borderColor: selected ? '#0A0A0A' : 'var(--color-border)' }}>
                      {p.featured && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-ink" />}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-[17px] text-ink">{p.name}</span>
                        <span className="font-mono text-[13px] text-label">{p.price}</span>
                      </div>
                      <ul className="mt-3 flex flex-col gap-[9px] text-[13.5px] leading-[1.4] flex-1">
                        {p.features.map((f) => <li key={f} className="flex gap-2"><Check /><span>{f}</span></li>)}
                      </ul>
                      <span className="mt-4 rounded-[10px] py-[10px] text-center font-medium text-[14px]"
                        style={selected ? { background: '#0A0A0A', color: '#fff' } : { background: 'var(--color-bg-soft)', color: 'var(--color-muted)' }}>
                        {selected ? 'Selected' : 'Choose'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* nav under the step */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button onClick={prev} className="bg-transparent border-0 text-muted font-medium text-[15px] hover:text-ink transition-colors cursor-pointer" style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>Back</button>
            {step <= qLast ? (
              <div className="flex gap-[7px]">
                {Array.from({ length: qLast }, (_, i) => {
                  const n = i + 1; const active = n === step; const doneStep = n < step;
                  return <span key={n} className="h-[6px] rounded-full transition-all duration-200" style={{ width: active ? 22 : 6, background: active ? '#0A0A0A' : doneStep ? '#B0B0AC' : '#E2E2DF' }} />;
                })}
              </div>
            ) : <span />}
            {step === SIGNUP
              ? <span />
              : <PillButton onClick={next} disabled={busy || (step === URL_STEP && !checkUrl(ob.url).ok)}>{nextLabel}</PillButton>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── gated result view (post-signup) ───────────────────────────────────────
 * The scan runs on the account, then we show the grade + the single worst finding
 * (its fix locked) with every other issue masked behind an upgrade. The message
 * pushes Guard, which also unlocks a full repo/code scan, not just the URL. */
function OnboardingResult({ scanId, onContinue, onRetried }: { scanId: string | null; onContinue: () => void; onRetried: (id: string) => void }) {
  const { toast } = useApp();
  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [raw, setRaw] = useState<(BackendFinding & { id: string })[]>([]);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    if (!scanId) return;
    const u1 = subscribeScan(scanId, setScan);
    const u2 = subscribeFindings(scanId, setRaw);
    return () => { u1(); u2(); };
  }, [scanId]);

  const status = scan?.status;
  const p = scan?.progress;
  const pct = p && p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  const done = status === 'done';
  const errored = status === 'error';
  const grade = scan?.grade;
  const fail = errored && scan ? scanFailure(scan) : null;

  const findings = raw.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const counts = toUiCounts(scan, findings);
  // Only real issues get the gated reveal, never the "passed" checks.
  const issues = findings.filter((f) => f.sev !== 'PASSED');
  const first = issues[0];
  const rest = issues.slice(1);

  const retry = async () => {
    if (!scan || retrying) return;
    setRetrying(true);
    const res = await api.createScan(scan.sources?.url || scan.target.value);
    if (res.ok && res.data.scanId) { onRetried(res.data.scanId); return; }
    if (res.data.error) console.error('[onboarding retry] scan start failed:', res.data.error);
    toast(startFailure(res.status, res.data).message, '#C23B3F');
    setRetrying(false);
  };

  // ── still scanning (or the scan hasn't been created yet) ──
  if (!scanId || (!done && !errored)) {
    return (
      <div className="w-full max-w-[560px] text-center vg-fade">
        <div className="mx-auto w-[180px] h-[180px]">
          <GradeRing size={180} pct={pct || 6} color="#0A0A0A" strokeWidth={9} animate>
            <span className="tnum font-semibold text-[40px] leading-none">{pct}<span className="text-[16px]">%</span></span>
            <SectionLabel className="mt-1">Scanning</SectionLabel>
          </GradeRing>
        </div>
        <p className="text-[15px] text-muted mt-5">{p?.phase || 'Starting your scan…'}</p>
      </div>
    );
  }

  // ── the scan failed ──
  if (errored) {
    return (
      <div className="w-full max-w-[560px] text-center vg-fade">
        <div className="mx-auto mb-1 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: SEV_TINT.WARNING.bg }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={SEV_TINT.WARNING.fg} strokeWidth="1.8" aria-hidden><path d="M12 3l9 16H3z" strokeLinejoin="round" /><path d="M12 10v4" strokeLinecap="round" /><circle cx="12" cy="16.8" r="0.7" fill={SEV_TINT.WARNING.fg} stroke="none" /></svg>
        </div>
        <h1 className="font-semibold text-[24px] tracking-[-0.02em] mt-3">{fail?.title ?? 'We couldn’t finish that scan'}</h1>
        <p className="text-[15px] text-muted mt-2 max-w-[46ch] mx-auto leading-[1.55]">{fail?.body ?? 'You can retry it any time.'}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <PillButton onClick={retry} disabled={retrying}>{retrying ? 'Starting…' : 'Try again'}</PillButton>
          <PillButton variant="outline" onClick={onContinue}>Continue</PillButton>
        </div>
      </div>
    );
  }

  // ── done: gated result ──
  return (
    <div className="w-full max-w-[560px] vg-fade">
      <div className="text-center">
        <div className="flex justify-center">
          <GradeSquare grade={grade as Grade | undefined} size={92} className="vg-pop" />
        </div>
        <SectionLabel className="mt-3">Your security grade</SectionLabel>
        <h1 className="font-semibold text-[24px] tracking-[-0.02em] mt-[8px]">
          {grade && (grade === 'A' || grade === 'B') ? 'Solid start.' : 'Here’s where you stand.'}
        </h1>
        <p className="text-[14px] mt-3 tnum">
          <span style={{ color: SEV_TINT.CRITICAL.fg }}>{counts.critical} critical</span>
          <span className="text-faint"> · </span>
          <span style={{ color: SEV_TINT.WARNING.fg }}>{counts.warnings} warnings</span>
          {counts.passed > 0 && <><span className="text-faint"> · </span><span className="text-muted">{counts.passed} passed</span></>}
        </p>
      </div>

      {issues.length === 0 ? (
        <p className="text-center text-[15px] text-muted mt-8">No issues found. Nice work, we’ll keep watching for new ones.</p>
      ) : (
        <div className="mt-10">
          {/* the worst issue, shown plainly on a hairline — no card, no colored fill */}
          <SectionLabel>The top issue</SectionLabel>
          <div className="mt-3 border-t border-border pt-4">
            <div className="flex items-center gap-[8px]">
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: first.color }} />
              <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: first.color }}>{first.sev}</span>
              <span className="font-mono text-[11px] text-faint">{first.cat}</span>
            </div>
            <div className="font-semibold text-[16.5px] mt-[7px]">{first.title}</div>
            <p className="text-[14.5px] leading-[1.55] text-muted mt-[3px]">{first.what}</p>
            {first.where && <div className="font-mono text-[12.5px] text-faint mt-[7px] break-all">{first.where}</div>}
            <div className="flex items-center gap-[7px] mt-3 text-[13.5px] text-muted">
              <LockIcon dark /> The exact fix is locked, upgrade to reveal it.
            </div>
          </div>

          {/* everything else, one quiet line instead of a stack of cards */}
          {rest.length > 0 && (
            <div className="mt-4 border-t border-border pt-4 flex items-center gap-[7px] text-[14px] text-muted">
              <LockIcon dark />
              <span><span className="font-semibold text-ink tnum">{rest.length} more {rest.length === 1 ? 'issue' : 'issues'}</span> found, locked</span>
            </div>
          )}

          {/* upgrade push — emphasize the full repo scan Guard unlocks */}
          <div className="mt-5 border-t border-border pt-5">
            <div className="font-semibold text-[15.5px] text-ink">Unlock every fix, and scan your whole codebase</div>
            <p className="text-[14px] leading-[1.55] text-muted mt-[5px]">
              Guard reveals the fix and AI prompt for all {issues.length} issues, and scans your GitHub repo,
              not just this URL, catching exposed keys and access gaps a URL scan can’t see.
            </p>
          </div>
        </div>
      )}

      <div className="mt-9 text-center">
        <PillButton onClick={onContinue}>Continue</PillButton>
      </div>
    </div>
  );
}

function LockIcon({ dark }: { dark?: boolean }) {
  const stroke = dark ? '#0A0A0A' : '#fff';
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={stroke} strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}

/* ── small pieces ───────────────────────────────────────────────────────── */
function Header({ onSkip, busy }: { onSkip: () => void; busy: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 sm:px-7 py-[22px]">
      <Logo size={28} />
      <button onClick={onSkip} disabled={busy} className="bg-transparent border-0 font-medium text-[15px] text-label hover:text-ink transition-colors disabled:opacity-60 cursor-pointer">Skip</button>
    </div>
  );
}

function StepHead({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="text-center mb-[28px]">
      <h1 className="font-medium text-[clamp(23px,3.2vw,29px)] tracking-[-0.03em] m-0 text-balance">{q}</h1>
      <p className="text-[15px] text-muted mt-2 max-w-[52ch] mx-auto leading-[1.5]">{hint}</p>
    </div>
  );
}

function CardGrid({ q, hint, options, value, onPick, cols, multi }: { q: string; hint: string; options: Opt[]; value: string | string[]; onPick: (v: string) => void; cols?: number; multi?: boolean }) {
  const isSelected = (label: string) => (Array.isArray(value) ? value.includes(label) : value === label);
  return (
    <>
      <StepHead q={q} hint={hint} />
      <div className={cols === 1 ? 'flex flex-col gap-3 max-w-[460px] mx-auto' : 'grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3'}>
        {options.map((o) => {
          const selected = isSelected(o.label);
          return (
            <button key={o.label} onClick={() => onPick(o.label)}
              className="vg-press text-left bg-card rounded-[14px] p-4 flex items-center gap-3 min-h-[56px] border transition-colors"
              style={{ borderColor: selected ? '#0A0A0A' : 'var(--color-border)', background: selected ? 'var(--color-bg-soft)' : '#fff' }}>
              {o.logo && <BrandLogo name={o.logo} size={22} icon className="shrink-0" />}
              <span className="font-medium text-[15px] text-ink flex-1">{o.label}</span>
              {multi && selected && (
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

function Checkbox({ on }: { on: boolean }) {
  return (
    <span className="shrink-0 w-[20px] h-[20px] rounded-[6px] flex items-center justify-center border-[1.5px] transition-colors"
      style={{ borderColor: on ? '#1F9D57' : '#CFCEC9', background: on ? '#1F9D57' : 'transparent' }}>
      {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

function Check() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[1px]" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
