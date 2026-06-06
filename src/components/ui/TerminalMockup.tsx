"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

const EASE = [0.22, 1, 0.36, 1] as const;

function reveal(delay: number) {
  return {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease: EASE, delay },
  };
}

// AI coding agent avatar — a small sparkle tile.
function AgentAvatar() {
  return (
    <div className="w-7 h-7 shrink-0 rounded-lg bg-background-card border border-border grid place-items-center">
      <svg className="w-4 h-4 text-text-body" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
      </svg>
    </div>
  );
}

function VeilguardAvatar() {
  return (
    <div className="w-7 h-7 shrink-0 rounded-lg bg-background-card border border-border grid place-items-center overflow-hidden">
      <Image src="/logos/logo-icon.png" width={18} height={18} alt="Veilguard" className="w-[18px] h-[18px] object-contain" />
    </div>
  );
}

// User message — right-aligned bubble with a small avatar.
function UserMessage({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div {...reveal(delay)} className="flex items-end justify-end gap-2.5">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-background-card-hover border border-border px-4 py-2.5 text-[14px] leading-relaxed text-text-heading">
        {text}
      </div>
      <div className="w-7 h-7 shrink-0 rounded-full bg-accent-muted border border-accent/20 grid place-items-center">
        <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    </motion.div>
  );
}

export default function TerminalMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-background-code border border-border shadow-[0_24px_64px_rgba(0,0,0,0.5)] mt-16 relative z-10 text-left">
      {/* IDE-style title bar */}
      <div className="h-11 bg-[#0A1218] border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
          <span className="w-3 h-3 rounded-full bg-[#34D399]/80" />
        </div>
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-text-muted select-none">
          <span className="font-mono text-text-body">my-app</span>
          <span className="text-text-faint">—</span>
          <span>AI Agent</span>
        </div>
      </div>

      {/* Chat thread */}
      <div className="p-4 sm:p-6 space-y-5">
        <UserMessage text="Add Stripe payments to my checkout page" delay={0} />

        {/* AI response */}
        <motion.div {...reveal(0.2)} className="flex gap-3">
          <AgentAvatar />
          <div className="min-w-0 pt-0.5">
            <div className="text-[12px] font-medium text-text-muted mb-1">AI Agent</div>
            <p className="text-[14px] leading-relaxed text-text-body">
              <span className="text-status-secure mr-1.5">✓</span>
              Done. Created{' '}
              <code className="font-mono text-[13px] text-text-heading bg-background-card border border-border rounded px-1.5 py-0.5">app/api/checkout/route.ts</code>{' '}
              with your payment logic.
            </p>
          </div>
        </motion.div>

        <UserMessage text="scan this for security issues" delay={0.4} />

        {/* Veilguard — critical finding */}
        <motion.div {...reveal(0.6)} className="flex gap-3">
          <VeilguardAvatar />
          <div className="min-w-0 flex-1 rounded-xl rounded-tl-md border border-border border-l-[3px] border-l-status-critical bg-status-critical/[0.06] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-status-critical">Veilguard</span>
              <span className="text-text-faint text-[11px]">·</span>
              <span className="text-[12px] text-text-muted">gentle nudge</span>
            </div>

            <div className="flex items-start gap-2.5 mb-3">
              <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider bg-status-critical/20 text-status-critical px-2 py-0.5 rounded">
                Critical
              </span>
              <span className="text-[14px] leading-relaxed text-text-heading">
                Your Stripe live key is sitting in your code.
              </span>
            </div>

            {/* The leaked key */}
            <div className="mb-3.5 font-mono text-[13px] text-status-warning bg-[#04080A] border border-border rounded-lg px-3 py-2 overflow-x-auto">
              sk_live_51Mrt8K2eZvKYmT...Xk9
            </div>

            <p className="text-[13.5px] leading-relaxed text-text-body mb-3.5">
              Anyone who can see your GitHub repo — or just right-clicks{' '}
              <span className="text-text-heading">&ldquo;View Source&rdquo;</span> on your live site — can grab this key and{' '}
              <span className="text-status-critical font-medium">charge real money on your customers&apos; cards.</span>
            </p>

            <div className="text-[13px] text-text-muted flex items-center flex-wrap gap-x-1.5 gap-y-1">
              <span className="text-text-body font-medium">Fix</span>
              <span className="text-text-faint">→</span>
              <span>move it to your</span>
              <code className="font-mono text-accent bg-accent-muted rounded px-1.5 py-0.5">.env</code>
              <span>file and never touch it again</span>
            </div>
          </div>
        </motion.div>

        <UserMessage text="fix that" delay={0.9} />

        {/* AI response */}
        <motion.div {...reveal(1.1)} className="flex gap-3">
          <AgentAvatar />
          <div className="min-w-0 pt-0.5">
            <div className="text-[12px] font-medium text-text-muted mb-1">AI Agent</div>
            <p className="text-[14px] leading-relaxed text-text-body">
              <span className="text-status-secure mr-1.5">✓</span>
              Moved to{' '}
              <code className="font-mono text-[13px] text-text-heading bg-background-card border border-border rounded px-1.5 py-0.5">.env</code>. Gone from your code and your git history.
            </p>
          </div>
        </motion.div>

        {/* Veilguard — all clear */}
        <motion.div {...reveal(1.3)} className="flex gap-3">
          <VeilguardAvatar />
          <div className="min-w-0 flex-1 rounded-xl rounded-tl-md border border-border border-l-[3px] border-l-status-secure bg-status-secure/[0.06] px-4 py-3 sm:px-5 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-status-secure">Veilguard</span>
            <span className="text-text-faint text-[11px]">·</span>
            <span className="text-[13px] text-status-secure font-medium">all clear ✓</span>
          </div>
        </motion.div>
      </div>

      {/* Chat input bar — completes the IDE feel (non-interactive) */}
      <div className="border-t border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 rounded-xl bg-background-card border border-border px-4 py-2.5">
          <span className="text-[14px] text-text-faint flex-1 select-none">Ask the agent…</span>
          <span className="text-[11px] font-mono text-text-faint border border-border rounded px-1.5 py-0.5 select-none hidden sm:inline">⌘K</span>
          <div className="w-7 h-7 shrink-0 rounded-lg bg-accent/90 grid place-items-center">
            <svg className="w-4 h-4 text-[#080E12]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
