import Eyebrow from '@/components/ui/Eyebrow';
import ScanForm from '@/components/ui/ScanForm';
import { type BrandKey } from '@/components/ui/BrandIcons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { TRUST_LINE } from '@/content/landing';

/**
 * Floating brand chips that orbit the headline — the real logos of the AI
 * builders and backends we scan. Positions are hand-placed for balance and only
 * shown from `md` up (they'd collide with copy on narrow screens).
 */
const ORBIT: { key: BrandKey; top: string; left: string; delay: string }[] = [
  { key: 'lovable', top: '15%', left: '9%', delay: '0s' },
  { key: 'v0', top: '9%', left: '63%', delay: '0.9s' },
  { key: 'bolt', top: '27%', left: '88%', delay: '0.5s' },
  { key: 'supabase', top: '57%', left: '5%', delay: '1.1s' },
  { key: 'cursor', top: '41%', left: '93%', delay: '0.3s' },
  { key: 'replit', top: '77%', left: '19%', delay: '1.4s' },
  { key: 'firebase', top: '72%', left: '86%', delay: '0.7s' },
];

export default function Hero() {
  return (
    <section id="top" className="px-[clamp(14px,2vw,26px)] pt-[clamp(14px,2vw,26px)]">
      <div className="relative mx-auto max-w-[1200px] bg-card rounded-[30px] overflow-hidden shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)]">
        {/* Orbit rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
          {[360, 560, 760, 980, 1240].map((d, i) => (
            <div
              key={d}
              className="absolute rounded-full border"
              style={{
                width: d,
                height: d,
                left: -d / 2,
                top: -d / 2,
                borderColor: ['#F0EFEA', '#EEEDE8', '#EBEAE5', '#E7E6E1', '#F1F0EB'][i],
              }}
            />
          ))}
        </div>
        {/* Radial yellow glow behind headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] glow-yellow"
        />

        {/* Floating brand logos */}
        {ORBIT.map(({ key, top, left, delay }) => {
          return (
            <div
              key={key}
              aria-hidden
              className="hidden md:flex animate-float pointer-events-none absolute items-center justify-center w-[56px] h-[56px] rounded-full bg-white shadow-[0_12px_30px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.04]"
              style={{ top, left, animationDelay: delay }}
            >
              <BrandLogo name={key} size={30} />
            </div>
          );
        })}

        {/* Content */}
        <div className="relative px-6 py-[clamp(54px,9vw,104px)] flex flex-col items-center text-center">
          <Eyebrow className="text-yellow-dark">
            Built with Lovable, Bolt, Cursor, Replit or v0?
          </Eyebrow>
          <h1 className="mt-5 max-w-[15ch]">Is your app actually safe to charge people money?</h1>
          <p className="mt-5 max-w-[54ch] text-[clamp(15px,1.4vw,18px)] leading-[1.55] text-muted">
            Your AI built it in a weekend — and quietly left some doors unlocked. Paste your link and
            get a plain-English security grade in 60 seconds, plus the exact fix for every issue.
          </p>

          <div id="scan" className="mt-9 w-full flex flex-col items-center gap-5 scroll-mt-24">
            <ScanForm />
            <p className="font-mono text-[11px] tracking-[0.06em] uppercase text-muted">
              {TRUST_LINE}
            </p>
          </div>

          {/* Compact logo row for mobile, where the orbiting chips are hidden */}
          <ul className="mt-10 flex md:hidden flex-wrap items-center justify-center gap-3">
            {ORBIT.map(({ key }) => {
              return (
                <li
                  key={key}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-bg-soft ring-1 ring-black/[0.04]"
                >
                  <BrandLogo name={key} size={24} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
