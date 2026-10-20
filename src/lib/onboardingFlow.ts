/**
 * Value-first signup flow, as pure decisions (no React, no Firebase) so it can be
 * unit tested. The flow:
 *
 *   landing URL → anonymous scan → /scanning → public /results (fixes locked)
 *   → sign up ON /results (a cancelled sign-in lands back there) → claim that scan
 *   → /onboarding?scan=<id>: up to 3 skippable questions → /dashboard
 *
 * Visitors who reach /onboarding (or /signup) with no scan sign up first, then get
 * the same questions. Already-onboarded users never see the questions.
 */

/** One screen of the short onboarding. `signup` only shows while signed out. */
export type ObStep = 'signup' | 'builtWith' | 'backend' | 'heard';

/** Draft schema version. Older drafts (the 9-step wizard) are discarded on restore. */
export const OB_DRAFT_VERSION = 2;

/** localStorage key for the anonymous scan to claim once the visitor signs in. */
export const PENDING_SCAN_KEY = 'vg_pending_scan';

export interface FlowCtx {
  signedIn: boolean;
  /** The scan already told us the backend, so "What's your backend?" is skipped. */
  skipBackend: boolean;
}

/** The screens this visitor will see, in order. */
export function visibleSteps(ctx: FlowCtx): ObStep[] {
  const steps: ObStep[] = [];
  if (!ctx.signedIn) steps.push('signup');
  steps.push('builtWith');
  if (!ctx.skipBackend) steps.push('backend');
  steps.push('heard');
  return steps;
}

/** Only the question screens (drives the progress dots). */
export function questionSteps(ctx: FlowCtx): ObStep[] {
  return visibleSteps(ctx).filter((s) => s !== 'signup');
}

/**
 * Where to be right now. A draft can point at a screen that no longer applies
 * (signed in since, or the scan finished and detected the backend), so resolve it
 * against the current context instead of trusting it.
 */
export function resolveStep(at: ObStep | undefined, ctx: FlowCtx): ObStep {
  const steps = visibleSteps(ctx);
  if (at && steps.includes(at)) return at;
  if (at === 'backend') return 'heard'; // backend got auto-skipped under us
  return steps[0];
}

/** The screen after `cur`, or 'done' when the questions are finished. */
export function nextStep(cur: ObStep, ctx: FlowCtx): ObStep | 'done' {
  const steps = visibleSteps(ctx);
  const i = steps.indexOf(resolveStep(cur, ctx));
  return i + 1 < steps.length ? steps[i + 1] : 'done';
}

/** The screen before `cur`, or null on the first one. Never goes back to signup. */
export function prevStep(cur: ObStep, ctx: FlowCtx): ObStep | null {
  const steps = visibleSteps(ctx);
  const i = steps.indexOf(resolveStep(cur, ctx));
  if (i <= 0) return null;
  return steps[i - 1] === 'signup' ? null : steps[i - 1];
}

/** Detected-stack field on a scan doc (booleans only, see the worker). */
export interface DetectedStack { supabase?: boolean; firebase?: boolean }

export function shouldSkipBackend(stack: DetectedStack | null | undefined): boolean {
  return !!(stack?.supabase || stack?.firebase);
}

/** The backend answer to save when we skipped the question because the scan knew. */
export function detectedBackend(stack: DetectedStack | null | undefined): string[] {
  const out: string[] = [];
  if (stack?.supabase) out.push('Supabase');
  if (stack?.firebase) out.push('Firebase');
  return out;
}

/** What /onboarding was opened with. */
export interface Entry {
  /** Old `/onboarding?url=…` links: start the scan instead of asking questions. */
  legacyUrl: string | null;
  /** The claimed (or about-to-be-claimed) scan handed over from /results. */
  scanId: string | null;
  /** The marketing Guard CTA: finish on billing instead of the dashboard. */
  plan: 'guard' | 'free';
}

export function readEntry(params: { get(name: string): string | null }): Entry {
  const url = params.get('url')?.trim() || null;
  const scanId = params.get('scan')?.trim() || null;
  return {
    legacyUrl: url,
    scanId: scanId && /^[A-Za-z0-9_-]{1,128}$/.test(scanId) ? scanId : null,
    plan: params.get('plan') === 'guard' ? 'guard' : 'free',
  };
}

/** Where a finished (or skipped) onboarding lands. */
export function finishDestination(plan: 'guard' | 'free'): string {
  return plan === 'guard' ? `/billing?next=${encodeURIComponent('/dashboard')}` : '/dashboard';
}

/** Where /results sends a visitor right after they sign in and the scan is claimed. */
export function postAuthDestination(opts: { onboarded: boolean; scanId: string }): string {
  return opts.onboarded ? '/dashboard' : `/onboarding?scan=${encodeURIComponent(opts.scanId)}`;
}

/**
 * Whether a claim attempt is settled, so the pending marker can be dropped.
 * 200 claimed (or already ours), 404 scan gone, 409 someone else's: retrying won't
 * change anything. Anything else (offline, 5xx, 401 before the token is ready) is
 * transient: keep the marker so the next sign-in or onboarding finish retries it.
 */
export function claimSettled(status: number): boolean {
  return status === 200 || status === 404 || status === 409;
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function store(s?: Store): Store | null {
  if (s) return s;
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export function setPendingScan(scanId: string, s?: Store): void {
  try { store(s)?.setItem(PENDING_SCAN_KEY, scanId); } catch { /* storage off */ }
}
export function getPendingScan(s?: Store): string | null {
  try { return store(s)?.getItem(PENDING_SCAN_KEY) ?? null; } catch { return null; }
}
export function clearPendingScan(s?: Store): void {
  try { store(s)?.removeItem(PENDING_SCAN_KEY); } catch { /* storage off */ }
}

/**
 * sessionStorage marker: "this tab started signing up from /results for scan X".
 * Survives the OAuth redirect round trip (same tab), so on return /results knows
 * to claim X and move on. Separate from PENDING_SCAN_KEY, which the auth layer
 * consumes on its own schedule.
 */
export const HANDOFF_KEY = 'vg_results_handoff';

function session(s?: Store): Store | null {
  if (s) return s;
  try { return typeof window !== 'undefined' ? window.sessionStorage : null; } catch { return null; }
}
export function setHandoff(scanId: string, s?: Store): void {
  try { session(s)?.setItem(HANDOFF_KEY, scanId); } catch { /* storage off */ }
}
export function getHandoff(s?: Store): string | null {
  try { return session(s)?.getItem(HANDOFF_KEY) ?? null; } catch { return null; }
}
export function clearHandoff(s?: Store): void {
  try { session(s)?.removeItem(HANDOFF_KEY); } catch { /* storage off */ }
}
