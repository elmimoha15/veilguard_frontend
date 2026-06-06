"use client";

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IDES, getIde, MCP_CONFIG, IDE_STORAGE_KEY, type Ide } from '@/lib/ides';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the user can still select and copy manually.
    }
  };
  return (
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
  );
}

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Step {step} of 2</span>
      <div className="flex gap-1.5">
        <span className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-accent' : 'bg-border'}`} />
        <span className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
      </div>
    </div>
  );
}

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const EMPTY_SUBSCRIBE = () => () => {};

export default function StartClient() {
  // Remember the editor across visits without an effect. useSyncExternalStore is
  // SSR-safe (the server snapshot returns null) and React re-reads on the client
  // after hydration, so a returning visitor lands on their saved editor's setup.
  const savedId = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => localStorage.getItem(IDE_STORAGE_KEY),
    () => null,
  );
  // `picked` overrides the saved value once the user acts this session:
  // undefined = follow saved · an Ide = chosen · null = returned to the picker.
  const [picked, setPicked] = useState<Ide | null | undefined>(undefined);
  const selected = picked === undefined ? getIde(savedId) ?? null : picked;

  const choose = (ide: Ide) => {
    setPicked(ide);
    try {
      localStorage.setItem(IDE_STORAGE_KEY, ide.id);
    } catch {
      // Non-fatal — the flow still works without persistence.
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StepDots step={selected ? 2 : 1} />

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={transition}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl mb-5">Which editor do you build in?</h1>
              <p className="text-lg text-text-body max-w-xl mx-auto">
                Pick your editor and we&apos;ll hand you the exact setup. Veilguard is free — all 14
                scanners, every IDE. No account required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {IDES.map((ide) => (
                <button
                  key={ide.id}
                  onClick={() => choose(ide)}
                  className="group flex flex-col text-left p-6 bg-background-card border border-border rounded-xl hover:border-border-hover hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-text-heading group-hover:text-accent transition-colors">{ide.name}</span>
                    {ide.badge && (
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${ide.badgeColor}`}>{ide.badge}</span>
                    )}
                  </div>
                  <span className="text-sm text-text-muted font-mono mb-4">{ide.configPath}</span>
                  <span className="text-sm text-text-body flex-grow">{ide.method}</span>
                  <span className="mt-5 flex items-center gap-1 text-accent text-sm font-medium">
                    Set up <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={transition}
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl mb-4">You&apos;re set up for {selected.name}</h1>
              <p className="text-lg text-text-body max-w-xl mx-auto">
                Add this to your MCP config, restart, and ask your agent to scan. Free finds it — Pro fixes it.
              </p>
            </div>

            {selected.claudeCommand ? (
              <div className="bg-background-card border border-border rounded-2xl p-6 md:p-8 mb-6">
                <div className="text-sm text-text-body mb-3">One command in your terminal:</div>
                <div className="relative bg-background-code border border-border rounded-xl overflow-hidden">
                  <CopyButton text={selected.claudeCommand} />
                  <pre className="px-5 py-5 text-sm font-mono text-text-body overflow-x-auto"><code>{selected.claudeCommand}</code></pre>
                </div>
                <div className="mt-4 text-xs text-text-muted">
                  Free: leave <code className="font-mono text-text-body">VEILGUARD_KEY</code> unset · Pro: append <code className="font-mono text-text-body">--env VEILGUARD_KEY=your_key</code>
                </div>
              </div>
            ) : (
              <div className="bg-background-card border border-border rounded-2xl p-6 md:p-8 mb-6">
                <div className="text-sm font-mono text-text-muted mb-3">
                  Path: <span className="text-accent">{selected.configPath}</span>
                </div>
                <div className="relative bg-background-code border border-border rounded-xl overflow-hidden">
                  <CopyButton text={MCP_CONFIG} />
                  <pre className="px-5 py-5 text-sm font-mono text-text-body overflow-x-auto"><code>{MCP_CONFIG}</code></pre>
                </div>
                <div className="mt-4 text-xs text-text-muted">
                  Free: leave <code className="font-mono text-text-body">VEILGUARD_KEY</code> empty · Pro: paste the key from your email.
                </div>
              </div>
            )}

            <div className="bg-background-code border border-border rounded-2xl p-6 md:p-8 mb-8">
              <div className="text-sm text-text-heading font-medium mb-2">Then run your first scan</div>
              <p className="text-sm text-text-body mb-4">
                Restart {selected.name}, then ask your agent in plain English:
              </p>
              <div className="rounded-xl border border-border/60 bg-[#04080A] px-5 py-4 text-sm font-mono text-accent">
                &ldquo;Scan my project for security issues with Veilguard&rdquo;
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={selected.guideHref}
                className="w-full sm:w-auto text-center px-8 py-3 rounded-full bg-accent text-[#080E12] font-semibold hover:scale-[1.02] transition-transform"
              >
                Open the full {selected.name} guide
              </Link>
              <Link
                href="/pro"
                className="w-full sm:w-auto text-center px-8 py-3 rounded-full border border-border text-text-heading font-medium hover:bg-background-card-hover transition-colors"
              >
                Unlock the fixes with Pro
              </Link>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPicked(null)}
                className="text-sm text-text-muted hover:text-text-heading transition-colors"
              >
                ← Choose a different editor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
