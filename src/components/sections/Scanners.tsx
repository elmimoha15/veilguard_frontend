import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { BRAND_ICON } from '@/components/ui/BrandIcons';
import { SCANNERS } from '@/content/scanners';

export default function Scanners() {
  return (
    <section id="scanners" className="bg-card scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// SECURITY SCANNERS'}</Eyebrow>
          <h2 className="mt-4">A security scanner for every AI builder.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            Whatever you built with — Lovable, Bolt, Replit, v0 or Cursor — and whatever it runs on,
            we know where that stack tends to leak. Pick your tool for a scan tuned to it.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCANNERS.map((s, i) => {
            const Icon = BRAND_ICON[s.brand];
            return (
              <FadeIn key={s.slug} delay={i * 0.05} className="h-full">
                <Link
                  href={`/${s.slug}`}
                  className="card-lift flex items-center gap-3.5 rounded-[16px] border border-border bg-card p-5 h-full"
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-[13px] bg-bg-soft ring-1 ring-black/[0.03]">
                    <Icon size={28} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-ink">{s.tool}</span>
                    <span className="block text-[13px] text-muted">Security scanner →</span>
                  </span>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
