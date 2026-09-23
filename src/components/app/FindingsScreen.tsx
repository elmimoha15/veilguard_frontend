'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type App } from '@/lib/hooks';
import { subscribeFindings, getFindings, type BackendFinding, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiFinding } from '@/lib/adapters';
import { useAuth, isPaid } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import DeepScanHints from './DeepScanHints';
import PassedChecks from './PassedChecks';
import { EmptyState } from './EmptyState';
import { SEV_COLOR, SEV_TINT, STATUS_META, CONF_META, CONF_TINT } from './data';
import { SeverityChip, PillButton, Card, SeverityTiles } from './primitives';

/** Small line-SVG chevron used on list rows and the scan picker. */
function Chevron({ dir = 'right', size = 16, color = '#C7C7C2' }: { dir?: 'right' | 'down'; size?: number; color?: string }) {
  const d = dir === 'down' ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

type Diff = 'new' | 'open' | 'fixed';
const keyOf = (f: UiFinding) => `${f.ruleId}@${f.where}`;

/**
 * Findings for ONE app, rendered as a tab inside the app hub (AppDetailScreen).
 * The app is passed in (no global app-switcher); the per-app ScanPicker chooses
 * which scan's findings to view, with a diff vs the previous same-lens scan.
 */
export default function FindingsScreen({ app, initialScanId, onWhatToDo }: { app: App; initialScanId?: string | null; onWhatToDo?: () => void }) {
  const router = useRouter();
  const { profile } = useAuth();
  const paid = isPaid(profile);
  const site = app;

  // Which scan within the app: a picked historical one, else the latest.
  const [viewScanId, setViewScanId] = useState<string | null>(initialScanId ?? null);
  const selected: ScanDoc | null = site.scans.find((s) => s.id === viewScanId) ?? site.latest ?? null;
  const scanId = selected?.id ?? null;

  // The previous completed scan OF THE SAME LENS (a URL scan and a Deep scan run
  // different rule sets, so diffing across lenses would be meaningless).
  const sameLens = (a: ScanDoc, b: ScanDoc) => (a.type === 'deep') === (b.type === 'deep');
  const selectedIndex = selected ? site.scans.findIndex((s) => s.id === selected.id) : -1;
  const prevScan = selectedIndex >= 0 && selected ? site.scans.slice(selectedIndex + 1).find((s) => sameLens(s, selected)) : undefined;
  const prevScanId = prevScan && prevScan.status === 'done' ? prevScan.id : null;

  // Current scan findings (live).
  const [raw, setRaw] = useState<{ id: string; items: (BackendFinding & { id: string })[] }>({ id: '', items: [] });
  useEffect(() => {
    if (!scanId) return;
    return subscribeFindings(scanId, (items) => setRaw({ id: scanId, items }));
  }, [scanId]);
  const rawItems = raw.id === scanId ? raw.items : [];

  // Previous scan findings (one-shot) for the diff.
  const [prev, setPrev] = useState<{ id: string; items: (BackendFinding & { id: string })[] }>({ id: '', items: [] });
  useEffect(() => {
    if (!prevScanId) return;
    let cancelled = false;
    getFindings(prevScanId).then((items) => { if (!cancelled) setPrev({ id: prevScanId, items }); });
    return () => { cancelled = true; };
  }, [prevScanId]);
  const diffReady = !!prevScanId && prev.id === prevScanId;

  if (!selected) {
    return <EmptyState title="No findings yet" subtitle="Run a scan to see findings for this app." />;
  }

  const findings = rawItems.map(toUiFinding).sort((a, b) => rank(b.sev) - rank(a.sev));
  const prevFindings = diffReady ? prev.items.map(toUiFinding) : [];
  const prevKeys = new Set(prevFindings.map(keyOf));
  const currentKeys = new Set(findings.map(keyOf));

  const diffOf = (f: UiFinding): Diff => (!diffReady ? 'open' : prevKeys.has(keyOf(f)) ? 'open' : 'new');
  const fixed = diffReady ? prevFindings.filter((f) => !currentKeys.has(keyOf(f))) : [];
  const newCount = diffReady ? findings.filter((f) => !prevKeys.has(keyOf(f))).length : 0;

  const running = selected.status === 'queued' || selected.status === 'running';
  const errored = selected.status === 'error';
  const totalShown = findings.length + fixed.length;

  const rows: { f: UiFinding; isFixed: boolean }[] = [
    ...findings.map((f) => ({ f, isFixed: false })),
    ...fixed.map((f) => ({ f, isFixed: true })),
  ];
  // Free plan previews the two worst findings; the rest are locked behind Guard.
  const FREE_LIMIT = 2;
  const visibleRows = paid ? rows : rows.slice(0, FREE_LIMIT);
  const lockedRows = paid ? [] : rows.slice(FREE_LIMIT);

  return (
    <div className="vg-fade">
      {/* scan picker */}
      <div className="mb-4">
        <ScanPicker scans={site.scans} selectedId={selected.id} onSelect={setViewScanId} />
      </div>

      {/* summary card: counts (critical + warnings first) + copy all fixes */}
      <Card flat className="py-7 border-t border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-[16px] font-medium">Findings summary</h2>
          {selected.status === 'done' && findings.length > 0 && onWhatToDo && (
            <PillButton onClick={onWhatToDo} tooltip="Your prioritized checklist" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}>
              What to do
            </PillButton>
          )}
        </div>
        <SeverityTiles
          critical={findings.filter((f) => f.sev === 'CRITICAL').length}
          warnings={findings.filter((f) => f.sev === 'WARNING').length}
          passed={selected.counts?.passed ?? selected.passed?.length ?? 0}
        />
        {diffReady && (newCount > 0 || fixed.length > 0) && (
          <div className="flex items-center gap-3 mt-4 text-[13.5px] font-medium">
            <span className="text-[11px] font-semibold tracking-[0.05em]" style={{ color: '#A3A3A3' }}>VS PREVIOUS SCAN</span>
            {newCount > 0 && <span style={{ color: SEV_COLOR.CRITICAL }}>+{newCount} new</span>}
            {fixed.length > 0 && <span style={{ color: SEV_COLOR.PASSED }}>{fixed.length} fixed</span>}
            {newCount === 0 && fixed.length > 0 && <span style={{ color: '#737373' }}>no new issues, nice work</span>}
          </div>
        )}
      </Card>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={selected} />

      {errored ? (
        <Card flat className="py-10 text-center border-t border-border">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2"><path d="M12 9v4m0 4h.01M10.3 3.9 2 18a1.7 1.7 0 0 0 1.5 2.5h17A1.7 1.7 0 0 0 22 18L13.7 3.9a1.7 1.7 0 0 0-3 0Z" stroke={SEV_COLOR.WARNING} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="font-medium text-[16px]">This scan errored</div>
          <p className="text-[14px] mt-1 font-mono" style={{ color: '#737373' }}>{selected.error || 'The target could not be reached.'}</p>
        </Card>
      ) : running && findings.length === 0 ? (
        <Card flat className="text-center border-t border-border"><div className="py-10 text-[15px]" style={{ color: '#737373' }}>Scanning… findings will appear here live.</div></Card>
      ) : totalShown === 0 ? (
        <Card flat className="border-t border-border pt-2"><EmptyState title="No issues found" subtitle="This scan came back clean, nothing to fix right now." /></Card>
      ) : (
        <Card flat className="py-7 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[16px] font-medium">Findings</h2>
            <span className="tnum text-[13px]" style={{ color: '#A3A3A3' }}>{totalShown}</span>
          </div>
          <div className="flex flex-col">
            {visibleRows.map(({ f, isFixed }, i) => (
              <FindingRow
                key={isFixed ? `fixed-${f.id}` : f.id}
                f={f}
                diff={isFixed ? 'fixed' : diffOf(f)}
                showDiff={diffReady}
                first={i === 0}
                onClick={isFixed ? undefined : () => router.push(`/finding?scan=${scanId}&id=${f.id}${diffReady && diffOf(f) === 'new' ? '&new=1' : ''}`)}
              />
            ))}
            {lockedRows.map(({ f }, i) => (
              <LockedRow key={`lock-${f.id}`} f={f} first={visibleRows.length === 0 && i === 0} />
            ))}
          </div>
          {lockedRows.length > 0 && (
            <div className="mt-5 pt-5 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: '1px solid var(--color-hairline)' }}>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-ink">Unlock the other {lockedRows.length} finding{lockedRows.length === 1 ? '' : 's'} + every fix</div>
                <div className="text-[13px] mt-[1px]" style={{ color: '#737373' }}>Guard shows every finding, the exact fix and an AI prompt for each, plus monitoring.</div>
              </div>
              <PillButton onClick={() => router.push(billingHref())} className="shrink-0">Upgrade to Guard</PillButton>
            </div>
          )}
        </Card>
      )}

      {/* What's solid — the checks this scan passed (shown to everyone, never gated). */}
      {selected.status === 'done' && <PassedChecks passed={selected.passed} />}
    </div>
  );
}

