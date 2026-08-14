import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';

/** Dark rounded band with a yellow radial glow + a 4-up sourced stat row (Sendr-style). */
const STATS = [
  { value: '45%', label: 'of AI-generated code ships with a security vulnerability', src: 'Veracode, 2025' },
  { value: '170+', label: 'live apps exposed by one Lovable misconfiguration', src: 'CVE-2025-48757' },
  { value: '2.74×', label: 'more vulnerabilities than human-written code', src: 'Veracode, 2025' },
  { value: '60s', label: 'to a plain-English A–F security grade', src: 'Veilguard' },
];

export default function StatBand() {
  return (
    <section className="px-[clamp(14px,3vw,28px)] pt-[clamp(44px,6vw,80px)] pb-[clamp(24px,3vw,44px)]">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden el-dark px-[clamp(20px,4vw,56px)] py-[clamp(48px,6vw,80px)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 glow-amber" />
        <div className="relative">
          <FadeIn className="max-w-[720px]">
            <Eyebrow className="text-yellow">{'// THE NUMBERS'}</Eyebrow>
            <h2 className="el-h mt-4 text-white text-[clamp(28px,3.4vw,44px)]">
              You ship faster than you can check.
              <span className="block text-white/45">And the gaps stay invisible until someone finds them.</span>
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <FadeIn key={s.value} delay={i * 0.06}>
                <div className="text-[clamp(38px,5vw,58px)] font-extrabold text-white leading-none tracking-[-0.02em]">{s.value}</div>
                <p className="mt-3 text-[14px] leading-[1.5] text-white/65">{s.label}</p>
                <p className="mt-2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-white/35">{s.src}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
