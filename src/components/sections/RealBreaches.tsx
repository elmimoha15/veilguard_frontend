import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import Pill from '@/components/ui/Pill';
import { REAL_BREACHES, BREACH_STATS } from '@/content/landing';

export default function RealBreaches() {
  return (
    <section className="relative bg-ink text-white bg-dots-dark overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[720px] h-[360px]"
        style={{ background: 'radial-gradient(700px 340px at 90% 0%, rgba(229,53,43,0.16), transparent 62%)' }}
      />
      <div className="relative mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow">{'// IT’S ALREADY HAPPENING'}</Eyebrow>
          <h2 className="mt-4 text-white max-w-[20ch]">
            This isn’t hypothetical. It’s last <span className="text-red-light">Tuesday.</span>
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-white/70">
            Every one of these was a real, working app — often praised for how fast it shipped —
            until someone opened the network tab. The pattern is always the same, and it’s the exact
            pattern Veilguard scans for.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {REAL_BREACHES.map((b, i) => (
            <FadeIn key={b.app} delay={(i % 2) * 0.08}>
              <div className="h-full flex flex-col rounded-[18px] border border-white/[0.14] bg-white/[0.02] p-7">
                <div className="flex items-center gap-3">
                  <span className="text-[20px] font-bold text-white">{b.app}</span>
                  <span className="font-mono text-[12px] text-white/40">{b.when}</span>
                  <Pill className="ml-auto bg-red/[0.16] text-red-light">{b.tag}</Pill>
                </div>
                <p className="mt-4 text-[15px] leading-[1.6] text-white/75">{b.story}</p>
                <div className="mt-5 flex items-start gap-2.5 border-t border-white/10 pt-4">
                  <span aria-hidden className="mt-0.5 text-red-light">↳</span>
                  <p className="text-[14px] leading-[1.5] text-white/85 font-medium">{b.damage}</p>
                </div>
                <a
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-white/45 hover:text-white transition-colors"
                >
                  Source: {b.source} ↗
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Supporting stats */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {BREACH_STATS.map((s, i) => (
            <FadeIn key={s.value} delay={i * 0.08}>
              <div className="h-full rounded-[18px] border border-white/[0.14] bg-white/[0.02] p-6">
                <div className="text-[clamp(32px,4vw,44px)] font-extrabold leading-none tracking-[-0.02em] text-white">
                  {s.value}
                </div>
                <p className="mt-3 text-[14px] leading-[1.5] text-white/70">{s.label}</p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.08em] uppercase text-white/40">
                  {s.source}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
