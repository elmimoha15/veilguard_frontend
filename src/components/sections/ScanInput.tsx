'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionInner } from '@/components/ui/ActionButton';
import { checkUrl, probeReachable } from '@/lib/url';

/** Big vibecoding-host URLs the placeholder types through, one after another. */
const SAMPLES = [
  'yourapp.lovable.app',
  'yourapp.vercel.app',
  'yourapp.bolt.new',
  'yourapp.replit.app',
  'yourproject.v0.app',
  'yourstore.webflow.io',
];

/**
 * Hero scan box: paste an app URL and go. The placeholder types out real
 * vibecoding hosts on a loop (typewriter effect) until the user starts typing.
 */
export default function ScanInput() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [placeholder, setPlaceholder] = useState('yourapp.lovable.app');
  const typing = value.length === 0;

  useEffect(() => {
    if (!typing) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPlaceholder('Paste your app URL');
      return;
    }
    let word = 0;
    let count = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const target = SAMPLES[word];
      count += deleting ? -1 : 1;
      setPlaceholder(target.slice(0, count));
      if (!deleting && count === target.length) {
        deleting = true;
        timer = setTimeout(tick, 1700);
        return;
      }
      if (deleting && count === 0) {
        deleting = false;
        word = (word + 1) % SAMPLES.length;
      }
      timer = setTimeout(tick, deleting ? 40 : 85);
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [typing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    // 1) Format check: valid, public URL.
    const c = checkUrl(value);
    if (!c.ok) { setError(c.error || 'Enter a valid, live URL, e.g. yourapp.com'); return; }
    // 2) Liveness check: refuse a URL we can't reach, so onboarding only ever gets
    //    a working, live app. Stay on the page and say why.
    setError('');
    setChecking(true);
    const live = await probeReachable(c.url!);
    if (!live) {
      setChecking(false);
      setError('We couldn’t reach that URL. Enter a live, working app that’s deployed and loading.');
      return;
    }
    // Hand the URL to onboarding so it skips the URL step and scans it after signup.
    router.push(`/onboarding?url=${encodeURIComponent(c.url!)}`);
  };

  return (
    <form onSubmit={submit} className="mt-9 w-full max-w-[540px]" noValidate>
      <div className={`flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 border shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] transition-colors ${error ? 'border-[#E5484D] focus-within:border-[#E5484D]' : 'border-[#E4E3DF] focus-within:border-[#F3C500]'}`}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink/45" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <input
          type="text"
          inputMode="url"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(''); }}
          placeholder={placeholder}
          aria-label="Your app URL"
          aria-invalid={!!error}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-ink/40 outline-none"
          style={{ outline: 'none' }}
        />
        <button type="submit" disabled={checking} className="vg-abtn vg-abtn--primary h-11 px-5 shrink-0" data-tip="~60s · free, no signup">
          <ActionInner>{checking ? 'Checking…' : 'Scan my app'}</ActionInner>
        </button>
      </div>
      {error && <p role="alert" className="mt-2.5 pl-1 text-[13.5px] font-semibold text-[#E5484D]">{error}</p>}
    </form>
  );
}
