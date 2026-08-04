'use client';

// Findings are now a tab inside the per-app hub (/app?key=…&tab=findings).
// This legacy route redirects any bookmarked /findings?scan=… link into the hub.
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApps } from '@/lib/hooks';

function FindingsRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const { apps, loading } = useApps();
  const scan = params.get('scan');

  useEffect(() => {
    if (loading) return;
    const owner = scan ? apps.find((a) => a.scans.some((s) => s.id === scan)) : null;
    if (owner) router.replace(`/app?key=${encodeURIComponent(owner.key)}&tab=findings&scan=${scan}`);
    else router.replace('/apps');
  }, [loading, apps, scan, router]);

  return <div className="vg-skel h-[400px]" />;
}

export default function FindingsPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[400px]" />}>
      <FindingsRedirect />
    </Suspense>
  );
}
