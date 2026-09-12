'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, useMonitorEvents, timeAgo, scanLabel, repoDisplay, type App } from '@/lib/hooks';
import { getFindings, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiSev, type UiFinding } from '@/lib/adapters';
import { api } from '@/lib/api';
import { SEV_COLOR, type Grade } from './data';
import { Card, PageHeading, PillButton, Segmented, AreaTrend, Donut, Sparkline, ProgressBar, GradeSquare, SeverityChip, Heatmap } from './primitives';
import ActionButton from '@/components/ui/ActionButton';
import UpgradeReminder from './UpgradeReminder';
import { EmptyState } from './EmptyState';
import { AppSelect } from './AppSelect';
import { Spinner } from './ui';
import { useReducedMotion } from '@/lib/useReducedMotion';
import OverviewScanCard from './OverviewScanCard';

const GRADE_SCORE: Record<string, number> = { A: 95, B: 82, C: 68, D: 50, F: 30 };
const GRADE_ORDER = ['F', 'D', 'C', 'B', 'A'];
type Range = '12' | '90d' | 'all';
type Bucket = 'data' | 'keys' | 'access' | 'other';

function scoreOf(s: Pick<ScanDoc, 'score' | 'grade'>): number {
  if (typeof s.score === 'number') return Math.max(0, Math.min(100, s.score));
  return s.grade ? GRADE_SCORE[s.grade] ?? 50 : 50;
}
function openOf(s?: ScanDoc | null): number {
  const c = s?.counts;
  return (c?.critical ?? 0) + (c?.high ?? 0) + (c?.medium ?? 0) + (c?.low ?? 0);
}
function worstApp(apps: App[]): App | null {
  let w: App | null = null;
  for (const a of apps) {
    if (!a.latest?.grade) continue;
    if (!w || GRADE_ORDER.indexOf(a.latest.grade) < GRADE_ORDER.indexOf(w.latest!.grade!)) w = a;
  }
  return w;
}
function buildHeat(scans: ScanDoc[], now: number, days = 28): number[] {
  const arr = new Array(days).fill(0);
  for (const s of scans) {
    const d = Math.floor((now - +new Date(s.createdAt)) / 86400000);
    if (d >= 0 && d < days) arr[days - 1 - d] += 1;
  }
  return arr;
}
/** Group a finding into a founder-fear impact bucket (real, from its fields). */
function impactBucket(f: UiFinding): Bucket {
  const s = `${f.cat} ${f.title} ${f.cwe ?? ''}`.toLowerCase();
  if (/rls|row.level|database|supabase|table|customer|idor|cwe-284|cwe-200|storage bucket|readable|exposed data/.test(s)) return 'data';
  if (/secret|api key|apikey|token|stripe|webhook|env|credential|key/.test(s)) return 'keys';
  if (/auth|login|admin|role|session|cors|rate.limit|password|access control/.test(s)) return 'access';
  return 'other';
}
const BUCKET_META: Record<Bucket, { label: string; color: string }> = {
  data: { label: 'Customer data exposed', color: '#DC2626' },
  keys: { label: 'Payment & API keys exposed', color: '#DC2626' },
  access: { label: 'Login & access weaknesses', color: '#D97706' },
  other: { label: 'Other risks', color: '#737373' },
};
const sevRank = (s: UiSev) => (s === 'CRITICAL' ? 2 : s === 'WARNING' ? 1 : 0);

interface Issue { id: string; scanId: string; sev: UiSev; title: string; what: string; appName: string; appKey: string; host: string; bucket: Bucket }

