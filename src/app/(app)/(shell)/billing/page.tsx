import { Suspense } from 'react';
import type { Metadata } from 'next';
import BillingScreen from '@/components/app/BillingScreen';

export const metadata: Metadata = { title: 'Billing', robots: { index: false } };

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="vg-skel h-[300px] max-w-[820px]" />}>
      <BillingScreen />
    </Suspense>
  );
}
