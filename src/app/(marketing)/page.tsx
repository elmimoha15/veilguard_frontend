import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import PlatformStrip from '@/components/sections/PlatformStrip';
import StatBand from '@/components/sections/StatBand';
import ScanTypes from '@/components/sections/ScanTypes';
import RealBreaches from '@/components/sections/RealBreaches';
import FindAndFix from '@/components/sections/FindAndFix';
import Monitor from '@/components/sections/Monitor';
import Scanners from '@/components/sections/Scanners';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import LearnStrip from '@/components/sections/LearnStrip';
import FinalCta from '@/components/sections/FinalCta';
import { FAQS } from '@/content/landing';

export const metadata: Metadata = {
  // Keyword-led title for search; the emotional hook lives in the H1 and OG tags
  // (set in the root layout). Both describe the same page — no cannibalization.
  title: { absolute: 'Veilguard: AI App Security Scanner, Graded in 60s' },
  alternates: { canonical: '/' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <PlatformStrip />
      <ScanTypes />
      <StatBand />
      <FindAndFix />
      <Monitor />
      <RealBreaches />
      <Scanners />
      <Pricing />
      <Faq />
      <LearnStrip />
      <FinalCta />
    </>
  );
}
