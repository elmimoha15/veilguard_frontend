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
            None of these show up as a bug. Your app looks like it works, because it does. The doors
            it left unlocked are simply invisible until someone walks through one.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BREACH_TYPES.map((b, i) => (
            <FadeIn key={b.title} delay={(i % 3) * 0.08}>
              <div className="group h-full flex flex-col rounded-[20px] border border-border bg-card p-7 transition-[border-color,box-shadow] duration-200 hover:border-black/[0.12] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center justify-center w-11 h-11 rounded-[13px] bg-[rgba(229,53,43,0.08)]" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01"
                        stroke="#E5352B"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span aria-hidden className="font-mono text-[13px] font-semibold text-tertiary tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 text-[18.5px] leading-[1.25]">{b.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.55] text-muted flex-1">{b.means}</p>
                <div className="mt-5 pl-3.5 border-l-2 border-[rgba(229,53,43,0.45)]">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-red font-semibold">
                    What it costs you
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-ink">{b.cost}</p>
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
