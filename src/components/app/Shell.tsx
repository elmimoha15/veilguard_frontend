'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './state';
import { useAuth, isPaid } from '@/lib/auth';
import { useApps, useMonitorEvents, repoDisplay } from '@/lib/hooks';
import { deriveAlerts, countUnseen } from '@/lib/alerts';
import { api } from '@/lib/api';
import { checkUrl, billingHref } from '@/lib/url';
import { startFailure } from '@/lib/scanError';
import { SUPPORT_MAILTO, LEGAL } from '@/content/site';
import { RepoPicker } from './RepoPicker';
import { UploadPicker } from './UploadPicker';
import { BrandLogo } from '@/components/ui/BrandLogo';
import Logo from '@/components/ui/Logo';
import ActionButton, { ActionInner } from '@/components/ui/ActionButton';
import { GradeChip } from './primitives';
import ScanUsage from './ScanUsage';
import type { Grade } from './data';

const ScanGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /></svg>
);

/**
 * Account avatar: the provider (Google/GitHub) profile photo when we have one,
 * falling back to the ink initials chip if there's no photo or the image fails.
 */
function AvatarChip({ photoURL, initials }: { photoURL?: string | null; initials: string }) {
  const [broken, setBroken] = useState(false);
  if (photoURL && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoURL} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="w-8 h-8 rounded-full object-cover shrink-0 bg-bg-soft" />;
  }
  return <span className="w-8 h-8 rounded-full bg-ink flex items-center justify-center font-mono font-medium text-[11px] shrink-0" style={{ color: '#FFE24D' }}>{initials}</span>;
}

type NavId = 'dashboard' | 'apps' | 'alerts';

const CRUMB: Record<string, string> = {
  dashboard: 'Overview',
  apps: 'My apps',
  app: 'App',
  findings: 'Findings',
  finding: 'Finding',
  monitoring: 'Monitoring',
  alerts: 'Alerts',
  billing: 'Billing',
  settings: 'Settings',
  empty: 'All clear',
  feedback: 'Feedback',
};

