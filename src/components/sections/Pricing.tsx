import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { PLANS } from '@/content/landing';
import { cn } from '@/lib/utils';

export default function Pricing() {
  return (
    <section id="pricing" className="bg-card scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[720px]">
          <Eyebrow className="text-yellow-dark">{'// PRICING'}</Eyebrow>
          <h2 className="mt-4">Scan free. Pay only to fix.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            The grade and every issue are free, forever. You only pay when you want the fixes or
            someone watching your back as you ship.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((p, i) => {
            const featured = p.featured;
            return (
              <FadeIn key={p.name} delay={i * 0.08} className="h-full">
                <div
                  className={cn(
                    'relative h-full flex flex-col rounded-[20px] p-8 border',
                    featured
                      ? 'bg-ink text-white border-2 border-yellow'
                      : 'bg-card text-ink border-border-2',
                  )}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-yellow text-ink font-mono font-bold text-[10px] tracking-[0.12em] uppercase px-3 py-1">
                      {p.badge}
                    </span>
                  )}
                  <h3 className={cn('text-[20px] font-bold', featured ? 'text-white' : 'text-ink')}>
                    {p.name}
                  </h3>
                  <div className="mt-3 flex items-end gap-1.5">
                    <span className="text-[52px] font-extrabold leading-none tracking-[-0.02em]">
                      {p.price}
                    </span>
                    {p.cadence && (
                      <span className={cn('mb-1.5 text-[15px]', featured ? 'text-white/60' : 'text-muted')}>
                        {p.cadence}
                      </span>
                    )}
                  </div>
                  <p className={cn('mt-2 text-[14px]', featured ? 'text-white/60' : 'text-muted')}>
                    {p.blurb}
                  </p>

                  <div className={cn('my-6 h-px', featured ? 'bg-white/10' : 'bg-border')} />

                  <ul className="space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14.5px]">
                        <span className="mt-0.5 text-green font-bold" aria-hidden>✓</span>
                        <span className={featured ? 'text-white/85' : 'text-ink'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={p.ctaHref}
                    className={cn(
                      'mt-8 inline-flex items-center justify-center h-12 rounded-xl font-semibold text-[15px] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]',
                      featured ? 'bg-yellow text-ink font-bold' : 'bg-ink text-white',
                    )}
                  >
                    {p.cta}
                  </Link>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
