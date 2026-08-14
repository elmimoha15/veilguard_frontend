import ScanForm from '@/components/ui/ScanForm';
import FadeIn from '@/components/ui/FadeIn';
import HeroDemoWindow from '@/components/sections/HeroDemoWindow';

/**
 * Hero (Sendr style): centered headline + subhead + scan CTA over a thin
 * graph-paper grid backdrop, then a live Remotion "video window" of the flow.
 */
export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden px-[clamp(14px,3vw,28px)] pt-[clamp(72px,15vh,160px)] pb-[clamp(40px,6vw,80px)]">
      {/* thin graph-paper grid backdrop, fades out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.09) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(120% 90% at 50% 34%, #000 42%, transparent 86%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 34%, #000 42%, transparent 86%)',
        }}
      />
      <div className="mx-auto max-w-[1200px]">
        <FadeIn className="max-w-[880px] mx-auto flex flex-col items-center text-center">
          <h1 className="el-h max-w-[20ch] text-[clamp(40px,6.4vw,76px)]">
            Your AI-built app might be leaking data right now.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] text-muted">
            Veilguard scans your Lovable, Bolt, or Supabase app and shows you exactly what&apos;s exposed:
            leaked keys, open databases, security holes. Plain English, in 60 seconds. Free, no signup.
          </p>

          <div id="scan" className="mt-8 w-full flex justify-center scroll-mt-24">
            <ScanForm />
          </div>
        </FadeIn>

        <FadeIn delay={0.12} className="mt-[clamp(48px,8vh,96px)]">
          <HeroDemoWindow />
        </FadeIn>
      </div>
    </section>
  );
}
