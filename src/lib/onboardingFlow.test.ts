import { describe, it, expect } from 'vitest';
import {
  visibleSteps, questionSteps, resolveStep, nextStep, prevStep, shouldSkipBackend, detectedBackend,
  readEntry, finishDestination, postAuthDestination, claimSettled,
  setPendingScan, getPendingScan, clearPendingScan, setHandoff, getHandoff, clearHandoff,
  PENDING_SCAN_KEY, HANDOFF_KEY, type FlowCtx, type ObStep,
} from './onboardingFlow';

const signedOut: FlowCtx = { signedIn: false, skipBackend: false };
const signedIn: FlowCtx = { signedIn: true, skipBackend: false };
const detected: FlowCtx = { signedIn: true, skipBackend: true };

function memStore() {
  const m = new Map<string, string>();
  return {
    m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

/** Walk Continue/Skip from the first screen to the end, like a user would. */
function walk(ctx: FlowCtx): (ObStep | 'done')[] {
  const seen: (ObStep | 'done')[] = [];
  let at: ObStep | 'done' = resolveStep(undefined, ctx);
  while (at !== 'done' && seen.length < 10) { seen.push(at); at = nextStep(at, ctx); }
  seen.push(at);
  return seen;
}

describe('short onboarding steps', () => {
  it('asks at most 3 questions, one per screen', () => {
    expect(questionSteps(signedIn)).toEqual(['builtWith', 'backend', 'heard']);
    expect(questionSteps(signedIn).length).toBeLessThanOrEqual(3);
  });

  it('shows sign-up first only when signed out (direct /signup visitors)', () => {
    expect(visibleSteps(signedOut)[0]).toBe('signup');
    expect(visibleSteps(signedIn)).not.toContain('signup');
  });

  it('skips the backend question when the scan detected the backend', () => {
    expect(visibleSteps(detected)).toEqual(['builtWith', 'heard']);
    expect(walk(detected)).toEqual(['builtWith', 'heard', 'done']);
  });

  it('skipping every question still reaches done (finish marks onboarded)', () => {
    expect(walk(signedIn)).toEqual(['builtWith', 'backend', 'heard', 'done']);
  });

  it('leaves signup as soon as the user is signed in (redirect or popup return)', () => {
    expect(resolveStep('signup', signedIn)).toBe('builtWith');
  });

  it('a cancelled sign-in keeps the visitor on signup, not a blank step', () => {
    expect(resolveStep('signup', signedOut)).toBe('signup');
    expect(resolveStep('heard', signedOut)).toBe('heard');
  });

  it('moves off the backend screen if detection lands while on it', () => {
    expect(resolveStep('backend', detected)).toBe('heard');
  });

  it('Back never returns to signup or before the first question', () => {
    expect(prevStep('builtWith', signedOut)).toBeNull();
    expect(prevStep('builtWith', signedIn)).toBeNull();
    expect(prevStep('heard', signedIn)).toBe('backend');
    expect(prevStep('heard', detected)).toBe('builtWith');
  });
});

describe('backend detection', () => {
  it('only skips for a real detected backend', () => {
    expect(shouldSkipBackend(undefined)).toBe(false);
    expect(shouldSkipBackend(null)).toBe(false);
    expect(shouldSkipBackend({})).toBe(false);
    expect(shouldSkipBackend({ supabase: true })).toBe(true);
    expect(shouldSkipBackend({ firebase: true })).toBe(true);
  });
  it('saves the detected backend in the same answer format as the question', () => {
    expect(detectedBackend({ supabase: true })).toEqual(['Supabase']);
    expect(detectedBackend({ supabase: true, firebase: true })).toEqual(['Supabase', 'Firebase']);
    expect(detectedBackend(undefined)).toEqual([]);
  });
});

describe('entry links', () => {
  const q = (s: string) => new URLSearchParams(s);
  it('recognises old /onboarding?url= links', () => {
    expect(readEntry(q('url=myapp.lovable.app')).legacyUrl).toBe('myapp.lovable.app');
  });
  it('picks up the scan handed over from /results', () => {
    expect(readEntry(q('scan=AbC123_-x')).scanId).toBe('AbC123_-x');
  });
  it('ignores a malformed scan id', () => {
    expect(readEntry(q('scan=../../etc')).scanId).toBeNull();
    expect(readEntry(q('scan=')).scanId).toBeNull();
  });
  it('plain /onboarding is a normal free signup', () => {
    expect(readEntry(q(''))).toEqual({ legacyUrl: null, scanId: null, plan: 'free' });
  });
  it('the marketing Guard CTA finishes on billing', () => {
    expect(readEntry(q('plan=guard')).plan).toBe('guard');
    expect(finishDestination('guard')).toBe('/billing?next=%2Fdashboard');
    expect(finishDestination('free')).toBe('/dashboard');
  });
});

describe('after sign-in on /results', () => {
  it('new accounts go to the short questions with the same scan', () => {
    expect(postAuthDestination({ onboarded: false, scanId: 'abc' })).toBe('/onboarding?scan=abc');
  });
  it('existing onboarded accounts go straight to the dashboard', () => {
    expect(postAuthDestination({ onboarded: true, scanId: 'abc' })).toBe('/dashboard');
  });
});

describe('claim handoff', () => {
  it('drops the pending marker only once the claim is settled', () => {
    expect(claimSettled(200)).toBe(true);  // claimed, or already ours
    expect(claimSettled(404)).toBe(true);  // scan gone
    expect(claimSettled(409)).toBe(true);  // someone else's
    expect(claimSettled(0)).toBe(false);   // offline: retry later, don't lose the scan
    expect(claimSettled(500)).toBe(false);
    expect(claimSettled(401)).toBe(false); // token not ready yet
  });

  it('round-trips the pending scan (localStorage) and the results handoff (sessionStorage)', () => {
    const local = memStore();
    setPendingScan('s1', local);
    expect(local.m.get(PENDING_SCAN_KEY)).toBe('s1');
    expect(getPendingScan(local)).toBe('s1');
    clearPendingScan(local);
    expect(getPendingScan(local)).toBeNull();

    const session = memStore();
    setHandoff('s2', session);
    expect(session.m.get(HANDOFF_KEY)).toBe('s2');
    expect(getHandoff(session)).toBe('s2');
    clearHandoff(session);
    expect(getHandoff(session)).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    const broken = { getItem: () => { throw new Error('off'); }, setItem: () => { throw new Error('off'); }, removeItem: () => { throw new Error('off'); } };
    expect(() => setPendingScan('x', broken)).not.toThrow();
    expect(getPendingScan(broken)).toBeNull();
    expect(() => clearHandoff(broken)).not.toThrow();
  });
});
