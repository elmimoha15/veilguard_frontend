import type { Metadata } from 'next';
import CategoryLanding from '@/components/scanners/CategoryLanding';
import { getCategory } from '@/content/scanner-categories';

const category = getCategory('backends')!;

export const metadata: Metadata = {
  title: { absolute: category.metaTitle },
  description: category.metaDescription,
  keywords: category.keywords,
  alternates: { canonical: '/scanners/backends' },
  openGraph: {
    type: 'website',
    url: 'https://veilguard.dev/scanners/backends',
    title: category.metaTitle,
    description: category.metaDescription,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: category.metaTitle }],
  },
  twitter: { card: 'summary_large_image', title: category.metaTitle, description: category.metaDescription, images: ['/og-image.png'] },
};

export default function BackendsCategory() {
  return <CategoryLanding category={category} />;
}
