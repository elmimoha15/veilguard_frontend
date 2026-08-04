/**
 * Presentational lookups shared by the product-app screens. The app is fully
 * wired to the real backend (scans/findings come from Firestore via
 * `@/lib/hooks` + `@/lib/scans`); this file only holds severity display metadata
 * and the small enums the UI filters on — no mock scan/app data.
 */

export type Sev = 'CRITICAL' | 'WARNING' | 'PASSED';
export type Status = 'open' | 'fixed' | 'ignored' | 'passed';

export const SEV_COLOR: Record<Sev, string> = {
  CRITICAL: '#E5484D',
  WARNING: '#E0932F',
  PASSED: '#1F9D57',
};

/* Tint / text pairs for severity — used by finding banners & pills. */
export const SEV_TINT: Record<Sev, { bg: string; fg: string }> = {
  CRITICAL: { bg: '#FBEAEA', fg: '#C23B3F' },
  WARNING: { bg: '#FBF1E1', fg: '#9A6412' },
  PASSED: { bg: '#EAF6EF', fg: '#157A43' },
};

export const SEV_META: Record<Sev, { sevPlain: string; sevHint: string }> = {
  CRITICAL: { sevPlain: 'Serious problem — fix this first', sevHint: 'Someone could actually get to your customers’ data right now.' },
  WARNING: { sevPlain: 'Worth fixing soon', sevHint: 'Not an emergency, but it makes you an easier target.' },
  PASSED: { sevPlain: 'You’re good here', sevHint: 'This check passed — nothing to do.' },
};

export const STATUS_META: Record<Status, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open', bg: '#FBEAEA', fg: '#C23B3F' },
  fixed: { label: 'Fixed', bg: '#EAF6EF', fg: '#157A43' },
  ignored: { label: 'Ignored', bg: '#F2F2EF', fg: '#9B9B96' },
  passed: { label: 'Passed', bg: '#EAF6EF', fg: '#157A43' },
};
