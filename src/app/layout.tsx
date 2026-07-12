import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';

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
    default: 'Veilguard — Is your app safe to charge people money?',
    template: '%s | Veilguard',
  },
  description:
    'Built your app with Lovable, Bolt, Cursor, Replit or v0? Paste your link and get a plain-English security grade in 60 seconds — plus the exact fixes. Free, no signup.',
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
    title: 'Veilguard — Is your app safe to charge people money?',
    description:
      'Paste your app link and get a plain-English security grade in 60 seconds, plus the exact fixes. Free, no signup.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard — a plain-English security grade for apps built with AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veilguard — Is your app safe to charge people money?',
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
    <html lang="en" className={`${hanken.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans bg-bg text-ink relative overflow-x-hidden min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://veilguard.dev/#software',
                  name: 'Veilguard',
                  applicationCategory: 'SecurityApplication',
                  operatingSystem: 'Web',
                  description:
                    'A security scanner for apps built with AI coding tools like Lovable, Bolt, Cursor, Replit and v0. Paste your app URL and get a plain-English A–F security grade in 60 seconds, plus the exact fix for every issue.',
                  url: 'https://veilguard.dev',
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Free scan',
                      price: '0',
                      priceCurrency: 'USD',
                      description: 'Full A–F security grade, every issue found and explained in plain English. No signup.',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Guard',
                      price: '19',
                      priceCurrency: 'USD',
                      description: 'Unlimited scans and all fixes, auto re-scan on every deploy, instant email alerts, and a deep Supabase & Firebase audit. $19/month.',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Fix Pack',
                      price: '19',
                      priceCurrency: 'USD',
                      description: 'All fixes for one scan — copy-paste code plus ready-made AI prompts and a downloadable PDF report. $19 once.',
                    },
                  ],
                  featureList: [
                    'Plain-English A–F security grade for any live app',
                    'Detects exposed API keys and secrets',
                    'Supabase Row Level Security audit',
                    'Firebase security rules analysis',
                    'CORS and open-API misconfiguration checks',
                    'Exact copy-paste fixes and ready-made prompts for your AI tool',
                    'Continuous monitoring with re-scan on every deploy and email alerts',
                  ],
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://veilguard.dev/#organization',
                  name: 'Veilguard',
                  url: 'https://veilguard.dev',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://veilguard.dev/logos/logo-icon.png',
                    width: 512,
                    height: 512,
                  },
                  description:
                    'Veilguard is security for people who build with AI. It scans apps built with tools like Lovable, Bolt, Cursor, Replit and v0, explains every issue in plain English, and hands over the exact fix.',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://veilguard.dev/#website',
                  name: 'Veilguard',
                  url: 'https://veilguard.dev',
                  description:
                    'Paste your app link and get a plain-English security grade in 60 seconds, plus the exact fixes.',
                  publisher: { '@id': 'https://veilguard.dev/#organization' },
                },
              ],
            }),
          }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
