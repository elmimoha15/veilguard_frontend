'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isNewUser, rememberProvider, getLastProvider, authErrorMessage, consumeSessionExpired, consumeAuthError, consumeNoAccount, pendingRedirect, isRedirectEnv, type LastProvider } from '@/lib/auth';
import GoogleOneTap from '@/components/auth/GoogleOneTap';
import FullScreenLoader from '@/components/auth/FullScreenLoader';
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
  const { user, profile, loading, google, github, refreshProfile, logout } = useAuth();
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // Set when a brand-new user is refused at login (they have no account); reveals a
  // "Get Started" button that sends them to onboarding (the only way to sign up).
  const [noAccount, setNoAccount] = useState(false);
  const [last, setLast] = useState<LastProvider | null>(null);
  // True if we landed here mid `signInWithRedirect` (snapshot at mount), drives
  // the branded loader while the session + profile restore, instead of flashing
  // the form. Cleared implicitly: on success `user` takes over; on error the
  // redirect handler flips `loading` false with no user, so the form returns.
  const [redirecting] = useState(() => pendingRedirect());
  const routed = useRef(false);

  // Read the last-used provider after mount (avoids SSR/hydration mismatch).
  useEffect(() => { setLast(getLastProvider()); }, []);
  // Clear a stale "Connecting…" if the user hits Back from the OAuth provider and
  // the page is restored from bfcache (mirrors the connect-flow reset in Settings).
  useEffect(() => {
    const reset = () => setBusy(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  // Gentle notice when the user landed here because their session expired, and
  // surface any error returned from a redirect sign-in (getRedirectResult).
  useEffect(() => {
    if (consumeSessionExpired()) setNotice('Your session expired, please sign in again.');
    const redirErr = consumeAuthError();
    if (redirErr) setError(redirErr);
  }, []);
  // Redirect (prod) return: a new user refused at login is flagged by completeRedirect().
  // Consume it only once redirect processing has settled (avoids the mount-vs-redirect race).
  useEffect(() => {
    if (loading) return;
    if (!consumeNoAccount()) return;
    // Defer out of the effect body (avoids cascading-render lint) — one-shot: the
    // flag is already cleared, so this can't loop.
    queueMicrotask(() => { setNoAccount(true); setError('You don’t have an account yet.'); });
  }, [loading]);

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
    setNotice('');
    setNoAccount(false);
    try {
      const cred = await (which === 'google' ? google({ loginOnly: mode === 'login' }) : github({ loginOnly: mode === 'login' }));

      // Redirect flow (prod) navigates away here and resolves void, the return
      // is handled by completeRedirect(). The rest runs only for the popup path.
      if (!cred) return; // keep busy through the redirect navigation

      // On the LOGIN page, a brand-new social user has no account yet: undo the
      // just-created account and refuse, then reveal the "Get Started" button so
      // they sign up through onboarding. Stay on the page (no redirect).
      if (mode === 'login' && isNewUser(cred)) {
        try { await cred.user.delete(); } catch { await logout().catch(() => {}); }
        setNoAccount(true);
        setError('You don’t have an account yet.');
        setBusy(null);
        return;
      }

      rememberProvider(which);

      // Claim a pre-signup anonymous scan, then route by onboarding state.
      const pending = typeof window !== 'undefined' ? localStorage.getItem('vg_pending_scan') : null;
      if (pending) { await api.claimScan(pending).catch(() => {}); localStorage.removeItem('vg_pending_scan'); }
      const p = await refreshProfile();
      routed.current = true;
      router.replace(p?.onboarded ? '/dashboard' : '/onboarding');
    } catch (e) {
      // Every non-success path resolves the button + shows a plain-English
      // message (cancel, popup-blocked, offline, linking guide, or generic).
      // Raw error codes go to the console only.
      console.error('[auth] sign-in failed:', e);
      setError(authErrorMessage(e));
      setBusy(null);
    }
  };

  const c = COPY[mode];

  // Cover the post-sign-in window with the branded loader so the auth page never
  // flashes as "broken" before the dashboard appears. Crucially it must appear
  // AFTER the provider hop, not before: in redirect mode (prod) clicking a button
  // navigates to Google/GitHub, so we DON'T show the loader on the pre-redirect
  // `busy`, only on the return (`redirecting && loading`) and once a user
  // resolves. In popup mode (localhost) there's no navigation, so `busy` is the
  // right trigger.
  const signingIn = !!user || (redirecting && loading) || (busy !== null && !isRedirectEnv());
  if (signingIn) {
    return <FullScreenLoader variant={mode === 'signup' ? 'creating' : 'welcome'} />;
  }

  return (
    <div className="vg-fade">
      <GoogleOneTap />
      <div className="flex flex-col items-center text-center mb-[30px]">
        <div className="mb-[26px]"><Logo size={28} /></div>
        <h1 className="font-bold text-[26px] tracking-[-0.02em] m-0">{c.title}</h1>
        <p className="text-[16px] text-muted mt-2">{c.sub}</p>
      </div>

      {notice && (
        <div className="mb-4 text-[14px] text-center rounded-[10px] px-4 py-3" style={{ background: '#EDEDEA', color: '#5b5a56' }}>
          {notice}
        </div>
      )}

      <div className="flex flex-col gap-[10px]">
        <ProviderButton onClick={() => start('google')} disabled={busy !== null} busy={busy === 'google'} lastUsed={last === 'google'} icon={<GoogleIcon />} label="Continue with Google" />
        <ProviderButton onClick={() => start('github')} disabled={busy !== null} busy={busy === 'github'} lastUsed={last === 'github'} icon={<GithubIcon />} label="Continue with GitHub" />
      </div>

      {error && <div className="mt-4 text-[14px] text-red font-semibold text-center">{error}</div>}

      {/* Refused new user: no account exists yet, so route them into onboarding to sign up. */}
      {noAccount && (
        <div className="mt-4 rounded-[12px] border border-border bg-bg-soft px-4 py-4 text-center">
          <p className="text-[14px] text-muted">New to Veilguard? Create your account to get your first scan.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="vg-press mt-3 w-full rounded-[10px] bg-ink text-white font-semibold text-[15px] py-[12px] cursor-pointer"
          >
            Get started
          </button>
        </div>
      )}

      <p className="text-[13px] text-faint text-center mt-5 leading-[1.5]">
        We only use Google or GitHub to sign you in, no passwords to remember.
      </p>

      {/* Signup happens through onboarding, so the login page shows no "Sign up" link. */}
      {mode === 'signup' && (
        <div className="text-center mt-[22px] text-[14.5px]">
          <button onClick={() => router.push(`/${c.to}`)} className="bg-none text-ink font-bold cursor-pointer">{c.switch}</button>
        </div>
      )}

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
        <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] font-semibold rounded-full px-[8px] py-[2px]" style={{ background: '#EDEDEA', color: '#5b5a56' }}>
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
