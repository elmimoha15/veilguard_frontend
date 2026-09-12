'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary: catches a crash in the ROOT layout itself, where no
 * other boundary can. It replaces the whole document, so it renders its own
 * <html>/<body> and uses inline styles (globals.css may not be applied). The
 * raw error is logged for us; the user sees a calm reload prompt.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[global error boundary]', error); }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', color: '#fff', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 440 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.7, marginTop: 12, marginBottom: 24 }}>
            The app hit an unexpected error. We’ve logged it — please reload to continue.
          </p>
          <button
            onClick={reset}
            style={{ cursor: 'pointer', background: '#FFE24D', color: '#0A0A0A', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 11, padding: '13px 26px' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
