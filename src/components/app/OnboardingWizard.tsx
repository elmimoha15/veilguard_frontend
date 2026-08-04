'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { checkUrl } from '@/lib/url';
import { markOnboarded } from '@/lib/scans';
import Logo from '@/components/ui/Logo';
import { SupabaseIcon, BRAND_ICON, type BrandKey } from '@/components/ui/BrandIcons';

/** Quiz options that map to a real brand mark (the rest keep their emoji glyph). */
const OPTION_BRAND: Record<string, BrandKey> = {
  Lovable: 'lovable', Bolt: 'bolt', Cursor: 'cursor', Replit: 'replit', v0: 'v0',
  Supabase: 'supabase', Firebase: 'firebase',
};

type CardStep = {
  kind: 'card';
  q: string;
  hint: string;
  key: 'tool' | 'db' | 'pay' | 'skill' | 'ship';
  options: { label: string; icon: string }[];
};
type InputStep = { kind: 'url' | 'email' };
type ConnectStep = { kind: 'connect' };
type PlanStep = { kind: 'plan' };
type Step = CardStep | InputStep | ConnectStep | PlanStep;

const LAST_STEP = 9;

const STEPS: Record<number, Step> = {
  1: { kind: 'card', q: 'What did you build your app with?', hint: 'This tunes which checks we run.', key: 'tool', options: [{ label: 'Lovable', icon: '' }, { label: 'Bolt', icon: '' }, { label: 'Cursor', icon: '' }, { label: 'Replit', icon: '' }, { label: 'v0', icon: '' }, { label: 'Something else', icon: '' }] },
  2: { kind: 'url' },
  3: { kind: 'card', q: 'What’s your backend / database?', hint: 'Decides which deep checks run.', key: 'db', options: [{ label: 'Supabase', icon: '' }, { label: 'Firebase', icon: '' }, { label: 'Custom (Node/etc.)', icon: '' }, { label: 'Not sure', icon: '' }] },
  4: { kind: 'card', q: 'Are you handling payments?', hint: 'Flags webhook & secret checks.', key: 'pay', options: [{ label: 'Stripe', icon: '' }, { label: 'Other', icon: '' }, { label: 'Not yet', icon: '' }] },
  5: { kind: 'card', q: 'How comfortable are you with code?', hint: 'Tunes how we explain fixes.', key: 'skill', options: [{ label: 'I can’t read code', icon: '' }, { label: 'I know a little', icon: '' }, { label: 'I’m a developer', icon: '' }] },
  6: { kind: 'card', q: 'How often do you ship updates?', hint: 'Sets your monitoring cadence.', key: 'ship', options: [{ label: 'Multiple times a day', icon: '' }, { label: 'A few times a week', icon: '' }, { label: 'Rarely', icon: '' }] },
  7: { kind: 'email' },
  8: { kind: 'plan' },
  9: { kind: 'connect' },
};

const PLAN_OPTIONS = [
  { key: 'free', name: 'Free', price: '$0', blurb: 'URL scans only — a free grade for any app.' },
  { key: 'guard', name: 'Guard', price: '$19/mo', blurb: 'Everything: deep scans, connections, folder upload, monitoring & fixes.' },
  { key: 'fixpack', name: 'Fix Pack', price: '$19 once', blurb: 'One-time full access for a single app.' },
] as const;

