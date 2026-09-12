'use client';

import { useEffect, useRef, useState } from 'react';
import { useOnline } from '@/lib/net';
import { useAuth } from '@/lib/auth';

/**
 * App-wide, non-blocking connectivity banner. Shows a calm strip while the
 * browser is offline and clears itself on reconnect. On the offline→online
 * transition it refreshes fetch-based data (the profile) and emits a global
 * `vg:reconnect` event other screens can listen to; Firestore listeners
 * re-sync on their own. Mounted once in the signed-in layout.
 */
export default function OfflineBanner() {
  const online = useOnline();
  const { refreshProfile } = useAuth();
  const wasOffline = useRef(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!online) { wasOffline.current = true; setJustReconnected(false); return; }
    // Back online after having been offline → recover fetch data + notify screens.
    if (wasOffline.current) {
      wasOffline.current = false;
      setJustReconnected(true);
      void refreshProfile();
      try { window.dispatchEvent(new Event('vg:reconnect')); } catch { /* noop */ }
      const t = setTimeout(() => setJustReconnected(false), 2600);
      return () => clearTimeout(t);
    }
  }, [online, refreshProfile]);

  if (online && !justReconnected) return null;

  const offline = !online;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 px-4 py-[9px] text-[13.5px] font-medium vg-fade"
      style={{
        background: offline ? '#0A0A0A' : '#EAF6EF',
        color: offline ? '#fff' : '#1F7A46',
        borderBottom: offline ? '1px solid rgba(255,255,255,.12)' : '1px solid #CDE9D8',
      }}
    >
      <span
        className="inline-block w-[7px] h-[7px] rounded-full"
        style={{ background: offline ? '#FFE24D' : '#1F9D57', animation: offline ? 'vgPulse 1.4s ease-in-out infinite' : undefined }}
      />
      {offline ? 'You’re offline, we’ll reconnect automatically. Your work is safe.' : 'Back online, catching you up.'}
    </div>
  );
}
