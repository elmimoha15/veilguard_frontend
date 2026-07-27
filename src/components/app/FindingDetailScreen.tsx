'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { SEV_META } from './data';
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
  const { profile } = useAuth();
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
  useEffect(() => {
    if (!paid || !scanId || !findingId || raw === 'loading' || raw === null) return;
    let cancelled = false;
    api.findingFix(scanId, findingId).then((res) => {
      if (!cancelled && res.ok) setUnlock({ fix: res.data.fix, fixPrompt: res.data.fixPrompt });
    });
    return () => { cancelled = true; };
  }, [scanId, findingId, raw, paid]);

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
  const tint = f.sev === 'CRITICAL' ? 'rgba(229,53,43,.12)' : f.sev === 'WARNING' ? 'rgba(242,133,31,.14)' : 'rgba(31,184,107,.14)';

  const copy = (text: string, which: 'code' | 'prompt') => {
    try { navigator.clipboard?.writeText(text); } catch { /* unavailable */ }
    setCopied(which);
    toast('Copied', '#1FB86B');
    setTimeout(() => setCopied(null), 1600);
  };

  const unlocked = !!(unlock && (unlock.fix || unlock.fixPrompt));

  return (
    <div className="vg-fade max-w-[840px]">
      <BackLink onClick={() => router.back()} />

      {DEV_FAKE_PAID && (
        <div className="mb-4 rounded-[10px] px-4 py-2 text-[12.5px] font-bold" style={{ background: '#ffe9a8', border: '1px solid #d9b64e', color: '#7a5b00' }}>
          ⚠ DEV: fake paid mode — fixes are unlocked via a dev-only server endpoint. The real paywall is unchanged.
        </div>
      )}

      {/* ── header: severity + meta + title + plain-english lead ── */}
      <div className="flex items-center gap-2 flex-wrap mb-[14px]">
        <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px] text-[12.5px] font-bold" style={{ background: tint, color: f.color }}>
          {meta.emoji} {meta.sevPlain}
        </span>
        <Chip>{f.cat}</Chip>
        {f.cwe && <Chip mono>{f.cwe}</Chip>}
      </div>

      <h1 className="font-extrabold text-[clamp(24px,3.4vw,32px)] tracking-[-0.02em] leading-[1.15]">{f.title}</h1>
      <p className="text-[15.5px] text-muted leading-[1.55] mt-2 max-w-[64ch]">{meta.sevHint}</p>

      {/* ── the risk + where ── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px] mt-6">
        <InfoCard label="WHY IT MATTERS" icon="😬">
          <p className="m-0 text-[15px] leading-[1.6] text-[#3b3a37]">{f.what}</p>
        </InfoCard>
        <InfoCard label="WHERE WE FOUND IT" icon="📍">
          <p className="m-0 text-[14px] leading-[1.6] text-[#3b3a37] font-mono break-words">{f.where || f.cat}</p>
          {f.evidence && (
            <pre className="m-0 mt-3 p-3 bg-bg-soft border border-border-2 rounded-lg font-mono text-[12px] leading-[1.6] text-faint overflow-x-auto whitespace-pre-wrap break-words">{f.evidence}</pre>
          )}
        </InfoCard>
      </div>

      {/* ── how to fix ── */}
      <div className="mt-8 mb-[14px]">
        <div className="flex items-center gap-[10px]">
          <span className="font-extrabold text-[20px] tracking-[-0.02em]">How to fix it</span>
          <span className="flex-1 h-px bg-border-2" />
        </div>
        <p className="text-[13.5px] text-muted mt-[6px]">A plain, copy-paste fix — or a prompt you can hand straight to your AI builder.</p>
      </div>

      {unlocked ? (
        <div className="flex flex-col gap-3">
          {unlock!.fixPrompt && (
            <div className="relative overflow-hidden bg-ink rounded-[18px] p-[22px]">
              <div aria-hidden className="absolute inset-0 bg-dots-dark" />
              <div className="relative">
                <div className="inline-flex items-center gap-[7px] bg-yellow text-ink font-bold text-[11.5px] tracking-[0.04em] px-[11px] py-[5px] rounded-full">✦ EASIEST — LET YOUR AI DO IT</div>
                <p className="text-white/80 text-[14.5px] leading-[1.55] mt-[14px] mb-3">Copy this and paste it into Lovable, Cursor, or whatever AI you build with.</p>
                <div className="bg-ink-tile border border-white/10 rounded-xl p-4 text-[14px] leading-[1.6] text-[#e6e5e2] whitespace-pre-wrap">{unlock!.fixPrompt}</div>
                <button onClick={() => copy(unlock!.fixPrompt!, 'prompt')} className="vg-press mt-[14px] bg-yellow text-ink rounded-[10px] px-5 py-[13px] font-bold text-[14.5px]">{copied === 'prompt' ? 'Copied ✓' : 'Copy prompt'}</button>
              </div>
            </div>
          )}
          {unlock!.fix && (
            <div className="bg-card border border-border-2 rounded-2xl p-5">
              <div className="font-bold text-[15px] mb-3">For developers: the exact fix</div>
              <pre className="m-0 p-4 bg-ink-tile rounded-xl font-mono text-[12.5px] leading-[1.7] overflow-x-auto text-[#d8d8d4] whitespace-pre-wrap">{unlock!.fix}</pre>
              <button onClick={() => copy(unlock!.fix!, 'code')} className="vg-press mt-[14px] bg-ink text-white rounded-[10px] px-[18px] py-3 font-bold text-[14px]">{copied === 'code' ? 'Copied ✓' : 'Copy the fix'}</button>
            </div>
          )}
        </div>
      ) : (
        /* Locked (default / production): fix content is server-only. */
        <div className="relative overflow-hidden rounded-[20px] bg-ink">
          <div aria-hidden className="absolute inset-0 bg-dots-dark" />
          <div className="relative flex flex-col items-center text-center gap-[14px] px-6 py-9">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px]" style={{ background: 'rgba(243,197,0,.16)' }}>🔒</span>
            <div>
              <h3 className="text-white font-extrabold text-[19px] tracking-[-0.01em]">Unlock the fix</h3>
              <p className="text-white/60 text-[14px] leading-[1.55] mt-[6px] max-w-[46ch] mx-auto">
                You’ll get the exact copy-paste fix and a ready-made AI prompt for this issue — plus every other fix and continuous monitoring.
              </p>
            </div>
            <button onClick={() => router.push('/billing')} className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-7 py-[13px]">Upgrade to unlock →</button>
            <div className="flex items-center gap-4 text-white/45 text-[12px] font-mono mt-1">
              <span>✓ Copy-paste fix</span>
              <span>✓ AI prompt</span>
              <span>✓ Re-scans</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="vg-press bg-none text-label font-semibold text-[14px] mb-5 hover:text-ink transition-colors">← Back to all issues</button>;
}

function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-card border border-border-2 px-[11px] py-[5px] text-[12px] font-semibold text-muted ${mono ? 'font-mono text-[11.5px]' : ''}`}>
      {children}
    </span>
  );
}

function InfoCard({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border-2 rounded-2xl p-5">
      <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] text-faint mb-3">
        <span className="text-[14px]">{icon}</span>{label}
      </div>
      {children}
    </div>
  );
}
