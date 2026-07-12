import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { STATS } from '@/content/landing';

export default function Problem() {
  return (
    <section className="relative bg-ink text-white bg-dots-dark">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn>
          <Eyebrow className="text-yellow">{'// THE PROBLEM'}</Eyebrow>
          <h2 className="mt-4 max-w-[20ch] text-white">
            The AI wrote code that works. Nobody checked if it was{' '}
            <span className="text-yellow">safe.</span>
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <FadeIn key={s.value} delay={i * 0.08}>
              <div className="h-full rounded-[18px] border border-white/[0.14] bg-white/[0.02] p-7">
                <div className="text-[clamp(42px,5vw,60px)] font-extrabold leading-[0.9] tracking-[-0.02em] text-white">
                  {s.value}
                </div>
                <p className="mt-4 text-[15px] leading-[1.5] text-white/70">{s.label}</p>
                <p className="mt-4 font-mono text-[11px] tracking-[0.08em] uppercase text-white/40">
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