/* Inline line-icons (17px, 1.6 stroke) matching the handoff. */
function NavIcon({ id }: { id: NavId | 'billing' | 'settings' }) {
  const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none' } as const;
  switch (id) {
    case 'dashboard':
      return <svg {...p}><path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'apps':
      return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case 'alerts':
      return <svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a1.8 1.8 0 0 0 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'billing':
      return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  }
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { modal, setModal, newAppUrl, setNewAppUrl, toast, setPendingScanId, setActiveSite, activeSite, alertsSeenAt } = useApp();
  const { user, profile, logout } = useAuth();
  const { apps } = useApps();
  const { events } = useMonitorEvents();

  const [mobileNav, setMobileNav] = useState(false);
  const [starting, setStarting] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const paid = isPaid(profile);

  const seg = pathname.replace(/^\//, '').split('/')[0];
  const crumb = seg === 'app' ? (activeSite ?? 'App') : (CRUMB[seg] ?? 'Overview');
  const isActive = (id: string) => pathname === `/${id}` || (id === 'apps' && pathname === '/app');
  // The sidebar badge = UNSEEN alerts (changes since the user last opened Alerts),
  // from the same feed the Alerts page renders, so the number always matches.
  const alertCount = countUnseen(deriveAlerts(apps, events), alertsSeenAt);

  const go = (path: string) => { setMobileNav(false); router.push(path); };
  const openApp = (key: string, host: string) => { setActiveSite(host); go('/app?key=' + encodeURIComponent(key)); };
  const doLogout = async () => { setMobileNav(false); await logout(); router.replace('/login'); };
  const closeModal = () => setModal(null);

  const sideApps = apps;
  const critCount = (a: (typeof apps)[number]) => (a.latest?.counts?.critical ?? 0) + (a.latest?.counts?.high ?? 0);
  const initials = (profile?.email || user?.email || '?').slice(0, 2).toUpperCase();

  const confirmAddApp = async () => {
    const c = checkUrl(newAppUrl);
    if (!c.ok) { toast(c.error!, '#DC2626'); return; }
    setStarting(true);
    const res = await api.createScan(c.url!);
    setStarting(false);
    if (!res.ok || !res.data.scanId) {
      if (res.data.error) console.error('[url scan] start failed:', res.data.error);
      if (res.data.code === 'E_SCAN_LIMIT') { toast(res.data.error || 'You’ve used all your scans this month.', '#D97706'); closeModal(); if (!paid) go(billingHref()); }
      else toast(startFailure(res.status, res.data).message, '#DC2626');
      return;
    }
    closeModal(); setNewAppUrl('');
    setPendingScanId(res.data.scanId);
    toast(`Scanning ${c.url}…`, '#0A0A0A');
  };

  const startDeepScan = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) {
      if (r.data.error) console.error('[deep scan] start failed:', r.data.error);
      if (r.data.code === 'E_SCAN_LIMIT') { toast(r.data.error || 'You’ve used all your scans this month.', '#D97706'); setRepoOpen(false); if (!paid) go(billingHref()); }
      else if (r.status === 409) { toast('Your GitHub connection needs refreshing, reconnect it in Settings, then try again.', '#DC2626'); setRepoOpen(false); go('/settings'); }
      else if (r.status === 502) { toast('We couldn’t verify that repo with GitHub. Give it a moment and try again.', '#DC2626'); }
      else toast(startFailure(r.status, r.data).message, '#DC2626');
      return false;
    }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const startUploadScan = async (zip: Blob, name: string, onProgress?: (frac: number) => void): Promise<boolean> => {
    const r = await api.uploadFolderScan(zip, name, onProgress);
    if (!r.ok || !r.data.scanId) {
      if (r.data.error) console.error('[upload scan] start failed:', r.data.error);
      if (r.status === 402) { toast(r.data.error || 'Folder upload is a Guard feature, upgrade to scan uploaded code.', '#D97706'); setUploadOpen(false); go(billingHref()); }
      else if (r.data.code === 'E_SCAN_LIMIT') { toast(r.data.error || 'You’ve used all your scans this month.', '#D97706'); setUploadOpen(false); }
      else if (r.status === 413) { toast(r.data.error || 'That upload is too large.', '#DC2626'); }
      else if (r.status === 400) { toast(r.data.error || 'We couldn’t open that zip. Try re-zipping your project folder, or just drop the folder itself, and upload again.', '#DC2626'); }
      else toast(startFailure(r.status, r.data).message, '#DC2626');
      return false;
    }
    setUploadOpen(false);
    setPendingScanId(r.data.scanId);
    toast('Scan started', '#0A0A0A');
    return true;
  };

  const openUpload = () => {
    if (!paid) { toast('Folder upload is a Pro feature, upgrade to scan uploaded code.', '#D97706'); closeModal(); go(billingHref()); return; }
    closeModal(); setUploadOpen(true);
  };
  const openDeep = () => {
    if (!paid) { toast('Deep scan is a Pro feature, upgrade to scan your connected code.', '#D97706'); closeModal(); go(billingHref()); return; }
    closeModal(); setRepoOpen(true);
  };
  const onAlerts = () => go('/alerts');

  /* ---- sidebar body (shared desktop + drawer) ---- */
  const sidebarBody = (
    <>
      {/* brand — full Veilguard wordmark at the top of the sidebar */}
      <div className="px-[10px] pt-[3px] pb-4">
        <Logo size={24} />
      </div>

      <SideNavRow icon="dashboard" label="Overview" active={isActive('dashboard')} onClick={() => go('/dashboard')} />
      <SideNavRow icon="apps" label="My apps" active={isActive('apps')} count={apps.length} onClick={() => go('/apps')} />
      <SideNavRow icon="alerts" label="Alerts" active={isActive('alerts')} count={alertCount} onClick={onAlerts} />

      {/* Your apps */}
      <div className="text-[13px] px-[10px] pt-[22px] pb-2" style={{ color: '#A3A3A3' }}>Your apps</div>
      <div className="flex flex-col gap-[1px]">
        {sideApps.slice(0, 3).map((a) => (
          <button
            key={a.key}
            onClick={() => openApp(a.key, a.host)}
            className="vg-nav flex items-center gap-[9px] w-full rounded-[8px] px-[10px] py-[7px] text-left text-[14px] cursor-pointer"
            style={{ color: '#525252', fontWeight: 500 }}
          >
            <GradeChip grade={a.grade as Grade | undefined} />
            <span className="flex-1 truncate">{repoDisplay(a.name)}</span>
            {critCount(a) > 0 && <span className="text-[12.5px] tnum" style={{ color: '#DC2626' }}>{critCount(a)}</span>}
          </button>
        ))}
        {sideApps.length > 3 && (
          <button onClick={() => go('/apps')} className="vg-nav flex items-center gap-[9px] w-full rounded-[8px] px-[10px] py-[7px] text-left text-[13px] cursor-pointer" style={{ color: '#A3A3A3', fontWeight: 500 }}>
            <span className="w-[19px] text-center">⋯</span> {sideApps.length - 3} more
          </button>
        )}
        <button onClick={() => setModal('addApp')} className="vg-nav flex items-center gap-[9px] w-full rounded-[8px] px-[10px] py-[7px] text-left text-[14px] cursor-pointer" style={{ color: '#A3A3A3', fontWeight: 500 }}>
          <span className="w-[19px] text-center">＋</span> Add app
        </button>
      </div>

      {/* New scan, above the account section */}
      <ActionButton onClick={() => setModal('addApp')} icon={<ScanGlyph />} tooltip="Grade an app in ~60s" className="w-full mt-[18px]">
        New scan
      </ActionButton>

      {/* Account */}
      <div className="text-[13px] px-[10px] pt-[20px] pb-2" style={{ color: '#A3A3A3' }}>Account</div>
      <SideNavRow icon="billing" label="Billing" active={isActive('billing')} onClick={() => go('/billing')} />
      <SideNavRow icon="settings" label="Settings" active={isActive('settings')} onClick={() => go('/settings')} />

      {/* Footer, user info + log out */}
      <div className="mt-auto flex flex-col gap-[6px] pt-[18px]">
        <div className="flex items-center gap-[10px] px-[6px] py-[6px] min-w-0">
          <AvatarChip photoURL={user?.photoURL} initials={initials} />
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-ink truncate">{profile?.email || user?.email || 'Account'}</span>
            <span className="block text-[11.5px] truncate" style={{ color: '#A3A3A3' }}>{user?.displayName || 'Signed in'}</span>
          </span>
        </div>
        <button onClick={doLogout} className="vg-nav flex items-center gap-3 w-full rounded-[8px] px-[10px] py-[8px] text-left text-[14px] cursor-pointer" style={{ color: '#737373', fontWeight: 500 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-card flex">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="hidden min-[900px]:flex flex-col gap-[1px] w-[266px] bg-white border-r border-border px-3 py-4 sticky top-0 h-screen overflow-y-auto">
        {sidebarBody}
      </aside>

      {/* ===== Mobile drawer ===== */}
      {mobileNav && (
        <div className="min-[900px]:hidden fixed inset-0 z-[200]">
          <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,.4)' }} onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-[266px] bg-white border-r border-border px-3 py-4 flex flex-col gap-[1px] overflow-y-auto vg-fade" style={{ boxShadow: 'var(--shadow-drawer)' }}>
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* ===== Main column ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border flex items-center gap-[14px] px-[22px] py-3 min-h-[57px]">
          <button aria-label="Menu" onClick={() => setMobileNav((v) => !v)} className="shrink-0 cursor-pointer min-[900px]:hidden" style={{ color: '#A3A3A3' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          </button>
          <span className="text-[14px] shrink-0" style={{ color: '#A3A3A3' }}>
            Veilguard <span className="mx-1">/</span> <span className="text-ink font-medium">{crumb}</span>
          </span>
          <div className="ml-auto flex items-center shrink-0"><ScanUsage /></div>
        </header>

        <main className="flex-1 px-[18px] min-[900px]:px-[34px] pt-[26px] min-[900px]:pt-[44px] pb-[60px] min-[900px]:pb-[80px]">
          <div className="w-full">{children}</div>
        </main>

        <footer className="px-6 py-5 border-t border-border text-center text-[12.5px]" style={{ color: '#A3A3A3' }}>
          <a href={LEGAL.privacy} className="hover:text-muted">Privacy</a>
          <span className="mx-2" aria-hidden>·</span>
          <a href={LEGAL.terms} className="hover:text-muted">Terms</a>
          <span className="mx-2" aria-hidden>·</span>
          <a href={SUPPORT_MAILTO} className="hover:text-muted">Contact</a>
        </footer>
      </div>

      {/* ===== Add-app modal ===== */}
      {modal === 'addApp' && (
        <ModalOverlay onClose={closeModal} label="Add an app">
          <div className="flex items-start justify-between gap-3 mb-[6px]">
            <h2 className="font-medium text-[19px] tracking-[-0.02em] m-0">Add an app</h2>
            <button onClick={closeModal} aria-label="Close" className="vg-press shrink-0 -mt-1 -mr-1 p-1 cursor-pointer" style={{ color: '#A3A3A3' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <p className="text-[14px] mb-[18px]" style={{ color: '#737373' }}>Paste your live link. We grade it in about 60 seconds, no install, no signup.</p>

          <div className="flex items-center gap-[9px] rounded-[10px] px-[14px] min-h-[48px]" style={{ background: '#F7F7F7' }}>
            <span className="font-mono text-[14px]" style={{ color: '#A3A3A3' }}>https://</span>
            <input value={newAppUrl} onChange={(e) => setNewAppUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmAddApp()} placeholder="your-app.com" aria-label="App URL" autoFocus style={{ outline: 'none', background: 'transparent' }} className="flex-1 border-0 text-[15px] min-w-0" />
          </div>
          <ActionButton onClick={confirmAddApp} disabled={starting} icon={<ScanGlyph />} tooltip="~60s · no signup" className="w-full mt-3 h-[46px]">{starting ? 'Scanning…' : 'Run free scan'}</ActionButton>
          <p className="text-[11px] font-medium tracking-[0.03em] text-center mt-3" style={{ color: '#A3A3A3' }}>EXTERNAL CHECKS ONLY · YOUR CODE STAYS YOURS</p>

          <div className="flex items-center gap-3 my-[18px]">
            <span className="flex-1 h-px bg-border" />
            <span className="kicker">Deeper checks · Pro</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <button onClick={openDeep} className="vg-abtn vg-abtn--outline w-full">
              <ActionInner icon={<BrandLogo name="github" size={16} />}><BrandLogo name="github" size={16} /> GitHub repo</ActionInner>
            </button>
            <button onClick={openUpload} className="vg-abtn vg-abtn--outline w-full">
              <ActionInner icon={<IconFolder />}><IconFolder /> Upload a folder</ActionInner>
            </button>
          </div>
        </ModalOverlay>
      )}

      {repoOpen && <RepoPicker onClose={() => setRepoOpen(false)} onScan={startDeepScan} onNeedsConnect={() => { setRepoOpen(false); go('/settings'); }} />}
      {uploadOpen && <UploadPicker onClose={() => setUploadOpen(false)} onScan={startUploadScan} />}
    </div>
  );
}

function SideNavRow({ icon, label, active, count, onClick }: { icon: NavId | 'billing' | 'settings'; label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="vg-nav flex items-center gap-3 w-full rounded-[8px] px-[10px] py-[8px] text-left text-[14px] transition-colors cursor-pointer"
      style={{ background: active ? 'var(--color-bg-soft)' : undefined, color: active ? '#0A0A0A' : '#525252', fontWeight: active ? 600 : 500 }}
    >
      <NavIcon id={icon} />
      <span className="flex-1">{label}</span>
      {count != null && count > 0 && <span className="text-[12.5px] tnum" style={{ color: '#A3A3A3' }}>{count}</span>}
    </button>
  );
}

function IconFolder() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}

function ModalOverlay({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(10,10,10,.4)' }}>
      <div role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] bg-card rounded-[16px] p-[26px] vg-pop" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {children}
      </div>
    </div>
  );
}
