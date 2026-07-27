'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGitHubRepos } from '@/lib/hooks';
import { type GitHubRepo } from '@/lib/api';
import { GitHubIcon } from '@/components/ui/BrandIcons';

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
    <div onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(30,29,27,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[720px] bg-card rounded-[20px] p-8 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)] flex flex-col max-h-[85vh]">
        <h2 className="shrink-0 font-extrabold text-[22px] tracking-[-0.02em] mb-[6px]">Choose a repository</h2>
        <p className="shrink-0 text-[14px] text-muted mb-4">We’ll run a full Deep scan on the repo you pick — code, secrets, RLS &amp; more.</p>

        {error === 'not-connected' ? (
          <div className="text-center py-6">
            <p className="text-[14px] text-muted mb-4">GitHub isn’t connected yet.</p>
            <button onClick={onNeedsConnect} className="vg-press bg-ink text-white font-bold rounded-[11px] px-5 py-3 text-[14px]">Connect GitHub in Settings →</button>
          </div>
        ) : (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Search your repositories…"
              aria-label="Search repositories"
              className="shrink-0 w-full bg-bg-soft border-2 border-border-2 rounded-xl px-[14px] py-[11px] text-[14px] outline-none focus:border-yellow mb-3"
            />
            <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
              {loading ? (
                <div className="flex flex-col gap-2">
                  <div className="vg-skel h-[52px] rounded-xl" />
                  <div className="vg-skel h-[52px] rounded-xl" />
                  <div className="vg-skel h-[52px] rounded-xl" />
                </div>
              ) : error ? (
                <div className="text-[13.5px] text-red py-4 text-center">
                  {error} <button onClick={reload} className="text-yellow-dark font-semibold underline ml-1">Retry</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-[13.5px] text-muted py-6 text-center">{repos.length === 0 ? 'No repositories available. Grant access to more repos in Settings.' : 'No repositories match your search.'}</div>
              ) : (
                <div className="flex flex-col gap-[6px]">
                  {filtered.map((r) => (
                    <div key={r.fullName} className="flex items-center gap-3 p-[10px] rounded-xl border border-border-2">
                      <GitHubIcon size={18} className="shrink-0 text-ink" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] truncate flex items-center gap-[6px]">
                          {r.fullName}
                          {r.private && <span title="Private" className="text-[11px]">🔒</span>}
                        </div>
                        <div className="font-mono text-[11px] text-faint truncate">{r.language ?? 'repo'}</div>
                      </div>
                      <button onClick={() => scan(r)} disabled={!!starting} className="vg-press bg-yellow text-ink rounded-[9px] px-[14px] py-2 text-[13px] font-bold disabled:opacity-60 shrink-0">
                        {starting === r.fullName ? 'Starting…' : 'Scan'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={onClose} className="shrink-0 mt-4 w-full bg-card border border-border-2 rounded-[11px] py-[12px] font-bold text-[14px] text-muted">Cancel</button>
      </div>
    </div>,
    document.body,
  );
}

/** Full-panel CTA shown when GitHub isn't connected yet (Deep scan needs it). */
export function ConnectPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="bg-card border border-border-2 rounded-[20px] p-10 text-center">
      <div className="w-14 h-14 rounded-[14px] bg-ink flex items-center justify-center text-white mx-auto mb-3"><GitHubIcon size={26} /></div>
      <h2 className="font-extrabold text-[20px]">Connect GitHub to run a Deep scan</h2>
      <p className="text-muted text-[14.5px] mt-1 mb-5 max-w-[440px] mx-auto">Read-only access — we clone your repo into a temporary sandbox, scan it, and delete it. We never store your code.</p>
      <button onClick={onConnect} className="vg-press bg-ink text-white font-bold rounded-[11px] px-6 py-3">Connect GitHub in Settings →</button>
    </div>
  );
}
