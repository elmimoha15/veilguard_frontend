import type { Metadata } from 'next';
import CategoryLanding from '@/components/scanners/CategoryLanding';
import { getCategory } from '@/content/scanner-categories';

const category = getCategory('vibecoding-tools')!;

export const metadata: Metadata = {
  title: { absolute: category.metaTitle },
  description: category.metaDescription,
  keywords: category.keywords,
  alternates: { canonical: '/scanners/vibecoding-tools' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/scanners/vibecoding-tools',
    title: category.metaTitle,
    description: category.metaDescription,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: category.metaTitle }],
  },
  twitter: { card: 'summary_large_image', title: category.metaTitle, description: category.metaDescription, images: ['/og-image.png'] },
};

export default function VibecodingToolsCategory() {
  return <CategoryLanding category={category} />;
}
