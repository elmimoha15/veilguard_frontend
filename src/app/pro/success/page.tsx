import { Metadata } from 'next';
import SuccessClient from '@/components/ui/SuccessClient';

export const metadata: Metadata = {
  title: 'Welcome to Veilguard Pro',
  description: 'Your Veilguard Pro subscription is active. Copy your license key and activate Pro in Cursor, VS Code, Windsurf, Antigravity, or Claude Code in under a minute.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Welcome to Veilguard Pro',
    url: 'https://veilguard.dev/pro/success',
  },
};

export default function ProSuccessPage() {
  return (
    <div className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto min-h-screen">
      <SuccessClient />
    </div>
  );
}
