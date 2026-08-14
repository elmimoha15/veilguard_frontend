'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { billingHref } from '@/lib/url';
import { api } from '@/lib/api';
import { saveNotifications } from '@/lib/scans';
import { Toggle } from './ui';
import { Card, SectionLabel, PageHeading } from './primitives';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { HELP_GITHUB_URL, HELP_SUPABASE_URL } from '@/content/site';

type NotifKey = 'email' | 'critical' | 'deploy' | 'summary';
const TOGGLE_ROWS: { key: NotifKey; label: string }[] = [
  { key: 'email', label: 'Email me about alerts' },
  { key: 'critical', label: 'Only alert on criticals' },
  { key: 'deploy', label: 'Scan on every deploy' },
  { key: 'summary', label: 'Send me a monthly security summary' },
];

type Provider = 'github' | 'supabase';
const PROVIDERS: { key: Provider; name: string; logo: BrandLogoName; invert?: boolean; iconBg: string; hint: string; helpUrl: string; helpText: string }[] = [
  { key: 'github', name: 'GitHub', logo: 'github', invert: true, iconBg: '#0A0A0A', hint: 'Read-only, single repo', helpUrl: HELP_GITHUB_URL, helpText: 'How does connecting work?' },
  { key: 'supabase', name: 'Supabase', logo: 'supabase', iconBg: '#0A0A0A', hint: 'Read-only, or paste your rules', helpUrl: HELP_SUPABASE_URL, helpText: 'Need help connecting Supabase?' },
];

