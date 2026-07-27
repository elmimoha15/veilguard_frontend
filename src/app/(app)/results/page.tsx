import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResultsScreen from '@/components/app/ResultsScreen';

export const metadata: Metadata = { title: 'Your results', robots: { index: false } };

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <ResultsScreen />
    </Suspense>
  );
}
