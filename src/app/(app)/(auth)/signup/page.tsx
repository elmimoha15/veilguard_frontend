import type { Metadata } from 'next';
import RedirectTo from '@/components/app/RedirectTo';

// There is no dedicated signup page anymore, signup happens inside onboarding.
// Anyone landing on /signup (old links, bookmarks) is sent to /onboarding.
export const metadata: Metadata = { title: 'Get set up', robots: { index: false } };

export default function SignupPage() {
  return <RedirectTo to="/onboarding" />;
}
