import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of Veilguard, the web-based security scanner for apps built with AI. Payments are processed by Polar as Merchant of Record.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms' },
  openGraph: { title: 'Terms of Service | Veilguard', url: 'https://veilguard.dev/terms' },
};

export default function TermsPage() {
  return (
    <div className="py-[120px] px-6 md:px-12 lg:px-16 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl! sm:text-4xl! font-bold mb-3">Terms of Service</h1>
      <p className="text-sm text-muted mb-12">Last updated: July 13, 2026</p>

      <div className="space-y-8 text-muted leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">1. Agreement</h2>
          <p>
            These Terms govern your use of Veilguard (the &ldquo;Service&rdquo;) — a web-based security
            scanner for apps built with AI coding tools. By using the Service, you agree to these Terms. If
            you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">2. The Service</h2>
          <p>
            You give Veilguard the URL of your live app, and we scan it from the outside — the way a visitor
            or attacker already can — then grade it A–F and explain each issue in plain English with a
            suggested fix. For deeper checks you may optionally connect services such as GitHub or Supabase
            with read-only access. A free scan is available with no account. Paid plans unlock the fixes,
            ongoing monitoring, and deeper audits. Veilguard helps you find issues — it does not guarantee
            that your software is secure, and it does not modify your code.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">3. Only scan apps you own</h2>
          <p>
            You may use Veilguard only on apps you own or are explicitly authorized to test. You agree not to
            scan, probe, or attempt to access any app, endpoint, or service you do not control, and not to use
            the Service to violate any law or any third party&apos;s rights. We may suspend or terminate
            access used in breach of this section.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">4. Payments &amp; Merchant of Record</h2>
          <p>
            Paid plans are sold through <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-yellow-dark hover:text-ink underline underline-offset-2">Polar</a>,
            which acts as our <span className="text-ink font-medium">Merchant of Record</span>. This means
            Polar is the seller of record for your purchase, processes your payment, and is responsible for
            collecting and remitting any applicable sales tax or VAT. Your receipt and card statement will
            reference Polar. Your purchase is also subject to Polar&apos;s terms and privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">5. Subscriptions &amp; billing</h2>
          <p>
            The Guard plan is a subscription that renews automatically until cancelled. You can cancel a
            subscription at any time — your access continues until the end
            of the current billing period, and you will not be charged again. Prices are shown at checkout and
            may change with notice for future billing periods. Refunds are governed by our{' '}
            <Link href="/refund" className="text-yellow-dark hover:text-ink underline underline-offset-2">Refund Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">6. No warranty</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any
            kind, express or implied. Security scanning is inherently incomplete — Veilguard may not detect
            every vulnerability, and a clean scan is not a guarantee that your software is secure. You remain
            solely responsible for reviewing, testing, and securing your own code before shipping it.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Veilguard and its creators will not be liable for any
            indirect, incidental, or consequential damages, or for any security breach, data loss, or damages
            arising from your use of (or inability to use) the Service. Our total liability for any claim is
            limited to the amount you paid for the Service in the 12 months before the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">8. Changes</h2>
          <p>
            We may update these Terms from time to time. Material changes will be reflected by the
            &ldquo;Last updated&rdquo; date above. Continued use of the Service after changes take effect
            constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">9. Governing law &amp; contact</h2>
          <p>
            These Terms are governed by the laws of [your country / state]. Questions about these Terms? Email
            us at <a href="mailto:support@veilguard.dev" className="text-yellow-dark hover:text-ink underline underline-offset-2">support@veilguard.dev</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
