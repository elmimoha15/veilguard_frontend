import Link from 'next/link';
import ScanForm from '@/components/ui/ScanForm';
import { rich } from '@/components/scanners/rich';
import { TRUST_LINE } from '@/content/landing';
import { SITE, type Article } from '@/content/learn/types';
import { articleHub } from '@/content/learn';

/** Consistent kicker per content type (ignores per-article `category` styling). */
const KICKER: Record<Article['type'], string> = {
  question: 'ANSWER',
  guide: 'GUIDE',
  comparison: 'COMPARE',
  research: 'RESEARCH',
  security: 'SECURITY',
};

/** Split a body string into paragraphs on blank lines. */
function paras(body: string): string[] {
  return body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

/**
 * Shared layout for every /learn content page. Renders inside the (marketing)
 * chrome, in the site's design language. Emits Article + FAQPage + BreadcrumbList
 * JSON-LD. Structure follows AEO best practice: H1 question → direct answer →
 * depth → key takeaways → FAQ → soft scan CTA.
 */
export default function ArticlePage({ article }: { article: Article }) {
  const hub = articleHub(article.slug); // 'guides' | 'security'
  const hubLabel = hub === 'security' ? 'Security' : 'Guides';
  const hubBase = `/${hub}`;
  const url = `${SITE}${hubBase}/${article.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    description: article.metaDescription,
    ...(article.updated ? { dateModified: article.updated } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Veilguard', url: SITE },
    publisher: { '@type': 'Organization', name: 'Veilguard', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logos/logo-icon.png` } },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: hubLabel, item: `${SITE}${hubBase}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };
  const faqLd = article.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <article className="mx-auto max-w-[760px] px-6 py-[clamp(40px,6vw,72px)]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-faint">
            <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={hubBase} className="hover:text-ink transition-colors">{hubLabel}</Link></li>
            <li aria-hidden>/</li>
            <li className="text-muted" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        <header>
          <div className="text-[13px] font-semibold tracking-[0.04em] uppercase text-ink">{KICKER[article.type]}</div>
          <h1 className="mt-3 text-[clamp(28px,4.4vw,42px)] leading-[1.12]">{article.h1}</h1>
          {(article.updated || article.readMinutes) && (
            <p className="mt-4 text-[13px] text-faint">
              {article.updated ? `Updated ${article.updated}` : null}
              {article.updated && article.readMinutes ? ' · ' : null}
              {article.readMinutes ? `${article.readMinutes} min read` : null}
            </p>
          )}
        </header>

        {/* Direct answer — first thing, for readers + AI extraction */}
        <div className="mt-8">
          <div className="text-[14px] font-semibold text-muted mb-2">The short answer</div>
          <p className="text-[19px] leading-[1.6] text-ink">{rich(article.directAnswer)}</p>
        </div>

        {/* Body sections — hairline-separated, matching the tool pages */}
        {article.sections.map((s, i) => (
          <section key={i} className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(21px,2.6vw,26px)]">{s.h2}</h2>
            {s.body && paras(s.body).map((p, j) => (
              <p key={j} className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>
            ))}
            {s.bullets && s.bullets.length > 0 && (
              s.numbered ? (
                <ol className="mt-5 flex flex-col gap-4">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-3 text-[17px] leading-[1.6] text-[#3c4043]">
                      <span className="shrink-0 tnum font-semibold text-ink">{j + 1}.</span>
                      <span>{rich(b)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
                  {s.bullets.map((b, j) => <li key={j} className="py-3.5 text-[17px] leading-[1.6] text-[#3c4043]">{rich(b)}</li>)}
                </ul>
              )
            )}
            {s.code && (
              <div className="mt-5 rounded-[14px] border border-border bg-ink overflow-hidden">
                {s.code.label && <div className="px-4 py-2 border-b border-white/10 font-mono text-[11px] tracking-[0.06em] uppercase text-white/50">{s.code.label}</div>}
                <pre className="p-4 overflow-x-auto text-[13.5px] leading-[1.7] text-white/90"><code>{s.code.content}</code></pre>
              </div>
            )}
            {s.note && (
              <p className="mt-4 border-l-2 border-[#E8E7E3] pl-4 text-[14.5px] leading-[1.55] text-muted">{rich(s.note)}</p>
            )}
          </section>
        ))}

        {/* Key takeaways */}
        {article.keyTakeaways.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[19px]">Key takeaways</h2>
            <ul className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
              {article.keyTakeaways.map((t, i) => (
                <li key={i} className="py-3.5 text-[16px] leading-[1.6] text-[#3c4043]">{rich(t)}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[19px]">Sources</h2>
            <ul className="mt-4 flex flex-col gap-2 text-[14.5px] leading-[1.5]">
              {article.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-yellow-dark underline decoration-2 decoration-[#F3C500] underline-offset-2 transition-colors">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(20px,2.6vw,26px)]">Frequently asked</h2>
            <div className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
              {article.faqs.map((f) => (
                <details key={f.q} className="group [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 py-[22px] text-[16px] font-semibold text-ink">
                    {f.q}
                    <span aria-hidden className="shrink-0 mt-[3px] text-faint transition-transform duration-200 group-open:rotate-180">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </summary>
                  <p className="pb-[22px] -mt-1 text-[16px] leading-[1.65] text-[#3c4043]">{rich(f.a)}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related + builder page */}
        {(article.related?.length || article.builder) && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[19px]">Keep reading</h2>
            <ul className="mt-4 grid sm:grid-cols-2 border-t border-l border-[#E8E7E3]">
              {article.builder && (
                <li className="border-r border-b border-[#E8E7E3]">
                  <Link href={article.builder.href} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                    <span className="font-semibold text-ink">{article.builder.label}</span>
                    <span aria-hidden className="ml-auto text-faint group-hover:text-ink transition-colors">→</span>
                  </Link>
                </li>
              )}
              {article.related?.map((r) => (
                <li key={r.href} className="border-r border-b border-[#E8E7E3]">
                  <Link href={r.href} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                    <span className="font-semibold text-ink">{r.label}</span>
                    <span aria-hidden className="ml-auto text-faint group-hover:text-ink transition-colors">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      {/* Soft scan CTA — clean hairline band */}
      <section className="border-t border-[#E8E7E3]">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(48px,7vw,80px)] flex flex-col items-center text-center">
          <h2 className="text-[clamp(26px,4vw,40px)] max-w-[20ch]">Run a free security scan</h2>
          <p className="mt-3 max-w-[52ch] text-[16px] text-muted">Paste your app&apos;s link and get a plain-English A to F grade in about 60 seconds, plus the exact fix for every issue.</p>
          <div className="mt-8 w-full flex justify-center"><ScanForm /></div>
          <p className="mt-5 text-[13px] text-faint">{TRUST_LINE}</p>
        </div>
      </section>
    </>
  );
}
