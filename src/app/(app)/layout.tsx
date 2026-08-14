import type { Metadata } from 'next';
import { AppStateProvider } from '@/components/app/state';
import { ConfettiOverlay, ToastStack } from '@/components/app/ui';
import ScanWatcher from '@/components/app/ScanWatcher';
import FeedbackWidget from '@/components/app/FeedbackWidget';
import { AuthProvider } from '@/lib/auth';

// De-index the entire signed-in app group in one place (safety net so no app
// screen is ever crawled/indexed, current or future). Marketing is separate.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The signed-in product app. Deliberately renders none of the marketing chrome
 * (that lives in the (marketing) group) — each screen brings its own shell or
 * full-screen layout. Real Firebase auth (AuthProvider) + shared ephemeral UI
 * state (AppStateProvider: toasts/confetti/modals) live here so they persist
 * across every screen.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        {/* `app-theme` scopes the lighter ElevenLabs-style palette + Hanken font
            to the whole signed-in tree; marketing keeps the :root tokens. */}
        <div className="app-theme min-h-screen bg-bg text-ink">
          {children}
          <ScanWatcher />
          <FeedbackWidget />
          <ToastStack />
          <ConfettiOverlay />
        </div>
      </AppStateProvider>
    </AuthProvider>
  );
}
