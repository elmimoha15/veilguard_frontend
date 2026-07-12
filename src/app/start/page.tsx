import { Metadata } from 'next';
import StartClient from '@/components/ui/StartClient';

export const metadata: Metadata = {
  title: { absolute: 'Get Started with Veilguard' },
  description: 'Scan your app with Veilguard and see exactly where it stands — a plain-English security grade in about a minute. Free, no account required.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/start' },
  openGraph: {
    title: 'Get started with Veilguard',
    url: 'https://veilguard.dev/start',
  },
};

export default function StartPage() {
  return (
    <div className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto min-h-screen">
      <StartClient />
    </div>
  );
}
