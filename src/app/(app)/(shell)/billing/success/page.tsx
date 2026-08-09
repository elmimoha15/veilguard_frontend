'use client';

// Return URL after Polar checkout. We do NOT trust the redirect — the plan is
// flipped only by the verified webhook — so we poll /me until it reports Guard,
// then send the user on. Times out gracefully if the webhook is slow.
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/** Only return to an in-app relative path (open-redirect guard). */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('://')) return '/dashboard';
  return next;
}

function BillingSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { profile, refreshProfile } = useAuth();
  const [tooLong, setTooLong] = useState(false);

  const active = profile?.plan === 'guard';

  useEffect(() => {
    if (active) return;
    let stop = false;
    const poll = setInterval(() => { if (!stop) void refreshProfile(); }, 2000);
    const timeout = setTimeout(() => setTooLong(true), 30000);
    return () => { stop = true; clearInterval(poll); clearTimeout(timeout); };
  }, [active, refreshProfile]);

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => router.replace(next), 1200);
      return () => clearTimeout(t);
    }
  }, [active, router, next]);

  return (
    <div className="vg-fade max-w-[520px] mx-auto text-center py-20">
      {active ? (
        <>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#EAF6EF' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="font-semibold text-[22px] tracking-[-0.02em]">You&apos;re on Guard</h1>
          <p className="text-muted text-[15px] mt-2">Everything&apos;s unlocked. Taking you back…</p>
        </>
      ) : (
        <>
          <span className="inline-block w-8 h-8 rounded-full vg-spin mb-4" style={{ border: '3px solid #E2E2DF', borderTopColor: '#0A0A0A' }} />
          <h1 className="font-semibold text-[22px] tracking-[-0.02em]">Confirming your subscription…</h1>
          <p className="text-muted text-[15px] mt-2">
            {tooLong
              ? 'This is taking longer than usual. Your payment may still be processing — you can head to the dashboard and it’ll unlock automatically, or check Manage billing.'
              : 'Hang tight — we’re activating your Guard plan. This usually takes a few seconds.'}
          </p>
          {tooLong && (
            <button onClick={() => router.replace(next)} className="vg-press cursor-pointer mt-5 bg-ink text-white font-medium rounded-[10px] px-6 py-3">Continue</button>
          )}
        </>
      )}
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[300px] max-w-[520px] mx-auto" />}>
      <BillingSuccess />
    </Suspense>
  );
}
