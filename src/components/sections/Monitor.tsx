import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { MONITOR_ALERT } from '@/content/landing';

// Deploy history with the grade at each one; #47 broke, we caught it, #48 fixed.
const DEPLOYS = [
  { n: 44, grade: 'B', ok: true },
  { n: 45, grade: 'B', ok: true },
  { n: 46, grade: 'B', ok: true },
  { n: 47, grade: 'D', ok: false },
  { n: 48, grade: 'B', ok: true },
];

/**
 * ALWAYS ON — visualises monitoring as a live deploy timeline + grade trend: a
 * run of clean deploys, one that breaks (grade drops, red), an instant email
 * alert, then a recovery. Custom marketing viz, not the app's UI.
 */
export default function Monitor() {
  const a = MONITOR_ALERT;
  return (
    <section className="bg-bg-soft">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)] grid gap-12 lg:grid-cols-2 lg:items-center">
        <FadeIn>
          <Eyebrow className="text-yellow-dark">{'// ALWAYS ON'}</Eyebrow>
          <h2 className="mt-4">You’ll keep vibe-coding. We’ll keep watching.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted max-w-[46ch]">
            Every new feature can open a new hole. Veilguard re-scans your app on every deploy and
            emails you the moment something breaks, so a shipping streak never turns into a breach.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} direction="left">
          <div className="el-card p-6 sm:p-7">
            {/* header: app + live status */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] text-ink truncate">{a.app}</span>
              <span className="ml-auto inline-flex items-center gap-[7px] text-[12.5px] font-medium text-ink">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping" style={{ background: '#1F9D57' }} />
                  <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#1F9D57' }} />
                </span>
                Monitoring on
              </span>
            </div>

            {/* deploy timeline + grade trend */}
            <div className="mt-8 relative">
              <div className="absolute left-[10%] right-[10%] top-[9px] h-px" style={{ background: 'var(--color-border)' }} />
              <div className="grid grid-cols-5">
                {DEPLOYS.map((d) => {
                  const color = d.ok ? '#1F9D57' : '#E5484D';
                  const tint = d.ok ? { bg: '#EAF6EF', fg: '#157A43' } : { bg: '#FBEAEA', fg: '#E5484D' };
                  return (
                    <div key={d.n} className="flex flex-col items-center gap-3">
                      <span className="relative flex items-center justify-center h-[18px]">
                        {!d.ok && <span className="absolute w-5 h-5 rounded-full opacity-30 animate-ping" style={{ background: color }} />}
                        <span className="relative w-[11px] h-[11px] rounded-full ring-4 ring-card" style={{ background: color }} />
                      </span>
                      <span className="w-8 h-8 rounded-[9px] inline-flex items-center justify-center font-semibold text-[15px] tnum" style={{ background: tint.bg, color: tint.fg }}>
                        {d.grade}
                      </span>
                      <span className="font-mono text-[10.5px] text-faint">#{d.n}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* the instant email alert */}
            <div className="mt-7 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-[1px] w-7 h-7 rounded-full inline-flex items-center justify-center" style={{ background: '#FBEAEA' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#E5484D" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M12 9v4.5M12 16.6v.4" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">{a.title} after {a.deploy}</div>
                  <p className="text-[13px] leading-[1.5] text-muted mt-[3px]">{a.body}</p>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[12px] font-semibold" style={{ color: '#E5484D' }}>grade {a.gradeFrom} → {a.gradeTo}</span>
                    <span className="font-mono text-[11px] text-faint">emailed you in 2 min</span>
                  </div>
                </div>
              </div>
              <button className="mt-3 inline-flex items-center h-9 px-4 rounded-[10px] bg-ink text-white font-medium text-[13.5px]">
                View the fix →
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
