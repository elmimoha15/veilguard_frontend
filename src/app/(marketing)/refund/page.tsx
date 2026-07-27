import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Veilguard\'s refund policy: a free scan to evaluate first, a 14-day money-back guarantee on your first paid purchase, and refunds processed by Polar, our Merchant of Record.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/refund' },
  openGraph: { title: 'Refund Policy | Veilguard', url: 'https://veilguard.dev/refund' },
};

export default function RefundPage() {
  return (
    <div className="py-[120px] px-6 md:px-12 lg:px-16 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl! sm:text-4xl! font-bold mb-3">Refund Policy</h1>
      <p className="text-sm text-muted mb-12">Last updated: July 13, 2026</p>

      <div className="space-y-8 text-muted leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">Try it free first</h2>
          <p>
            The free scan gives you a full A–F security grade and every issue we find, explained in plain
            English — no account, no payment. We recommend running it first so you know exactly what
            Veilguard does for your app before you pay for anything.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">14-day money-back guarantee</h2>
          <p>
            If you&apos;re not happy with a paid plan, you can request a full refund within
            <span className="text-ink font-medium"> 14 days of your first payment</span> — no hard feelings.
            This applies to your initial Guard subscription or Fix Pack purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">Renewals &amp; cancellations</h2>
          <p>
            The Guard plan renews automatically. You can <span className="text-ink font-medium">cancel anytime</span>,
            and you&apos;ll keep access until the end of the period you already paid for. To avoid being charged
            for a new period, cancel before it renews. Renewal payments and partial (unused) periods are
            generally non-refundable, since the free scan and the 14-day window let you evaluate before
            committing.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">How refunds are processed</h2>
          <p>
            Paid plans are sold through <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-yellow-dark hover:text-ink underline underline-offset-2">Polar</a>,
            our Merchant of Record. Approved refunds are issued by Polar back to your original payment method;
            timing depends on your bank or card provider. As Merchant of Record, Polar may also issue refunds
            directly in certain situations (for example, to resolve a dispute or where required by
            consumer-protection law), independent of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">How to request a refund</h2>
          <p>
            Email <a href="mailto:support@veilguard.dev" className="text-yellow-dark hover:text-ink underline underline-offset-2">support@veilguard.dev</a> with
            the email you used at checkout. We aim to respond within 2 business days. If you&apos;re considering
            a chargeback, please reach out to us first — we&apos;ll almost always sort it out faster directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">Questions</h2>
          <p>
            This policy works alongside our{' '}
            <Link href="/terms" className="text-yellow-dark hover:text-ink underline underline-offset-2">Terms of Service</Link>.
            If anything here is unclear, just email us — we&apos;d rather you ask than be unhappy.
          </p>
        </section>
      </div>
    </div>
  );
}
