import type { BrandLogoName } from '@/components/ui/BrandLogo';

/**
 * Per-tool SEO landing pages. Each targets a distinct keyword cluster
 * ("Lovable security scanner", "Supabase RLS checker", …) with unique,
 * non-thin copy. Rendered via <ToolLanding> in the clean article layout: a
 * page either supplies prose `sections` (AI-agent pages) or the older
 * `checks[]` + `why` (the other tools); both keep `faqs` (FAQPage schema).
 */
export type ScannerCategorySlug = 'ai-coding-agents' | 'vibecoding-tools' | 'backends';

export interface Check {
  title: string;
  body: string;
  severity: 'critical' | 'warning';
}

/** A prose block for the article-style pages. */
export interface ToolSection {
  heading: string;
  paras?: string[];
  bullets?: string[];
  /** Render `bullets` as a numbered list (e.g. best-practices steps). */
  numbered?: boolean;
  /** Optional code/SQL sample rendered as a dark code block. */
  code?: { label?: string; content: string };
}

export interface ScannerPage {
  slug: string; // URL: /<slug>
  tool: string; // "Lovable"
  brand: BrandLogoName; // icon key
  category: ScannerCategorySlug; // for the tool → category backlink + siblings
  /** 'url' (default): a live app to scan by URL. 'code': educational page, repo/upload-focused CTA. */
  scanKind?: 'url' | 'code';
  eyebrow: string; // mono kicker
  /** SEO */
  metaTitle: string; // full <title>, ≤ 60 chars incl. brand
  metaDescription: string; // ~150–160 chars
  keywords: string[];
  /** Hero */
  h1: string;
  intro: string; // rendered as the "short answer" block
  /** Article-style prose blocks (agent pages). When present, replaces checks/why. */
  sections?: ToolSection[];
  /** "What we check" (legacy tools). */
  checksHeading?: string;
  checks?: Check[];
  /** "Why … apps ship exposed" (legacy tools). */
  whyHeading?: string;
  why?: string;
  /** Objection-handling FAQ (also emitted as FAQPage schema). */
  faqs: { q: string; a: string }[];
  /** Cross-links to relevant /guides + /security pages. */
  related?: { label: string; href: string }[];
  /** Real, linkable sources for any stat/CVE/breach referenced on the page. */
  sources?: { label: string; href?: string }[];
}

