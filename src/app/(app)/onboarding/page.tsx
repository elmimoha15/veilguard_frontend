import { Suspense } from 'react';
import type { Metadata } from 'next';
import OnboardingWizard from '@/components/app/OnboardingWizard';

export const metadata: Metadata = { title: 'Get set up', robots: { index: false } };

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <OnboardingWizard />
    </Suspense>
  );
}
