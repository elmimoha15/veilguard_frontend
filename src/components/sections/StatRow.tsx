import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';

/** Orshot-style stat band (light): a two-line heading + a row of big numbers. All sourced. */
const STATS = [
  { value: '45%', label: 'of AI-generated code ships with a security vulnerability', source: 'Veracode, 2025' },
  { value: '2.74×', label: 'more vulnerabilities than human-written code', source: 'Veracode, 2025' },
  { value: '170+', label: 'apps exposed by one Lovable misconfiguration', source: 'CVE-2025-48757' },
  { value: '60s', label: 'to a plain-English A–F security grade', source: 'Veilguard' },
];

export default function StatRow() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="max-w-[720px]">
          <Eyebrow className="text-yellow-dark">{'// THE NUMBERS'}</Eyebrow>
          <h2 className="el-h mt-4 text-[clamp(24px,3vw,36px)]">
            AI ships fast.
            <span className="block text-tertiary">And it ships exposed, at scale.</span>
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.value} delay={i * 0.06} className="h-full">
              <div className="el-card h-full p-6">
                <div className="text-[clamp(34px,4.5vw,52px)] font-extrabold leading-none tracking-[-0.02em] text-ink">{s.value}</div>
                <p className="mt-3 text-[14px] leading-[1.5] text-muted">{s.label}</p>
                <p className="mt-3 font-mono text-[10.5px] tracking-[0.08em] uppercase text-faint">{s.source}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
