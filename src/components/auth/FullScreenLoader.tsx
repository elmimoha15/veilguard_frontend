'use client';

import Logo from '@/components/ui/Logo';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * Full-screen branded loader for whole-app transitions, the post-auth handoff
 * (instead of flashing the login/signup form), the AuthGate while the shell
 * resolves, and account deletion. One clear line of copy per moment so the wait
 * reads as intentional rather than broken. Matches AuthGate's centered `bg-bg`
 * full-screen pattern so consecutive loaders look like one continuous screen.
 */
export type LoaderVariant = 'creating' | 'welcome' | 'loading' | 'deleting' | 'checkout';

const COPY: Record<LoaderVariant, string> = {
  creating: 'Setting up your account…',
  welcome: 'Welcome back, signing you in…',
  loading: 'Loading your dashboard…',
  deleting: 'Deleting your account…',
  checkout: 'Opening secure checkout…',
};

export default function FullScreenLoader({ variant }: { variant: LoaderVariant }) {
  const reduced = useReducedMotion();
  // Deletion is destructive, tint the ring red so it doesn't read as "signing in".
  const accent = variant === 'deleting' ? '#E5484D' : '#F3C500';
  return (
    <div className="fixed inset-0 z-[400] bg-bg flex flex-col items-center justify-center px-6 vg-fade">
      <Logo size={30} />

      {/* Spinner ring, or a static dot when the user prefers reduced motion. */}
      {reduced ? (
        <span className="mt-8 inline-block w-[12px] h-[12px] rounded-full" style={{ background: accent }} />
      ) : (
        <span
          className="mt-8 inline-block w-[26px] h-[26px] rounded-full vg-spin"
          style={{ border: '2.5px solid rgba(10,10,10,.10)', borderTopColor: accent }}
        />
      )}

      <p className="mt-5 text-[15px] text-muted text-center">{COPY[variant]}</p>
    </div>
  );
}
