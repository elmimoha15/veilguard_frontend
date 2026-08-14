'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isNewUser, rememberProvider, getLastProvider, type LastProvider } from '@/lib/auth';
import { api } from '@/lib/api';
import { LEGAL } from '@/content/site';
import Logo from '@/components/ui/Logo';

type Mode = 'signup' | 'login';

const COPY: Record<Mode, { title: string; sub: string; switch: string; to: Mode }> = {
  signup: { title: 'Create your account', sub: 'Grade your app and unlock every fix.', switch: 'Have an account? Log in', to: 'login' },
  login: { title: 'Welcome back', sub: 'Log in to your Veilguard dashboard.', switch: 'New here? Sign up', to: 'signup' },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { toast } = useApp();
  const { user, profile, google, github, refreshProfile, logout } = useAuth();
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [last, setLast] = useState<LastProvider | null>(null);
  const routed = useRef(false);

  // Read the last-used provider after mount (avoids SSR/hydration mismatch).
  useEffect(() => { setLast(getLastProvider()); }, []);

  // Route any already-signed-in user away from the auth pages (e.g. they opened
  // /login in a fresh tab while a session exists).
  useEffect(() => {
    if (routed.current || busy || !user || !profile) return;
    routed.current = true;
    router.replace(profile.onboarded ? '/dashboard' : '/onboarding');
  }, [user, profile, busy, router]);

  const start = async (which: 'google' | 'github') => {
    setBusy(which);
    setError('');
    try {
      const cred = await (which === 'google' ? google() : github());

      // On the LOGIN page, a brand-new social user has no account yet — undo the
      // just-created account and send them to sign up instead of letting them in.
      if (mode === 'login' && isNewUser(cred)) {
        try { await cred.user.delete(); } catch { await logout().catch(() => {}); }
        toast('You don’t have an account yet — sign up to continue', '#E0932F');
        router.replace('/signup');
        return; // keep busy through the navigation
      }

      rememberProvider(which);

      // Claim a pre-signup anonymous scan, then route by onboarding state.
      const pending = typeof window !== 'undefined' ? localStorage.getItem('vg_pending_scan') : null;
      if (pending) { await api.claimScan(pending).catch(() => {}); localStorage.removeItem('vg_pending_scan'); }
      const p = await refreshProfile();
      routed.current = true;
      router.replace(p?.onboarded ? '/dashboard' : '/onboarding');
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') { setBusy(null); return; }
      setError(
        // The linking flow guides the user to their existing provider with a
        // specific, friendly message — surface it verbatim.
        code === 'auth/use-existing-provider'
          ? (e as Error).message
          : code === 'auth/account-exists-with-different-credential'
            ? 'That email is already registered — continue with your original provider (Google or GitHub).'
            : 'Sign-in failed — please try again.',
      );
      setBusy(null);
    }
  };

  const c = COPY[mode];

  return (
    <div className="vg-fade">
      <div className="flex flex-col items-center text-center mb-[30px]">
        <div className="mb-[26px]"><Logo size={30} wordmarkClassName="text-[20px]" /></div>
        <h1 className="font-bold text-[26px] tracking-[-0.02em] m-0">{c.title}</h1>
        <p className="text-[16px] text-muted mt-2">{c.sub}</p>
      </div>

      <div className="flex flex-col gap-[10px]">
        <ProviderButton onClick={() => start('google')} disabled={busy !== null} busy={busy === 'google'} lastUsed={last === 'google'} icon={<GoogleIcon />} label="Continue with Google" />
        <ProviderButton onClick={() => start('github')} disabled={busy !== null} busy={busy === 'github'} lastUsed={last === 'github'} icon={<GithubIcon />} label="Continue with GitHub" />
      </div>

      {error && <div className="mt-4 text-[14px] text-red font-semibold text-center">{error}</div>}

      <p className="text-[13px] text-faint text-center mt-5 leading-[1.5]">
        We only use Google or GitHub to sign you in — no passwords to remember.
      </p>

      <div className="text-center mt-[22px] text-[14.5px]">
        <button onClick={() => router.push(`/${c.to}`)} className="bg-none text-ink font-bold cursor-pointer">{c.switch}</button>
      </div>

      <p className="text-[12px] text-faint text-center mt-4 leading-[1.5]">
        By continuing you agree to our{' '}
        <a href={LEGAL.terms} className="underline hover:text-muted">Terms</a> and{' '}
        <a href={LEGAL.privacy} className="underline hover:text-muted">Privacy Policy</a>.
      </p>
    </div>
  );
}

function ProviderButton({
  onClick, disabled, busy, lastUsed, icon, label,
}: { onClick: () => void; disabled: boolean; busy: boolean; lastUsed: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="vg-press vg-card relative flex items-center justify-center gap-[10px] bg-white border border-border-2 rounded-[10px] py-[13px] text-[15.5px] font-semibold disabled:opacity-70 cursor-pointer"
    >
      {icon}
      {busy ? 'Signing in…' : label}
      {lastUsed && !busy && (
        <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] font-semibold rounded-full px-[8px] py-[2px]" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>
          Last used
        </span>
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
