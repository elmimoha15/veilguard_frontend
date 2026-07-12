"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FadeIn from '@/components/ui/FadeIn';

// Polar hosted checkout links. Replace the placeholders in .env.local with the
// real Polar checkout URLs once they're created. NEXT_PUBLIC_ vars are inlined
// at build time, so the env reference must be static (no dynamic lookups).
const MONTHLY_CHECKOUT_URL = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || 'https://sandbox.polar.sh/checkout/YOUR_CHECKOUT_LINK';
const YEARLY_CHECKOUT_URL = process.env.NEXT_PUBLIC_POLAR_YEARLY_CHECKOUT_URL || 'https://sandbox.polar.sh/checkout/YOUR_YEARLY_CHECKOUT_LINK';
const PORTAL_URL = 'https://polar.sh/veilguard/portal';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams?.get('success') === 'true';
  const [isAnnual, setIsAnnual] = useState(true);

  if (isSuccess) {
    return (
      <FadeIn className="text-center max-w-2xl mx-auto mt-20">
        <div className="w-20 h-20 bg-status-secure/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-status-secure/30 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
          <svg className="w-10 h-10 text-status-secure" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl mb-6">You&apos;re on Veilguard Pro!</h1>
        <p className="text-lg text-text-body mb-8">
          Welcome to absolute security. Check your email for your Polar receipt and license key.
        </p>
        <div className="bg-background-code border border-border p-6 rounded-xl text-left mb-8">
          <div className="text-sm text-text-muted mb-2">1. Copy your VEILGUARD_KEY</div>
          <div className="text-sm text-text-muted mb-6">2. Add it to your IDE configuration:</div>
          <pre className="text-sm font-mono text-text-body overflow-x-auto">
{`"env": { "VEILGUARD_KEY": "vg_live_..." }`}
          </pre>
        </div>
        <Link href="/docs" className="inline-block px-8 py-3 rounded-full bg-accent text-[#080E12] font-semibold hover:scale-[1.02] transition-transform">
          View installation guide
        </Link>
      </FadeIn>
    );
  }

  return (
    <>
      <FadeIn className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl mb-6 max-w-3xl mx-auto">Free finds it.<br/>Pro fixes it.</h1>
        <p className="text-lg text-text-body max-w-2xl mx-auto">
          Every scanner runs free and flags every vulnerability it finds. Veilguard Pro unlocks the exact fixes, breach context, your full security grade (A+ to F), and the AI-ready fix prompt that patches everything in a single paste.
        </p>
      </FadeIn>

      <FadeIn className="flex justify-center mb-12">
        <div className="bg-background-code border border-border rounded-full p-1 flex">
          <button 
            onClick={() => setIsAnnual(false)} 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${!isAnnual ? 'bg-background-card text-text-heading border border-border shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)} 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'bg-background-card text-text-heading border border-border shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
          >
            Annual
            <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save 35%</span>
          </button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32">
        <FadeIn delay={0.1}>
          <div className="bg-background-card border border-border rounded-xl p-10 flex flex-col h-full hover:border-border-hover transition-colors">
            <h3 className="text-2xl font-medium text-text-heading mb-2">Monthly</h3>
            <div className="text-4xl font-semibold text-text-heading mb-2">$19<span className="text-lg text-text-muted font-normal">/mo</span></div>
            <div className="text-sm text-text-muted mb-8">Billed monthly</div>
            
            <ul className="space-y-4 mb-10 flex-grow text-text-body text-sm">
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Everything in Free — plus the exact fix for every finding</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Full security audit with letter grade (A+ to F)</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>AI-ready fix prompt — paste to fix everything at once</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Breach context on every finding + full scan depth</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Full audit report — unlimited</span></li>
            </ul>

            <a href={MONTHLY_CHECKOUT_URL} className="block text-center w-full py-3 rounded-full border border-border text-text-heading font-medium hover:bg-background-card-hover transition-colors">
              Get Pro — $19/month
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className={`bg-background-code border ${isAnnual ? 'border-border-active shadow-[0_0_40px_rgba(52,211,153,0.1)]' : 'border-border'} rounded-xl p-10 flex flex-col h-full relative overflow-hidden transition-all duration-300`}>
            {isAnnual && (
              <>
                <div className="absolute top-0 right-0 bg-accent text-[#080E12] text-xs font-bold px-4 py-1 rounded-bl-lg z-10">RECOMMENDED</div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              </>
            )}
            
            <h3 className="text-2xl font-medium text-text-heading mb-2">Annual</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-4xl font-semibold text-text-heading">$149<span className="text-lg text-text-muted font-normal">/yr</span></div>
            </div>
            <div className="text-sm text-text-muted mb-8">Works out to $12.42/mo (billed annually)</div>
            
            <ul className="space-y-4 mb-10 flex-grow text-text-body text-sm">
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Everything in Free — plus the exact fix for every finding</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-[#F1F5F9] font-medium">Full security audit with letter grade (A+ to F)</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>AI-ready fix prompt — paste to fix everything at once</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Breach context on every finding</span></li>
              <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Full audit report — unlimited</span></li>
            </ul>
            
            <a href={YEARLY_CHECKOUT_URL} className={`block text-center w-full py-3 rounded-full font-semibold transition-transform ${isAnnual ? 'bg-accent text-[#080E12] hover:scale-[1.02]' : 'border border-border text-text-heading hover:bg-background-card-hover'}`}>
              Get Pro — $149/year
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Manage Subscription */}
      <FadeIn className="text-center -mt-24 mb-32">
        <p className="text-sm text-text-muted">
          Already Pro?{' '}
          <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover transition-colors font-medium underline underline-offset-4 decoration-accent/30 hover:decoration-accent">
            Manage your subscription
          </a>
        </p>
      </FadeIn>

      {/* Comparison Table */}
      <FadeIn className="max-w-4xl mx-auto mb-32">
        <h2 className="text-3xl mb-10 text-center">Compare features</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-6 font-medium text-text-heading w-1/2">Feature</th>
                <th className="py-4 px-6 font-medium text-text-heading w-1/4 text-center">Free</th>
                <th className="py-4 px-6 font-medium text-accent w-1/4 text-center">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: 'All 14 scanners', free: 'Yes', pro: 'Yes' },
                { name: 'MCP server (all IDEs, incl. VS Code)', free: 'Yes', pro: 'Yes' },
                { name: 'Vulnerability alerts', free: 'Yes', pro: 'Yes' },
                { name: 'Fix / solution for each finding', free: 'Locked', pro: 'Yes' },
                { name: 'Breach context', free: 'No', pro: 'Yes' },
                { name: 'Dependency CVE scan', free: 'Critical only', pro: 'All severities' },
                { name: 'Supply chain check', free: 'Top 20 deps', pro: 'All packages' },
                { name: 'Git history scan', free: 'Current files', pro: 'Full history' },
                { name: 'Supabase RLS deep audit', free: 'Alert only', pro: 'Yes' },
                { name: 'Firebase rules audit', free: 'Alert only', pro: 'Yes' },
                { name: 'Full security audit', free: 'No', pro: 'Unlimited' },
                { name: 'Full audit — letter grade (A+ to F)', free: 'No', pro: 'Yes' },
                { name: 'AI-ready fix prompt', free: 'No', pro: 'Yes' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-background-card/50 transition-colors">
                  <td className="py-4 px-6 text-text-body">{row.name}</td>
                  <td className="py-4 px-6 text-text-muted text-center align-middle">{row.free === 'No' ? '—' : row.free === 'Yes' ? <span className="text-accent inline-block">✓</span> : row.free}</td>
                  <td className="py-4 px-6 text-text-heading text-center align-middle">{row.pro === 'Yes' ? <span className="text-accent inline-block">✓</span> : row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>

      {/* FAQ */}
      <FadeIn className="max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl mb-10 text-center">Frequently asked questions</h2>
        <div className="space-y-4 text-left">
          {[
            { q: "How does the license key work?", a: "After subscribing, you'll receive a VEILGUARD_KEY via email. Simply add this to your MCP configuration's env mapping as detailed in the installation docs." },
            { q: "What if I cancel?", a: "You will retain your Pro license until the end of your billing cycle. Afterwards, Veilguard will automatically downgrade to the Free tier functionality." },
            { q: "Can I use it on multiple machines?", a: "Yes. The license is per user, not per project, so it covers all your projects. One license activates on up to 5 machines — say your laptop and desktop. Switching computers? Run “veilguard-cli deactivate” on the old one to free up a slot." },
            { q: "Is there a limit on how many full audits I can run?", a: "No. Pro includes unlimited full audits, and all other scanners run unlimited too." },
            { q: "Are you open source?", a: "The Veilguard CLI and core scanners are source-available, allowing you to verify what runs on your machine. The backend grading and telemetry parsing are proprietary." }
          ].map((faq, i) => (
            <details key={i} className="group bg-background-card border border-border rounded-xl mb-4 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="px-6 py-4 font-medium text-text-heading cursor-pointer flex justify-between items-center outline-none">
                {faq.q}
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="px-6 pb-4 pt-2 text-text-body text-sm leading-relaxed border-t border-border/50">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </FadeIn>
    </>
  );
}

export default function ProClient() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
