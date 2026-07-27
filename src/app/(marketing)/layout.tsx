import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Marketing chrome: the public site (home, per-tool scanners, legal pages) gets
 * the sticky Navbar, a flex-grow main, the Footer, and the site-wide JSON-LD.
 * The signed-in product app lives in the (app) group and deliberately renders
 * none of this — it has its own sidebar/top-bar shell and full-screen flows.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
                applicationCategory: 'SecurityApplication',
                operatingSystem: 'Web',
                description:
                  'A security scanner for apps built with AI coding tools like Lovable, Bolt, Cursor, Replit and v0. Paste your app URL and get a plain-English A–F security grade in 60 seconds, plus the exact fix for every issue.',
                url: 'https://veilguard.dev',
                offers: [
                  {
                    '@type': 'Offer',
                    name: 'Free scan',
                    price: '0',
                    priceCurrency: 'USD',
                    description: 'Full A–F security grade, every issue found and explained in plain English. No signup.',
                  },
                  {
                    '@type': 'Offer',
                    name: 'Guard',
                    price: '19',
                    priceCurrency: 'USD',
                    description: 'Unlimited scans and all fixes, auto re-scan on every deploy, instant email alerts, and a deep Supabase & Firebase audit. $19/month.',
                  },
                  {
                    '@type': 'Offer',
                    name: 'Fix Pack',
                    price: '19',
                    priceCurrency: 'USD',
                    description: 'All fixes for one scan — copy-paste code plus ready-made AI prompts and a downloadable PDF report. $19 once.',
                  },
                ],
                featureList: [
                  'Plain-English A–F security grade for any live app',
                  'Detects exposed API keys and secrets',
                  'Supabase Row Level Security audit',
                  'Firebase security rules analysis',
                  'CORS and open-API misconfiguration checks',
                  'Exact copy-paste fixes and ready-made prompts for your AI tool',
                  'Continuous monitoring with re-scan on every deploy and email alerts',
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
                description:
                  'Veilguard is security for people who build with AI. It scans apps built with tools like Lovable, Bolt, Cursor, Replit and v0, explains every issue in plain English, and hands over the exact fix.',
              },
              {
                '@type': 'WebSite',
                '@id': 'https://veilguard.dev/#website',
                name: 'Veilguard',
                url: 'https://veilguard.dev',
                description:
                  'Paste your app link and get a plain-English security grade in 60 seconds, plus the exact fixes.',
                publisher: { '@id': 'https://veilguard.dev/#organization' },
              },
            ],
          }),
        }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
