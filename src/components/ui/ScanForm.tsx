'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { checkUrl } from '@/lib/url';
import { api } from '@/lib/api';

/**
 * The primary CTA everywhere: an "https://" prefix + URL input + "Run free scan".
 * Validates the URL client-side (the "is it a real URL?" check), kicks off a
 * real anonymous scan via the backend, stashes the scanId (so it can be claimed
 * after signup), and navigates to the live scanning screen.
 */
export default function ScanForm({
  tone = 'light',
  className,
}: {
  tone?: 'light' | 'onYellow';
  className?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputId = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = checkUrl(url);
    if (!check.ok) { setError(check.error!); return; }
    setError('');
    setBusy(true);
    const res = await api.createScan(check.url!);
    if (!res.ok || !res.data.scanId) {
      setBusy(false);
      setError(res.data.error || 'Could not start the scan. Is the backend running?');
      return;
    }
    try { localStorage.setItem('vg_pending_scan', res.data.scanId); } catch { /* ignore */ }
    router.push(`/scanning?scanId=${res.data.scanId}`);
  };

  return (
    <form onSubmit={submit} className={cn('w-full max-w-[540px]', className)} noValidate>
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl pl-4 pr-2 h-[56px] border',
          tone === 'onYellow' ? 'bg-white border-transparent' : 'bg-bg-soft border-border-2',
          error && 'border-red',
        )}
      >
        <span aria-hidden className="font-mono text-[15px] text-tertiary select-none">https://</span>
        <label htmlFor={inputId} className="sr-only">Your app’s URL</label>
        <input
          id={inputId}
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
          placeholder="myapp.lovable.app"
          aria-label="Your app’s URL"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16px] text-ink placeholder:text-tertiary"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex-shrink-0 inline-flex items-center justify-center h-[42px] px-5 rounded-[10px] bg-ink text-white font-semibold text-[14px] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-70"
        >
          {busy ? 'Starting…' : 'Run free scan'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-red font-semibold">{error}</p>}
    </form>
  );
}
