'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Segment error boundary for the whole signed-in app. If a page throws, this
 * renders in place (inside the app-theme tree) instead of white-screening.
 * `reset()` re-renders the segment; the raw error is logged, never shown.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[app error boundary]', error); }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 vg-fade">
      <div className="w-full max-w-[440px] text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h1 className="font-semibold text-[22px] text-ink tracking-[-0.02em]">Something went wrong on this page</h1>
        <p className="text-muted text-[15px] mt-2 leading-[1.5]">It’s not your fault — we’ve logged it. Reload the page, or head back to your dashboard.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-3 text-[14.5px]">Reload</button>
          <Link href="/dashboard" className="vg-press cursor-pointer text-muted hover:text-ink font-medium rounded-[10px] px-4 py-3 text-[14.5px] border border-border">Go to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
