'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from './ui';

/**
 * Guards the signed-in shell. Not signed in → /login. Signed in but not yet
 * onboarded → /onboarding (mandatory for new users). Otherwise renders the app.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (profile && profile.onboarded === false) router.replace('/onboarding');
  }, [loading, user, profile, router]);

  const gated = loading || !user || (profile != null && profile.onboarded === false);
  if (gated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner dark />
      </div>
    );
  }
  return <>{children}</>;
}
