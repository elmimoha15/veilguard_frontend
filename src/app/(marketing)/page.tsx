import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import LogoWall from '@/components/sections/LogoWall';
import ProductShowcase from '@/components/sections/ProductShowcase';
import Problem from '@/components/sections/Problem';
import BreachTypes from '@/components/sections/BreachTypes';
import ScanTypes from '@/components/sections/ScanTypes';
import Difference from '@/components/sections/Difference';
import RealBreaches from '@/components/sections/RealBreaches';
import Monitor from '@/components/sections/Monitor';
import Faq from '@/components/sections/Faq';
import LearnStrip from '@/components/sections/LearnStrip';
import Pricing from '@/components/sections/Pricing';
import FinalCta from '@/components/sections/FinalCta';
import GoogleOneTap from '@/components/auth/GoogleOneTap';
import Reveal from '@/components/ui/Reveal';
import { FAQS } from '@/content/landing';

export const metadata: Metadata = {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <GoogleOneTap />
      <Hero />
      <Reveal><LogoWall /></Reveal>
      <Reveal><ProductShowcase /></Reveal>
      <Reveal><ScanTypes /></Reveal>
      <Reveal><Problem /></Reveal>
      <Reveal><BreachTypes /></Reveal>
      <Reveal><Difference /></Reveal>
      <Reveal><RealBreaches /></Reveal>
      <Reveal><Monitor /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal><LearnStrip /></Reveal>
      <Reveal><Pricing /></Reveal>
      <Reveal><FinalCta /></Reveal>
    </>
  );
}
