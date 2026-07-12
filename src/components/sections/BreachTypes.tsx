import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { BREACH_TYPES } from '@/content/landing';

export default function BreachTypes() {
  return (
    <section id="risks" className="bg-bg scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// WHAT ACTUALLY GOES WRONG'}</Eyebrow>
          <h2 className="mt-4 max-w-[22ch]">
            Six ways a weekend app quietly hands over the keys.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            None of these show up as a bug. Your app looks like it works — because it does. The doors
            it left unlocked are simply invisible until someone walks through one.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BREACH_TYPES.map((b, i) => (
            <FadeIn key={b.title} delay={(i % 3) * 0.08}>
              <div className="h-full flex flex-col rounded-[18px] border border-border bg-card p-7">
                <span
                  aria-hidden
                  className="font-mono text-[13px] font-bold text-tertiary"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-3 h-[3px] w-8 rounded-full bg-red" />
                <h3 className="mt-4 text-[19px]">{b.title}</h3>
                <p className="mt-3 text-[14.5px] leading-[1.55] text-muted">{b.means}</p>
                <div className="mt-4 rounded-[12px] bg-bg-soft p-3.5">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-red font-bold">
                    What it costs you
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink">{b.cost}</p>
                </div>
                {b.seen && (
                  <p className="mt-4 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">
                    Seen in the wild: {b.seen}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
