'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type App } from '@/lib/hooks';
import { subscribeFindings, type BackendFinding, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiFinding } from '@/lib/adapters';
import { useAuth, isPaid } from '@/lib/auth';
import { useApp } from './state';
import { api } from '@/lib/api';
import { billingHref } from '@/lib/url';
import { EmptyState } from './EmptyState';
import { PillButton, Card, ProgressBar, SeverityText } from './primitives';

/** Worst-first over the raw 5-level severity (finer than the 3 UI buckets). */
const sevRank = (s: BackendFinding['severity']) => ({ critical: 5, high: 4, medium: 3, low: 2, info: 1 }[s] ?? 0);
/** Open (fixable) findings on a scan, from its counts. Mirrors DashboardScreen's openOf. */
const openOf = (s?: ScanDoc | null): number => {
  const c = s?.counts;
  return (c?.critical ?? 0) + (c?.high ?? 0) + (c?.medium ?? 0) + (c?.low ?? 0);
};

/** Generic good-practice reminders shown to clean apps (never invented findings). */
const HABITS = [
  'Re-scan after every deploy so new code gets checked.',
  'Keep your dependencies up to date.',
  'Store API keys in environment variables, never in your code.',
  'Rotate any key the moment you think it leaked.',
];

/**
 * "What to do" — the app's open findings as a clear, prioritized (worst-first)
 * reference list so the user knows what to tackle next. Not a self-reported
 * tracker: an item only leaves the list when a re-scan confirms it's gone, and
 * the progress bar climbs off real resolution (peak-open baseline, the same
 * system as the overview graph). Free previews the two worst tasks (rest locked);
 * Guard gets the full list + "Copy all fixes".
 */
