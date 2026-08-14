'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGitHubRepos, repoDisplay } from '@/lib/hooks';
import { type GitHubRepo } from '@/lib/api';
import { BrandLogo } from '@/components/ui/BrandLogo';

/**
 * Shared GitHub-repo chooser for starting a Deep scan. Used by the top-bar
 * "New scan" chooser and the Apps screen's "Add deep scan" action. `onScan`
 * returns false to keep the modal open (so the user can retry a failed start).
 */
export function RepoPicker({
  onClose,
  onScan,
  onNeedsConnect,
}: {
  onClose: () => void;
  onScan: (fullName: string) => Promise<boolean>;
  onNeedsConnect: () => void;
}) {
  const { repos, loading, error, reload } = useGitHubRepos(true);
  const [q, setQ] = useState('');
  const [starting, setStarting] = useState<string | null>(null);

  const filtered = repos.filter((r) => r.fullName.toLowerCase().includes(q.trim().toLowerCase()));

  const scan = async (repo: GitHubRepo) => {
    if (starting) return;
    setStarting(repo.fullName);
    const ok = await onScan(repo.fullName);
    if (!ok) setStarting(null); // stay open on failure so the user can retry
  };

  if (typeof document === 'undefined') return null;
  // Portal to <body>: a `vg-fade` ancestor holds a transform (animation-fill-mode:
  // both) that would otherwise become the containing block for this `position:
  // fixed` overlay and clip/mis-position it. Rendering at the body escapes it.
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(10,10,10,.28)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[640px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)] flex flex-col max-h-[85vh]">
        <h2 className="shrink-0 font-semibold text-[20px] tracking-[-0.02em] mb-[6px]">Choose a repository</h2>
        <p className="shrink-0 text-[15px] text-muted mb-4">We’ll run a full Deep scan on the repo you pick — code, secrets, RLS &amp; more.</p>

        {error === 'not-connected' ? (
          <div className="text-center py-6">
            <p className="text-[15px] text-muted mb-4">GitHub isn’t connected yet.</p>
            <button onClick={onNeedsConnect} className="vg-press bg-ink text-white font-semibold rounded-[10px] px-5 py-3 text-[15px]">Connect GitHub in Settings</button>
          </div>
        ) : error === 'needs-reconnect' ? (
          <div className="text-center py-6">
            <p className="text-[15px] text-ink font-semibold mb-1">Your GitHub connection needs refreshing</p>
            <p className="text-[14.5px] text-muted mb-4 max-w-[380px] mx-auto">We lost access to your repositories — this usually means the connection was revoked or expired. Reconnect and we’ll pick right back up.</p>
            <button onClick={onNeedsConnect} className="vg-press bg-ink text-white font-semibold rounded-[10px] px-5 py-3 text-[15px]">Reconnect GitHub</button>
          </div>
        ) : (
          <>
            <label className="shrink-0 flex items-center gap-[9px] bg-bg-soft border border-border rounded-[10px] px-[14px] mb-3 focus-within:border-ink transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-tertiary"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search your repositories…"
                aria-label="Search repositories"
                className="flex-1 min-w-0 bg-transparent py-[11px] text-[15px] outline-none border-0"
              />
            </label>
            <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
              {loading ? (
                <div className="flex flex-col gap-2">
                  <div className="vg-skel h-[52px] rounded-xl" />
                  <div className="vg-skel h-[52px] rounded-xl" />
                  <div className="vg-skel h-[52px] rounded-xl" />
                </div>
              ) : error ? (
                <div className="text-[14.5px] text-red py-4 text-center">
                  {error} <button onClick={reload} className="text-yellow-dark font-semibold underline ml-1">Retry</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-[14.5px] text-muted py-6 text-center">{repos.length === 0 ? 'No repositories available. Grant access to more repos in Settings.' : 'No repositories match your search.'}</div>
              ) : (
                <div className="vg-surface overflow-hidden">
                  {filtered.map((r, i) => (
                    <div key={r.fullName} className="vg-row flex items-center gap-3 px-[14px] py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' }}>
                      <BrandLogo name="github" size={18} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14.5px] truncate flex items-center gap-[6px]">
                          {repoDisplay(r.fullName)}
                          {r.private && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-tertiary shrink-0"><title>Private</title><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" /></svg>}
                        </div>
                        <div className="font-mono text-[12px] text-faint truncate">{r.language ?? 'repo'}</div>
                      </div>
                      <button onClick={() => scan(r)} disabled={!!starting} className="vg-press cursor-pointer bg-ink text-white rounded-[10px] px-[14px] py-2 text-[13.5px] font-medium disabled:opacity-60 shrink-0">
                        {starting === r.fullName ? 'Starting…' : 'Scan'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={onClose} className="vg-press cursor-pointer shrink-0 mt-4 w-full bg-card border border-border rounded-[10px] py-[12px] font-medium text-[15px] text-muted">Cancel</button>
      </div>
    </div>,
    document.body,
  );
}

/** Full-panel CTA shown when GitHub isn't connected yet (Deep scan needs it). */
export function ConnectPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="bg-card border border-border rounded-[12px] p-10 text-center">
      <div className="w-14 h-14 rounded-[12px] bg-ink flex items-center justify-center text-white mx-auto mb-3"><BrandLogo name="github" size={26} invert /></div>
      <h2 className="font-semibold text-[20px]">Connect GitHub to run a Deep scan</h2>
      <p className="text-muted text-[15.5px] mt-1 mb-5 max-w-[440px] mx-auto">Read-only access — we clone your repo into a temporary sandbox, scan it, and delete it. We never store your code.</p>
      <button onClick={onConnect} className="vg-press bg-ink text-white font-semibold rounded-[10px] px-6 py-3">Connect GitHub in Settings</button>
    </div>
  );
}