export default function OnboardingWizard() {
  const router = useRouter();
  const { ob, setOb, toast } = useApp();
  const { user, loading, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const step = ob.step;
  const view = STEPS[step] ?? STEPS[LAST_STEP];
  const hasUrl = checkUrl(ob.url).ok;

  /** Apply the chosen plan (fake upgrade) before entering the dashboard. Best-effort:
   *  a failure (e.g. FAKE_BILLING off) just leaves the user on Free. Returns false
   *  only when a real Polar redirect took over (future). */
  const applyPlan = async (): Promise<boolean> => {
    if (!ob.plan || ob.plan === 'free') return true;
    const co = await api.billingCheckout(ob.plan);
    if (co.ok && co.data.mode === 'polar' && co.data.url) { window.location.assign(co.data.url); return false; }
    await api.billingConfirm(ob.plan);
    return true;
  };

  // Onboarding is a signed-in-only flow (reached right after auth). Guard direct hits.
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // Pre-fill the alert email with the account email (once), so the user isn't
  // typing it again — they can still change it.
  useEffect(() => {
    if (user?.email && !ob.email) setOb({ email: user.email });
  }, [user, ob.email, setOb]);

  /** Flip onboarded and go to the dashboard WITHOUT scanning anything. */
  const skipToDashboard = async () => {
    if (busy) return;
    setBusy(true);
    if (!(await applyPlan())) return; // Polar redirect took over (future)
    if (user) { await markOnboarded(user.uid).catch(() => {}); await refreshProfile(); }
    router.replace('/dashboard');
  };

  /**
   * Finish: if the user entered a URL, kick off their first scan and hand off to
   * the live scanning screen. If they didn't, we DON'T force a scan — we just
   * flip onboarded and drop them on the (empty) dashboard. Either way the account
   * is marked onboarded so they never see this wizard again.
   */
  const finish = async () => {
    if (busy) return;
    const c = checkUrl(ob.url);
    if (!c.ok) { await skipToDashboard(); return; } // no URL → skip the scan entirely
    setBusy(true);
    try {
      if (!(await applyPlan())) return; // Polar redirect took over (future)
      if (ob.gh || ob.sb) {
        toast('Connect GitHub/Supabase in Settings to include them in deep scans.', '#E0932F');
      }
      const scan = await api.createScan(c.url!);
      if (!scan.ok || !scan.data.scanId) {
        toast(scan.data.error || 'Could not start the scan.', '#E5484D');
        setBusy(false);
        return;
      }
      if (user) { await markOnboarded(user.uid).catch(() => {}); await refreshProfile(); }
      router.replace(`/scanning?scanId=${scan.data.scanId}&flow=onboarding`);
    } catch {
      toast('Something went wrong starting your scan.', '#E5484D');
      setBusy(false);
    }
  };

  const next = () => {
    if (step >= LAST_STEP) return void finish();
    setOb({ step: step + 1 });
  };
  const prev = () => step > 1 && setOb({ step: step - 1 });

  const nextLabel = busy
    ? 'Just a sec…'
    : step >= LAST_STEP
      ? (hasUrl ? 'Run first scan' : 'Go to dashboard')
      : step === 2 || step === 7
        ? 'Continue'
        : 'Skip for now';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-6 sm:px-7 py-[22px]">
        <Logo size={30} wordmarkClassName="text-[17px]" />
        <button onClick={skipToDashboard} disabled={busy} className="bg-transparent border-0 font-semibold text-[15px] text-label hover:text-ink transition-colors disabled:opacity-60">
          Skip setup
        </button>
      </div>

      {/* step */}
      <div className="flex-1 flex items-center justify-center px-5 py-5">
        <div key={step} className="w-full max-w-[600px] vg-fade">
          {view.kind === 'card' && (
            <>
              <div className="text-center mb-[30px]">
                <h1 className="font-bold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] m-0">{view.q}</h1>
                <p className="text-[16px] text-muted mt-2">{view.hint}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                {view.options.map((o) => {
                  const selected = ob[view.key] === o.label;
                  const bk = OPTION_BRAND[o.label];
                  const Icon = bk ? BRAND_ICON[bk] : null;
                  return (
                    <button
                      key={o.label}
                      onClick={() => { setOb({ [view.key]: o.label }); setTimeout(next, 160); }}
                      className="vg-press vg-card text-left bg-card rounded-[14px] p-4 flex items-center gap-3 min-h-[64px] border-[1.5px]"
                      style={{ borderColor: selected ? '#F3C500' : '#E2E2DF' }}
                    >
                      <span className="shrink-0 w-[34px] h-[34px] rounded-[9px] bg-bg-soft border border-border flex items-center justify-center">
                        {Icon ? <Icon size={22} /> : <span className="font-bold text-[14px] text-muted">{o.label.charAt(0)}</span>}
                      </span>
                      <span className="font-semibold text-[16px] text-ink">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view.kind === 'url' && (
            <>
              <div className="text-center mb-[28px]">
                <h1 className="font-bold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] m-0">What’s your app’s live URL?</h1>
                <p className="text-[16px] text-muted mt-2">We’ll scan this address the way an attacker would. Optional — leave it blank to skip the scan and go straight to your dashboard.</p>
              </div>
              <label className="flex items-center gap-[9px] bg-card border border-border-2 rounded-[12px] px-[15px] min-h-[56px] focus-within:border-yellow">
                <span className="font-mono text-tertiary text-[16px]">https://</span>
                <input
                  value={ob.url}
                  onChange={(e) => setOb({ url: e.target.value })}
                  aria-label="App URL"
                  className="flex-1 border-0 outline-none bg-transparent text-[17px]"
                />
              </label>
            </>
          )}

          {view.kind === 'email' && (
            <>
              <div className="text-center mb-[28px]">
                <h1 className="font-bold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] m-0">Where should we send alerts?</h1>
                <p className="text-[16px] text-muted mt-2">We’ll email you the moment something breaks.</p>
              </div>
              <input
                type="email"
                value={ob.email}
                onChange={(e) => setOb({ email: e.target.value })}
                aria-label="Alert email"
                className="w-full bg-card border border-border-2 rounded-[12px] px-[15px] py-[16px] text-[17px] outline-none focus:border-yellow"
              />
            </>
          )}

          {view.kind === 'plan' && (
            <>
              <div className="text-center mb-[28px]">
                <h1 className="font-bold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] m-0">Pick your plan</h1>
                <p className="text-[16px] text-muted mt-2">Free grades any URL. Paid unlocks code scans, connections, folder upload, monitoring &amp; every fix. You can change this anytime in Billing.</p>
              </div>
              <div className="flex flex-col gap-3">
                {PLAN_OPTIONS.map((p) => {
                  const selected = ob.plan === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => { setOb({ plan: p.key }); setTimeout(next, 160); }}
                      className="vg-press vg-card text-left bg-card rounded-[14px] p-[18px] flex items-center gap-3 border-[1.5px]"
                      style={{ borderColor: selected ? '#F3C500' : '#E2E2DF' }}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-[16.5px] text-ink">{p.name} <span className="font-mono text-[13px] text-label">{p.price}</span></span>
                        <span className="text-[14px] text-label">{p.blurb}</span>
                      </span>
                      <span className="shrink-0 font-bold text-[14px]" style={{ color: p.key === 'free' ? '#8a6d00' : '#157A43' }}>{p.key === 'free' ? 'Choose' : 'Go Pro'}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[13px] text-faint mt-3">Test mode — paid plans are applied instantly, no card charged.</p>
            </>
          )}

          {view.kind === 'connect' && (
            <>
              <div className="text-center mb-[28px]">
                <h1 className="font-bold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] m-0">Connect for deep checks</h1>
                <p className="text-[16px] text-muted mt-2">{ob.plan === 'free' ? 'Connections are a Pro feature — you can upgrade later in Billing.' : 'Read-only. We never store your code.'}</p>
              </div>
              <div className="flex flex-col gap-3">
                <ConnectRow
                  on={ob.gh}
                  onClick={() => setOb({ gh: !ob.gh })}
                  title="Connect GitHub"
                  sub="Read-only repo access"
                  tile={<span className="w-11 h-11 rounded-[11px] bg-ink flex items-center justify-center"><GithubIcon /></span>}
                />
                <ConnectRow
                  on={ob.sb}
                  onClick={() => setOb({ sb: !ob.sb })}
                  title="Connect Supabase"
                  sub="Read-only, or paste your rules"
                  tile={<span className="w-11 h-11 rounded-[11px] bg-ink flex items-center justify-center"><SupabaseIcon size={22} /></span>}
                />
              </div>
              <button onClick={next} disabled={busy} className="w-full mt-4 bg-transparent text-muted text-[15px] font-semibold disabled:opacity-60">
                {hasUrl ? 'Skip connections, scan public site only' : 'Skip — go to my dashboard'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* footer: back / progress dots / next */}
      <div className="px-6 sm:px-7 pt-4 pb-[26px]">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <button
            onClick={prev}
            className="bg-transparent border-0 text-muted font-semibold text-[15.5px]"
            style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
          >
            Back
          </button>
          <div className="flex gap-[7px]">
            {Array.from({ length: LAST_STEP }, (_, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <span
                  key={n}
                  className="h-[6px] rounded-full transition-all duration-200"
                  style={{ width: active ? 22 : 6, background: active ? '#F3C500' : done ? '#0A0A0A' : '#E2E2DF' }}
                />
              );
            })}
          </div>
          <button
            onClick={next}
            disabled={busy}
            className="vg-press bg-yellow text-ink font-bold text-[15.5px] border-0 rounded-[10px] px-[26px] py-3 disabled:opacity-70"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectRow({ on, onClick, title, sub, tile }: { on: boolean; onClick: () => void; title: string; sub: string; tile: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="vg-press vg-card flex items-center gap-[13px] rounded-[13px] p-4 text-left border-[1.5px]"
      style={{ background: on ? '#EAF6EF' : '#fff', borderColor: on ? '#1F9D57' : '#E2E2DF' }}
    >
      {tile}
      <span className="flex-1">
        <span className="block font-semibold text-[16px]">{title}</span>
        <span className="text-[14px] text-label">{sub}</span>
      </span>
      <span className="font-bold text-[14.5px]" style={{ color: on ? '#157A43' : '#8a6d00' }}>
        {on ? 'Connected' : 'Connect'}
      </span>
    </button>
  );
}

function GithubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M12 1a11 11 0 0 0-3.5 21.4c.6.1.8-.2.8-.5v-2c-3 .7-3.7-1.3-3.7-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7 0-.7 0-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.3 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 3 0 4.1-2.6 5-5 5.3.4.3.8 1 .8 2.1v3c0 .3.2.6.8.5A11 11 0 0 0 12 1z" />
    </svg>
  );
}
