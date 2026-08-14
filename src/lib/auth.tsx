'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  getAdditionalUserInfo,
  linkWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  type User,
  type UserCredential,
  type AuthError,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

type Which = 'google' | 'github';
const providerLabel = (w: Which) => (w === 'google' ? 'Google' : 'GitHub');
const newProvider = (w: Which) => (w === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider());
const credFromError = (w: Which, err: AuthError) =>
  w === 'google' ? GoogleAuthProvider.credentialFromError(err) : GithubAuthProvider.credentialFromError(err);

/**
 * Sign in with a provider, and gracefully resolve the classic
 * `auth/account-exists-with-different-credential` case (same email already
 * registered with the OTHER provider). We re-authenticate with the existing
 * provider, then LINK the just-attempted credential — so afterwards the user can
 * sign in with EITHER Google or GitHub interchangeably, never a dead end.
 *
 * We only offer two OAuth providers, so the "existing" one is simply the other
 * (and `fetchSignInMethodsForEmail` — which returns [] under email-enumeration
 * protection — is used only as a confirming hint, never a hard dependency).
 */
async function signInWithLinking(which: Which): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth(), newProvider(which));
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
      result = await signInWithPopup(auth(), existingProvider);
    } catch {
      // Second popup was blocked/closed — guide instead of dead-ending.
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
  // Onboarding answers (client-written to the user's own doc) — for segmentation.
  onboarding?: { builtWith?: string; backend?: string; handles?: string[]; codeComfort?: string; scanTarget?: string; shipFrequency?: string };
  alertEmail?: string;
  onboardedAt?: string;
  // Account-wide notification defaults (client-written to the user's own doc).
  notifications?: { email: boolean; critical: boolean; deploy: boolean; summary: boolean };
}

/**
 * THE single client-side paid check: the Guard plan unlocks every paid feature
 * (connections, deep scan, folder upload, monitoring, all fixes). The webhook
 * keeps `plan==='guard'` through grace + a scheduled cancel and drops it to
 * 'free' only when access truly ends. This only drives the UI — the backend
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
  /** Sign in with Google/GitHub (popup). Returns the credential for new-user detection. */
  google: () => Promise<UserCredential>;
  github: () => Promise<UserCredential>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    const res = await api.me();
    const p = res.ok ? (res.data as unknown as Profile) : null;
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth(), async (u) => {
      setUser(u);
      if (u) await refreshProfile();
      else setProfile(null);
      setLoading(false);
    });
  }, [refreshProfile]);

  const google = useCallback(() => signInWithLinking('google'), []);
  const github = useCallback(() => signInWithLinking('github'), []);
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
