import type { Metadata } from 'next';
import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import { INDEXABLE_GUIDE_ARTICLES, articleHref } from '@/content/learn';

export const metadata: Metadata = {
  title: { absolute: 'Security guides for AI-built apps | Veilguard' },
  description:
    'Plain-English, how-to security guides for founders who built with Lovable, Bolt, Cursor, Replit or v0: lock down Supabase, store keys safely, take payments securely, and launch with confidence.',
  alternates: { canonical: '/guides' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/guides',
    title: 'Security guides for AI-built apps | Veilguard',
    description: 'How-to security guides for apps built with AI tools, the checklist, Supabase RLS, API keys, payments and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard security guides' }],
  },
  twitter: { card: 'summary_large_image', title: 'Security guides for AI-built apps | Veilguard', images: ['/og-image.png'] },
};

export default function GuidesHub() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-[clamp(44px,7vw,84px)]">
      <header className="max-w-[720px]">
        <Eyebrow className="text-yellow-dark">{'GUIDES'}</Eyebrow>
        <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[1.1]">Security guides for people who build with AI.</h1>
        <p className="mt-5 text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-muted">
          Practical, plain-English how-tos for founders shipping apps with Lovable, Bolt, Cursor, Replit and
          v0: what to check, how to lock it down, and how to launch safely.
        </p>
      </header>

      <ul className="mt-12 grid sm:grid-cols-2 border-t border-l border-[#E8E7E3]">
        {INDEXABLE_GUIDE_ARTICLES.map((a) => (
          <li key={a.slug} className="border-r border-b border-[#E8E7E3]">
            <Link href={articleHref(a.slug)} className="group flex h-full flex-col px-6 py-7 hover:bg-[#FAFAF8] transition-colors">
              <span className="font-semibold text-[17px] text-ink leading-[1.3]">{a.title}</span>
              <span className="mt-2 text-[14.5px] leading-[1.5] text-muted flex-1">{a.metaDescription}</span>
              <span aria-hidden className="mt-5 text-muted group-hover:text-ink transition-colors font-medium text-[14px] inline-flex items-center gap-1">Read <span className="transition-transform group-hover:translate-x-0.5">→</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
