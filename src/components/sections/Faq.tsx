import { CenterHead } from '@/components/sections/annot/kit';
import { FAQS } from '@/content/landing';

export default function Faq() {
  return (
    <section id="faq" className="an-x an-sec">
      <div className="an-max">
        <CenterHead eyebrow="FAQ" title="What founders ask." />
        <div className="mt-12 mx-auto max-w-[760px] border-t border-b border-[#E8E7E3] divide-y divide-[#E8E7E3]">
          {FAQS.map((f) => (
            <details key={f.q} className="group [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-start justify-between gap-4 py-[22px] cursor-pointer">
                <span className="text-[16px] font-semibold text-ink">{f.q}</span>
                <span className="shrink-0 mt-[3px] text-faint transition-transform duration-200 group-open:rotate-180" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </summary>
              <p className="pb-[22px] -mt-1 text-[14.5px] leading-[1.6] text-muted max-w-[64ch]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
