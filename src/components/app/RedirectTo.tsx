'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullScreenLoader from '@/components/auth/FullScreenLoader';

/** Client-side redirect that works with the static export. Replaces the current
 *  history entry so the redirected-from page never sits in the back stack. */
export default function RedirectTo({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => { router.replace(to); }, [router, to]);
  return <FullScreenLoader variant="loading" />;
}
