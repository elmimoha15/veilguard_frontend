'use client';

import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { useApps, GRADE_TINT, scanLabel, timeAgo, type App } from '@/lib/hooks';
import type { ScanDoc } from '@/lib/scans';
import { GradeRing } from './ui';
import { GRADE_COLOR } from '@/lib/adapters';

/**
 * Overview — a global dashboard across ALL of the user's apps (no per-app
 * scoping anymore). Shows aggregate posture stats, the single most-recent scan
 * with its data, and a list of recent scan events. Individual apps live on
 * /apps and /app?key=….
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { setModal, setActiveSite } = useApp();
  const { user } = useAuth();
  const { apps, scans, loading } = useApps();

  // The newest scan across everything (useMyScans returns newest-first).
  const recent = scans[0] ?? null;

  // Aggregate posture across every app's latest scan.
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

  const stats = [
    { value: String(apps.length), label: 'Apps protected', color: '#1E1D1B' },
    { value: String(scans.length), label: 'Scans run', color: '#1E1D1B' },
    { value: String(totals.critical), label: 'Open criticals', color: '#E5352B' },
    { value: String(totals.warnings), label: 'Warnings', color: '#F2851F' },
    { value: avgGrade(apps), label: 'Avg grade', color: '#1FB86B' },
    { value: String(totals.monitored), label: 'Monitored', color: '#1FB86B' },
  ];

  const greeting = user?.email ? `Welcome, ${user.email.split('@')[0]}` : 'Welcome';

  // Open a scan = its owning app's Findings page; keep every page in sync.
  const openScan = (scan: ScanDoc) => {
    const host = apps.find((a) => a.scans.some((s) => s.id === scan.id))?.host;
    if (host) setActiveSite(host);
    router.push(`/findings?scan=${scan.id}`);
  };

  return (
    <div className="vg-fade">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-[22px]">
        <div>
          <h1 className="font-extrabold text-[30px] tracking-[-0.02em] m-0">{greeting}</h1>
          <p className="text-muted mt-[6px] text-[15px]">
            {apps.length ? 'Your security posture across every app you protect.' : 'Run your first scan to see your grade.'}
          </p>
        </div>
        <button onClick={() => setModal('addApp')} className="vg-press bg-ink text-white rounded-[10px] px-[16px] py-[10px] font-semibold text-[14px]">＋ New scan</button>
      </div>

      {loading ? (
        <div className="vg-skel h-[172px]" />
      ) : !recent ? (
        <EmptyState onScan={() => setModal('addApp')} />
      ) : (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[14px]">
            {stats.map((s) => (
              <div key={s.label} className="vg-lift bg-card border border-border-2 rounded-2xl p-5">
                <div className="font-extrabold text-[32px] tracking-[-0.02em]" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[13px] text-muted mt-[2px]">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 min-[820px]:grid-cols-[minmax(300px,1fr)_1.4fr] gap-4 mt-4">
            {/* Most-recent scan hero */}
            <button onClick={() => openScan(recent)} className="text-left vg-lift bg-ink rounded-[20px] p-[26px] flex items-center gap-[22px]">
              <GradeRing size={120} pct={gradePct(recent.grade)} color={recent.grade ? GRADE_COLOR[recent.grade] : '#8a8a85'} strokeWidth={9}>
                <span className="font-extrabold text-[52px]" style={{ color: recent.grade ? GRADE_COLOR[recent.grade] : '#8a8a85' }}>{recent.grade ?? '…'}</span>
              </GradeRing>
              <div className="min-w-0">
                <div className="font-mono text-[11px] tracking-[0.12em]" style={{ color: recent.grade ? GRADE_COLOR[recent.grade] : '#8a8a85' }}>MOST RECENT · {timeAgo(recent.createdAt)}</div>
                <div className="text-[15px] text-white font-semibold mt-1 truncate max-w-[220px]">{scanLabel(recent)}</div>
                <div className="text-[13px] text-white/55 mt-[6px]">
                  {recent.status === 'done'
                    ? `${recent.counts?.critical ?? 0} critical · ${(recent.counts?.high ?? 0) + (recent.counts?.medium ?? 0) + (recent.counts?.low ?? 0)} warnings`
                    : recent.status}
                </div>
              </div>
            </button>

            {/* Recent scans list */}
            <div className="bg-card border border-border-2 rounded-[20px] p-[22px]">
              <div className="font-bold text-[15px] mb-[14px]">Recent scans</div>
              <div className="flex flex-col">
                {scans.slice(0, 8).map((s, i) => {
                  const lens = s.type === 'deep' ? 'Deep' : s.type === 'upload' ? 'Upload' : 'URL';
                  return (
                    <button key={s.id} onClick={() => openScan(s)} className="flex items-center gap-3 py-[11px] text-left" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-border-2)' }}>
                      <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: s.grade ? GRADE_TINT[s.grade].fg : '#9a9a95' }} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold truncate">{scanLabel(s)}</span>
                        <span className="block font-mono text-[11px] text-faint mt-[2px]">{lens} · {s.status} · {timeAgo(s.createdAt)}</span>
                      </span>
                      {s.grade && <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center font-extrabold text-[14px]" style={{ background: GRADE_TINT[s.grade].bg, color: GRADE_TINT[s.grade].fg }}>{s.grade}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function gradePct(grade?: string): number {
  return { A: 95, B: 82, C: 67, D: 50, F: 25 }[grade ?? ''] ?? 0;
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
    <div className="bg-card border border-border-2 rounded-[20px] p-10 text-center">
      <div className="text-[40px] mb-2">🔍</div>
      <h2 className="font-extrabold text-[20px]">No scans yet</h2>
      <p className="text-muted text-[14.5px] mt-1 mb-5">Paste your app’s URL and get a plain-English security grade in ~60 seconds.</p>
      <button onClick={onScan} className="vg-press bg-yellow text-ink font-bold rounded-[11px] px-6 py-3">Run your first scan →</button>
    </div>
  );
}
