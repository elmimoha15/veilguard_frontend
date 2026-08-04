'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './state';
import Logo from '@/components/ui/Logo';
import { useAuth, isPaid } from '@/lib/auth';
import { api } from '@/lib/api';
import { checkUrl } from '@/lib/url';
import { RepoPicker } from './RepoPicker';
import { UploadPicker } from './UploadPicker';
import { GitHubIcon } from '@/components/ui/BrandIcons';

type NavId = 'dashboard' | 'apps' | 'billing';
const NAV: { id: NavId; label: string }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'apps', label: 'My Apps' },
  { id: 'billing', label: 'Billing' },
];

const CRUMB: Record<string, string> = {
  dashboard: 'Overview',
  apps: 'My Apps',
  app: 'App',
  findings: 'Findings',
  finding: 'Finding',
  monitoring: 'Monitoring',
  billing: 'Billing',
  settings: 'Settings',
  empty: 'All clear',
};

/* Inline line-icons (18px, stroke = currentColor) matching the design export. */
function NavIcon({ id }: { id: NavId }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' } as const;
  switch (id) {
    case 'dashboard':
      return <svg {...p}><path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'apps':
      return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case 'billing':
      return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" /></svg>;
  }
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { modal, setModal, newAppUrl, setNewAppUrl, toast, setPendingScanId } = useApp();
  const { user, profile, logout, loading: authLoading } = useAuth();

  const [userMenu, setUserMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [starting, setStarting] = useState(false);
  // 'choose' = the two-lens picker; 'url' = the URL-input step of the chooser.
  const [scanKind, setScanKind] = useState<'choose' | 'url'>('choose');
  const [repoOpen, setRepoOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  // Deep scan + folder upload are Pro features (free plan scans URLs only).
  const paid = isPaid(profile);
  // Only mark features as "PRO"/locked once we KNOW the user is free — never flash
  // an upsell to a paid user while their profile is still loading.
  const knownFree = !paid && !authLoading;

  const isActive = (id: string) => pathname === `/${id}` || (id === 'apps' && pathname === '/app');
  const crumb = CRUMB[pathname.replace(/^\//, '').split('/')[0]] ?? 'Overview';

  const go = (path: string) => { setUserMenu(false); setMobileNav(false); router.push(path); };

  const doLogout = async () => { setUserMenu(false); await logout(); router.replace('/login'); };

  const closeModal = () => { setModal(null); setScanKind('choose'); };

  const confirmAddApp = async () => {
    const c = checkUrl(newAppUrl);
    if (!c.ok) { toast(c.error!, '#E5484D'); return; }
    setStarting(true);
    const res = await api.createScan(c.url!);
    setStarting(false);
    if (!res.ok || !res.data.scanId) { toast(res.data.error || 'Could not start scan', '#E5484D'); return; }
    closeModal(); setNewAppUrl('');
    // Run in the background — a docked progress chip (ScanWatcher) tracks it so the
    // user isn't yanked to a full-screen scanning page.
    setPendingScanId(res.data.scanId);
    toast('Scan started', '#0A0A0A');
  };

  const startDeepScan = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5484D'); return false; }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const startUploadScan = async (zip: Blob, name: string): Promise<boolean> => {
    const r = await api.createUploadScan(zip, name);
    if (!r.ok || !r.data.scanId) {
      if (r.status === 402) { toast('Folder upload is a Pro feature — upgrade to scan uploaded code.', '#E0932F'); setUploadOpen(false); go('/billing'); }
      else toast(r.data.error || 'Could not start the scan', '#E5484D');
      return false;
    }
    setUploadOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const openUpload = () => {
    if (!paid) { toast('Folder upload is a Pro feature — upgrade to scan uploaded code.', '#E0932F'); closeModal(); go('/billing'); return; }
    closeModal();
    setUploadOpen(true);
  };

  const openDeep = () => {
    if (!paid) { toast('Deep scan is a Pro feature — upgrade to scan your connected code.', '#E0932F'); closeModal(); go('/billing'); return; }
    closeModal();
    setRepoOpen(true);
  };

  const navButtons = (
    <>
      {NAV.map((n) => {
        const on = isActive(n.id);
        return (
          <button
            key={n.id}
            onClick={() => go(`/${n.id}`)}
            className="vg-nav flex items-center gap-[11px] border-0 rounded-[9px] px-[11px] py-[9px] text-left text-[14.5px] transition-colors cursor-pointer"
            style={{ background: on ? 'rgba(243,197,0,.16)' : undefined, color: on ? '#8a6d00' : '#5b5a56', fontWeight: on ? 600 : 500 }}
          >
            <NavIcon id={n.id} />
            {n.label}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="shrink-0 w-[244px] bg-white border-r border-border px-3 py-4 hidden min-[900px]:flex flex-col gap-[2px] sticky top-0 h-screen">
        <div className="px-2 pt-[6px] pb-[14px]">
          <Logo size={28} wordmarkClassName="text-ink text-[17px]" />
        </div>
        {navButtons}
        <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer mt-3 flex items-center gap-[8px] w-full bg-ink text-white rounded-[10px] px-[12px] py-[9px] font-medium text-[14px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          New scan
        </button>
        <div className="mt-auto border border-border bg-bg-soft rounded-[12px] p-[14px]">
          <div className="text-[13px] text-label">Plan</div>
          <div className="font-semibold text-ink text-[15px] mt-[1px] capitalize">{profile?.plan ?? 'free'}</div>
          <button onClick={() => go('/billing')} className="vg-press cursor-pointer mt-[10px] w-full rounded-[9px] py-2 text-[13px] font-semibold" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>
            {profile?.plan === 'free' || !profile?.plan ? 'Upgrade' : 'Manage billing'}
          </button>
        </div>
        <UserBlock open={userMenu} setOpen={setUserMenu} email={user?.email ?? ''} onSettings={() => go('/settings')} onLogout={doLogout} />
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="min-[900px]:hidden sticky top-0 z-40 bg-white border-b border-border flex items-center justify-between px-4 h-14">
          <Logo size={26} wordmarkClassName="text-ink text-[17px]" />
          <button aria-label="Menu" onClick={() => setMobileNav((v) => !v)} className="text-ink px-2 cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        {mobileNav && (
          <div className="min-[900px]:hidden bg-white border-b border-border px-3 pb-3 pt-2 flex flex-col gap-1 vg-fade">
            {navButtons}
            <button onClick={() => { setModal('addApp'); setMobileNav(false); }} className="vg-press cursor-pointer mt-2 mb-1 flex items-center gap-[8px] w-full bg-ink text-white rounded-[10px] px-[12px] py-[9px] font-medium text-[14px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              New scan
            </button>
            <button onClick={() => go('/settings')} className="vg-nav flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left font-medium text-[14.5px] text-[#5b5a56] transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              Settings
            </button>
            <button onClick={doLogout} className="vg-nav flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left font-medium text-[14.5px] text-[#C23B3F] transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Log out
            </button>
          </div>
        )}

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/[.72] backdrop-blur-[10px] border-b border-border px-6 py-3 flex items-center gap-[14px] min-h-[57px]">
          <div className="hidden min-[900px]:flex items-center gap-2 text-[15px]">
            <span className="text-ink font-semibold">{crumb}</span>
          </div>
        </header>

        <main className="flex-1 px-6 pt-8 pb-16">
          <div className="max-w-[1080px] mx-auto">{children}</div>
        </main>
      </div>

      {/* ===== Modals ===== */}
      {modal === 'addApp' && (
        <ModalOverlay onClose={closeModal}>
          {scanKind === 'choose' ? (
            <>
              <h2 className="font-semibold text-[19px] tracking-[-0.02em] mb-[6px]">New scan</h2>
              <p className="text-[15px] text-muted mb-[18px]">Two ways to check an app — pick one now, add the other to the same app later.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setScanKind('url')} className="vg-press vg-card text-left bg-white border border-border rounded-[12px] p-4">
                  <div className="flex items-center gap-2 font-semibold text-[15px]">
                    <IconGlobe /> URL scan <span className="font-mono text-[12px] text-faint font-semibold">~60s · no access</span>
                  </div>
                  <div className="text-[14px] text-muted mt-1">What an attacker sees from outside: secrets leaked into your JS bundle, an open Supabase, missing security headers, an exposed <code className="font-mono">.env</code>.</div>
                </button>
                <button onClick={openDeep} className="vg-press vg-card text-left bg-white border border-border rounded-[12px] p-4">
                  <div className="flex items-center gap-2 font-semibold text-[15px]"><GitHubIcon size={17} /> Deep scan {knownFree && <ProBadge />} <span className="font-mono text-[12px] text-faint font-semibold">connect a repo</span></div>
                  <div className="text-[14px] text-muted mt-1">We read your code (and probe your database) for what the outside can’t see: SQL injection, unverified webhooks, unprotected API routes, dependency CVEs.</div>
                </button>
                <button onClick={openUpload} className="vg-press vg-card text-left bg-white border border-border rounded-[12px] p-4">
                  <div className="flex items-center gap-2 font-semibold text-[15px]"><IconFolder /> Upload a folder {knownFree && <ProBadge />}</div>
                  <div className="text-[14px] text-muted mt-1">No GitHub? Upload your project folder (or a <code className="font-mono">.zip</code>) for the same deep code checks. We scan it in a sandbox and delete it right after — nothing is stored.</div>
                </button>
              </div>
              <button onClick={closeModal} className="vg-press vg-card w-full mt-4 bg-white border border-border rounded-[11px] py-3 font-semibold text-[15px] text-muted">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setScanKind('choose')} className="flex items-center gap-1 text-[14px] text-muted font-semibold mb-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Back
              </button>
              <h2 className="font-semibold text-[19px] tracking-[-0.02em] mb-[6px]">URL scan</h2>
              <p className="text-[15px] text-muted mb-[18px]">Paste your app’s live URL and we’ll grade it in about 60 seconds.</p>
              <label className="flex items-center gap-[9px] bg-white border border-border rounded-[10px] px-[15px] min-h-[52px] focus-within:border-ink transition-colors">
                <span className="font-mono text-tertiary text-[16px]">https://</span>
                <input value={newAppUrl} onChange={(e) => setNewAppUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmAddApp()} placeholder="your-app.com" aria-label="App URL" className="flex-1 border-0 outline-none bg-transparent text-[17px] min-w-0" autoFocus />
              </label>
              <div className="flex gap-[10px] mt-[18px]">
                <button onClick={closeModal} className="vg-press vg-card flex-1 bg-white border border-border rounded-[10px] py-3 font-semibold text-[15px] text-muted">Cancel</button>
                <button onClick={confirmAddApp} disabled={starting} className="vg-press flex-1 bg-ink text-white rounded-[10px] py-3 font-medium text-[15px] disabled:opacity-70 cursor-pointer">{starting ? 'Starting…' : 'Scan app'}</button>
              </div>
            </>
          )}
        </ModalOverlay>
      )}

      {repoOpen && (
        <RepoPicker
          onClose={() => setRepoOpen(false)}
          onScan={startDeepScan}
          onNeedsConnect={() => { setRepoOpen(false); go('/settings'); }}
        />
      )}

      {uploadOpen && (
        <UploadPicker onClose={() => setUploadOpen(false)} onScan={startUploadScan} />
      )}
    </div>
  );
}

function ProBadge() {
  return <span className="text-[11px] font-bold px-[8px] py-[2px] rounded-full" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>PRO</span>;
}
function IconGlobe() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function IconFolder() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}

function UserBlock({ open, setOpen, email, onSettings, onLogout }: { open: boolean; setOpen: (v: boolean) => void; email: string; onSettings: () => void; onLogout: () => void }) {
  const initials = (email || '?').slice(0, 2).toUpperCase();
  return (
    <div className="relative mt-[10px]">
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] inset-x-0 bg-white border border-border rounded-[12px] p-[6px] shadow-[var(--shadow-pop)] vg-fade">
          <button onClick={onSettings} className="vg-nav flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left text-ink font-medium text-[14px] transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Settings
          </button>
          <button onClick={onLogout} className="vg-nav flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left font-medium text-[14px] text-[#C23B3F] transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Log out
          </button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="vg-card flex items-center gap-[10px] w-full bg-white border border-border rounded-[12px] px-[10px] py-2 text-left cursor-pointer">
        <span className="w-8 h-8 rounded-[8px] bg-ink text-white flex items-center justify-center font-semibold text-[13px]">{initials}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-[14px] text-ink truncate">{email || 'Account'}</span>
          <span className="block text-[12.5px] text-label truncate">Signed in</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 10l4-4 4 4M8 14l4 4 4-4" stroke="#9B9B96" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.28)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] bg-card border border-border rounded-[16px] p-[26px] vg-pop shadow-[var(--shadow-pop)]">
        {children}
      </div>
    </div>
  );
}
