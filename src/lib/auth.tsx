'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  getAdditionalUserInfo,
  linkWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthCredential,
  signOut,
  type User,
  type UserCredential,
  type AuthError,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

/** OAuth clients where redirect is safe: NOT localhost/emulator. `signInWithRedirect`
 *  returns to `authDomain` (veilguard.dev), great in prod, broken on localhost,  *  so we use redirect in prod and keep the popup locally. */
export function isRedirectEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  const local = h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  return !local && process.env.NEXT_PUBLIC_USE_EMULATOR !== 'true';
}
/** Google Web OAuth client id (public). Present + prod domain → One Tap is on. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export function oneTapEnabled(): boolean {
  return !!GOOGLE_CLIENT_ID && isRedirectEnv();
}

const WHICH_KEY = 'vg_auth_which';        // provider we redirected with
const PENDING_LINK_KEY = 'vg_pending_link'; // cross-provider credential to link on return
const AUTH_ERROR_KEY = 'vg_auth_error';   // redirect-return error message for the login page
const LOGIN_INTENT_KEY = 'vg_auth_login_only'; // redirect started from the LOGIN page (refuse new users)
const NO_ACCOUNT_KEY = 'vg_auth_no_account';   // a new user was refused at login (show Get Started)
const PENDING_SCAN_KEY = 'vg_pending_scan';

/** True while a `signInWithRedirect` is in progress: `WHICH_KEY` is set right
 *  before we redirect and cleared at the end of `completeRedirect()` (and stays
 *  set through the cross-provider link re-redirect). The auth pages use this to
 *  show the branded loader on redirect return instead of flashing the form. */
export function pendingRedirect(): boolean {
  try { return !!window.sessionStorage.getItem(WHICH_KEY); } catch { return false; }
}

/** Read-and-clear an auth error stashed by the redirect handler (login page shows it). */
export function consumeAuthError(): string {
  try {
    const v = window.sessionStorage.getItem(AUTH_ERROR_KEY);
    if (v) { window.sessionStorage.removeItem(AUTH_ERROR_KEY); return v; }
  } catch { /* storage off */ }
  return '';
}

/** Read-and-clear the "new user refused at login" flag stashed by the redirect handler. */
export function consumeNoAccount(): boolean {
  try {
    if (window.sessionStorage.getItem(NO_ACCOUNT_KEY) === '1') {
      window.sessionStorage.removeItem(NO_ACCOUNT_KEY);
      return true;
    }
  } catch { /* storage off */ }
  return false;
}

/** Max session age from the last real sign-in before we force re-login. Tunable
 *  security knob, 7 days balances safety with not nagging users to re-log-in. */
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** Hard cap on how long an OAuth popup may run before we stop waiting (anti-hang). */
const POPUP_TIMEOUT_MS = 180_000;
const SESSION_EXPIRED_KEY = 'vg_session_expired';

/** Mark the session expired (for the login banner) and sign out. Signing out
 *  drives onAuthStateChanged(null) → AuthGate routes to /login. */
export async function expireSession(): Promise<void> {
  try { window.localStorage.setItem(SESSION_EXPIRED_KEY, '1'); } catch { /* storage off */ }
  try { await signOut(auth()); } catch { /* already gone */ }
}
/** Read-and-clear the "session expired" flag (login page shows the message once). */
export function consumeSessionExpired(): boolean {
  try {
    if (window.localStorage.getItem(SESSION_EXPIRED_KEY) === '1') {
      window.localStorage.removeItem(SESSION_EXPIRED_KEY);
      return true;
    }
  } catch { /* storage off */ }
  return false;
}
function sessionTooOld(u: User): boolean {
  const t = u.metadata?.lastSignInTime ? Date.parse(u.metadata.lastSignInTime) : NaN;
  return Number.isFinite(t) && Date.now() - t > SESSION_MAX_AGE_MS;
}

/** Race a promise against a timeout so a hung/closed OAuth popup can't spin forever. */
function withPopupTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => {
      const e = new Error('sign-in timed out') as Error & { code?: string };
      e.code = 'auth/timeout';
      reject(e);
    }, POPUP_TIMEOUT_MS)),
  ]);
}

/** Plain-English message for an auth failure; the raw code is logged, never shown. */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Can’t sign in, check your internet connection and try again.';
    case 'auth/use-existing-provider':
      return e instanceof Error ? e.message : 'Continue with your original provider to sign in.';
    case 'auth/account-exists-with-different-credential':
      return 'That email is already registered, continue with your original provider (Google or GitHub).';
    default:
      return 'Something went wrong signing in. Please try again.';
  }
}

