import { auth } from './firebase';

/**
 * Thin client for the Veilguard backend dev-server. All app→backend calls go
 * through here so switching emulator→prod is one env change
 * (NEXT_PUBLIC_BACKEND_URL). The ID token is attached automatically.
 */
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

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

/**
 * POST a small JSON body and download the PDF the backend streams back. Bypasses
 * the JSON `call()` helper (binary response); triggers a browser download and
 * returns a plain `{ ok, error? }` so callers can toast on failure.
 */
async function downloadPdf(path: string, body: Record<string, unknown>, fallbackName: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getIdToken();
  if (!token) return { ok: false, error: 'not signed in' };
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: 'backend unreachable — is the backend running?' };
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error || 'Could not generate the report' };
  }
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const name = cd.match(/filename="?([^"]+)"?/)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true };
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

/** A billing transaction (order) from POST /billingTransactions. Money in integer cents. */
export interface Txn {
  id: string;
  date: string; // ISO
  amount: number; // cents
  currency: string;
  status: string;
  paid: boolean;
  reason: string; // Polar billingReason (subscription_create | subscription_cycle | …)
  invoiceNumber: string | null;
  hasInvoice: boolean;
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
    return { ok: false, status: 0, data: { error: 'Can’t reach Veilguard right now — check your connection and try again.' } as T };
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

/**
 * Retry only TRANSIENT failures — a network drop (status 0) or an our-side 5xx —
 * with backoff. Never retries a 4xx (the user's input won't change on retry).
 * Used to wrap scan-start calls so a blip doesn't surface as a hard error.
 */
async function withRetry<T>(fn: () => Promise<ApiResult<T>>, backoff: number[] = [400, 900, 2000]): Promise<ApiResult<T>> {
  let last = await fn();
  for (let i = 0; i < backoff.length; i++) {
    if (last.ok || !(last.status === 0 || last.status >= 500)) return last;
    await new Promise((r) => setTimeout(r, backoff[i]));
    last = await fn();
  }
  return last;
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                   */
/* -------------------------------------------------------------------------- */

export const api = {
  me: () => call('POST', '/me', { auth: 'required' }),

  createScan: (url: string) =>
    withRetry(() => call<{ scanId?: string; error?: string; code?: string }>('POST', '/createScan', {
      body: { target: { type: 'url', value: url } },
      auth: 'optional',
    })),

  createDeepScan: (sources: { github?: boolean; githubRepo?: string; supabase?: boolean; url?: string }) =>
    withRetry(() => call<{ scanId?: string; error?: string; code?: string }>('POST', '/createDeepScan', { body: sources, auth: 'required' })),

  /**
   * Upload a folder (as a single .zip Blob) for a Pro white-box scan. Bypasses
   * the JSON `call()` helper: the body is a raw zip, not JSON. `name` is a short
   * display label for the project. 402 = not on a paid plan.
   */
  createUploadScan: async (zip: Blob, name: string): Promise<ApiResult<{ scanId?: string; error?: string; code?: string }>> => {
    const token = await getIdToken();
    if (!token) return { ok: false, status: 401, data: { error: 'not signed in' } };
    const attempt = async (): Promise<ApiResult<{ scanId?: string; error?: string; code?: string }>> => {
      let res: Response;
      try {
        res = await fetch(`${BASE}/createUploadScan?name=${encodeURIComponent(name)}`, {
          method: 'POST',
          headers: { 'content-type': 'application/zip', authorization: `Bearer ${token}` },
          body: zip,
        });
      } catch {
        return { ok: false, status: 0, data: { error: 'Can’t reach Veilguard right now — check your connection and try again.' } };
      }
      const data = (await res.json().catch(() => ({}))) as { scanId?: string; error?: string; code?: string };
      return { ok: res.ok, status: res.status, data };
    };
    return withRetry(attempt);
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

  /** Permanently delete the signed-in account + all its data. Irreversible. */
  deleteAccount: () =>
    call<{ ok?: boolean; error?: string }>('POST', '/account/delete', { auth: 'required' }),

  /** Permanently delete ONE app + all its scans/findings/fixes/monitoring. Irreversible.
   *  Identify the app by any of appId / githubRepo / url. Connections are kept. */
  deleteApp: (target: { appId?: string; githubRepo?: string; url?: string }) =>
    call<{ ok?: boolean; error?: string }>('POST', '/app/delete', { body: target, auth: 'required' }),

  /** Download a branded PDF security report for one scan (owner-only, entitlement-gated). */
  downloadReport: (scanId: string) => downloadPdf('/scanReport', { scanId }, 'veilguard-report.pdf'),
  /** Download a branded account-wide summary PDF (all your apps + grades). */
  downloadAccountReport: () => downloadPdf('/accountReport', {}, 'veilguard-account-summary.pdf'),

  /** Start a real Polar checkout for the Guard subscription → { url } to redirect to.
   *  `next` is an in-app path to return to after payment (validated server-side). */
  createCheckout: (next?: string) =>
    call<{ url?: string; error?: string }>('POST', '/createCheckout', { body: { next }, auth: 'required' }),

  /** Open the hosted Polar customer portal (update payment method) → { url }. */
  billingPortal: () =>
    call<{ url?: string; error?: string }>('POST', '/billingPortal', { auth: 'required' }),

  /** The caller's billing history (orders), newest first. Empty for free/no-orders. */
  billingTransactions: () =>
    call<{ transactions?: Txn[]; error?: string }>('POST', '/billingTransactions', { auth: 'required' }),

  /** Downloadable invoice URL for one of the caller's orders. `pending` = still generating. */
  billingInvoice: (orderId: string) =>
    call<{ url?: string; pending?: boolean; error?: string }>('POST', '/billingInvoice', { body: { orderId }, auth: 'required' }),

  /** Schedule cancellation at period end (keeps Guard until currentPeriodEnd). */
  billingCancel: () =>
    call<{ ok?: boolean; error?: string }>('POST', '/billingCancel', { auth: 'required' }),

  /** Reverse a scheduled cancellation. */
  billingReactivate: () =>
    call<{ ok?: boolean; error?: string }>('POST', '/billingReactivate', { auth: 'required' }),

  /** Fetch fix content for a finding. Guard → any (Claude-tailored, generated on
   *  demand); free → the teaser only (else 402). `explanation` is present only for
   *  Claude-tailored fixes. */
  findingFix: (scanId: string, findingId: string) =>
    call<{ fix?: string; fixPrompt?: string; explanation?: string; error?: string }>('POST', '/findingFix', { body: { scanId, findingId }, auth: 'required' }),

  /** GUARD-only: one organized AI prompt containing every fix for a scan (else 402). */
  allFixesPrompt: (scanId: string) =>
    call<{ prompt?: string; count?: number; error?: string }>('POST', '/allFixesPrompt', { body: { scanId }, auth: 'required' }),

  /** Send a feedback / help / bug message. Anonymous allowed (auth optional). The
   *  backend stores it in Firestore + emails support; context fields are auto-captured. */
  submitFeedback: (body: { type: string; message: string; email?: string; page?: string; scanId?: string; userAgent?: string }) =>
    call<{ ok?: boolean; id?: string; error?: string }>('POST', '/feedback', { body, auth: 'optional' }),
};
