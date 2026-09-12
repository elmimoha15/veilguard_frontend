'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Segment error boundary for the marketing site. Keeps a page throw from
 * white-screening the whole app; the raw error is logged, never shown.
 */
export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[marketing error boundary]', error); }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6 vg-fade">
      <h1 className="font-bold text-[26px] text-ink tracking-[-0.02em]">Something went wrong</h1>
      <p className="text-[16px] text-muted mt-2 mb-6 max-w-[420px]">This page hit a snag on our end. Try again, or head back home.</p>
      <div className="flex items-center gap-3">
        <button onClick={reset} className="vg-press bg-ink text-white font-medium rounded-[11px] px-6 py-[13px] text-[15px]">Try again</button>
        <Link href="/" className="vg-press text-muted hover:text-ink font-medium rounded-[11px] px-5 py-[13px] text-[15px] border border-border">Back to home</Link>
      </div>
    </div>
  );
}