type Which = 'google' | 'github';
const providerLabel = (w: Which) => (w === 'google' ? 'Google' : 'GitHub');
const newProvider = (w: Which) => (w === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider());
const credFromError = (w: Which, err: AuthError) =>
  w === 'google' ? GoogleAuthProvider.credentialFromError(err) : GithubAuthProvider.credentialFromError(err);

/**
 * Sign in with a provider, and gracefully resolve the classic
 * `auth/account-exists-with-different-credential` case (same email already
 * registered with the OTHER provider). We re-authenticate with the existing
 * provider, then LINK the just-attempted credential, so afterwards the user can
 * sign in with EITHER Google or GitHub interchangeably, never a dead end.
 *
 * We only offer two OAuth providers, so the "existing" one is simply the other
 * (and `fetchSignInMethodsForEmail`, which returns [] under email-enumeration
 * protection, is used only as a confirming hint, never a hard dependency).
 */
async function signInWithLinking(which: Which): Promise<UserCredential> {
  try {
    return await withPopupTimeout(signInWithPopup(auth(), newProvider(which)));
  } catch (e) {
    const err = e as AuthError;
    if (err.code !== 'auth/account-exists-with-different-credential') throw err;

    const email = (err.customData?.email as string | undefined) ?? undefined;
    const pending = credFromError(which, err);
    if (!email || !pending) throw err;

    const other: Which = which === 'google' ? 'github' : 'google';
    let existing: Which = other;
    try {
      const methods = await fetchSignInMethodsForEmail(auth(), email);
      if (methods.length) existing = methods.includes('google.com') ? 'google' : methods.includes('github.com') ? 'github' : other;
    } catch { /* enumeration-protection or offline → fall back to `other` */ }

    // Re-authenticate with the account's existing provider (hint the email so the
    // right account is chosen), then link the credential the user just tried.
    const existingProvider = newProvider(existing);
    existingProvider.setCustomParameters({ login_hint: email });
    let result: UserCredential;
    try {
      result = await withPopupTimeout(signInWithPopup(auth(), existingProvider));
    } catch {
      // Second popup was blocked/closed, guide instead of dead-ending.
      const guide = new Error(
        `This email is already registered with ${providerLabel(existing)}. Continue with ${providerLabel(existing)} to sign in.`,
      ) as Error & { code?: string };
      guide.code = 'auth/use-existing-provider';
      throw guide;
    }
    try { await linkWithCredential(result.user, pending); } catch { /* already linked / benign */ }
    return result;
  }
}

/**
 * Start a provider sign-in. Production → full-page `signInWithRedirect` (native
 * feel, no popup blockers); localhost → the popup `signInWithLinking` (redirect
 * can't return to localhost with a custom authDomain). The redirect return is
 * processed by `completeRedirect()` on the next load.
 */
async function startSignIn(which: Which, opts?: { loginOnly?: boolean }): Promise<UserCredential | void> {
  if (isRedirectEnv()) {
    try {
      window.sessionStorage.setItem(WHICH_KEY, which);
      // Remember this redirect began on the LOGIN page, so completeRedirect() can
      // refuse a brand-new user (onboarding signups leave this unset and proceed).
      if (opts?.loginOnly) window.sessionStorage.setItem(LOGIN_INTENT_KEY, '1');
      else window.sessionStorage.removeItem(LOGIN_INTENT_KEY);
    } catch { /* storage off */ }
    await signInWithRedirect(auth(), newProvider(which)); // navigates away
    return;
  }
  return signInWithLinking(which);
}

async function claimPendingScan(): Promise<void> {
  try {
    const scan = window.localStorage.getItem(PENDING_SCAN_KEY);
    if (scan) { await api.claimScan(scan).catch(() => {}); window.localStorage.removeItem(PENDING_SCAN_KEY); }
  } catch { /* storage off */ }
}

/**
 * Process a `signInWithRedirect` return, once on load. Handles the happy path,
 * the same-email cross-provider link (stash the pending credential, re-redirect
 * to the existing provider, link on the following return, the stash's presence
 * is the loop guard), and errors (stashed as a plain-English message for the
 * login page). No-op when there is no pending redirect.
 */
