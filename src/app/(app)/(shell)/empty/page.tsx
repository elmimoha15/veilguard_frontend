import type { Metadata } from 'next';
import EmptyScreen from '@/components/app/EmptyScreen';

export const metadata: Metadata = { title: 'All clear', robots: { index: false } };

export default function EmptyPage() {
  return <EmptyScreen />;
}
