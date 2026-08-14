import type { ScanDoc } from './scans';
import { SUPPORT_MAILTO } from '@/content/site';

/**
 * The single source of friendly, plain-English scan error copy. Every failure
 * says what happened, why, and what to do next — and whether it's the user's to
 * fix (gentle) or ours (apologize). Raw error strings/codes are NEVER surfaced
 * here; callers log those to the console only.
 */

export type ScanKind = 'url' | 'deep' | 'upload';
type Reason = NonNullable<ScanDoc['errorReason']>;

export const SUPPORT_LINK = SUPPORT_MAILTO;

export function scanKindOf(scan: Pick<ScanDoc, 'type'>): ScanKind {
  return scan.type === 'deep' ? 'deep' : scan.type === 'upload' ? 'upload' : 'url';
}

export interface ScanFailure {
  title: string;
  body: string;
  tone: 'user' | 'ours';
  /** What the primary button should do. */
  action: 'retry' | 'reupload' | 'reconnect';
  showSupport: boolean;
}

/** Legacy fallback: infer a reason from the free-text error (pre-errorReason docs). */
function inferReason(err?: string): Reason {
  const e = (err || '').toLowerCase();
  if (!e) return 'engine-error';
  if (e.includes('e_timeout') || e.includes('timed out') || e.includes('timeout') || e.includes('exceeded')) return 'timeout';
  if (e.includes('unreachable') || e.includes('could not be reached') || e.includes('reach')) return 'unreachable';
  if (e.includes('no scannable') || e.includes('no code')) return 'empty-upload';
  if (e.includes('reconnect')) return 'needs-reconnect';
  if (e.includes('not found') || e.includes('not available')) return 'not-found';
  return 'engine-error';
}

/** Friendly copy + intent for a FAILED scan (status 'error'), keyed on errorReason. */
export function scanFailure(scan: Pick<ScanDoc, 'type' | 'error' | 'errorReason'>): ScanFailure {
  const kind = scanKindOf(scan);
  const noun = kind === 'url' ? 'site' : kind === 'upload' ? 'upload' : 'repo';
  const reason: Reason = scan.errorReason ?? inferReason(scan.error);

  switch (reason) {
    case 'timeout':
      return kind === 'url'
        ? { title: 'That scan took too long', body: 'Your site didn’t respond in time. Large sites can time out — make sure it’s live, then try again.', tone: 'ours', action: 'retry', showSupport: true }
        : { title: `This ${noun} is large — the scan timed out`, body: `Big ${noun}s can run past our time limit. Try again${kind === 'deep' ? ', or upload just the folder instead' : ''} — you can leave it running in the background.`, tone: 'ours', action: 'retry', showSupport: true };
    case 'unreachable':
      return { title: 'We couldn’t reach that address', body: 'Your site returned an error or looks offline. Check the URL is correct and the site is deployed and loading, then try again.', tone: 'user', action: 'retry', showSupport: false };
    case 'empty-upload':
      return { title: 'We didn’t find any code in that upload', body: 'Make sure you zipped the project folder itself — not an empty or wrapper folder — then upload again.', tone: 'user', action: 'reupload', showSupport: false };
    case 'needs-reconnect':
      return { title: 'Your connection needs refreshing', body: 'We lost access to your connected account. Reconnect it, then run the scan again.', tone: 'user', action: 'reconnect', showSupport: false };
    case 'not-found':
      return kind === 'deep'
        ? { title: 'We can’t access that repo anymore', body: 'Reconnect GitHub, or check the repo still exists and we still have access, then try again.', tone: 'user', action: 'reconnect', showSupport: true }
        : { title: `We couldn’t open that ${noun}`, body: 'Try again — if it keeps happening, reach out and we’ll help.', tone: 'ours', action: 'retry', showSupport: true };
    case 'engine-error':
    default:
      return { title: 'The scan hit a snag on our end', body: 'Not you — us. We’ve logged it. Please try again in a moment.', tone: 'ours', action: 'retry', showSupport: true };
  }
}

export interface StartFailure { message: string; tone: 'user' | 'ours'; upsell?: boolean; showSupport?: boolean }

/** Friendly copy for a scan-START API result (createScan/createDeepScan/createUploadScan). */
export function startFailure(status: number, data: { error?: string; code?: string }): StartFailure {
  if (status === 0) return { message: 'Connection lost — check your internet and try again.', tone: 'ours' };
  if (status >= 500) return { message: 'Something went wrong on our end, not yours. Please try again in a moment.', tone: 'ours', showSupport: true };
  if (data.code === 'E_SCAN_LIMIT') return { message: data.error || 'You’ve used all your scans this month.', tone: 'user', upsell: true };
  if (status === 402) return { message: data.error || 'That’s a Guard feature — upgrade to use it.', tone: 'user', upsell: true };
  // 400 / 409 etc. — the backend already returns short, human strings here.
  return { message: data.error || 'Couldn’t start the scan. Please try again.', tone: 'user' };
}
