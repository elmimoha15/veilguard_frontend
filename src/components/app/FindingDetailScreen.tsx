'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { SEV_META, SEV_COLOR, SEV_TINT } from './data';
import { subscribeFinding, type BackendFinding } from '@/lib/scans';
import { toUiFinding } from '@/lib/adapters';
import { api, DEV_FAKE_PAID } from '@/lib/api';
import { useAuth, isPaid } from '@/lib/auth';

export default function FindingDetailScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get('scan') ?? '';
  const findingId = params.get('id') ?? '';
  const { toast } = useApp();
  const { profile, loading: authLoading } = useAuth();
  const paid = isPaid(profile); // paid users get the fix content
  const [raw, setRaw] = useState<(BackendFinding & { id: string }) | null | 'loading'>('loading');
  const [unlock, setUnlock] = useState<{ fix?: string; fixPrompt?: string } | null>(null);
  const [copied, setCopied] = useState<'code' | 'prompt' | null>(null);

  const missingIds = !scanId || !findingId;

  useEffect(() => {
    if (!scanId || !findingId) return;
    return subscribeFinding(scanId, findingId, (f) => setRaw(f));
  }, [scanId, findingId]);

  // Paid users fetch the (client-locked) fix from the server, which gates on the
  // stored plan (402 for free). firestore.rules still deny the private fix doc to
  // every client — this is the only read path. DEV_FAKE_PAID unlocks on the emulator.
  // Fetch the fix as soon as we know the user is paid — do NOT wait for the finding
  // doc to resolve, so a paid user never sees the "Unlock" upsell flash before it.
  useEffect(() => {
    if (!paid || !scanId || !findingId) return;
    let cancelled = false;
    api.findingFix(scanId, findingId).then((res) => {
      if (!cancelled && res.ok) setUnlock({ fix: res.data.fix, fixPrompt: res.data.fixPrompt });
    });
    return () => { cancelled = true; };
  }, [scanId, findingId, paid]);

  if (missingIds || raw === null) {
    return (
      <div className="max-w-[840px] vg-fade">
        <BackLink onClick={() => router.back()} />
        <div className="text-center text-muted py-16">Finding not found.</div>
      </div>
    );
  }
  if (raw === 'loading') return <div className="vg-skel h-[300px] max-w-[840px]" />;

  const f = toUiFinding(raw);
  const meta = SEV_META[f.sev];

  const copy = (text: string, which: 'code' | 'prompt') => {
    try { navigator.clipboard?.writeText(text); } catch { /* unavailable */ }
    setCopied(which);
    toast('Copied', SEV_COLOR.PASSED);
    setTimeout(() => setCopied(null), 1600);
  };

  const unlocked = !!(unlock && (unlock.fix || unlock.fixPrompt));

  return (
    <div className="vg-fade max-w-[840px]">
      <BackLink onClick={() => router.back()} />

      {DEV_FAKE_PAID && (
        <div className="mb-4 rounded-[10px] px-4 py-2 text-[13.5px] font-semibold" style={{ background: '#ffe9a8', border: '1px solid #d9b64e', color: '#7a5b00' }}>
          DEV: fake paid mode — fixes are unlocked via a dev-only server endpoint. The real paywall is unchanged.
        </div>
      )}

      {/* ── header: severity + meta + title + plain-english lead ── */}
      <div className="flex items-center gap-2 flex-wrap mb-[14px]">
        <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px] text-[13.5px] font-semibold" style={{ background: SEV_TINT[f.sev].bg, color: SEV_TINT[f.sev].fg }}>
          <span className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR[f.sev] }} />
          {meta.sevPlain}
        </span>
        <Chip>{f.cat}</Chip>
        {f.cwe && <Chip mono>{f.cwe}</Chip>}
      </div>

      <h1 className="font-semibold text-[24px] tracking-[-0.02em] leading-[1.15]">{f.title}</h1>
      <p className="text-[16.5px] text-muted leading-[1.55] mt-2 max-w-[64ch]">{meta.sevHint}</p>

      {/* ── the risk + where ── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px] mt-6">
        <InfoCard label="WHY IT MATTERS">
          <p className="m-0 text-[16px] leading-[1.6] text-[#3b3a37]">{f.what}</p>
        </InfoCard>
        <InfoCard label="WHERE WE FOUND IT">
          <p className="m-0 text-[15px] leading-[1.6] text-[#3b3a37] font-mono break-words">{f.where || f.cat}</p>
          {f.evidence && (
            <pre className="m-0 mt-3 p-3 bg-bg-soft border border-border rounded-lg font-mono text-[13px] leading-[1.6] text-faint overflow-x-auto whitespace-pre-wrap break-words">{f.evidence}</pre>
          )}
        </InfoCard>
      </div>

      {/* ── how to fix ── */}
      <div className="mt-8 mb-[14px]">
        <div className="flex items-center gap-[10px]">
          <span className="font-semibold text-[18px] tracking-[-0.02em]">How to fix it</span>
          <span className="flex-1 h-px" style={{ background: 'var(--color-hairline)' }} />
        </div>
        <p className="text-[14.5px] text-muted mt-[6px]">A plain, copy-paste fix — or a prompt you can hand straight to your AI builder.</p>
      </div>

      {unlocked ? (
        <div className="flex flex-col gap-3">
          {unlock!.fixPrompt && (
            <div className="relative overflow-hidden bg-ink rounded-[12px] p-[22px]">
              <div aria-hidden className="absolute inset-0 bg-dots-dark" />
              <div className="relative">
                <div className="inline-flex items-center gap-[7px] bg-yellow text-ink font-semibold text-[12.5px] tracking-[0.04em] px-[11px] py-[5px] rounded-full">EASIEST — LET YOUR AI DO IT</div>
                <p className="text-white/80 text-[15.5px] leading-[1.55] mt-[14px] mb-3">Copy this and paste it into Lovable, Cursor, or whatever AI you build with.</p>
                <div className="bg-ink-tile border border-white/10 rounded-xl p-4 text-[15px] leading-[1.6] text-[#e6e5e2] whitespace-pre-wrap">{unlock!.fixPrompt}</div>
                <button onClick={() => copy(unlock!.fixPrompt!, 'prompt')} className="vg-press cursor-pointer mt-[14px] bg-yellow text-ink rounded-[10px] px-5 py-[13px] font-medium text-[15.5px]">{copied === 'prompt' ? 'Copied' : 'Copy prompt'}</button>
              </div>
            </div>
          )}
          {unlock!.fix && (
            <div className="vg-surface p-5">
              <div className="font-semibold text-[14px] mb-3">For developers: the exact fix</div>
              <div className="rounded-xl overflow-hidden border border-border">
                <div className="px-[14px] py-[9px] font-mono text-[12px] tracking-[0.04em]" style={{ background: SEV_TINT.PASSED.bg, color: SEV_TINT.PASSED.fg }}>THE FIX</div>
                <pre className="m-0 p-4 bg-bg-soft font-mono text-[13.5px] leading-[1.7] overflow-x-auto text-[#333] whitespace-pre-wrap">{unlock!.fix}</pre>
              </div>
              <button onClick={() => copy(unlock!.fix!, 'code')} className="vg-press cursor-pointer mt-[14px] bg-ink text-white rounded-[10px] px-[18px] py-3 font-medium text-[15px]">{copied === 'code' ? 'Copied' : 'Copy the fix'}</button>
            </div>
          )}
        </div>
      ) : paid || authLoading ? (
        /* Paid: the fix is being fetched — show a neutral placeholder, never the upsell. */
        <div className="overflow-hidden vg-surface px-6 py-9 flex flex-col items-center text-center gap-3">
          <span className="w-6 h-6 rounded-full vg-spin" style={{ border: '2px solid #E2E2DF', borderTopColor: '#0A0A0A' }} />
          <div className="text-muted text-[15px] font-semibold">Preparing your fix…</div>
        </div>
      ) : (
        /* Locked (free only): fix content is server-only. */
        <div className="overflow-hidden vg-surface">
          <div className="flex flex-col items-center text-center gap-[14px] px-6 py-9">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(243,197,0,.16)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" stroke="#8a6d00" strokeWidth="1.7" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="#8a6d00" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </span>
            <div>
              <h3 className="text-ink font-semibold text-[18px] tracking-[-0.01em]">Unlock the fix</h3>
              <p className="text-muted text-[15px] leading-[1.55] mt-[6px] max-w-[46ch] mx-auto">
                You’ll get the exact copy-paste fix and a ready-made AI prompt for this issue — plus every other fix and continuous monitoring.
              </p>
            </div>
            <button onClick={() => router.push('/billing')} className="vg-press cursor-pointer bg-ink text-white font-medium text-[16px] rounded-[10px] px-7 py-[13px]">Upgrade to unlock</button>
            <div className="flex items-center gap-4 text-faint text-[13px] font-mono mt-1">
              <span>Copy-paste fix</span>
              <span>AI prompt</span>
              <span>Re-scans</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="vg-press cursor-pointer inline-flex items-center gap-[6px] bg-none text-label font-semibold text-[15px] mb-5 hover:text-ink transition-colors">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Back to all issues
    </button>
  );
}

function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-card border border-border px-[11px] py-[5px] text-[13px] font-semibold text-muted ${mono ? 'font-mono text-[12.5px]' : ''}`}>
      {children}
    </span>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="vg-surface p-5">
      <div className="font-mono text-[11.5px] tracking-[0.12em] text-faint mb-3">{label}</div>
      {children}
    </div>
  );
}
