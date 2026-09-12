import Link from 'next/link';
import SectionHead from '@/components/sections/SectionHead';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { SCANNERS } from '@/content/scanners';

export default function Scanners() {
  return (
    <section id="scanners" className="el-x el-sec el-divide scroll-mt-20">
      <SectionHead
        eyebrow="Security scanners"
        title="A security scanner for every AI builder."
        description="Whatever you built with, Lovable, Bolt, Replit, v0 or Cursor, and whatever it runs on, we know where that stack tends to leak. Pick your tool for a scan tuned to it."
      />

      {/* borderless grid — logo tile + name, no card chrome */}
      <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {SCANNERS.map((s) => (
          <Link key={s.slug} href={`/scanners/${s.slug}`} className="group flex items-center gap-3.5">
            <span className="flex items-center justify-center w-11 h-11 rounded-[12px] bg-bg-soft shrink-0">
              <BrandLogo name={s.brand} size={26} icon />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink group-hover:opacity-70 transition-opacity">{s.tool}</span>
              <span className="block text-[13px] text-muted">Security scanner →</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
