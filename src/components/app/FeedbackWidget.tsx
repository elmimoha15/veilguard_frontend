'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FeedbackForm from './FeedbackForm';

/**
 * The persistent feedback/help launcher — a small docked pill (bottom-right) that
 * opens a compact panel with the shared form. Keyboard-usable: Esc closes, focus
 * moves into the panel on open and returns to the launcher on close, and Tab is
 * trapped within the open panel. Hidden on the full /feedback page (redundant).
 */
export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Focus into the panel on open; trap Tab; close on Escape or outside click.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('textarea, input, button, a[href]')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (panel && !panel.contains(e.target as Node) && !launcherRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOutside); };
  }, [open, close]);

  if (pathname === '/feedback') return null;

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Feedback and help"
          className="fixed z-[9991] bottom-[80px] right-5 w-[360px] max-w-[calc(100vw-2.5rem)] bg-card border border-border rounded-[16px] p-5 shadow-[0_16px_40px_-14px_rgba(0,0,0,.35)] vg-pop max-h-[calc(100vh-7rem)] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <div className="font-semibold text-[16px] text-ink">Feedback &amp; help</div>
              <div className="text-[13px] text-muted">We read every message.</div>
            </div>
            <button onClick={close} aria-label="Close feedback" className="vg-press shrink-0 -mt-1 -mr-1 p-1 text-tertiary hover:text-ink transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="mt-3">
            <FeedbackForm variant="panel" />
          </div>
          <div className="mt-3 text-center">
            <Link href="/feedback" onClick={() => setOpen(false)} className="text-[13px] text-muted hover:text-ink underline">More options &amp; help articles</Link>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="vg-press fixed z-[9990] bottom-5 right-5 inline-flex items-center gap-2 bg-ink text-white rounded-full pl-[14px] pr-[16px] py-[10px] font-medium text-[14px] shadow-[0_10px_30px_-8px_rgba(0,0,0,.45)] cursor-pointer"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        {open ? 'Close' : 'Feedback'}
      </button>
    </>
  );
}
