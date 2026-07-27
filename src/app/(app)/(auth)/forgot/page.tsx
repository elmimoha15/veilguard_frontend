import type { Metadata } from 'next';
import AuthForm from '@/components/app/AuthForm';

export const metadata: Metadata = { title: 'Reset password', robots: { index: false } };

export default function ForgotPage() {
  return <AuthForm mode="forgot" />;
}