export async function completeRedirect(): Promise<void> {
  let result: UserCredential | null = null;
  try {
    result = await getRedirectResult(auth());
  } catch (e) {
    const err = e as AuthError;
    if (err.code === 'auth/account-exists-with-different-credential') {
      const which = (window.sessionStorage.getItem(WHICH_KEY) as Which | null) ?? null;
      const email = (err.customData?.email as string | undefined) ?? undefined;
      const pending = which ? credFromError(which, err) : null;
      const already = !!safeGet(PENDING_LINK_KEY);
      if (which && email && pending && !already) {
        try { window.sessionStorage.setItem(PENDING_LINK_KEY, JSON.stringify(pending.toJSON())); } catch { /* */ }
        const existing: Which = which === 'google' ? 'github' : 'google';
        const p = newProvider(existing);
        p.setCustomParameters({ login_hint: email });
        try { window.sessionStorage.setItem(WHICH_KEY, existing); } catch { /* */ }
        await signInWithRedirect(auth(), p); // returns → link applied below
        return;
      }
    }
    console.error('[auth] redirect result failed:', e);
    try { window.sessionStorage.setItem(AUTH_ERROR_KEY, authErrorMessage(e)); } catch { /* */ }
    clearRedirectStash();
    return;
  }

  if (!result) return; // no pending redirect

  const pend = readPendingLink();
  // Login page + brand-new user (and not a cross-provider link) → refuse: undo the
  // just-created account, flag it so the login page shows "Get Started", and stop.
  if (!pend && safeGet(LOGIN_INTENT_KEY) === '1' && isNewUser(result)) {
    try { window.sessionStorage.setItem(NO_ACCOUNT_KEY, '1'); } catch { /* */ }
    try { await result.user.delete(); } catch { await signOut(auth()).catch(() => {}); }
    clearRedirectStash();
    try { window.sessionStorage.removeItem(LOGIN_INTENT_KEY); } catch { /* */ }
    return;
  }
  try { window.sessionStorage.removeItem(LOGIN_INTENT_KEY); } catch { /* */ }

  if (pend) {
    try { await linkWithCredential(result.user, pend); } catch (e) { console.error('[auth] link failed:', e); }
  }
  const which = window.sessionStorage.getItem(WHICH_KEY);
  if (which === 'google' || which === 'github') rememberProvider(which);
  clearRedirectStash();
  await claimPendingScan();
}

function safeGet(k: string): string | null { try { return window.sessionStorage.getItem(k); } catch { return null; } }
function clearRedirectStash(): void {
  try { window.sessionStorage.removeItem(PENDING_LINK_KEY); window.sessionStorage.removeItem(WHICH_KEY); } catch { /* */ }
}
function readPendingLink(): OAuthCredential | null {
  const raw = safeGet(PENDING_LINK_KEY);
  if (!raw) return null;
  try { return OAuthCredential.fromJSON(JSON.parse(raw)); } catch { return null; }
}

/**
 * Google One Tap: exchange the GIS ID token for a Firebase sign-in, the SAME
 * Firebase user as the normal Google flow (creates or links). Claims a pending
 * anonymous scan on success.
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<UserCredential> {
  const result = await signInWithCredential(auth(), GoogleAuthProvider.credential(idToken));
  rememberProvider('google');
  await claimPendingScan();
  return result;
}

export interface Profile {
  uid: string;
  email?: string;
  plan?: string;
  onboarded?: boolean;
  connections?: Record<string, unknown>;
  // Billing (server-set via the Polar webhook; surfaced by /me for the UI).
  status?: 'active' | 'past_due' | 'canceled' | 'expired';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  // Usage computed server-side from the user's scans (accurate + persistent).
  usage?: { scansThisMonth: number };
  caps?: { maxScansPerMonth: number };
  // Onboarding answers (client-written to the user's own doc), for segmentation.
  onboarding?: { builtWith?: string[]; backend?: string; handles?: string[]; codeComfort?: string; scanTarget?: string; shipFrequency?: string };
  alertEmail?: string;
  onboardedAt?: string;
  // Account-wide notification defaults (client-written to the user's own doc).
  notifications?: { email: boolean; critical: boolean; deploy: boolean; summary: boolean };
}

// Cache the profile so a reload/new tab has it INSTANTLY (correct plan/gates with no
// flash) while /me refreshes in the background.
const PROFILE_CACHE_KEY = 'vg_profile';
function readProfileCache(): Profile | null {
  try { const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY); return raw ? (JSON.parse(raw) as Profile) : null; } catch { return null; }
}
function writeProfileCache(p: Profile | null): void {
  try {
    if (p) window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    else window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
  } catch { /* storage off */ }
}

