import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlePage from '@/components/content/ArticlePage';
import { GUIDE_ARTICLES, DRAFT_SLUGS, getArticle, articleHub } from '@/content/learn';

// Static export: pre-render exactly the guide slugs, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a || articleHub(slug) !== 'guides') return {};
  const url = `https://veilguard.dev/guides/${a.slug}`;
  return {
    title: { absolute: a.metaTitle },
    description: a.metaDescription,
    keywords: a.keywords,
    alternates: { canonical: `/guides/${a.slug}` },
    // Drafts stay routable (inbound links resolve) but out of the index.
    ...(DRAFT_SLUGS.has(slug) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'article',
      url,
      title: a.metaTitle,
      description: a.metaDescription,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: a.metaTitle }],
    },
    twitter: { card: 'summary_large_image', title: a.metaTitle, description: a.metaDescription, images: ['/og-image.png'] },
  };
}

export default async function GuideArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a || articleHub(slug) !== 'guides') notFound();
  return <ArticlePage article={a} />;
}
