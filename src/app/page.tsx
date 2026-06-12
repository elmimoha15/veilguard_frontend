import Link from 'next/link';
import FadeIn, { FadeInStagger, FadeInStaggerItem } from '@/components/ui/FadeIn';
import TerminalMockup from '@/components/ui/TerminalMockup';
import IDEInstallTabs from '@/components/ui/IDEInstallTabs';
import CommandBox from '@/components/ui/CommandBox';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veilguard — Free Security Scanner for Vibe Coders | Catch AI Code Vulnerabilities',
  description: 'Free security scanner for vibe coders. Catches leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks in AI-generated code. Works in Cursor, Claude Code, Windsurf, and VS Code. 14 scanners. Free forever.',
  keywords: [
    'vibe coding security', 'vibe coder security scanner', 'vibe coding vulnerabilities',
    'secure vibe coded app', 'vibe coding hacked', 'is vibe coding safe',
    'AI code scanner', 'AI generated code security', 'AI agent security',
    'MCP security server', 'Cursor security scanner', 'Claude Code security',
    'Windsurf security', 'VS Code security extension',
    'secret detection', 'Supabase RLS audit', 'SQL injection scanner',
    'supply chain attack detection', 'vibe coding security 2026',
    'how to secure vibe coded app', 'AI coding vulnerabilities',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Veilguard — Free Security Scanner for Vibe Coders',
    description: 'Catches leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks in AI-generated code. 14 scanners. Free forever. Works in Cursor, Claude Code, Windsurf, and VS Code.',
    url: 'https://veilguard.dev',
  },
};

const faqItems = [
  {
    q: 'What is vibe coding?',
    a: 'Vibe coding is a software development approach where developers describe what they want in plain English and an AI agent — such as Cursor, Claude Code, or Windsurf — writes the entire application. It lets anyone build production-ready apps in hours without writing most of the code manually. Over 92% of developers now use AI coding assistants, and 41% of all code written globally is AI-generated.',
  },
  {
    q: 'Is vibe coding safe?',
    a: 'Vibe coding produces working code fast, but 45% of AI-generated code contains security vulnerabilities according to Veracode (2025). AI tools do not check for hardcoded secrets, SQL injection, or broken database policies. Vibe-coded apps need a dedicated security scanner to catch what the AI misses before those vulnerabilities reach production.',
  },
  {
    q: 'What security vulnerabilities does AI-generated code typically introduce?',
    a: 'The most common vulnerabilities are: hardcoded API keys embedded as fallback values (process.env.KEY || \'sk_live_...\'), SQL injection via template literals, missing Supabase Row Level Security, unverified webhook handlers that accept fake payment events, wildcard CORS on authenticated apps, and typosquatted npm packages. AI tools prioritize making code work quickly over making it secure.',
  },
  {
    q: 'How do I secure a vibe-coded app?',
    a: 'Scan every file for hardcoded secrets before git commits, audit your Supabase RLS policies to confirm row-level access is enforced per user, verify all payment webhooks validate signatures cryptographically, check npm dependencies for known CVEs, and review your CORS configuration. Veilguard automates all of these checks through your AI coding IDE using 14 security scanners.',
  },
  {
    q: 'What is an MCP security server?',
    a: 'An MCP (Model Context Protocol) security server is a tool that integrates directly into AI coding IDEs like Cursor, Claude Code, and Windsurf. It exposes security scanning functions the AI agent can call while writing code. Veilguard\'s MCP server adds 14 security scanners — covering secrets, SQL injection, Supabase RLS, webhook verification, supply chain attacks, and more — to any supported AI coding IDE.',
  },
  {
    q: 'Can using Cursor or Claude Code result in my app being hacked?',
    a: 'AI coding tools like Cursor, Claude Code, and Windsurf routinely generate insecure patterns without warning. The Moltbook breach (January 2026) leaked 1.5 million API keys from a fully AI-coded app. Lovable\'s CVE-2025-48757 exposed 170 apps through AI-generated RLS logic errors. AI writes fast code — without a security layer, that speed ships vulnerabilities directly to production.',
  },
  {
    q: 'Is Veilguard free?',
    a: 'Yes. Veilguard\'s free tier runs all 14 security scanners and the MCP server in Cursor, Claude Code, Windsurf, VS Code, and Antigravity, and alerts you to every vulnerability it finds. Free tells you exactly what\'s wrong; the fixes, breach context, and the full security audit (letter grade A+ to F plus an AI-ready fix prompt you can paste to fix everything at once) are Veilguard Pro — $19/month or $149/year.',
  },
  {
    q: 'Does Veilguard send my code to the cloud?',
    a: 'No. Veilguard runs entirely on your local machine. It reads files locally, matches patterns locally, and returns results locally. The only external calls are package names (never source code) to Google\'s OSV.dev for CVE lookups, and your license key to veilguard.dev for Pro validation once every 24 hours.',
  },
];

