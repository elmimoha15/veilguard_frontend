'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Copies the fix to the clipboard and briefly confirms. */
export default function CopyFixButton({
  text,
  label = 'Copy the fix',
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 rounded-[10px] bg-yellow text-ink font-bold text-[13.5px] px-4 h-10 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]',
        className,
      )}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
