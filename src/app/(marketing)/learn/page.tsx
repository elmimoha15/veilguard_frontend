import type { Metadata } from 'next';
import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import { INDEXABLE_ARTICLES, ARTICLE_GROUPS } from '@/content/learn';

export const metadata: Metadata = {
  title: 'Security Guides & Answers for AI-Built Apps',
  description:
    'Plain-English security guides and answers for founders who built with Lovable, Bolt, Cursor, Replit or v0 — how to find exposed keys, lock down Supabase, and launch safely.',
  alternates: { canonical: '/learn' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/learn',
    title: 'Security Guides & Answers for AI-Built Apps | Veilguard',
    description: 'Plain-English security guides for apps built with AI tools — Lovable, Bolt, Cursor, Replit, v0, Supabase, Firebase.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard security guides' }],
  },
  twitter: { card: 'summary_large_image', title: 'Security Guides & Answers for AI-Built Apps | Veilguard', description: 'Plain-English security guides for apps built with AI tools.', images: ['/og-image.png'] },
};

export default function LearnIndex() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-[clamp(44px,7vw,84px)]">
      <header className="max-w-[720px]">
        <Eyebrow className="text-yellow-dark">{'// LEARN'}</Eyebrow>
        <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[1.1]">Security, in plain English — for people who build with AI.</h1>
        <p className="mt-5 text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-muted">
          Straight answers and practical guides for founders shipping apps built with Lovable, Bolt, Cursor, Replit and v0 — what tends to leak, how to check, and how to fix it fast.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {ARTICLE_GROUPS.map((g) => {
          const items = INDEXABLE_ARTICLES.filter((a) => a.type === g.type);
          if (items.length === 0) return null;
          return (
            <section key={g.type}>
              <h2 className="text-[clamp(20px,3vw,28px)]">{g.heading}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {items.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/learn/${a.slug}`} className="card-lift flex h-full flex-col rounded-[16px] border border-border bg-card p-6">
                      <span className="font-semibold text-[17px] text-ink leading-[1.3]">{a.title}</span>
                      <span className="mt-2 text-[14.5px] leading-[1.5] text-muted">{a.metaDescription}</span>
                      <span aria-hidden className="mt-4 text-yellow-dark font-semibold text-[14px]">Read →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
