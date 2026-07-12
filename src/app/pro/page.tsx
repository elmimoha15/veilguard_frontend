import { Metadata } from 'next';
import ProClient from '@/components/ui/ProClient';

export const metadata: Metadata = {
  title: 'Pricing — Unlock Fixes & Ongoing Monitoring',
  description: 'The scan and grade are free. Unlock the exact fix for every issue and keep monitoring your app on every deploy, plus a deep Supabase & Firebase audit. $19/month or $149/year.',
  keywords: ['veilguard pricing', 'app security monitoring', 'vibe coding security audit', 'Supabase security audit', 'Firebase security audit', 'fix security issues'],
  alternates: { canonical: '/pro' },
  openGraph: {
    title: 'Veilguard Pricing — Unlock Fixes & Ongoing Monitoring',
    url: 'https://veilguard.dev/pro',
  },
};

export default function ProPage() {
  return (
    <div className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto min-h-screen">
      <ProClient />
    </div>
  );
}
