'use client';

import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { useApps, GRADE_TINT, timeAgo, type App } from '@/lib/hooks';
import type { ScanDoc } from '@/lib/scans';

/**
 * My Apps — a list of every project the user is protecting. Each row rolls up an
 * app's two lenses (URL + Deep) and links to its detail page (/app?key=…), where
 * scans are run and history lives. Kept intentionally lean: this screen just
 * lists and links.
 */
const isRunning = (s?: ScanDoc | null): boolean => s?.status === 'queued' || s?.status === 'running';
const isDone = (s?: ScanDoc | null): boolean => s?.status === 'done';

export default function AppsScreen() {
  const router = useRouter();
  const { setModal, setActiveSite } = useApp();
  const { apps, loading } = useApps();

  const openApp = (app: App) => { setActiveSite(app.host); router.push(`/app?key=${encodeURIComponent(app.key)}`); };

  return (
    <div className="vg-fade">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-extrabold text-[28px] tracking-[-0.02em] m-0">My apps</h1>
        <button onClick={() => setModal('addApp')} className="vg-press bg-ink text-white rounded-[11px] px-[18px] py-3 font-bold text-[14px]">＋ New scan</button>
      </div>

      {loading ? (
        <div className="bg-card border border-border-2 rounded-[18px] p-2 flex flex-col gap-2">
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
          <div className="vg-skel h-[64px] rounded-[12px]" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-card border border-border-2 rounded-[20px] p-10 text-center">
          <div className="text-[40px] mb-2">🗂️</div>
          <h2 className="font-extrabold text-[20px]">No apps scanned yet</h2>
          <p className="text-muted text-[14.5px] mt-1 mb-5">Start with a URL scan (~60s, no access) or connect a repo for a Deep scan.</p>
          <button onClick={() => setModal('addApp')} className="vg-press bg-yellow text-ink font-bold rounded-[11px] px-6 py-3">Scan your first app →</button>
        </div>
      ) : (
        <div className="bg-card border border-border-2 rounded-[18px] overflow-hidden">
          {apps.map((app, i) => (
            <AppRow key={app.key} app={app} first={i === 0} onClick={() => openApp(app)} />
          ))}
          <button onClick={() => setModal('addApp')} className="vg-press flex items-center gap-2 w-full px-5 py-4 text-left text-yellow-dark font-bold text-[13.5px]" style={{ borderTop: '1px solid var(--color-border-2)' }}>
            <span className="text-[18px] leading-none">＋</span> Scan another app
          </button>
        </div>
      )}
    </div>
  );
}

function AppRow({ app, first, onClick }: { app: App; first: boolean; onClick: () => void }) {
  const grade = app.latest?.grade;
  const urlGrade = isDone(app.latestUrlScan) ? app.latestUrlScan!.grade : undefined;
  const deepGrade = isDone(app.latestDeepScan) ? app.latestDeepScan!.grade : undefined;
  const running = isRunning(app.latestUrlScan) || isRunning(app.latestDeepScan);
  const sub = app.url || (app.githubRepo ? `github.com/${app.githubRepo}` : app.host);

  const lensChips = [
    urlGrade ? `URL · ${urlGrade}` : null,
    deepGrade ? `Deep · ${deepGrade}` : null,
  ].filter(Boolean) as string[];

  return (
    <button
      onClick={onClick}
      className="vg-press flex items-center gap-4 w-full px-5 py-4 text-left hover:bg-bg-soft transition-colors"
      style={{ borderTop: first ? undefined : '1px solid var(--color-border-2)' }}
    >
      <span className="shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center font-extrabold text-[18px]" style={{ background: grade ? GRADE_TINT[grade].bg : 'rgba(0,0,0,.05)', color: grade ? GRADE_TINT[grade].fg : '#9a9a95' }}>{grade ?? '…'}</span>

      <span className="flex-1 min-w-0">
        <span className="block font-bold text-[15.5px] truncate">{app.name}</span>
        <span className="block font-mono text-[11.5px] text-faint truncate mt-[2px]">{sub}</span>
      </span>

      <span className="hidden min-[560px]:flex items-center gap-2 shrink-0">
        {running && <span className="rounded-full px-[10px] py-[5px] text-[11px] font-bold bg-[rgba(243,197,0,.16)] text-yellow-dark">Scanning…</span>}
        {lensChips.map((chip) => (
          <span key={chip} className="rounded-full px-[10px] py-[5px] text-[11px] font-semibold text-muted bg-bg-soft border border-border-2">{chip}</span>
        ))}
        {app.latest && <span className="text-[11.5px] text-faint whitespace-nowrap">{timeAgo(app.latest.createdAt)}</span>}
      </span>

      <span className="shrink-0 text-faint text-[16px]">›</span>
    </button>
  );
}
