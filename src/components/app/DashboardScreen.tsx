'use client';

import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, GRADE_TINT, timeAgo, scanLabel, type App } from '@/lib/hooks';
import type { ScanDoc } from '@/lib/scans';
import { Card, SectionLabel, Metric, GradeBadge } from './primitives';

/**
 * Overview — a calm, hierarchical read on security posture across every app.
 * One focal grade + a compact metric strip, then recent activity and top apps.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { setModal, setActiveSite } = useApp();
  const { apps, scans, loading } = useApps();

  const recent = scans[0] ?? null;

  const totals = apps.reduce(
    (acc, a) => {
      const c = a.latest?.counts;
      acc.critical += c?.critical ?? 0;
      acc.warnings += (c?.high ?? 0) + (c?.medium ?? 0) + (c?.low ?? 0);
      if ((a.monitoring?.cadence ?? 'off') !== 'off') acc.monitored += 1;
      return acc;
    },
    { critical: 0, warnings: 0, monitored: 0 },
  );

  const overall = avgGrade(apps);
  const gradeColor = overall in GRADE_TINT ? GRADE_TINT[overall].fg : '#9B9B96';

  const postureLine = totals.critical > 0
    ? `${totals.critical} critical issue${totals.critical === 1 ? '' : 's'} to fix`
    : totals.warnings > 0
      ? `${totals.warnings} warning${totals.warnings === 1 ? '' : 's'} to review`
      : 'All clear — no open issues';
  const postureSub = `Across ${apps.length} app${apps.length === 1 ? '' : 's'} · ${scans.length} scan${scans.length === 1 ? '' : 's'} run`;

  const openScan = (scan: ScanDoc) => {
    const owner = apps.find((a) => a.scans.some((s) => s.id === scan.id));
    if (!owner) return;
    setActiveSite(owner.host);
    router.push(`/app?key=${encodeURIComponent(owner.key)}&tab=findings&scan=${scan.id}`);
  };
  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };

  const topApps = [...apps]
    .sort((a, b) => (b.latest?.counts?.critical ?? 0) - (a.latest?.counts?.critical ?? 0))
    .slice(0, 4);

  return (
    <div className="vg-fade">
      {/* Title */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] m-0">Overview</h1>
          <p className="text-muted mt-[5px] text-[14px]">
            {apps.length ? 'Your security posture across every app you protect.' : 'Run your first scan to see your grade.'}
          </p>
        </div>
        {totals.monitored > 0 && (
          <span className="inline-flex items-center gap-[7px] text-[13px] text-muted border border-border rounded-full px-[11px] py-[5px] bg-card">
            <span className="w-[6px] h-[6px] rounded-full bg-green" />
            Monitoring {totals.monitored} app{totals.monitored === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="vg-skel h-[128px]" />
          <div className="grid grid-cols-1 min-[860px]:grid-cols-[1.5fr_1fr] gap-4">
            <div className="vg-skel h-[280px]" />
            <div className="vg-skel h-[280px]" />
          </div>
        </div>
      ) : !recent ? (
        <EmptyState onScan={() => setModal('addApp')} />
      ) : (
        <>
          {/* Posture card — one focal grade + compact metric strip */}
          <Card className="p-6">
            <div className="flex flex-col min-[720px]:flex-row min-[720px]:items-center gap-6">
              <div className="flex items-center gap-4 min-[720px]:pr-8 min-[720px]:border-r min-[720px]:border-border">
                <div className="tnum font-semibold leading-none" style={{ fontSize: 52, color: gradeColor }}>{overall}</div>
                <div>
                  <SectionLabel>Security posture</SectionLabel>
                  <div className="text-[15px] font-medium mt-[5px]">{postureLine}</div>
                  <div className="text-[13px] text-muted mt-[2px]">{postureSub}</div>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap items-start gap-x-9 gap-y-4">
                <Metric value={totals.critical} label="Open criticals" color={totals.critical ? '#C23B3F' : undefined} />
                <Metric value={totals.warnings} label="Warnings" color={totals.warnings ? '#9A6412' : undefined} />
                <Metric value={apps.length} label="Apps protected" />
                <Metric value={scans.length} label="Scans run" />
              </div>
            </div>
          </Card>

          {/* Recent activity + top apps */}
          <div className="grid grid-cols-1 min-[860px]:grid-cols-[1.5fr_1fr] gap-4 mt-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionLabel>Recent activity</SectionLabel>
                <button onClick={() => router.push('/apps')} className="text-[13px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">View all</button>
              </div>
              <div className="flex flex-col -mx-2">
                {scans.slice(0, 6).map((s, i) => {
                  const lens = s.type === 'deep' ? 'Deep' : s.type === 'upload' ? 'Upload' : 'URL';
                  return (
                    <button key={s.id} onClick={() => openScan(s)} className="vg-row flex items-center gap-3 px-2 py-[10px] rounded-[8px] text-left cursor-pointer" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                      <GradeBadge grade={s.grade} size="sm" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-medium truncate">{scanLabel(s)}</span>
                        <span className="block text-[12px] text-muted mt-[1px] truncate">{lens} · {s.status} · {timeAgo(s.createdAt)}</span>
                      </span>
                      <Chevron />
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionLabel>Your apps</SectionLabel>
                <button onClick={() => setModal('addApp')} className="text-[13px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">＋ Add</button>
              </div>
              <div className="flex flex-col -mx-2">
                {topApps.map((a, i) => {
                  const crit = a.latest?.counts?.critical ?? 0;
                  return (
                    <button key={a.key} onClick={() => openApp(a)} className="vg-row flex items-center gap-3 px-2 py-[10px] rounded-[8px] text-left cursor-pointer" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                      <GradeBadge grade={a.grade} size="sm" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-medium truncate">{a.name}</span>
                        <span className="block text-[12px] text-muted mt-[1px]">
                          {crit > 0 ? <span style={{ color: '#C23B3F' }}>{crit} critical</span> : 'No criticals'}
                        </span>
                      </span>
                      <Chevron />
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: '#C7C7C2' }} aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Mean latest grade across apps, rendered back as a letter (or '—' when none). */
function avgGrade(apps: App[]): string {
  const points: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const pts = apps.flatMap((a) => (a.latest?.grade ? [points[a.latest.grade]!] : []));
  if (!pts.length) return '—';
  const mean = Math.round(pts.reduce((s, p) => s + p, 0) / pts.length);
  return ['F', 'D', 'C', 'B', 'A'][mean] ?? '—';
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <Card className="p-10 text-center">
      <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </div>
      <h2 className="text-[19px] font-semibold">No scans yet</h2>
      <p className="text-muted text-[14px] mt-1 mb-5 max-w-[42ch] mx-auto">Paste your app’s URL and get a plain-English security grade in about 60 seconds.</p>
      <button onClick={onScan} className="vg-press bg-ink text-white font-medium rounded-[10px] px-6 py-[11px] text-[14px] cursor-pointer">Run your first scan</button>
    </Card>
  );
}
