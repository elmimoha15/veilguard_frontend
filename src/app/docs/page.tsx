import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Veilguard Documentation — Setup, Scanners, and IDE Integration',
  description: 'Complete documentation for Veilguard security scanner. Installation guide, all 14 scanners explained, MCP server configuration for Cursor, Claude Code, Windsurf, VS Code, and more.',
  keywords: ['veilguard docs', 'veilguard documentation', 'MCP security scanner setup', 'VS Code security extension', 'Cursor security scanner', 'vibe coding security tool documentation'],
  openGraph: { url: 'https://veilguard.dev/docs' },
};

export default function DocsOverviewPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-3">Documentation</h1>
      <p className="text-sm text-text-body mb-10">
        Everything you need to set up and use Veilguard.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        <Link href="/docs/install" className="block p-6 bg-background-card border border-border rounded-xl hover:border-border-hover transition-colors">
          <h3 className="text-lg font-medium text-text-heading mb-2">Installation</h3>
          <p className="text-sm text-text-muted">Per-IDE setup for Claude Code, Cursor, Windsurf, VS Code, and Antigravity.</p>
        </Link>
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
