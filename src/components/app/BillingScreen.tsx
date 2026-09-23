'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth } from '@/lib/auth';
import { api, type Txn } from '@/lib/api';
import { Card, SectionLabel, PageHeading, PillButton } from './primitives';
import ScanUsage from './ScanUsage';
import ActionButton from '@/components/ui/ActionButton';

const BoltIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>;
const CardIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="6" width="18" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.7" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" /></svg>;
const XIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;

/**
 * Billing, real Polar checkout + self-serve subscription management. The plan is
 * granted/revoked ONLY by the verified Polar webhook (never here); this screen
 * starts checkout, reads Polar history/invoices, and asks Polar to cancel/resume.
 * Presentation follows the handoff (verbatim plan copy).
 */
const FREE_FEATURES = ['Unlimited URL scans', 'Full A, F grade', 'Every issue in plain English'];
const GUARD_FEATURES = [
  'Up to 30 scans a month',
  'Every fix, copy-paste ready',
  'Auto re-scan on deploy',
  'Email alerts when something breaks',
  'Deep Supabase / Firebase audit',
];

const REASON_LABEL: Record<string, string> = {
  subscription_create: 'Guard, monthly',
  subscription_cycle: 'Guard, monthly',
  subscription_update: 'Plan change',
  purchase: 'Fix Pack, one-time',
};

function Check() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[3px]"><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function fmtDate(iso?: string): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}
function fmtMoney(cents: number, currency: string): string {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100); }
  catch { return `$${(cents / 100).toFixed(2)}`; }
}

