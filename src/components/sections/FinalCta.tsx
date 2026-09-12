import ScanInput from '@/components/sections/ScanInput';
import { PillLabel } from '@/components/sections/annot/kit';

/** Closing CTA: a centered "get started" band, delimited by hairlines, with the hero scan box. */
export default function FinalCta() {
  return (
    <section className="an-x an-sec">
      <div className="an-max">
        <div className="border-y border-[#E8E7E3] py-16 sm:py-20 flex flex-col items-center text-center">
          <PillLabel>Get started</PillLabel>
          <h2 className="mt-5 text-[clamp(30px,4vw,46px)] font-semibold tracking-[-0.02em] leading-[1.05] text-ink max-w-[16ch]">
            Find your grade today.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.55] text-muted text-pretty">
            Paste your app link and get a plain-English A to F security grade in 60 seconds. Free.
          </p>
          <ScanInput />
        </div>
      </div>
    </section>
  );
}