/**
 * THE single client-side paid check: the Guard plan unlocks every paid feature
 * (connections, deep scan, folder upload, monitoring, all fixes). The webhook
 * keeps `plan==='guard'` through grace + a scheduled cancel and drops it to
 * 'free' only when access truly ends. This only drives the UI, the backend
 * independently enforces every gate.
 */
export function isPaid(profile: Profile | null | undefined): boolean {
  return (profile?.plan ?? 'free') === 'guard';
}

/** Which provider the user last successfully signed in with (localStorage). */
export type LastProvider = 'google' | 'github';
const LAST_PROVIDER_KEY = 'vg_last_provider';

export function rememberProvider(which: LastProvider): void {
  try { window.localStorage.setItem(LAST_PROVIDER_KEY, which); } catch { /* SSR / disabled storage */ }
}
export function getLastProvider(): LastProvider | null {
  try {
    const v = window.localStorage.getItem(LAST_PROVIDER_KEY);
    return v === 'google' || v === 'github' ? v : null;
  } catch { return null; }
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  /** Sign in with Google/GitHub. Prod → redirect (navigates away, resolves void);
   *  localhost → popup (returns the credential for new-user detection). */
  google: (opts?: { loginOnly?: boolean }) => Promise<UserCredential | void>;
  github: (opts?: { loginOnly?: boolean }) => Promise<UserCredential | void>;
  /** Link a Google/GitHub sign-in to the current account (account linking). */
  link: (which: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => readProfileCache());
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    let res;
    try {
      res = await api.me();
    } catch (e) {
      // getIdToken() can reject when the token can't refresh (revoked), that's
      // an expired session, not a crash.
      console.error('[auth] /me failed:', e);
      await expireSession();
      setProfile(null); writeProfileCache(null);
      return null;
    }
    if (res.status === 401) { await expireSession(); setProfile(null); writeProfileCache(null); return null; }
    const p = res.ok ? (res.data as unknown as Profile) : null;
    setProfile(p);
    writeProfileCache(p);
    return p;
  }, []);

  // Process a signInWithRedirect return once on load (links, provider memory,
  // scan claim, or stashes an error for the login page).
  useEffect(() => { void completeRedirect(); }, []);

  useEffect(() => {
    return onAuthStateChanged(auth(), async (u) => {
      if (u) {
        // Max-age expiry + token validity. On expiry we sign out, which re-fires
        // this callback with null (which clears loading + routes to /login).
        if (sessionTooOld(u)) { await expireSession(); return; }
        try { await u.getIdToken(); } catch { await expireSession(); return; }
      }
      // Unblock the app as soon as the session is known (fast, from IndexedDB),       // do NOT wait for the /me network call. The profile refreshes in the
      // background; the UI uses the cached profile meanwhile (no full-screen wait).
      setUser(u);
      setLoading(false);
      if (u) void refreshProfile();
      else { setProfile(null); writeProfileCache(null); }
    });
  }, [refreshProfile]);

  // A long-open tab must also expire without a reload.
  useEffect(() => {
    const id = setInterval(() => {
      const u = auth().currentUser;
      if (u && sessionTooOld(u)) void expireSession();
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const google = useCallback((opts?: { loginOnly?: boolean }) => startSignIn('google', opts), []);
  const github = useCallback((opts?: { loginOnly?: boolean }) => startSignIn('github', opts), []);
  const link = useCallback(async (which: 'google' | 'github') => {
    const u = auth().currentUser;
    if (!u) throw new Error('not signed in');
    const provider = which === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    await linkWithPopup(u, provider);
    // Linking mutates currentUser in place (not via onAuthStateChanged), so pull
    // the fresh user + profile so the UI reflects the new sign-in method/email.
    await u.reload();
    setUser(auth().currentUser);
    await refreshProfile();
  }, [refreshProfile]);
  const logout = useCallback(async () => {
    await signOut(auth());
  }, []);

  return (
    <Ctx.Provider value={{ user, profile, loading, refreshProfile, google, github, link, logout }}>
      {children}
    </Ctx.Provider>
  );
}

/** Was this credential a brand-new account (first-ever sign-in)? */
export function isNewUser(cred: UserCredential): boolean {
  return getAdditionalUserInfo(cred)?.isNewUser ?? false;
}
