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

const NAV: { id: string; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: '◆' },
  { id: 'apps', label: 'My Apps', icon: '▣' },
  { id: 'findings', label: 'Findings', icon: '⚑' },
  { id: 'monitoring', label: 'Monitoring', icon: '◉' },
  { id: 'billing', label: 'Billing', icon: '▤' },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { modal, setModal, newAppUrl, setNewAppUrl, toast, setPendingScanId } = useApp();
  const { user, profile, logout } = useAuth();

  const [userMenu, setUserMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [starting, setStarting] = useState(false);
  // 'choose' = the two-lens picker; 'url' = the URL-input step of the chooser.
  const [scanKind, setScanKind] = useState<'choose' | 'url'>('choose');
  const [repoOpen, setRepoOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  // Deep scan + folder upload are Pro features (free plan scans URLs only).
  const paid = isPaid(profile);

  const isActive = (id: string) => pathname === `/${id}` || (id === 'findings' && pathname.startsWith('/findings'));

  const go = (path: string) => { setUserMenu(false); setMobileNav(false); router.push(path); };

  const doLogout = async () => { setUserMenu(false); await logout(); router.replace('/login'); };

  const closeModal = () => { setModal(null); setScanKind('choose'); };

  const confirmAddApp = async () => {
    const c = checkUrl(newAppUrl);
    if (!c.ok) { toast(c.error!, '#E5352B'); return; }
    setStarting(true);
    const res = await api.createScan(c.url!);
    setStarting(false);
    if (!res.ok || !res.data.scanId) { toast(res.data.error || 'Could not start scan', '#E5352B'); return; }
    closeModal(); setNewAppUrl('');
    setPendingScanId(res.data.scanId);
    router.push(`/scanning?scanId=${res.data.scanId}`);
  };

  const startDeepScan = async (fullName: string): Promise<boolean> => {
    const r = await api.createDeepScan({ githubRepo: fullName });
    if (!r.ok || !r.data.scanId) { toast(r.data.error || 'Could not start the scan', '#E5352B'); return false; }
    setRepoOpen(false);
    setPendingScanId(r.data.scanId);
    router.push(`/scanning?scanId=${r.data.scanId}`);
    return true;
  };

  const startUploadScan = async (zip: Blob, name: string): Promise<boolean> => {
    const r = await api.createUploadScan(zip, name);
    if (!r.ok || !r.data.scanId) {
      if (r.status === 402) { toast('Folder upload is a Pro feature — upgrade to scan uploaded code.', '#F2851F'); setUploadOpen(false); go('/billing'); }
      else toast(r.data.error || 'Could not start the scan', '#E5352B');
      return false;
    }
    setUploadOpen(false);
    setPendingScanId(r.data.scanId);
    router.push(`/scanning?scanId=${r.data.scanId}`);
    return true;
  };

  const openUpload = () => {
    if (!paid) { toast('Folder upload is a Pro feature — upgrade to scan uploaded code.', '#F2851F'); closeModal(); go('/billing'); return; }
    closeModal();
    setUploadOpen(true);
  };

  const openDeep = () => {
    if (!paid) { toast('Deep scan is a Pro feature — upgrade to scan your connected code.', '#F2851F'); closeModal(); go('/billing'); return; }
    closeModal();
    setRepoOpen(true);
  };

  const navButtons = (
    <>
      {NAV.map((n) => {
        const on = isActive(n.id);
        return (
          <button key={n.id} onClick={() => go(`/${n.id}`)} className="flex items-center gap-[11px] border-0 rounded-[10px] px-3 py-[11px] text-left font-semibold text-[14.5px] transition-colors" style={{ background: on ? 'rgba(243,197,0,.16)' : 'transparent', color: on ? '#F3C500' : 'rgba(255,255,255,.75)' }}>
            <span className="w-[18px] text-center">{n.icon}</span>
            {n.label}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="shrink-0 w-[236px] bg-ink px-4 py-[22px] hidden min-[900px]:flex flex-col gap-[6px] sticky top-0 h-screen">
        <div className="px-2 pt-[6px] pb-[18px]">
          <Logo size={34} wordmarkClassName="text-white text-[18px]" />
        </div>
        {navButtons}
        <div className="mt-auto bg-panel rounded-xl p-[14px]">
          <div className="text-[12.5px] text-white/60">Plan</div>
          <div className="font-bold text-white text-[15px] mt-[2px] capitalize">{profile?.plan ?? 'free'}</div>
          <button onClick={() => go('/billing')} className="mt-2 w-full rounded-lg py-2 text-[12.5px] font-bold" style={{ background: 'rgba(243,197,0,.15)', color: '#F3C500' }}>
            {profile?.plan === 'free' || !profile?.plan ? 'Upgrade' : 'Manage billing'}
          </button>
        </div>
        <UserBlock open={userMenu} setOpen={setUserMenu} email={user?.email ?? ''} onSettings={() => go('/settings')} onLogout={doLogout} />
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="min-[900px]:hidden sticky top-0 z-40 bg-ink flex items-center justify-between px-4 h-14">
          <Logo size={30} wordmarkClassName="text-white text-[16px]" />
          <button aria-label="Menu" onClick={() => setMobileNav((v) => !v)} className="text-white text-[22px] px-2">☰</button>
        </div>
        {mobileNav && (
          <div className="min-[900px]:hidden bg-ink px-4 pb-4 flex flex-col gap-1 vg-fade">
            {navButtons}
            <button onClick={() => go('/settings')} className="flex items-center gap-[11px] rounded-[10px] px-3 py-[11px] text-left font-semibold text-[14.5px] text-white/75"><span className="w-[18px] text-center">⚙</span>Settings</button>
            <button onClick={doLogout} className="flex items-center gap-[11px] rounded-[10px] px-3 py-[11px] text-left font-semibold text-[14.5px] text-[#FF8A7A]"><span className="w-[18px] text-center">⏻</span>Log out</button>
          </div>
        )}

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-[10px] border-b border-border-2 px-6 py-[14px] flex items-center gap-[14px]">
          <div className="ml-auto flex items-center gap-[10px]">
            <button onClick={() => setModal('addApp')} className="vg-press flex items-center gap-2 bg-ink text-white rounded-[10px] px-[15px] py-[9px] font-semibold text-[13.5px]">＋ New scan</button>
            <button onClick={() => go('/monitoring')} aria-label="Notifications" className="relative w-10 h-10 bg-card border border-border-2 rounded-[10px] text-[16px]">
              🔔<span className="absolute top-[7px] right-2 w-2 h-2 bg-red rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 pt-7 pb-[60px]">
          <div className="max-w-[1080px] mx-auto">{children}</div>
        </main>
      </div>

      {/* ===== Modals ===== */}
      {modal === 'addApp' && (
        <ModalOverlay onClose={closeModal}>
          {scanKind === 'choose' ? (
            <>
              <h2 className="font-extrabold text-[22px] tracking-[-0.02em] mb-[6px]">New scan</h2>
              <p className="text-[14.5px] text-muted mb-[18px]">Two ways to check an app — pick one now, add the other to the same app later.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setScanKind('url')} className="vg-press text-left bg-bg-soft border-2 border-border-2 rounded-[14px] p-4 hover:border-yellow">
                  <div className="flex items-center gap-2 font-bold text-[15px]">🌐 URL scan <span className="font-mono text-[11px] text-faint font-semibold">~60s · no access</span></div>
                  <div className="text-[13px] text-muted mt-1">What an attacker sees from outside: secrets leaked into your JS bundle, an open Supabase, missing security headers, an exposed <code className="font-mono">.env</code>.</div>
                </button>
                <button onClick={openDeep} className="vg-press text-left bg-bg-soft border-2 border-border-2 rounded-[14px] p-4 hover:border-yellow">
                  <div className="flex items-center gap-2 font-bold text-[15px]"><GitHubIcon size={17} /> Deep scan <span className="text-[10px] font-bold px-[8px] py-[2px] rounded-full" style={{ background: 'rgba(243,197,0,.18)', color: '#9a7b00' }}>PRO</span> <span className="font-mono text-[11px] text-faint font-semibold">connect a repo</span></div>
                  <div className="text-[13px] text-muted mt-1">We read your code (and probe your database) for what the outside can’t see: SQL injection, unverified webhooks, unprotected API routes, dependency CVEs.</div>
                </button>
                <button onClick={openUpload} className="vg-press text-left bg-bg-soft border-2 border-border-2 rounded-[14px] p-4 hover:border-yellow">
                  <div className="flex items-center gap-2 font-bold text-[15px]">📁 Upload a folder <span className="text-[10px] font-bold px-[8px] py-[2px] rounded-full" style={{ background: 'rgba(243,197,0,.18)', color: '#9a7b00' }}>PRO</span></div>
                  <div className="text-[13px] text-muted mt-1">No GitHub? Upload your project folder (or a <code className="font-mono">.zip</code>) for the same deep code checks. We scan it in a sandbox and delete it right after — nothing is stored.</div>
                </button>
              </div>
              <button onClick={closeModal} className="vg-press w-full mt-4 bg-card border border-border-2 rounded-[11px] py-[12px] font-bold text-[14px] text-muted">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setScanKind('choose')} className="text-[13px] text-muted font-semibold mb-2">← Back</button>
              <h2 className="font-extrabold text-[22px] tracking-[-0.02em] mb-[6px]">URL scan</h2>
              <p className="text-[14.5px] text-muted mb-[18px]">Paste your app’s live URL and we’ll grade it in about 60 seconds.</p>
              <label className="flex items-center gap-[9px] bg-bg-soft border-2 border-border-2 rounded-xl px-[15px] min-h-[56px] focus-within:border-yellow">
                <span className="font-mono text-tertiary text-[15px]">https://</span>
                <input value={newAppUrl} onChange={(e) => setNewAppUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmAddApp()} placeholder="your-app.com" aria-label="App URL" className="flex-1 border-0 outline-none bg-transparent text-[16px] min-w-0" autoFocus />
              </label>
              <div className="flex gap-[10px] mt-5">
                <button onClick={closeModal} className="vg-press flex-1 bg-card border border-border-2 rounded-[11px] py-[13px] font-bold text-[14.5px] text-muted">Cancel</button>
                <button onClick={confirmAddApp} disabled={starting} className="vg-press flex-1 bg-yellow text-ink rounded-[11px] py-[13px] font-bold text-[14.5px] disabled:opacity-70">{starting ? 'Starting…' : 'Scan app →'}</button>
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

function UserBlock({ open, setOpen, email, onSettings, onLogout }: { open: boolean; setOpen: (v: boolean) => void; email: string; onSettings: () => void; onLogout: () => void }) {
  const initials = (email || '?').slice(0, 2).toUpperCase();
  return (
    <div className="relative mt-[10px]">
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] inset-x-0 bg-panel border border-white/10 rounded-xl p-[6px] shadow-[0_18px_40px_-14px_rgba(0,0,0,.6)] vg-fade">
          <button onClick={onSettings} className="flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left text-white/85 font-semibold text-[14px]"><span className="w-4 text-center">⚙</span>Settings</button>
          <button onClick={onLogout} className="flex items-center gap-[10px] w-full rounded-[9px] px-[11px] py-[10px] text-left font-semibold text-[14px] text-[#FF8A7A]"><span className="w-4 text-center">⏻</span>Log out</button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="flex items-center gap-[10px] w-full bg-white/5 border border-white/[.08] rounded-xl px-[10px] py-[9px] text-left">
        <span className="w-8 h-8 rounded-[9px] bg-yellow flex items-center justify-center font-extrabold text-[13px] text-ink">{initials}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-[13.5px] text-white truncate">{email || 'Account'}</span>
          <span className="block text-[11.5px] text-white/50 truncate">Signed in</span>
        </span>
        <span className="text-white/50 text-[12px]">⋯</span>
      </button>
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6 vg-fade" style={{ background: 'rgba(30,29,27,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] bg-card rounded-[20px] p-7 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
        {children}
      </div>
    </div>
  );
}
