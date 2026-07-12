import { MetadataRoute } from 'next';
import { SCANNER_SLUGS } from '@/content/scanners';

// Emit a static sitemap.xml at build time (required for `output: 'export'`).
export const dynamic = 'force-static';

const BASE = 'https://veilguard.dev';
const NOW = new Date('2026-07-11');

export default function sitemap(): MetadataRoute.Sitemap {
  const scanners: MetadataRoute.Sitemap = SCANNER_SLUGS.map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [
    { url: `${BASE}`,              lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    ...scanners,
    { url: `${BASE}/pro`,          lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/docs`,         lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/docs/scanners`,lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/scoring`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/fintech`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/faq`,     lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/terms`,        lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,      lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/refund`,       lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