/**
 * Overview, progress-forward and actionable. Leads with how much you've
 * resolved, then plain-English stakes + a risk donut, a prioritized to-do, and
 * per-app health. All from real scan/finding/monitor data; graceful first-scan
 * states everywhere. Scan-activity heatmap + recent fixes kept on the rail.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { setModal, setActiveSite, toast, setPendingScanId } = useApp();
  const { apps, scans, loading } = useApps();
  const { events } = useMonitorEvents();
  const [range, setRange] = useState<Range>('12');
  const [rescanning, setRescanning] = useState(false);
  const [now] = useState(() => Date.now());
  const [analysis, setAnalysis] = useState<{ top: Issue[]; buckets: Record<Bucket, number> } | null>(null);
  // The graph section (progress + chart + Re-scan + Fix-most-urgent) is scoped to
  // ONE app so the user always knows which app they're looking at / acting on.
  // Everything else on this page stays combined across all apps.
  const [scopeKey, setScopeKey] = useState<string | undefined>(undefined);

  const recent = scans[0] ?? null;
  const worst = worstApp(apps);

  // Default to the app with the most recent scan of ANY status (apps are already
  // sorted newest-first), so a re-scan in flight keeps the view on that app instead
  // of jumping to another. The selector still overrides.
  const mostRecent = apps.find((a) => a.latest) ?? apps[0];
  const selApp = apps.find((a) => a.key === scopeKey) ?? mostRecent;

  // ---- progress hero (real: peak-open baseline vs current open) — SCOPED to selApp.
  // Drive it from the app's most recent COMPLETED scan, so a running re-scan (whose
  // latest scan has no counts yet) keeps showing the last good result, not zeros. ----
  const selDone = selApp ? selApp.scans.filter((x) => x.status === 'done') : [];
  const selCurrent = selDone[0] ?? null; // scans are newest-first
  const baseline = selDone.length ? Math.max(...selDone.map(openOf)) : 0;
  const openTotal = selCurrent ? openOf(selCurrent) : 0;
  const resolved = Math.max(0, baseline - openTotal);

  // Monitor events for the selected app only (appId matches a registry app's key).
  const selEvents = selApp ? events.filter((e) => e.appId === selApp.key) : [];

  // ---- "since last scan" delta (scoped to selApp) ----
  let delta: { label: string; tone: 'good' | 'warn' } | null = null;
  if (selEvents.length && (selEvents[0].resolvedFindings.length || selEvents[0].newFindings.length)) {
    const f = selEvents[0].resolvedFindings.length;
    const nw = selEvents[0].newFindings.length;
    const parts: string[] = [];
    if (f) parts.push(`${f} fixed`);
    if (nw) parts.push(`${nw} new`);
    delta = { label: `${parts.join(' · ')} since last scan`, tone: nw > f ? 'warn' : 'good' };
  } else {
    const done = selDone.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (done.length >= 2) {
      const d = openOf(done[1]) - openOf(done[0]);
      if (d > 0) delta = { label: `${d} fewer open since last scan`, tone: 'good' };
      else if (d < 0) delta = { label: `${-d} new since last scan`, tone: 'warn' };
    }
  }

  // ---- Chart A: "Issues resolved over time" for the selected app. Sourced from the
  // app's OWN scan history (not just monitoring diffs), so it appears as soon as there
  // are 2+ scans — no need to wait for monitoring to run twice. At each scan the value
  // is cumulative resolved = (peak open seen so far) - (open at that scan), which only
  // ever rises and matches the "You've fixed X of Y" hero above it. ----
  const selDoneAsc = selDone.slice().sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const resolvedPts = selDoneAsc.reduce<{ v: number; at: string; peak: number }[]>((acc, s) => {
    const peak = Math.max(acc[acc.length - 1]?.peak ?? 0, openOf(s));
    acc.push({ v: Math.max(0, peak - openOf(s)), at: s.createdAt, peak });
    return acc;
  }, []);
  const cum = resolvedPts.length ? resolvedPts[resolvedPts.length - 1].v : 0;
  const ranged = range === '12' ? resolvedPts.slice(-12) : range === '90d' ? resolvedPts.filter((p) => now - +new Date(p.at) < 90 * 86400000) : resolvedPts;
  const chartVals = ranged.map((p) => p.v);
  const hasResolvedTrend = chartVals.length >= 2 && cum > 0;

  // ---- Chart B: severity split (real current counts) ----
  const sev = apps.reduce(
    (acc, a) => {
      const c = a.latest?.status === 'done' ? a.latest.counts : undefined;
      acc.critical += (c?.critical ?? 0) + (c?.high ?? 0);
      acc.warning += (c?.medium ?? 0) + (c?.low ?? 0);
      acc.passing += c?.passed ?? 0;
      return acc;
    },
    { critical: 0, warning: 0, passing: 0 },
  );

  // ---- pull real open findings across apps → top-issues + impact buckets ----
  const sig = apps.map((a) => `${a.key}:${a.latest?.id ?? ''}:${a.latest?.counts?.critical ?? 0}`).join('|');
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve(); // keep setState off the effect's sync path
      const targets = apps.filter((a) => a.latest?.status === 'done' && a.latest?.id && openOf(a.latest) > 0);
      const issues: Issue[] = [];
      const buckets: Record<Bucket, number> = { data: 0, keys: 0, access: 0, other: 0 };
      for (const a of targets) {
        try {
          const fs = (await getFindings(a.latest!.id)).map(toUiFinding);
          for (const f of fs) {
            if (f.sev === 'PASSED') continue;
            const b = impactBucket(f);
            buckets[b] += 1;
            issues.push({ id: f.id, scanId: a.latest!.id, sev: f.sev, title: f.title, what: f.what, appName: a.name, appKey: a.key, host: a.host, bucket: b });
          }
        } catch { /* ignore one app's fetch error */ }
      }
      if (cancelled) return;
      issues.sort((x, y) => sevRank(y.sev) - sevRank(x.sev));
      setAnalysis({ top: issues, buckets });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sig]);

  const openApp = (key: string, host: string) => { setActiveSite(host); router.push(`/app?key=${encodeURIComponent(key)}`); };
  const openFinding = (it: Issue) => { setActiveSite(it.host); router.push(`/finding?scan=${it.scanId}&id=${it.id}`); };
  const openScan = (s: ScanDoc) => { const owner = apps.find((a) => a.scans.some((x) => x.id === s.id)); if (owner) setActiveSite(owner.host); router.push(`/scan?scan=${s.id}`); };
  const seeAll = () => { if (worst) openApp(worst.key, worst.host); else router.push('/apps'); };

  // Graph-section (scoped) findings for selApp — derived from the combined analysis
  // (no extra fetch), driving the hero headline, stakes line and Fix-most-urgent.
  const selTop = analysis ? analysis.top.filter((it) => it.appKey === selApp?.key) : [];
  const selBuckets = selTop.reduce(
    (acc, it) => { acc[it.bucket] += 1; return acc; },
    { data: 0, keys: 0, access: 0, other: 0 } as Record<Bucket, number>,
  );
  const fixMostUrgent = () => { if (selTop[0]) openFinding(selTop[0]); else if (selApp) openApp(selApp.key, selApp.host); else seeAll(); };

  const criticals = selCurrent ? (selCurrent.counts?.critical ?? 0) + (selCurrent.counts?.high ?? 0) : 0;
  const stakesLine =
    criticals === 0
      ? 'A few things to tighten up, none are urgent, but they make you an easier target.'
      : selBuckets.data
        ? 'These could let someone reach your customers’ data, let’s fix the most urgent first.'
        : selBuckets.keys
          ? 'These could expose your API keys or payment secrets, let’s fix the most urgent first.'
          : selBuckets.access
            ? 'These weaken your logins and access controls, let’s fix the most urgent first.'
            : 'These are the issues most likely to get you hacked, let’s fix the most urgent first.';
  // Re-scan the SAME source that produced the shown grade (the SELECTED app): a repo
  // app re-runs its deep scan, a URL app re-runs its URL scan, an upload app has no
  // stored file so it routes to its hub to re-pick. Never forces a URL scan.
  const rescan = async () => {
    const target = selApp ?? apps[0];
    if (!target) { setModal('addApp'); return; }
    const latest = target.latest;
    const repo =
      target.githubRepo ??
      latest?.sources?.githubRepo ??
      (latest?.target?.value?.startsWith('connected:') ? latest.target.value.slice('connected:'.length) : undefined) ??
      (latest?.target?.type === 'repo' ? latest.target.value : undefined);
    const urlTarget = target.url ?? (latest?.target?.type === 'url' ? latest.target.value : undefined);
    if (latest?.type === 'upload') { openApp(target.key, target.host); return; }
    setRescanning(true);
    const res = repo
      ? await api.createDeepScan({ github: !!(latest?.sources?.githubRepo || target.githubRepo), githubRepo: repo, supabase: latest?.sources?.supabase, url: urlTarget })
      : urlTarget
        ? await api.createScan(urlTarget)
        : null;
    setRescanning(false);
    if (!res) { setModal('addApp'); return; }
    if (res.ok && res.data.scanId) { setPendingScanId(res.data.scanId); toast(`Scanning ${target.host}…`, '#0A0A0A'); }
    else toast('Could not start the re-scan.', '#DC2626');
  };

  // recent fixes (real, from monitor events)
  const fixes = events
    .flatMap((e) => e.resolvedFindings.map((rf) => ({ title: rf.title || rf.ruleId || 'Issue resolved', when: e.createdAt })))
    .slice(0, 4);

  return (
    <div className="vg-fade">
      <UpgradeReminder />
      <PageHeading title="Overview" subtitle="Your progress and what to do next." />
      <OverviewScanCard />

      {loading ? (
        <div className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,1fr)_316px]">
          <div className="flex flex-col gap-5"><div className="vg-skel h-[320px]" /><div className="vg-skel h-[220px]" /></div>
          <div className="flex flex-col gap-5"><div className="vg-skel h-[180px]" /><div className="vg-skel h-[240px]" /></div>
        </div>
      ) : !recent ? (
        <EmptyState title="No scans yet" subtitle="Paste your app’s URL and get a plain-English security grade in about 60 seconds." action={{ label: 'Run your first scan', onClick: () => setModal('addApp') }} />
      ) : (
        <div className="grid gap-0 items-start min-[1080px]:grid-cols-[minmax(0,1fr)_316px]">
          {/* ===== main column ===== */}
          <div className="flex flex-col divide-y divide-border min-[1080px]:pr-8">
            {/* 1, progress hero — scoped to the selected app (selector shown with 2+ apps) */}
            <Card flat className="py-6">
              {apps.length > 1 && (
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[12.5px] font-medium shrink-0" style={{ color: '#A3A3A3' }}>Showing</span>
                  <AppSelect apps={apps} activeKey={selApp?.key ?? ''} onSelect={(a) => setScopeKey(a.key)} />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {resolved > 0 ? (
                    <>
                      <h2 className="text-[24px] font-semibold tracking-[-0.02em] leading-[1.15]">You’ve fixed <span className="tnum">{resolved}</span> of <span className="tnum">{baseline}</span>{openTotal > 0 ? <>, <span className="tnum">{openTotal}</span> to go</> : ''}</h2>
                      <p className="text-[14px] mt-[6px] max-w-[52ch] leading-[1.5]" style={{ color: '#737373' }}>{openTotal > 0 ? 'Keep going, you’re making real progress.' : 'Everything you found has been fixed. Nice work.'}</p>
                    </>
                  ) : openTotal > 0 ? (
                    <>
                      <h2 className="text-[24px] font-semibold tracking-[-0.02em] leading-[1.15]" style={{ color: criticals > 0 ? '#DC2626' : '#0A0A0A' }}>
                        {criticals > 0 ? `${criticals} critical issue${criticals === 1 ? '' : 's'} need fixing` : `${openTotal} issue${openTotal === 1 ? '' : 's'} to fix`}
                      </h2>
                      <p className="text-[14px] mt-[6px] max-w-[52ch] leading-[1.5]" style={{ color: '#737373' }}>{stakesLine}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-[24px] font-semibold tracking-[-0.02em] leading-[1.15]">You’re all clear 🎉</h2>
                      <p className="text-[14px] mt-[6px] max-w-[52ch] leading-[1.5]" style={{ color: '#737373' }}>No open issues right now. Keep monitoring on so it stays that way.</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <GradeSquare grade={(selCurrent?.grade ?? undefined) as Grade | undefined} size={40} />
                  <PillButton variant="outline" onClick={rescan} disabled={rescanning} tooltip="Re-scan now" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}>{rescanning ? <><Spinner dark /> Scanning…</> : 'Re-scan'}</PillButton>
                </div>
              </div>

              {resolved > 0 ? (
                <div className="mt-5">
                  <ProgressBar value={resolved} total={baseline} />
                  <div className="flex items-center justify-between mt-[8px]">
                    <span className="text-[12.5px]" style={{ color: '#A3A3A3' }}>{Math.round((resolved / (baseline || 1)) * 100)}% resolved</span>
                    {delta && <span className="text-[12.5px] font-medium" style={{ color: delta.tone === 'good' ? '#15803D' : '#B45309' }}>{delta.tone === 'good' ? '▲' : '▲'} {delta.label}</span>}
                  </div>
                </div>
              ) : openTotal > 0 ? (
                <div className="mt-5">
                  <ActionButton onClick={fixMostUrgent} tooltip="Your most urgent fix" className="h-[42px]" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Fix the most urgent</ActionButton>
                </div>
              ) : null}

              {/* Chart A */}
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--color-hairline)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[13.5px] font-medium">Issues resolved over time</div>
                    <div className="text-[12px] mt-[1px]" style={{ color: '#A3A3A3' }}>Total fixes, up and to the right is good.</div>
                  </div>
                  {hasResolvedTrend && <Segmented options={[{ id: '12', label: '12 scans' }, { id: '90d', label: '90d' }, { id: 'all', label: 'All' }] as const} value={range} onChange={setRange} />}
                </div>
                <div className="mt-4">
                  {hasResolvedTrend ? (
                    <AreaTrend points={chartVals} color="#16A34A" reduce={reduce} />
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-center px-6 gap-1">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 15l5-5 4 4 7-7" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 7h6v6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="text-[13.5px] font-medium mt-1">Your progress will chart here</div>
                      <div className="text-[12.5px] max-w-[42ch]" style={{ color: '#A3A3A3' }}>As you resolve issues, this line climbs, a running total of everything you’ve fixed.</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* 2, what's at risk + donut */}
            <Card flat className="py-7">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[16px] font-medium">What’s at risk</h2>
                <span className="text-[13px]" style={{ color: '#A3A3A3' }}>What these issues could let someone do.</span>
              </div>
              <div className="grid gap-6 mt-4 min-[640px]:grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="flex flex-col divide-y divide-hairline">
                  {analysis === null ? (
                    <><div className="vg-skel h-[52px] rounded-[10px]" /><div className="vg-skel h-[52px] rounded-[10px]" /><div className="vg-skel h-[52px] rounded-[10px]" /></>
                  ) : (['data', 'keys', 'access', 'other'] as Bucket[]).filter((b) => analysis.buckets[b] > 0).length === 0 ? (
                    <div className="text-[14px] py-3" style={{ color: '#737373' }}>No open risks right now, everything you found is resolved.</div>
                  ) : (
                    (['data', 'keys', 'access', 'other'] as Bucket[]).filter((b) => analysis.buckets[b] > 0).map((b) => (
                      <div key={b} className="flex items-center gap-3 py-[12px]">
                        <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: BUCKET_META[b].color }} />
                        <span className="flex-1 text-[14px] font-medium">{BUCKET_META[b].label}</span>
                        <span className="tnum text-[16px] font-semibold" style={{ color: BUCKET_META[b].color }}>{analysis.buckets[b]}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-5 justify-center">
                  <Donut
                    size={140}
                    centerValue={sev.critical + sev.warning}
                    centerLabel="open"
                    segments={[
                      { label: 'Critical', value: sev.critical, color: SEV_COLOR.CRITICAL },
                      { label: 'Warnings', value: sev.warning, color: SEV_COLOR.WARNING },
                      { label: 'Passing', value: sev.passing, color: SEV_COLOR.PASSED },
                    ]}
                  />
                  <div className="flex flex-col gap-2">
                    {([['Critical', sev.critical, SEV_COLOR.CRITICAL], ['Warnings', sev.warning, SEV_COLOR.WARNING], ['Passing', sev.passing, SEV_COLOR.PASSED]] as const).map(([l, v, c]) => (
                      <div key={l} className="flex items-center gap-2 text-[13px]">
                        <span className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
                        <span className="text-muted">{l}</span>
                        <span className="tnum font-semibold ml-auto">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3, fix these first */}
            <Card flat className="py-7">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[16px] font-medium">Fix these first</h2>
                {analysis && analysis.top.length > 0 && <button onClick={seeAll} className="text-[13px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">See all issues</button>}
              </div>
              {analysis === null ? (
                <div className="flex flex-col gap-2 mt-2"><div className="vg-skel h-[44px] rounded-[8px]" /><div className="vg-skel h-[44px] rounded-[8px]" /></div>
              ) : analysis.top.length === 0 ? (
                <div className="flex items-center gap-3 py-4">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F0FDF4' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <div><div className="text-[14.5px] font-medium">Nothing urgent to fix 🎉</div><div className="text-[13px] mt-[1px]" style={{ color: '#737373' }}>No open critical or warning issues right now.</div></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {analysis.top.slice(0, 5).map((it, i) => (
                    <div key={`${it.scanId}:${it.id}`} className="flex items-start gap-3 py-[13px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                      <span className="pt-[1px]"><SeverityChip sev={it.sev} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium">{it.title}</div>
                        <div className="text-[12.5px] mt-[2px] truncate" style={{ color: '#A3A3A3' }}>{it.appName}</div>
                      </div>
                      <PillButton onClick={() => openFinding(it)} className="shrink-0 h-9 px-4" tooltip="See the exact fix" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Fix</PillButton>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 4, per-app health */}
            <Card flat className="py-7">
              <h2 className="text-[16px] font-medium mb-1">App health</h2>
              <div className="flex flex-col">
                {apps.map((a, i) => {
                  const trend = a.scans.filter((s) => s.status === 'done').sort((x, y) => +new Date(x.createdAt) - +new Date(y.createdAt)).map(scoreOf);
                  const crit = (a.latest?.counts?.critical ?? 0) + (a.latest?.counts?.high ?? 0);
                  return (
                    <button key={a.key} onClick={() => openApp(a.key, a.host)} className="vg-row flex items-center gap-4 py-[13px] text-left cursor-pointer" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                      <GradeSquare grade={a.grade as Grade | undefined} size={30} />
                      <span className="flex-1 min-w-0 font-medium text-[14px] truncate">{a.name}</span>
                      <Sparkline points={trend} color={crit > 0 ? '#DC2626' : '#16A34A'} />
                      <span className="tnum text-[13px] w-[70px] text-right" style={{ color: crit > 0 ? '#DC2626' : '#A3A3A3' }}>{crit > 0 ? `${crit} open` : 'clear'}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ===== right rail ===== */}
          <div className="flex flex-col divide-y divide-border border-t border-border pt-7 min-[1080px]:border-t-0 min-[1080px]:pt-0 min-[1080px]:border-l min-[1080px]:pl-8 min-[1080px]:sticky min-[1080px]:top-[96px]">
            <Card flat className="pb-7 min-[1080px]:pt-0">
              <h3 className="text-[15px] font-medium">Scan activity</h3>
              <p className="text-[13px] mt-[1px]" style={{ color: '#A3A3A3' }}>Last 28 days</p>
              <div className="mt-4"><Heatmap data={buildHeat(scans, now)} /></div>
              <div className="flex items-center justify-between mt-4 font-mono text-[10.5px]" style={{ color: '#A3A3A3' }}>
                <span>28d ago</span>
                <span className="flex items-center gap-[3px]">{['#F2F2F2', '#D7EFDF', '#93D6B0', '#3EAE71', '#15803D'].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: 2, background: c }} />)}</span>
                <span>today</span>
              </div>
            </Card>

            <Card flat className="py-7">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-medium">Recent fixes</h3>
                <span className="font-mono text-[12px]" style={{ color: '#A3A3A3' }}>{fixes.length}</span>
              </div>
              {fixes.length === 0 ? (
                <p className="text-[13px] py-4" style={{ color: '#A3A3A3' }}>No fixes logged yet. They’ll show here as issues get resolved.</p>
              ) : (
                <div className="flex flex-col mt-1">
                  {fixes.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 py-[13px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                      <span className="w-[27px] h-[27px] rounded-[7px] flex items-center justify-center shrink-0" style={{ background: '#F0FDF4' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                      <span className="flex-1 min-w-0"><span className="block text-[13px] font-medium truncate">{f.title}</span><span className="block text-[11.5px] mt-[1px]" style={{ color: '#A3A3A3' }}>{timeAgo(f.when)}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent scans, minimal list */}
            <Card flat className="py-7">
              <h3 className="text-[15px] font-medium">Recent scans</h3>
              {scans.length === 0 ? (
                <p className="text-[13px] py-4" style={{ color: '#A3A3A3' }}>No scans yet.</p>
              ) : (
                <div className="flex flex-col mt-1">
                  {scans.slice(0, 5).map((s, i) => (
                    <button key={s.id} onClick={() => openScan(s)} className="vg-row flex items-center gap-3 py-[12px] text-left cursor-pointer" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                      <GradeSquare grade={s.grade as Grade | undefined} size={26} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium truncate">{repoDisplay(scanLabel(s))}</span>
                        <span className="block text-[11.5px] mt-[1px]" style={{ color: '#A3A3A3' }}>{s.type === 'deep' ? 'Deep' : s.type === 'upload' ? 'Upload' : 'URL'} · {timeAgo(s.createdAt)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
