import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://veilguard.dev'),
  title: { default: 'Veilguard — Silent Security Scanner for Vibe Coders | Catch AI Code Vulnerabilities', template: '%s | Veilguard' },
  description: 'Free security scanner that catches vulnerabilities in AI-generated code. Detects leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks. Works in Cursor, Claude Code, VS Code, and Windsurf.',
  keywords: ['vibe coding security', 'AI code scanner', 'secret detection', 'Supabase RLS audit', 'MCP security server', 'Cursor security', 'Claude Code security', 'vibe coding vulnerabilities', 'AI generated code security', 'leaked API keys', 'SQL injection scanner', 'supply chain attack detection'],
  openGraph: {
    siteName: 'Veilguard',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veilguard — Silent Security for Vibe Coders',
    description: 'Free security scanner for AI-generated code. 13 scanners. Works in every IDE.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  other: {
    'theme-color': '#080E12',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans bg-background text-text-body relative overflow-x-hidden min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Veilguard',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'macOS, Windows, Linux',
              description: 'Silent security scanner for AI-generated code. Catches leaked API keys, SQL injection, broken database security, and supply chain attacks in vibe-coded applications.',
              url: 'https://veilguard.dev',
              offers: [
                { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free tier — 13 scanners, depth-limited' },
                { '@type': 'Offer', price: '19', priceCurrency: 'USD', description: 'Pro — full depth, Supabase RLS audit, Firebase audit, security grade' },
              ],
              featureList: [
                'Secret detection for 50+ API key patterns',
                'SQL injection detection',
                'Supabase Row Level Security audit',
                'Supply chain attack detection',
                'VS Code extension with real-time lint',
                'MCP server for Cursor, Claude Code, Windsurf',
              ],
            }),
          }}
        />
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
