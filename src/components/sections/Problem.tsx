import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { STATS } from '@/content/landing';

export default function Problem() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// THE PROBLEM'}</Eyebrow>
          <h2 className="el-h mt-4 max-w-[22ch] text-[clamp(26px,3.4vw,42px)]">
            The AI wrote code that works. Nobody checked if it was{' '}
            <span className="text-yellow-dark">safe.</span>
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <FadeIn key={s.value} delay={i * 0.08} className="h-full">
              <div className="el-card h-full p-7">
                <div className="text-[clamp(36px,5vw,54px)] font-extrabold leading-[0.95] tracking-[-0.02em] text-ink">
                  {s.value}
                </div>
                <p className="mt-4 text-[15px] leading-[1.5] text-muted">{s.label}</p>
                <p className="mt-4 font-mono text-[11px] tracking-[0.08em] uppercase text-faint">{s.source}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
