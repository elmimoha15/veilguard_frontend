'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isPaid } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import {
  dueForUpgradeReminder,
  upgradeReminderMessage,
  UPGRADE_REMINDER_KEY,
} from '@/lib/reminders';

/** Persisted per user: when we last showed the reminder + how many times. */
type ReminderState = { at: number; n: number };

function readState(uid: string): ReminderState | null {
  try {
    const raw = localStorage.getItem(`${UPGRADE_REMINDER_KEY}:${uid}`);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<ReminderState>;
    return { at: Number(v.at) || 0, n: Number(v.n) || 0 };
  } catch { return null; }
}
function writeState(uid: string, s: ReminderState): void {
  try { localStorage.setItem(`${UPGRADE_REMINDER_KEY}:${uid}`, JSON.stringify(s)); } catch { /* storage off */ }
}

/**
 * A toast-styled, persistent reminder shown on the dashboard for FREE-plan users,
 * at most once every 3 days, nudging them to Guard (deep repo scan, GitHub +
 * Supabase connect, all fixes). It looks like the app's dark toast pill but stays
 * until dismissed and carries an Upgrade action. Mounted from the Overview screen.
 */
export default function UpgradeReminder() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState('');

  const uid = profile?.uid;
  const free = !!profile && !isPaid(profile);

  useEffect(() => {
    if (loading || !uid || !free) return;
    const state = readState(uid);
    if (!dueForUpgradeReminder({ isFree: true, lastShownAt: state?.at ?? null, now: Date.now() })) return;

    // Reveal after a short beat so it doesn't slam the page on load; stamp the
    // timestamp the moment it appears so an ignored reminder still waits 3 days.
    const t = setTimeout(() => {
      const n = state?.n ?? 0;
      setMsg(upgradeReminderMessage(n));
      setVisible(true);
      writeState(uid, { at: Date.now(), n: n + 1 });
    }, 1500);
    return () => clearTimeout(t);
  }, [loading, uid, free]);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, close]);

  if (!visible) return null;

  const upgrade = () => { close(); router.push(billingHref()); };

  return (
    <div
      role="status"
      className="fixed z-[9990] bottom-[24px] left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[440px]
                 flex items-center gap-3 bg-ink text-white rounded-[16px] pl-[18px] pr-[12px] py-[13px]"
      style={{ boxShadow: 'var(--shadow-toast, 0 16px 40px -14px rgba(0,0,0,.5))', animation: 'vgFade .3s ease both' }}
    >
      <span aria-hidden className="shrink-0 mt-[1px] text-[#FFD400]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l2.4 5.3 5.6.5-4.3 3.8 1.3 5.6L12 15.9 6.9 18.2l1.3-5.6L4 8.8l5.6-.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="flex-1 min-w-0 text-[13px] leading-[1.45] text-white/90">{msg}</p>
      <button
        onClick={upgrade}
        className="vg-press shrink-0 rounded-full bg-[#FFD400] text-ink font-semibold text-[13px] px-[14px] py-[8px] cursor-pointer hover:brightness-105 transition"
      >
        Upgrade
      </button>
      <button onClick={close} aria-label="Dismiss reminder" className="vg-press shrink-0 p-1 text-white/50 hover:text-white transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}
