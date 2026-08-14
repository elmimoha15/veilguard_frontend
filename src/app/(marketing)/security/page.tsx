import type { Metadata } from 'next';
import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import { INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';

export const metadata: Metadata = {
  title: { absolute: 'Security topics for AI-built apps | Veilguard' },
  description:
    'The security holes AI coding tools leave behind, explained in plain English: exposed API keys, open databases, broken access control, unverified webhooks and more, what each is, how to tell if you’re affected, and how to fix it.',
  alternates: { canonical: '/security' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/security',
    title: 'Security topics for AI-built apps | Veilguard',
    description: 'Exposed keys, open databases, broken access control and more, what each is, whether you’re affected, and how to fix it.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard security topics' }],
  },
  twitter: { card: 'summary_large_image', title: 'Security topics for AI-built apps | Veilguard', images: ['/og-image.png'] },
};

export default function SecurityHub() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-[clamp(44px,7vw,84px)]">
      <header className="max-w-[720px]">
        <Eyebrow className="text-yellow-dark">{'// SECURITY TOPICS'}</Eyebrow>
        <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[1.1]">The security holes AI-built apps leak through.</h1>
        <p className="mt-5 text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-muted">
          Each one explained in plain English: what it is, how to tell if your app has it, how it happens in
          AI-built apps, and exactly how to fix it.
        </p>
      </header>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {INDEXABLE_SECURITY_ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link href={articleHref(a.slug)} className="card-lift flex h-full flex-col rounded-[16px] border border-border bg-card p-6">
              <span className="font-semibold text-[17px] text-ink leading-[1.3]">{a.title}</span>
              <span className="mt-2 text-[14.5px] leading-[1.5] text-muted">{a.metaDescription}</span>
              <span aria-hidden className="mt-4 text-yellow-dark font-semibold text-[14px]">Read →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
