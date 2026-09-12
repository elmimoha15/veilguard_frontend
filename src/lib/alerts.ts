import type { App } from './hooks';
import { openFindingKeysByApp, type MonitorEvent } from './scans';
import type { Sev } from '@/components/app/data';

export type AlertKind = 'monitor' | 'scan';

export interface AlertItem {
  id: string;
  kind: AlertKind;
  sev: Sev;
  title: string;
  appName: string;
  appKey: string;
  host: string;
  when: string;
  href: string;
  gradeFrom?: string;
  gradeTo?: string;
  /** New holes an auto re-scan surfaced (monitor alerts), shown as a list. */
  newFindings?: { key: string; ruleId: string; severity: string; title: string; where?: string }[];
}

/**
 * The cross-app "needs attention" feed: things that CHANGED and want a look.
 * Two problem kinds only, newest first:
 *  - monitor: an auto re-scan surfaced new issues that are STILL open (fixed ones
 *    are erased via openFindingKeysByApp, so the alert clears itself once resolved).
 *  - scan: an app's latest scan failed.
 * Standing state (open criticals) is deliberately excluded, that's current posture
 * and already lives on the Overview dashboard and the per-app Findings tab.
 */
export function deriveAlerts(apps: App[], events: MonitorEvent[]): AlertItem[] {
  const items: AlertItem[] = [];
  const openByApp = openFindingKeysByApp(events);

  for (const e of events) {
    const app = apps.find((a) => a.key === e.appId);
    const openSet = openByApp.get(e.appId) ?? new Set<string>();
    const stillOpen = (e.newFindings ?? []).filter((f) => openSet.has(f.key));
    if (stillOpen.length === 0) continue; // all fixed → no longer an alert
    const n = stillOpen.length;
    items.push({
      id: `m-${e.id}`,
      kind: 'monitor',
      sev: 'CRITICAL',
      title: `${n} new ${n === 1 ? 'issue' : 'issues'} after an auto re-scan`,
      appName: app?.name ?? e.appId,
      appKey: e.appId,
      host: app?.host ?? e.appId,
      when: e.createdAt,
      // Link to the app's CURRENT findings (not the old scan) so fixed items read fixed.
      href: `/app?key=${encodeURIComponent(e.appId)}&tab=findings`,
      gradeFrom: e.gradeBefore ?? undefined,
      gradeTo: e.gradeAfter ?? undefined,
      newFindings: stillOpen,
    });
  }

  for (const a of apps) {
    const l = a.latest;
    if (l?.status === 'error') {
      items.push({
        id: `e-${a.key}`,
        kind: 'scan',
        sev: 'WARNING',
        title: 'A scan couldn’t finish',
        appName: a.name,
        appKey: a.key,
        host: a.host,
        when: l.createdAt,
        href: `/scan?scan=${l.id}`,
      });
    }
  }

  items.sort((x, y) => +new Date(y.when) - +new Date(x.when));
  return items;
}

/** How many alerts are newer than the user's last visit (drives the unread badge). */
export function countUnseen(alerts: AlertItem[], seenAt: number): number {
  return alerts.filter((a) => +new Date(a.when) > seenAt).length;
}
