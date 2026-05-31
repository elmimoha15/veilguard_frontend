"use client";

import { motion } from 'framer-motion';

export default function TerminalMockup() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-background-code border border-border shadow-[0_24px_64px_rgba(0,0,0,0.5)] mt-16 relative z-10">
      {/* macOS titlebar */}
      <div className="h-10 bg-[#0A1218] border-b border-border flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-[#EF4444]/80"></div>
        <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80"></div>
        <div className="w-3 h-3 rounded-full bg-[#34D399]/80"></div>
        <div className="mx-auto text-[13px] font-medium text-text-muted select-none">
          my-app — AI agent
        </div>
      </div>

      {/* Terminal content */}
      <div className="p-6 md:p-8 font-mono text-sm leading-[1.8] text-text-body overflow-x-auto">

        {/* User asks AI to add payments */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mb-3"
        >
          <span className="text-accent mr-2">you</span>
          <span className="text-text-heading">Add Stripe payments to my checkout page</span>
        </motion.div>

        {/* AI creates the file */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.8 }}
          className="mb-6 pl-6 text-text-muted"
        >
          <span className="text-status-secure mr-2">✓</span>
          <span>Done. Created <span className="text-[#94A3B8]">app/api/checkout/route.ts</span> with your payment logic.</span>
        </motion.div>

        {/* User asks to scan */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 1.6 }}
          className="mb-3"
        >
          <span className="text-accent mr-2">you</span>
          <span className="text-text-heading">scan this for security issues</span>
        </motion.div>

        {/* Veilguard critical alert */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 2.5 }}
          className="my-5 pl-4 border-l-[3px] border-status-critical bg-status-critical/5 py-4 pr-4 rounded-r-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-status-critical text-[12px] font-bold uppercase tracking-widest">veilguard</span>
            <span className="text-text-faint text-[12px]">·</span>
            <span className="text-text-muted text-[12px]">gentle nudge</span>
          </div>

          {/* Finding */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-status-critical/20 text-status-critical px-2 py-0.5 rounded mt-0.5 shrink-0">
              critical
            </span>
            <span className="text-[#F1F5F9]">
              Your Stripe live key is sitting in your code.
            </span>
          </div>

          {/* The key itself — most dramatic part */}
          <div className="ml-[52px] mb-4 font-mono text-[13px] text-[#F59E0B] bg-[#F59E0B]/5 px-3 py-2 rounded-lg border border-[#F59E0B]/15 w-fit">
            sk_live_51Mrt8K2eZvKYmT...Xk9
          </div>

          {/* Plain English explanation */}
          <div className="ml-[52px] text-[13px] text-text-body leading-relaxed mb-3">
            Anyone who can see your GitHub repo — or just right-clicks{' '}
            <span className="text-[#94A3B8]">&ldquo;View Source&rdquo;</span> on your live site —
            can grab this key and{' '}
            <span className="text-status-critical font-medium">
              charge real money on your customers&apos; cards.
            </span>
          </div>

          {/* Fix — keep it simple */}
          <div className="ml-[52px] text-[12px] text-text-muted">
            Fix{' '}
            <span className="text-text-faint mx-1">→</span>{' '}
            move it to your{' '}
            <span className="text-accent bg-accent-muted px-1.5 py-0.5 rounded">.env</span>{' '}
            file and never touch it again
          </div>
        </motion.div>

        {/* User: fix that */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 4.2 }}
          className="mb-3"
        >
          <span className="text-accent mr-2">you</span>
          <span className="text-text-heading">fix that</span>
        </motion.div>

        {/* AI fixes it */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 5.0 }}
          className="mb-5 pl-6 text-text-muted"
        >
          <span className="text-status-secure mr-2">✓</span>
          <span>Moved to .env. Gone from your code and your git history.</span>
        </motion.div>

        {/* All clear */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 5.8 }}
          className="flex items-center gap-2 text-status-secure text-[13px] font-medium tracking-wide"
        >
          <span className="text-[12px] font-bold uppercase tracking-widest">veilguard</span>
          <span className="text-status-secure/40">·</span>
          <span>all clear ✓</span>
        </motion.div>

      </div>
    </div>
  );
}
