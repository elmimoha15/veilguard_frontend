'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { api } from '@/lib/api';
import { Toggle } from './ui';
import { GitHubIcon, SupabaseIcon } from '@/components/ui/BrandIcons';

const TOGGLE_ROWS: { key: 'email' | 'critical' | 'deploy'; label: string }[] = [
  { key: 'email', label: 'Email me about alerts' },
  { key: 'critical', label: 'Only alert on criticals' },
  { key: 'deploy', label: 'Scan on every deploy' },
];

type Provider = 'github' | 'supabase';
const PROVIDERS: { key: Provider; name: string; Icon: (p: { size?: number }) => React.JSX.Element; iconBg: string; hint: string }[] = [
  { key: 'github', name: 'GitHub', Icon: GitHubIcon, iconBg: '#0A0A0A', hint: 'Read-only, single repo' },
  { key: 'supabase', name: 'Supabase', Icon: SupabaseIcon, iconBg: '#0A0A0A', hint: 'Read-only, or paste your rules' },
];

export default function SettingsScreen() {
  const { toggles, toggle, toast } = useApp();
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState<Provider | null>(null);

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
    // Real OAuth in a POPUP — the dashboard stays open and updates in place.
    openOAuthPopup(res.data.redirectUrl, p, label);
  };

  const openOAuthPopup = (url: string, p: Provider, label: string) => {
    const w = 600, h = 720;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    const popup = window.open(url, 'vg_oauth', `width=${w},height=${h},left=${left},top=${top}`);
    if (!popup) { window.location.assign(url); return; } // popup blocked → full-window fallback

    let done = false;
    const cleanup = () => { window.removeEventListener('message', onMsg); clearInterval(poll); };
    const onMsg = async (ev: MessageEvent) => {
      const d = ev.data as { source?: string; connected?: string; error?: string } | null;
      if (!d || d.source !== 'veilguard-oauth') return;
      done = true;
      cleanup();
      try { popup.close(); } catch { /* cross-origin close guard */ }
      if (d.connected) { await refreshProfile(); toast(`${label} connected`, '#1F9D57'); }
      else toast(`${label} connection failed${d.error ? ` (${d.error})` : ''}. Please try again.`, '#E5484D');
      setBusy(null);
    };
    window.addEventListener('message', onMsg);
    // If the user closes the popup without finishing, stop the spinner (and
    // re-check the profile in case the message was missed).
    const poll = setInterval(async () => {
      if (popup.closed) {
        cleanup();
        if (!done) { await refreshProfile(); setBusy(null); }
      }
    }, 600);
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
    <div className="vg-fade max-w-[720px]">
      <h1 className="font-semibold text-[24px] tracking-[-0.02em] mb-5">Settings</h1>

      {/* Account */}
      <div className="vg-surface p-6 mb-4">
        <div className="font-semibold text-[14px] mb-4">Account</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
          <Field label="Email" value={user?.email ?? '—'} />
          <Field label="User ID" value={user?.uid ?? '—'} mono />
        </div>
        <p className="text-[13.5px] text-faint mt-4">Signed in with {user?.providerData?.[0]?.providerId?.replace('.com', '') ?? 'email'}. Account management ships with billing.</p>
      </div>

      {/* Connections */}
      <div className="vg-surface p-6 mb-4">
        <div className="font-semibold text-[14px] mb-[6px]">Connections</div>
        <p className="text-[14px] text-label mb-4">Read-only. We never store your code.</p>
        {PROVIDERS.map((c) => {
          const meta = conns[c.key];
          const connected = !!meta;
          return (
            <div key={c.key} className="flex items-center gap-3 py-3 border-t border-[color:var(--color-hairline)]">
              <span className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white" style={{ background: c.iconBg }}><c.Icon size={20} /></span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15.5px]">{c.name}</div>
                <div className="font-mono text-[12.5px] text-faint truncate">{detailFor(c.key, meta)}</div>
              </div>
              {connected ? (
                <>
                  <span className="inline-flex items-center gap-[6px] text-[14px] font-semibold" style={{ color: '#157A43' }}><span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: '#1F9D57' }} />Connected</span>
                  <button onClick={() => disconnect(c.key)} disabled={busy === c.key} className="bg-none cursor-pointer text-[#C23B3F] text-[14px] font-semibold disabled:opacity-60">{busy === c.key ? '…' : 'Disconnect'}</button>
                </>
              ) : paid ? (
                <button onClick={() => connect(c.key)} disabled={busy === c.key} className="vg-press cursor-pointer bg-ink text-white rounded-[10px] px-[14px] py-2 text-[14px] font-medium disabled:opacity-60">{busy === c.key ? '…' : 'Connect'}</button>
              ) : (
                <button onClick={() => router.push('/billing')} className="vg-press cursor-pointer inline-flex items-center gap-[6px] rounded-[10px] px-[14px] py-2 text-[14px] font-medium" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" /></svg>Pro — Upgrade</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Notifications — settings persist with monitoring (Slice 7); local for now */}
      <div className="vg-surface p-6">
        <div className="font-semibold text-[14px] mb-[14px]">Notifications</div>
        {TOGGLE_ROWS.map((t) => (
          <div key={t.key} className="flex items-center justify-between py-[9px]">
            <span className="text-[15px]">{t.label}</span>
            <Toggle on={toggles[t.key]} onClick={() => toggle(t.key)} label={t.label} />
          </div>
        ))}
      </div>
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
