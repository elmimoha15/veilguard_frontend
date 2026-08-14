'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, GRADE_TINT, timeAgo, scanLabel, repoDisplay, type App } from '@/lib/hooks';
import { getFindings, type ScanDoc } from '@/lib/scans';
import { Card, SectionLabel, Metric, GradeBadge, PageHeading } from './primitives';
import { GradeRing } from './ui';
import { GradeHelp } from './GradeHelp';
import OverviewScanCard from './OverviewScanCard';

const GRADE_SCORE: Record<string, number> = { A: 95, B: 82, C: 68, D: 50, F: 30 };
/** A scan's numeric score (0–100); fall back to a grade bucket when absent. */
function scoreOf(s: Pick<ScanDoc, 'score' | 'grade'>): number {
  if (typeof s.score === 'number') return Math.max(0, Math.min(100, s.score));
  return s.grade ? GRADE_SCORE[s.grade] ?? 50 : 50;
}

interface TopIssue { id: string; title: string; severity: 'critical' | 'high'; scanId: string; appKey: string; appName: string; host: string }
interface TrendPoint { score: number; grade?: string; at: string; label: string }

/**
 * Overview — a calm, hierarchical read on security posture across every app.
 * Hero grade ring + a "fix it now" action, the score trend over time, the top
 * issues to fix, then recent activity and top apps. All from real scan/finding data.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { setModal, setActiveSite } = useApp();
  const { apps, scans, loading } = useApps();
  const [issues, setIssues] = useState<TopIssue[] | null>(null);

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
  const graded = apps.filter((a) => a.latest?.grade);
  const overallScore = graded.length ? Math.round(graded.reduce((s, a) => s + scoreOf(a.latest!), 0) / graded.length) : 0;

  // Chronological score series (done scans, oldest→newest) for the trend chart + note.
  const series: TrendPoint[] = [...scans]
    .filter((s) => s.status === 'done')
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .map((s) => ({ score: scoreOf(s), grade: s.grade, at: s.createdAt, label: repoDisplay(scanLabel(s)) }));
  const trend = (() => {
    if (series.length < 2) return null;
    const last = series[series.length - 1]!;
    const prev = series[series.length - 2]!;
    const d = last.score - prev.score;
    if (d > 2) return { dir: 'up' as const, from: prev.grade };
    if (d < -2) return { dir: 'down' as const, from: prev.grade };
    return { dir: 'flat' as const, from: prev.grade };
  })();

  const postureLine = totals.critical > 0
    ? `${totals.critical} critical issue${totals.critical === 1 ? '' : 's'} to fix`
    : totals.warnings > 0
      ? `${totals.warnings} warning${totals.warnings === 1 ? '' : 's'} to review`
      : 'All clear — no open issues';
  const postureSub = `Across ${apps.length} app${apps.length === 1 ? '' : 's'} · ${scans.length} scan${scans.length === 1 ? '' : 's'} run`;

  // Pull the ACTUAL open critical + high findings across every app's latest scan.
  const latestSig = apps
    .map((a) => `${a.key}:${a.latest?.id ?? ''}:${a.latest?.counts?.critical ?? 0}:${a.latest?.counts?.high ?? 0}`)
    .join('|');
  useEffect(() => {
    if (loading) return;
    const targets = apps.filter((a) => a.latest?.status === 'done' && a.latest?.id && ((a.latest?.counts?.critical ?? 0) + (a.latest?.counts?.high ?? 0)) > 0);
    if (targets.length === 0) { setIssues([]); return; }
    let cancelled = false;
    (async () => {
      const out: TopIssue[] = [];
      for (const a of targets) {
        const scanId = a.latest!.id;
        try {
          const fs = await getFindings(scanId);
          for (const f of fs) {
            if (f.severity === 'critical' || f.severity === 'high') {
              out.push({ id: f.id, title: f.title, severity: f.severity, scanId, appKey: a.key, appName: a.name, host: a.host });
            }
          }
        } catch { /* ignore a single app's fetch error */ }
      }
      if (cancelled) return;
      out.sort((x, y) => (y.severity === 'critical' ? 1 : 0) - (x.severity === 'critical' ? 1 : 0));
      setIssues(out);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, latestSig]);

  const fixTarget = issues && (issues.find((i) => i.severity === 'critical') ?? issues[0]) || null;

  const openScan = (scan: ScanDoc) => {
    const owner = apps.find((a) => a.scans.some((s) => s.id === scan.id));
    if (!owner) return;
    setActiveSite(owner.host);
    router.push(`/app?key=${encodeURIComponent(owner.key)}&tab=findings&scan=${scan.id}`);
  };
  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };
  const openFinding = (it: TopIssue) => { setActiveSite(it.host); router.push(`/finding?scan=${it.scanId}&id=${it.id}`); };

  const topApps = [...apps]
    .sort((a, b) => (b.latest?.counts?.critical ?? 0) - (a.latest?.counts?.critical ?? 0))
    .slice(0, 4);

  return (
    <div className="vg-fade">
      <PageHeading
        title="Overview"
        subtitle={apps.length ? 'Your security posture across every app you protect.' : 'Run your first scan to see your grade.'}
        right={totals.monitored > 0 ? (
          <span className="inline-flex items-center gap-[7px] text-[13px] text-muted border border-border rounded-full px-[11px] py-[5px] bg-card">
            <span className="w-[6px] h-[6px] rounded-full bg-green" />
            Monitoring {totals.monitored} app{totals.monitored === 1 ? '' : 's'}
          </span>
        ) : undefined}
      />

      {/* Live scan progress — vanishes the instant the scan finishes. */}
      <OverviewScanCard />

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="vg-skel h-[150px]" />
          <div className="vg-skel h-[240px]" />
          <div className="grid grid-cols-1 min-[860px]:grid-cols-[1.5fr_1fr] gap-4">
            <div className="vg-skel h-[280px]" />
            <div className="vg-skel h-[280px]" />
          </div>
        </div>
      ) : !recent ? (
        <EmptyState onScan={() => setModal('addApp')} />
      ) : (
        <>
          {/* Posture card — hero grade ring + primary action + metric strip */}
          <Card className="p-6">
            <div className="flex flex-col min-[720px]:flex-row min-[720px]:items-center gap-6">
              <div className="flex items-center gap-5 min-[720px]:pr-8 min-[720px]:border-r min-[720px]:border-border">
                <GradeRing size={104} pct={overallScore} color={gradeColor} strokeWidth={9}>
                  <span className="tnum font-semibold leading-none" style={{ fontSize: 34, color: gradeColor }}>{overall}</span>
                </GradeRing>
                <div>
                  <span className="inline-flex items-center gap-[6px]"><SectionLabel>Security posture</SectionLabel><GradeHelp /></span>
                  <div className="text-[15px] font-medium mt-[5px]">{postureLine}</div>
                  <div className="text-[13px] text-muted mt-[2px]">{postureSub}</div>
                  {trend && trend.dir !== 'flat' && (
                    <div className="text-[12.5px] font-medium mt-[6px]" style={{ color: trend.dir === 'up' ? '#157A43' : '#C23B3F' }}>
                      {trend.dir === 'up' ? '↑' : '↓'} {trend.dir === 'up' ? 'Up' : 'Down'}{trend.from ? ` from ${trend.from}` : ''} last scan
                    </div>
                  )}
                  {totals.critical > 0 && fixTarget && (
                    <button onClick={() => openFinding(fixTarget)} className="vg-press cursor-pointer mt-3 inline-flex items-center gap-[7px] bg-ink text-white rounded-[10px] px-[15px] py-[8px] text-[13.5px] font-semibold">
                      Fix it now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  )}
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

          {/* Security score over time — the visual anchor */}
          <Card className="p-6 mt-4">
            <div className="flex items-center justify-between">
              <SectionLabel>Security score over time</SectionLabel>
              {series.length > 0 && (
                <span className="tnum text-[13px] text-muted">Now: <span className="font-semibold text-ink">{overallScore}</span> / 100 · {overall}</span>
              )}
            </div>
            <div className="mt-4">
              <ScoreTrend points={series} />
            </div>
          </Card>

          {/* Top issues to fix + your apps */}
          <div className="grid grid-cols-1 min-[860px]:grid-cols-[1.5fr_1fr] gap-4 mt-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionLabel>Fix these first</SectionLabel>
                {issues && issues.length > 0 && <span className="text-[12.5px] text-muted">{issues.length} open</span>}
              </div>
              {issues === null ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="vg-skel h-[44px] rounded-[8px]" />
                  <div className="vg-skel h-[44px] rounded-[8px]" />
                </div>
              ) : issues.length === 0 ? (
                <div className="flex items-center gap-3 py-6 px-1">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#EAF6EF' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <div className="text-[14.5px] font-medium">No critical or high issues 🎉</div>
                    <div className="text-[13px] text-muted mt-[1px]">Nothing urgent to fix right now. Keep monitoring on so it stays that way.</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col -mx-2">
                  {issues.slice(0, 7).map((it, i) => (
                    <button key={`${it.scanId}:${it.id}`} onClick={() => openFinding(it)} className="vg-row flex items-center gap-3 px-2 py-[10px] rounded-[8px] text-left cursor-pointer" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                      <SevPill severity={it.severity} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-medium truncate">{it.title}</span>
                        <span className="block text-[12px] text-muted mt-[1px] truncate">{repoDisplay(it.appName)}</span>
                      </span>
                      <Chevron />
                    </button>
                  ))}
                </div>
              )}
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
                        <span className="block text-[14px] font-medium truncate">{repoDisplay(a.name)}</span>
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

          {/* Recent activity */}
          <Card className="p-5 mt-4">
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
                      <span className="block text-[14px] font-medium truncate">{repoDisplay(scanLabel(s))}</span>
                      <span className="block text-[12px] text-muted mt-[1px] truncate">{lens} · {s.status} · {timeAgo(s.createdAt)}</span>
                    </span>
                    <Chevron />
                  </button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/** Small severity pill (critical red, high amber). */
