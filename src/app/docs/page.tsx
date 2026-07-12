import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Docs — How the App Security Scanner Works',
  description: 'How Veilguard scans an app built with AI for security issues, grades it A–F, and hands you the exact fix. Reference docs for every check, the scoring model, and more.',
  keywords: ['veilguard docs', 'app security scanner', 'how veilguard works', 'vibe coding security', 'Supabase security check', 'AI app security scan'],
  alternates: { canonical: '/docs' },
  openGraph: { url: 'https://veilguard.dev/docs' },
};

export default function DocsOverviewPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-3">Documentation</h1>
      <p className="text-sm text-text-body mb-10">
        How Veilguard scans an app built with AI, what it checks for, and how it grades and fixes
        the issues it finds.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        <Link href="/docs/scanners" className="block p-6 bg-background-card border border-border rounded-xl hover:border-border-hover transition-colors">
          <h3 className="text-lg font-medium text-text-heading mb-2">Scanner Reference</h3>
          <p className="text-sm text-text-muted">All 14 scanners explained, including Secret Scanning, Webhook Verification, and RLS.</p>
        </Link>
        <Link href="/docs/scoring" className="block p-6 bg-background-card border border-border rounded-xl hover:border-border-hover transition-colors">
          <h3 className="text-lg font-medium text-text-heading mb-2">Security Scoring</h3>
          <p className="text-sm text-text-muted">How the Pre-Deploy audit grades your project from A+ to F.</p>
        </Link>
        <Link href="/docs/fintech" className="block p-6 bg-background-card border border-border rounded-xl hover:border-border-hover transition-colors">
          <h3 className="text-lg font-medium text-text-heading mb-2">African Fintech Security</h3>
          <p className="text-sm text-text-muted">Specialized patterns for Paystack, Flutterwave, and M-Pesa integrators.</p>
        </Link>
        <Link href="/docs/faq" className="block p-6 bg-background-card border border-border rounded-xl hover:border-border-hover transition-colors">
          <h3 className="text-lg font-medium text-text-heading mb-2">FAQ & Troubleshooting</h3>
          <p className="text-sm text-text-muted">Common issues, license keys, and false positives.</p>
        </Link>
      </div>
    </>
  );
}
