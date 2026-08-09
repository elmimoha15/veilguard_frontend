import type { Article } from './types';
import { BUILDER_QUESTIONS } from './questions-builders';
import { GENERAL_QUESTIONS } from './questions-general';
import { GUIDES } from './guides';
import { COMPARISONS } from './comparison';
import { RESEARCH } from './research';

export * from './types';

/** The full content library, in a sensible display order. */
export const ARTICLES: Article[] = [
  ...GENERAL_QUESTIONS,
  ...BUILDER_QUESTIONS,
  ...GUIDES,
  ...COMPARISONS,
  ...RESEARCH,
];

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * Scaffolds/templates that are intentionally NOT advertised yet — they contain
 * `[COMPETITOR]` / `[DATA NEEDED]` placeholders. Their routes still build (so they
 * can be previewed by URL), but they're kept out of the sitemap, `/learn` index,
 * and internal links until filled with real content. Remove a slug here to publish.
 */
export const DRAFT_SLUGS = new Set<string>([
  'veilguard-vs-competitor-template',
  'we-scanned-ai-built-apps-what-we-found',
]);

/** The publish-ready subset — used for the sitemap, the /learn index, and llms.txt. */
export const INDEXABLE_ARTICLES: Article[] = ARTICLES.filter((a) => !DRAFT_SLUGS.has(a.slug));
export const INDEXABLE_ARTICLE_SLUGS = INDEXABLE_ARTICLES.map((a) => a.slug);

/** Grouped for the /learn index, in display order. */
export const ARTICLE_GROUPS: { heading: string; type: Article['type'] }[] = [
  { heading: 'Answers', type: 'question' },
  { heading: 'In-depth guides', type: 'guide' },
  { heading: 'Compare your options', type: 'comparison' },
  { heading: 'Research', type: 'research' },
];
