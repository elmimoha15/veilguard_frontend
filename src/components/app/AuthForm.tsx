'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Logo from '@/components/ui/Logo';
import { Spinner } from './ui';

type Mode = 'signup' | 'login' | 'forgot';

const COPY: Record<Exclude<Mode, 'forgot'>, { title: string; sub: string; cta: string; switch: string; to: Mode }> = {
  signup: { title: 'Create your account', sub: 'Grade your app and unlock every fix.', cta: 'Create account', switch: 'Have an account? Log in', to: 'login' },
  login: { title: 'Welcome back', sub: 'Log in to your Veilguard dashboard.', cta: 'Log in', switch: 'New here? Sign up', to: 'signup' },
};

/** After any successful auth: claim a pre-signup scan, then route by onboarded. */
async function afterAuth(router: ReturnType<typeof useRouter>, refreshProfile: () => Promise<{ onboarded?: boolean } | null>) {
  const pending = typeof window !== 'undefined' ? localStorage.getItem('vg_pending_scan') : null;
  if (pending) {
    await api.claimScan(pending).catch(() => {});
    localStorage.removeItem('vg_pending_scan');
  }
  const profile = await refreshProfile();
  router.replace(profile?.onboarded ? '/dashboard' : '/onboarding');
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { toast } = useApp();
  const { signUpEmail, logInEmail, google, github, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try {
      await fn();
      await afterAuth(router, refreshProfile);
    } catch (e) {
      setError(friendly((e as { code?: string })?.code) || 'Something went wrong.');
      setLoading(false);
    }
  };

  if (mode === 'forgot') {
    return (
      <div className="vg-fade">
        <div className="flex flex-col items-center text-center mb-[26px]">
          <div className="mb-[26px]"><Logo size={30} wordmarkClassName="text-[20px]" /></div>
          <h1 className="font-bold text-[26px] tracking-[-0.02em] m-0">Reset your password</h1>
          <p className="text-[16px] text-muted mt-2">We&apos;ll email you a secure reset link.</p>
        </div>
        <Label>Email</Label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" className="w-full bg-white border border-border-2 rounded-[10px] px-[14px] py-[13px] text-[16px] outline-none focus:border-ink" />
        <button
          onClick={async () => { await api.sendReset(email).catch(() => {}); toast('If that email has an account, a reset link is on its way.', '#1F9D57'); router.push('/login'); }}
          className="vg-press w-full mt-[14px] bg-yellow text-ink font-bold text-[16px] rounded-[10px] py-[14px]"
        >
          Send reset link
        </button>
        <button onClick={() => router.push('/login')} className="w-full mt-[14px] bg-transparent text-muted text-[15px] font-semibold">Back to log in</button>
      </div>
    );
  }

  const c = COPY[mode];
  const submitEmail = () => run(async () => {
    if (mode === 'signup') {
      await signUpEmail(email, password);
      void api.sendVerification().catch(() => {}); // branded verify email, non-blocking
    } else {
      await logInEmail(email, password);
    }
  });

  return (
    <div className="vg-fade">
      <div className="flex flex-col items-center text-center mb-[30px]">
        <div className="mb-[26px]"><Logo size={30} wordmarkClassName="text-[20px]" /></div>
        <h1 className="font-bold text-[26px] tracking-[-0.02em] m-0">{c.title}</h1>
        <p className="text-[16px] text-muted mt-2">{c.sub}</p>
      </div>

      <div className="flex flex-col gap-[9px]">
        <button onClick={() => run(google)} disabled={loading} className="vg-press vg-card flex items-center justify-center gap-[10px] bg-white border border-border-2 rounded-[10px] py-3 text-[15.5px] font-semibold">
          <GoogleIcon /> Continue with Google
        </button>
        <button onClick={() => run(github)} disabled={loading} className="vg-press vg-card flex items-center justify-center gap-[10px] bg-white border border-border-2 rounded-[10px] py-3 text-[15.5px] font-semibold">
          <GithubIcon /> Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 my-[18px] text-faint text-[13px]"><span className="flex-1 h-px bg-[#EBEBE8]" />OR<span className="flex-1 h-px bg-[#EBEBE8]" /></div>

      <Label>Email</Label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Email" className="w-full bg-white border border-border-2 rounded-[10px] px-[14px] py-3 text-[16px] outline-none focus:border-ink" />
      <div className="mt-[13px]"><Label>Password</Label></div>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" aria-label="Password" onKeyDown={(e) => e.key === 'Enter' && submitEmail()} className="w-full bg-white border border-border-2 rounded-[10px] px-[14px] py-3 text-[16px] outline-none focus:border-ink" />

      {error && <div className="mt-3 text-[14px] text-red font-semibold">{error}</div>}

      <button onClick={submitEmail} disabled={loading} className="vg-press w-full mt-4 bg-yellow text-ink font-bold text-[16px] rounded-[10px] py-[14px] flex items-center justify-center gap-[9px] disabled:opacity-70">
        {loading && <Spinner dark />}
        {c.cta}
      </button>

      <div className="text-center mt-[18px] text-[14.5px]">
        <button onClick={() => router.push(`/${c.to}`)} className="bg-none text-ink font-bold">{c.switch}</button>
      </div>
      <div className="text-center mt-[10px]">
        <button onClick={() => router.push('/forgot')} className="bg-none text-[#9B9B96] text-[14px] font-medium">Forgot password?</button>
      </div>
    </div>
  );
}

function friendly(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'That email is already registered — try logging in.';
    case 'auth/invalid-email': return 'That doesn’t look like a valid email.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Wrong email or password.';
    case 'auth/popup-closed-by-user': return 'Sign-in was cancelled.';
    default: return '';
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[14px] font-semibold mb-[6px]">{children}</label>;
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
