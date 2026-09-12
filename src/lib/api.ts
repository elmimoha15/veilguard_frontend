import { auth } from './firebase';

/**
 * Thin client for the Veilguard backend dev-server. All app→backend calls go
 * through here so switching emulator→prod is one env change
 * (NEXT_PUBLIC_BACKEND_URL). The ID token is attached automatically.
 */
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

/** Default per-request timeout so a hung/stalled socket can't spin forever. */
const DEFAULT_TIMEOUT_MS = 20_000;
/** Uploads legitimately take longer than a normal request. */
const UPLOAD_TIMEOUT_MS = 120_000;

/** `fetch` with an AbortController timeout. Rejects (like a network error) if the
 *  request doesn't complete in time, so callers resolve to a retry state. */
async function timedFetch(input: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

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
 * PUT a zip Blob to an upload URL (a GCS resumable-session URI in prod, or the dev
 * server's /uploadBytes locally) with real upload progress. Uses XHR because
 * `fetch` has no upload-progress event. Content-Range is sent for GCS (absolute
 * URL); local staging just needs the content-type.
 */
function putZipWithProgress(url: string, zip: Blob, onProgress?: (frac: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', 'application/zip');
    if (/^https?:\/\//i.test(url) && zip.size > 0) xhr.setRequestHeader('Content-Range', `bytes 0-${zip.size - 1}/${zip.size}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('upload network error'));
    xhr.send(zip);
  });
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
    res = await timedFetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }, 60_000); // report generation can be slower than a normal call
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
  /** Repo size in KB (from GitHub) — lets the picker warn that a big repo takes a while. */
  sizeKb?: number;
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
  { body, auth: authMode = 'optional', retry = false, timeoutMs }: { body?: unknown; auth?: AuthMode; retry?: boolean; timeoutMs?: number } = {},
): Promise<ApiResult<T>> {
  const once = async (): Promise<ApiResult<T>> => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (authMode !== 'none') {
      const token = await getIdToken();
      if (token) headers.authorization = `Bearer ${token}`;
      else if (authMode === 'required') return { ok: false, status: 401, data: { error: 'not signed in' } as T };
    }
    let res: Response;
    try {
      res = await timedFetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }, timeoutMs);
    } catch (e) {
      // Abort (timeout) vs a plain network failure — both surface as status 0, but
      // a timeout gets copy that admits the wait rather than blaming the connection.
      const timedOut = e instanceof DOMException && e.name === 'AbortError';
      const error = timedOut
        ? 'This is taking longer than usual — please try again.'
        : 'Can’t reach Veilguard right now — check your connection and try again.';
      return { ok: false, status: 0, data: { error } as T };
    }
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  };
  // Retry only idempotent reads (opt-in) — a transient blip/timeout shouldn't
  // surface as a hard error. Mutations stay single-shot to avoid double effects.
  return retry ? withRetry(once) : once();
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
  me: () => call('POST', '/me', { auth: 'required', retry: true }),

  createScan: (url: string) =>
    withRetry(() => call<{ scanId?: string; error?: string; code?: string }>('POST', '/createScan', {
      body: { target: { type: 'url', value: url } },
      auth: 'optional',
    })),

  createDeepScan: (sources: { github?: boolean; githubRepo?: string; supabase?: boolean; url?: string }) =>
    withRetry(() => call<{ scanId?: string; error?: string; code?: string }>('POST', '/createDeepScan', { body: sources, auth: 'required' })),

  /**
   * Upload a folder (zipped client-side) for a Pro white-box scan — ANY size.
   * Three steps so the bytes stream BROWSER→CLOUD directly and aren't bounded by
   * Cloud Run's ~32MB request cap:
   *   1) POST /createUploadSession { name } → { scanId, uploadUrl } (all the gates).
   *   2) PUT the zip straight to uploadUrl (GCS in prod; the dev server locally),
   *      reporting progress via `onProgress` (0→1).
   *   3) POST /finalizeUploadScan { scanId, name } → 202 { scanId }.
   * Returns the same `{ scanId?, error?, code? }` shape as before, from whichever
   * step first fails, so callers keep their existing status handling.
   */
  uploadFolderScan: async (
    zip: Blob,
    name: string,
    onProgress?: (frac: number) => void,
  ): Promise<ApiResult<{ scanId?: string; error?: string; code?: string }>> => {
    const token = await getIdToken();
    if (!token) return { ok: false, status: 401, data: { error: 'not signed in' } };
    const auth = { 'content-type': 'application/json', authorization: `Bearer ${token}` };
    const offline = { ok: false as const, status: 0, data: { error: 'Can’t reach Veilguard right now — check your connection and try again.' } };

    // 1) session
    let s: Response;
    try {
      s = await timedFetch(`${BASE}/createUploadSession`, { method: 'POST', headers: auth, body: JSON.stringify({ name }) });
    } catch { return offline; }
    const sData = (await s.json().catch(() => ({}))) as { scanId?: string; uploadUrl?: string; error?: string; code?: string };
    if (!s.ok || !sData.scanId || !sData.uploadUrl) return { ok: false, status: s.status || 500, data: sData };

    // 2) upload bytes directly to the session URL, with progress
    const putUrl = /^https?:\/\//i.test(sData.uploadUrl) ? sData.uploadUrl : `${BASE}${sData.uploadUrl}`;
    try {
      await putZipWithProgress(putUrl, zip, onProgress);
    } catch {
      return { ok: false, status: 0, data: { error: 'Upload failed — check your connection and try again.' } };
    }

    // 3) finalize → creates the scan doc + enqueues
    let f: Response;
    try {
      f = await timedFetch(`${BASE}/finalizeUploadScan`, { method: 'POST', headers: auth, body: JSON.stringify({ scanId: sData.scanId, name }) }, UPLOAD_TIMEOUT_MS);
    } catch { return offline; }
    const fData = (await f.json().catch(() => ({}))) as { scanId?: string; error?: string; code?: string };
    return { ok: f.ok, status: f.status, data: fData };
  },

  /** List the repos the caller's connected GitHub installation can scan (repo picker). */
  githubRepos: () =>
    call<{ repos?: GitHubRepo[]; error?: string }>('POST', '/github/repos', { auth: 'required', retry: true }),

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
    call<{ transactions?: Txn[]; error?: string }>('POST', '/billingTransactions', { auth: 'required', retry: true }),

  /** Downloadable invoice URL for one of the caller's orders. `pending` = still generating. */
  billingInvoice: (orderId: string) =>
    call<{ url?: string; pending?: boolean; error?: string }>('POST', '/billingInvoice', { body: { orderId }, auth: 'required', retry: true }),

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
    call<{ fix?: string; fixPrompt?: string; explanation?: string; error?: string }>('POST', '/findingFix', { body: { scanId, findingId }, auth: 'required', retry: true }),

  /** GUARD-only: one organized AI prompt containing every fix for a scan (else 402). */
  allFixesPrompt: (scanId: string) =>
    call<{ prompt?: string; count?: number; error?: string }>('POST', '/allFixesPrompt', { body: { scanId }, auth: 'required', retry: true }),

  /** Send a feedback / help / bug message. Anonymous allowed (auth optional). The
   *  backend stores it in Firestore + emails support; context fields are auto-captured. */
  submitFeedback: (body: { type: string; message: string; email?: string; page?: string; scanId?: string; userAgent?: string }) =>
    call<{ ok?: boolean; id?: string; error?: string }>('POST', '/feedback', { body, auth: 'optional' }),
};
