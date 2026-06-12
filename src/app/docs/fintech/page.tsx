import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'African Fintech Security — Paystack, Flutterwave & M-Pesa Patterns',
  description: 'Security patterns for African fintech integrations. Paystack, Flutterwave, and M-Pesa webhook signature verification, secret handling, and compliance checks for AI-generated payment code.',
  keywords: ['Paystack security', 'Flutterwave webhook verification', 'M-Pesa security', 'African fintech security', 'payment webhook signature verification', 'fintech vibe coding security'],
  alternates: { canonical: '/docs/fintech' },
  openGraph: { url: 'https://veilguard.dev/docs/fintech' },
};

export default function DocsFintechPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'African Fintech Security', url: '/docs/fintech' }]} />
      <h1 className="text-2xl font-semibold mb-3">African Fintech Security</h1>
      <p className="text-sm text-text-body mb-8">
        AI coding tools often generate invalid or insecure boilerplate for African payment providers. Veilguard natively prevents these oversights.
      </p>

      <h2 className="text-base font-semibold mt-8 mb-3 border-b border-border pb-2">The Context</h2>
      <div className="bg-background-code border-l-4 border-status-warning p-6 rounded-r-xl mb-8 not-prose">
        <p className="text-text-body text-sm mb-4">
          In 2024, unauthorized transfers resulting from an unverified webhook vulnerability led to the loss of <strong>₦11B</strong> from a major Nigerian payment processor integrations.
        </p>
        <p className="text-text-body text-sm">
          Futhermore, Kenya's Data Protection Act strictly penalizes non-compliant handlers with fines up to KSh 5M, and Nigeria's NDPR demands explicit cryptographic trust for data moving between applications.
        </p>
      </div>

      <h2 className="text-base font-semibold mt-8 mb-3 border-b border-border pb-2">Protected Providers</h2>
      
      <div className="space-y-8 not-prose">
        <div className="p-6 rounded-xl border border-border bg-background-card">
          <h3 className="text-xl font-medium text-text-heading mb-2">Paystack</h3>
          <p className="text-sm text-text-muted mb-4">Secret scanning identifies <code className="text-accent bg-accent-muted px-1 rounded">sk_live_</code> and <code className="text-accent bg-accent-muted px-1 rounded">sk_test_</code>. Webhook verification mandates checking the <code className="text-accent bg-accent-muted px-1 rounded">x-paystack-signature</code>.</p>
          <div className="bg-background-code p-4 rounded-lg font-mono text-sm border border-[#334155]">
            <span className="text-status-critical">CRITICAL</span>: crypto.createHmac('sha512', secret).update(body).digest('hex') != req.headers['x-paystack-signature']
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-background-card">
          <h3 className="text-xl font-medium text-text-heading mb-2">Flutterwave</h3>
          <p className="text-sm text-text-muted mb-4">Detects exposed <code className="text-accent bg-accent-muted px-1 rounded">FLWSECK_LIVE</code> constants and enforces that the <code className="text-accent bg-accent-muted px-1 rounded">verif-hash</code> header is cross-referenced with your environment variables securely.</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-background-card">
          <h3 className="text-xl font-medium text-text-heading mb-2">M-Pesa (Daraja API)</h3>
          <p className="text-sm text-text-muted mb-4">M-Pesa uses a callback mechanism rather than signed webhooks. Veilguard enforces IP address allow-listing and strictly monitors for the Daraja API production endpoints mapping.</p>
          <div className="bg-background-code p-4 rounded-lg font-mono text-sm border border-[#334155]">
            <span className="text-status-warning">WARNING</span>: IP allowlist [196.201.214.*, 196.201.213.*] not verified on Daraja callback route.
          </div>
        </div>
      </div>
    </>
  );
}
