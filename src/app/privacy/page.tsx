import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Veilguard handles your data. Veilguard runs entirely on your machine — your source code never leaves it. Payments are handled by Polar as Merchant of Record.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
  openGraph: { title: 'Privacy Policy | Veilguard', url: 'https://veilguard.dev/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="py-[140px] px-6 md:px-12 lg:px-16 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl! sm:text-4xl! font-semibold mb-3">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-12">Last updated: June 8, 2026</p>

      <div className="space-y-8 text-text-body leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">The short version</h2>
          <p>
            Veilguard runs entirely on your machine. <span className="text-text-heading">Your source code
            never leaves your computer.</span> We collect no telemetry and no analytics on what Veilguard
            scans or finds.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">What we do not collect</h2>
          <p>
            We never receive, transmit, or store your source code, file contents, scan results, or the
            findings Veilguard reports. All scanning happens locally.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">What leaves your machine</h2>
          <p>The only outbound network calls Veilguard makes are:</p>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <span className="text-text-heading">Dependency CVE lookups</span> — package names (never your
              code) are sent to Google&apos;s OSV.dev to check for known vulnerabilities.
            </li>
            <li>
              <span className="text-text-heading">Pro license validation</span> — if you set a license key,
              the key and a randomly generated machine identifier (no personal or hardware data) are sent to
              Polar / veilguard.dev to verify your subscription, at most once every 24 hours.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">Payments</h2>
          <p>
            Purchases are processed by <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">Polar</a> as
            our Merchant of Record. When you buy Pro, Polar collects the information needed to process your
            payment (such as your email and billing details) and is the data controller for that transaction.
            We never see or store your full payment details. Please review Polar&apos;s privacy policy for how
            they handle that information.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">This website</h2>
          <p>
            This marketing site is served as static files. We do not use tracking cookies or sell any data. If
            we add privacy-respecting, aggregate analytics in the future, we will update this policy first.
          </p>
        </section>

        <section>
          <h2 className="text-lg! font-semibold text-text-heading mb-3">Your rights &amp; contact</h2>
          <p>
            You can request access to or deletion of any personal data associated with your account by
            emailing <a href="mailto:support@veilguard.dev" className="text-accent hover:text-accent-hover underline underline-offset-2">support@veilguard.dev</a>.
            For payment-related data, you can also contact Polar directly through their customer portal.
          </p>
        </section>
      </div>
    </div>
  );
}
