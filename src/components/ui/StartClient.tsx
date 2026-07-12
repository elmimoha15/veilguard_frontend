"use client";

import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import CommandBox from '@/components/ui/CommandBox';

const INIT_COMMAND = 'npx -y --package=veilguard veilguard-cli init';
const CLAUDE_COMMAND = 'claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp';

const STEPS = [
  { n: 1, title: 'Run the command', desc: 'Open your terminal in your project folder, paste it in, and pick your editor when asked.' },
  { n: 2, title: 'Restart your editor', desc: 'It connects automatically. No config files, no account, no key to start.' },
  { n: 3, title: 'Ask it to scan', desc: 'Tell your AI agent: “Scan my project for security issues.” Findings appear in chat.' },
];

export default function StartClient() {
  return (
    <div className="max-w-2xl mx-auto">
      <FadeIn className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl mb-5">Set up in 30 seconds</h1>
        <p className="text-lg text-text-body max-w-xl mx-auto">
          One command sets up Veilguard in Cursor, Windsurf, VS Code, or Antigravity. It&apos;s free —
          all 14 scanners, no account required.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <CommandBox command={INIT_COMMAND} />
        <p className="text-center text-xs text-text-muted mt-3">
          Run it from inside your project folder — Veilguard installs the rules into the project you&apos;re in.
        </p>
      </FadeIn>

      <FadeIn delay={0.15} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-background-card border border-border rounded-xl p-5">
            <div className="w-7 h-7 rounded-full bg-accent-muted border border-accent/30 grid place-items-center text-accent font-semibold text-sm mb-3">
              {s.n}
            </div>
            <div className="text-sm font-medium text-text-heading mb-1">{s.title}</div>
            <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </FadeIn>

      {/* Claude Code — its own first-class option, set apart with an accent border */}
      <FadeIn delay={0.2} className="mt-8 rounded-xl border border-accent/30 bg-accent-muted/30 px-5 py-5">
        <div className="text-sm text-text-body mb-3">
          Prefer <span className="text-text-heading font-medium">Claude Code</span>? It has its own one-liner — run this instead:
        </div>
        <CommandBox command={CLAUDE_COMMAND} label="Claude Code" />
      </FadeIn>

      {/* Pro upsell */}
      <FadeIn delay={0.25} className="mt-10 rounded-2xl border border-accent/30 bg-accent-muted/40 p-6 sm:p-8 text-center">
        <div className="text-xl font-medium text-text-heading mb-2">Free finds it. Pro fixes it.</div>
        <p className="text-sm text-text-body max-w-md mx-auto mb-5">
          Free flags every vulnerability. Veilguard Pro unlocks the exact fix for each one, your full
          security grade (A+ to F), and an AI-ready prompt that patches everything in one paste.
        </p>
        <Link
          href="/pro"
          className="inline-block px-7 py-3 rounded-full bg-accent text-[#080E12] font-semibold hover:scale-[1.02] transition-transform"
        >
          See Pro — $19/mo
        </Link>
      </FadeIn>

      <FadeIn delay={0.3} className="text-center mt-8">
        <p className="text-sm text-text-muted">
          Prefer to set it up by hand? See the{' '}
          <Link href="/docs" className="text-accent hover:text-accent-hover underline underline-offset-2">manual install guides</Link>{' '}
          for each editor.
        </p>
      </FadeIn>
    </div>
  );
}
