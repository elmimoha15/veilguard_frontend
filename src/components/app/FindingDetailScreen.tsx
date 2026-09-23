'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { SEV_META, SEV_COLOR, SEV_TINT, CONF_META, CONF_TINT } from './data';
import { subscribeFinding, type BackendFinding } from '@/lib/scans';
import { toUiFinding } from '@/lib/adapters';
import { api } from '@/lib/api';
import { billingHref } from '@/lib/url';
import { SectionLabel, NewBadge, PillButton } from './primitives';

export default function FindingDetailScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scan') ?? '';
  const findingId = params.get('id') ?? '';
  const isNew = params.get('new') === '1';
  const { toast } = useApp();
  const [raw, setRaw] = useState<(BackendFinding & { id: string }) | null | 'loading'>('loading');
  const [unlock, setUnlock] = useState<{ fix?: string; fixPrompt?: string; explanation?: string } | null>(null);
  const [fixLoaded, setFixLoaded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [fixTab, setFixTab] = useState<'prompt' | 'fix'>('prompt');

  const missingIds = !scanId || !findingId;

  useEffect(() => {
    if (!scanId || !findingId) return;
    return subscribeFinding(scanId, findingId, (f) => setRaw(f));
  }, [scanId, findingId]);

  // The server decides entitlement: Guard gets every fix, a free user gets this
  // scan's teaser (others 402).
  useEffect(() => {
    if (!scanId || !findingId) return;
    let cancelled = false;
    api.findingFix(scanId, findingId).then((res) => {
      if (cancelled) return;
      if (res.ok) setUnlock({ fix: res.data.fix, fixPrompt: res.data.fixPrompt, explanation: res.data.explanation });
      setFixLoaded(true);
    });
    return () => { cancelled = true; };
  }, [scanId, findingId]);

  if (missingIds || raw === null) {
    return (
      <div className="vg-fade">
        <BackLink onClick={() => router.back()} />
        <div className="text-center text-muted py-16">Finding not found.</div>
      </div>
    );
  }
  if (raw === 'loading') return <div className="vg-skel h-[300px]" />;

  const f = toUiFinding(raw);
  const meta = SEV_META[f.sev];

  const copy = (text: string, key: string) => {
    try { navigator.clipboard?.writeText(text); } catch { /* unavailable */ }
    setCopied(key);
    toast('Copied', SEV_COLOR.PASSED);
    setTimeout(() => setCopied(null), 1600);
  };

  const hasPrompt = !!unlock?.fixPrompt;
  const hasFix = !!unlock?.fix;
  const unlocked = hasPrompt || hasFix;
  const activeTab: 'prompt' | 'fix' = hasPrompt && hasFix ? fixTab : hasPrompt ? 'prompt' : 'fix';
  // The tailored explanation is folded into "Why it matters" (falls back to the
  // generic reason for free/locked findings).
  const whyText = unlock?.explanation || f.what;
  const where = f.where || f.cat;

  return (
    <div className="vg-fade max-w-[900px]">
      <BackLink onClick={() => router.back()} />

      {/* header */}
      <div className="flex items-center gap-2 flex-wrap mb-[12px]">
        <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px] text-[13.5px] font-medium" style={{ background: SEV_TINT[f.sev].bg, color: SEV_TINT[f.sev].fg }}>
          <span className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR[f.sev] }} />
          {meta.sevPlain}
        </span>
        <Chip>{f.cat}</Chip>
        {f.cwe && <Chip mono>{f.cwe}</Chip>}
        {CONF_META[f.confidence] && (
          <span className="inline-flex items-center rounded-full px-[10px] py-[5px] text-[12.5px] font-semibold" style={{ background: CONF_TINT.bg, color: CONF_TINT.fg }}>{CONF_META[f.confidence]!.label}</span>
        )}
        {isNew && <NewBadge />}
      </div>
      <h1 className="text-[30px] font-semibold tracking-[-0.025em] leading-[1.1] max-w-[64ch]">{f.title}</h1>
      <p className="text-[15px] text-muted leading-[1.55] mt-[7px] max-w-[68ch]">{meta.sevHint}</p>
      {CONF_META[f.confidence] && (
        <div className="mt-4 rounded-[10px] px-4 py-3 text-[13.5px] leading-[1.5]" style={{ background: CONF_TINT.bg, color: '#57534E' }}>
          {CONF_META[f.confidence]!.note}
        </div>
      )}

      {/* why it matters + where we found it (one section) */}
      <div className="grid sm:grid-cols-2 mt-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="py-5 sm:py-0 sm:pr-7">
          <SectionLabel className="mb-3">Why it matters</SectionLabel>
          <p className="m-0 text-[15px] leading-[1.6] text-[#3b3a37]">{whyText}</p>
        </div>
        <div className="py-5 sm:py-0 sm:pl-7">
          <div className="flex items-start justify-between gap-2">
            <SectionLabel className="mb-3">Where we found it</SectionLabel>
            <button onClick={() => copy(where, 'where')} aria-label="Copy location" className="vg-press shrink-0 -mt-1 -mr-1 p-[6px] rounded-[8px] text-tertiary hover:text-ink hover:bg-[#F2F2EF] transition-colors cursor-pointer">
              {copied === 'where' ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p className="m-0 text-[14px] leading-[1.6] text-[#3b3a37] font-mono break-words">{where}</p>
          {f.evidence && (
            <pre className="m-0 mt-3 p-3 bg-bg-soft border border-border rounded-lg font-mono text-[13px] leading-[1.6] text-faint overflow-x-auto whitespace-pre-wrap break-words">{f.evidence}</pre>
          )}
        </div>
      </div>

      {/* how to fix */}
      <div className="mt-9 mb-[6px]">
        <span className="font-semibold text-[18px] tracking-[-0.02em]">How to fix it</span>
      </div>
      <p className="text-[14px] text-muted mb-4">Two ways. Hand it to your AI, or paste the code yourself.</p>

      {unlocked ? (
        <div className="overflow-hidden border-y border-border">
          {/* tabs + copy */}
          <div className="flex items-center justify-between gap-3 px-4 py-[11px]" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
            <div className="inline-flex items-center gap-1 rounded-[10px] p-1" style={{ background: '#F2F2EF' }}>
              {hasPrompt && (
                <TabBtn active={activeTab === 'prompt'} onClick={() => setFixTab('prompt')} icon={<SparkIcon />}>Prompt for your AI</TabBtn>
              )}
              {hasFix && (
                <TabBtn active={activeTab === 'fix'} onClick={() => setFixTab('fix')} icon={<CodeIcon />}>The exact code</TabBtn>
              )}
            </div>
            <PillButton
              onClick={() => copy((activeTab === 'prompt' ? unlock!.fixPrompt : unlock!.fix) || '', activeTab)}
              icon={<CopyIcon />}
            >
              {copied === activeTab ? 'Copied' : activeTab === 'prompt' ? 'Copy prompt' : 'Copy code'}
            </PillButton>
          </div>
          {/* body, monospace so it reads technical */}
          <div
            className="p-5 font-mono text-[13.5px] leading-[1.75] text-[#2f2f2c] whitespace-pre-wrap overflow-auto max-h-[520px]"
            style={{ background: activeTab === 'fix' ? 'var(--color-bg-soft)' : undefined }}
          >
            {activeTab === 'prompt' ? unlock!.fixPrompt : unlock!.fix}
          </div>
        </div>
      ) : !fixLoaded ? (
        <div className="border-y border-border px-6 py-9 flex flex-col items-center text-center gap-3">
          <span className="w-6 h-6 rounded-full vg-spin" style={{ border: '2px solid #E2E2DF', borderTopColor: '#0A0A0A' }} />
          <div className="text-muted text-[15px] font-medium">Preparing your fix</div>
        </div>
      ) : (
        <div className="border-y border-border">
          <div className="flex flex-col items-center text-center gap-[14px] px-6 py-9">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EDEDEA' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" stroke="#5b5a56" strokeWidth="1.7" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="#5b5a56" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </span>
            <div>
              <h3 className="text-ink font-medium text-[16px] tracking-[-0.01em]">Unlock the fix</h3>
              <p className="text-muted text-[14px] leading-[1.55] mt-[6px] max-w-[46ch] mx-auto">
                You get the exact copy paste fix and a ready made AI prompt for this issue, plus every other fix and continuous monitoring.
              </p>
            </div>
            <PillButton onClick={() => router.push(billingHref())}>Upgrade to unlock</PillButton>
          </div>
        </div>
      )}

      {unlocked && (
        <p className="flex items-center gap-2 text-[13.5px] text-muted mt-4">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          Once it&apos;s deployed, re-scan and this issue clears itself.
        </p>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[7px] rounded-[8px] px-[12px] py-[7px] text-[13px] font-medium cursor-pointer transition-colors"
      style={active ? { background: '#fff', color: '#0A0A0A', boxShadow: '0 1px 2px rgba(0,0,0,.08)' } : { color: '#737373' }}
    >
      {icon}{children}
    </button>
  );
}

function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}
function CheckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SparkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3l1.8 4.6L18 9.4l-4.2 2.9.8 4.7L12 14.8 9.4 17l.8-4.7L6 9.4l4.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M8 8l-4 4 4 4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="vg-press cursor-pointer inline-flex items-center gap-[6px] bg-none text-label font-medium text-[15px] mb-5 hover:text-ink transition-colors">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Back to all issues
    </button>
  );
}

function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-card border border-border px-[11px] py-[5px] text-[13px] font-medium text-muted ${mono ? 'font-mono text-[12.5px]' : ''}`}>
      {children}
    </span>
  );
}
