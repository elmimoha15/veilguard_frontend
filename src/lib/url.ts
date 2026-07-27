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
 * Bare, normalized hostname of a URL-ish string (lowercased, `www.` stripped).
 * Used to match a URL scan's target to an app so re-scans and links roll up
 * under one project regardless of trailing slashes / scheme / www.
 */
export function hostOf(value: string): string {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return value.trim().toLowerCase();
  }
}
