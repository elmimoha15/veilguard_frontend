import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import MagicBento from '@/components/ui/MagicBento';

/**
 * "One scan" bento — a dark rounded panel on the light page (matching the
 * reference's dark bento) holding the interactive MagicBento grid, recolored
 * to Veilguard yellow and filled with our scan capabilities.
 */
export default function Bento() {
  return (
    <section className="px-[clamp(14px,3vw,28px)] py-[clamp(24px,3vw,44px)]">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-ink text-white bg-dots-dark px-[clamp(18px,4vw,48px)] py-[clamp(48px,6vw,80px)]">
        <FadeIn className="max-w-[720px]">
          <Eyebrow className="text-yellow">{'// ONE SCAN'}</Eyebrow>
          <h2 className="el-h mt-4 text-white text-[clamp(26px,3.2vw,40px)]">
            One scan, every corner of your stack.
            <span className="block text-white/45">From the public URL down to your database rules.</span>
          </h2>
        </FadeIn>

        <div className="mt-10">
          <MagicBento glowColor="243, 197, 0" particleCount={10} spotlightRadius={340} enableTilt={false} enableMagnetism clickEffect />
        </div>
      </div>
    </section>
  );
}
