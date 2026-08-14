import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import ScanForm from '@/components/ui/ScanForm';
import { TRUST_LINE } from '@/content/landing';
import { SITE, type Article } from '@/content/learn/types';
import { articleHub } from '@/content/learn';

/** Consistent mono kicker per content type (ignores per-article `category` styling). */
const KICKER: Record<Article['type'], string> = {
  question: '// ANSWER',
  guide: '// GUIDE',
  comparison: '// COMPARE',
  research: '// RESEARCH',
  security: '// SECURITY',
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
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">
            <li><Link href="/" className="hover:text-yellow-dark transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={hubBase} className="hover:text-yellow-dark transition-colors">{hubLabel}</Link></li>
            <li aria-hidden>/</li>
            <li className="text-muted" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        <header>
          <Eyebrow className="text-yellow-dark">{KICKER[article.type]}</Eyebrow>
          <h1 className="mt-3 text-[clamp(28px,4.4vw,42px)] leading-[1.12]">{article.h1}</h1>
          {(article.updated || article.readMinutes) && (
            <p className="mt-4 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">
              {article.updated ? `Updated ${article.updated}` : null}
              {article.updated && article.readMinutes ? ' · ' : null}
              {article.readMinutes ? `${article.readMinutes} min read` : null}
            </p>
          )}
        </header>

        {/* Direct answer — first thing, for readers + AI extraction */}
        <div className="mt-7 rounded-[16px] border border-border bg-bg-soft p-6">
          <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-yellow-dark mb-2">The short answer</div>
          <p className="text-[17px] leading-[1.6] text-ink">{article.directAnswer}</p>
        </div>

        {/* Body sections */}
        <div className="mt-10 flex flex-col gap-9">
          {article.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-[clamp(20px,2.6vw,26px)]">{s.h2}</h2>
              {s.body && (
                <div className="mt-3 flex flex-col gap-3">
                  {paras(s.body).map((p, j) => (
                    <p key={j} className="text-[16px] leading-[1.65] text-muted">{p}</p>
                  ))}
                </div>
              )}
              {s.bullets && s.bullets.length > 0 && (
                s.numbered ? (
                  <ol className="mt-4 flex flex-col gap-2 list-decimal pl-5 text-[16px] leading-[1.6] text-muted marker:text-yellow-dark marker:font-semibold">
                    {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ol>
                ) : (
                  <ul className="mt-4 flex flex-col gap-2 text-[16px] leading-[1.6] text-muted">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3"><span aria-hidden className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-yellow-dark" /><span>{b}</span></li>
                    ))}
                  </ul>
                )
              )}
              {s.code && (
                <div className="mt-4 rounded-[14px] border border-border bg-ink overflow-hidden">
                  {s.code.label && <div className="px-4 py-2 border-b border-white/10 font-mono text-[11px] tracking-[0.06em] uppercase text-white/50">{s.code.label}</div>}
                  <pre className="p-4 overflow-x-auto text-[13px] leading-[1.6] text-white/90"><code>{s.code.content}</code></pre>
                </div>
              )}
              {s.note && (
                <p className="mt-4 rounded-[12px] border border-border bg-card px-4 py-3 text-[14.5px] leading-[1.55] text-muted">{s.note}</p>
              )}
            </section>
          ))}
        </div>

        {/* Key takeaways */}
        {article.keyTakeaways.length > 0 && (
          <div className="mt-11 rounded-[16px] border-2 border-ink bg-card p-6">
            <h2 className="text-[19px]">Key takeaways</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15.5px] leading-[1.55]">
              {article.keyTakeaways.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-[3px] shrink-0"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <div className="mt-11">
            <h2 className="text-[19px]">Sources</h2>
            <ul className="mt-4 flex flex-col gap-2 text-[14.5px] leading-[1.5]">
              {article.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink underline decoration-border underline-offset-2 transition-colors">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FAQ */}
        {article.faqs && article.faqs.length > 0 && (
          <div className="mt-11">
            <h2 className="text-[clamp(20px,2.6vw,26px)]">Frequently asked</h2>
            <div className="mt-5 space-y-3">
              {article.faqs.map((f) => (
                <details key={f.q} className="group rounded-[14px] border border-border bg-bg-soft px-6 [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[16px] font-semibold text-ink">
                    {f.q}
                    <span aria-hidden className="flex-shrink-0 text-[22px] leading-none text-yellow-dark transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 -mt-1 text-[15px] leading-[1.6] text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related + builder page */}
        {(article.related?.length || article.builder) && (
          <div className="mt-11 border-t border-border pt-8">
            <h2 className="text-[19px]">Keep reading</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {article.builder && (
                <li>
                  <Link href={article.builder.href} className="card-lift flex items-center gap-3 rounded-[14px] border border-border bg-card p-4">
                    <span className="font-semibold text-ink">{article.builder.label}</span>
                    <span aria-hidden className="ml-auto text-yellow-dark">→</span>
                  </Link>
                </li>
              )}
              {article.related?.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="card-lift flex items-center gap-3 rounded-[14px] border border-border bg-card p-4">
                    <span className="font-semibold text-ink">{r.label}</span>
                    <span aria-hidden className="ml-auto text-yellow-dark">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* Soft scan CTA */}
      <section className="bg-yellow bg-dots-ink text-ink">
        <div className="mx-auto max-w-[1160px] px-6 py-[clamp(52px,7vw,88px)] flex flex-col items-center text-center">
          <h2 className="text-[clamp(26px,4vw,44px)] max-w-[20ch]">Run a free security scan</h2>
          <p className="mt-3 max-w-[52ch] text-[16px] text-ink/70">Paste your app&apos;s link and get a plain-English A–F grade in about 60 seconds, plus the exact fix for every issue.</p>
          <div className="mt-8 w-full flex justify-center"><ScanForm tone="onYellow" /></div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-ink/70">{TRUST_LINE}</p>
        </div>
      </section>
    </>
  );
}
