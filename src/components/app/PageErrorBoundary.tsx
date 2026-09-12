'use client';

import { usePathname } from 'next/navigation';
import ErrorBoundary from './ErrorBoundary';

/**
 * ErrorBoundary keyed on the current pathname, so a crash on one page clears the
 * moment the user navigates away. Used to wrap the shell's page body so a single
 * page throw shows a calm panel while the sidebar/topbar stay usable.
 */
export default function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <ErrorBoundary resetKey={pathname} label={`page ${pathname}`}>{children}</ErrorBoundary>;
}
