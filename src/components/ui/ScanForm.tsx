'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The primary CTA everywhere: an "https://" prefix + URL input + "Run free scan".
 * The live scan runs on the homepage flow, so submitting scrolls to the "How it
 * works" section on this page, or navigates home to it from other pages. When a
 * live scan backend is wired up, swap this handler to kick off the real scan.
 */
export default function ScanForm({
  tone = 'light',
  className,
}: {
  tone?: 'light' | 'onYellow';
  className?: string;
}) {
  const [url, setUrl] = useState('');
  const inputId = useId();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = document.getElementById('how');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      const q = url.trim() ? `?url=${encodeURIComponent(url.trim())}` : '';
      window.location.assign(`/${q}#how`);
    }
  };

  return (
    <form onSubmit={submit} className={cn('w-full max-w-[540px]', className)} noValidate>
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl pl-4 pr-2 h-[56px] border',
          tone === 'onYellow' ? 'bg-white border-transparent' : 'bg-bg-soft border-border-2',
        )}
      >
        <span aria-hidden className="font-mono text-[15px] text-tertiary select-none">https://</span>
        <label htmlFor={inputId} className="sr-only">
          Your app’s URL
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="myapp.lovable.app"
          aria-label="Your app’s URL"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16px] text-ink placeholder:text-tertiary"
        />
        <button
          type="submit"
          className="flex-shrink-0 inline-flex items-center justify-center h-[42px] px-5 rounded-[10px] bg-ink text-white font-semibold text-[14px] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
        >
          Run free scan
        </button>
      </div>
    </form>
  );
}
