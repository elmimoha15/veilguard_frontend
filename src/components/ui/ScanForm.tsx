'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { checkUrl } from '@/lib/url';
import { api } from '@/lib/api';
import { useReducedMotion } from '@/lib/useReducedMotion';

const EXAMPLES = ['myapp.lovable.app', 'dashboard.bolt.new', 'app.replit.dev', 'store.supabase.co'];

/** Typewriter placeholder: types out example URLs and loops, pausing while the
 * user is typing. Falls back to a static example under reduced-motion. */
function useTypingPlaceholder(paused: boolean) {
  const reduced = useReducedMotion();
  const [text, setText] = useState('');
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    if (reduced) return;
    let ex = 0, pos = 0, mode: 'type' | 'hold' | 'del' = 'type', t: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (pausedRef.current) { t = setTimeout(tick, 350); return; }
      const word = EXAMPLES[ex];
      if (mode === 'type') {
        pos++; setText(word.slice(0, pos));
        if (pos >= word.length) { mode = 'hold'; t = setTimeout(tick, 1500); return; }
        t = setTimeout(tick, 80);
      } else if (mode === 'hold') { mode = 'del'; t = setTimeout(tick, 200); }
      else {
        pos--; setText(word.slice(0, pos));
        if (pos <= 0) { mode = 'type'; ex = (ex + 1) % EXAMPLES.length; }
        t = setTimeout(tick, 40);
      }
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [reduced]);
  return reduced ? EXAMPLES[0] : text;
}

/**
 * The primary CTA everywhere: an "https://" prefix + URL input + "Run free scan".
 * Validates the URL client-side (the "is it a real URL?" check), kicks off a
 * real anonymous scan via the backend, stashes the scanId (so it can be claimed
 * after signup), and navigates to the live scanning screen.
 */
export default function ScanForm({
  className,
}: {
  /** Kept for API compatibility; the modern field is always a white pill. */
  tone?: 'light' | 'onYellow';
  className?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputId = useId();
  const typed = useTypingPlaceholder(focused || url.length > 0);

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
    <form onSubmit={submit} className={cn('w-full max-w-[560px]', className)} noValidate>
      <div
        className={cn(
          // Modern pill: soft shadow, hairline border, and a gentle yellow focus
          // ring (no hard black outline) that lifts when the field is active.
          'flex items-center gap-2 rounded-2xl pl-5 pr-2 h-[64px] bg-white border transition-all duration-200',
          'shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)]',
          'focus-within:ring-4 focus-within:ring-yellow/30 focus-within:border-yellow/60 focus-within:shadow-[0_16px_50px_-18px_rgba(0,0,0,0.5)]',
          error ? 'border-red focus-within:ring-red/20 focus-within:border-red' : 'border-black/[0.07]',
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? 'myapp.lovable.app' : `${typed}▏`}
          aria-label="Your app’s URL"
          // The pill container shows the focus ring (focus-within); the input
          // itself must not draw the global black focus outline. Inline style
          // beats the unlayered global :focus-visible rule in globals.css.
          style={{ outline: 'none' }}
          className="flex-1 min-w-0 bg-transparent border-0 appearance-none shadow-none text-[16.5px] text-ink placeholder:text-tertiary"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex-shrink-0 inline-flex items-center justify-center h-[48px] px-6 rounded-xl bg-ink text-white font-semibold text-[14.5px] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none disabled:opacity-70"
        >
          {busy ? 'Starting…' : 'Run free scan'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-red font-semibold">{error}</p>}
    </form>
  );
}
