import Shell from '@/components/app/Shell';
import AuthGate from '@/components/app/AuthGate';
import PageErrorBoundary from '@/components/app/PageErrorBoundary';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Shell>
        <PageErrorBoundary>{children}</PageErrorBoundary>
      </Shell>
    </AuthGate>
  );
}
