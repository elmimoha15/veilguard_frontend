import Link from 'next/link';
import { ActionInner } from '@/components/ui/ActionButton';
import { CenterHead, PillLabel } from '@/components/sections/annot/kit';
import { PLANS } from '@/content/landing';
import { cn } from '@/lib/utils';

export default function Pricing() {
  return (
    <section id="pricing" className="an-x an-sec">
      <div className="an-max">
        <CenterHead
          eyebrow="Pricing"
          title="Simple pricing."
          sub="Scan and grade free, forever. Pay only when you want the fixes or someone watching your back as you ship."
        />
        <div className="mt-14 grid sm:grid-cols-2 max-w-[820px] mx-auto items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#E8E7E3]">
          {PLANS.map((p, i) => (
            <div key={p.name} className={cn('flex flex-col py-8 sm:py-2', i === 0 ? 'sm:pr-10' : 'sm:pl-10')}>
              <div className="flex items-center gap-2.5">
                <h3 className="text-[20px] font-semibold text-ink">{p.name}</h3>
                {p.badge && <PillLabel>{p.badge}</PillLabel>}
              </div>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[40px] font-semibold tracking-[-0.02em] leading-none text-ink">{p.price}</span>
                {p.cadence && <span className="mb-1.5 text-[14px] text-muted">{p.cadence}</span>}
              </div>
              <p className="mt-2 text-[14px] text-muted">{p.blurb}</p>

              <div className="mt-6 text-[13px] font-semibold text-ink">What&apos;s included</div>
              <ul className="mt-3 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-[2px] shrink-0"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={p.ctaHref} className={cn('mt-8 vg-abtn w-full h-12 text-[15px]', p.featured ? 'vg-abtn--primary' : 'vg-abtn--outline')}>
                <ActionInner>{p.cta}</ActionInner>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
