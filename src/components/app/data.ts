/**
 * Presentational lookups shared by the product-app screens. The app is fully
 * wired to the real backend (scans/findings come from Firestore via
 * `@/lib/hooks` + `@/lib/scans`); this file only holds severity display metadata
 * and the small enums the UI filters on — no mock scan/app data.
 */

export type Sev = 'CRITICAL' | 'WARNING' | 'PASSED';
export type Status = 'open' | 'fixed' | 'ignored' | 'passed';

export const SEV_COLOR: Record<Sev, string> = {
  CRITICAL: '#E5352B',
  WARNING: '#F2851F',
  PASSED: '#1FB86B',
};

export const SEV_META: Record<Sev, { emoji: string; sevPlain: string; sevHint: string }> = {
  CRITICAL: { emoji: '🔴', sevPlain: 'Serious problem — fix this first', sevHint: 'Someone could actually get to your customers’ data right now.' },
  WARNING: { emoji: '🟠', sevPlain: 'Worth fixing soon', sevHint: 'Not an emergency, but it makes you an easier target.' },
  PASSED: { emoji: '🟢', sevPlain: 'You’re good here', sevHint: 'This check passed — nothing to do.' },
};

export const STATUS_META: Record<Status, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open', bg: 'rgba(229,53,43,.1)', fg: '#c0392f' },
  fixed: { label: 'Fixed ✓', bg: 'rgba(31,184,107,.14)', fg: '#158a4f' },
  ignored: { label: 'Ignored', bg: '#EEEDE8', fg: '#8b8a86' },
  passed: { label: 'Passed', bg: 'rgba(31,184,107,.14)', fg: '#158a4f' },
};
