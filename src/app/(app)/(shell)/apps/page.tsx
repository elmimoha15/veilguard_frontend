import type { Metadata } from 'next';
import AppsScreen from '@/components/app/AppsScreen';

export const metadata: Metadata = { title: 'My apps', robots: { index: false } };

export default function AppsPage() {
  return <AppsScreen />;
}
