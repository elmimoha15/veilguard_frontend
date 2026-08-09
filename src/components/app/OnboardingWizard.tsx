'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { checkUrl } from '@/lib/url';
import { saveOnboarding, subscribeScan, type ScanDoc } from '@/lib/scans';
import { GRADE_COLOR } from '@/lib/adapters';
import Logo from '@/components/ui/Logo';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { GradeRing, GradeLetter } from './ui';

const LAST_STEP = 7;

type Opt = { label: string; logo?: BrandLogoName };
// Only real companies carry a logo; everything else is plain text (no glyph).
const BUILT_WITH: Opt[] = [
  { label: 'Lovable', logo: 'lovable' }, { label: 'Bolt', logo: 'bolt' }, { label: 'Cursor', logo: 'cursor' },
  { label: 'Replit', logo: 'replit' }, { label: 'v0', logo: 'v0' }, { label: 'Something else' },
];
const BACKEND: Opt[] = [
  { label: 'Supabase', logo: 'supabase' }, { label: 'Firebase', logo: 'firebase' },
  { label: 'Other / custom' }, { label: 'Not sure' },
];
// General SaaS checklist — no company logos.
const HANDLES: string[] = [
  'User accounts & logins',
  'Payments or billing',
  'Personal data (names, emails)',
  'File or image uploads',
  'Emails or notifications',
  'An admin dashboard',
];
const COMFORT: Opt[] = [
  { label: 'I can’t read code' }, { label: 'I know a little' }, { label: 'I’m a developer' },
];
const SHIP: string[] = ['Daily', 'Weekly', 'Rarely'];
const PLANS: { key: 'free' | 'guard'; name: string; price: string; features: string[]; featured?: boolean }[] = [
  { key: 'free', name: 'Free', price: '$0', features: ['URL security scan', 'Full A–F grade, every issue explained', 'One sample fix unlocked'] },
  { key: 'guard', name: 'Guard', price: '$19/mo', features: ['Everything in Free', 'GitHub repo + folder scans', 'All fixes — code + AI prompts', 'Monitoring + instant alerts'], featured: true },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { ob, setOb, toast } = useApp();
  const { user, loading, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const step = ob.step;

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  useEffect(() => { if (user?.email && !ob.email) setOb({ email: user.email }); }, [user, ob.email, setOb]);

  const answers = () => ({
    builtWith: ob.builtWith, backend: ob.backend, handles: ob.handles,
    codeComfort: ob.codeComfort, scanTarget: 'url' as const, shipFrequency: ob.shipFrequency,
  });

  const finishTo = async (path: string) => {
    if (user) { await saveOnboarding(user.uid, answers(), ob.email).catch(() => {}); await refreshProfile(); }
    router.replace(path);
  };
  const skipToDashboard = async () => { if (busy) return; setBusy(true); await finishTo('/dashboard'); };

  /** Guard chosen → persist answers, start a REAL Polar checkout, hand off to the
   *  hosted payment page. Polar grants the plan via its webhook and returns the
   *  user to /dashboard (now on Guard). */
  const goCheckout = async () => {
    if (busy) return;
    setBusy(true);
    if (user) await saveOnboarding(user.uid, answers(), ob.email).catch(() => {});
    const res = await api.createCheckout('/dashboard');
    if (res.ok && res.data.url) { window.location.assign(res.data.url); return; }
    setBusy(false);
    toast(res.data.error || 'Could not start checkout — try again', '#E5484D');
  };

  /** Run the URL scan and switch to the inline result (persist answers first). */
  const startScan = async () => {
    if (busy) return;
    setBusy(true);
    if (user) await saveOnboarding(user.uid, answers(), ob.email).catch(() => {});
    try {
      const c = checkUrl(ob.url);
      if (!c.ok) { await finishTo('/dashboard'); return; } // blank URL → skip the scan
      const r = await api.createScan(c.url!);
      if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan.', '#E5484D'); setBusy(false); return; }
      setOb({ scanId: r.data.scanId });
      if (user) await refreshProfile();
      setBusy(false);
    } catch { toast('Something went wrong starting your scan.', '#E5484D'); setBusy(false); }
  };

  const willScan = checkUrl(ob.url).ok;

  const finish = async () => {
    if (ob.plan === 'guard') return void goCheckout();
    if (willScan) return void startScan();
    await skipToDashboard();
  };

  const next = () => { if (step >= LAST_STEP) return void finish(); setOb({ step: step + 1 }); };
  const prev = () => step > 1 && setOb({ step: step - 1 });

  const toggleHandle = (label: string) => {
    const has = ob.handles.includes(label);
    setOb({ handles: has ? ob.handles.filter((h) => h !== label) : [...ob.handles, label] });
  };

  // ── Inline scan result ──
  if (ob.scanId) {
    return (
      <div className="min-h-screen bg-bg relative">
        <div className="absolute inset-x-0 top-0 z-10"><Header onSkip={skipToDashboard} busy={busy} /></div>
        <div className="min-h-screen flex items-center justify-center px-5 py-20">
          <OnboardingResult scanId={ob.scanId} onContinue={() => router.replace('/dashboard')} />
        </div>
      </div>
    );
  }

  const nextLabel = busy
    ? 'Just a sec…'
    : step >= LAST_STEP
      ? (ob.plan === 'guard' ? 'Continue to checkout' : willScan ? 'Run my scan' : 'Go to dashboard')
      : 'Continue';

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="absolute inset-x-0 top-0 z-10"><Header onSkip={skipToDashboard} busy={busy} /></div>

      <div className="min-h-screen flex items-center justify-center px-5 py-20">
        <div key={step} className="w-full max-w-[620px] vg-fade">
          {/* 1 — built with */}
          {step === 1 && (
            <CardGrid q="What did you build it with?" hint="This tunes which checks we run."
              options={BUILT_WITH} value={ob.builtWith}
              onPick={(v) => { setOb({ builtWith: v }); setTimeout(next, 160); }} />
          )}

          {/* 2 — backend */}
          {step === 2 && (
            <CardGrid q="What’s your backend?" hint="Decides which deep checks run."
              options={BACKEND} value={ob.backend}
              onPick={(v) => { setOb({ backend: v }); setTimeout(next, 160); }} />
          )}

          {/* 3 — handles (checklist) */}
          {step === 3 && (
            <>
              <StepHead q="Does your app handle any of these?" hint="Pick all that apply — it flags extra checks. Most apps have a few." />
              <div className="flex flex-col gap-2 max-w-[460px] mx-auto">
                {HANDLES.map((label) => {
                  const selected = ob.handles.includes(label);
                  return (
                    <button key={label} onClick={() => toggleHandle(label)}
                      className="vg-press vg-card flex items-center gap-3 rounded-[12px] px-4 py-[13px] text-left border-[1.5px]"
                      style={{ borderColor: selected ? '#F3C500' : '#E2E2DF', background: selected ? '#FFFDF3' : '#fff' }}>
                      <Checkbox on={selected} />
                      <span className="font-semibold text-[15px] text-ink">{label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* 4 — code comfort */}
          {step === 4 && (
            <CardGrid q="How comfortable are you with code?" hint="Tunes how we explain fixes." cols={1}
              options={COMFORT} value={ob.codeComfort}
              onPick={(v) => { setOb({ codeComfort: v }); setTimeout(next, 160); }} />
          )}

          {/* 5 — live URL */}
          {step === 5 && (
            <>
              <StepHead q="What’s your app’s live URL?" hint="We’ll scan it the way an attacker would. Optional — leave blank to skip." />
              <label className="mx-auto max-w-[460px] flex items-center gap-[10px] bg-white rounded-[14px] px-[18px] min-h-[58px] shadow-[var(--shadow-card)] focus-within:shadow-[0_0_0_2px_#F3C500,var(--shadow-card)] transition-shadow">
                <span className="font-mono text-tertiary text-[15px]">https://</span>
                <input value={ob.url} onChange={(e) => setOb({ url: e.target.value })} aria-label="App URL" placeholder="your-app.com" style={{ outline: 'none' }} className="flex-1 border-0 outline-none bg-transparent text-[16px] min-w-0" autoFocus />
              </label>
            </>
          )}

          {/* 6 — alert email + ship frequency */}
          {step === 6 && (
            <>
              <StepHead q="Where should we send security alerts?" hint="We’ll email you the moment something breaks." />
              <input type="email" value={ob.email} onChange={(e) => setOb({ email: e.target.value })} aria-label="Alert email" style={{ outline: 'none' }}
                className="mx-auto block w-full max-w-[460px] bg-white rounded-[14px] px-[18px] py-[16px] text-[16px] outline-none shadow-[var(--shadow-card)] focus:shadow-[0_0_0_2px_#F3C500,var(--shadow-card)] transition-shadow" />
              <div className="mt-6 max-w-[460px] mx-auto">
                <div className="kicker mb-2">How often do you ship? (optional)</div>
                <div className="grid grid-cols-3 gap-3">
                  {SHIP.map((label) => {
                    const selected = ob.shipFrequency === label;
                    return (
                      <button key={label} onClick={() => setOb({ shipFrequency: selected ? '' : label })}
                        className="vg-press vg-card rounded-[12px] py-3 font-semibold text-[14px] border-[1.5px]"
                        style={{ borderColor: selected ? '#F3C500' : '#E2E2DF' }}>{label}</button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* 7 — plan (feature cards) */}
          {step === 7 && (
            <>
              <StepHead q="Pick your plan" hint="Free grades any URL. Guard unlocks code scans, connections, monitoring & every AI fix — change anytime in Billing." />
              <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                  const selected = ob.plan === p.key;
                  return (
                    <button key={p.key} onClick={() => setOb({ plan: p.key })}
                      className="vg-press vg-card relative overflow-hidden text-left bg-card rounded-[16px] p-5 flex flex-col border-[1.5px]"
                      style={{ borderColor: selected ? '#F3C500' : '#E2E2DF' }}>
                      {p.featured && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-yellow" />}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-[17px] text-ink">{p.name}</span>
                        <span className="font-mono text-[13px] text-label">{p.price}</span>
                      </div>
                      <ul className="mt-3 flex flex-col gap-[9px] text-[13.5px] leading-[1.4] flex-1">
                        {p.features.map((f) => <li key={f} className="flex gap-2"><Check /><span>{f}</span></li>)}
                      </ul>
                      <span className="mt-4 rounded-[10px] py-[10px] text-center font-semibold text-[14px]"
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
            <button onClick={prev} className="bg-transparent border-0 text-muted font-semibold text-[15px] hover:text-ink transition-colors" style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>Back</button>
            <div className="flex gap-[7px]">
              {Array.from({ length: LAST_STEP }, (_, i) => {
                const n = i + 1; const active = n === step; const doneStep = n < step;
                return <span key={n} className="h-[6px] rounded-full transition-all duration-200" style={{ width: active ? 22 : 6, background: active ? '#F3C500' : doneStep ? '#0A0A0A' : '#E2E2DF' }} />;
              })}
            </div>
            <button onClick={next} disabled={busy}
              className="vg-press bg-yellow text-ink font-bold text-[15px] border-0 rounded-[10px] px-[26px] py-3 disabled:opacity-40">{nextLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── inline result view ──────────────────────────────────────────────────── */
function OnboardingResult({ scanId, onContinue }: { scanId: string; onContinue: () => void }) {
  const [scan, setScan] = useState<ScanDoc | null>(null);
  useEffect(() => subscribeScan(scanId, setScan), [scanId]);

  const status = scan?.status;
  const p = scan?.progress;
  const pct = p && p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  const done = status === 'done';
  const errored = status === 'error';
  const grade = scan?.grade;
  const c = scan?.counts;
  const warnings = c ? c.high + c.medium + c.low : 0;

  return (
    <div className="w-full max-w-[560px] text-center vg-fade">
      {errored ? (
        <>
          <div className="mx-auto w-[120px] h-[120px] flex items-center justify-center">
            <GradeLetter letter="!" color="#E0932F" size={64} halftone={false} />
          </div>
          <h1 className="font-bold text-[24px] tracking-[-0.02em] mt-4">We couldn’t finish that scan</h1>
          <p className="text-[15px] text-muted mt-2 max-w-[46ch] mx-auto leading-[1.55]">You can retry it any time from your dashboard.</p>
        </>
      ) : done ? (
        <>
          <div className="flex justify-center">
            <GradeLetter letter={grade ?? '—'} color={grade ? GRADE_COLOR[grade] : '#9B9B96'} size={120} className="vg-pop" />
          </div>
          <div className="kicker mt-1">Your security grade</div>
          <h1 className="font-bold text-[24px] tracking-[-0.02em] mt-[10px]">
            {grade && (grade === 'A' || grade === 'B') ? 'Solid start.' : 'Here’s where you stand.'}
          </h1>
          <div className="flex gap-[8px] flex-wrap justify-center mt-4">
            <Pill n={c?.critical ?? 0} label="critical" bg="#FBEAEA" fg="#C23B3F" dot="#E5484D" />
            <Pill n={warnings} label="warnings" bg="#FBF1E1" fg="#9A6412" dot="#E0932F" />
            {(c?.passed ?? 0) > 0 && <Pill n={c!.passed} label="passed" bg="#EAF6EF" fg="#157A43" dot="#1F9D57" />}
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto w-[180px] h-[180px]">
            <GradeRing size={180} pct={pct || 6} color="#F3C500" strokeWidth={9} animate>
              <span className="tnum font-semibold text-[40px] leading-none">{pct}<span className="text-[16px]">%</span></span>
              <span className="kicker mt-1">Scanning</span>
            </GradeRing>
          </div>
          <p className="text-[15px] text-muted mt-5">{p?.phase || 'Starting your scan…'}</p>
        </>
      )}

      <button onClick={onContinue}
        className="vg-press cursor-pointer mt-8 bg-ink text-white rounded-[10px] px-7 py-[13px] font-medium text-[15px] disabled:opacity-60"
        disabled={!done && !errored}>
        {done || errored ? 'Go to dashboard' : 'Scanning…'}
      </button>
      {!done && !errored && (
        <div className="mt-3">
          <button onClick={onContinue} className="bg-transparent border-0 text-muted text-[14px] font-semibold hover:text-ink transition-colors">Run in the background — go to dashboard</button>
        </div>
      )}
    </div>
  );
}

/* ── small pieces ───────────────────────────────────────────────────────── */
function Header({ onSkip, busy }: { onSkip: () => void; busy: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 sm:px-7 py-[22px]">
      <Logo size={30} wordmarkClassName="text-[17px]" />
      <button onClick={onSkip} disabled={busy} className="bg-transparent border-0 font-semibold text-[15px] text-label hover:text-ink transition-colors disabled:opacity-60">Skip setup</button>
    </div>
  );
}

function StepHead({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="text-center mb-[28px]">
      <h1 className="font-bold text-[clamp(23px,3.2vw,30px)] tracking-[-0.02em] m-0 text-balance">{q}</h1>
      <p className="text-[15px] text-muted mt-2 max-w-[52ch] mx-auto leading-[1.5]">{hint}</p>
    </div>
  );
}

function CardGrid({ q, hint, options, value, onPick, cols }: { q: string; hint: string; options: Opt[]; value: string; onPick: (v: string) => void; cols?: number }) {
  return (
    <>
      <StepHead q={q} hint={hint} />
      <div className={cols === 1 ? 'flex flex-col gap-3 max-w-[460px] mx-auto' : 'grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3'}>
        {options.map((o) => {
          const selected = value === o.label;
          return (
            <button key={o.label} onClick={() => onPick(o.label)}
              className="vg-press vg-card text-left bg-card rounded-[14px] p-4 flex items-center gap-3 min-h-[58px] border-[1.5px]"
              style={{ borderColor: selected ? '#F3C500' : '#E2E2DF' }}>
              {o.logo && <BrandLogo name={o.logo} size={22} className="shrink-0" />}
              <span className="font-semibold text-[15px] text-ink">{o.label}</span>
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

function Pill({ n, label, bg, fg, dot }: { n: number; label: string; bg: string; fg: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: bg, color: fg }}>
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />{n} {label}
    </span>
  );
}
