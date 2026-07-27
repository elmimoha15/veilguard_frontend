import { Suspense } from 'react';
import type { Metadata } from 'next';
import FindingsScreen from '@/components/app/FindingsScreen';

export const metadata: Metadata = { title: 'Findings', robots: { index: false } };

export default function FindingsPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[400px]" />}>
      <FindingsScreen />
    </Suspense>
  );
}
