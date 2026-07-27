import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Veilguard handles your data. The free scan only inspects what your app already exposes publicly, deeper checks are read-only, and your source code is never stored. Payments are handled by Polar as Merchant of Record.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
  openGraph: { title: 'Privacy Policy | Veilguard', url: 'https://veilguard.dev/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="py-[120px] px-6 md:px-12 lg:px-16 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl! sm:text-4xl! font-bold mb-3">Privacy Policy</h1>
      <p className="text-sm text-muted mb-12">Last updated: July 13, 2026</p>

      <div className="space-y-8 text-muted leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">The short version</h2>
          <p>
            The free scan only looks at your app from the outside — exactly what any visitor or attacker can
            already see. <span className="text-ink font-medium">We never ask for or store your source code.</span>{' '}
            Deeper checks are opt-in and read-only, and you can revoke access at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">What we scan</h2>
          <p>
            When you give us your app&apos;s URL, Veilguard makes external requests to it the way a browser
            would, and inspects the responses for security issues. If you choose to connect a service such as
            GitHub or Supabase, you grant read-only access that we use only to run the checks you asked for —
            we do not copy or retain your source code, and you can disconnect at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">What we store</h2>
          <p>
            To show your results and keep monitoring your app, we store your account details (such as your
            email), the app URLs you add, and the findings and grades from each scan. We do not store your
            source code or the full contents of your app. You can delete this data at any time by deleting
            your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">Third parties</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <span className="text-ink font-medium">Dependency CVE lookups</span> — where applicable, package
              names and versions (never your code) are sent to Google&apos;s OSV.dev to check for known
              vulnerabilities.
            </li>
            <li>
              <span className="text-ink font-medium">Payments</span> — purchases are processed by{' '}
              <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-yellow-dark hover:text-ink underline underline-offset-2">Polar</a>{' '}
              as our Merchant of Record. Polar collects the information needed to process your payment (such as
              your email and billing details) and is the data controller for that transaction. We never see or
              store your full payment details.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">This website</h2>
          <p>
            We do not use tracking cookies or sell any data. If we add privacy-respecting, aggregate analytics
            in the future, we will update this policy first.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-bold text-ink mb-3">Your rights &amp; contact</h2>
          <p>
            You can request access to or deletion of any personal data associated with your account by
            emailing <a href="mailto:support@veilguard.dev" className="text-yellow-dark hover:text-ink underline underline-offset-2">support@veilguard.dev</a>.
            For payment-related data, you can also contact Polar directly through their customer portal.
          </p>
        </section>
      </div>
    </div>
  );
}
