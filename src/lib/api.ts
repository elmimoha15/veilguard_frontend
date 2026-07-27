import { auth } from './firebase';

/**
 * Thin client for the Veilguard backend dev-server. All app→backend calls go
 * through here so switching emulator→prod is one env change
 * (NEXT_PUBLIC_BACKEND_URL). The ID token is attached automatically.
 */
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
export const DEV_FAKE_PAID = process.env.NEXT_PUBLIC_DEV_FAKE_PAID === 'true';

/**
 * MOCK connection targets for local dev. In mock mode (emulator) the backend
 * points these at local repo/policy fixtures instead of a real GitHub/Supabase
 * OAuth flow — mirrors the throwaway dev-ui. Never used against production.
 */
export const MOCK_GITHUB_REPO = '../veilguard-scanner/test-fixtures/vulnerable/quickcart';
export const MOCK_SUPABASE_POLICIES = 'test-fixtures/supabase-broken-rls';

export async function getIdToken(): Promise<string | null> {
  const u = auth().currentUser;
  return u ? u.getIdToken() : null;
}

type AuthMode = 'required' | 'optional' | 'none';

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

/** A repo the user's GitHub connection can scan (from POST /github/repos). */
export interface GitHubRepo {
  fullName: string;
  private: boolean;
  language?: string;
  pushedAt?: string;
  defaultBranch?: string;
}

async function call<T = Record<string, unknown>>(
  method: 'GET' | 'POST',
  path: string,
  { body, auth: authMode = 'optional' }: { body?: unknown; auth?: AuthMode } = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authMode !== 'none') {
    const token = await getIdToken();
    if (token) headers.authorization = `Bearer ${token}`;
    else if (authMode === 'required') return { ok: false, status: 401, data: { error: 'not signed in' } as T };
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    return { ok: false, status: 0, data: { error: 'backend unreachable — is `npm run dev:all` running?' } as T };
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                   */
/* -------------------------------------------------------------------------- */

export const api = {
  me: () => call('POST', '/me', { auth: 'required' }),

  createScan: (url: string) =>
    call<{ scanId?: string; error?: string }>('POST', '/createScan', {
      body: { target: { type: 'url', value: url } },
      auth: 'optional',
    }),

  createDeepScan: (sources: { github?: boolean; githubRepo?: string; supabase?: boolean; url?: string }) =>
    call<{ scanId?: string; error?: string }>('POST', '/createDeepScan', { body: sources, auth: 'required' }),

  /**
   * Upload a folder (as a single .zip Blob) for a Pro white-box scan. Bypasses
   * the JSON `call()` helper: the body is a raw zip, not JSON. `name` is a short
   * display label for the project. 402 = not on a paid plan.
   */
  createUploadScan: async (zip: Blob, name: string): Promise<ApiResult<{ scanId?: string; error?: string }>> => {
    const token = await getIdToken();
    if (!token) return { ok: false, status: 401, data: { error: 'not signed in' } };
    let res: Response;
    try {
      res = await fetch(`${BASE}/createUploadScan?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/zip', authorization: `Bearer ${token}` },
        body: zip,
      });
    } catch {
      return { ok: false, status: 0, data: { error: 'backend unreachable — is the backend running?' } };
    }
    const data = (await res.json().catch(() => ({}))) as { scanId?: string; error?: string };
    return { ok: res.ok, status: res.status, data };
  },

  /** List the repos the caller's connected GitHub installation can scan (repo picker). */
  githubRepos: () =>
    call<{ repos?: GitHubRepo[]; error?: string }>('POST', '/github/repos', { auth: 'required' }),

  claimScan: (scanId: string) => call<{ error?: string }>('POST', '/claimScan', { body: { scanId }, auth: 'required' }),

  /** Send the branded email-verification message (Resend, via backend). */
  sendVerification: () => call<{ ok?: boolean; error?: string }>('POST', '/auth/sendVerification', { auth: 'required' }),
  /** Send a branded password-reset email. Always 200 (no account enumeration). */
  sendReset: (email: string) => call<{ ok?: boolean; error?: string }>('POST', '/auth/sendReset', { body: { email }, auth: 'none' }),

  /** Start a real OAuth connection; returns the provider URL to open (popup). `mock` is true only on the local emulator. */
  connectBegin: (provider: 'github' | 'supabase' | 'vercel' | 'netlify' | 'firebase') =>
    call<{ redirectUrl?: string; scopes?: string[]; mock?: boolean; error?: string }>('POST', '/connect/begin', { body: { provider }, auth: 'required' }),

  /** Local emulator only: complete a mock connect without a real provider round-trip. */
  completeMockConnect: (provider: 'github' | 'supabase', state: string) =>
    call('GET', `/connect/${provider}/callback?code=devmock&state=${encodeURIComponent(state)}`, { auth: 'none' }),

  connectGitHub: (repoPath: string) =>
    call<{ connected?: string; error?: string }>('POST', '/connectGitHub', { body: { repoPath }, auth: 'required' }),
  connectSupabase: (policiesPath: string, projectRef?: string) =>
    call<{ connected?: string; error?: string }>('POST', '/connectSupabase', { body: { policiesPath, projectRef }, auth: 'required' }),
  disconnect: (provider: 'github' | 'supabase') =>
    call<{ error?: string }>('POST', '/disconnect', { body: { provider }, auth: 'required' }),

  /** Begin an upgrade. Fake mode → { mode:'fake', plan }; real Polar (later) → { mode:'polar', url }. */
  billingCheckout: (plan: string) =>
    call<{ mode?: 'fake' | 'polar'; url?: string; plan?: string; error?: string }>('POST', '/billing/checkout', { body: { plan }, auth: 'required' }),

  /** FAKE upgrade: set the plan server-side (backend refuses unless FAKE_BILLING is on). */
  billingConfirm: (plan: string) =>
    call<{ plan?: string; error?: string }>('POST', '/billing/confirm', { body: { plan }, auth: 'required' }),

  /** Fetch the paid fix content for a finding (402 for free users). */
  findingFix: (scanId: string, findingId: string) =>
    call<{ fix?: string; fixPrompt?: string; error?: string }>('POST', '/findingFix', { body: { scanId, findingId }, auth: 'required' }),

  /** DEV-ONLY: preview the unlocked fix (backend refuses unless dev flag + emulator). */
  unlockedFinding: (scanId: string, findingId: string) =>
    call<{ fix?: string; fixPrompt?: string; error?: string }>(
      'GET',
      `/dev/unlockedFinding?scanId=${encodeURIComponent(scanId)}&findingId=${encodeURIComponent(findingId)}`,
      { auth: 'required' },
    ),
};
