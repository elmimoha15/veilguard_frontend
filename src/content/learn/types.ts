/**
 * Content library ("/learn") — data-driven, SEO + AEO/GEO pages. Each `Article`
 * renders through <ArticlePage>. Structure is tuned for AI citation: one H1
 * question → a direct answer up top → H2/H3 depth → bullets → key takeaways →
 * FAQ → soft scan CTA.
 *
 * ACCURACY RULE: never invent a statistic, breach, or research finding. Any
 * unverifiable stat/breach → the literal token `[SOURCE NEEDED]`; flagship
 * research data → `[DATA NEEDED]`. Set `hasPlaceholders: true` on any article
 * that contains one so it's easy to find before go-live.
 */

export type ArticleType = 'question' | 'guide' | 'comparison' | 'research';

/** A body block within a section. `body` supports `\n\n` paragraph breaks. */
export interface ArticleSection {
  h2: string;
  body?: string;
  /** Optional list; rendered <ol> when `numbered`, else <ul>. */
  bullets?: string[];
  numbered?: boolean;
  /** Optional code/SQL sample. */
  code?: { label?: string; content: string };
  /** Optional highlighted callout under the section body. */
  note?: string;
}

export interface ArticleFaq {
  q: string;
  a: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface Article {
  /** URL: /learn/<slug> */
  slug: string;
  type: ArticleType;
  /** Display group on the /learn index (e.g. "Answers", "Guides"). */
  category: string;

  /** Short list/card title. */
  title: string;
  /** Full <title> (≤ ~60 chars incl. brand where it fits). */
  metaTitle: string;
  /** ~150–160 char meta description. */
  metaDescription: string;
  keywords?: string[];

  /** The single H1 — phrase it as the question the page answers. */
  h1: string;
  /** 2–4 sentence direct answer, shown in a highlighted block near the top. */
  directAnswer: string;
  /** Rough read time in minutes (for the meta row). */
  readMinutes?: number;
  /** ISO date shown as "Updated …" and used for Article schema. */
  updated?: string;

  sections: ArticleSection[];
  keyTakeaways: string[];
  faqs?: ArticleFaq[];

  /** 2–4 related /learn pages + builder pages. */
  related?: RelatedLink[];
  /** The most relevant per-tool builder page, surfaced as a CTA. */
  builder?: { label: string; href: string };

  /** True if the copy contains any [SOURCE NEEDED] / [DATA NEEDED] placeholder. */
  hasPlaceholders?: boolean;
}

export const LEARN_BASE = '/learn';
export const SITE = 'https://veilguard.dev';