function SevPill({ severity }: { severity: 'critical' | 'high' }) {
  const s = severity === 'critical'
    ? { bg: '#FBEAEA', fg: '#C23B3F', label: 'Critical' }
    : { bg: 'rgba(224,147,47,.14)', fg: '#9A6412', label: 'High' };
  return <span className="shrink-0 rounded-full px-[9px] py-[3px] text-[11px] font-semibold tnum" style={{ background: s.bg, color: s.fg }}>{s.label}</span>;
}

/**
 * Security score over time — a single-series area+line of each done scan's score
 * (0–100), oldest→newest. One scan → a graceful "baseline" state. Inline SVG,
 * responsive, native per-point tooltips (no JS), recessive grade gridlines.
 */
function ScoreTrend({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return <div className="text-[13.5px] text-muted py-6 text-center">Run a scan to start tracking your score.</div>;
  }

  const pts = points.slice(-14); // keep it readable
  const W = 760, H = 200, padX = 18, padTop = 14, padB = 30;
  const innerW = W - padX * 2, innerH = H - padTop - padB;
  const n = pts.length;
  const x = (i: number) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * innerW);
  const y = (v: number) => padTop + (1 - Math.max(0, Math.min(100, v)) / 100) * innerH;
  const last = pts[n - 1]!;
  const lastColor = last.grade ? GRADE_TINT[last.grade]?.fg ?? '#8a7400' : '#8a7400';
  const guides = [{ v: 90, g: 'A' }, { v: 60, g: 'C' }, { v: 40, g: 'D' }];
  const fmt = (v: number) => Math.round(v);

  if (n === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <GradeRing size={92} pct={last.score} color={lastColor} strokeWidth={8}>
          <span className="tnum font-semibold" style={{ fontSize: 26, color: lastColor }}>{last.grade ?? fmt(last.score)}</span>
        </GradeRing>
        <div className="text-[14px] font-medium mt-3">Your baseline</div>
        <div className="text-[12.5px] text-muted mt-[2px]">Run more scans to see your score trend over time.</div>
      </div>
    );
  }

  const line = pts.map((p, i) => `${x(i)},${y(p.score)}`).join(' ');
  const area = `M ${x(0)},${y(pts[0]!.score)} ` + pts.map((p, i) => `L ${x(i)},${y(p.score)}`).join(' ') + ` L ${x(n - 1)},${padTop + innerH} L ${x(0)},${padTop + innerH} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Security score over time" preserveAspectRatio="none">
        {/* recessive grade gridlines */}
        {guides.map((gd) => (
          <g key={gd.v}>
            <line x1={padX} x2={W - padX} y1={y(gd.v)} y2={y(gd.v)} stroke="#EDEDEA" strokeWidth="1" strokeDasharray="3 4" />
            <text x={padX} y={y(gd.v) - 4} fontSize="10" fill="#B0B0AC" fontFamily="monospace">{gd.g}</text>
          </g>
        ))}
        <path d={area} fill="rgba(243,197,0,0.16)" />
        <polyline points={line} fill="none" stroke="#8a7400" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const emphasize = i === n - 1;
          return (
            <circle key={i} cx={x(i)} cy={y(p.score)} r={emphasize ? 5 : 3} fill={emphasize ? lastColor : '#FFFFFF'} stroke={emphasize ? lastColor : '#8a7400'} strokeWidth="2">
              <title>{`${p.grade ? p.grade + ' · ' : ''}${fmt(p.score)}/100 · ${p.label} · ${timeAgo(p.at)}`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="flex items-center justify-between mt-1 font-mono text-[11px] text-faint">
        <span>{timeAgo(pts[0]!.at)}</span>
        <span>{pts.length} scans</span>
        <span>now</span>
      </div>
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
