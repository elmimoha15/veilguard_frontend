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
  title: {
    default: 'Veilguard — Free Security Scanner for Vibe Coders | Catch AI Code Vulnerabilities',
    template: '%s | Veilguard',
  },
  description: 'Free security scanner for vibe coders. Catches leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks in AI-generated code. Works in Cursor, Claude Code, Windsurf, and VS Code. 14 scanners. Free forever.',
  keywords: [
    'vibe coding security', 'vibe coder security scanner', 'vibe coding vulnerabilities',
    'secure vibe coded app', 'vibe coding hacked', 'is vibe coding safe',
    'AI code scanner', 'AI generated code security', 'AI agent security', 'AI coding vulnerabilities',
    'MCP security server', 'Model Context Protocol security',
    'Cursor security scanner', 'Claude Code security', 'Windsurf security scanner',
    'VS Code security extension', 'secret detection', 'hardcoded API keys',
    'Supabase RLS audit', 'SQL injection scanner', 'supply chain attack detection',
    'vibe coding security 2026',
  ],
  openGraph: {
    siteName: 'Veilguard',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Veilguard — Free Security Scanner for Vibe Coders' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veilguard — Free Security Scanner for Vibe Coders',
    description: 'Catches leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks in AI-generated code. 14 scanners. Free forever.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  // Google Search Console HTML-tag verification. Set GOOGLE_SITE_VERIFICATION
  // in the build env to the token GSC gives you (URL-prefix → HTML tag); the
  // tag is omitted when unset.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://veilguard.dev/#software',
                  name: 'Veilguard',
                  applicationCategory: 'DeveloperApplication',
                  applicationSubCategory: 'Security',
                  operatingSystem: 'macOS, Windows, Linux',
                  description: 'Free security scanner for vibe coders. Catches leaked API keys, SQL injection, broken Supabase Row Level Security policies, and supply chain attacks in AI-generated code. Works as an MCP server in Cursor, Claude Code, Windsurf, VS Code, and Antigravity.',
                  url: 'https://veilguard.dev',
                  downloadUrl: 'https://npmjs.com/package/veilguard',
                  installUrl: 'https://veilguard.dev/docs/install',
                  keywords: 'vibe coding security, vibe coder, AI code scanner, MCP security server, Cursor security, Claude Code security, Windsurf security, Supabase RLS audit, secret detection, vibe coding vulnerabilities',
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Free',
                      price: '0',
                      priceCurrency: 'USD',
                      description: 'All 14 security scanners, MCP server for all IDEs including VS Code (via MCP) — free forever for individual developers.',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Pro',
                      price: '19',
                      priceCurrency: 'USD',
                      description: 'Full security audit with A+ to F letter grade, AI-ready fix prompt, unlimited scan depth, and breach context. $19/month or $149/year.',
                    },
                  ],
                  featureList: [
                    'Secret detection for 60+ API key patterns: Stripe, OpenAI, Supabase, Paystack, Flutterwave, M-Pesa, AWS, Firebase, GitHub, Twilio',
                    'SQL injection detection via template literals and unsanitized user input',
                    'Supabase Row Level Security deep audit — catches the patterns behind the Moltbook breach',
                    'Firebase security rules analysis',
                    'Webhook signature verification for Stripe, Paystack, M-Pesa, GitHub, and Flutterwave',
                    'npm supply chain attack and typosquat detection',
                    'Dependency CVE scanning via Google OSV.dev',
                    'CORS misconfiguration detection',
                    'Git history secret scanning',
                    'App-layer security: rate limiting, IDOR, password storage, file uploads, open redirects, mass assignment',
                    'AI rules-file scanning for hidden Unicode backdoors and prompt-injection in .cursorrules / CLAUDE.md',
                    'MCP server for Cursor, Claude Code, Windsurf, VS Code, and Antigravity',
                    'Full security audit with 0-100 score and A+ to F letter grade (Pro)',
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
                  sameAs: ['https://github.com/elmimoha15/veilguard'],
                  description: 'Veilguard builds security tooling for vibe coders — developers who build with AI agents like Cursor, Claude Code, and Windsurf. Our MCP server catches the security vulnerabilities that AI coding tools routinely introduce.',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://veilguard.dev/#website',
                  name: 'Veilguard',
                  url: 'https://veilguard.dev',
                  description: 'Free security scanner for vibe coders. Catches leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks in AI-generated code.',
                  publisher: { '@id': 'https://veilguard.dev/#organization' },
                },
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
