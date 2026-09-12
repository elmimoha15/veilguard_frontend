import { MetadataRoute } from 'next';
import { SCANNER_SLUGS } from '@/content/scanners';
import { CATEGORY_SLUGS } from '@/content/scanner-categories';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES } from '@/content/learn';

// Emit a static sitemap.xml at build time (required for `output: 'export'`).
export const dynamic = 'force-static';

const BASE = 'https://veilguard.dev';
// Build-time date for pages without their own content date (home, hubs, scanners,
// legal). Content articles use their own `updated` date below for truthful freshness.
const NOW = new Date();
// Parse an article's `updated` (ISO date) into a Date; fall back to build time.
const dateOf = (updated?: string) => (updated ? new Date(updated) : NOW);

export default function sitemap(): MetadataRoute.Sitemap {
  const scanners: MetadataRoute.Sitemap = SCANNER_SLUGS.map((slug) => ({
    url: `${BASE}/scanners/${slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  // Scanner category pages (AI coding agents / vibecoding tools / backends).
  const scannerCategories: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE}/scanners/${slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // Guides hub + guide articles.
  const guides: MetadataRoute.Sitemap = INDEXABLE_GUIDE_ARTICLES.map((a) => ({
    url: `${BASE}/guides/${a.slug}`,
    lastModified: dateOf(a.updated),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Security-topics hub + articles.
  const security: MetadataRoute.Sitemap = INDEXABLE_SECURITY_ARTICLES.map((a) => ({
    url: `${BASE}/security/${a.slug}`,
    lastModified: dateOf(a.updated),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    { url: `${BASE}`,              lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/scanners`,     lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    ...scannerCategories,
    ...scanners,
    { url: `${BASE}/guides`,       lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    ...guides,
    { url: `${BASE}/security`,     lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    ...security,
    { url: `${BASE}/terms`,        lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,      lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/refund`,       lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
