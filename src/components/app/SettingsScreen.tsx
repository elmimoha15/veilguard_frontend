'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid, getLastProvider } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import { SUPPORT_MAILTO } from '@/content/site';
import { api } from '@/lib/api';
import { saveNotifications } from '@/lib/scans';
import { Toggle } from './ui';
import { PageHeading, Card, PillButton } from './primitives';
import ActionButton from '@/components/ui/ActionButton';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import FullScreenLoader from '@/components/auth/FullScreenLoader';

const TrashIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const LinkIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DownloadIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const LogoutIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/** Handoff's three toggles, mapped to the real persisted notif keys. */
type NotifKey = 'email' | 'critical' | 'deploy' | 'summary';
const TOGGLE_ROWS: { key: NotifKey; label: string }[] = [
  { key: 'critical', label: 'Email me when a new critical issue appears' },
  { key: 'summary', label: 'Email me a weekly summary' },
  { key: 'deploy', label: 'Email me when a scan finishes' },
];
const DEFAULT_NOTIF = { email: true, critical: true, deploy: false, summary: true };

type Provider = 'github' | 'supabase';
const PROVIDERS: { key: Provider; name: string; logo: BrandLogoName; hint: string }[] = [
  { key: 'github', name: 'GitHub', logo: 'github', hint: 'Not connected' },
  { key: 'supabase', name: 'Supabase', logo: 'supabase', hint: 'Not connected' },
];

function CardTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-1">
      <div className="text-[15px] font-medium">{children}</div>
      {sub && <p className="text-[12.5px] mt-[2px]" style={{ color: '#A3A3A3' }}>{sub}</p>}
    </div>
  );
}
function Row({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return <div className="flex items-center justify-between gap-4 py-[16px]" style={{ borderTop: first ? undefined : '1px solid #F4F4F4' }}>{children}</div>;
}

export default function SettingsScreen() {
  const { toast } = useApp();
  const { user, profile, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);

  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({ ...DEFAULT_NOTIF, ...(profile?.notifications ?? {}) });
  useEffect(() => { if (profile?.notifications) setNotif((n) => ({ ...n, ...profile.notifications })); }, [profile?.notifications]);

  const toggleNotif = async (key: NotifKey) => {
    if (!user) return;
    const prev = notif;
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    try { await saveNotifications(user.uid, next); }
    catch { setNotif(prev); toast('Could not save your preference, try again', '#DC2626'); }
  };

  const downloadAccountReport = async () => {
    setReportBusy(true);
    const r = await api.downloadAccountReport();
    setReportBusy(false);
    if (!r.ok) toast(r.error || 'Could not generate the report', '#DC2626');
  };

  const doDelete = async () => {
    setDeleting(true);
    const res = await api.deleteAccount();
    if (res.ok) { await logout().catch(() => {}); router.replace('/'); return; }
    setDeleting(false);
    toast(res.data?.error || 'Could not delete account, try again', '#DC2626');
  };

  const doLogout = async () => { await logout().catch(() => {}); router.replace('/login'); };
  const provider = getLastProvider();
  const providerLabel = provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'Google or GitHub';

  const conns = (profile?.connections ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const paid = isPaid(profile);

  useEffect(() => {
    const connected = params.get('connected');
    const err = params.get('error');
    if (!connected && !err) return;
    (async () => {
      if (connected) {
        await refreshProfile();
        toast(`${connected === 'github' ? 'GitHub' : connected === 'supabase' ? 'Supabase' : connected} connected`, '#16A34A');
      } else {
        if (err) console.error('[connect] callback error:', err);
        const provider = err?.includes('supabase') ? 'Supabase' : err?.includes('github') ? 'GitHub' : null;
        const msg = err === 'access_denied' ? 'Connection cancelled. Try again.' : provider ? `Couldn’t connect to ${provider}, please try again.` : 'Couldn’t complete the connection, please try again.';
        toast(msg, '#DC2626');
      }
      router.replace('/settings');
    })();
  }, [params, refreshProfile, router, toast]);

  useEffect(() => {
    const reset = () => setBusy(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => setBusy(null), 90_000);
    return () => clearTimeout(t);
  }, [busy]);

  const connect = async (p: Provider) => {
    setBusy(p);
    const label = p === 'github' ? 'GitHub' : 'Supabase';
    const res = await api.connectBegin(p);
    if (!res.ok || !res.data.redirectUrl) {
      if (res.data?.error) console.error('[connect] begin failed:', res.data.error);
      toast(res.status === 402 && res.data?.error ? res.data.error : `Couldn’t start the ${label} connection, please try again.`, '#DC2626');
      setBusy(null);
      return;
    }
    if (res.data.mock) {
      const state = new URL(res.data.redirectUrl).searchParams.get('state') ?? '';
      await api.completeMockConnect(p, state);
      await refreshProfile();
      toast(`${label} connected`, '#16A34A');
      setBusy(null);
      return;
    }
    window.location.assign(res.data.redirectUrl);
  };

  const disconnect = async (p: Provider) => {
    setBusy(p);
    const res = await api.disconnect(p);
    if (res.ok) { await refreshProfile(); toast(`${p === 'github' ? 'GitHub' : 'Supabase'} disconnected`, '#D97706'); }
    else toast(res.data?.error || 'Could not disconnect', '#DC2626');
    setBusy(null);
  };

  const detailFor = (p: Provider, meta?: Record<string, unknown>): string => {
    if (!meta) return 'Not connected';
    if (p === 'github') return `Read-only · ${meta.repo ?? 'connected'}${meta.mock ? ' · mock' : ''}`;
    return `${meta.projectRef ? `project ${meta.projectRef}` : 'connected'}${meta.mock ? ' · mock' : ''}`;
  };

  if (deleting) return <FullScreenLoader variant="deleting" />;

  return (
    <div className="vg-fade">
      <PageHeading title="Settings" subtitle="Your account, connections and notifications." />

      <div className="flex flex-col divide-y divide-border">
        {/* Profile */}
        <Card flat className="py-7">
          <CardTitle sub="Your login is your Google or GitHub account.">Profile</CardTitle>
          <div className="mt-2">
            <Row first>
              <span className="text-[14px] font-medium">Email</span>
              <span className="font-mono text-[13.5px]" style={{ color: '#737373' }}>{user?.email ?? 'Not set'}</span>
            </Row>
            <Row>
              <span className="text-[14px] font-medium">Name</span>
              <span className="text-[14px]" style={{ color: '#737373' }}>{user?.displayName ?? 'Not set'}</span>
            </Row>
            <Row>
              <span className="text-[14px] font-medium">Signed in with</span>
              <span className="text-[14px]" style={{ color: '#737373' }}>{providerLabel}</span>
            </Row>
            <Row>
              <span className="text-[14px] font-medium">Security report</span>
              <PillButton variant="outline" onClick={downloadAccountReport} disabled={reportBusy} icon={<DownloadIcon />} tooltip="PDF report">{reportBusy ? 'Preparing…' : 'Download (PDF)'}</PillButton>
            </Row>
          </div>
          <p className="text-[12.5px] mt-4 leading-[1.55]" style={{ color: '#A3A3A3' }}>
            To use a different email, sign in with that Google or GitHub account. Need a hand? <a href={SUPPORT_MAILTO} className="underline hover:text-ink transition-colors">Contact support</a>.
          </p>
          <div className="mt-4 flex justify-end">
            <PillButton variant="outline" onClick={doLogout} icon={<LogoutIcon />}>Sign out</PillButton>
          </div>
        </Card>

        {/* Connections */}
        <Card flat className="py-7">
          <CardTitle sub="Read-only. We never store your code.">Connections</CardTitle>
          <div className="mt-2">
            {PROVIDERS.map((c, i) => {
              const meta = conns[c.key];
              const connected = !!meta;
              const stale = connected && !!meta?.needsReconnect;
              return (
                <Row key={c.key} first={i === 0}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#F5F5F5' }}><BrandLogo name={c.logo} size={19} icon /></span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium">{c.name}</div>
                      <div className="font-mono text-[12px] truncate" style={{ color: '#A3A3A3' }}>{stale ? 'Access lapsed, reconnect' : detailFor(c.key, meta)}</div>
                    </div>
                  </div>
                  {connected ? (
                    <PillButton variant="outline" onClick={() => (stale ? connect(c.key) : disconnect(c.key))} disabled={busy === c.key}>
                      {busy === c.key ? '…' : stale ? 'Reconnect' : 'Disconnect'}
                    </PillButton>
                  ) : paid ? (
                    <PillButton onClick={() => connect(c.key)} disabled={busy === c.key} icon={<LinkIcon />} tooltip="Read-only">{busy === c.key ? 'Connecting…' : 'Connect'}</PillButton>
                  ) : (
                    <PillButton variant="outline" onClick={() => router.push(billingHref())}>Upgrade to connect</PillButton>
                  )}
                </Row>
              );
            })}
          </div>
        </Card>

        {/* Notifications */}
        <Card flat className="py-7">
          <CardTitle>Notifications</CardTitle>
          <div className="mt-2">
            {TOGGLE_ROWS.map((t, i) => (
              <Row key={t.key} first={i === 0}>
                <span className="text-[14px]">{t.label}</span>
                <Toggle on={!!notif[t.key]} onClick={() => toggleNotif(t.key)} label={t.label} />
              </Row>
            ))}
          </div>
        </Card>

        {/* Delete account */}
        <div className="py-7">
          <div className="text-[15px] font-medium" style={{ color: '#DC2626' }}>Delete account</div>
          <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
            <p className="text-[13.5px] max-w-[52ch]" style={{ color: '#737373' }}>Deletes every scan, finding, connection and monitor. Permanent.</p>
            <PillButton variant="danger" onClick={() => { setConfirmText(''); setConfirmOpen(true); }} icon={<TrashIcon />}>Delete account</PillButton>
          </div>
        </div>
      </div>

      {confirmOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !deleting && setConfirmOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div role="dialog" aria-label="Delete account" onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[16px] p-7 vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
            <h2 className="font-medium text-[19px] tracking-[-0.02em]">Delete your account?</h2>
            <p className="text-[14.5px] mt-2 leading-[1.55]" style={{ color: '#737373' }}>This permanently erases your account and <span className="text-ink font-medium">all</span> of its data, scans, findings, connections and monitoring. It can’t be undone.</p>
            <label className="block text-[13px] font-medium mt-5 mb-[6px]" style={{ color: '#737373' }}>Type <span className="font-mono text-ink">DELETE</span> to confirm</label>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoFocus placeholder="DELETE" className="w-full rounded-[10px] px-[14px] py-[11px] text-[15px] focus:shadow-[0_0_0_2px_#0A0A0A] transition-shadow" style={{ outline: 'none', background: '#F7F7F7' }} />
            <div className="flex gap-[10px] mt-5">
              <PillButton variant="cancel" onClick={() => setConfirmOpen(false)} disabled={deleting} className="flex-1 h-[44px]">Cancel</PillButton>
              <ActionButton variant="danger-solid" onClick={doDelete} disabled={deleting || confirmText !== 'DELETE'} icon={<TrashIcon />} className="flex-1 h-[44px]">{deleting ? 'Deleting…' : 'Delete account'}</ActionButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
