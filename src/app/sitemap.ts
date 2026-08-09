import { MetadataRoute } from 'next';
import { SCANNER_SLUGS } from '@/content/scanners';
import { INDEXABLE_ARTICLE_SLUGS } from '@/content/learn';

// Emit a static sitemap.xml at build time (required for `output: 'export'`).
export const dynamic = 'force-static';

const BASE = 'https://veilguard.dev';
const NOW = new Date('2026-08-07');

export default function sitemap(): MetadataRoute.Sitemap {
  const scanners: MetadataRoute.Sitemap = SCANNER_SLUGS.map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  // Content library (/learn) — public, indexable guides + answers.
  const learn: MetadataRoute.Sitemap = INDEXABLE_ARTICLE_SLUGS.map((slug) => ({
    url: `${BASE}/learn/${slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    { url: `${BASE}`,              lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    ...scanners,
    { url: `${BASE}/learn`,        lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    ...learn,
    { url: `${BASE}/terms`,        lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,      lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/refund`,       lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
