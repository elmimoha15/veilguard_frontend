import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import Eyebrow from '@/components/ui/Eyebrow';
import { SCANNER_CATEGORIES, toolHasPage } from '@/content/scanner-categories';

const CATEGORY_BLURB: Record<string, string> = {
  'ai-coding-agents': 'Cursor, Windsurf, Claude and Copilot assist a developer, and generate insecure code alongside secure.',
  'vibecoding-tools': 'Lovable, Bolt, Replit and v0 build the whole app in one prompt, and leave the backend open.',
  backends: 'Supabase and Firebase give you secure infrastructure, but locking your data is your job.',
};

const CATEGORY_ORDER = ['ai-coding-agents', 'vibecoding-tools', 'backends'];

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
  const groups = CATEGORY_ORDER.map((slug) => SCANNER_CATEGORIES.find((c) => c.slug === slug)!);

  return (
    <section className="px-6 py-[clamp(48px,7vw,96px)]">
      <div className="mx-auto max-w-[1000px]">
        <div className="max-w-[760px]">
          <Eyebrow className="text-yellow-dark">{'TOOLS WE COVER'}</Eyebrow>
          <h1 className="mt-4">A security scanner for every AI builder.</h1>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            Whatever you built with, we know where that stack tends to leak. Three kinds of tool, three
            different security stories. Pick your category, or jump straight to your tool.
          </p>
        </div>

        <div className="mt-14 flex flex-col divide-y divide-[#E8E7E3] border-y border-[#E8E7E3]">
          {groups.map((c) => (
            <div key={c.slug} className="py-9">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="text-[clamp(18px,2.2vw,22px)]">{c.name}</h2>
                <Link href={`/scanners/${c.slug}`} className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted hover:text-ink transition-colors">
                  Category overview <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              <p className="mt-2 text-[15px] leading-[1.55] text-muted max-w-[68ch]">{CATEGORY_BLURB[c.slug]}</p>

              <ul className="mt-5 grid sm:grid-cols-2 border-t border-l border-[#E8E7E3]">
                {c.tools?.map((t) => {
                  const linked = toolHasPage(t.slug);
                  const inner = (
                    <>
                      <BrandLogo name={t.slug as BrandLogoName} size={24} icon className="shrink-0" />
                      <span className="font-semibold text-ink">{t.name}</span>
                      {linked && <span aria-hidden className="ml-auto text-faint group-hover:text-ink transition-colors">→</span>}
                    </>
                  );
                  return (
                    <li key={t.slug} className="border-r border-b border-[#E8E7E3]">
                      {linked ? (
                        <Link href={`/scanners/${t.slug}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">{inner}</Link>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-4">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
