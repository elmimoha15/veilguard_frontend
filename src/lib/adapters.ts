import type { BackendFinding, ScanDoc } from './scans';

/**
 * Map the backend's data shapes onto the shapes the (already-built) design
 * components expect. The design uses three severity buckets (CRITICAL / WARNING
 * / PASSED); the engine uses five — we bucket high/medium/low into WARNING.
 */
export type UiSev = 'CRITICAL' | 'WARNING' | 'PASSED';

export interface UiFinding {
  id: string; // Firestore finding doc id (stable, used for detail route)
  ruleId: string;
  sev: UiSev;
  severity: BackendFinding['severity'];
  color: string;
  cat: string;
  title: string;
  what: string; // whyItMatters (plain-English impact)
  where: string;
  evidence?: string;
  cwe?: string;
  status: 'open';
}

export const SEV_COLOR: Record<UiSev, string> = {
  CRITICAL: '#E5352B',
  WARNING: '#F2851F',
  PASSED: '#1FB86B',
};

function toUiSev(sev: BackendFinding['severity']): UiSev {
  if (sev === 'critical') return 'CRITICAL';
  if (sev === 'info') return 'PASSED';
  return 'WARNING'; // high / medium / low
}

function humanizeCategory(cat: string): string {
  const map: Record<string, string> = {
    secrets: 'Secrets',
    database: 'Database (RLS)',
    auth: 'Auth',
    injection: 'Injection',
    api_webhooks: 'APIs & Webhooks',
    web_config: 'Web / Config',
    dependencies: 'Dependencies',
    ai_specific: 'AI-specific',
    platform: 'Platform',
    business_logic: 'Business logic',
  };
  return map[cat] ?? cat;
}

function locationString(loc?: BackendFinding['location']): string {
  if (!loc) return '';
  if (loc.file) return `${loc.file}${loc.line ? `:${loc.line}` : ''}`;
  return loc.url ?? '';
}

export function toUiFinding(f: BackendFinding & { id: string }): UiFinding {
  const sev = toUiSev(f.severity);
  return {
    id: f.id,
    ruleId: f.ruleId,
    sev,
    severity: f.severity,
    color: SEV_COLOR[sev],
    cat: humanizeCategory(f.category),
    title: f.title,
    what: f.whyItMatters,
    where: locationString(f.location),
    evidence: f.evidence,
    cwe: f.cwe,
    status: 'open',
  };
}

/** Severity buckets the design's grade hero shows. */
export interface UiCounts {
  critical: number;
  warnings: number;
  passed: number;
  total: number;
}

export function toUiCounts(scan: ScanDoc | null, findings: UiFinding[]): UiCounts {
  if (scan?.counts) {
    const c = scan.counts;
    return { critical: c.critical, warnings: c.high + c.medium + c.low, passed: c.passed, total: findings.length };
  }
  // Derive from findings while the scan is still running.
  const critical = findings.filter((f) => f.sev === 'CRITICAL').length;
  const warnings = findings.filter((f) => f.sev === 'WARNING').length;
  const passed = findings.filter((f) => f.sev === 'PASSED').length;
  return { critical, warnings, passed, total: findings.length };
}

export const GRADE_COLOR: Record<string, string> = {
  A: '#1FB86B',
  B: '#1FB86B',
  C: '#F2851F',
  D: '#E5352B',
  F: '#E5352B',
};
