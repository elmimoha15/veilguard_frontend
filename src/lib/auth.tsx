'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { api, DEV_FAKE_PAID } from './api';

export interface Profile {
  uid: string;
  email?: string;
  plan?: string;
  onboarded?: boolean;
  connections?: Record<string, unknown>;
}

/**
 * THE single client-side paid check. Any non-free plan unlocks every paid
 * feature (connections, deep scan, folder upload, monitoring, fixes). This only
 * drives the UI — the backend independently enforces every gate. `DEV_FAKE_PAID`
 * unlocks locally against the emulator.
 */
export function isPaid(profile: Profile | null | undefined): boolean {
  return (profile?.plan ?? 'free') !== 'free' || DEV_FAKE_PAID;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  logInEmail: (email: string, password: string) => Promise<void>;
  google: () => Promise<void>;
  github: () => Promise<void>;
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

  const signUpEmail = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth(), email, password);
  }, []);
  const logInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth(), email, password);
  }, []);
  const google = useCallback(async () => {
    await signInWithPopup(auth(), new GoogleAuthProvider());
  }, []);
  const github = useCallback(async () => {
    await signInWithPopup(auth(), new GithubAuthProvider());
  }, []);
  const logout = useCallback(async () => {
    await signOut(auth());
  }, []);

  return (
    <Ctx.Provider value={{ user, profile, loading, refreshProfile, signUpEmail, logInEmail, google, github, logout }}>
      {children}
    </Ctx.Provider>
  );
}
