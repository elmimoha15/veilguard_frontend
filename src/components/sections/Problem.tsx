import { CenterHead } from '@/components/sections/annot/kit';
import { PROBLEM_STATS } from '@/content/landing';

/**
 * The Problem — verified, sourced numbers behind the "AI ships fast, security lags"
 * gap, in the Annot look: centered header + white stat cards on the warm canvas.
 */
export default function Problem() {
  return (
    <section id="problem" className="an-x an-sec scroll-mt-20">
      <div className="an-max">
        <CenterHead
          eyebrow="The problem"
          title="The tools build fast. They don't check the locks."
          sub="AI writes and ships your app in minutes, but nothing in that loop checks whether it is safe to charge people money. The gap is measurable, and it is not improving."
        />
        <div className="mt-14 grid gap-px bg-[#E8E7E3] sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_STATS.map((s) => (
            <div key={s.value} className="bg-white px-7 py-8 flex flex-col">
              <div className="text-[clamp(34px,4vw,48px)] font-semibold tracking-[-0.03em] leading-none text-ink">{s.value}</div>
              <p className="mt-3 text-[14px] leading-[1.5] text-muted flex-1">{s.label}</p>
              <p className="mt-4 text-[12px] text-faint">{s.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
