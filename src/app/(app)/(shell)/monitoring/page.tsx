import type { Metadata } from 'next';
import MonitoringScreen from '@/components/app/MonitoringScreen';

export const metadata: Metadata = { title: 'Monitoring', robots: { index: false } };

export default function MonitoringPage() {
  return <MonitoringScreen />;
}
