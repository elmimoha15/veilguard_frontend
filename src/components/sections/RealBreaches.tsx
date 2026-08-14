import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { REAL_BREACHES, BREACH_STATS } from '@/content/landing';

export default function RealBreaches() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// IT’S ALREADY HAPPENING'}</Eyebrow>
          <h2 className="el-h mt-4 max-w-[20ch] text-[clamp(26px,3.4vw,42px)]">
            This isn’t hypothetical. It’s last <span className="text-yellow-dark">Tuesday.</span>
          </h2>
          <p className="mt-4 text-[16.5px] leading-[1.6] text-muted max-w-[60ch]">
            Every one of these was a real, working app, often praised for how fast it shipped, until someone
            opened the network tab. The pattern is the same one Veilguard scans for.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {REAL_BREACHES.map((b, i) => (
            <FadeIn key={b.app} delay={(i % 2) * 0.08} className="h-full">
              <div className="el-card h-full flex flex-col p-7">
                <div className="flex items-center gap-3">
                  <span className="text-[19px] font-bold text-ink">{b.app}</span>
                  <span className="font-mono text-[12px] text-faint">{b.when}</span>
                </div>
                <p className="mt-4 text-[15px] leading-[1.6] text-muted flex-1">{b.story}</p>
                <div className="mt-5 flex items-start gap-2.5 pl-3 border-l-2 border-yellow">
                  <p className="text-[14px] leading-[1.5] text-ink font-medium">{b.damage}</p>
                </div>
                <a
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-faint hover:text-ink transition-colors"
                >
                  Source: {b.source} ↗
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {BREACH_STATS.map((s, i) => (
            <FadeIn key={s.value} delay={i * 0.08}>
              <div className="el-card h-full p-6">
                <div className="text-[clamp(28px,4vw,42px)] font-extrabold leading-none tracking-[-0.02em] text-ink">
                  {s.value}
                </div>
                <p className="mt-3 text-[14px] leading-[1.5] text-muted">{s.label}</p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.08em] uppercase text-faint">{s.source}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
