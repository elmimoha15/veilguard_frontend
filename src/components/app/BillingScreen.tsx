'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api, type Txn } from '@/lib/api';
import { Card, SectionLabel, PageHeading } from './primitives';

/**
 * Billing — real Polar checkout + self-serve subscription management. The plan
 * itself is granted/revoked ONLY by the verified Polar webhook (never here);
 * this screen starts checkout, reads Polar (history/invoices) and asks Polar to
 * cancel/resume — then reflects the state the server reports. Card changes go to
 * Polar's hosted portal (PCI — can't be collected in-app).
 */
const FREE_FEATURES = [
  'Scan your live site for security holes',
  'Full A–F security grade, every problem in plain English',
  'One sample fix unlocked',
];
const GUARD_FEATURES = [
  'Everything in Free',
  'Unlock every fix — exact code + a prompt for your AI',
  'Find hidden secrets, leaked keys & SQL bugs in your code (connect GitHub)',
  'No GitHub? Upload your code instead',
  'We keep watching — alerts the moment a new hole appears',
];

// Polar billingReason → human label.
const REASON_LABEL: Record<string, string> = {
  subscription_create: 'Guard subscription',
  subscription_cycle: 'Monthly renewal',
  subscription_update: 'Plan change',
  purchase: 'Purchase',
};

function Check() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[2px]"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function fmtDate(iso?: string): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return ''; }
}

function fmtMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export default function BillingScreen() {
  const { toast } = useApp();
  const { profile, refreshProfile } = useAuth();
  const params = useSearchParams();
  const next = params.get('next') ?? undefined; // where to return after payment
  const plan = profile?.plan ?? 'free';
  const isGuard = plan === 'guard';
  const canceling = !!profile?.cancelAtPeriodEnd;

  const [busy, setBusy] = useState<'checkout' | 'portal' | 'cancel' | 'resume' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [txns, setTxns] = useState<Txn[] | null>(null); // null = loading, [] = none
  const [invoiceBusy, setInvoiceBusy] = useState<string | null>(null);

  const startCheckout = async () => {
    setBusy('checkout');
    const res = await api.createCheckout(next);
    if (res.ok && res.data.url) { window.location.assign(res.data.url); return; } // keep busy through redirect
    setBusy(null);
    toast(res.data.error || 'Could not start checkout — try again', '#E5484D');
  };

  const openPortal = async () => {
    setBusy('portal');
    const res = await api.billingPortal();
    if (res.ok && res.data.url) { window.location.assign(res.data.url); return; }
    setBusy(null);
    toast(res.data.error || 'Could not open the billing portal', '#E5484D');
  };

  // Load billing history for Guard subscribers (only fetched when Guard; the
  // history section is gated on isGuard, so free users never see it).
  useEffect(() => {
    if (!isGuard) return;
    let cancelled = false;
    api.billingTransactions().then((res) => {
      if (cancelled) return;
      setTxns(res.ok && res.data.transactions ? res.data.transactions : []);
    });
    return () => { cancelled = true; };
  }, [isGuard]);

  // Cancel/resume flip cancelAtPeriodEnd on Polar; the webhook then persists it.
  // Poll /me a few times so the status line updates once that lands.
  const pollUntil = useCallback(async (want: boolean) => {
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const p = await refreshProfile();
      if (!!p?.cancelAtPeriodEnd === want) return;
    }
  }, [refreshProfile]);

  // Cancel plan / downgrade to Free are the SAME operation: schedule the Polar
  // subscription to cancel at period end. Access continues until then, when the
  // webhook flips the plan back to free. `msg` tailors the success toast.
  const scheduleCancel = async (msg: string) => {
    setBusy('cancel');
    setConfirmOpen(false);
    setDowngradeOpen(false);
    const res = await api.billingCancel();
    if (!res.ok) { setBusy(null); toast(res.data.error || 'Could not update your plan — try again', '#E5484D'); return; }
    await pollUntil(true);
    setBusy(null);
    toast(msg, '#1F9D57');
  };
  const doCancel = () => scheduleCancel('Your plan will end at the period’s close');
  const doDowngrade = () => scheduleCancel('You’ll move to Free at the end of your billing period');

  const doResume = async () => {
    setBusy('resume');
    const res = await api.billingReactivate();
    if (!res.ok) { setBusy(null); toast(res.data.error || 'Could not resume — try again', '#E5484D'); return; }
    await pollUntil(false);
    setBusy(null);
    toast('Welcome back — your plan will renew as usual', '#1F9D57');
  };

  const downloadInvoice = async (orderId: string) => {
    setInvoiceBusy(orderId);
    const res = await api.billingInvoice(orderId);
    setInvoiceBusy(null);
    if (res.ok && res.data.url) { window.open(res.data.url, '_blank', 'noopener'); return; }
    if (res.status === 202 || res.data.pending) { toast('Invoice is being generated — try again in a moment', '#8a6d00'); return; }
    toast(res.data.error || 'Could not open invoice', '#E5484D');
  };

  // Status/renewal line for the current-plan hero.
  const statusLine = (() => {
    if (!isGuard) return 'URL scans only · upgrade for code scans, connections, monitoring & all fixes';
    if (canceling) return `Cancels on ${fmtDate(profile?.currentPeriodEnd)} — you keep full access until then`;
    if (profile?.status === 'past_due') return 'Payment failed — update your card to keep Guard';
    if (profile?.currentPeriodEnd) return `Renews ${fmtDate(profile.currentPeriodEnd)} · full access to every feature`;
    return 'Full access — deep scans, connections, upload, monitoring, all fixes';
  })();

  return (
    <div className="vg-fade">
      <PageHeading title="Billing" />

      {/* current plan (server truth) — a standard light card, matching the app */}
      <Card className="p-6 mb-4">
        <div className="flex flex-wrap gap-5 items-start justify-between">
          <div className="min-w-[200px]">
            <SectionLabel>Current plan</SectionLabel>
            <div className="text-[20px] font-semibold mt-[7px]">{isGuard ? 'Guard' : 'Free'}</div>
            <div className="text-[14px] text-muted mt-1 max-w-[52ch]">{statusLine}</div>
            {profile?.usage && profile?.caps && (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted tnum">
                <span>{profile.usage.scansThisMonth}/{profile.caps.maxScansPerMonth} scans this month</span>
              </div>
            )}
          </div>
          {isGuard && (
            <div className="flex flex-col gap-[9px] shrink-0">
              <button onClick={openPortal} disabled={!!busy} style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }} className="vg-press cursor-pointer rounded-[10px] px-[16px] py-[10px] font-medium text-[14px] disabled:opacity-70">
                {busy === 'portal' ? 'Opening…' : 'Update payment method'}
              </button>
              {canceling ? (
                <button onClick={doResume} disabled={!!busy} className="vg-press cursor-pointer rounded-[10px] px-[16px] py-[10px] font-medium text-[14px] bg-ink text-white disabled:opacity-70">
                  {busy === 'resume' ? 'Resuming…' : 'Resume plan'}
                </button>
              ) : (
                <button onClick={() => setConfirmOpen(true)} disabled={!!busy} style={{ background: 'rgba(229,72,77,.12)', color: '#C23B3F' }} className="vg-press cursor-pointer rounded-[10px] px-[16px] py-[10px] font-medium text-[14px] disabled:opacity-70">
                  {busy === 'cancel' ? 'Canceling…' : 'Cancel plan'}
                </button>
              )}
            </div>
          )}
        </div>
        {isGuard && canceling && (
          <div className="mt-4 text-[13.5px] leading-[1.5]" style={{ color: '#8a6d00' }}>
            Scheduled to cancel — resume anytime before {fmtDate(profile?.currentPeriodEnd)} to keep Guard without interruption.
          </div>
        )}
      </Card>

      {/* plan cards — same hairline surface; the paid tier gets a thin accent, not a heavy border */}
      <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-4">
        {/* Free */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <SectionLabel>Free</SectionLabel>
            {!isGuard && <CurrentPill />}
          </div>
          <div className="font-semibold text-[24px] my-2 tnum">$0</div>
          <ul className="flex flex-col gap-[9px] text-[14px] leading-[1.45] flex-1 mb-4">
            {FREE_FEATURES.map((f) => <li key={f} className="flex gap-[9px]"><Check /><span>{f}</span></li>)}
          </ul>
          {!isGuard ? (
            <div className="text-[13px] text-muted text-center py-[9px]">Your current plan</div>
          ) : canceling ? (
            <div className="text-[13px] text-center py-[9px]" style={{ color: '#8a6d00' }}>Switches to Free on {fmtDate(profile?.currentPeriodEnd) || 'period end'}</div>
          ) : (
            <button onClick={() => setDowngradeOpen(true)} disabled={!!busy} className="vg-press cursor-pointer w-full rounded-[10px] py-[11px] font-medium text-[14.5px] bg-white border border-border text-muted disabled:opacity-70">
              Downgrade to Free
            </button>
          )}
        </Card>

        {/* Guard */}
        <Card className="p-6 flex flex-col relative overflow-hidden">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-yellow" />
          <div className="flex items-center justify-between">
            <SectionLabel>Guard</SectionLabel>
            {isGuard && <CurrentPill />}
          </div>
          <div className="font-semibold text-[24px] my-2 tnum">$19<span className="text-[14px] text-label font-medium">/mo</span></div>
          <ul className="flex flex-col gap-[9px] text-[14px] leading-[1.45] flex-1 mb-4">
            {GUARD_FEATURES.map((f) => <li key={f} className="flex gap-[9px]"><Check /><span>{f}</span></li>)}
          </ul>
          {isGuard ? (
            <div className="text-[13px] text-muted text-center py-[9px]">Your current plan</div>
          ) : (
            <button onClick={startCheckout} disabled={!!busy} className="vg-press cursor-pointer w-full rounded-[10px] py-[11px] font-medium text-[14.5px] bg-ink text-white disabled:opacity-70">
              {busy === 'checkout' ? 'Starting…' : 'Upgrade to Guard'}
            </button>
          )}
        </Card>
      </div>

      {/* billing history (Guard only) */}
      {isGuard && (
        <Card className="p-5 mt-4">
          <SectionLabel>Billing history</SectionLabel>
          <div className="mb-4" />
          {txns === null ? (
            <div className="vg-skel h-[120px]" />
          ) : txns.length === 0 ? (
            <div className="text-[13.5px] text-faint py-4">No transactions yet.</div>
          ) : (
            <div className="flex flex-col">
              {txns.map((t, i) => (
                <div key={t.id} className="vg-row flex items-center gap-3 py-[13px] px-2 -mx-2 rounded-[8px]" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{REASON_LABEL[t.reason] ?? 'Charge'}</div>
                    <div className="font-mono text-[12px] text-faint tnum mt-[2px]">{fmtDate(t.date)}{t.invoiceNumber ? ` · ${t.invoiceNumber}` : ''}</div>
                  </div>
                  <div className="font-mono text-[13.5px] tnum shrink-0">{fmtMoney(t.amount, t.currency)}</div>
                  <StatusChip status={t.status} paid={t.paid} />
                  <div className="shrink-0 w-[86px] text-right">
                    {t.paid ? (
                      <button onClick={() => downloadInvoice(t.id)} disabled={invoiceBusy === t.id} className="vg-press cursor-pointer text-[13px] font-semibold text-ink hover:underline disabled:opacity-60">
                        {invoiceBusy === t.id ? '…' : 'Invoice'}
                      </button>
                    ) : (
                      <span className="text-[13px] text-faint">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <p className="text-[13px] text-faint mt-4 max-w-[68ch]">
        Payments are handled securely by Polar (our merchant of record). Card details are updated on Polar’s
        secure portal. When you cancel you keep full access until your period ends — no partial-month refunds.
      </p>

      {/* cancel confirmation */}
      {confirmOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => busy !== 'cancel' && setConfirmOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
            <h2 className="font-semibold text-[19px] tracking-[-0.02em]">Cancel your Guard plan?</h2>
            <p className="text-[14.5px] text-muted mt-2 leading-[1.55]">
              You’ll keep Guard until <span className="text-ink font-medium">{fmtDate(profile?.currentPeriodEnd) || 'the end of your billing period'}</span> — no further charges.
              You can resume anytime before then.
            </p>
            <div className="flex gap-[10px] mt-6">
              <button onClick={() => setConfirmOpen(false)} className="vg-press cursor-pointer flex-1 bg-card border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted">Keep Guard</button>
              <button onClick={doCancel} className="vg-press cursor-pointer flex-1 rounded-[10px] py-[12px] font-medium text-[15px] text-white" style={{ background: '#C23B3F' }}>Cancel plan</button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* downgrade-to-free confirmation — same cancel-at-period-end operation, framed as a plan switch */}
      {downgradeOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => busy !== 'cancel' && setDowngradeOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
            <h2 className="font-semibold text-[19px] tracking-[-0.02em]">Move back to Free?</h2>
            <p className="text-[14.5px] text-muted mt-2 leading-[1.55]">
              You&apos;ll lose your Guard features: <span className="text-ink font-medium">monitoring stops, your fixes re-lock, and repo &amp; upload scanning are disabled.</span>
            </p>
            <p className="text-[14.5px] text-muted mt-2 leading-[1.55]">
              You keep full Guard access until <span className="text-ink font-medium">{fmtDate(profile?.currentPeriodEnd) || 'the end of your billing period'}</span>, then move to Free — no immediate cutoff, no partial-month refund. You can resume anytime before then.
            </p>
            <div className="flex gap-[10px] mt-6">
              <button onClick={() => setDowngradeOpen(false)} className="vg-press cursor-pointer flex-1 bg-card border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted">Stay on Guard</button>
              <button onClick={doDowngrade} className="vg-press cursor-pointer flex-1 rounded-[10px] py-[12px] font-medium text-[15px] text-ink" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>Downgrade to Free</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function CurrentPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-bg-soft border border-border px-[10px] py-[3px] text-[12px] font-semibold text-muted">Current</span>
  );
}

function StatusChip({ status, paid }: { status: string; paid: boolean }) {
  const ok = paid || status === 'paid';
  const refunded = status === 'refunded' || status === 'partially_refunded';
  const label = refunded ? 'Refunded' : ok ? 'Paid' : status === 'pending' ? 'Pending' : status;
  const color = refunded ? { bg: 'rgba(138,109,0,.12)', fg: '#8a6d00' } : ok ? { bg: 'rgba(31,157,87,.12)', fg: '#1F9D57' } : { bg: 'var(--color-bg-soft)', fg: 'var(--color-muted)' };
  return (
    <span className="hidden min-[520px]:inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-semibold shrink-0" style={{ background: color.bg, color: color.fg }}>
      {label}
    </span>
  );
}
