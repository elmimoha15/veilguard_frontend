import { CenterHead } from '@/components/sections/annot/kit';
import { REAL_BREACHES, BREACH_SUPPORT } from '@/content/landing';

/** "It's already happening" — real, sourced breaches of AI-built apps, Annot cards. */
export default function RealBreaches() {
  return (
    <section id="breaches" className="an-x an-sec scroll-mt-20">
      <div className="an-max">
        <CenterHead
          eyebrow="It's already happening"
          title="This isn't hypothetical. It's last Tuesday."
          sub="Every one of these was a real, working app, often praised for how fast it shipped, until someone opened the network tab. The pattern is the same one Veilguard scans for."
        />

        <div className="mt-14 grid gap-px bg-[#E8E7E3] md:grid-cols-2">
          {REAL_BREACHES.map((b) => (
            <div key={b.app} className="bg-white px-7 py-8 flex flex-col">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-[17px] font-semibold text-ink">{b.app}</span>
                <span className="text-[12.5px] text-faint">{b.when}{b.tag ? ` · ${b.tag}` : ''}</span>
              </div>
              <p className="mt-3.5 text-[14.5px] leading-[1.6] text-muted flex-1">{b.story}</p>
              <p className="mt-4 text-[14px] leading-[1.5] text-ink font-medium">{b.damage}</p>
              {b.href ? (
                <a href={b.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-faint hover:text-ink transition-colors">
                  Source: {b.source} ↗
                </a>
              ) : (
                <span className="mt-4 text-[12px] text-faint">Source: {b.source}</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 mx-auto max-w-[68ch] text-center text-[15px] leading-[1.6] text-muted">{BREACH_SUPPORT}</p>
      </div>
    </section>
  );
}
