'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionButton from '@/components/ui/ActionButton';
import { cn } from '@/lib/utils';
import { checkUrl, probeReachable } from '@/lib/url';
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
 * Validates the URL client-side (the "is it a real URL?" check), then hands the
 * URL to onboarding (`/onboarding?url=…`). Onboarding skips its own URL step,
 * signs the user up, and runs the scan on their account (gated result). Marketing
 * pages can't reach the app's AppStateProvider, so the URL travels as a query param.
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
    if (busy) return;
    const check = checkUrl(url);
    if (!check.ok) { setError(check.error!); return; }
    setError('');
    setBusy(true);
    // Refuse a URL we can't reach so onboarding only ever gets a live, working app.
    const live = await probeReachable(check.url!);
    if (!live) {
      setBusy(false);
      setError('We couldn’t reach that URL. Enter a live, working app that’s deployed and loading.');
      return;
    }
    router.push(`/onboarding?url=${encodeURIComponent(check.url!)}`);
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
        <ActionButton
          type="submit"
          disabled={busy}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /></svg>}
          tooltip="~60s · free, no signup"
          className="flex-shrink-0 h-[48px] px-6 text-[14.5px]"
        >
          {busy ? 'Checking…' : 'Run free scan'}
        </ActionButton>
      </div>
      {error && <p className="mt-2 text-[13px] text-red font-semibold">{error}</p>}
    </form>
  );
}
