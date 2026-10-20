'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullScreenLoader from '@/components/auth/FullScreenLoader';

/** Client-side redirect that works with the static export. Replaces the current
 *  history entry so the redirected-from page never sits in the back stack.
 *  `keepQuery` carries the current query string over (e.g. /signup?scan=… →
 *  /onboarding?scan=…). */
export default function RedirectTo({ to, keepQuery }: { to: string; keepQuery?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const qs = keepQuery && typeof window !== 'undefined' ? window.location.search : '';
    router.replace(qs ? `${to}${to.includes('?') ? '&' : '?'}${qs.slice(1)}` : to);
  }, [router, to, keepQuery]);
  return <FullScreenLoader variant="loading" />;
}
