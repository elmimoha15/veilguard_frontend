import Link from 'next/link';
import { CenterHead } from '@/components/sections/annot/kit';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';

/**
 * "New to app security? Start here" — Annot learn strip above pricing that points
 * into the content hub (top guides + security topics) as white cards.
 */
export default function LearnStrip() {
  const cards = [
    ...INDEXABLE_GUIDE_ARTICLES.slice(0, 2),
    ...INDEXABLE_SECURITY_ARTICLES.slice(0, 2),
  ].slice(0, 4);

  return (
    <section className="an-x an-sec scroll-mt-20">
      <div className="an-max">
        <CenterHead
          eyebrow="Learn"
          title="New to app security? Start here."
          sub="Plain-English guides and answers for founders who built with AI, no security background needed."
        />

        <ul className="mt-14 grid gap-px bg-[#E8E7E3] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((a) => (
            <li key={a.slug} className="bg-white">
              <Link href={articleHref(a.slug)} className="group flex h-full flex-col px-6 py-7 hover:bg-[#FAFAF8] transition-colors">
                <span className="font-semibold text-[16px] text-ink leading-[1.3]">{a.title}</span>
                <span className="mt-2.5 text-[14px] leading-[1.5] text-muted flex-1">{a.metaDescription}</span>
                <span aria-hidden className="mt-5 text-muted group-hover:text-ink transition-colors font-medium text-[13.5px] inline-flex items-center gap-1">Read <span className="transition-transform group-hover:translate-x-0.5">→</span></span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link href="/guides" className="text-[15px] font-medium text-ink hover:opacity-70 transition-opacity">All guides →</Link>
        </div>
      </div>
    </section>
  );
}