const DEFAULT_NOTIF = { email: true, critical: true, deploy: true, summary: true };

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

  // Account-wide notification prefs — seeded from the profile (defaults on),
  // persisted on change. Missing keys default to on (e.g. older docs, summary).
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({ ...DEFAULT_NOTIF, ...(profile?.notifications ?? {}) });
  useEffect(() => { if (profile?.notifications) setNotif((n) => ({ ...n, ...profile.notifications })); }, [profile?.notifications]);

  const toggleNotif = async (key: NotifKey) => {
    if (!user) return;
    const prev = notif;
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next); // optimistic
    try {
      await saveNotifications(user.uid, next);
    } catch {
      setNotif(prev);
      toast('Could not save your preference — try again', '#E5484D');
    }
  };

  const downloadAccountReport = async () => {
    setReportBusy(true);
    const r = await api.downloadAccountReport();
    setReportBusy(false);
    if (!r.ok) toast(r.error || 'Could not generate the report', '#E5484D');
  };

  const doDelete = async () => {
    setDeleting(true);
    const res = await api.deleteAccount();
    if (res.ok) {
      // Account (incl. this session's user) is gone — sign out and leave the app.
      await logout().catch(() => {});
      router.replace('/');
      return; // keep the button spinning through the redirect
    }
    setDeleting(false);
    toast(res.data?.error || 'Could not delete account — try again', '#E5484D');
  };

  const conns = (profile?.connections ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const paid = isPaid(profile); // connecting a repo/DB feeds deep scans — a Pro feature

  // Handle the return from an OAuth redirect (?connected=github / ?error=…).
  useEffect(() => {
    const connected = params.get('connected');
    const err = params.get('error');
    if (!connected && !err) return;
    (async () => {
      if (connected) { await refreshProfile(); toast(`${connected === 'github' ? 'GitHub' : connected === 'supabase' ? 'Supabase' : connected} connected`, '#1F9D57'); }
      else toast(`Connection failed (${err}). Please try again.`, '#E5484D');
      router.replace('/settings');
    })();
  }, [params, refreshProfile, router, toast]);

  const connect = async (p: Provider) => {
    setBusy(p);
    const label = p === 'github' ? 'GitHub' : 'Supabase';
    const res = await api.connectBegin(p);
    if (!res.ok || !res.data.redirectUrl) {
      toast(res.data?.error || `Could not start ${label} connect`, '#E5484D');
      setBusy(null);
      return;
    }
    // Local emulator (mock): no real provider — complete the loop directly.
    if (res.data.mock) {
      const state = new URL(res.data.redirectUrl).searchParams.get('state') ?? '';
      await api.completeMockConnect(p, state);
      await refreshProfile();
      toast(`${label} connected`, '#1F9D57');
      setBusy(null);
      return;
    }
    // Real OAuth in a FULL WINDOW (no popup): navigate the page to the provider.
    // The backend callback returns to /settings?connected=… which the effect
    // above picks up. The button stays "Connecting…" through the navigation.
    window.location.assign(res.data.redirectUrl);
  };

  const disconnect = async (p: Provider) => {
    setBusy(p);
    const res = await api.disconnect(p);
    if (res.ok) { await refreshProfile(); toast(`${p === 'github' ? 'GitHub' : 'Supabase'} disconnected`, '#E0932F'); }
    else toast(res.data?.error || 'Could not disconnect', '#E5484D');
    setBusy(null);
  };

  const detailFor = (p: Provider, meta?: Record<string, unknown>): string => {
    if (!meta) return PROVIDERS.find((x) => x.key === p)!.hint;
    if (p === 'github') return `${meta.repo ?? 'connected'}${meta.mock ? ' · mock' : ''}`;
    return `${meta.projectRef ? `project ${meta.projectRef}` : 'connected'}${meta.mock ? ' · mock' : ''}`;
  };

  return (
    <div className="vg-fade">
      <PageHeading title="Settings" />

      {/* Account */}
      <Card className="p-6 mb-4">
        <SectionLabel>Account</SectionLabel>
        <div className="mt-4">
          <Field label="Email" value={user?.email ?? '—'} />
        </div>
      </Card>

      {/* Plan & usage */}
      <Card className="p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <SectionLabel>Plan</SectionLabel>
            <div className="text-[18px] font-semibold mt-[6px] capitalize">{profile?.plan ?? 'free'}</div>
          </div>
          <button onClick={downloadAccountReport} disabled={reportBusy} style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }} className="vg-press cursor-pointer rounded-[10px] px-[14px] py-[9px] text-[14px] font-semibold disabled:opacity-60">
            {reportBusy ? 'Preparing…' : 'Download security report (PDF)'}
          </button>
        </div>
        {profile?.usage && profile?.caps && (() => {
          const used = profile.usage.scansThisMonth;
          const cap = profile.caps.maxScansPerMonth;
          const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
          return (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[13px] text-muted tnum mb-[6px]">
                <span>{used} / {cap} scans this month</span>
                <span>{pct}%</span>
              </div>
              <div className="h-[8px] rounded-full bg-bg-soft overflow-hidden">
                <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: pct >= 100 ? '#C23B3F' : '#F3C500' }} />
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Connections */}
      <Card className="p-6 mb-4">
        <SectionLabel>Connections</SectionLabel>
        <p className="text-[14px] text-muted mt-1 mb-4">Read-only. We never store your code.</p>
        {PROVIDERS.map((c) => {
          const meta = conns[c.key];
          const connected = !!meta;
          // The worker flags a connection stale (`needsReconnect`) when a scan
          // finds its access has lapsed. Surface that instead of a green tick.
          const stale = connected && !!meta?.needsReconnect;
          return (
            <div key={c.key} className="flex items-center gap-3 py-3 border-t border-[color:var(--color-hairline)]">
              <span className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white" style={{ background: c.iconBg }}><BrandLogo name={c.logo} size={20} invert={c.invert} /></span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px]">{c.name}</div>
                <div className="font-mono text-[12.5px] text-faint truncate">{stale ? 'Access lapsed — reconnect to keep scanning' : detailFor(c.key, meta)}</div>
                <a href={c.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[12.5px] text-yellow-dark hover:underline mt-[2px]">{c.helpText}</a>
              </div>
              {stale ? (
                <>
                  <span className="inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: '#8a6d00' }}><span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: '#E0932F' }} />Needs reconnect</span>
                  <button onClick={() => connect(c.key)} disabled={busy === c.key} className="vg-press cursor-pointer bg-ink text-white rounded-[10px] px-[14px] py-2 text-[14px] font-medium disabled:opacity-60">{busy === c.key ? 'Connecting…' : 'Reconnect'}</button>
                </>
              ) : connected ? (
                <>
                  <span className="inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: '#157A43' }}><span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: '#1F9D57' }} />Connected</span>
                  <button onClick={() => disconnect(c.key)} disabled={busy === c.key} className="bg-none cursor-pointer text-[#C23B3F] text-[14px] font-semibold disabled:opacity-60">{busy === c.key ? 'Disconnecting…' : 'Disconnect'}</button>
                </>
              ) : paid ? (
                <button onClick={() => connect(c.key)} disabled={busy === c.key} className="vg-press cursor-pointer bg-ink text-white rounded-[10px] px-[14px] py-2 text-[14px] font-medium disabled:opacity-60">{busy === c.key ? 'Connecting…' : 'Connect'}</button>
              ) : (
                <button onClick={() => router.push(billingHref())} className="vg-press cursor-pointer inline-flex items-center gap-[6px] rounded-[10px] px-[14px] py-2 text-[14px] font-medium" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" /></svg>Pro — Upgrade</button>
              )}
            </div>
          );
        })}
      </Card>

      {/* Notifications — account-wide defaults, saved to the user's profile */}
      <Card className="p-6">
        <SectionLabel>Notifications</SectionLabel>
        <div className="mt-2">
          {TOGGLE_ROWS.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-[9px]">
              <span className="text-[15px]">{t.label}</span>
              <Toggle on={notif[t.key]} onClick={() => toggleNotif(t.key)} label={t.label} />
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 mt-4">
        <div className="kicker" style={{ color: '#C23B3F' }}>Danger zone</div>
        <div className="flex items-start justify-between gap-4 flex-wrap mt-3">
          <p className="text-[14px] text-muted max-w-[52ch]">Delete your account and everything in it — every scan, finding, connection and monitoring setup. This is permanent and can&apos;t be undone.</p>
          <button onClick={() => { setConfirmText(''); setConfirmOpen(true); }} className="vg-press cursor-pointer shrink-0 rounded-[10px] px-[16px] py-[9px] text-[14px] font-medium border" style={{ color: '#C23B3F', borderColor: 'rgba(229,72,77,.4)' }}>Delete account</button>
        </div>
      </Card>

      {confirmOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !deleting && setConfirmOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
            <h2 className="font-semibold text-[19px] tracking-[-0.02em]">Delete your account?</h2>
            <p className="text-[14.5px] text-muted mt-2 leading-[1.55]">This permanently erases your account and <span className="text-ink font-medium">all</span> of its data — scans, findings, connections and monitoring. It can&apos;t be undone.</p>
            <label className="block text-[13px] font-medium text-muted mt-5 mb-[6px]">Type <span className="font-mono text-ink">DELETE</span> to confirm</label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              placeholder="DELETE"
              className="w-full bg-bg-soft border border-border rounded-[10px] px-[14px] py-[11px] text-[15px] outline-none focus:border-ink transition-colors"
            />
            <div className="flex gap-[10px] mt-5">
              <button onClick={() => setConfirmOpen(false)} disabled={deleting} className="vg-press cursor-pointer flex-1 bg-card border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted disabled:opacity-60">Cancel</button>
              <button onClick={doDelete} disabled={deleting || confirmText !== 'DELETE'} className="vg-press cursor-pointer flex-1 rounded-[10px] py-[12px] font-medium text-[15px] text-white disabled:opacity-50" style={{ background: '#E5484D' }}>{deleting ? 'Deleting…' : 'Delete account'}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="block text-[13.5px] font-semibold text-label mb-[5px]">{label}</label>
      <div className={`w-full bg-bg-soft border border-border rounded-[10px] px-[13px] py-[11px] text-[15px] truncate ${mono ? 'font-mono text-[13.5px] text-muted' : ''}`}>{value}</div>
    </div>
  );
}
