import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import Pill from '@/components/ui/Pill';
import ScanForm from '@/components/ui/ScanForm';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { STEPS, TRUST_LINE } from '@/content/landing';
import { SCANNERS, type ScannerPage } from '@/content/scanners';

const BASE = 'https://veilguard.dev';

/**
 * Shared layout for every per-tool security-scanner page. All copy comes from
 * the `page` record so each URL renders unique, keyword-targeted content while
 * sharing one consistent design. Emits BreadcrumbList + FAQPage JSON-LD.
 */
export default function ToolLanding({ page }: { page: ScannerPage }) {
  const others = SCANNERS.filter((s) => s.slug !== page.slug);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Scanners', item: `${BASE}/scanners` },
      { '@type': 'ListItem', position: 3, name: `${page.tool} security scanner`, item: `${BASE}/scanners/${page.slug}` },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Hero */}
      <section className="px-[clamp(14px,2vw,26px)] pt-[clamp(14px,2vw,26px)]">
        <div className="relative mx-auto max-w-[1200px] bg-card rounded-[30px] overflow-hidden shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] glow-yellow"
          />
          <div className="relative px-6 py-[clamp(44px,7vw,84px)] flex flex-col items-center text-center">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-7">
              <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-faint">
                <li><Link href="/" className="hover:text-yellow-dark transition-colors">Home</Link></li>
                <li aria-hidden>/</li>
                <li><Link href="/scanners" className="hover:text-yellow-dark transition-colors">Scanners</Link></li>
                <li aria-hidden>/</li>
                <li className="text-muted" aria-current="page">{page.tool} scanner</li>
              </ol>
            </nav>

            <span className="flex items-center justify-center w-[68px] h-[68px] rounded-[20px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]">
              <BrandLogo name={page.brand} size={38} />
            </span>
            <Eyebrow className="mt-6 text-yellow-dark">{page.eyebrow}</Eyebrow>
            <h1 className="mt-4 max-w-[20ch]">{page.h1}</h1>
            <p className="mt-5 max-w-[62ch] text-[clamp(15px,1.4vw,18px)] leading-[1.55] text-muted">
              {page.intro}
            </p>

            <div className="mt-9 w-full flex flex-col items-center gap-5">
              <ScanForm />
              <p className="font-mono text-[11px] tracking-[0.06em] uppercase text-muted">{TRUST_LINE}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="px-6 py-[clamp(56px,8vw,96px)]">
        <div className="mx-auto max-w-[1160px]">
          <FadeIn className="max-w-[720px]">
            <Eyebrow className="text-yellow-dark">{'// WHAT WE CHECK'}</Eyebrow>
            <h2 className="mt-4">{page.checksHeading}</h2>
          </FadeIn>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.checks.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.06}>
                <div className="h-full rounded-[18px] border border-border bg-card p-6">
                  <Pill
                    className={
                      c.severity === 'critical'
                        ? 'bg-red/[0.10] text-red'
                        : 'bg-orange/[0.14] text-orange'
                    }
                  >
                    {c.severity === 'critical' ? 'Critical' : 'Warning'}
                  </Pill>
                  <h3 className="mt-4 text-[18px]">{c.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.55] text-muted">{c.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why exposed */}
      <section className="bg-ink text-white bg-dots-dark">
        <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,92px)]">
          <FadeIn className="max-w-[760px]">
            <Eyebrow className="text-yellow">{'// THE GAP'}</Eyebrow>
            <h2 className="mt-4 text-white">{page.whyHeading}</h2>
            <p className="mt-5 text-[17px] leading-[1.6] text-white/70">{page.why}</p>
            {page.sources && page.sources.length > 0 && (
              <div className="mt-7">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/40">Sources</p>
                <ul className="mt-3 space-y-1.5">
                  {page.sources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] leading-[1.5] text-white/60 hover:text-white underline decoration-white/25 underline-offset-2 transition-colors"
                      >
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,92px)]">
          <FadeIn className="max-w-[760px]">
            <Eyebrow className="text-yellow-dark">{'// HOW IT WORKS'}</Eyebrow>
            <h2 className="mt-4">Scan. Understand. Fix.</h2>
          </FadeIn>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.08}>
                <div className="h-full rounded-[18px] border border-border bg-card p-7">
                  <span className="font-mono text-[13px] font-bold text-muted">{s.n}</span>
                  <div className="mt-3 h-[3px] w-8 rounded-full bg-yellow" />
                  <h3 className="mt-4">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-muted">{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card">
        <div className="mx-auto max-w-[820px] px-6 py-[clamp(56px,8vw,92px)]">
          <FadeIn className="text-center">
            <Eyebrow className="text-yellow-dark">{'// FAQ'}</Eyebrow>
            <h2 className="mt-4">{page.tool} security, answered.</h2>
          </FadeIn>
          <div className="mt-10 space-y-3">
            {page.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-[14px] border border-border bg-bg-soft px-6 [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[16px] font-semibold text-ink">
                  {f.q}
                  <span
                    aria-hidden
                    className="flex-shrink-0 text-[22px] leading-none text-yellow-dark transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 -mt-1 text-[15px] leading-[1.6] text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Scan another tool — internal linking */}
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-[1160px] px-6 py-[clamp(48px,7vw,80px)]">
          <FadeIn>
            <h2 className="text-[clamp(22px,3vw,32px)]">Scan another tool</h2>
            <p className="mt-3 text-[16px] text-muted max-w-[52ch]">
              Veilguard checks apps built with every major AI builder and backend.
            </p>
          </FadeIn>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => {
              return (
                <li key={s.slug}>
                  <Link
                    href={`/scanners/${s.slug}`}
                    className="card-lift flex items-center gap-3 rounded-[14px] border border-border bg-card p-4"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-bg-soft">
                      <BrandLogo name={s.brand} size={24} />
                    </span>
                    <span className="font-semibold text-ink">{s.tool} security scanner</span>
                    <span aria-hidden className="ml-auto text-yellow-dark">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-yellow bg-dots-ink text-ink">
        <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)] flex flex-col items-center text-center">
          <FadeIn className="w-full flex flex-col items-center">
            <h2 className="text-[clamp(30px,5vw,54px)] max-w-[18ch]">
              Grade your {page.tool} app in 60 seconds.
            </h2>
            <div className="mt-8 w-full flex justify-center">
              <ScanForm tone="onYellow" />
            </div>
            <p className="mt-5 font-mono text-[11px] tracking-[0.06em] uppercase text-ink/70">
              {TRUST_LINE}
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
