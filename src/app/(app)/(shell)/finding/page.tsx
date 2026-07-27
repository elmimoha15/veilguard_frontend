import { Suspense } from 'react';
import type { Metadata } from 'next';
import FindingDetailScreen from '@/components/app/FindingDetailScreen';

export const metadata: Metadata = { title: 'Finding', robots: { index: false } };

export default function FindingPage() {
  return (
    <div className="min-h-screen bg-bg px-6 py-8">
      <div className="max-w-[900px] mx-auto">
        <Suspense fallback={<div className="vg-skel h-[300px]" />}>
          <FindingDetailScreen />
        </Suspense>
      </div>
    </div>
  );
}
