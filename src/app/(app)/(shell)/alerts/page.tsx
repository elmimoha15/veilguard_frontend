import type { Metadata } from 'next';
import AlertsScreen from '@/components/app/AlertsScreen';

export const metadata: Metadata = { title: 'Alerts', robots: { index: false } };

export default function AlertsPage() {
  return <AlertsScreen />;
}
