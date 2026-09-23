/**
 * Presentational lookups shared by the product-app screens. The app is fully
 * wired to the real backend (scans/findings come from Firestore via
 * `@/lib/hooks` + `@/lib/scans`); this file only holds the display palette and
 * the small enums the UI filters on, no mock scan/app data.
 *
 * Single source of truth for grade/severity color (handoff palette): red =
 * critical, amber = warning, green = pass/fixed. `adapters.ts` and `hooks.ts`
 * mirror these values.
 */

export type Sev = 'CRITICAL' | 'WARNING' | 'PASSED';

/** Map a raw backend severity string ('critical'|'high'|'medium'|'low'|'info')
 *  to the UI Sev enum, for MonitorEvent refs that carry the raw lowercase value. */
export function sevFromRaw(raw: string): Sev {
  const s = (raw || '').toLowerCase();
  if (s === 'critical') return 'CRITICAL';
  if (s === 'info' || s === 'passed') return 'PASSED';
  return 'WARNING'; // high / medium / low
}
export type Status = 'open' | 'fixed' | 'ignored' | 'passed';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export const SEV_COLOR: Record<Sev, string> = {
  CRITICAL: '#DC2626',
  WARNING: '#D97706',
  PASSED: '#16A34A',
};

/* Tint / text pairs for severity chips & banners (handoff). */
export const SEV_TINT: Record<Sev, { bg: string; fg: string }> = {
  CRITICAL: { bg: '#FEF2F2', fg: '#DC2626' },
  WARNING: { bg: '#FFFBEB', fg: '#B45309' },
  PASSED: { bg: '#F0FDF4', fg: '#15803D' },
};

export const SEV_META: Record<Sev, { sevPlain: string; sevHint: string }> = {
  CRITICAL: { sevPlain: 'Serious problem, fix this first', sevHint: 'Someone could actually get to your customers’ data right now.' },
  WARNING: { sevPlain: 'Worth fixing soon', sevHint: 'Not an emergency, but it makes you an easier target.' },
  PASSED: { sevPlain: 'You’re good here', sevHint: 'This check passed, nothing to do.' },
};

/**
 * Confidence display. Only LOW gets a visible "Possible — verify" chip (neutral
 * grey, not an alarming color) — high/medium confidence findings show nothing,
 * so the report reads as confident by default and only flags the uncertain ones.
 */
export type Confidence = 'high' | 'medium' | 'low';
export const CONF_META: Record<Confidence, { label: string; note: string } | null> = {
  high: null,
  medium: null,
  low: {
    label: 'Possible — verify',
    note: 'This looks like it could be an example in a documentation, content or example file rather than live code. Verify it’s not a real issue before acting.',
  },
};
export const CONF_TINT = { bg: '#F5F5F4', fg: '#6E6E6A' };

export const STATUS_META: Record<Status, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open', bg: '#FEF2F2', fg: '#DC2626' },
  fixed: { label: 'Fixed', bg: '#F0FDF4', fg: '#15803D' },
  ignored: { label: 'Ignored', bg: '#F5F5F5', fg: '#A3A3A3' },
  passed: { label: 'Passed', bg: '#F0FDF4', fg: '#15803D' },
};

/* Grade → chip tint (A/B green, C amber, D/F red). */
export const GRADE_TINT: Record<Grade, { bg: string; fg: string }> = {
  A: { bg: '#F0FDF4', fg: '#15803D' },
  B: { bg: '#F0FDF4', fg: '#15803D' },
  C: { bg: '#FFFBEB', fg: '#B45309' },
  D: { bg: '#FEF2F2', fg: '#DC2626' },
  F: { bg: '#FEF2F2', fg: '#DC2626' },
};

/* Grade → solid signal color (rings, big letters). */
export const GRADE_COLOR: Record<Grade, string> = {
  A: '#16A34A',
  B: '#16A34A',
  C: '#D97706',
  D: '#DC2626',
  F: '#DC2626',
};

/* 5-step green ramp for the scan-activity heatmap (index 0 = no scans). */
export const HEAT_RAMP = ['#F2F2F2', '#D7EFDF', '#93D6B0', '#3EAE71', '#15803D'] as const;
