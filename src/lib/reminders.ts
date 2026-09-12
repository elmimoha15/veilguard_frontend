/**
 * Timing for the free-plan "upgrade to Guard" dashboard reminder. Kept pure (no
 * React / DOM) so the show/hide decision is unit-testable.
 */
export const UPGRADE_REMINDER_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
/** localStorage key prefix; the current user's uid is appended (`…:<uid>`). */
export const UPGRADE_REMINDER_KEY = 'vg_upgrade_reminder_at';

/**
 * Whether to show the upgrade reminder: only for free users, and only if it has
 * never been shown or was last shown at least `intervalMs` (default 3 days) ago.
 */
export function dueForUpgradeReminder(o: {
  isFree: boolean;
  lastShownAt: number | null;
  now: number;
  intervalMs?: number;
}): boolean {
  if (!o.isFree) return false;
  if (!o.lastShownAt) return true;
  return o.now - o.lastShownAt >= (o.intervalMs ?? UPGRADE_REMINDER_MS);
}

/** The rotating reminder lines; pick by index so repeat nudges feel fresh. */
export const UPGRADE_REMINDER_MESSAGES = [
  'You’re on Free. Upgrade to Guard to scan your whole GitHub repo, connect Supabase, and unlock every fix.',
  'A URL scan only sees the outside. Guard adds deep repo scans and Supabase database checks.',
  'Connect GitHub and Supabase with Guard to catch issues a URL scan can’t reach, plus every fix.',
] as const;

/** Deterministic message pick based on how many times it's been shown. */
export function upgradeReminderMessage(shownCount: number): string {
  const i = ((shownCount % UPGRADE_REMINDER_MESSAGES.length) + UPGRADE_REMINDER_MESSAGES.length) % UPGRADE_REMINDER_MESSAGES.length;
  return UPGRADE_REMINDER_MESSAGES[i];
}