const DIFF_BADGE: Record<Diff, { label: string; bg: string; fg: string } | null> = {
  new: { label: 'NEW', bg: SEV_TINT.CRITICAL.bg, fg: SEV_TINT.CRITICAL.fg },
  open: null,
  fixed: { label: 'Fixed', bg: STATUS_META.fixed.bg, fg: STATUS_META.fixed.fg },
};

/** A locked finding for free users: severity is shown, the details are blurred
 *  behind a Guard lock (the exact fix + full details need an upgrade). */
function LockedRow({ f, first }: { f: UiFinding; first?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-[14px]" style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>
      <span className="pt-[1px]"><SeverityChip sev={f.sev} /></span>
      <div className="flex-1 min-w-0">
        <div className="blur-[5px] select-none font-medium text-[14.5px]">{f.title}</div>
        {f.what && <div className="blur-[4px] select-none text-[13px] mt-[3px]" style={{ color: '#737373' }}>{f.what}</div>}
      </div>
      <span className="shrink-0 self-center inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-ink">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" /></svg>
        Guard
      </span>
    </div>
  );
}

function FindingRow({ f, diff, showDiff, first, onClick }: { f: UiFinding; diff: Diff; showDiff: boolean; first?: boolean; onClick?: () => void }) {
  const isFixed = diff === 'fixed';
  const badge = showDiff ? DIFF_BADGE[diff] : null;
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={`flex items-start gap-3 w-full py-[14px] text-left transition-opacity ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} ${isFixed ? 'opacity-60' : ''}`} style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>
      <span className="pt-[1px]"><SeverityChip sev={f.sev} /></span>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-[14.5px] flex items-center gap-2 ${isFixed ? 'line-through' : ''}`} style={isFixed ? { color: '#737373' } : undefined}>
          <span className="truncate">{f.title}</span>
          {!isFixed && CONF_META[f.confidence] && (
            <span className="shrink-0 text-[10.5px] font-semibold px-[7px] py-[2px] rounded-full" style={{ background: CONF_TINT.bg, color: CONF_TINT.fg }}>{CONF_META[f.confidence]!.label}</span>
          )}
        </div>
        {!isFixed && <p className="text-[13px] leading-[1.55] mt-[3px]" style={{ color: '#737373' }}>{f.what}</p>}
        <div className="font-mono text-[11.5px] mt-[4px] truncate" style={{ color: '#A3A3A3' }}>{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
      </div>
      {badge && <span className="shrink-0 text-[11px] font-medium px-[9px] py-[3px] rounded-[6px]" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>}
      {onClick && <span className="pt-[2px]"><Chevron /></span>}
    </button>
  );
}

/**
 * Dated scan picker. A single compact control that scales to any number of
 * scans: the trigger shows the currently-viewed scan (its date/time + grade),
 * and the dropdown lists every scan newest-first, grouped by day like a
 * timeline, with the newest tagged "Latest" and selected by default.
 */
function ScanPicker({ scans, selectedId, onSelect }: { scans: ScanDoc[]; selectedId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = scans.find((s) => s.id === selectedId) ?? scans[0];
  const latestId = scans[0]?.id;

  // Only one scan → a plain dated label, no dropdown needed.
  if (scans.length <= 1) {
    return (
      <span className="inline-flex items-baseline gap-[8px]">
        <span className="text-[14.5px] font-medium text-ink">{fmtWhen(selected.createdAt)}</span>
        <span className="text-[12px] text-faint">Latest scan</span>
      </span>
    );
  }

  const groups = groupByDay(scans);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="vg-press cursor-pointer inline-flex items-center gap-[6px] rounded-[8px] px-[8px] py-[5px] hover:bg-bg-soft transition-colors">
        <span className="text-left">
          <span className="block text-[14.5px] font-medium text-ink">{fmtWhen(selected.createdAt)}</span>
          <span className="block text-[12px] text-faint">{selected.id === latestId ? 'Latest scan' : 'Older scan'}</span>
        </span>
        <Chevron dir="down" size={13} color="#9B9B96" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] left-0 w-[300px] max-h-[340px] overflow-y-auto bg-card border border-border rounded-[12px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            {groups.map((g) => (
              <div key={g.day}>
                <div className="text-[11px] font-semibold tracking-[0.05em] uppercase text-faint px-[10px] pt-[10px] pb-[4px]">{g.day.toUpperCase()}</div>
                {g.items.map((s) => {
                  const on = s.id === selectedId;
                  return (
                    <button key={s.id} onClick={() => { onSelect(s.id); setOpen(false); }} className="vg-row cursor-pointer flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left" style={{ background: on ? '#EDEDEA' : undefined }}>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-medium">{fmtTime(s.createdAt)}</span>
                        <span className="block font-mono text-[11.5px] text-faint capitalize">{s.status}{s.type === 'deep' ? ' · deep' : ''}</span>
                      </span>
                      {s.id === latestId && <span className="shrink-0 text-[11px] font-medium px-[8px] py-[3px] rounded-full" style={{ background: '#EDEDEA', color: '#5b5a56' }}>LATEST</span>}
                      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M20 6 9 17l-5-5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function groupByDay(scans: ScanDoc[]): { day: string; items: ScanDoc[] }[] {
  const groups: { day: string; items: ScanDoc[] }[] = [];
  for (const s of scans) {
    const day = fmtDay(s.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(s);
    else groups.push({ day, items: [s] });
  }
  return groups;
}

function fmtWhen(iso: string): string {
  return `${fmtDay(iso)} · ${fmtTime(iso)}`;
}
function fmtDay(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return 'Earlier'; }
}
function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  catch { return ''; }
}

function rank(sev: string): number {
  return sev === 'CRITICAL' ? 3 : sev === 'WARNING' ? 2 : 1;
}
