import type { Metadata } from 'next';
import DashboardScreen from '@/components/app/DashboardScreen';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } };

export default function DashboardPage() {
  return <DashboardScreen />;
}
