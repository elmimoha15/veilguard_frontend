import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import CopyFixButton from '@/components/ui/CopyFixButton';
import { FIX_CLIPBOARD } from '@/content/landing';

// Generic cryptic scanner output — what "everyone else" dumps on you.
const NOISE = [
  'CWE-284 · Improper Access Control',
  'CVE-2025-48757 · CVSS 9.1',
  'Missing RLS policy · public.orders',
  'CORS · Access-Control-Allow-Origin: *',
  'Secret key in client bundle',
  'IDOR · GET /api/orders/:id',
  'No rate limit · POST /auth/login',
  'Verbose stack trace exposed',
];

/**
 * THE DIFFERENCE — visualises the promise: other scanners hand you a scary,
 * cryptic list; we translate the one that matters into a plain-English fix.
 */
export default function FindAndFix() {
  return (
    <section id="fix" className="bg-bg scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="max-w-[780px]">
          <Eyebrow className="text-yellow-dark">{'// THE DIFFERENCE'}</Eyebrow>
          <h2 className="el-h mt-4 text-[clamp(26px,3.4vw,42px)]">
            Other scanners hand you a scary list. We hand you the{' '}
            <span style={{ color: '#157A43' }}>fix.</span>
          </h2>
          <p className="mt-4 text-[16px] text-muted max-w-[680px]">
            Every issue comes with a plain-English explanation and the exact repair, so you know which one
            actually matters and exactly what to do about it.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-10 grid gap-5 items-stretch lg:grid-cols-[1fr_auto_1fr]">
          {/* LEFT — the scary, cryptic list */}
          <div className="relative el-card p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-muted">Typical scanner output</span>
              <span className="font-mono text-[12px] font-semibold" style={{ color: '#E5484D' }}>17 issues</span>
            </div>
            <ul className="mt-4 space-y-[11px]">
              {NOISE.map((n) => (
                <li key={n} className="flex items-center gap-2.5 font-mono text-[12.5px] text-muted">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#E5484D' }} />
                  <span className="truncate">{n}</span>
                </li>
              ))}
            </ul>
            {/* fade implies the list just keeps going */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
            <p className="relative mt-4 text-[13px] text-faint">…and no idea which one actually gets you hacked.</p>
          </div>

          {/* connector */}
          <div className="flex lg:flex-col items-center justify-center gap-2 py-1 text-yellow-dark">
            <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase">translated to</span>
            <svg className="rotate-90 lg:rotate-0" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* RIGHT — the one fix that matters */}
          <div className="relative el-card p-6 flex flex-col" style={{ boxShadow: '0 0 0 1.5px var(--color-yellow), var(--shadow-card, 0 1px 2px rgba(0,0,0,0.04))' }}>
            <span className="inline-flex items-center gap-[7px] text-[13px] font-semibold text-ink">
              <span className="w-2 h-2 rounded-full bg-yellow" /> Veilguard
            </span>
            <h3 className="mt-3 font-semibold text-[19px] leading-[1.2] tracking-[-0.01em] text-ink">
              Your orders table is readable by any logged-in user.
            </h3>
            <p className="mt-2 text-[14.5px] leading-[1.55] text-muted">
              In plain English: anyone signed in can read every customer&apos;s orders, names and emails. One
              change closes it.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-bg-soft p-4">
              <span className="inline-flex items-center gap-[6px] text-[11.5px] font-semibold tracking-[0.05em] uppercase text-yellow-dark">
                Do this
              </span>
              <p className="mt-2 text-[14px] leading-[1.5] text-ink">
                Add a Supabase row-level security policy so each user can only read their own rows.
              </p>
              <div className="mt-3">
                <CopyFixButton text={FIX_CLIPBOARD} label="Copy the fix" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
