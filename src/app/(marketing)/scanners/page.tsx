import type { Metadata } from 'next';
import Link from 'next/link';
import { SCANNERS } from '@/content/scanners';
import { BrandLogo } from '@/components/ui/BrandLogo';
import Eyebrow from '@/components/ui/Eyebrow';

export const metadata: Metadata = {
  title: { absolute: 'Security scanners for every AI builder | Veilguard' },
  description:
    'Free security scanners tuned to the tools you build with: Lovable, Bolt, Cursor, Replit, v0, Supabase and Firebase. Paste your app and get a plain-English grade in 60 seconds.',
  alternates: { canonical: '/scanners' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/scanners',
    title: 'Security scanners for every AI builder | Veilguard',
    description: 'Pick your tool for a security scan tuned to how it actually leaks.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard security scanners' }],
  },
  twitter: { card: 'summary_large_image', title: 'Security scanners for every AI builder', images: ['/og-image.png'] },
};

export default function ScannersHub() {
  return (
    <section className="px-6 py-[clamp(48px,7vw,96px)]">
      <div className="mx-auto max-w-[1160px]">
        <div className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'// SECURITY SCANNERS'}</Eyebrow>
          <h1 className="mt-4">A security scanner for every AI builder.</h1>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            Whatever you built with, Lovable, Bolt, Replit, v0 or Cursor, and whatever it runs on, we know
            where that stack tends to leak. Pick your tool for a scan tuned to it.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCANNERS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/scanners/${s.slug}`}
                className="card-lift flex items-center gap-3.5 rounded-[16px] border border-border bg-card p-5 h-full"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-[13px] bg-bg-soft ring-1 ring-black/[0.03]">
                  <BrandLogo name={s.brand} size={28} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{s.tool}</span>
                  <span className="block text-[13px] text-muted">Security scanner →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
