import { Metadata } from 'next';
import StartClient from '@/components/ui/StartClient';

export const metadata: Metadata = {
  title: 'Get started with Veilguard',
  description: 'Pick your editor and get the exact Veilguard setup — Cursor, Claude Code, Windsurf, VS Code, or Antigravity. Free, no account required.',
  robots: { index: false, follow: true },
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
