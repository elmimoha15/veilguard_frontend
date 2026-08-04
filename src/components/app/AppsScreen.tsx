'use client';

import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, GRADE_TINT, timeAgo, type App } from '@/lib/hooks';
import type { ScanDoc, Cadence } from '@/lib/scans';

/**
 * My Apps — a list of every project the user is protecting. Each row rolls up an
 * app's two lenses (URL + Deep) with at-a-glance stats (grade, open criticals,
 * warnings, lenses, monitoring, last scan) and links to its detail page
 * (/app?key=…), where scans are run and history lives.
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';
const isDone = (s?: ScanDoc | null): boolean => s?.status === 'done';

const CADENCE_LABEL: Record<Cadence, string> = {
  off: 'Off', push: 'On push', daily: 'Daily', weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly',
};

function PlusIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AppsScreen() {
  const router = useRouter();
  const { setModal, setActiveSite } = useApp();
  const { apps, loading } = useApps();

  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };

  return (
    <div className="vg-fade">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-[24px] tracking-[-0.02em] m-0">My apps</h1>
        <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer inline-flex items-center gap-[7px] bg-ink text-white rounded-[10px] px-[18px] py-[11px] font-semibold text-[15px]">
          <PlusIcon color="#fff" /> New scan
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
        </div>
      ) : apps.length === 0 ? (
        <div className="vg-surface p-10 text-center">
          <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h3.2a2 2 0 0 1 1.6.8l.9 1.2H18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-semibold text-[18px]">No apps scanned yet</h2>
          <p className="text-muted text-[15.5px] mt-1 mb-5">Start with a URL scan (~60s, no access) or connect a repo for a Deep scan.</p>
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-6 py-3">Scan your first app</button>
        </div>
      ) : (
        <>
          <div className="vg-surface overflow-hidden">
            {apps.map((app, i) => (
              <AppRow key={app.key} app={app} first={i === 0} onClick={() => openApp(app)} />
            ))}
          </div>
          <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer mt-3 w-full flex items-center justify-center gap-2 rounded-[12px] py-[14px] text-muted font-semibold text-[14.5px]" style={{ border: '1.5px dashed #DCDCD8' }}>
            <PlusIcon size={18} color="#9B9B96" /> Scan another app
          </button>
        </>
      )}
    </div>
  );
}

function AppRow({ app, first, onClick }: { app: App; first: boolean; onClick: () => void }) {
  const grade = app.latest?.grade;
  const counts = app.latest?.counts;
  const crit = counts?.critical ?? 0;
  const warn = (counts?.high ?? 0) + (counts?.medium ?? 0) + (counts?.low ?? 0);
  const running = isRunning(app.latestUrlScan) || isRunning(app.latestDeepScan);
  const sub = app.url || (app.githubRepo ? `github.com/${app.githubRepo}` : app.host);
  const urlGrade = isDone(app.latestUrlScan) ? app.latestUrlScan!.grade : undefined;
  const deepGrade = isDone(app.latestDeepScan) ? app.latestDeepScan!.grade : undefined;
  const cadence = app.monitoring?.cadence ?? 'off';
  const monitored = cadence !== 'off';

  const dot = running ? '#F3C500' : grade ? GRADE_TINT[grade].fg : '#B0B0AC';

  return (
    <button
      onClick={onClick}
      className="vg-row cursor-pointer w-full text-left flex items-center gap-4 flex-wrap px-4 py-[14px]"
      style={{ borderTop: first ? undefined : '1px solid var(--color-hairline)' }}
    >
      {/* App name + url */}
      <span className="flex items-center gap-[11px] min-w-0 flex-1 basis-[200px]">
        <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: dot }} />
        <span className="min-w-0">
          <span className="block font-semibold text-[15.5px] truncate">{app.name}</span>
          <span className="block font-mono text-[12px] text-faint truncate">{sub}</span>
        </span>
      </span>

      {/* Stats cluster */}
      <span className="flex items-center gap-4 flex-wrap justify-end shrink-0">
        {running ? (
          <span className="rounded-full px-[10px] py-[5px] text-[12px] font-semibold bg-[rgba(243,197,0,.16)] text-yellow-dark">Scanning…</span>
        ) : (
          <>
            <Stat value={crit} label={crit === 1 ? 'critical' : 'criticals'} color={crit ? '#C23B3F' : '#B0B0AC'} />
            <Stat value={warn} label="warnings" color={warn ? '#9A6412' : '#B0B0AC'} />
          </>
        )}

        {(urlGrade || deepGrade) && (
          <span className="hidden md:flex items-center gap-[6px]">
            {urlGrade && <LensChip label="URL" grade={urlGrade} />}
            {deepGrade && <LensChip label="Deep" grade={deepGrade} />}
          </span>
        )}

        <span className="hidden lg:flex items-center gap-[6px] text-[13px]" title="Monitoring">
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: monitored ? '#1F9D57' : '#D8D8D4' }} />
          <span className={monitored ? 'text-muted' : 'text-faint'}>{CADENCE_LABEL[cadence]}</span>
        </span>

        {app.latest && (
          <span className="hidden sm:block font-mono text-[12px] text-faint w-[92px] text-right tnum">{timeAgo(app.latest.createdAt)}</span>
        )}

        <span className="w-9 h-9 rounded-[10px] flex items-center justify-center font-semibold text-[16px] tnum" style={{ background: grade ? GRADE_TINT[grade].bg : '#F2F2EF', color: grade ? GRADE_TINT[grade].fg : '#9B9B96' }}>{grade ?? '…'}</span>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#C7C7C2]" aria-hidden><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </button>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span className="text-center min-w-[52px]">
      <span className="block font-semibold text-[17px] leading-none tnum" style={{ color }}>{value}</span>
      <span className="block text-[11px] text-faint mt-[3px]">{label}</span>
    </span>
  );
}

function LensChip({ label, grade }: { label: string; grade: string }) {
  return (
    <span className="rounded-full px-[9px] py-[4px] text-[11.5px] font-semibold text-muted bg-bg-soft border border-border tnum">
      {label} · <span style={{ color: GRADE_TINT[grade].fg }}>{grade}</span>
    </span>
  );
}
