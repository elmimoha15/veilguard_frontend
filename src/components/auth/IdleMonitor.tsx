'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { expireSession, IDLE_TIMEOUT_MS, IDLE_WARN_MS } from '@/lib/auth';

/**
 * Signs the user out after IDLE_TIMEOUT_MS with no activity, warning IDLE_WARN_MS
 * before. Activity is tracked in a SHARED localStorage timestamp, so every tab
 * reads the same value — activity in one tab keeps all tabs alive, and a 1s poll
 * syncs them with no extra plumbing. The 7-day absolute cap (auth.tsx) is separate
 * and unchanged. Mounted only while signed in (see AuthProvider).
 */
const ACTIVITY_KEY = 'vg_last_activity';
const WRITE_THROTTLE_MS = 5_000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'visibilitychange'] as const;

function readLast(): number {
  try {
    const v = Number(window.localStorage.getItem(ACTIVITY_KEY));
    return Number.isFinite(v) && v > 0 ? v : Date.now();
  } catch {
    return Date.now();
  }
}

export default function IdleMonitor() {
  const [warnLeftMs, setWarnLeftMs] = useState<number | null>(null); // null = no warning
  const lastWriteRef = useRef(0);
  const pathname = usePathname();

  // Record activity to the SHARED timestamp (throttled). Storage-only, so it's
  // safe to call from an effect; the warning clears on the next 1s tick (or
  // immediately via markActivity below, from event handlers / the Stay button).
  const writeActivity = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastWriteRef.current < WRITE_THROTTLE_MS) return;
    lastWriteRef.current = now;
    try { window.localStorage.setItem(ACTIVITY_KEY, String(now)); } catch { /* storage off */ }
  }, []);
  const markActivity = useCallback((force = false) => {
    writeActivity(force);
    setWarnLeftMs(null);
  }, [writeActivity]);

  // Seed the clock on mount (fresh sign-in starts "now"); a route change counts
  // as activity. Storage-only writes — no setState in the effect body.
  useEffect(() => { writeActivity(true); }, [pathname, writeActivity]);

  // Register activity listeners (event handlers, not effect bodies).
  useEffect(() => {
    const onActivity = () => markActivity();
    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true });
    return () => { for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity); };
  }, [markActivity]);

  // The idle clock: 1s poll reads the SHARED timestamp (cross-tab) and decides.
  useEffect(() => {
    const tick = () => {
      const idle = Date.now() - readLast();
      if (idle >= IDLE_TIMEOUT_MS) {
        void expireSession('inactivity'); // signs out → this component unmounts
        return;
      }
      setWarnLeftMs(idle >= IDLE_TIMEOUT_MS - IDLE_WARN_MS ? IDLE_TIMEOUT_MS - idle : null);
    };
    tick();
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, []);

  if (warnLeftMs === null || typeof document === 'undefined') return null;
  const secs = Math.max(0, Math.ceil(warnLeftMs / 1000));
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
      <div role="dialog" aria-label="Session about to expire" className="w-full max-w-[420px] bg-card rounded-[16px] p-7 vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <h2 className="font-medium text-[19px] tracking-[-0.02em]">You&rsquo;ll be signed out soon</h2>
        <p className="text-[14.5px] mt-2 leading-[1.55]" style={{ color: '#737373' }}>
          For your security we sign you out after a while with no activity. Signing out in <span className="text-ink font-medium tnum">{mm}:{ss}</span>.
        </p>
        <div className="flex gap-[10px] mt-5">
          <button
            onClick={() => void expireSession('inactivity')}
            className="flex-1 h-[44px] rounded-[10px] text-[14px] font-medium transition-colors"
            style={{ background: '#F2F2F2', color: '#404040' }}
          >
            Sign out
          </button>
          <button
            onClick={() => markActivity(true)}
            autoFocus
            className="flex-1 h-[44px] rounded-[10px] text-[14px] font-medium text-white transition-colors"
            style={{ background: '#0A0A0A' }}
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
