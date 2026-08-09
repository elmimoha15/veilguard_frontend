import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlePage from '@/components/content/ArticlePage';
import { ARTICLES, getArticle } from '@/content/learn';

// Static export: pre-render exactly the known article slugs, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const url = `https://veilguard.dev/learn/${a.slug}`;
  return {
    title: { absolute: a.metaTitle },
    description: a.metaDescription,
    keywords: a.keywords,
    alternates: { canonical: `/learn/${a.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: a.metaTitle,
      description: a.metaDescription,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: a.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  return <ArticlePage article={a} />;
}
