import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Veilguard\'s refund policy: a free tier to evaluate first, a 14-day money-back guarantee on your first Pro payment, and refunds processed by Polar, our Merchant of Record.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/refund' },
  openGraph: { title: 'Refund Policy | Veilguard', url: 'https://veilguard.dev/refund' },
};

export default function RefundPage() {
  return (
    <div className="py-[140px] px-6 md:px-12 lg:px-16 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl! sm:text-4xl! font-semibold mb-3">Refund Policy</h1>
      <p className="text-sm text-text-muted mb-12">Last updated: June 8, 2026</p>

      <div className="space-y-8 text-text-body leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">Try it free first</h2>
          <p>
            Veilguard&apos;s free tier runs all 14 scanners in your editor, so you can fully evaluate how it
            works before paying anything. We recommend using the free tier first to make sure Veilguard fits
            your workflow.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">14-day money-back guarantee</h2>
          <p>
            If you&apos;re not happy with Veilguard Pro, you can request a full refund within
            <span className="text-text-heading"> 14 days of your first Pro payment</span> — no hard feelings.
            This applies to your initial monthly or annual purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">Renewals &amp; cancellations</h2>
          <p>
            Pro renews automatically. You can <span className="text-text-heading">cancel anytime</span> from the
            Polar customer portal, and you&apos;ll keep Pro until the end of the period you already paid for.
            To avoid being charged for a new period, cancel before it renews. Renewal payments and partial
            (unused) periods are generally non-refundable, since the free tier and the 14-day window let you
            evaluate Pro before committing.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">How refunds are processed</h2>
          <p>
            Veilguard Pro is sold through <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">Polar</a>,
            our Merchant of Record. Approved refunds are issued by Polar back to your original payment method;
            timing depends on your bank or card provider. As Merchant of Record, Polar may also issue refunds
            directly in certain situations (for example, to resolve a dispute or where required by consumer-
            protection law), independent of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">How to request a refund</h2>
          <p>
            Email <a href="mailto:support@veilguard.dev" className="text-accent hover:text-accent-hover underline underline-offset-2">support@veilguard.dev</a> with
            the email you used at checkout, or request it from the Polar customer portal. We aim to respond
            within 2 business days. If you&apos;re considering a chargeback, please reach out to us first —
            we&apos;ll almost always sort it out faster directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">Questions</h2>
          <p>
            This policy works alongside our{' '}
            <Link href="/terms" className="text-accent hover:text-accent-hover underline underline-offset-2">Terms of Service</Link>.
            If anything here is unclear, just email us — we&apos;d rather you ask than be unhappy.
          </p>
        </section>
      </div>
    </div>
  );
}
