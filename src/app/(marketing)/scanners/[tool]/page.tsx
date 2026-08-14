import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLanding from '@/components/scanners/ToolLanding';
import { SCANNERS, getScanner } from '@/content/scanners';

// Static export: pre-render exactly the known scanner slugs, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return SCANNERS.map((s) => ({ tool: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const page = getScanner(tool);
  if (!page) return {};

  const url = `https://veilguard.dev/scanners/${page.slug}`;
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/scanners/${page.slug}` },
    openGraph: {
      type: 'website',
      url,
      title: page.metaTitle,
      description: page.metaDescription,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: page.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function ScannerPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const page = getScanner(tool);
  if (!page) notFound();
  return <ToolLanding page={page} />;
}