export default function TodoScreen({ app, initialScanId }: { app: App; initialScanId?: string | null }) {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useApp();
  const paid = isPaid(profile);
  const site = app;

  const selected: ScanDoc | null = site.scans.find((s) => s.id === initialScanId) ?? site.latest ?? null;
  const scanId = selected?.id ?? null;

  const [raw, setRaw] = useState<{ id: string; items: (BackendFinding & { id: string })[] }>({ id: '', items: [] });
  useEffect(() => {
    if (!scanId) return;
    return subscribeFindings(scanId, (items) => setRaw({ id: scanId, items }));
  }, [scanId]);
  const rawItems = raw.id === scanId ? raw.items : [];

  // Real resolution progress: peak open across the app's done scans vs current open.
  const doneScans = site.scans.filter((s) => s.status === 'done');
  const baseline = doneScans.length ? Math.max(...doneScans.map(openOf)) : 0;
  const openNow = openOf(doneScans[0] ?? null);
  const resolved = Math.max(0, baseline - openNow);

  // Guard-only: one organized prompt with every fix.
  const [copyBusy, setCopyBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const promptCache = useRef<Map<string, string>>(new Map());
  const copyAllFixes = async () => {
    if (!scanId) return;
    if (!paid) { toast('Copy-all-fixes is a Guard feature, upgrade to unlock.', '#E0932F'); router.push(billingHref()); return; }
    const flash = async (prompt: string) => {
      try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); }
      catch { toast('Could not copy, try again', '#DC2626'); }
    };
    const cached = promptCache.current.get(scanId);
    if (cached) { await flash(cached); return; }
    setCopyBusy(true);
    const res = await api.allFixesPrompt(scanId);
    setCopyBusy(false);
    if (!res.ok || !res.data.prompt) { toast(res.data.error || 'Could not build the prompt', '#DC2626'); return; }
    promptCache.current.set(scanId, res.data.prompt);
    await flash(res.data.prompt);
  };

  if (!selected) {
    return <EmptyState title="Nothing to do yet" subtitle="Run a scan to get your action list for this app." />;
  }

  const running = selected.status === 'queued' || selected.status === 'running';
  if (running && rawItems.length === 0) {
    return <Card flat className="text-center border-t border-border"><div className="py-10 text-[15px]" style={{ color: '#737373' }}>Scanning… your action list will appear here.</div></Card>;
  }

  const open = rawItems.map(toUiFinding).sort((a, b) => sevRank(b.severity) - sevRank(a.severity));

  // Clean app (nothing open): a positive state, never an empty page.
  if (open.length === 0) {
    return (
      <div className="vg-fade">
        <Card flat className="py-8 border-t border-border text-center">
          <div className="w-11 h-11 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#F0FDF4' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="text-[18px] font-medium">You&rsquo;re in good shape</h2>
          <p className="text-[14px] mt-1 max-w-[46ch] mx-auto" style={{ color: '#737373' }}>
            {resolved > 0
              ? `Nothing needs fixing right now. You cleared ${resolved} ${resolved === 1 ? 'issue' : 'issues'} to get here, nice work.`
              : 'This scan came back with nothing to fix right now.'}
          </p>
        </Card>
        <Card flat className="py-7 border-t border-border">
          <h2 className="text-[16px] font-medium mb-1">Keep it that way</h2>
          <p className="text-[13px] mb-2" style={{ color: '#737373' }}>A few habits that keep your app safe as you keep shipping.</p>
          <div className="flex flex-col">
            {HABITS.map((h, i) => (
              <div key={h} className="flex items-start gap-3 py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                <span className="mt-[3px] w-[6px] h-[6px] rounded-full shrink-0" style={{ background: '#16A34A' }} />
                <div className="text-[14px]">{h}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Free previews the two worst tasks; the rest are locked behind Guard.
  const FREE_LIMIT = 2;
  const visibleOpen = paid ? open : open.slice(0, FREE_LIMIT);
  const lockedOpen = paid ? [] : open.slice(FREE_LIMIT);

  return (
    <div className="vg-fade">
      {/* progress + copy-all */}
      <Card flat className="py-7 border-t border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div className="min-w-0">
            <h2 className="text-[16px] font-medium">What to do</h2>
            <p className="text-[13px] mt-[2px]" style={{ color: '#737373' }}>Worst first. Work down the list, then re-scan to confirm each fix.</p>
          </div>
          {selected.status === 'done' && (
            <PillButton onClick={copyAllFixes} disabled={copyBusy} tooltip="One prompt for your AI" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.7" /></svg>}>
              {copied ? 'Copied' : copyBusy ? 'Preparing…' : paid ? 'Copy all fixes' : 'Copy all fixes (Guard)'}
            </PillButton>
          )}
        </div>
        {baseline > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[13.5px] font-medium tnum shrink-0">You&rsquo;ve fixed {resolved} of {baseline}</span>
            <div className="flex-1"><ProgressBar value={resolved} total={baseline} /></div>
          </div>
        )}
      </Card>

      {/* the checklist */}
      <Card flat className="py-7 border-t border-border">
        <div className="flex flex-col">
          {visibleOpen.map((f, i) => (
            <TaskRow
              key={f.id}
              f={f}
              first={i === 0}
              onViewFix={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)}
            />
          ))}
          {lockedOpen.map((f, i) => (
            <LockedTask key={`lock-${f.id}`} f={f} first={visibleOpen.length === 0 && i === 0} />
          ))}
        </div>

        {lockedOpen.length > 0 && (
          <div className="mt-5 pt-5 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: '1px solid var(--color-hairline)' }}>
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-ink">Unlock the other {lockedOpen.length} task{lockedOpen.length === 1 ? '' : 's'} + every fix</div>
              <div className="text-[13px] mt-[1px]" style={{ color: '#737373' }}>Guard shows every task, the exact fix and an AI prompt for each, plus copy all fixes.</div>
            </div>
            <PillButton onClick={() => router.push(billingHref())} className="shrink-0">Upgrade to Guard</PillButton>
          </div>
        )}
      </Card>
    </div>
  );
}

function TaskRow({ f, first, onViewFix }: { f: UiFinding; first?: boolean; onViewFix: () => void }) {
  return (
    <div className="flex items-start gap-3 py-[13px]" style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[9px] flex-wrap">
          <SeverityText sev={f.sev} />
          {f.where && <span className="font-mono text-[11.5px] truncate" style={{ color: '#A3A3A3' }}>{f.where}</span>}
        </div>
        <div className="text-[14.5px] font-medium mt-[3px]">{f.title}</div>
        {f.what && <p className="text-[13px] leading-[1.55] mt-[3px]" style={{ color: '#737373' }}>{f.what}</p>}
      </div>
      <button onClick={onViewFix} className="shrink-0 self-center vg-press cursor-pointer inline-flex items-center gap-[5px] text-[12.5px] font-medium text-ink hover:opacity-70 transition-opacity">
        View fix
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

/** A locked task for free users: severity shows, the action + fix need Guard. */
function LockedTask({ f, first }: { f: UiFinding; first?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-[13px]" style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>
      <div className="flex-1 min-w-0">
        <SeverityText sev={f.sev} />
        <div className="blur-[5px] select-none font-medium text-[14.5px] mt-[3px]">{f.title}</div>
      </div>
      <span className="shrink-0 self-center inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-ink">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" /></svg>
        Guard
      </span>
    </div>
  );
}
