import type { Metadata } from 'next';
import BillingScreen from '@/components/app/BillingScreen';

export const metadata: Metadata = { title: 'Billing', robots: { index: false } };

export default function BillingPage() {
  return <BillingScreen />;
}
