import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { STEPS } from '@/content/landing';

export default function HowItWorks() {
  return (
    <section id="how" className="bg-bg-soft scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// HOW IT WORKS'}</Eyebrow>
          <h2 className="mt-4">Scan. Understand. Fix.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            No install, no signup, no security degree required. Three steps from “is this a problem?”
            to “done.”
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div className="h-full rounded-[18px] border border-border bg-card p-7">
                <span className="font-mono text-[13px] font-bold text-muted">{s.n}</span>
                <div className="mt-3 h-[3px] w-8 rounded-full bg-yellow" />
                <h3 className="mt-4">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-muted">{s.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
