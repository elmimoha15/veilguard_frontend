import { Suspense } from 'react';
import type { Metadata } from 'next';
import ScanningScreen from '@/components/app/ScanningScreen';

export const metadata: Metadata = { title: 'Scanning…', robots: { index: false } };

export default function ScanningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ScanningScreen />
    </Suspense>
  );
}
