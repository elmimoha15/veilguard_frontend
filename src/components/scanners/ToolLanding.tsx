import Link from 'next/link';
import ScanForm from '@/components/ui/ScanForm';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { TRUST_LINE } from '@/content/landing';
import { SCANNERS, type ScannerPage } from '@/content/scanners';
import { rich } from './rich';

const BASE = 'https://veilguard.dev';

/**
 * Shared clean article layout for every per-tool scanner page. A page supplies
 * either prose `sections` (the AI-agent pages) or the legacy `checks[]` + `why`
 * (the other tools); both render in the same hairline style. Emits Article +
 * BreadcrumbList + FAQPage JSON-LD.
 */
export default function ToolLanding({ page }: { page: ScannerPage }) {
  const url = `${BASE}/scanners/${page.slug}`;
  const siblings = SCANNERS.filter((s) => s.category === page.category && s.slug !== page.slug);
  const codeScan = page.scanKind === 'code';

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.metaDescription,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Veilguard', url: BASE },
    publisher: { '@type': 'Organization', name: 'Veilguard', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/logos/logo-icon.png` } },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Scanners', item: `${BASE}/scanners` },
      { '@type': 'ListItem', position: 3, name: `${page.tool} scanner`, item: url },
    ],
  };
  const faqLd = page.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <article className="mx-auto max-w-[820px] px-6 py-[clamp(36px,6vw,72px)]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-[13px] text-faint">
            <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/scanners" className="hover:text-ink transition-colors">Scanners</Link></li>
            <li aria-hidden>/</li>
            <li className="text-muted" aria-current="page">{page.tool} scanner</li>
          </ol>
        </nav>

        {/* Hero (left-aligned, no scan box; the CTA at the bottom has it) */}
        <div>
          <BrandLogo name={page.brand} size={40} icon />
          <div className="mt-5 text-[13px] font-semibold tracking-[0.04em] uppercase text-ink">{page.eyebrow}</div>
          <h1 className="mt-3 text-[clamp(28px,4.4vw,44px)] leading-[1.1] max-w-[24ch]">{page.h1}</h1>
        </div>

        {/* Short answer — a prominent lead paragraph, same font family as the body */}
        <div className="mt-8">
          <div className="text-[14px] font-semibold text-muted mb-2">The short answer</div>
          <p className="text-[19px] leading-[1.6] text-ink">{rich(page.intro)}</p>
        </div>

        {/* Body: prose sections (agent pages) OR why + checks (legacy tools) */}
        {page.sections?.length ? (
          page.sections.map((s) => (
            <section key={s.heading} className="mt-12 border-t border-[#E8E7E3] pt-9">
              <h2 className="text-[clamp(21px,2.6vw,26px)]">{s.heading}</h2>
              {s.paras?.map((p, i) => <p key={i} className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>)}
              {s.bullets && (
                s.numbered ? (
                  <ol className="mt-5 flex flex-col gap-4">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-[17px] leading-[1.6] text-[#3c4043]">
                        <span className="shrink-0 tnum font-semibold text-ink">{i + 1}.</span>
                        <span>{rich(b)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
                    {s.bullets.map((b, i) => <li key={i} className="py-3.5 text-[17px] leading-[1.6] text-[#3c4043]">{rich(b)}</li>)}
                  </ul>
                )
              )}
              {s.code && (
                <div className="mt-5 rounded-[14px] border border-border bg-ink overflow-hidden">
                  {s.code.label && <div className="px-4 py-2 border-b border-white/10 font-mono text-[11px] tracking-[0.06em] uppercase text-white/50">{s.code.label}</div>}
                  <pre className="p-4 overflow-x-auto text-[13.5px] leading-[1.7] text-white/90"><code>{s.code.content}</code></pre>
                </div>
              )}
            </section>
          ))
        ) : (
          <>
            {page.why && (
              <section className="mt-12 border-t border-[#E8E7E3] pt-9">
                <h2 className="text-[clamp(21px,2.6vw,26px)]">{page.whyHeading}</h2>
                <p className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(page.why)}</p>
              </section>
            )}
            {page.checks?.length ? (
              <section className="mt-12 border-t border-[#E8E7E3] pt-9">
                <h2 className="text-[clamp(21px,2.6vw,26px)]">{page.checksHeading}</h2>
                <ul className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
                  {page.checks.map((c) => (
                    <li key={c.title} className="py-4 text-[17px] leading-[1.6] text-[#3c4043]">
                      <span className="font-semibold text-ink">{c.title}</span>{' '}
                      <span className="align-middle text-[11px] font-medium uppercase tracking-[0.04em]" style={{ color: c.severity === 'critical' ? '#DC2626' : '#D97706' }}>· {c.severity}</span>
                      <br />{rich(c.body)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}

        {/* FAQ */}
        {page.faqs?.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(20px,2.6vw,26px)]">Frequently asked</h2>
            <div className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
              {page.faqs.map((f) => (
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

        {/* Sources */}
        {page.sources && page.sources.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[19px]">Sources</h2>
            <ul className="mt-4 flex flex-col gap-2 text-[14.5px] leading-[1.5]">
              {page.sources.map((s) => (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-yellow-dark underline decoration-2 decoration-[#F3C500] underline-offset-2 transition-colors">{s.label} ↗</a>
                  ) : (
                    <span className="text-muted">{s.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cross-links */}
        <section className="mt-12 border-t border-[#E8E7E3] pt-9">
          <h2 className="text-[19px]">Keep exploring</h2>
          <ul className="mt-4 grid sm:grid-cols-2 border-t border-l border-[#E8E7E3]">
            {siblings.map((s) => (
              <li key={s.slug} className="border-r border-b border-[#E8E7E3]">
                <Link href={`/scanners/${s.slug}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                  <BrandLogo name={s.brand} size={22} icon className="shrink-0" />
                  <span className="font-semibold text-ink">{s.tool} scanner</span>
                  <span aria-hidden className="ml-auto text-faint group-hover:text-ink transition-colors">→</span>
                </Link>
              </li>
            ))}
            {page.related?.map((r) => (
              <li key={r.href} className="border-r border-b border-[#E8E7E3]">
                <Link href={r.href} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span aria-hidden className="ml-auto text-faint group-hover:text-ink transition-colors">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>

      {/* Scan CTA */}
      <section className="border-t border-[#E8E7E3]">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(48px,7vw,80px)] flex flex-col items-center text-center">
          {codeScan ? (
            <>
              <h2 className="text-[clamp(26px,4vw,40px)] max-w-[22ch]">Scan your {page.tool} app&apos;s code.</h2>
              <p className="mt-3 max-w-[52ch] text-[16px] text-muted">Connect your repo or upload your code and get a plain-English A to F grade, plus the exact fix for every exposed secret and access gap we find.</p>
            </>
          ) : (
            <>
              <h2 className="text-[clamp(26px,4vw,40px)] max-w-[22ch]">Grade your {page.tool} app in 60 seconds.</h2>
              <p className="mt-3 max-w-[52ch] text-[16px] text-muted">Paste your app&apos;s link and get a plain-English A to F grade in about 60 seconds, plus the exact fix for every issue.</p>
            </>
          )}
          <div className="mt-8 w-full flex justify-center"><ScanForm /></div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">{TRUST_LINE}</p>
        </div>
      </section>
    </>
  );
}