export default function BillingScreen() {
  const { toast } = useApp();
  const { profile, refreshProfile } = useAuth();
  const params = useSearchParams();
  const next = params.get('next') ?? undefined;
  const plan = profile?.plan ?? 'free';
  const isGuard = plan === 'guard';
  const canceling = !!profile?.cancelAtPeriodEnd;

  const [busy, setBusy] = useState<'checkout' | 'portal' | 'cancel' | 'resume' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [txns, setTxns] = useState<Txn[] | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState<string | null>(null);

  const startCheckout = async () => {
    setBusy('checkout');
    const res = await api.createCheckout(next);
    if (res.ok && res.data.url) { window.location.assign(res.data.url); return; }
    setBusy(null);
    toast(res.data.error || 'Could not start checkout, try again', '#DC2626');
  };
  const openPortal = async () => {
    setBusy('portal');
    const res = await api.billingPortal();
    if (res.ok && res.data.url) { window.location.assign(res.data.url); return; }
    setBusy(null);
    toast(res.data.error || 'Could not open the billing portal', '#DC2626');
  };

  useEffect(() => {
    if (!isGuard) return;
    let cancelled = false;
    api.billingTransactions().then((res) => { if (!cancelled) setTxns(res.ok && res.data.transactions ? res.data.transactions : []); });
    return () => { cancelled = true; };
  }, [isGuard]);

  const pollUntil = useCallback(async (want: boolean) => {
    for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 1500)); const p = await refreshProfile(); if (!!p?.cancelAtPeriodEnd === want) return; }
  }, [refreshProfile]);

  const scheduleCancel = async (msg: string) => {
    setBusy('cancel'); setConfirmOpen(false); setDowngradeOpen(false);
    const res = await api.billingCancel();
    if (!res.ok) { setBusy(null); toast(res.data.error || 'Could not update your plan, try again', '#DC2626'); return; }
    await pollUntil(true); setBusy(null); toast(msg, '#16A34A');
  };
  const doCancel = () => scheduleCancel(`Plan cancelled, access until ${fmtDate(profile?.currentPeriodEnd) || 'period end'}`);
  const doDowngrade = () => scheduleCancel('You’ll move to Free at the end of your billing period');

  const doResume = async () => {
    setBusy('resume');
    const res = await api.billingReactivate();
    if (!res.ok) { setBusy(null); toast(res.data.error || 'Could not resume, try again', '#DC2626'); return; }
    await pollUntil(false); setBusy(null); toast('Welcome back, your plan will renew as usual', '#16A34A');
  };

  const downloadInvoice = async (orderId: string) => {
    setInvoiceBusy(orderId);
    const res = await api.billingInvoice(orderId);
    setInvoiceBusy(null);
    if (res.ok && res.data.url) { window.open(res.data.url, '_blank', 'noopener'); return; }
    if (res.status === 202 || res.data.pending) { toast('Invoice is being generated, try again in a moment', '#737373'); return; }
    toast(res.data.error || 'Could not open invoice', '#DC2626');
  };

  const renewLine = canceling
    ? `Cancels ${fmtDate(profile?.currentPeriodEnd)}, full access until then`
    : profile?.status === 'past_due'
      ? 'Payment failed, update your card to keep Guard'
      : profile?.currentPeriodEnd ? `Renews ${fmtDate(profile.currentPeriodEnd)}` : '';

  return (
    <div className="vg-fade">
      <PageHeading title="Billing" subtitle="Your plan, payment method and invoices." />

      {/* current plan */}
      <Card flat className="pb-7 border-b border-border">
        <div className="flex flex-wrap gap-5 items-start justify-between">
          <div className="min-w-[220px]">
            <SectionLabel>Current plan</SectionLabel>
            <div className="flex items-center gap-3 mt-[7px]">
              <span className="text-[20px] font-medium">{isGuard ? 'Guard' : 'Free'}</span>
              <span className="rounded-full px-[10px] py-[3px] text-[12.5px] font-medium tnum" style={{ background: '#F5F5F5', color: '#0A0A0A' }}>{isGuard ? '$19/mo' : '$0'}</span>
            </div>
            <p className="text-[14px] mt-[10px] max-w-[52ch]" style={{ color: '#737373' }}>
              {isGuard ? 'Up to 30 scans a month, every fix, auto re-scan on deploy, alerts.' : 'Unlimited URL scans, upgrade for code scans, connections, monitoring and every fix.'}
            </p>
            {renewLine && <div className="font-mono text-[12px] mt-3" style={{ color: '#A3A3A3' }}>{renewLine}</div>}
            <ScanUsage className="mt-5 max-w-[320px]" />
          </div>
          {isGuard && (
            <div className="flex flex-col gap-[9px] shrink-0">
              <PillButton variant="outline" onClick={openPortal} disabled={!!busy} icon={<CardIcon />} tooltip="Secure Polar portal">{busy === 'portal' ? 'Opening…' : 'Update payment method'}</PillButton>
              {canceling ? (
                <PillButton onClick={doResume} disabled={!!busy} icon={<BoltIcon />} tooltip="Keep Guard">{busy === 'resume' ? 'Resuming…' : 'Resume plan'}</PillButton>
              ) : (
                <PillButton variant="danger" onClick={() => setConfirmOpen(true)} disabled={!!busy} icon={<XIcon />} tooltip="Cancels at period end">{busy === 'cancel' ? 'Canceling…' : 'Cancel plan'}</PillButton>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* plan grid */}
      <div className="grid grid-cols-1 min-[560px]:grid-cols-2 divide-y min-[560px]:divide-y-0 min-[560px]:divide-x divide-border">
        {/* Free */}
        <Card flat className="py-7 min-[560px]:pr-8 flex flex-col">
          <SectionLabel>Free</SectionLabel>
          <div className="font-medium text-[32px] my-2 tnum">$0</div>
          <ul className="flex flex-col gap-[10px] text-[13.5px] leading-[1.45] flex-1 mb-4">
            {FREE_FEATURES.map((f) => <li key={f} className="flex gap-[10px]"><Check /><span>{f}</span></li>)}
          </ul>
          {!isGuard ? (
            <div className="text-[13px] text-center py-[9px]" style={{ color: '#A3A3A3' }}>Your current plan</div>
          ) : canceling ? (
            <div className="text-[13px] text-center py-[9px]" style={{ color: '#737373' }}>Switches to Free on {fmtDate(profile?.currentPeriodEnd) || 'period end'}</div>
          ) : (
            <PillButton variant="outline" onClick={() => setDowngradeOpen(true)} disabled={!!busy} className="w-full h-[42px]">Downgrade to Free</PillButton>
          )}
        </Card>

        {/* Guard (current) */}
        <div className="py-7 min-[560px]:pl-8 flex flex-col">
          <div className="flex items-center justify-between">
            <SectionLabel>Guard</SectionLabel>
            {isGuard && <span className="rounded-full px-[10px] py-[3px] text-[12px] font-medium" style={{ background: '#FFE24D', color: '#0A0A0A' }}>Current</span>}
          </div>
          <div className="font-medium text-[32px] my-2 tnum">$19<span className="text-[14px] font-medium" style={{ color: '#A3A3A3' }}>/mo</span></div>
          <ul className="flex flex-col gap-[10px] text-[13.5px] leading-[1.45] flex-1 mb-4">
            {GUARD_FEATURES.map((f) => <li key={f} className="flex gap-[10px]"><Check /><span>{f}</span></li>)}
          </ul>
          {isGuard ? (
            <div className="text-[13px] text-center py-[9px]" style={{ color: '#A3A3A3' }}>Your current plan</div>
          ) : (
            <ActionButton onClick={startCheckout} disabled={!!busy} icon={<BoltIcon />} tooltip="$19/mo · cancel anytime" className="w-full h-[42px]">{busy === 'checkout' ? 'Starting…' : 'Upgrade to Guard'}</ActionButton>
          )}
        </div>
      </div>

      {/* invoices */}
      {isGuard && (
        <Card flat className="py-7 border-t border-border">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-[16px] font-medium">Invoices</h2>
            <span className="text-[13px]" style={{ color: '#A3A3A3' }}>Handled by Polar, our merchant of record.</span>
          </div>
          <div className="mt-3">
            {txns === null ? (
              <div className="vg-skel h-[100px]" />
            ) : txns.length === 0 ? (
              <div className="text-[13.5px] py-4" style={{ color: '#A3A3A3' }}>No transactions yet.</div>
            ) : (
              txns.map((t, i) => (
                <div key={t.id} className="flex items-center gap-4 py-[13px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                  <span className="font-mono text-[13px] w-[96px] shrink-0 tnum" style={{ color: '#737373' }}>{fmtDate(t.date)}</span>
                  <span className="flex-1 text-[14px] font-medium truncate">{REASON_LABEL[t.reason] ?? 'Charge'}</span>
                  <span className="font-mono text-[13.5px] tnum shrink-0">{fmtMoney(t.amount, t.currency)}</span>
                  {t.paid ? (
                    <button onClick={() => downloadInvoice(t.id)} disabled={invoiceBusy === t.id} className="shrink-0 inline-flex items-center rounded-full px-[10px] py-[4px] text-[12px] font-medium cursor-pointer" style={{ background: '#F0FDF4', color: '#15803D' }}>
                      {invoiceBusy === t.id ? '…' : 'Paid'}
                    </button>
                  ) : (
                    <span className="shrink-0 text-[12px]" style={{ color: '#A3A3A3' }}>{t.status}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* cancel modal, handoff copy */}
      {confirmOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => busy !== 'cancel' && setConfirmOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div role="dialog" aria-label="Cancel Guard" onClick={(e) => e.stopPropagation()} className="w-full max-w-[430px] bg-card rounded-[16px] p-7 vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
            <h2 className="font-medium text-[19px] tracking-[-0.02em]">Cancel Guard?</h2>
            <p className="text-[14.5px] mt-2 leading-[1.55]" style={{ color: '#737373' }}>
              Monitoring stops on {fmtDate(profile?.currentPeriodEnd) || 'your billing period’s end'}. You keep every fix you’ve already got, and we’ll stop watching your deploys.
            </p>
            <div className="flex gap-[10px] mt-6">
              <PillButton variant="cancel" onClick={() => setConfirmOpen(false)} className="flex-1 h-[44px]">Keep Guard</PillButton>
              <ActionButton variant="danger-solid" onClick={doCancel} icon={<XIcon />} className="flex-1 h-[44px]">Cancel plan</ActionButton>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* downgrade modal */}
      {downgradeOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => busy !== 'cancel' && setDowngradeOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div role="dialog" aria-label="Downgrade to Free" onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[16px] p-7 vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
            <h2 className="font-medium text-[19px] tracking-[-0.02em]">Move back to Free?</h2>
            <p className="text-[14.5px] mt-2 leading-[1.55]" style={{ color: '#737373' }}>You’ll lose your Guard features: <span className="text-ink font-medium">monitoring stops, your fixes re-lock, and repo &amp; upload scanning are disabled.</span> You keep full access until {fmtDate(profile?.currentPeriodEnd) || 'the end of your billing period'}.</p>
            <div className="flex gap-[10px] mt-6">
              <PillButton variant="cancel" onClick={() => setDowngradeOpen(false)} className="flex-1 h-[44px]">Stay on Guard</PillButton>
              <ActionButton onClick={doDowngrade} className="flex-1 h-[44px]">Downgrade to Free</ActionButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
