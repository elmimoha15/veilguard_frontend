import Shell from '@/components/app/Shell';
import AuthGate from '@/components/app/AuthGate';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Shell>{children}</Shell>
    </AuthGate>
  );
}
