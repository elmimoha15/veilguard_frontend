'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GRADE_TINT, type App } from '@/lib/hooks';
import { subscribeFindings, getFindings, type BackendFinding, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiSev, type UiFinding } from '@/lib/adapters';
import { useAuth, isPaid } from '@/lib/auth';
import { useApp } from './state';
import { api } from '@/lib/api';
import { billingHref } from '@/lib/url';
import DeepScanHints from './DeepScanHints';
import { SEV_COLOR, SEV_TINT, STATUS_META } from './data';

const SECTIONS: { sev: UiSev; label: string }[] = [
  { sev: 'CRITICAL', label: 'Critical' },
  { sev: 'WARNING', label: 'Warnings' },
  { sev: 'PASSED', label: 'Passed' },
];

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
 * Findings for ONE app — rendered as a tab inside the app hub (AppDetailScreen).
 * The app is passed in (no global app-switcher); the per-app ScanPicker chooses
 * which scan's findings to view, with a diff vs the previous same-lens scan.
 */
export default function FindingsScreen({ app, initialScanId }: { app: App; initialScanId?: string | null }) {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useApp();
  const paid = isPaid(profile);
  const [copyBusy, setCopyBusy] = useState(false);
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
    return <div className="text-center text-muted py-16 text-[15px]">Run a scan to see findings.</div>;
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

  // Guard-only: gather every fix into one organized AI prompt and copy it.
  const copyAllFixes = async () => {
    if (!scanId) return;
    if (!paid) { toast('Copy-all-fixes is a Guard feature — upgrade to unlock.', '#E0932F'); router.push(billingHref()); return; }
    setCopyBusy(true);
    const res = await api.allFixesPrompt(scanId);
    setCopyBusy(false);
    if (!res.ok || !res.data.prompt) { toast(res.data.error || 'Could not build the prompt', '#E5484D'); return; }
    try { await navigator.clipboard.writeText(res.data.prompt); toast('All fixes copied as a prompt', '#0A0A0A'); }
    catch { toast('Could not copy — try again', '#E5484D'); }
  };

  return (
    <div className="vg-fade">
      {/* Pick which scan to view; the selected scan's grade sits at the right. */}
      <div className="flex items-center gap-[10px] flex-wrap mb-5">
        <ScanPicker scans={site.scans} selectedId={selected.id} onSelect={setViewScanId} />
        <div className="ml-auto flex items-center gap-[10px]">
          {selected.status === 'done' && findings.length > 0 && (
            <button
              onClick={copyAllFixes}
              disabled={copyBusy}
              title={paid ? 'Copy every fix as one AI prompt' : 'Guard feature'}
              style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}
              className="vg-press cursor-pointer rounded-[10px] px-[13px] py-[8px] text-[13.5px] font-semibold disabled:opacity-60 inline-flex items-center gap-[7px]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.7" /></svg>
              {copyBusy ? 'Preparing…' : paid ? 'Copy all fixes as a prompt' : 'Copy all fixes (Guard)'}
            </button>
          )}
          {selected.grade && (
            <span className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-[22px] tnum" style={{ background: GRADE_TINT[selected.grade].bg, color: GRADE_TINT[selected.grade].fg }}>{selected.grade}</span>
          )}
        </div>
      </div>

      {/* diff summary vs previous scan */}
      {diffReady && (newCount > 0 || fixed.length > 0) && (
        <div className="flex items-center gap-3 mb-4 text-[14px] font-semibold">
          <span className="text-faint font-mono text-[12px] tracking-[0.08em]">VS PREVIOUS SCAN</span>
          {newCount > 0 && <span style={{ color: SEV_COLOR.CRITICAL }}>+{newCount} new</span>}
          {fixed.length > 0 && <span style={{ color: SEV_COLOR.PASSED }}>{fixed.length} fixed</span>}
          {newCount === 0 && fixed.length > 0 && <span className="text-muted">no new issues — nice work</span>}
        </div>
      )}

      {/* summary — calm metric strip (matches Overview) */}
      <div className="flex flex-wrap items-start gap-x-9 gap-y-3 mb-6">
        {SECTIONS.map((sec) => {
          const n = findings.filter((f) => f.sev === sec.sev).length;
          return (
            <div key={sec.sev}>
              <div className="tnum text-[20px] font-semibold leading-none" style={{ color: n ? SEV_COLOR[sec.sev] : '#B0B0AC' }}>{n}</div>
              <div className="text-[12px] text-muted mt-[6px]">{sec.label}</div>
            </div>
          );
        })}
      </div>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={selected} />

      {errored ? (
        <div className="vg-surface p-8 text-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2"><path d="M12 9v4m0 4h.01M10.3 3.9 2 18a1.7 1.7 0 0 0 1.5 2.5h17A1.7 1.7 0 0 0 22 18L13.7 3.9a1.7 1.7 0 0 0-3 0Z" stroke={SEV_COLOR.WARNING} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="font-semibold text-[16px]">This scan errored</div>
          <p className="text-muted text-[14px] mt-1 font-mono">{selected.error || 'The target could not be reached.'}</p>
        </div>
      ) : running && findings.length === 0 ? (
        <div className="text-center text-muted py-16 text-[15px]">Scanning… findings will appear here live.</div>
      ) : totalShown === 0 ? (
        <div className="text-center text-muted py-16 text-[15px]">No issues found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec) => {
            const current = findings.filter((f) => f.sev === sec.sev);
            const fixedHere = fixed.filter((f) => f.sev === sec.sev);
            if (current.length === 0 && fixedHere.length === 0) return null;
            return (
              <section key={sec.sev}>
                <div className="flex items-center gap-[9px] mb-[10px]">
                  <span className="inline-block w-[8px] h-[8px] rounded-full" style={{ background: SEV_COLOR[sec.sev] }} />
                  <span className="text-[13px] font-semibold" style={{ color: SEV_TINT[sec.sev].fg }}>{sec.label}</span>
                  <span className="tnum text-[13px] font-semibold text-faint">{current.length}</span>
                </div>
                <div className="vg-surface overflow-hidden">
                  {current.map((f, i) => (
                    <FindingRow key={f.id} f={f} diff={diffOf(f)} showDiff={diffReady} first={i === 0} onClick={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)} />
                  ))}
                  {fixedHere.map((f, i) => (
                    <FindingRow key={`fixed-${f.id}`} f={f} diff="fixed" showDiff first={current.length === 0 && i === 0} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DIFF_BADGE: Record<Diff, { label: string; bg: string; fg: string } | null> = {
  new: { label: 'NEW', bg: SEV_TINT.CRITICAL.bg, fg: SEV_TINT.CRITICAL.fg },
  open: null,
  fixed: { label: 'Fixed', bg: STATUS_META.fixed.bg, fg: STATUS_META.fixed.fg },
};

function FindingRow({ f, diff, showDiff, onClick, first }: { f: UiFinding; diff: Diff; showDiff: boolean; onClick?: () => void; first?: boolean }) {
  const isFixed = diff === 'fixed';
  const badge = showDiff ? DIFF_BADGE[diff] : null;
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={`w-full flex items-center gap-[14px] px-[18px] py-[14px] text-left ${onClick ? 'vg-row cursor-pointer' : 'cursor-default'} ${isFixed ? 'opacity-60' : ''}`} style={{ borderTop: first ? undefined : '1px solid var(--color-hairline)' }}>
      <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR[f.sev], animation: diff === 'new' && f.sev === 'CRITICAL' ? 'vgPulse 1.8s ease-in-out infinite' : undefined }} />
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-[15px] ${isFixed ? 'line-through text-muted' : ''}`}>{f.title}</div>
        {!isFixed && <div className="text-[13.5px] text-muted leading-[1.4] mt-[2px] line-clamp-1">{f.what}</div>}
        <div className="font-mono text-[12px] text-faint mt-[4px]">{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
      </div>
      {badge && <span className="shrink-0 text-[11.5px] font-semibold px-[10px] py-[4px] rounded-full" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>}
      {onClick && <Chevron />}
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
      <div className="inline-flex items-center gap-[9px] bg-card border border-border rounded-[12px] px-4 py-[9px]">
        <GradeSquare grade={selected?.grade} />
        <span className="text-[14.5px] font-semibold">{fmtWhen(selected.createdAt)}</span>
        <span className="font-mono text-[11.5px] text-faint">Latest scan</span>
      </div>
    );
  }

  const groups = groupByDay(scans);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="vg-press cursor-pointer flex items-center gap-[10px] bg-card border border-border rounded-[12px] px-4 py-[9px] min-w-[260px]">
        <GradeSquare grade={selected?.grade} />
        <span className="flex-1 text-left min-w-0">
          <span className="block text-[14.5px] font-semibold truncate">{fmtWhen(selected.createdAt)}</span>
          <span className="block font-mono text-[11.5px] text-faint">{selected.id === latestId ? 'Latest scan' : 'Older scan'} · {selected.status}</span>
        </span>
        <Chevron dir="down" size={13} color="#9B9B96" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] left-0 w-[300px] max-h-[340px] overflow-y-auto bg-card border border-border rounded-[12px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            {groups.map((g) => (
              <div key={g.day}>
                <div className="font-mono text-[11px] tracking-[0.12em] text-faint px-[10px] pt-[10px] pb-[4px]">{g.day.toUpperCase()}</div>
                {g.items.map((s) => {
                  const on = s.id === selectedId;
                  return (
                    <button key={s.id} onClick={() => { onSelect(s.id); setOpen(false); }} className="vg-row cursor-pointer flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left" style={{ background: on ? 'rgba(243,197,0,.12)' : undefined }}>
                      <GradeSquare grade={s.grade} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-semibold">{fmtTime(s.createdAt)}</span>
                        <span className="block font-mono text-[11.5px] text-faint capitalize">{s.status}{s.type === 'deep' ? ' · deep' : ''}</span>
                      </span>
                      {s.id === latestId && <span className="shrink-0 text-[11px] font-semibold px-[8px] py-[3px] rounded-full" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>LATEST</span>}
                      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M20 6 9 17l-5-5" stroke="#8a6d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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

function GradeSquare({ grade }: { grade?: 'A' | 'B' | 'C' | 'D' | 'F' }) {
  return (
    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-[16px] tnum" style={{ background: grade ? GRADE_TINT[grade].bg : 'rgba(0,0,0,.05)', color: grade ? GRADE_TINT[grade].fg : '#9B9B96' }}>{grade ?? '…'}</span>
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
