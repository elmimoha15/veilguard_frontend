'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth, authErrorMessage, rememberProvider, getLastProvider, type LastProvider } from '@/lib/auth';
import { claimPendingScan } from '@/lib/claim';

/**
 * Google / GitHub sign-in buttons, used on the public /results page and in
 * onboarding's signup step. `onBeforeStart` runs before EITHER flow (e.g. to
 * remember which anonymous scan to claim). In popup mode (local) it claims that
 * scan, then calls `onSuccess`. In redirect mode (prod) the page navigates away and
 * comes back to the SAME url, where completeRedirect() claims it; a cancelled
 * sign-in therefore returns here too. Deliberately NO One Tap (it auto-routes to
 * /dashboard).
 */
export default function SignInButtons({ onSuccess, onBeforeStart }: { onSuccess: () => void; onBeforeStart?: () => void }) {
  const { google, github } = useAuth();
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [last, setLast] = useState<LastProvider | null>(null);

  useEffect(() => { setLast(getLastProvider()); }, []);
  // Back from the provider without signing in. A bfcache restore brings the page
  // back frozen mid-redirect, with its live Firestore listeners dead (the results
  // page would sit on "Grading your app…"), so reload it fresh. Otherwise just
  // un-stick the button.
  const started = useRef(false);
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && started.current) { window.location.reload(); return; }
      setBusy(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const start = async (which: 'google' | 'github') => {
    setBusy(which);
    setError('');
    started.current = true;
    try {
      // Persist anything the return needs BEFORE a redirect navigates away.
      onBeforeStart?.();
      const cred = await (which === 'google' ? google() : github());
      if (!cred) return; // redirect navigated away; keep busy through the hop
      rememberProvider(which);
      // Claim the anonymous scan this visitor signed up for (no-op if none).
      await claimPendingScan();
      onSuccess();
    } catch (e) {
      console.error('[onboarding auth] sign-in failed:', e);
      setError(authErrorMessage(e));
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="flex flex-col gap-[10px]">
        <ProviderButton onClick={() => start('google')} disabled={busy !== null} busy={busy === 'google'} lastUsed={last === 'google'} icon={<GoogleIcon />} label="Continue with Google" />
        <ProviderButton onClick={() => start('github')} disabled={busy !== null} busy={busy === 'github'} lastUsed={last === 'github'} icon={<GithubIcon />} label="Continue with GitHub" />
      </div>
      {error && <div className="mt-4 text-[14px] text-red font-semibold text-center">{error}</div>}
      <p className="text-[12.5px] text-faint text-center mt-4 leading-[1.5]">
        We only use Google or GitHub to sign you in, no passwords to remember.
      </p>
    </div>
  );
}

function ProviderButton({ onClick, disabled, busy, lastUsed, icon, label }: { onClick: () => void; disabled: boolean; busy: boolean; lastUsed: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="vg-press relative flex items-center justify-center gap-[10px] bg-white border border-border rounded-[12px] py-[13px] text-[15.5px] font-medium disabled:opacity-70 cursor-pointer hover:bg-[#FAFAF9] transition-colors"
    >
      {icon}
      {busy ? 'Signing in…' : label}
      {lastUsed && !busy && (
        <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] font-medium rounded-full px-[8px] py-[2px]" style={{ background: '#EDEDEA', color: '#5b5a56' }}>Last used</span>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 0 0 1.8 6.5l3.8 3a7.2 7.2 0 0 1 6.4-4.7z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden>
      <path d="M12 1a11 11 0 0 0-3.5 21.4c.6.1.8-.2.8-.5v-2c-3 .7-3.7-1.3-3.7-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7 0-.7 0-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.3 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 3 0 4.1-2.6 5-5 5.3.4.3.8 1 .8 2.1v3c0 .3.2.6.8.5A11 11 0 0 0 12 1z" />
    </svg>
  );
}
