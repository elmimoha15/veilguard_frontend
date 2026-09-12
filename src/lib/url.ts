/**
 * The client-side "URL checker": validate a pasted app URL before scanning.
 * Mirrors the backend's public-target guard (http/https only, no localhost /
 * private IPs) so the user gets instant feedback instead of a scan error.
 */
export interface UrlCheck {
  ok: boolean;
  url?: string; // normalized href
  error?: string;
}

const PRIVATE_HOST = /^(localhost|.*\.local|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|0\.0\.0\.0|::1)$/i;

export function checkUrl(input: string): UrlCheck {
  const raw = input.trim();
  if (!raw) return { ok: false, error: 'Enter your app’s URL.' };
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { ok: false, error: 'That doesn’t look like a valid URL.' };
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, error: 'Use an http:// or https:// URL.' };
  }
  if (!u.hostname.includes('.') && u.hostname !== 'localhost') {
    return { ok: false, error: 'Enter a full domain, e.g. myapp.lovable.app.' };
  }
  if (PRIVATE_HOST.test(u.hostname)) {
    return { ok: false, error: 'Enter a public URL (localhost / private addresses can’t be scanned).' };
  }
  return { ok: true, url: u.toString() };
}

/**
 * Best-effort client-side liveness probe, so a well-formed but dead URL (e.g. a
 * domain that doesn't resolve) is refused at the input instead of after signup.
 * A `no-cors` request can't read the response, but it still rejects with a network
 * error when the host can't be reached. Returns `false` ONLY on a definitive fast
 * failure; a timeout / abort returns `true` so a real-but-slow site is never
 * wrongly blocked. The real, authoritative reachability check is the scan itself.
 */
export async function probeReachable(url: string, timeoutMs = 6000): Promise<boolean> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return true;
  try {
    await fetch(url, { mode: 'no-cors', redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
    return true; // host responded (opaque response) → treat as live
  } catch (e) {
    // Timeout / abort is ambiguous (could be a slow real site) → don't block.
    if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError')) return true;
    return false; // network error (DNS/connection) → not reachable
  }
}

/**
 * Bare, normalized hostname of a URL-ish string (lowercased, `www.` stripped).
 * Used to match a URL scan's target to an app so re-scans and links roll up
 * under one project regardless of trailing slashes / scheme / www.
 */
/**
 * Build the Billing upgrade URL carrying the CURRENT in-app page as `next`, so
 * after checkout the user is returned to where they clicked upgrade. Captures
 * `window.location` at call time (client-only).
 */
export function billingHref(): string {
  if (typeof window === 'undefined') return '/billing';
  const cur = window.location.pathname + window.location.search;
  return `/billing?next=${encodeURIComponent(cur)}`;
}

export function hostOf(value: string): string {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return value.trim().toLowerCase();
  }
}
