import FadeIn from '@/components/ui/FadeIn';
import ScanForm from '@/components/ui/ScanForm';
import { TRUST_LINE } from '@/content/landing';

export default function FinalCta() {
  return (
    <section className="bg-yellow bg-dots-ink text-ink">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(64px,8vw,100px)] flex flex-col items-center text-center">
        <FadeIn className="w-full flex flex-col items-center">
          <h2 className="text-[clamp(32px,5.2vw,60px)] max-w-[16ch]">
            Find out your grade in 60 seconds.
          </h2>
          <div className="mt-8 w-full flex justify-center">
            <ScanForm tone="onYellow" />
          </div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-ink/70">
            {TRUST_LINE}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