export const SCANNERS: ScannerPage[] = [
  {
    slug: 'lovable',
    tool: 'Lovable',
    brand: 'lovable',
    category: 'vibecoding-tools',
    eyebrow: 'LOVABLE SECURITY',
    metaTitle: 'Lovable Security Scanner, Check Your App Free | Veilguard',
    metaDescription:
      'Built your app with Lovable? Scan it free for exposed keys, open Supabase rules and auth holes, a plain-English A–F grade in 60 seconds, plus the exact fixes.',
    keywords: [
      'Lovable security',
      'Lovable app security',
      'is my Lovable app secure',
      'Lovable Supabase security',
      'Lovable security scanner',
      'Lovable RLS',
    ],
    h1: 'Is your Lovable app safe to charge people money?',
    intro:
      'Lovable builds you a working app in minutes and wires it straight into Supabase, which is exactly where the dangerous mistakes hide. [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) is the proof: a researcher scanned 1,645 live Lovable apps and found 170 with databases anyone could read, no login needed. The usual culprits are row-level security left off, API keys shipped to the browser, and logins with no real lock on the door. Veilguard scans your live Lovable app the way an attacker would, grades it A to F, and hands you the exact fix for every issue.',
    sections: [
      {
        heading: 'The mistake that exposed 170 Lovable apps',
        paras: [
          'Lovable defaults to Supabase, and Supabase protects your data with row-level security (RLS). When RLS is off, or a policy is written as USING(true), the public anon key that ships in your app can read and write every row in the table. That key is meant to be public; the protection is supposed to come from RLS. Skip it and your customer list is one request away.',
          'This is not a rare edge case. In [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757), researcher Matt Palmer scanned 1,645 live Lovable apps and found 170 (about 10%) with databases anyone could read across 303 endpoints. The apps worked perfectly for their owners, who were logged in, and were wide open to everyone else.',
        ],
      },
      {
        heading: 'Where a Lovable app usually leaks',
        bullets: [
          'RLS off or too broad: the anon key reads and writes every table. The single most damaging Lovable issue.',
          'Secret keys in the browser: a Supabase service_role, Stripe, or OpenAI key bundled into the client, copyable from your page source.',
          'Auth or paywall checked in the browser: a check the visitor can flip in the console.',
          'Public storage buckets: uploaded IDs, invoices, and photos left crawlable by anyone.',
          'Wide-open CORS: any website allowed to call your API on behalf of your users.',
        ],
      },
      {
        heading: 'Turn on row-level security: the exact policy',
        paras: [
          'For every table that holds user data, enable RLS and add a policy that scopes each user to their own rows. Run this in the Supabase SQL editor, once per table, replacing the table and column names with yours.',
        ],
        code: {
          label: 'Supabase SQL, run per table',
          content: `-- 1. Turn RLS on for the table
alter table public.profiles enable row level security;

-- 2. Let each user read only their own rows
create policy "Users read own rows"
  on public.profiles for select
  using (auth.uid() = user_id);

-- 3. Let each user write only their own rows
create policy "Users write own rows"
  on public.profiles for insert
  with check (auth.uid() = user_id);`,
        },
      },
      {
        heading: 'Lock down the rest of your Lovable app',
        numbered: true,
        bullets: [
          'Enable RLS on every table, then confirm the Supabase dashboard shows no table marked "RLS disabled".',
          'Move every secret key out of the browser to a Supabase Edge Function or server route, then rotate any key that was ever in the client.',
          'Run auth and paywall checks on the server, from the verified session, never from a value in the browser.',
          'Make storage buckets private and serve files through signed URLs.',
          'Re-scan after each new feature, new tables and endpoints are where the next hole appears.',
        ],
      },
      {
        heading: 'Scan your live Lovable app',
        paras: [
          'Paste your app’s URL into [Veilguard](/) and it probes your deployed app the way an attacker would, trying to read your tables with the public key, no code access needed. For the deepest read, connect Supabase or GitHub read-only; your source is never stored. Either way you get an A to F grade and, for each issue, the exact SQL or a prompt to paste back into Lovable.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is my Lovable app secure by default?',
        a: 'No. Lovable is built to make your app work, not to lock it down, and it does not tell you what it left open. The most common critical issue is Supabase row-level security left off, which exposed 170+ live apps in CVE-2025-48757.',
      },
      {
        q: 'Do I need row-level security if I only use the anon key?',
        a: 'Yes, especially then. The anon key is designed to be public and ship in the browser; row-level security is the only thing standing between that key and your data. With RLS off, the anon key can read and write every table.',
      },
      {
        q: 'Do I have to connect my Lovable project?',
        a: 'No. The free scan looks at your live app from the outside, what an attacker already sees. For a deeper audit you can optionally connect Supabase or GitHub with read-only access, and your source is never stored.',
      },
      {
        q: 'I’m not technical, can I actually fix what it finds?',
        a: 'Yes. Every fix is either copy-paste code and SQL, or a ready-made prompt you hand straight to Lovable to apply for you. You do not need to read the code.',
      },
    ],
    related: [
      { label: 'How do I know if my Supabase database is exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
      { label: 'Supabase row-level security, explained for non-developers', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
    ],
    sources: [
      { label: 'CVE-2025-48757: Lovable RLS breakdown exposed 170+ live apps (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
      { label: 'Wiz Research: Moltbook exposed database (1.5M API keys, 35k emails)', href: 'https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys' },
    ],
  },
  {
    slug: 'bolt',
    tool: 'Bolt',
    brand: 'bolt',
    category: 'vibecoding-tools',
    eyebrow: 'BOLT SECURITY',
    metaTitle: 'Bolt.new Security Scanner, Check Your App | Veilguard',
    metaDescription:
      'Shipped an app with Bolt.new? Scan it free for exposed keys, open database rules and auth gaps. Get a plain-English A–F security grade in 60 seconds, plus fixes.',
    keywords: [
      'Bolt.new security',
      'Bolt security scanner',
      'is my Bolt app secure',
      'Bolt.new Supabase security',
      'Bolt app security check',
    ],
    h1: 'Is your Bolt.new app safe to launch?',
    intro:
      'Bolt.new turns a prompt into a full-stack app in one sitting, frontend, backend, and database wired together for you. The speed is the point, but nobody stops to check what got left open: environment secrets bundled into the browser, a database anyone can query, and payment flows with no verification. That is the norm, not the exception, [Veracode’s 2025 study](https://www.veracode.com/blog/genai-code-security-report/) found AI writes insecure code about 45% of the time. Veilguard scans your live Bolt app from the outside, grades it A to F, and shows you the exact fix for each hole.',
    sections: [
      {
        heading: 'Why speed is the reason things leak',
        paras: [
          'Bolt optimizes for a working prototype in minutes, so it makes the pragmatic choices that get an app running: permissive database defaults, secrets wherever they are convenient, and no verification on money flows. Those choices are fine for a demo and dangerous the moment real customers and real payments show up.',
          'The catch is that none of it looks broken. The app runs, the checkout completes, the dashboard loads, because you are testing as a trusted user. The gaps only show when a stranger, or an automated scanner, pokes at the parts Bolt wired up for you.',
        ],
      },
      {
        heading: 'The gaps Bolt leaves in a live app',
        bullets: [
          'Secrets in the browser: Bolt often prefixes keys (VITE_...) so they get bundled into the client, where anyone can read them from your page.',
          'Database rules left open: Supabase RLS or Firebase rules that let any visitor read or write your tables, the fastest path to a full data leak.',
          'Payment webhooks with no signature check: a Stripe or Paystack webhook that accepts any request, so anyone can forge a "payment succeeded" event.',
          'Auth and rate-limiting gaps: login endpoints with no throttling, and access checks that run only in the browser.',
          'Overly permissive CORS: an API that answers any origin, letting other sites ride on your users’ sessions.',
        ],
      },
      {
        heading: 'Close the gaps before you launch',
        numbered: true,
        bullets: [
          'Move every secret out of client-prefixed env vars into server-side config, then rotate anything that was ever exposed.',
          'Turn on database rules (Supabase RLS or Firebase security rules) and scope each user to their own data.',
          'Verify every payment webhook signature on the server before you trust the event.',
          'Run auth checks on the server and add rate limiting to login and signup.',
          'Lock CORS to your own domain and re-scan after each new feature.',
        ],
      },
      {
        heading: 'Find and close the gaps',
        paras: [
          'Paste your deployed Bolt URL into [Veilguard](/) and it scans your live app from the outside, no install, no signup. If your app uses Supabase or Firebase, connect it read-only for a deeper database-rules audit. Every finding comes with the exact code fix or a copy-paste prompt you can hand back to Bolt.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can Veilguard scan a Bolt.new app?',
        a: 'Yes. Paste your deployed Bolt URL and we scan it from the outside, no install, no signup. If your app uses Supabase or Firebase, we run a deeper database-rules audit too.',
      },
      {
        q: 'What is the most common problem in Bolt apps?',
        a: 'Exposed secrets and open database rules. Bolt often bundles keys into the browser and leaves Supabase or Firebase permissions permissive, which together are exactly how vibe-coded apps get breached.',
      },
      {
        q: 'Is it safe to take payments on a Bolt app?',
        a: 'Only once the money flow is verified on the server. Bolt frequently generates webhooks that accept unsigned requests, so a forged event can mark an order as paid. Check the webhook signature server-side before trusting it, and scan the app before you go live.',
      },
      {
        q: 'How do I fix the issues you find?',
        a: 'Each finding comes with the exact code fix or a copy-paste prompt you can hand back to Bolt to apply. No security background needed.',
      },
    ],
    related: [
      { label: 'Exposed API keys: how to find and fix them', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    sources: [
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
      { label: 'CVE-2025-48757: open Supabase RLS exposed 170+ live vibe-coded apps (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757' },
    ],
  },
  {
    slug: 'replit',
    tool: 'Replit',
    brand: 'replit',
    category: 'vibecoding-tools',
    eyebrow: 'REPLIT SECURITY',
    metaTitle: 'Replit Security Scanner, Check Your App Free | Veilguard',
    metaDescription:
      'Built and deployed with Replit Agent? Scan your app free for exposed secrets, open database rules and auth holes, an A–F security grade in 60 seconds, plus fixes.',
    keywords: [
      'Replit security',
      'Replit Agent security',
      'is my Replit app secure',
      'Replit security scanner',
      'Replit deployment security',
    ],
    h1: 'Is your Replit app safe for real users?',
    intro:
      'Replit Agent writes your app, deploys it, and can act on your live systems, which is exactly how the SaaStr incident happened: during a code freeze the Agent deleted a production database and the CEO later called it a "catastrophic failure" ([Fortune](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)); it then fabricated thousands of fake records to cover the damage and, as the founder put it, "lied" about what it had done ([The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/)). The everyday risks are quieter, exposed secrets, an open database, logins with no real lock, but the lesson is the same: nothing reviews a Replit app before it goes public. Veilguard scans your live deployment, grades it A to F, and gives you the exact fix.',
    sections: [
      {
        heading: 'When the agent has the keys to production',
        paras: [
          'Replit Agent is unusual among these tools: it does not just write code, it can run commands and act on your live database. That is what turned the SaaStr incident from a bug into a disaster, the Agent made a destructive change to production during a code freeze it had been told to respect, then tried to hide it. The founder had no chance to review before the damage was done.',
          'The takeaway is not "never use the Agent", it is "never give it standing access to production". Keep a hard line between what the Agent can touch and your live customer data.',
        ],
      },
      {
        heading: 'What a Replit app tends to ship with',
        bullets: [
          'Exposed secrets: keys in your client bundle or committed to git history, where anyone can lift them.',
          'Open database access: Replit DB, Supabase, or Postgres left readable or writable by any visitor, the top cause of vibe-coded data leaks.',
          'Authentication holes: access checks that only run in the browser, no rate limits on login, weak password handling.',
          'Injection risks: user input passed straight into a query or shell command, the classic SQL injection the Agent does not guard against.',
          'Wide-open CORS and missing security headers: the baseline protections attackers probe for first, often absent on a fresh deployment.',
        ],
      },
      {
        heading: 'Keep the agent away from production',
        numbered: true,
        bullets: [
          'Never give the Agent standing write access to your production database; use a separate dev database and promote changes deliberately.',
          'Move secrets into Replit Secrets or server-side env, never the client bundle, and rotate any key that was committed.',
          'Turn on database access rules and scope every user to their own rows.',
          'Run auth on the server, add rate limiting to login, and parameterize every query to block injection.',
          'Re-scan after each deploy, building and shipping in one action means there is no other checkpoint.',
        ],
      },
      {
        heading: 'Scan your Replit repo',
        paras: [
          'Paste your live Replit URL into [Veilguard](/) and it scans the deployed app from the outside in about 60 seconds. Connect GitHub read-only for a deeper audit that includes secrets buried in your git history, then tells you exactly which keys to rotate. Every issue comes with copy-paste code or a prompt you can give back to Replit Agent.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can someone hack or delete my database if I built it with Replit?',
        a: 'The risk is real on two fronts: an open database anyone can read or write, and the Agent itself acting on production, which is what caused the SaaStr database wipe. Keep the Agent away from live data and lock your database rules, then scan to confirm both.',
      },
      {
        q: 'Does Veilguard work with Replit deployments?',
        a: 'Yes. Paste your live Replit URL and we scan it from the outside in about 60 seconds. Connect GitHub or your database read-only for a deeper audit that includes secrets in your git history.',
      },
      {
        q: 'Will it catch secrets committed to my Repl?',
        a: 'With a read-only GitHub connection, yes. We scan your git history for keys and tokens that were committed and are still exposed, then tell you exactly which to rotate.',
      },
      {
        q: 'Do I need to understand the fixes?',
        a: 'No. Every issue comes with copy-paste code or a ready-made prompt you can give back to Replit Agent to apply for you.',
      },
    ],
    related: [
      { label: 'Can someone hack an app built with AI?', href: '/security/can-someone-hack-an-app-built-with-ai' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    sources: [
      { label: 'Fortune: Replit AI wiped a production database, CEO called it a "catastrophic failure"', href: 'https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/' },
      { label: 'The Register: Replit’s AI agent deleted a database and fabricated fake records', href: 'https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
    ],
  },
  {
    slug: 'v0',
    tool: 'v0',
    brand: 'v0',
    category: 'vibecoding-tools',
    eyebrow: 'V0 SECURITY',
    metaTitle: 'v0 Security Scanner, Check Your App Free | Veilguard',
    metaDescription:
      'Built your app with v0 by Vercel? Scan it free for exposed keys, open database rules and auth gaps. Get a plain-English A–F grade in 60 seconds, plus the exact fixes.',
    keywords: [
      'v0 security',
      'v0 by Vercel security',
      'is my v0 app secure',
      'v0 security scanner',
      'v0 Supabase security',
    ],
    h1: 'Your v0 app looks production-ready. Is it actually secure?',
    intro:
      'v0 turns a prompt into a polished Next.js app you can push to Vercel the same day, and looking finished is not the same as being safe. The risk sits where you cannot see it: secrets marked NEXT_PUBLIC_ that get baked into the browser bundle, source maps that expose your server code, and database rules left open. Secrets leaking into public code is now the norm, [GitGuardian](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/) found 28.6M secrets exposed on public GitHub in 2025. Veilguard scans your live v0 app, grades it A to F, and hands you the exact fix for every issue.',
    sections: [
      {
        heading: 'Looking done is not the same as being safe',
        paras: [
          'v0 is exceptional at generating interfaces, and that polish is exactly what hides the risk: an app that looks finished reads as safe. But the security-critical parts, who is allowed to do what, and which secrets reach the browser, are decisions v0 makes for convenience, not safety.',
          'It is a broad pattern, not a v0 quirk. [Veracode’s 2025 study](https://www.veracode.com/blog/genai-code-security-report/) found AI writes insecure code about 45% of the time. A confident, good-looking result is not evidence the access rules and secrets are handled correctly.',
        ],
      },
      {
        heading: 'Where v0 apps leak',
        bullets: [
          'Secrets in the bundle: keys marked NEXT_PUBLIC_ (or otherwise shipped to the client) are one right-click away from anyone.',
          'Exposed source maps: production source maps that hand an attacker your server logic and structure.',
          'Open database rules: Supabase RLS or Postgres policies left permissive, so any visitor can read or change data that is not theirs.',
          'Unprotected server actions and routes: Next.js server actions and API routes that skip authorization, letting the wrong user trigger privileged operations.',
          'Unsigned payment webhooks and open CORS: forged events marked as paid, and APIs that answer any origin.',
        ],
      },
      {
        heading: 'Keep v0’s secrets on the server',
        numbered: true,
        bullets: [
          'Only prefix a variable with NEXT_PUBLIC_ if it is genuinely safe to publish; keep every real secret in server-only env and read it in server actions or route handlers.',
          'Disable production source maps so your server logic is not shipped to the browser.',
          'Turn on database rules (Supabase RLS or Postgres policies) and scope each user to their own rows.',
          'Add an authorization check at the top of every server action and API route, from the verified session.',
          'Verify Stripe webhook signatures on the server, lock CORS to your domain, and re-scan after each deploy.',
        ],
      },
      {
        heading: 'Get the secrets out of the bundle',
        paras: [
          'Paste your deployed URL into [Veilguard](/) and it scans your live v0 app from the outside in about a minute, flagging keys and source maps exposed in the browser. Connect GitHub read-only to also check for authorization gaps in your server actions and routes. Every finding comes with copy-paste code or a prompt you can hand back to v0.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can Veilguard scan a v0 (Vercel) app?',
        a: 'Yes. Paste your deployed URL and we scan it from the outside in about a minute. If it uses Supabase, we run a deeper row-level-security audit as well.',
      },
      {
        q: 'What does NEXT_PUBLIC_ actually expose?',
        a: 'Any variable prefixed with NEXT_PUBLIC_ is inlined into the JavaScript sent to every visitor’s browser, so it is effectively public. If a real secret (a service_role key, a Stripe secret, an API token) ends up there, anyone can read it from your page. Keep those server-side only.',
      },
      {
        q: 'Does it check Next.js server actions and API routes?',
        a: 'With a read-only GitHub connection we check for authorization gaps in server actions and routes, a common way v0 apps let the wrong user do privileged things.',
      },
      {
        q: 'How are the fixes delivered?',
        a: 'As copy-paste code or a ready-made prompt you can hand back to v0. You do not need to understand the code to apply them.',
      },
    ],
    related: [
      { label: 'Exposed API keys: how to find and fix them', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'Is it safe to take payments on a vibe-coded app?', href: '/guides/is-it-safe-to-take-payments-on-a-vibe-coded-app' },
    ],
    sources: [
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
      { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
      { label: 'CVE-2025-48757: open Supabase RLS exposed 170+ live vibe-coded apps (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757' },
    ],
  },
  {
    slug: 'cursor',
    tool: 'Cursor',
    brand: 'cursor',
    category: 'ai-coding-agents',
    eyebrow: 'CURSOR SECURITY',
    metaTitle: 'Cursor code security: what to check | Veilguard',
    metaDescription:
      'Cursor writes code fast, but it needs a security review it won’t do for you. See what Cursor-written code tends to get wrong and how to fix it. Free code scan.',
    keywords: ['Cursor security', 'Cursor code security', 'cursorrules security', 'is Cursor code secure', 'AI generated code security'],
    h1: 'What Cursor gets wrong about security (and how to fix it in your code)',
    intro:
      'Cursor is a fast, capable coding agent, but the code it writes needs a security review it won’t do for you. The clearest example: Enrichlead, a SaaS built almost entirely with Cursor, shipped with its security logic in the browser and admin keys hardcoded into the bundle. Attackers bypassed the paywall and abused the exposed keys, and the app was shut down ([Revolter Tech](https://www.revolter.se/en/blog/vibe-coding-trap-easy-and-risky)). Cursor wasn’t "hacked", the code it helped write was insecure, and it went live. Veilguard reads your Cursor-written codebase and catches these issues first.',
    sections: [
      {
        heading: 'The pattern: Cursor puts security in the wrong place',
        paras: [
          'Cursor is great at building features fast. When it needs an "is this user allowed?" check, the quickest working version often runs in the browser (if (user.isPro) showPaidFeature()). It looks fine, until someone opens the console and flips the value. Real authorization has to happen on the server, and Cursor usually won’t put it there unless you tell it to.',
        ],
      },
      {
        heading: 'The .cursorrules risk (Cursor’s unique angle)',
        paras: [
          'Cursor reads a .cursorrules file that shapes how it writes code across your whole project. [Pillar Security](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents)’s "Rules File Backdoor" research showed a poisoned rules file can push Cursor into writing insecure code everywhere, invisibly. Even without an attacker, a casual rule like "don’t worry about auth for now" gets applied to every feature. Review this file like important config.',
        ],
      },
      {
        heading: 'Work securely with Cursor',
        numbered: true,
        bullets: [
          'Review every security-relevant suggestion before accepting, treat Cursor’s output as a draft, not a decision.',
          'Ask Cursor explicitly for server-side checks: prompt it to put authorization on the server/API route, validated from the session, not in the component.',
          'Keep secrets out of client code, use server env vars; never let a key reach the browser bundle.',
          'Audit your .cursorrules for anything that trades security for speed.',
          'Re-scan after each feature, new routes and database calls are where risk enters.',
        ],
      },
      {
        heading: 'Scan your Cursor code and lock it down',
        paras: [
          'Connect your repo or upload your code to [Veilguard](/), it reads your actual Cursor-written source, flags client-side auth, exposed secrets, and risky .cursorrules, and gives you the exact fix or a prompt to paste back into Cursor.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What are the red flags in Cursor-written code?',
        a: 'An authorization check inside a React component instead of an API route. A secret key (service_role, Stripe, OpenAI) referenced in client code or a bundled .env. A .cursorrules file that tells Cursor to skip validation or hardcode credentials. Database writes with no server-side auth around them.',
      },
      {
        q: 'What are the common authentication mistakes in Cursor code?',
        a: 'Cursor tends to check permissions on the client, trust a value from the request body to grant access, and store tokens where scripts can read them. All three let an attacker act as someone else. The fix is one principle: decide access on the server, from a verified session, never from client state.',
      },
      {
        q: 'Is Cursor less secure than Lovable or Bolt?',
        a: 'They fail differently. Prompt-to-app tools (Lovable, Bolt) tend to leave the database open; coding agents like Cursor tend to put authorization in the wrong place and hardcode secrets. Whatever you built with, the resulting app needs checking, the specific holes just depend on the tool.',
      },
    ],
    related: [
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Exposed API keys: how to find and fix', href: '/security/how-to-check-for-exposed-api-keys' },
    ],
    sources: [
      { label: 'Revolter Tech: the vibe-coding trap (Enrichlead)', href: 'https://www.revolter.se/en/blog/vibe-coding-trap-easy-and-risky' },
      { label: 'Pillar Security: the Rules File Backdoor', href: 'https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
    ],
  },
  {
    slug: 'copilot',
    tool: 'Copilot',
    brand: 'copilot',
    category: 'ai-coding-agents',
    eyebrow: 'COPILOT SECURITY',
    metaTitle: 'GitHub Copilot code security | Veilguard',
    metaDescription:
      'Research finds 40% of Copilot suggestions vulnerable. Copilot doesn’t run your app, but its code does, see what it gets wrong and how to fix it. Free code scan.',
    keywords: ['Copilot security', 'GitHub Copilot code security', 'is Copilot code secure', 'Copilot vulnerabilities', 'AI generated code security'],
    h1: 'Is code from GitHub Copilot secure enough to ship?',
    intro:
      'Not without review. Copilot writes code suggestions, it doesn’t run your app, so there’s nothing in "Copilot" to breach. The risk is the code it puts in your project, and the research is consistent: [NYU](https://arxiv.org/abs/2108.09293) found 40% of Copilot’s suggestions across 89 scenarios were vulnerable, and [a 2025 study of real GitHub projects](https://arxiv.org/abs/2310.02059) found ~30% of Copilot snippets had weaknesses across 43 vulnerability types. Microsoft even patched a Copilot flaw ([CVE-2025-53773](https://nvd.nist.gov/vuln/detail/CVE-2025-53773)) where poisoned config files could hijack its behavior. Veilguard reads your Copilot-assisted code and catches what it introduced.',
    sections: [
      {
        heading: 'Why Copilot suggestions are risky',
        paras: [
          'Copilot predicts the "most likely" next code from public repositories, which are full of insecure code. So it confidently suggests SQL built by string concatenation, handlers that skip input validation, weak randomness, and error handling that leaks internals. [A Stanford study](https://arxiv.org/abs/2211.03622) found developers using assistants like Copilot wrote more security bugs than those who didn’t, while being more confident. That confidence is the trap.',
        ],
      },
      {
        heading: 'Where Copilot code specifically leaves you exposed',
        bullets: [
          'Missing input validation: request data used directly, opening injection.',
          'Weak error handling: raw errors and stack traces returned to users, leaking DB structure and paths.',
          'Committed secrets: hardcoded keys that get committed (28.6M secrets on GitHub in 2025, [GitGuardian](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/)).',
          'Risky dependencies: Copilot may suggest outdated or typo-squatted packages; verify what you install.',
        ],
      },
      {
        heading: 'Use Copilot without shipping its mistakes',
        numbered: true,
        bullets: [
          'Treat every suggestion as unreviewed code from a stranger, read it before accepting.',
          'Never accept a query, auth check, or input handler without confirming it validates and scopes properly.',
          'Keep secrets in server-side env vars, never in code; scan for committed secrets.',
          'Return generic error messages; log details server-side only.',
          'Verify dependencies Copilot suggests before installing.',
        ],
      },
      {
        heading: 'Catch it before it ships',
        paras: [
          'Connect your repo or upload your code to [Veilguard](/), it flags the injection, validation, error-handling, and secret issues Copilot tends to introduce, and gives you the fix or a prompt to apply it.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do I handle missing input validation in Copilot code?',
        a: 'Copilot often uses request data directly. Validate and sanitize every input before it reaches a query, command, or render, and parameterize database queries instead of building them by string concatenation. This is the single most common AI-code weakness.',
      },
      {
        q: 'Why is Copilot’s error handling a security risk?',
        a: 'Its catch blocks frequently return raw errors or stack traces to the user, which leak your database structure and file paths, the reconnaissance an attacker wants. Return a generic message to the user and log the real detail server-side.',
      },
      {
        q: 'How do I avoid supply-chain risks from Copilot’s package suggestions?',
        a: 'Copilot may suggest outdated or typo-squatted packages. Verify every dependency before installing, check the real package name, its maintainer, and recent activity, and keep dependencies updated.',
      },
    ],
    related: [
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Exposed API keys: what they are and how to fix', href: '/security/exposed-api-keys-what-they-are-how-to-find-and-fix' },
    ],
    sources: [
      { label: 'Pearce et al., NYU 2022: "Asleep at the Keyboard" (~40% of Copilot completions vulnerable)', href: 'https://arxiv.org/abs/2108.09293' },
      { label: 'Fu et al., 2025: Security Weaknesses of Copilot-Generated Code (43 CWEs)', href: 'https://arxiv.org/abs/2310.02059' },
      { label: 'Perry et al., Stanford 2023: developers with AI wrote less secure code, more confidently', href: 'https://arxiv.org/abs/2211.03622' },
      { label: 'CVE-2025-53773: GitHub Copilot RCE via config-file prompt injection (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-53773' },
      { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
    ],
  },
  {
    slug: 'claude',
    tool: 'Claude',
    brand: 'claude',
    category: 'ai-coding-agents',
    eyebrow: 'CLAUDE SECURITY',
    metaTitle: 'Claude code security | Veilguard',
    metaDescription:
      'Claude writes strong code, but well-written isn’t the same as secure for your app. See what to check in Claude-assisted code and how to fix it. Free code scan.',
    keywords: ['Claude security', 'Claude Code security', 'CLAUDE.md security', 'is Claude code secure', 'AI generated code security'],
    h1: 'Claude writes clean code. Is it secure for your app?',
    intro:
      'Claude writes strong, well-structured code, but "well-written" isn’t the same as "secure for your specific app", and like every coding agent, it’s guided by instruction files that shape everything it builds. Claude doesn’t host your app or data, so there’s nothing in the tool to breach. The question is whether the code it wrote for you actually locks things down. Veilguard reads your Claude-assisted codebase and confirms it holds up.',
    sections: [
      {
        heading: 'Well-written code can still be wide open',
        paras: [
          'This is the trap for non-technical founders: Claude producing clean, confident code feels safe. But tidy code with the database rules left off, or with a paywall checked in the browser, is still fully exposed. Security is about where the checks run and what’s exposed, not how neat the code looks. That gap is exactly what Veilguard checks.',
        ],
      },
      {
        heading: 'The CLAUDE.md / AGENTS.md factor',
        paras: [
          'Agentic coding uses instruction files (CLAUDE.md, AGENTS.md) that tell the agent your project’s rules, powerful, but a single point of influence over your whole codebase. The same rules-file risk [Pillar Security](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents) demonstrated applies: an instruction that trades security for speed, or a maliciously inserted one, affects everything. Review these files like critical config.',
        ],
      },
      {
        heading: 'Make Claude prove the security',
        numbered: true,
        bullets: [
          'Ask Claude to explain the security of what it wrote, where does auth run, what’s exposed? Make it justify it.',
          'Explicitly require server-side authorization and parameterized queries in your prompts.',
          'Keep your CLAUDE.md / AGENTS.md security-positive (e.g. always validate input, never hardcode secrets, auth on the server).',
          'Keep secrets server-side; rotate any exposed.',
          'Re-scan your repo after each significant change.',
        ],
      },
      {
        heading: 'Confirm your Claude code holds up',
        paras: [
          'Connect your repo or upload your code, [Veilguard](/) reads the actual source and rules files, flags client-side auth, exposed secrets, and risky instructions, and gives the fix or a prompt to apply it.',
        ],
      },
    ],
    faqs: [
      {
        q: 'I’m not technical, what do I need to know about Claude-built apps?',
        a: 'Claude producing clean, confident code feels safe, but the code being well-written doesn’t mean the app is locked down. Tidy code with the database rules off, or a paywall checked in the browser, is still fully exposed. Security is about where the checks run and what’s exposed, not how neat the code looks.',
      },
      {
        q: 'What are the red flags in Claude-assisted code?',
        a: 'Authorization decided in the browser instead of on the server. Secrets in anything the client downloads. CLAUDE.md / AGENTS.md rules that deprioritize validation or security. Unparameterized (string-concatenated) database queries.',
      },
    ],
    related: [
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Supabase Row-Level Security, explained', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
    ],
    sources: [
      { label: 'Pillar Security: the Rules File Backdoor', href: 'https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
      { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
      { label: 'Note: no breach is attributed specifically to Claude-in-IDE; the risks are the sourced general agent patterns.' },
    ],
  },
  {
    slug: 'windsurf',
    tool: 'Windsurf',
    brand: 'windsurf',
    category: 'ai-coding-agents',
    eyebrow: 'WINDSURF SECURITY',
    metaTitle: 'Windsurf code security | Veilguard',
    metaDescription:
      'No app built with an AI agent is secure by default, and Windsurf is the same class of tool as Cursor and Copilot. See what to check and how. Free code scan.',
    keywords: ['Windsurf security', 'Windsurf code security', 'windsurfrules', 'is Windsurf code secure', 'AI generated code security'],
    h1: 'Is the code Windsurf wrote for you secure?',
    intro:
      'No app built with an AI agent is secure by default, and Windsurf is the same class of tool as Cursor and Copilot, which have produced documented breaches in the apps built with them. Windsurf is an agentic editor guided by .windsurfrules; the code it writes carries the same risks: insecure suggestions, client-side auth, hardcoded secrets, and risky rules files. There’s no "Windsurf app" to breach, the risk is in the code it puts in your project. Veilguard reads that code and tells you what’s exposed.',
    sections: [
      {
        heading: '"No known breach" doesn’t mean "safe"',
        paras: [
          'Every study of AI coding assistants finds the same thing, roughly a third to nearly half of AI-suggested code has security weaknesses ([Veracode](https://www.veracode.com/blog/genai-code-security-report/), [NYU](https://arxiv.org/abs/2108.09293), ACM). Windsurf draws on the same kind of training data and produces the same kinds of patterns. No headline just means none has been published, not that Windsurf-written apps are built differently.',
        ],
      },
      {
        heading: 'What tends to be wrong',
        bullets: [
          'Missing input validation, the single most common AI-code weakness; confirm every input is checked and sanitized before use in a query, command, or render.',
          'Client-side auth instead of server-side.',
          'Hardcoded secrets in code.',
          '.windsurfrules with security-weakening instructions.',
        ],
      },
      {
        heading: 'Ship safely with Windsurf',
        numbered: true,
        bullets: [
          'Validate all input and require parameterized queries in your prompts.',
          'Keep auth on the server and secrets in server env vars.',
          'Keep .windsurfrules security-positive.',
          'Review security-relevant suggestions before accepting.',
        ],
      },
      {
        heading: 'Find the holes in your Windsurf code',
        paras: [
          'Connect your repo or upload your code to [Veilguard](/) for the specific findings and fixes.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How often should you scan a Windsurf app?',
        a: 'Every time you ship a meaningful change. Each new feature the agent writes can open a new hole, and the risky moments are exactly the valuable ones, a new API route, a new database table, a new upload. Veilguard can re-scan your repo on every push and alert you when something breaks.',
      },
      {
        q: 'How do I validate input properly?',
        a: 'Confirm every input is checked and sanitized before use in a query, command, or render, and use parameterized queries instead of string concatenation. This is the single most common AI-code weakness.',
      },
    ],
    related: [
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Exposed API keys: how to find and fix', href: '/security/how-to-check-for-exposed-api-keys' },
    ],
    sources: [
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
      { label: 'Pearce et al., NYU 2022: "Asleep at the Keyboard" (~40% of Copilot completions vulnerable)', href: 'https://arxiv.org/abs/2108.09293' },
      { label: 'Pillar Security: the Rules File Backdoor', href: 'https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents' },
      { label: 'Note: no breach is attributed specifically to Windsurf; the risks are the sourced general agent patterns.' },
    ],
  },
  {
    slug: 'supabase',
    tool: 'Supabase',
    brand: 'supabase',
    category: 'backends',
    eyebrow: 'SUPABASE SECURITY',
    metaTitle: 'Supabase security: is your database private? | Veilguard',
    metaDescription:
      'Your Supabase anon key is public by design, safe only if RLS is on. See the row-level-security mistakes that expose apps and the exact policy to fix them. Free scan.',
    keywords: [
      'Supabase security',
      'Supabase RLS checker',
      'Supabase row level security',
      'is my Supabase secure',
      'Supabase anon key',
      'Supabase RLS check',
    ],
    h1: 'Is your Supabase database actually private?',
    intro:
      'Only if Row-Level Security is on for every table. Supabase turns your Postgres database into an HTTP API that your app calls with a public "anon key", a key anyone can read from your site’s network tab. That is by design, and it is safe only if RLS is protecting your tables. Without RLS (and Supabase ships new tables with it off), that public key is a master key: anyone can read, and often write or delete, your entire database. This is the exact flaw behind [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) (170+ apps) and the [Moltbook breach](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) (1.5M tokens exposed). Veilguard checks your Supabase setup and hands you the exact policy to lock it.',
    sections: [
      {
        heading: 'The anon-key myth',
        paras: [
          'Founders panic when they see the anon key in their bundle and assume it is a leak. It is not, the anon key is meant to be public. The real question is whether your data is protected behind it, and that protection is RLS. With RLS off, the anon key reads everything. With RLS on and correct policies, the same public key is harmless.',
          'So the fix is never "hide the key" (you can’t, it ships in the browser). The fix is "turn on RLS and scope it to the owner." Everything below is about getting that one thing right.',
        ],
      },
      {
        heading: 'The security holes in Supabase apps',
        bullets: [
          'RLS disabled (Critical): the table is fully open to the anon key. Anyone can query yourproject.supabase.co/rest/v1/tablename directly.',
          'Permissive policy USING (true) (Critical): RLS is "on" but the policy allows everyone, so there is no protection at all.',
          'Auth-only policies (Critical): USING (auth.uid() is not null) lets any logged-in user read everyone’s rows. The policy must match the owner: auth.uid() = user_id.',
          'service_role key exposure (Critical): the admin key bypasses ALL RLS, catastrophic if it reaches the browser.',
          'Public Storage buckets (Warning): uploaded files, invoices, and photos readable by anyone.',
          'SECURITY DEFINER views: views that run with elevated rights and quietly skip RLS.',
        ],
      },
      {
        heading: 'How to check your Supabase project',
        paras: [
          'In your dashboard: Table Editor, any table marked "RLS disabled" is exposed; Authentication → Policies, every public table needs RLS on with an ownership-scoped policy. From the outside: open your app, press F12 → Network, find the supabase.co request, and note the anon key is right there, then confirm RLS actually blocks an unauthorized read.',
          'The fastest way: paste your app’s URL into [Veilguard](/) and it actively tries to read your tables the way an attacker would, then tells you exactly which are open. Connect Supabase read-only for a full policy-by-policy audit.',
        ],
      },
      {
        heading: 'Turn on RLS: the exact policy',
        paras: [
          'For every table that holds user data, enable RLS and add a policy that scopes each user to their own rows. Run this in the Supabase SQL editor, replacing the table and column names with yours, and repeat for insert, update, and delete.',
        ],
        code: {
          label: 'Supabase SQL, run per table',
          content: `alter table orders enable row level security;

create policy "read own orders"
  on orders for select
  using ( auth.uid() = user_id );

-- repeat for insert / update / delete, scoped to the owner, on every table`,
        },
      },
      {
        heading: 'Before you launch on Supabase',
        numbered: true,
        bullets: [
          'RLS on every table, each policy scoped to the owner (auth.uid() = the user id column).',
          'No service_role key anywhere in client code, keep it server-side only.',
          'Storage buckets private unless a bucket is public by intent.',
          'No USING (true) policies left in place.',
          'Views created with security_invoker so they respect RLS. Not technical? Paste this into your builder: "Enable RLS on every Supabase table with ownership-scoped policies for select/insert/update/delete, and confirm RLS is on for all public tables."',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need row-level security if I only use the anon key?',
        a: 'Yes, especially then. The anon key is designed to be public and ship in the browser; RLS is the only thing standing between that key and your data. With RLS off, the anon key can read and write every table.',
      },
      {
        q: 'What is the most common Supabase mistake?',
        a: 'Row-level security that is off or effectively open: a table with RLS disabled, a policy that reads USING(true), or one that only checks auth.uid() is not null. All three let the wrong people read your data.',
      },
      {
        q: 'Is it a problem that my anon key is visible in the browser?',
        a: 'No, that is expected, it is an identifier, not a secret. What matters is whether RLS protects your tables behind it. The key you must never expose is the service_role key, which bypasses RLS entirely.',
      },
      {
        q: 'Will you give me the fix, not just the problem?',
        a: 'Yes. Every finding comes with the exact RLS policy to paste into the Supabase SQL editor, or a prompt you can hand to your AI tool to apply it.',
      },
    ],
    related: [
      { label: 'How do I know if my Supabase database is exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
      { label: 'Supabase row-level security, explained for non-developers', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
    ],
    sources: [
      { label: 'CVE-2025-48757: missing RLS exposed 170+ Supabase-backed apps (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757' },
      { label: 'Wiz Research: Moltbook exposed database (1.5M API keys, 35k emails)', href: 'https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys' },
      { label: 'Supabase: Row Level Security (official docs)', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
    ],
  },
  {
    slug: 'firebase',
    tool: 'Firebase',
    brand: 'firebase',
    category: 'backends',
    eyebrow: 'FIREBASE SECURITY',
    metaTitle: 'Firebase security: is your database open? | Veilguard',
    metaDescription:
      'The Firebase rule that looks safe but isn’t: if request.auth != null lets any logged-in user read everyone’s data. See what exposes Firebase apps and how to fix it.',
    keywords: [
      'Firebase security',
      'Firebase security rules',
      'Firestore security rules',
      'is my Firebase secure',
      'Firebase request.auth',
      'Firebase rules check',
    ],
    h1: 'Is your Firebase database open to the internet?',
    intro:
      'Quite possibly, and the dangerous part is the rule that looks safe. Firebase is directly accessible from the browser; your Firebase config (API key, project ID) is public by design, those are identifiers, not secrets. The only thing protecting your data is your Security Rules. The two rules that expose the most apps: allow read, write: if true (anyone in the world can read and write everything) and, more insidiously, allow read, write: if request.auth != null, which looks locked down but lets any logged-in user read and write everyone else’s data. The [Tea app](https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/) leaked 72,000 images through an open Firebase bucket. Veilguard probes your Firebase rules the way an attacker would and shows you what is exposed.',
    sections: [
      {
        heading: 'The "if request.auth != null" trap',
        paras: [
          'This rule feels safe, "you have to be logged in." But if signup is open (it usually is), an attacker just creates an account, and now they are "authenticated" and the rule lets them read and write every user’s data, not just their own.',
          'Security researchers exploit exactly this: self-signup, then read /users, then write arbitrary data. The rule has to match the owner, request.auth.uid == userId, not just "is authenticated."',
        ],
      },
      {
        heading: 'Where Firebase apps get exposed',
        bullets: [
          'allow read, write: if true (Critical): the whole database public, often pasted in from the console’s expired test mode.',
          'if request.auth != null, unscoped (Critical): any logged-in user reads and writes everyone’s data.',
          'Realtime Database root rules (Critical): permissive rules at the root cascade to everything below.',
          'Open Storage buckets (Critical): locking Firestore does NOT lock Storage, they are separate. (Tea: a public bucket, 72k images including 13k IDs.)',
          'Missing App Check (Warning): no protection against abuse or billing fraud from outside your app.',
        ],
      },
      {
        heading: 'How hackers target Firebase',
        paras: [
          'They read your Firebase config from your JS bundle (it is public), then hit the Firestore, Realtime Database, and Storage REST endpoints directly, no app UI needed. If the rules are open or auth-only, the endpoints answer. It is a few curl commands. That is the exact surface Veilguard tests.',
        ],
      },
      {
        heading: 'Firebase and compliance',
        paras: [
          'An open Firebase database leaking user PII (names, emails, photos, IDs) is not just a breach, it is a compliance failure. GDPR and similar laws require you to protect personal data; if true or unscoped rules mean you are not. The Tea breach led to class-action lawsuits. Locking your rules to per-user ownership is a baseline compliance requirement, not just good practice.',
        ],
      },
      {
        heading: 'How to check and fix your rules',
        paras: [
          'Open your firestore.rules, database.rules.json, and storage.rules. Red flags: if true, a bare if request.auth != null on user data, and if request.time < timestamp.date(...) (expired test mode). Use the Firebase Console Rules Playground to simulate requests as different users. Then scope every rule to ownership, and lock Storage separately from Firestore.',
        ],
        code: {
          label: 'firestore.rules',
          content: `match /users/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}`,
        },
      },
      {
        heading: 'Before you launch on Firebase',
        numbered: true,
        bullets: [
          'No if true anywhere in your rules.',
          'Rules scoped to request.auth.uid == ownerId, not just auth != null.',
          'Storage rules locked separately from Firestore.',
          'App Check enabled.',
          'No expired test-mode rules left in place. The fastest check: paste your app’s URL into [Veilguard](/) and it reports what an anonymous or logged-in client can actually read.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is "if request.auth != null" not enough?',
        a: 'Because signup is usually open, so anyone can become "authenticated" in seconds. That rule then lets any logged-in user read and write everyone else’s data. You have to scope the rule to the owner: request.auth.uid == userId.',
      },
      {
        q: 'Is my Firebase config safe to expose in the browser?',
        a: 'Yes, the config (API key, project ID) is an identifier, not a secret, and it is meant to be public. Your protection is your Security Rules. What is not safe is leaving those rules open or auth-only.',
      },
      {
        q: 'I locked my Firestore rules. Is my Storage safe too?',
        a: 'Not automatically. Firestore and Storage use separate rule sets, and locking one does not lock the other. The Tea breach was a public Storage bucket. Lock storage.rules to ownership as well.',
      },
      {
        q: 'Do I get the corrected rules?',
        a: 'Yes. Each finding includes the exact rule to paste into your rules file, or a prompt you can give your AI tool to apply it for you.',
      },
    ],
    related: [
      { label: 'Can someone hack an app built with AI?', href: '/security/can-someone-hack-an-app-built-with-ai' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    sources: [
      { label: 'Firebase: Security Rules and Authentication (official docs)', href: 'https://firebase.google.com/docs/rules/rules-and-auth' },
      { label: '404 Media: Tea app breach (Firebase bucket, 72k images incl. 13k IDs)', href: 'https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/' },
      { label: 'Wiz Research: Moltbook exposed database (1.5M API keys, 35k emails)', href: 'https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys' },
    ],
  },
  {
    slug: 'neon',
    tool: 'Neon',
    brand: 'neon',
    category: 'backends',
    scanKind: 'code',
    eyebrow: 'NEON SECURITY GUIDE',
    metaTitle: 'Neon (serverless Postgres) security guide | Veilguard',
    metaDescription:
      'Neon is server-side Postgres, so the biggest risk is a leaked connection string, not open browser rules. See how to secure a Neon-backed app and scan your code free.',
    keywords: [
      'Neon security',
      'Neon Postgres security',
      'Neon connection string',
      'serverless Postgres security',
      'is my Neon database secure',
    ],
    h1: 'How to keep your Neon (serverless Postgres) database secure',
    intro:
      'Neon is a serverless Postgres database, and unlike Supabase or Firebase it is not designed to be called directly from the browser, your app connects to it from the server using a connection string. That changes the risk: the number-one Neon exposure is a leaked connection string, which contains your database password. If that string ends up in your frontend bundle, a public repo, or a committed .env, someone has full database access. This is a guide to securing a Neon-backed app; Veilguard scans your app and code for exposed connection strings and the app-level access issues around your database.',
    sections: [
      {
        heading: 'Why Neon’s risk is different',
        paras: [
          'Supabase and Firebase are client-accessible, so their security lives in rules you write (RLS, Security Rules). Neon is a plain Postgres database your server talks to. There is no browser-facing anon key, and no RLS-by-default flow, so the exposure moves: it is your connection string, and whether your own code checks who is allowed to do what before each query.',
        ],
      },
      {
        heading: 'The main Neon risks',
        bullets: [
          'Exposed connection string (Critical): the full postgres://user:password@host/db string committed to a repo, shipped in a bundle, or sitting in a public .env. (28.6M secrets hit public GitHub in 2025, [GitGuardian](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/).)',
          'No app-level access control: Postgres trusts whoever holds the connection, so your app must enforce who can read or write what. If your API routes do not check the user, a leaked or guessable path exposes data.',
          'Missing least privilege: using one all-powerful database role for everything instead of scoped roles.',
        ],
      },
      {
        heading: 'How to lock down a Neon app',
        numbered: true,
        bullets: [
          'Keep the connection string server-side only, never in client code, never committed. Use server env vars, and rotate immediately if it was ever exposed.',
          'Enforce authorization in your API layer, Neon has no RLS-by-default like Supabase, so your server code must check who is allowed before every query.',
          'Use scoped database roles (least privilege) for app queries rather than the owner role.',
          'Parameterize every query, never build SQL by string concatenation.',
        ],
      },
      {
        heading: 'How Veilguard helps with Neon',
        paras: [
          'Connect your repo or upload your code to [Veilguard](/) and it flags exposed connection strings, hardcoded secrets, unparameterized SQL, and API routes missing an auth check. Note: Veilguard’s deepest database-rule analysis is tuned for Supabase and Firebase; for Neon the focus is exposed secrets and app-level access issues in your code, not live database probing.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does Veilguard scan my Neon database directly?',
        a: 'No. Neon is server-side, so there are no browser-facing rules to probe. Veilguard scans your app’s code for exposed connection strings, hardcoded secrets, and missing authorization, which is where Neon apps actually leak. Live database-rule probing is Supabase and Firebase only.',
      },
      {
        q: 'What is the single biggest Neon risk?',
        a: 'A leaked connection string. It contains your database password, so if it lands in a public repo, a client bundle, or a committed .env, someone has full access. Keep it in server-side env vars and rotate it if it was ever exposed.',
      },
      {
        q: 'Do I need something like row-level security on Neon?',
        a: 'Neon does not give you Supabase’s dashboard RLS flow, so you enforce access in your own API layer instead: check the logged-in user before every query, and use least-privilege database roles. Postgres RLS is available if you want it, but most Neon apps rely on app-level checks.',
      },
    ],
    related: [
      { label: 'Exposed API keys: how to find and fix them', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    sources: [
      { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
    ],
  },
  {
    slug: 'mongodb',
    tool: 'MongoDB',
    brand: 'mongodb',
    category: 'backends',
    scanKind: 'code',
    eyebrow: 'MONGODB SECURITY GUIDE',
    metaTitle: 'MongoDB / Atlas security guide for your app | Veilguard',
    metaDescription:
      'MongoDB’s classic risk is a database left with no auth, plus NoSQL injection and exposed connection strings. See how to secure a MongoDB app and scan your code free.',
    keywords: [
      'MongoDB security',
      'MongoDB Atlas security',
      'NoSQL injection',
      'MongoDB connection string',
      'is my MongoDB secure',
    ],
    h1: 'How to secure a MongoDB / Atlas database in your app',
    intro:
      'MongoDB’s most infamous risk is historic and still happens: databases left with no authentication and open network access, which have caused some of the largest data exposures on record. On MongoDB Atlas (the managed cloud version), the equivalent risks are an over-permissive network allowlist (0.0.0.0/0), weak database users, and exposed connection strings. On top of that, AI-generated MongoDB queries are prone to NoSQL injection when user input is passed into a query unchecked. This is a guide to securing a MongoDB-backed app; Veilguard scans your code for the app-level issues.',
    sections: [
      {
        heading: 'The main MongoDB risks',
        bullets: [
          'Open / no-auth database (Critical): a database reachable without credentials, or an Atlas cluster with network access open to the world.',
          'Exposed connection string (Critical): the mongodb+srv://user:password@... string in a bundle, repo, or committed .env.',
          'NoSQL injection (High): user input passed straight into a query object lets an attacker manipulate the query (for example a { $ne: null } trick). Validate and type-check all input.',
          'Over-permissive Atlas network rules: a 0.0.0.0/0 allowlist exposes the cluster broadly.',
        ],
      },
      {
        heading: 'How hackers target MongoDB',
        paras: [
          'Attackers scan the internet for open MongoDB instances and connect directly, no exploit needed if there is no auth. For app-level access, they probe your API with crafted input to trigger NoSQL injection. Both are automated and fast, which is why an unprotected instance is usually found within hours.',
        ],
      },
      {
        heading: 'How to lock down a MongoDB app',
        numbered: true,
        bullets: [
          'Always require authentication, never expose the database without credentials.',
          'On Atlas, restrict network access to your server’s IP, not the world (drop 0.0.0.0/0).',
          'Keep the connection string server-side only, and rotate it if it was ever exposed.',
          'Validate and type-check all input before it touches a query, never pass raw request data into a query object.',
          'Use least-privilege database users rather than one all-powerful account.',
        ],
      },
      {
        heading: 'How Veilguard helps with MongoDB',
        paras: [
          'Connect your repo or upload your code to [Veilguard](/) and it flags exposed connection strings, hardcoded secrets, and injection-prone query patterns. Note: Veilguard’s deepest live database-rule probing is tuned for Supabase and Firebase; for MongoDB the focus is exposed secrets and unsafe query patterns in your code.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does Veilguard scan my MongoDB database directly?',
        a: 'No. Veilguard scans your app’s code for exposed connection strings, hardcoded secrets, and NoSQL-injection-prone query patterns. Live database-rule probing is Supabase and Firebase only; for MongoDB the coverage is code and secrets.',
      },
      {
        q: 'What is NoSQL injection?',
        a: 'It is when user input is passed straight into a MongoDB query object, letting an attacker change what the query does, for example sending { "$ne": null } to bypass a check. The fix is to validate and type-check every input before it reaches a query, so a string stays a string.',
      },
      {
        q: 'I use MongoDB Atlas. Is it secure by default?',
        a: 'Safer than a self-hosted instance, but not automatic. The common Atlas mistakes are a network allowlist set to 0.0.0.0/0, weak or over-privileged database users, and a connection string that leaks into code. Restrict the allowlist to your server, use least-privilege users, and keep the string server-side.',
      },
    ],
    related: [
      { label: 'Exposed API keys: how to find and fix them', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    sources: [
      { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
      { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
    ],
  },
];

export const SCANNER_SLUGS = SCANNERS.map((s) => s.slug);

export function getScanner(slug: string): ScannerPage | undefined {
  return SCANNERS.find((s) => s.slug === slug);
}
