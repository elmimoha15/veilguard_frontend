import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { FAQS } from '@/content/landing';

export default function Faq() {
  return (
    <section id="faq" className="bg-bg-soft scroll-mt-20">
      <div className="mx-auto max-w-[820px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="text-center">
          <Eyebrow className="text-yellow-dark">{'// FAQ'}</Eyebrow>
          <h2 className="mt-4">The nervous-founder questions.</h2>
        </FadeIn>

        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-[14px] border border-border bg-card px-6 [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[16px] font-semibold text-ink">
                {f.q}
                <span
                  aria-hidden
                  className="flex-shrink-0 text-[22px] leading-none text-yellow-dark transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 -mt-1 text-[15px] leading-[1.6] text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
