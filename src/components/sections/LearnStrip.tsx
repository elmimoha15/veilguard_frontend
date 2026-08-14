import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';

/**
 * "New to app security? Start here", a small learn strip above the footer that
 * points into the content hub (top guides + security topics). Feeds internal
 * linking + gives non-technical readers an obvious next step.
 */
export default function LearnStrip() {
  const cards = [
    ...INDEXABLE_GUIDE_ARTICLES.slice(0, 2),
    ...INDEXABLE_SECURITY_ARTICLES.slice(0, 2),
  ].slice(0, 4);

  return (
    <section className="bg-bg-soft scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="flex items-end justify-between gap-6 flex-wrap max-w-[820px]">
          <div>
            <Eyebrow className="text-yellow-dark">{'// LEARN'}</Eyebrow>
            <h2 className="mt-4">New to app security? Start here.</h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-muted max-w-[52ch]">
              Plain-English guides and answers for founders who built with AI, no security background needed.
            </p>
          </div>
          <Link href="/guides" className="shrink-0 text-[15px] font-semibold text-ink hover:opacity-70 transition-opacity">
            All guides →
          </Link>
        </FadeIn>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((a, i) => (
            <FadeIn key={a.slug} delay={i * 0.06} className="h-full">
              <Link href={articleHref(a.slug)} className="card-lift flex h-full flex-col rounded-[16px] border border-border bg-card p-6">
                <span className="font-semibold text-[16px] text-ink leading-[1.3]">{a.title}</span>
                <span className="mt-2 text-[14px] leading-[1.5] text-muted flex-1">{a.metaDescription}</span>
                <span aria-hidden className="mt-4 text-yellow-dark font-semibold text-[14px]">Read →</span>
              </Link>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
