import type { Metadata } from 'next';
import ScanResultScreen from '@/components/app/ScanResultScreen';

export const metadata: Metadata = { title: 'Scan result', robots: { index: false } };

export default function ScanResultPage() {
  return <ScanResultScreen />;
}
