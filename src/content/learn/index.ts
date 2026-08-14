import type { Article } from './types';
import { GENERAL_QUESTIONS } from './questions-general';
import { GUIDES } from './guides';
import { SECURITY_LIBRARY } from './security';
import { COMPARISONS } from './comparison';
import { RESEARCH } from './research';

export * from './types';

/**
 * The full content library. Builder-question pages (is-my-{tool}-app-secure) were
 * folded into the /scanners/{tool} pages, so they're no longer separate articles.
 */
export const ARTICLES: Article[] = [
  ...GUIDES,
  ...GENERAL_QUESTIONS,
  ...SECURITY_LIBRARY,
  ...COMPARISONS,
  ...RESEARCH,
];

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * Scaffolds/templates intentionally not advertised yet (contain `[DATA NEEDED]` /
 * `[COMPETITOR]` placeholders). Routes still build (previewable by URL) but they're
 * kept out of the sitemap, hub indexes, and internal links until filled.
 */
export const DRAFT_SLUGS = new Set<string>([
  'veilguard-vs-competitor-template',
  'we-scanned-ai-built-apps-what-we-found',
  // Superseded by the cleaner /security/exposed-api-keys library article; kept
  // routable (inbound links resolve) but out of the sitemap/hub to avoid a dup.
  'exposed-api-keys-what-they-are-how-to-find-and-fix',
]);

export const INDEXABLE_ARTICLES: Article[] = ARTICLES.filter((a) => !DRAFT_SLUGS.has(a.slug));
export const INDEXABLE_ARTICLE_SLUGS = INDEXABLE_ARTICLES.map((a) => a.slug);

/**
 * Content splits into two URL hubs:
 *  - /security/{slug}, specific security-hole articles ("what is X, am I affected, fix")
 *  - /guides/{slug}  , everything else (how-to guides, comparisons, research)
 * Hub is keyed by slug so an article's display `type` stays independent of its URL.
 */
export const SECURITY_SLUGS = new Set<string>([
  // legacy general-questions that are really security-topic pages
  'how-to-check-for-exposed-api-keys',
  'how-do-i-know-if-my-supabase-database-is-exposed',
  'can-someone-hack-an-app-built-with-ai',
  'exposed-api-keys-what-they-are-how-to-find-and-fix',
  // the security-hole library
  ...SECURITY_LIBRARY.map((a) => a.slug),
]);

export type ArticleHub = 'guides' | 'security';
export function articleHub(slug: string): ArticleHub {
  return SECURITY_SLUGS.has(slug) ? 'security' : 'guides';
}
export function articleHref(slug: string): string {
  return `/${articleHub(slug)}/${slug}`;
}

/** Per-hub article lists (drafts kept for route generation; use INDEXABLE_* for indexes/sitemap). */
export const GUIDE_ARTICLES = ARTICLES.filter((a) => articleHub(a.slug) === 'guides');
export const SECURITY_ARTICLES = ARTICLES.filter((a) => articleHub(a.slug) === 'security');
export const INDEXABLE_GUIDE_ARTICLES = INDEXABLE_ARTICLES.filter((a) => articleHub(a.slug) === 'guides');
export const INDEXABLE_SECURITY_ARTICLES = INDEXABLE_ARTICLES.filter((a) => articleHub(a.slug) === 'security');
