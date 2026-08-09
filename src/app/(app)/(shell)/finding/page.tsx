import { Suspense } from 'react';
import type { Metadata } from 'next';
import FindingDetailScreen from '@/components/app/FindingDetailScreen';

export const metadata: Metadata = { title: 'Finding', robots: { index: false } };

export default function FindingPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[300px]" />}>
      <FindingDetailScreen />
    </Suspense>
  );
}
