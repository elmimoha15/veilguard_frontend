'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { GOOGLE_CLIENT_ID, oneTapEnabled, signInWithGoogleIdToken } from '@/lib/auth';

/**
 * Google One Tap — the Canva-style "Continue as [name]" auto-prompt. Self-
 * contained (uses Firebase directly, so it works on the marketing landing which
 * has no AuthProvider). Renders nothing; it just shows the native GIS prompt.
 *
 * Gated to production + a real client id (off on localhost/emulator), never
 * shown to a signed-in user, and respects a dismissal so it doesn't nag.
 */
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const DISMISS_KEY = 'vg_onetap_dismissed';
const DISMISS_TTL_MS = 60 * 60 * 1000; // don't re-prompt for an hour after a close

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (cfg: Record<string, unknown>) => void;
          prompt: (cb?: (n: { isSkippedMoment?: () => boolean; isDismissedMoment?: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => reject(new Error('gis load'))); return; }
    const s = document.createElement('script');
    s.src = GIS_SRC; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gis load'));
    document.head.appendChild(s);
  });
}

function recentlyDismissed(): boolean {
  try {
    const t = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    return Number.isFinite(t) && Date.now() - t < DISMISS_TTL_MS;
  } catch { return false; }
}

export default function GoogleOneTap() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !oneTapEnabled() || recentlyDismissed()) return;
    started.current = true;

    // Only prompt signed-out visitors — wait for the first restored auth state.
    const unsub = onAuthStateChanged(auth(), async (u) => {
      unsub();
      if (u) return; // already signed in → never nag
      try {
        await loadGis();
        const gid = window.google?.accounts?.id;
        if (!gid) return;
        gid.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return;
            try {
              await signInWithGoogleIdToken(resp.credential);
              router.push('/dashboard'); // AuthGate sends brand-new users to /onboarding
            } catch (e) {
              // e.g. this email is a GitHub account — quietly fall back to the buttons.
              console.error('[onetap] sign-in failed:', e);
            }
          },
        });
        gid.prompt((n) => {
          if (n.isDismissedMoment?.() || n.isSkippedMoment?.()) {
            try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage off */ }
          }
        });
      } catch (e) {
        console.error('[onetap] init failed:', e);
      }
    });
    return () => { try { window.google?.accounts?.id?.cancel(); } catch { /* */ } };
  }, [router]);

  return null;
}
