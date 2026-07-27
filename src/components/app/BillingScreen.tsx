'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

/**
 * Billing. Real checkout is Polar (Slice 6) — not wired yet. For testing, a
 * FAKE upgrade sets the plan server-side (backend guarded by FAKE_BILLING) so the
 * whole dashboard can be exercised in both free and paid states. No fabricated
 * invoices — only the user's ACTUAL plan is shown.
 */
const PLANS = [
  { key: 'free', name: 'FREE', price: '$0', per: '', border: '#E4E3DE', blurb: 'URL scans only. Fixes, connections, deep scans & monitoring locked.' },
  { key: 'guard', name: 'GUARD', price: '$19', per: '/mo', border: '#F3C500', blurb: 'Everything: deep scans, connections, folder upload, monitoring, every fix.' },
  { key: 'fixpack', name: 'FIX PACK', price: '$19', per: ' once', border: '#E4E3DE', blurb: 'One-time full access for a single app — all fixes unlocked.' },
] as const;

const PLAN_LABEL: Record<string, string> = { free: 'Free', guard: 'Guard', fixpack: 'Fix Pack' };

export default function BillingScreen() {
  const { toast } = useApp();
  const { profile, refreshProfile } = useAuth();
  const plan = profile?.plan ?? 'free';
  const [pending, setPending] = useState<string | null>(null); // plan awaiting confirm
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    // Polar-ready: checkout returns { mode:'fake' } today, or { mode:'polar', url }
    // once real billing is wired (then we'd redirect instead of confirming here).
    const co = await api.billingCheckout(pending);
    if (co.ok && co.data.mode === 'polar' && co.data.url) { window.location.assign(co.data.url); return; }
    const res = await api.billingConfirm(pending);
    setBusy(false);
    if (!res.ok) {
      toast(res.data.error || 'Could not update plan', '#E5352B');
      setPending(null);
      return;
    }
    await refreshProfile();
    toast(pending === 'free' ? 'Switched to Free' : `Upgraded to ${PLAN_LABEL[pending]} 🎉`, '#1FB86B');
    setPending(null);
  };

  return (
    <div className="vg-fade max-w-[820px]">
      <h1 className="font-extrabold text-[28px] tracking-[-0.02em] mb-5">Billing</h1>

      <div className="mb-4 rounded-[12px] px-4 py-3 text-[13.5px] font-semibold" style={{ background: '#FFF7D6', border: '1px solid #E7CE63', color: '#7a5b00' }}>
        🧪 Test billing — switching plans here is instant and free (no card). Real Polar checkout arrives later.
      </div>

      {/* current plan (real) */}
      <div className="bg-ink rounded-[20px] p-[26px] flex flex-wrap gap-5 items-center mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="font-mono text-[12px] tracking-[0.12em] text-yellow">CURRENT PLAN</div>
          <div className="font-extrabold text-[26px] text-white mt-[6px]">{PLAN_LABEL[plan] ?? 'Free'}</div>
          <div className="text-[13.5px] text-white/60 mt-1">
            {plan === 'free' ? 'URL scans only · upgrade for code scans, connections, monitoring & fixes' : 'Full access — deep scans, connections, upload, monitoring, all fixes'}
          </div>
        </div>
      </div>

      {/* plan cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
        {PLANS.map((p) => {
          const current = p.key === plan;
          const label = p.key === 'free' ? 'Downgrade to Free' : plan === 'free' ? 'Upgrade' : 'Switch to this';
          return (
            <div key={p.key} className="bg-card rounded-2xl p-5 flex flex-col" style={{ border: `2px solid ${current ? '#F3C500' : p.border}` }}>
              <div className="font-mono text-[11px] tracking-[0.1em] text-label">{p.name}</div>
              <div className="font-extrabold text-[30px] my-2">{p.price}<span className="text-[14px] text-label font-medium">{p.per}</span></div>
              <p className="text-[13px] text-muted leading-[1.5] flex-1 mb-3">{p.blurb}</p>
              {current ? (
                <div className="w-full rounded-[10px] py-[11px] font-bold text-[13.5px] text-center bg-bg-soft text-muted">Current plan</div>
              ) : (
                <button onClick={() => setPending(p.key)} className="vg-press w-full rounded-[10px] py-[11px] font-bold text-[13.5px] bg-ink text-white">
                  {label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {pending && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !busy && setPending(null)} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(30,29,27,.5)', backdropFilter: 'blur(3px)' }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] bg-card rounded-[20px] p-7 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
            <h2 className="font-extrabold text-[20px] tracking-[-0.02em] mb-[6px]">{pending === 'free' ? 'Switch to Free?' : `Upgrade to ${PLAN_LABEL[pending]}?`}</h2>
            <p className="text-[14px] text-muted mb-5">
              {pending === 'free'
                ? 'You’ll go back to URL-only scans; code scans, connections, monitoring and fixes will re-lock.'
                : 'This is a test checkout — no card is charged. You’ll immediately unlock deep scans, connections, folder upload, monitoring and every fix.'}
            </p>
            <div className="flex gap-[10px]">
              <button onClick={() => setPending(null)} disabled={busy} className="vg-press flex-1 bg-card border border-border-2 rounded-[11px] py-[12px] font-bold text-[14px] text-muted disabled:opacity-60">Cancel</button>
              <button onClick={confirm} disabled={busy} className="vg-press flex-1 bg-yellow text-ink rounded-[11px] py-[12px] font-bold text-[14px] disabled:opacity-70">{busy ? 'Working…' : pending === 'free' ? 'Confirm' : 'Confirm (test)'}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
