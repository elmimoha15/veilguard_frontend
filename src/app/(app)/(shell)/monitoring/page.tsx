'use client';

// Monitoring is now a tab inside the per-app hub (/app?key=…&tab=monitoring).
// This legacy route redirects any old /monitoring link to the apps list.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MonitoringPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/apps'); }, [router]);
  return <div className="vg-skel h-[400px]" />;
}
