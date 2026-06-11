"use client";

import { useState } from 'react';

// One copyable command box used everywhere a terminal command appears, so every
// command on the site looks identical and is one click to copy.
export default function CommandBox({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the user can still select the text manually.
    }
  };

  // Accent the binary (first token) for a terminal feel.
  const [first, ...rest] = command.split(' ');

  return (
    <div>
      {label && (
        <div className="text-[10px] uppercase tracking-widest font-mono text-accent mb-2">{label}</div>
      )}
      <div className="relative bg-background-code border border-border rounded-xl">
        <div className="flex items-center gap-3 px-5 py-4 pr-14 overflow-x-auto">
          <span className="text-text-faint select-none font-mono text-sm">$</span>
          <code className="font-mono text-sm md:text-[15px] text-text-body whitespace-nowrap">
            <span className="text-accent">{first}</span> {rest.join(' ')}
          </code>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy command"
          className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-lg bg-background-card border border-border text-text-muted hover:text-text-heading hover:border-border-hover transition-colors"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
