'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGitHubRepos, repoDisplay } from '@/lib/hooks';
import { type GitHubRepo } from '@/lib/api';
import { BrandLogo } from '@/components/ui/BrandLogo';
import ActionButton from '@/components/ui/ActionButton';

const GithubGlyph = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 4-2.4 4.8-4.7 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.1 10.1 0 0 0 22 12.3C22 6.6 17.5 2 12 2Z" /></svg>;
const ScanGlyph = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /></svg>;

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
        <p className="shrink-0 text-[15px] text-muted mb-4">We’ll run a full Deep scan on the repo you pick, code, secrets, RLS &amp; more.</p>

        {error === 'not-connected' ? (
          <div className="text-center py-6">
            <p className="text-[15px] text-muted mb-4">GitHub isn’t connected yet.</p>
            <div className="flex justify-center"><ActionButton onClick={onNeedsConnect} icon={<GithubGlyph />} tooltip="Read-only" className="h-[44px]">Connect GitHub in Settings</ActionButton></div>
          </div>
        ) : error === 'needs-reconnect' ? (
          <div className="text-center py-6">
            <p className="text-[15px] text-ink font-medium mb-1">Your GitHub connection needs refreshing</p>
            <p className="text-[14.5px] text-muted mb-4 max-w-[380px] mx-auto">We lost access to your repositories, this usually means the connection was revoked or expired. Reconnect and we’ll pick right back up.</p>
            <div className="flex justify-center"><ActionButton onClick={onNeedsConnect} icon={<GithubGlyph />} className="h-[44px]">Reconnect GitHub</ActionButton></div>
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
                  {error} <button onClick={reload} className="text-ink font-semibold underline ml-1">Retry</button>
                </div>
              ) : filtered.length === 0 && repos.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-bg-soft flex items-center justify-center">
                    <BrandLogo name="github" size={22} />
                  </div>
                  <div className="font-semibold text-[16px] text-ink">No repositories to scan yet</div>
                  <p className="text-[14.5px] text-muted mt-1.5 leading-[1.55] max-w-[380px] mx-auto">
                    GitHub is connected, but there’s no code here yet. Push your project to GitHub, once it’s there, it’ll show up in this list and you can scan it.
                  </p>
                  <p className="text-[13px] text-faint mt-3">
                    Already have repos? <button onClick={reload} className="text-ink font-semibold underline">Refresh</button>, or grant access to more in Settings.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-[14.5px] text-muted py-6 text-center">No repositories match your search.</div>
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
                        <div className="font-mono text-[12px] text-faint truncate">
                          {r.language ?? 'repo'}
                          {typeof r.sizeKb === 'number' && r.sizeKb > 200_000 && (
                            <span style={{ color: '#9A6412' }}> · large repo, scan may take a few minutes</span>
                          )}
                        </div>
                      </div>
                      <ActionButton onClick={() => scan(r)} disabled={!!starting} icon={<ScanGlyph />} className="shrink-0 h-9 px-4">
                        {starting === r.fullName ? 'Starting…' : 'Scan'}
                      </ActionButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <ActionButton variant="cancel" onClick={onClose} className="shrink-0 mt-4 w-full h-[46px]">Cancel</ActionButton>
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
      <p className="text-muted text-[15.5px] mt-1 mb-5 max-w-[440px] mx-auto">Read-only access, we clone your repo into a temporary sandbox, scan it, and delete it. We never store your code.</p>
      <div className="flex justify-center"><ActionButton onClick={onConnect} icon={<GithubGlyph />} className="h-[44px]">Connect GitHub in Settings</ActionButton></div>
    </div>
  );
}
