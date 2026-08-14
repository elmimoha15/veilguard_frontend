import type { Metadata } from 'next';
import { Hanken_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

// Inter is the app-wide UI typeface — an open stand-in for Apple's San Francisco
// that renders the same clean, Apple-like look on every OS. Hanken is kept only
// for the "Veilguard" wordmark (pinned in Logo.tsx).
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://veilguard.dev'),
  title: {
    default: 'Veilguard: Is your app safe to charge people money?',
    template: '%s | Veilguard',
  },
  description:
    'Built your app with Lovable, Bolt, Cursor, Replit or v0? Paste your link and get a plain-English security grade in 60 seconds, plus the exact fixes. Free, no signup.',
  keywords: [
    'app security scanner', 'is my app secure', 'Lovable security', 'Bolt security',
    'Cursor app security', 'Replit security', 'v0 security', 'Supabase RLS check',
    'Firebase security rules', 'exposed API key checker', 'AI app security scan',
    'security grade for my app', 'vibe coding security', 'no-code app security',
  ],
  openGraph: {
    siteName: 'Veilguard',
    type: 'website',
    locale: 'en_US',
    title: 'Veilguard: Is your app safe to charge people money?',
    description:
      'Paste your app link and get a plain-English security grade in 60 seconds, plus the exact fixes. Free, no signup.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard: a plain-English security grade for apps built with AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veilguard: Is your app safe to charge people money?',
    description:
      'Paste your app link and get a plain-English security grade in 60 seconds, plus the exact fixes. Free, no signup.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  // Google Search Console HTML-tag verification. Set GOOGLE_SITE_VERIFICATION
  // in the build env to the token GSC gives you; the tag is omitted when unset.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: {
    'theme-color': '#ECEBE7',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${hanken.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased font-sans bg-bg text-ink relative overflow-x-hidden min-h-screen flex flex-col"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
