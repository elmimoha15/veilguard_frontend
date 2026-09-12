'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import FullScreenLoader from '@/components/auth/FullScreenLoader';
import { Spinner } from './ui';

/**
 * Guards the signed-in shell. Not signed in → /login. Signed in but not yet
 * onboarded → /onboarding (mandatory for new users). Otherwise renders the app.
 */

// Once the app has rendered once in this browser session we never flash the
// branded "Loading your dashboard…" screen again, subsequent gate re-checks
// (navigation, a token refresh, a remount) stay quiet. The branded loader is
// reserved for the true first entry (the login/signup hand-off).
const SEEN_KEY = 'vg_app_seen';
function hasSeenApp(): boolean {
  try { return window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (profile && profile.onboarded === false) router.replace('/onboarding');
  }, [loading, user, profile, router]);

  const gated = loading || !user || (profile != null && profile.onboarded === false);

  // Remember (once we're through the gate) that the app has been shown, so future
  // gate re-checks in this session skip the branded loader.
  useEffect(() => {
    if (!gated) { try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage off */ } }
  }, [gated]);

  if (gated) {
    // Branded "Loading your dashboard…" ONLY on the true first entry of a session
    // (a signed-in session settling on its way INTO the app). On any later
    // re-check, moving between pages, re-clicking a nav item, a background token
    // refresh, or on the way OUT (sign-out / onboarding), stay quiet with the
    // plain spinner so we never flash the welcome screen mid-session.
    const enteringApp = !!user && !(profile != null && profile.onboarded === false);
    if (enteringApp && !hasSeenApp()) return <FullScreenLoader variant="loading" />;
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner dark />
      </div>
    );
  }
  return <>{children}</>;
}
