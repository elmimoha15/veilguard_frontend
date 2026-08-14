'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './state';
import Logo from '@/components/ui/Logo';
import { useAuth, isPaid } from '@/lib/auth';
import { api } from '@/lib/api';
import { checkUrl, billingHref } from '@/lib/url';
import { startFailure } from '@/lib/scanError';
import { SUPPORT_MAILTO, LEGAL } from '@/content/site';
import { RepoPicker } from './RepoPicker';
import { UploadPicker } from './UploadPicker';
import { BrandLogo } from '@/components/ui/BrandLogo';

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

  const closeModal = () => { setModal(null); };

  const confirmAddApp = async () => {
    const c = checkUrl(newAppUrl);
    if (!c.ok) { toast(c.error!, '#E5484D'); return; }
    setStarting(true);
    const res = await api.createScan(c.url!);
    setStarting(false);
    if (!res.ok || !res.data.scanId) {
      if (res.data.error) console.error('[url scan] start failed:', res.data.error);
      if (res.data.code === 'E_SCAN_LIMIT') { toast(res.data.error || 'You’ve used all your scans this month.', '#E0932F'); closeModal(); if (!paid) go(billingHref()); }
      else toast(startFailure(res.status, res.data).message, '#C23B3F');
      return;
    }
    closeModal(); setNewAppUrl('');
    // Run in the background — a docked progress chip (ScanWatcher) tracks it so the
    // user isn't yanked to a full-screen scanning page.
    setPendingScanId(res.data.scanId);
    toast('Scan started', '#0A0A0A');
  };

  const startDeepScan = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) {
      if (r.data.error) console.error('[deep scan] start failed:', r.data.error);
      if (r.data.code === 'E_SCAN_LIMIT') { toast(r.data.error || 'You’ve used all your scans this month.', '#E0932F'); setRepoOpen(false); if (!paid) go(billingHref()); }
      else if (r.status === 409) { toast('Your GitHub connection needs refreshing — reconnect it in Settings, then try again.', '#C23B3F'); setRepoOpen(false); go('/settings'); }
      else if (r.status === 502) { toast('We couldn’t verify that repo with GitHub. Give it a moment and try again.', '#C23B3F'); }
      else toast(startFailure(r.status, r.data).message, '#C23B3F');
      return false;
    }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const startUploadScan = async (zip: Blob, name: string): Promise<boolean> => {
    const r = await api.createUploadScan(zip, name);
    if (!r.ok || !r.data.scanId) {
      if (r.data.error) console.error('[upload scan] start failed:', r.data.error);
      if (r.status === 402) { toast(r.data.error || 'Folder upload is a Guard feature — upgrade to scan uploaded code.', '#E0932F'); setUploadOpen(false); go(billingHref()); }
      else if (r.data.code === 'E_SCAN_LIMIT') { toast(r.data.error || 'You’ve used all your scans this month.', '#E0932F'); setUploadOpen(false); }
      else if (r.status === 413) { toast('That upload is too large. Skip node_modules and build folders, then try again.', '#C23B3F'); } // keep modal open
      else if (r.status === 400) { toast('We couldn’t open that zip. Try re-zipping your project folder — or just drop the folder itself — and upload again.', '#C23B3F'); }
      else toast(startFailure(r.status, r.data).message, '#C23B3F');
      return false;
    }
    setUploadOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const openUpload = () => {
    if (!paid) { toast('Folder upload is a Pro feature — upgrade to scan uploaded code.', '#E0932F'); closeModal(); go(billingHref()); return; }
    closeModal();
    setUploadOpen(true);
  };

  const openDeep = () => {
    if (!paid) { toast('Deep scan is a Pro feature — upgrade to scan your connected code.', '#E0932F'); closeModal(); go(billingHref()); return; }
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
        {/* A hairline separates the nav links from the New scan action below them. */}
        <div className="mx-1 my-[10px] border-t border-border" />
        <button onClick={() => setModal('addApp')} className="vg-press cursor-pointer flex items-center justify-center gap-[8px] w-full bg-ink text-white rounded-[10px] px-[12px] py-[11px] font-medium text-[14px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          New scan
        </button>
        <div className="mt-auto border border-border bg-bg-soft rounded-[12px] p-[14px]">
          <div className="text-[13px] text-label">Plan</div>
          <div className="font-semibold text-ink text-[15px] mt-[1px] capitalize">{profile?.plan ?? 'free'}</div>
          {profile?.usage && profile?.caps && (
            <div className="text-[12px] text-label mt-[7px] leading-[1.5] font-mono tnum">
              {profile.usage.scansThisMonth}/{profile.caps.maxScansPerMonth} scans this month
            </div>
          )}
          <button onClick={() => go(billingHref())} className="vg-press cursor-pointer mt-[10px] w-full rounded-[9px] py-2 text-[13px] font-semibold" style={{ background: 'rgba(243,197,0,.18)', color: '#8a6d00' }}>
            {profile?.plan === 'free' || !profile?.plan ? 'Upgrade' : 'Manage billing'}
          </button>
        </div>
        <UserBlock open={userMenu} setOpen={setUserMenu} email={user?.email ?? ''} onSettings={() => go('/settings')} onFeedback={() => go('/feedback')} onLogout={doLogout} />
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
            <button onClick={() => go('/feedback')} className="vg-nav flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left font-medium text-[14.5px] text-[#5b5a56] transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.4c0 1.7-2.1 2-2.1 3.1M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              Help &amp; feedback
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

        {/* Legal + support — reachable from every shell page */}
        <footer className="px-6 py-5 border-t border-border text-center text-[12.5px] text-faint">
          <a href={LEGAL.privacy} className="hover:text-muted">Privacy</a>
          <span className="mx-2" aria-hidden>·</span>
          <a href={LEGAL.terms} className="hover:text-muted">Terms</a>
          <span className="mx-2" aria-hidden>·</span>
          <a href={SUPPORT_MAILTO} className="hover:text-muted">Contact</a>
        </footer>
      </div>

      {/* ===== Modals ===== */}
      {modal === 'addApp' && (
        <ModalOverlay onClose={closeModal} wide>
          <div className="flex items-start justify-between gap-3 mb-[6px]">
            <h2 className="font-semibold text-[19px] tracking-[-0.02em] m-0">New scan</h2>
            <button onClick={closeModal} aria-label="Close" className="vg-press shrink-0 text-tertiary hover:text-ink transition-colors cursor-pointer -mt-1 -mr-1 p-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <p className="text-[14px] text-muted mb-[18px]">Grade a live URL in ~60 seconds, or run a deeper check on your code.</p>

          {/* URL scan — the free primary action, input inline */}
          <div className="bg-bg-soft border border-border rounded-[12px] p-4">
            <div className="flex items-center gap-2 font-semibold text-[15px]"><IconGlobe /> Scan a live URL</div>
            <div className="text-[13px] text-muted mt-1 mb-3">What an attacker sees from outside — no access needed.</div>
            <div className="flex gap-[10px]">
              <label className="flex-1 flex items-center gap-[9px] bg-bg-soft rounded-[10px] px-[13px] min-h-[46px] focus-within:shadow-[0_0_0_2px_#F3C500] transition-shadow">
                <span className="font-mono text-tertiary text-[14px]">https://</span>
                <input value={newAppUrl} onChange={(e) => setNewAppUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmAddApp()} placeholder="your-app.com" aria-label="App URL" style={{ outline: 'none' }} className="flex-1 border-0 outline-none bg-transparent text-[15px] min-w-0" autoFocus />
              </label>
              <button onClick={confirmAddApp} disabled={starting} className="vg-press shrink-0 w-[112px] bg-ink text-white rounded-[10px] font-medium text-[14px] disabled:opacity-70 cursor-pointer whitespace-nowrap text-center">{starting ? 'Scanning…' : 'Scan'}</button>
            </div>
          </div>

          {/* divider */}
          <div className="flex items-center gap-3 my-[18px]">
            <span className="flex-1 h-px bg-border" />
            <span className="kicker">Deeper checks · Pro</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {/* Pro options — read the actual code */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <button onClick={openDeep} className="vg-press vg-card text-left bg-white border border-border rounded-[12px] p-4">
              <div className="flex items-center gap-2 font-semibold text-[14.5px]"><BrandLogo name="github" size={16} /> GitHub repo {knownFree && <ProBadge />}</div>
              <div className="text-[13px] text-muted mt-1 leading-[1.5]">Read your code for SQL injection, unverified webhooks, exposed routes, and dependency CVEs.</div>
            </button>
            <button onClick={openUpload} className="vg-press vg-card text-left bg-white border border-border rounded-[12px] p-4">
              <div className="flex items-center gap-2 font-semibold text-[14.5px]"><IconFolder /> Upload a folder {knownFree && <ProBadge />}</div>
              <div className="text-[13px] text-muted mt-1 leading-[1.5]">No GitHub? Upload your project or a <code className="font-mono">.zip</code> — scanned in a sandbox, deleted right after.</div>
            </button>
          </div>
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

function UserBlock({ open, setOpen, email, onSettings, onFeedback, onLogout }: { open: boolean; setOpen: (v: boolean) => void; email: string; onSettings: () => void; onFeedback: () => void; onLogout: () => void }) {
  const initials = (email || '?').slice(0, 2).toUpperCase();
  return (
    <div className="relative mt-[10px]">
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] inset-x-0 bg-white border border-border rounded-[12px] p-[6px] shadow-[var(--shadow-pop)] vg-fade">
          <button onClick={onSettings} className="vg-nav flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left text-ink font-medium text-[14px] transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Settings
          </button>
          <button onClick={onFeedback} className="vg-nav flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left text-ink font-medium text-[14px] transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.4c0 1.7-2.1 2-2.1 3.1M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Help &amp; feedback
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

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.28)' }}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full ${wide ? 'max-w-[500px]' : 'max-w-[420px]'} bg-card border border-border rounded-[16px] p-[26px] vg-pop shadow-[var(--shadow-pop)]`}>
        {children}
      </div>
    </div>
  );
}
