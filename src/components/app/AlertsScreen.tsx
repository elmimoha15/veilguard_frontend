'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, ALERTS_SEEN_KEY } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { useApps, useMonitorEvents, timeAgo } from '@/lib/hooks';
import { deriveAlerts, type AlertItem, type AlertKind } from '@/lib/alerts';
import { billingHref } from '@/lib/url';
import { PageHeading, Card, PillButton, SeverityChip, NewBadge } from './primitives';
import { EmptyState } from './EmptyState';
import { SEV_COLOR, sevFromRaw } from './data';

const KIND_LABEL: Record<AlertKind, string> = { monitor: 'Monitoring', scan: 'Scan' };

/**
 * Alerts: the ONE cross-app inbox of things that CHANGED and need attention, new
 * issues an auto re-scan surfaced (still open), grade drops and failed scans. It
 * is NOT the current-posture view (that's the Overview dashboard + each app's
 * Findings tab) and NOT per-app (that's the Monitoring tab). Newest-first, with a
 * NEW badge on anything since the user last opened this page. Guard-only.
 */
export default function AlertsScreen() {
  const router = useRouter();
  const { setActiveSite, markAlertsSeen } = useApp();
  const { profile } = useAuth();
  const { apps } = useApps();
  const { events } = useMonitorEvents();
  const paid = isPaid(profile);

  // Read the true "last seen" synchronously (independent of provider effect order),
  // then mark the page seen on mount so NEW badges reflect this exact visit.
  const [prevSeen] = useState<number>(() => {
    try { return Number(window.localStorage.getItem(ALERTS_SEEN_KEY)) || 0; } catch { return 0; }
  });
  useEffect(() => { markAlertsSeen(); }, [markAlertsSeen]);

  const alerts = deriveAlerts(apps, events);
  const isNew = (a: AlertItem) => +new Date(a.when) > prevSeen;

  const go = (a: AlertItem) => { setActiveSite(a.host); router.push(a.href); };

  // ---- free users: upsell ----
  if (!paid) {
    return (
      <div className="vg-fade">
        <PageHeading title="Alerts" subtitle="New issues, grade drops and failed scans across your apps, since you last checked." />
        <Card flat className="py-10 text-center max-w-[520px] mx-auto">
          <span className="inline-flex w-11 h-11 rounded-full items-center justify-center mb-3" style={{ background: '#F5F5F5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a1.8 1.8 0 0 0 3 0" stroke="#525252" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2 className="font-medium text-[19px] tracking-[-0.02em]">Alerts are a Guard feature</h2>
          <p className="text-[14.5px] mt-2 leading-[1.55] max-w-[42ch] mx-auto" style={{ color: '#737373' }}>
            Upgrade to auto re-scan your apps on every deploy and get alerted here the moment a new issue
            appears, you only hear from us when something changes.
          </p>
          <div className="flex justify-center mt-5">
            <PillButton onClick={() => router.push(billingHref())} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>} tooltip="$19/mo">Upgrade to Guard</PillButton>
          </div>
        </Card>
      </div>
    );
  }

  const anyMonitored = apps.some((a) => a.monitoring && a.monitoring.cadence !== 'off');

  return (
    <div className="vg-fade">
      <PageHeading title="Alerts" subtitle="New issues, grade drops and failed scans across your apps, since you last checked." />

      {alerts.length === 0 ? (
        <EmptyState
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a1.8 1.8 0 0 0 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title="You’re all clear"
          subtitle={anyMonitored
            ? 'Nothing needs your attention right now. We’ll flag new issues, grade drops and failed scans here the moment they happen.'
            : 'Nothing needs your attention right now. Turn on monitoring for an app and we’ll auto re-scan on every deploy and alert you here.'}
          action={anyMonitored ? undefined : { label: 'Go to my apps', onClick: () => router.push('/apps') }}
        />
      ) : (
        <Card flat className="py-7 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[16px] font-medium">Needs attention</h2>
            <span className="tnum text-[13px]" style={{ color: '#A3A3A3' }}>{alerts.length}</span>
          </div>
          <div className="flex flex-col">
            {alerts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => go(a)}
                className="flex items-start gap-3 w-full py-[14px] text-left cursor-pointer transition-opacity hover:opacity-80"
                style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}
              >
                <span className="shrink-0 mt-[6px] w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR[a.sev] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ color: '#A3A3A3' }}>{KIND_LABEL[a.kind]}</span>
                    <span className="text-[13px]" style={{ color: '#A3A3A3' }}>·</span>
                    <span className="font-medium text-[13px] text-ink truncate">{a.appName}</span>
                    {isNew(a) && <NewBadge className="ml-1" />}
                  </div>
                  <div className="text-[14.5px] font-medium mt-[3px]">{a.title}</div>
                  {a.newFindings && a.newFindings.length > 0 && (
                    <div className="flex flex-col gap-[6px] mt-2">
                      {a.newFindings.slice(0, 4).map((ref, j) => (
                        <div key={ref.key ?? j} className="flex items-center gap-2 min-w-0">
                          <SeverityChip sev={sevFromRaw(ref.severity)} />
                          <span className="text-[13px] truncate">{ref.title}</span>
                          {ref.where && <span className="font-mono text-[11px] shrink-0 truncate" style={{ color: '#A3A3A3' }}>· {ref.where}</span>}
                        </div>
                      ))}
                      {a.newFindings.length > 4 && <span className="text-[12px]" style={{ color: '#A3A3A3' }}>+{a.newFindings.length - 4} more</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-[6px]">
                    <span className="font-mono text-[11.5px]" style={{ color: '#A3A3A3' }}>{timeAgo(a.when)}</span>
                    {a.gradeFrom && a.gradeTo && a.gradeFrom !== a.gradeTo && (
                      <span className="font-mono text-[11.5px] font-medium" style={{ color: '#DC2626' }}>grade {a.gradeFrom} → {a.gradeTo}</span>
                    )}
                  </div>
                </div>
                <svg className="shrink-0 mt-[3px]" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#C7C7C2' }}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
