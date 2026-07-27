import type { Metadata } from 'next';
import OnboardingWizard from '@/components/app/OnboardingWizard';

export const metadata: Metadata = { title: 'Get set up', robots: { index: false } };

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
