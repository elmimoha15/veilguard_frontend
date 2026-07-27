import { Suspense } from 'react';
import type { Metadata } from 'next';
import AppDetailScreen from '@/components/app/AppDetailScreen';

export const metadata: Metadata = { title: 'App', robots: { index: false } };

export default function AppDetailPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[400px]" />}>
      <AppDetailScreen />
    </Suspense>
  );
}
