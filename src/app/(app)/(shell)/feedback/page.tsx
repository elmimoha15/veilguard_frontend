import type { Metadata } from 'next';
import FeedbackScreen from '@/components/app/FeedbackScreen';

export const metadata: Metadata = { title: 'Feedback & Help', robots: { index: false } };

export default function FeedbackPage() {
  return <FeedbackScreen />;
}
