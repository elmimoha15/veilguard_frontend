'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks browser connectivity. Starts optimistic (true) to avoid a false
 * "offline" flash during SSR/hydration, then syncs to navigator.onLine and the
 * online/offline events.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
