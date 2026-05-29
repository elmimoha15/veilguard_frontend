import { Metadata } from 'next';
import ProClient from '@/components/ui/ProClient';

export const metadata: Metadata = {
  title: 'Veilguard Pro — Full Security Audit for AI-Generated Code | $19/month',
  description: 'Unlock Supabase RLS deep audit, Firebase rules analysis, full security grade (A+ to F), and unlimited scan depth. Catches the exact patterns behind the Moltbook and Lovable breaches. $19/month or $149/year.',
  keywords: ['vibe coding security audit', 'Supabase RLS audit', 'Firebase security audit', 'AI code security grade', 'veilguard pro', 'pre-launch security check'],
  openGraph: {
    title: 'Veilguard Pro — Full Depth Security for AI-Generated Code',
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
