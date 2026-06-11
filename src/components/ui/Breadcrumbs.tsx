import Link from 'next/link';

type Crumb = { name: string; url: string };

const BASE = 'https://veilguard.dev';

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD. The visible nav
// and the structured data must agree (Google requirement), so they're generated
// from the same list here. The final crumb is the current page (not a link).
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.url}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="not-prose mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
          {items.map((it, i) => (
            <li key={it.url} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-text-faint" aria-hidden>/</span>}
              {i < items.length - 1 ? (
                <Link href={it.url} className="hover:text-text-heading transition-colors cursor-pointer">{it.name}</Link>
              ) : (
                <span className="text-text-body" aria-current="page">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
