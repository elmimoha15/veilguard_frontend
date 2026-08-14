import FadeIn from '@/components/ui/FadeIn';
import ScanForm from '@/components/ui/ScanForm';
import { TRUST_LINE } from '@/content/landing';

export default function FinalCta() {
  return (
    <section className="px-[clamp(14px,3vw,28px)] pb-[clamp(40px,6vw,80px)]">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-ink text-white bg-dots-dark">
        <div aria-hidden className="pointer-events-none absolute inset-0 glow-amber" />
        <div className="relative px-6 py-[clamp(56px,8vw,96px)] flex flex-col items-center text-center">
          <FadeIn className="w-full flex flex-col items-center">
            <h2 className="el-h text-white text-[clamp(30px,4.6vw,54px)] max-w-[18ch]">
              Find out your grade in 60 seconds.
            </h2>
            <p className="mt-4 text-[16.5px] leading-[1.55] text-white/70 max-w-[48ch]">
              Paste your app’s link and see exactly what’s exposed, plus the exact fix. Free, no signup.
            </p>
            <div className="mt-8 w-full flex justify-center">
              <ScanForm />
            </div>
            <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-white/50">
              {TRUST_LINE}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
