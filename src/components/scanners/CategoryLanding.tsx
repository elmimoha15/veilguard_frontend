import Link from 'next/link';
import ScanForm from '@/components/ui/ScanForm';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { TRUST_LINE } from '@/content/landing';
import { SCANNER_CATEGORIES, toolHasPage, type ScannerCategory } from '@/content/scanner-categories';
import { rich } from './rich';

const BASE = 'https://veilguard.dev';

/**
 * Shared layout for the three /scanners category pages. Clean hairline style
 * matching the landing: eyebrow + H1 + scan box, a left-keyline direct answer,
 * then hairline-separated Why / holes / per-tool / check / fix / sources / a
 * cross-link to the other categories / a clean CTA. Emits Article + Breadcrumb
 * JSON-LD. All prose comes from the category record (verbatim content package).
 */
export default function CategoryLanding({ category }: { category: ScannerCategory }) {
  const url = `${BASE}/scanners/${category.slug}`;
  const others = SCANNER_CATEGORIES.filter((c) => c.slug !== category.slug);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: category.h1,
    description: category.metaDescription,
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
      { '@type': 'ListItem', position: 3, name: category.label, item: url },
    ],
  };

  const holeList = (items: { title: string; body: string }[]) => (
    <ul className="mt-4 border-t border-[#E8E7E3] divide-y divide-[#E8E7E3]">
      {items.map((h) => (
        <li key={h.title} className="py-4 text-[17px] leading-[1.6] text-[#3c4043]">
          <span className="font-semibold text-ink">{h.title}</span> {rich(h.body)}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="mx-auto max-w-[820px] px-6 py-[clamp(36px,6vw,72px)]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-[13px] text-faint">
            <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/scanners" className="hover:text-ink transition-colors">Scanners</Link></li>
            <li aria-hidden>/</li>
            <li className="text-muted" aria-current="page">{category.name}</li>
          </ol>
        </nav>

        {/* Hero (left-aligned, no scan box; the CTA at the bottom has it) */}
        <div>
          <div className="text-[13px] font-semibold tracking-[0.04em] uppercase text-ink">{category.label}</div>
          <h1 className="mt-3 text-[clamp(28px,4.4vw,44px)] leading-[1.1] max-w-[24ch]">{category.h1}</h1>
        </div>

        {/* Short answer — a prominent lead paragraph, same font family as the body */}
        <div className="mt-8">
          <div className="text-[14px] font-semibold text-muted mb-2">The short answer</div>
          <p className="text-[19px] leading-[1.6] text-ink">{rich(category.directAnswer)}</p>
        </div>

        {/* Narrative sections (agent category) */}
        {category.sections?.map((s) => (
          <section key={s.heading} className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(21px,2.6vw,26px)]">{s.heading}</h2>
            {s.paras?.map((p, i) => <p key={i} className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>)}
          </section>
        ))}

        {/* Why (vibecoding / backends) */}
        {category.why && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(21px,2.6vw,26px)]">{category.why.heading}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {category.why.paras.map((p, i) => <p key={i} className="text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>)}
            </div>
          </section>
        )}

        {/* The holes */}
        <section className="mt-12 border-t border-[#E8E7E3] pt-9">
          <h2 className="text-[clamp(20px,2.6vw,26px)]">{category.holes.heading}</h2>
          {category.holes.groups.map((g, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-8' : ''}>
              {g.heading && <h3 className="text-[18px] mt-2">{g.heading}</h3>}
              {holeList(g.items)}
              {g.toolLink && toolHasPage(g.toolLink.slug) && (
                <Link href={`/scanners/${g.toolLink.slug}`} className="group mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink transition-colors">
                  {g.toolLink.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              )}
            </div>
          ))}
        </section>

        {/* Per-tool */}
        {category.tools && category.tools.length > 0 && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(20px,2.6vw,26px)]">{category.toolsHeading}</h2>
            <ul className="mt-5 border-t border-l border-[#E8E7E3]">
              {category.tools.map((t) => {
                const linked = toolHasPage(t.slug);
                const inner = (
                  <>
                    <BrandLogo name={t.slug as BrandLogoName} size={24} icon className="mt-[3px] shrink-0" />
                    <span className="min-w-0">
                      <span className="font-semibold text-ink">{t.name}</span>
                      {t.note && <span className="text-[14.5px] leading-[1.55] text-muted"> {t.note}</span>}
                    </span>
                    {linked && <span aria-hidden className="ml-auto self-center text-faint group-hover:text-ink transition-colors">→</span>}
                  </>
                );
                return (
                  <li key={t.slug} className="border-r border-b border-[#E8E7E3]">
                    {linked ? (
                      <Link href={`/scanners/${t.slug}`} className="group flex items-start gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">{inner}</Link>
                    ) : (
                      <div className="flex items-start gap-3 px-5 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* How to check */}
        <section className="mt-12 border-t border-[#E8E7E3] pt-9">
          <h2 className="text-[clamp(21px,2.6vw,26px)]">{category.check.heading}</h2>
          {category.check.paras?.map((p, i) => <p key={i} className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>)}
          {category.check.bullets && (
            <ul className="mt-4 flex flex-col gap-3 text-[17px] leading-[1.6] text-[#3c4043]">
              {category.check.bullets.map((b, i) => (
                <li key={i} className="flex gap-3"><span aria-hidden className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-ink/25" /><span>{rich(b)}</span></li>
              ))}
            </ul>
          )}
        </section>

        {/* The fix */}
        {category.fix && (
          <section className="mt-12 border-t border-[#E8E7E3] pt-9">
            <h2 className="text-[clamp(21px,2.6vw,26px)]">{category.fix.heading}</h2>
            {category.fix.paras?.map((p, i) => <p key={i} className="mt-3 text-[17px] leading-[1.7] text-[#3c4043]">{rich(p)}</p>)}
            {category.fix.bullets && (
              <ul className="mt-4 flex flex-col gap-3 text-[17px] leading-[1.6] text-[#3c4043]">
                {category.fix.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3"><span aria-hidden className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-ink/25" /><span>{rich(b)}</span></li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Sources */}
        <section className="mt-12 border-t border-[#E8E7E3] pt-9">
          <h2 className="text-[19px]">Sources</h2>
          <ul className="mt-4 flex flex-col gap-2 text-[14.5px] leading-[1.5]">
            {category.sources.map((s) => (
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

        {/* Cross-links to the other categories */}
        <section className="mt-12 border-t border-[#E8E7E3] pt-9">
          <h2 className="text-[19px]">Other categories</h2>
          <ul className="mt-4 grid sm:grid-cols-2 border-t border-l border-[#E8E7E3]">
            {others.map((c) => (
              <li key={c.slug} className="border-r border-b border-[#E8E7E3]">
                <Link href={`/scanners/${c.slug}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                  <span className="font-semibold text-ink">{c.name}</span>
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
          <h2 className="text-[clamp(26px,4vw,40px)] max-w-[20ch]">{category.ctaHeading}</h2>
          <p className="mt-3 max-w-[52ch] text-[16px] text-muted">Paste your app&apos;s link and get a plain-English A to F grade in about 60 seconds, plus the exact fix for every issue.</p>
          <div className="mt-8 w-full flex justify-center"><ScanForm /></div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">{TRUST_LINE}</p>
        </div>
      </section>
    </>
  );
}
