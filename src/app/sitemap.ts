import { MetadataRoute } from 'next';

const BASE = 'https://veilguard.dev';
const NOW = new Date('2026-05-29');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}`,                            lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pro`,                         lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/docs`,                        lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/docs/install`,                lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/docs/install/cursor`,         lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/install/claude-code`,    lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/install/windsurf`,       lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/install/vscode`,         lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/install/antigravity`,    lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/scanners`,               lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/scoring`,                lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/fintech`,                lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs/faq`,                    lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
