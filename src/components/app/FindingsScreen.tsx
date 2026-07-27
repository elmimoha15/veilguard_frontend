'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useApps, findActiveApp, GRADE_TINT } from '@/lib/hooks';
import { subscribeFindings, getFindings, type BackendFinding, type ScanDoc } from '@/lib/scans';
import { toUiFinding, type UiSev, type UiFinding } from '@/lib/adapters';
import DeepScanHints from './DeepScanHints';
import { AppSelect } from './AppSelect';

const SECTIONS: { sev: UiSev; label: string; color: string; emoji: string }[] = [
  { sev: 'CRITICAL', label: 'Critical', color: '#E5352B', emoji: '🔴' },
  { sev: 'WARNING', label: 'Warnings', color: '#F2851F', emoji: '🟠' },
  { sev: 'PASSED', label: 'Passed', color: '#1FB86B', emoji: '🟢' },
];

type Diff = 'new' | 'open' | 'fixed';
const keyOf = (f: UiFinding) => `${f.ruleId}@${f.where}`;

export default function FindingsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { activeSite, setActiveSite } = useApp();
  const { apps, loading } = useApps();

  // Which app: active app (top-bar picker) wins; on a ?scan= deep-link fall
  // back to the app that owns that scan; else the first app.
  const paramScanId = params.get('scan');
  const paramHost = paramScanId ? apps.find((a) => a.scans.some((x) => x.id === paramScanId))?.host : null;
  const site = findActiveApp(apps, activeSite ?? paramHost ?? null);

  // Which scan within the app: a picked historical one, else the latest.
  const [viewScanId, setViewScanId] = useState<string | null>(paramScanId);
  const selected: ScanDoc | null = site?.scans.find((s) => s.id === viewScanId) ?? site?.latest ?? null;
  const scanId = selected?.id ?? null;

  // The previous completed scan OF THE SAME LENS (a URL scan and a Deep scan run
  // different rule sets, so diffing across lenses would be meaningless).
  const sameLens = (a: ScanDoc, b: ScanDoc) => (a.type === 'deep') === (b.type === 'deep');
  const selectedIndex = site && selected ? site.scans.findIndex((s) => s.id === selected.id) : -1;
  const prevScan = selectedIndex >= 0 && selected ? site?.scans.slice(selectedIndex + 1).find((s) => sameLens(s, selected)) : undefined;
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

  if (loading) return <div className="vg-skel h-[320px]" />;
  if (!site || !selected) {
    return (
      <div className="vg-fade">
        <h1 className="font-extrabold text-[28px] tracking-[-0.02em] mb-1">Findings</h1>
        <div className="text-center text-muted py-16 text-[15px]">Run a scan to see findings.</div>
      </div>
    );
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

  return (
    <div className="vg-fade">
      <h1 className="font-extrabold text-[28px] tracking-[-0.02em] mb-3">Findings</h1>

      {/* One control bar: pick the app, then the scan; the selected scan's grade sits at the right. */}
      <div className="flex items-center gap-[10px] flex-wrap mb-5">
        <AppSelect apps={apps} activeKey={site.key} onSelect={(a) => { setActiveSite(a.key); setViewScanId(null); }} />
        <ScanPicker scans={site.scans} selectedId={selected.id} onSelect={setViewScanId} />
        {selected.grade && (
          <span className="ml-auto w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-[22px]" style={{ background: GRADE_TINT[selected.grade].bg, color: GRADE_TINT[selected.grade].fg }}>{selected.grade}</span>
        )}
      </div>

      {/* diff summary vs previous scan */}
      {diffReady && (newCount > 0 || fixed.length > 0) && (
        <div className="flex items-center gap-3 mb-4 text-[13px] font-semibold">
          <span className="text-faint font-mono text-[11px] tracking-[0.08em]">VS PREVIOUS SCAN</span>
          {newCount > 0 && <span style={{ color: '#E5352B' }}>+{newCount} new</span>}
          {fixed.length > 0 && <span style={{ color: '#1FB86B' }}>{fixed.length} fixed ✓</span>}
          {newCount === 0 && fixed.length > 0 && <span className="text-muted">no new issues — nice work</span>}
        </div>
      )}

      {/* summary counts */}
      <div className="flex gap-[10px] flex-wrap mb-5">
        {SECTIONS.map((sec) => (
          <span key={sec.sev} className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold" style={{ background: `${sec.color}1e`, color: sec.color }}>
            {findings.filter((f) => f.sev === sec.sev).length} {sec.label.toLowerCase()}
          </span>
        ))}
      </div>

      {/* stack-aware nudges (connect Supabase / Firebase-rules note) */}
      <DeepScanHints scan={selected} />

      {errored ? (
        <div className="bg-card border border-border-2 rounded-[16px] p-8 text-center">
          <div className="text-[30px] mb-2">⚠️</div>
          <div className="font-bold text-[16px]">This scan errored</div>
          <p className="text-muted text-[14px] mt-1 font-mono">{selected.error || 'The target could not be reached.'}</p>
        </div>
      ) : running && findings.length === 0 ? (
        <div className="text-center text-muted py-16 text-[15px]">Scanning… findings will appear here live.</div>
      ) : totalShown === 0 ? (
        <div className="text-center text-muted py-16 text-[15px]">No issues found. 🎉</div>
      ) : (
        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec) => {
            const current = findings.filter((f) => f.sev === sec.sev);
            const fixedHere = fixed.filter((f) => f.sev === sec.sev);
            if (current.length === 0 && fixedHere.length === 0) return null;
            return (
              <section key={sec.sev}>
                <div className="flex items-center gap-[10px] mb-[10px]">
                  <span className="text-[15px]">{sec.emoji}</span>
                  <span className="font-extrabold text-[16px]" style={{ color: sec.color }}>{sec.label}</span>
                  <span className="text-[13px] font-bold text-faint">{current.length}</span>
                  <span className="flex-1 h-px bg-border-2" />
                </div>
                <div className="flex flex-col gap-[10px]">
                  {current.map((f) => (
                    <FindingRow key={f.id} f={f} diff={diffOf(f)} showDiff={diffReady} onClick={() => router.push(`/finding?scan=${scanId}&id=${f.id}`)} />
                  ))}
                  {fixedHere.map((f) => (
                    <FindingRow key={`fixed-${f.id}`} f={f} diff="fixed" showDiff />
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
  new: { label: 'NEW', bg: 'rgba(229,53,43,.14)', fg: '#E5352B' },
  open: null,
  fixed: { label: 'FIXED ✓', bg: 'rgba(31,184,107,.16)', fg: '#1FB86B' },
};

function FindingRow({ f, diff, showDiff, onClick }: { f: UiFinding; diff: Diff; showDiff: boolean; onClick?: () => void }) {
  const isFixed = diff === 'fixed';
  const badge = showDiff ? DIFF_BADGE[diff] : null;
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={`flex items-center gap-[14px] bg-card border border-border-2 rounded-[14px] px-[18px] py-4 text-left ${onClick ? 'vg-lift' : 'cursor-default'} ${isFixed ? 'opacity-60' : ''}`}>
      <span className="shrink-0 w-3 h-3 rounded-[3px]" style={{ background: f.color, animation: diff === 'new' && f.sev === 'CRITICAL' ? 'vgPulse 1.8s ease-in-out infinite' : undefined }} />
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-[15.5px] ${isFixed ? 'line-through text-muted' : ''}`}>{f.title}</div>
        {!isFixed && <div className="text-[13px] text-muted leading-[1.4] mt-[2px] line-clamp-1">{f.what}</div>}
        <div className="font-mono text-[11.5px] text-faint mt-[4px]">{f.cat}{f.where ? ` · ${f.where}` : ''}</div>
      </div>
      {badge && <span className="shrink-0 text-[11px] font-bold px-[10px] py-[4px] rounded-full" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>}
      {onClick && <span className="text-[#c7c6c1] text-[18px]">›</span>}
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
      <div className="inline-flex items-center gap-[9px] bg-card border border-border-2 rounded-[12px] px-4 py-[9px]">
        <GradeSquare grade={selected?.grade} />
        <span className="text-[13.5px] font-semibold">{fmtWhen(selected.createdAt)}</span>
        <span className="font-mono text-[10.5px] text-faint">Latest scan</span>
      </div>
    );
  }

  const groups = groupByDay(scans);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="vg-press flex items-center gap-[10px] bg-card border border-border-2 rounded-[12px] px-4 py-[9px] min-w-[260px]">
        <GradeSquare grade={selected?.grade} />
        <span className="flex-1 text-left min-w-0">
          <span className="block text-[13.5px] font-semibold truncate">{fmtWhen(selected.createdAt)}</span>
          <span className="block font-mono text-[10.5px] text-faint">{selected.id === latestId ? 'Latest scan' : 'Older scan'} · {selected.status}</span>
        </span>
        <span className="text-faint text-[11px]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute z-[50] top-[calc(100%+6px)] left-0 w-[300px] max-h-[340px] overflow-y-auto bg-card border border-border-2 rounded-[14px] p-[6px] shadow-[0_20px_44px_-16px_rgba(0,0,0,.4)] vg-fade">
            {groups.map((g) => (
              <div key={g.day}>
                <div className="font-mono text-[10px] tracking-[0.12em] text-faint px-[10px] pt-[10px] pb-[4px]">{g.day.toUpperCase()}</div>
                {g.items.map((s) => {
                  const on = s.id === selectedId;
                  return (
                    <button key={s.id} onClick={() => { onSelect(s.id); setOpen(false); }} className="flex items-center gap-[10px] w-full rounded-[10px] px-[10px] py-[9px] text-left hover:bg-bg-soft" style={{ background: on ? 'rgba(243,197,0,.12)' : undefined }}>
                      <GradeSquare grade={s.grade} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13.5px] font-semibold">{fmtTime(s.createdAt)}</span>
                        <span className="block font-mono text-[10.5px] text-faint capitalize">{s.status}{s.type === 'deep' ? ' · deep' : ''}</span>
                      </span>
                      {s.id === latestId && <span className="shrink-0 text-[10px] font-bold px-[8px] py-[3px] rounded-full" style={{ background: 'rgba(243,197,0,.18)', color: '#8a7400' }}>LATEST</span>}
                      {on && <span className="shrink-0 text-yellow-dark text-[13px]">✓</span>}
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
    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[15px]" style={{ background: grade ? GRADE_TINT[grade].bg : 'rgba(0,0,0,.05)', color: grade ? GRADE_TINT[grade].fg : '#9a9a95' }}>{grade ?? '…'}</span>
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
