import type { Metadata } from 'next';
import AuthForm from '@/components/app/AuthForm';

export const metadata: Metadata = { title: 'Sign up', robots: { index: false } };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