// Homepage-only FAQ schema. Organization, WebSite, and SoftwareApplication are
// emitted once for the whole site in the root layout (src/app/layout.tsx) — we
// don't repeat them here to avoid conflicting duplicate nodes. The FAQ is linked
// into that site graph via `isPartOf` → the WebSite @id from the layout.
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://veilguard.dev/#faq',
  isPartOf: { '@id': 'https://veilguard.dev/#website' },
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="relative pt-[150px] pb-[100px] px-6 md:px-12 lg:px-16 text-center flex flex-col items-center justify-center overflow-hidden">
        {/* Engineering grid + radial glow backdrop */}
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none -z-10" aria-hidden></div>
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[640px] max-w-[120vw] bg-accent-glow rounded-full blur-[130px] opacity-60 pointer-events-none -z-10" aria-hidden></div>

        <div className="max-w-[1200px] mx-auto flex flex-col items-center pt-6">
          <FadeIn delay={0.1}>
            <h1 className="max-w-4xl mx-auto mb-6 text-text-heading text-balance">
              Your AI writes code.{' '}
              <span className="text-gradient-accent">Veilguard </span> makes sure it doesn&apos;t get you hacked.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="max-w-2xl mx-auto text-text-body text-lg md:text-xl mb-12 text-pretty">
              Free security scanner for AI-generated code. Catches leaked API keys, SQL injection, broken database policies, and supply chain attacks — while you vibe.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full sm:w-auto">
              <Link href="/start" className="btn-primary w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-[#080E12] font-semibold shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-pointer">
                Install Free
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full border border-border text-text-heading hover:bg-background-card-hover hover:border-border-hover font-medium transition-colors cursor-pointer">
                See What It Catches
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted font-mono tracking-wide">
              <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>14 scanners</span>
              <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>100% local</span>
              <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Free forever</span>
            </div>
            <div className="text-xs text-text-faint font-mono tracking-wide mt-4">
              Works in Cursor · Claude Code · VS Code · Windsurf · Antigravity
            </div>
          </FadeIn>

          <FadeIn delay={0.6} className="w-full mt-20">
            <TerminalMockup />
          </FadeIn>
        </div>
      </section>

      {/* Problem Stats Section */}
      <section className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn>
          <div className="mb-4 caption text-accent font-mono">THE PROBLEM</div>
          <h2 className="mb-16 max-w-2xl">AI-generated code has a security problem</h2>
        </FadeIn>
        
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 card-lift">
            <div className="text-5xl font-medium text-text-heading mb-4">45%</div>
            <div className="text-sm text-text-body mb-6 min-h-[40px]">of AI-generated code contains security vulnerabilities</div>
            <div className="text-xs text-text-muted">Veracode, 2025</div>
          </FadeInStaggerItem>
          
          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 card-lift">
            <div className="text-5xl font-medium text-text-heading mb-4">28.6M</div>
            <div className="text-sm text-text-body mb-6 min-h-[40px]">hardcoded secrets pushed to public GitHub repos in 2025 — a 34% YoY increase</div>
            <div className="text-xs text-text-muted">GitGuardian</div>
          </FadeInStaggerItem>
          
          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 card-lift relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#EF4444]/50 to-transparent opacity-50"></div>
            <div className="text-5xl font-medium text-status-critical mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">1.5M</div>
            <div className="text-sm text-text-body mb-6 min-h-[40px]">API keys leaked in the Moltbook breach — a fully vibe-coded app with zero security review</div>
            <div className="text-xs text-text-muted">Moltbook, 2026</div>
          </FadeInStaggerItem>
          
          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 card-lift">
            <div className="text-5xl font-medium text-text-heading mb-4">74</div>
            <div className="text-sm text-text-body mb-6 min-h-[40px]">CVEs directly attributed to AI coding tools</div>
            <div className="text-xs text-text-muted">Georgia Tech Vibe Security Radar</div>
          </FadeInStaggerItem>
        </FadeInStagger>

        <FadeIn delay={0.3}>
          <p className="text-text-body text-lg mt-16 max-w-3xl">
            Vibe coding ships products in days. It also ships vulnerabilities. Tools like Cursor, Claude Code, and Windsurf generate functional code fast &mdash; but they don&apos;t check for hardcoded secrets, SQL injection, broken database policies, or malicious dependencies. Veilguard does.
          </p>
        </FadeIn>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn>
          <div className="mb-4 caption text-accent font-mono">HOW IT WORKS</div>
          <h2 className="mb-16 max-w-2xl">Install once. Code normally. Sleep well.</h2>
        </FadeIn>
        
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 flex flex-col h-full card-lift">
            <div className="mb-6 inline-block px-3 py-1 rounded-full bg-background text-text-muted text-xs font-medium border border-border">STEP 1</div>
            <h3 className="text-xl font-medium text-text-heading mb-4">Install in 30 seconds</h3>
            <p className="text-text-body text-base flex-grow mb-8">
              Add one MCP config block to your IDE — the same JSON everywhere, only the file path changes. Claude Code installs with a single command.
            </p>
            <div className="text-xs text-text-muted font-mono break-all">claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp</div>
          </FadeInStaggerItem>

          <FadeInStaggerItem className="bg-background-card-hover border border-border-active rounded-xl p-8 flex flex-col h-full -translate-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-full h-[150px] bg-accent-glow rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="mb-6 inline-block px-3 py-1 rounded-full bg-accent-muted text-accent border border-accent/20 text-xs font-medium">STEP 2</div>
            <h3 className="text-xl font-medium text-text-heading mb-4 relative z-10">Code like you always do</h3>
            <p className="text-text-body text-base flex-grow mb-8 relative z-10">
              Your AI agent calls Veilguard&apos;s tools as it writes code — automatically once you add the rules file, or any time you ask. If everything is clean, total silence. You never know it&apos;s there.
            </p>
            <div className="text-xs text-text-muted tracking-wider uppercase relative z-10">SILENT · IN YOUR IDE</div>
          </FadeInStaggerItem>

          <FadeInStaggerItem className="bg-background-card border border-border rounded-xl p-8 flex flex-col h-full card-lift">
            <div className="mb-6 inline-block px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-medium">STEP 3</div>
            <h3 className="text-xl font-medium text-text-heading mb-4">Get a nudge when something&apos;s wrong</h3>
            <p className="text-text-body text-base flex-grow mb-8">
              Found a leaked Stripe key? Your AI agent flags it right in the chat — in plain English, with the real-world consequence — then offers you the exact fix with Pro. SQL injection in an API route? Same thing. Clean code stays silent.
            </p>
            <div className="text-xs text-text-muted tracking-wider uppercase">PLAIN ENGLISH · FIX WITH PRO</div>
          </FadeInStaggerItem>
        </FadeInStagger>
      </section>

      {/* Feature Deep-Dives */}
      <section id="features" className="py-[140px] overflow-hidden border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
          
          {/* Row 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-[160px]">
            <FadeIn direction="right" className="lg:w-1/2 order-2 lg:order-1">
              <div className="mb-4 caption text-accent font-mono">SECRET SCANNING</div>
              <h3 className="mb-6 text-3xl tracking-tight">60+ patterns. Zero leaks.</h3>
              <p className="text-lg text-text-body mb-6">
                Catches 60+ API key patterns: Stripe, OpenAI, Supabase, Paystack, Flutterwave, M-Pesa, AWS, and more. Detects the #1 vibe coding mistake: AI adding live keys as fallback values.
              </p>
              <p className="text-text-muted">
                Every file modification is checked in milliseconds. Before the commit even happens.
              </p>
            </FadeIn>
            <FadeIn direction="left" className="lg:w-1/2 w-full order-1 lg:order-2">
              <div className="bg-background-code rounded-xl border border-border p-6 shadow-2xl relative">
                <div className="absolute top-0 right-10 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#EF4444] to-transparent"></div>
                <div className="font-mono text-sm space-y-4">
                  <div className="text-status-critical flex gap-3">
                    <span className="shrink-0">[CRITICAL]</span>
                    <span className="text-[#94A3B8]">Stripe live key detected in <span className="text-[#F1F5F9]">src/lib/payments.ts:14</span></span>
                  </div>
                  <div className="text-text-muted">{'  '}Found: sk_live_51M******************</div>
                  <div className="text-status-warning flex gap-3 mt-6">
                    <span className="shrink-0">[WARNING]</span>
                    <span className="text-[#94A3B8]">Supabase service role key in <span className="text-[#F1F5F9]">.env.local</span> does not match standard ignore patterns.</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-[160px]">
            <FadeIn direction="right" className="lg:w-1/2 w-full">
              <div className="bg-background-code rounded-xl border border-border p-6 shadow-2xl">
                <div className="absolute top-0 left-10 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-status-secure to-transparent"></div>
                <div className="font-mono text-sm">
                  <div className="mb-4 text-text-muted">{'// Before: AI hallucinated policy'}</div>
                  <div className="text-[#EF4444] bg-[#EF4444]/10 p-2 rounded mb-6">
                    CREATE POLICY &quot;Users can update&quot; ON users<br/>
                    FOR UPDATE USING (<span className="font-bold underline">auth.uid() IS NOT NULL</span>);
                  </div>
                  <div className="mb-4 text-text-muted">{'// After: Veilguard fix applied'}</div>
                  <div className="text-status-secure bg-status-secure/10 p-2 rounded">
                    CREATE POLICY &quot;Users can update&quot; ON users<br/>
                    FOR UPDATE USING (<span className="font-bold underline">auth.uid() = id</span>);
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="lg:w-1/2">
              <div className="mb-4 caption text-accent font-mono">SUPABASE SECURITY</div>
              <h3 className="mb-6 text-3xl tracking-tight">Catches the flaws behind real breaches.</h3>
              <p className="text-lg text-text-body mb-6">
                Deep analysis of Row Level Security policies. Catches the exact patterns behind the Moltbook breach (1.5M leaked keys) and Lovable CVE-2025-48757 (170 apps exposed). Detects <code className="text-sm bg-background-card px-2 py-1 rounded">USING(true)</code>, <code className="text-sm bg-background-card px-2 py-1 rounded">auth.uid() IS NOT NULL</code> bypass, and missing policies.
              </p>
              <div className="mt-8 border-l-2 border-[#EF4444] pl-6 py-2">
                <p className="text-sm italic text-text-muted uppercase tracking-wide mb-1">Breach Context</p>
                <p className="text-sm text-[#F1F5F9]">This exact flaw caused the Moltbook breach in January 2026, leaking 1.5M API keys and 35,000 emails.</p>
              </div>
            </FadeIn>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeIn direction="right" className="lg:w-1/2 order-2 lg:order-1">
              <div className="mb-4 caption text-accent font-mono">WEBHOOK SECURITY</div>
              <h3 className="mb-6 text-3xl tracking-tight">Unverified webhooks = free money for attackers.</h3>
              <p className="text-lg text-text-body mb-6">
                Finds webhook endpoints missing signature verification for Stripe (constructEvent), Paystack (HMAC), M-Pesa (IP check), GitHub, and Flutterwave. AI will happily skip these critical checks.
              </p>
            </FadeIn>
            <FadeIn direction="left" className="lg:w-1/2 w-full order-1 lg:order-2">
              <div className="bg-background-code rounded-xl border border-border p-6 shadow-2xl relative">
                <div className="absolute top-0 right-10 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent"></div>
                <div className="font-mono text-sm space-y-4">
                  <div className="text-status-critical flex gap-3">
                    <span className="shrink-0">[CRITICAL]</span>
                    <span className="text-[#94A3B8]">Stripe webhook in <span className="text-[#F1F5F9]">app/api/webhooks/route.ts</span> missing constructEvent verification.</span>
                  </div>
                  <div className="text-status-warning flex gap-3 mt-6">
                    <span className="shrink-0">[WARNING]</span>
                    <span className="text-[#94A3B8]">M-Pesa callback handler lacks IP allowlist validation.</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* Scanner Grid */}
      <section className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn>
          <div className="mb-4 caption text-accent font-mono">WHAT VEILGUARD CATCHES</div>
          <h2 className="mb-16 max-w-2xl">14 scanners. Every vulnerability AI introduces.</h2>
        </FadeIn>
        
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Secret Detection", desc: "Catches 60+ API key patterns: Stripe, OpenAI, Supabase, Paystack, Flutterwave, M-Pesa, AWS, and more. Detects fallback trap keys.", pro: false },
            { name: "SQL Injection", desc: "Detects template literal injection, unsanitized req.body, command injection, NoSQL injection, IDOR, and mass assignment.", pro: false },
            { name: "Webhook Verification", desc: "Finds webhook endpoints missing signature verification for Stripe, Paystack, M-Pesa, GitHub, and Flutterwave.", pro: false },
            { name: "Environment Security", desc: "Checks .env is in .gitignore, detects secrets exposed via NEXT_PUBLIC_ or VITE_ prefixes.", pro: false },
            { name: "CORS Misconfiguration", desc: "Catches cors({ origin: '*' }) on apps with authentication.", pro: false },
            { name: "Supply Chain", desc: "Detects malicious and typosquatted npm packages against a known-bad database.", pro: false },
            { name: "Dependency CVEs", desc: "Checks every npm dependency against Google OSV.dev for known vulnerabilities.", pro: false },
            { name: "Auth Configuration", desc: "Validates Clerk, NextAuth, and Supabase Auth. Catches getSession() spoofing and missing rate limiting.", pro: false },
            { name: "Security Headers", desc: "Checks CSP, HSTS, X-Frame-Options on deployed URLs.", pro: false },
            { name: "Git Security", desc: "Scans for secrets in git history, .gitignore gaps, and tracked .env files.", pro: false },
            { name: "Supabase RLS Audit", desc: "Deep analysis of Row Level Security policies. Catches USING(true), auth.uid() IS NOT NULL bypass, and missing policies.", pro: false },
            { name: "Firebase Rules Audit", desc: "Analyzes Firebase security rules for allow if true, client-controlled userId, and auth-only policies without ownership checks.", pro: false },
            { name: "App Security", desc: "Rate limiting, IDOR, password storage, file uploads, error exposure, sensitive logging, open redirects, mass assignment.", pro: false },
            { name: "AI Rules File Scanner", desc: "Scans .cursorrules, .windsurfrules, and CLAUDE.md for hidden Unicode backdoors, base64 payloads, and malicious instructions that hijack your AI agent.", pro: false },
            { name: "Full Security Audit", desc: "Runs all scanners, scores your project 0-100, assigns a grade A+ to F, and generates an AI-ready fix prompt. Pro only — unlimited.", pro: true },
          ].map((scanner, i) => (
            <FadeInStaggerItem key={i} className={`p-6 rounded-xl border bg-background-card flex flex-col h-full card-lift ${scanner.pro ? 'border-accent/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'border-border'}`}>
              <div className="flex items-center gap-3 mb-3">
                <svg className={`w-5 h-5 shrink-0 ${scanner.pro ? 'text-accent' : 'text-text-heading'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-medium text-text-heading">{scanner.name}</h3>
                {scanner.pro && <span className="ml-auto bg-accent-muted text-accent border border-accent/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Pro</span>}
              </div>
              <p className="text-sm text-text-body">{scanner.desc}</p>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </section>

      {/* Real Breaches */}
      <section className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn>
          <div className="mb-4 caption text-accent font-mono">REAL BREACHES</div>
          <h2 className="mb-16 max-w-2xl">Based on real breaches. Not theoretical risks.</h2>
        </FadeIn>
        
        <FadeInStagger className="space-y-4">
          {[
            { name: "Moltbook", year: "2026", impact: "1.5M API keys + 35K emails leaked", flaw: "Supabase RLS disabled + API key in client JS", tools: "check_supabase_rls" },
            { name: "Lovable", year: "2025", impact: "CVE-2025-48757 — 170 apps exposed", flaw: "Inverted access control in AI-generated RLS", tools: "check_supabase_rls" },
            { name: "GitGuardian 2026", year: "2025", impact: "28.65M hardcoded secrets in public repos", flaw: "AI-assisted commits leak at 2× baseline rate", tools: "scan_secrets" },
          ].map((breach, i) => (
            <FadeInStaggerItem key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background-card rounded-xl border border-border group card-lift">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-medium text-text-heading">{breach.name}</span>
                  <span className="text-xs text-text-muted bg-background px-2 py-0.5 rounded">{breach.year}</span>
                </div>
                <div className="text-[#EF4444] text-sm font-medium">{breach.impact}</div>
              </div>
              <div className="bg-[#080E12] border border-[#334155] rounded-lg px-4 py-3 text-sm text-text-body md:text-right">
                Veilguard catches this with: <span className="text-accent font-mono ml-1">{breach.tools}</span>
              </div>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </section>

      {/* IDE Install */}
      <section id="install" className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn className="text-center">
          <div className="mb-4 caption text-accent font-mono">INSTALLATION</div>
          <h2 className="mb-8 max-w-2xl mx-auto">One command. Every IDE.</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <IDEInstallTabs />
        </FadeIn>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn className="text-center">
          <div className="mb-4 caption text-accent font-mono">PRICING</div>
          <h2 className="mb-16 max-w-2xl mx-auto">Free is powerful. Pro is complete.</h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <FadeIn direction="up" delay={0.1}>
            <div className="bg-background-card border border-border rounded-xl p-10 flex flex-col h-full card-lift">
              <h3 className="text-2xl font-medium text-text-heading mb-2">Free</h3>
              <div className="text-4xl font-semibold text-text-heading mb-8">$0<span className="text-lg text-text-muted font-normal">/mo</span></div>
              
              <ul className="space-y-4 mb-10 flex-grow text-text-body text-sm">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>All 14 scanners (including RLS &amp; Firebase)</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Every vulnerability flagged — plain-English alerts</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>MCP server — works in Cursor, Claude Code, Windsurf, VS Code &amp; Antigravity</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-[#475569] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg><span className="text-[#475569]">Fixes &amp; solutions — upgrade to unlock</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-[#475569] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg><span className="text-[#475569]">Full security audit &amp; letter grade (Pro only)</span></li>
              </ul>
              
              <Link href="/start" className="block text-center w-full py-3 rounded-xl border border-border text-text-heading font-medium hover:bg-background-card-hover hover:border-border-hover transition-colors cursor-pointer">
                Get started
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="bg-background-code border border-border-active rounded-xl p-10 flex flex-col h-full relative overflow-hidden shadow-[0_0_40px_rgba(52,211,153,0.1)]">
              <div className="absolute top-0 right-0 bg-accent text-[#080E12] text-xs font-bold px-4 py-1 rounded-bl-lg">RECOMMENDED</div>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              
              <h3 className="text-2xl font-medium text-text-heading mb-2">Pro</h3>
              <div className="text-4xl font-semibold text-text-heading mb-8">$19<span className="text-lg text-text-muted font-normal">/mo</span></div>
              
              <ul className="space-y-4 mb-10 flex-grow text-text-body text-sm">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Everything in Free</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-[#F1F5F9] font-medium">The exact fix for every vulnerability</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Full audit with letter grade (A+ to F)</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>AI-ready fix prompt (paste to fix everything at once)</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Full security audit — unlimited</span></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span>Breach context on every finding</span></li>
              </ul>
              
              <Link href="/pro" className="block text-center w-full py-3 rounded-full bg-accent text-[#080E12] font-semibold btn-primary cursor-pointer">
                Go Pro
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* IDE Support */}
      <section className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn className="text-center">
          <div className="mb-4 caption text-accent font-mono">IDE SUPPORT</div>
          <h2 className="mb-16 max-w-2xl mx-auto">Works in every AI coding IDE</h2>
        </FadeIn>

        <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Cursor", desc: "One command, then ask Cursor to scan \u2014 findings show up right in chat." },
            { name: "Claude Code", desc: "One line to connect. Claude checks your code as it writes it." },
            { name: "Windsurf", desc: "Set up in one command. Restart and you're protected." },
            { name: "VS Code", desc: "Runs through Copilot Chat \u2014 one command, no manual config." },
            { name: "Antigravity", desc: "One command wires it into the MCP panel. No extra setup." },
          ].map((ide, i) => (
            <FadeInStaggerItem key={i} className="p-6 rounded-xl border border-border bg-background-card card-lift">
              <h3 className="font-medium text-text-heading mb-2">{ide.name}</h3>
              <p className="text-sm text-text-body">{ide.desc}</p>
            </FadeInStaggerItem>
          ))}
          {/* 6th tile balances the 3-col grid and doubles as a CTA */}
          <FadeInStaggerItem className="p-6 rounded-xl border border-accent/30 bg-accent-muted/40 card-lift flex flex-col">
            <h3 className="font-medium text-text-heading mb-2">Any MCP editor</h3>
            <p className="text-sm text-text-body flex-grow">Built on the Model Context Protocol \u2014 if your editor speaks MCP, Veilguard works.</p>
            <Link href="/start" className="mt-4 inline-flex items-center gap-1 text-accent text-sm font-medium">
              Get started free <span aria-hidden>\u2192</span>
            </Link>
          </FadeInStaggerItem>
        </FadeInStagger>
      </section>

      {/* Privacy */}
      <section className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn>
          <div className="mb-4 caption text-accent font-mono">PRIVACY</div>
          <h2 className="mb-8 max-w-2xl">100% local. Your code never leaves your machine.</h2>
          <p className="text-lg text-text-body max-w-3xl mb-8">
            Veilguard runs entirely on your laptop. It reads your files locally, matches patterns locally, and returns results locally. The only outbound calls are to Google&apos;s OSV.dev API (sends package names only, never code) and veilguard.dev for Pro license validation. No telemetry. No data collection. Open source on GitHub.
          </p>
          <a href="https://github.com/elmimoha15/veilguard" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline font-medium">
            View on GitHub <span className="text-xs">&uarr;</span>
          </a>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-[140px] px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto border-t border-border">
        <FadeIn className="text-center">
          <div className="mb-4 caption text-accent font-mono">FAQ</div>
          <h2 className="mb-4 max-w-2xl mx-auto">Questions vibe coders ask before installing</h2>
          <p className="text-text-body text-lg mb-16 max-w-2xl mx-auto">
            Everything you need to know about securing AI-generated code, vibe coding security risks, and how Veilguard works.
          </p>
        </FadeIn>

        <FadeInStagger className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, i) => (
            <FadeInStaggerItem key={i}>
              <details className="group bg-background-card border border-border rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="px-6 py-5 font-medium text-text-heading cursor-pointer flex justify-between items-center outline-none text-base">
                  {item.q}
                  <span className="transition-transform group-open:rotate-180 shrink-0 ml-4 text-text-muted">
                    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-3 text-text-body text-sm leading-relaxed border-t border-border/50">
                  {item.a}
                </div>
              </details>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </section>

      {/* Final CTA */}
      <section className="relative py-[200px] px-6 text-center border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none -z-10" aria-hidden></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-glow rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <FadeIn>
          <h2 className="mb-4">Ship fast. <span className="text-gradient-accent">Ship secure.</span></h2>
          <p className="text-lg text-text-body mb-10 max-w-xl mx-auto">One command. Pick your editor, restart, and start scanning. Free forever for indie developers.</p>
          <div className="max-w-xl mx-auto text-left space-y-3 mb-3">
            <CommandBox command="npx -y --package=veilguard veilguard-cli init" />
            <CommandBox command="claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp" label="Claude Code" />
          </div>
          <p className="text-sm text-text-muted mb-10 max-w-xl mx-auto">
            Run it from inside your project folder — Veilguard installs into the project you&apos;re in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/start" className="w-full sm:w-auto px-8 py-3 rounded-full bg-background-card border border-border text-text-heading hover:bg-background-card-hover hover:border-border-hover font-medium transition-colors cursor-pointer">
              Install Free
            </Link>
            <Link href="/pro" className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-[#080E12] font-semibold btn-primary cursor-pointer">
              Go Pro — $19/mo
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
