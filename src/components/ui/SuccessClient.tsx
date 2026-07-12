"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FadeIn from '@/components/ui/FadeIn';

const POLAR_DASHBOARD_URL = 'https://polar.sh/purchases';

const MCP_CONFIG = `{
  "mcpServers": {
    "veilguard": {
      "command": "npx",
      "args": ["-y", "--package=veilguard", "veilguard-mcp"],
      "env": {
        "VEILGUARD_KEY": "paste-your-key-here"
      }
    }
  }
}`;

const CLAUDE_CODE_COMMAND = `claude mcp add veilguard --env VEILGUARD_KEY=paste-your-key-here -- npx -y --package=veilguard veilguard-mcp`;

// Fire a celebratory burst of brand-green confetti once, on mount. Decorative
// only: dynamically imported (keeps it out of the prerender) and skipped for
// users who prefer reduced motion. Any failure is swallowed silently.
function useConfetti() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    void (async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;
        if (cancelled) return;
        const colors = ['#34D399', '#6EE7B7', '#10B981', '#F1F5F9'];
        const fire = (particleRatio: number, opts: Record<string, unknown>) =>
          confetti({
            origin: { y: 0.7 },
            colors,
            particleCount: Math.floor(220 * particleRatio),
            ...opts,
          });
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch {
        // Confetti is purely decorative — ignore load/runtime failures.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the user can still select and copy manually.
    }
  };

  return (
    <div className="relative group bg-background-code border border-border rounded-xl overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-card border border-border text-xs font-medium text-text-body hover:text-text-heading hover:border-border-hover transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Copy
          </>
        )}
      </button>
      {language && (
        <div className="px-5 pt-4 text-[10px] uppercase tracking-widest font-mono text-text-muted">{language}</div>
      )}
      <pre className="px-5 pb-5 pt-3 text-sm font-mono text-text-body overflow-x-auto leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0">
        <div className="w-9 h-9 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm">
          {number}
        </div>
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <h3 className="text-lg font-medium text-text-heading mb-3">{title}</h3>
        <div className="space-y-4 text-sm text-text-body leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function SuccessContent() {
  useConfetti();
  const searchParams = useSearchParams();
  // Polar's success_url placeholder is {CHECKOUT_ID}; the param name depends on
  // how the success URL is configured. Accept the common variants.
  const checkoutId =
    searchParams?.get('checkout') ??
    searchParams?.get('checkout_id') ??
    searchParams?.get('checkoutId') ??
    null;

  return (
    <div className="max-w-2xl mx-auto">
      <FadeIn className="text-center mb-14">
        <div className="w-20 h-20 bg-status-secure/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-status-secure/30 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
          <svg className="w-10 h-10 text-status-secure" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl mb-5">Thank you for your purchase</h1>
        <p className="text-lg text-text-body max-w-xl mx-auto">
          You&apos;re on Veilguard Pro. Your license key is on its way to your inbox — follow the three steps below and Pro features go live the moment your IDE restarts.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="bg-background-card border border-border rounded-2xl p-8 md:p-10 mb-10">
        <div className="space-y-10">
          <Step number={1} title="Copy your license key">
            <p>
              Grab your <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono text-text-heading">VEILGUARD_KEY</code> from the email Polar just sent you, or from your Polar dashboard at{' '}
              <a href={POLAR_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">polar.sh/purchases</a>.
            </p>
          </Step>

          <Step number={2} title="Add the key to your IDE config">
            <p>
              <span className="text-text-heading font-medium">Cursor, VS Code, Windsurf &amp; Antigravity</span> — add Veilguard to your MCP config, then paste your key in place of <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono text-text-heading">paste-your-key-here</code>:
            </p>
            <CodeBlock code={MCP_CONFIG} language="mcp.json" />

            <p className="pt-2">
              <span className="text-text-heading font-medium">Claude Code</span> — run this in your terminal:
            </p>
            <CodeBlock code={CLAUDE_CODE_COMMAND} language="terminal" />

            <p className="pt-2">
              <span className="text-text-heading font-medium">VS Code Extension</span> — open VS Code Settings, search <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono text-text-heading">veilguard</code>, and paste your key into the <span className="text-text-heading">License Key</span> field.
            </p>
          </Step>

          <Step number={3} title="Restart your IDE">
            <p>
              Restart your editor and Pro features are active immediately — full security grades (A+ to F), the exact fix for every finding, and the AI-ready fix prompt.
            </p>
          </Step>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <a
          href={POLAR_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-center px-8 py-3 rounded-full bg-accent text-[#080E12] font-semibold hover:scale-[1.02] transition-transform"
        >
          Go to Polar Dashboard
        </a>
        <Link
          href="/"
          className="w-full sm:w-auto text-center px-8 py-3 rounded-full border border-border text-text-heading font-medium hover:bg-background-card-hover transition-colors"
        >
          Back to Veilguard
        </Link>
      </FadeIn>

      <FadeIn delay={0.3} className="text-center space-y-3">
        <p className="text-sm text-text-muted">
          Need a hand? See the{' '}
          <Link href="/docs" className="text-accent hover:text-accent-hover underline underline-offset-2">full installation guide</Link>{' '}
          or our{' '}
          <Link href="/docs/faq" className="text-accent hover:text-accent-hover underline underline-offset-2">FAQ &amp; troubleshooting</Link>.
        </p>
        {checkoutId && (
          <p className="text-xs text-text-faint font-mono">
            Order reference: {checkoutId}
          </p>
        )}
      </FadeIn>
    </div>
  );
}

export default function SuccessClient() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-text-muted">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
