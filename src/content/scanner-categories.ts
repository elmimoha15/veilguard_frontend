import { SCANNER_SLUGS } from '@/content/scanners';

/**
 * Category landing pages for /scanners. Three groups, each with a genuinely
 * distinct security story (AI coding agents / vibecoding tools / backends).
 * Copy is the verbatim content package; only em-dashes were normalised to the
 * house style (commas / "A to F"), no fact, stat, CVE, or source changed.
 * Rendered via <CategoryLanding>. Emits Article + BreadcrumbList JSON-LD.
 */
export interface CategoryHole {
  title: string; // keeps the "(Critical)" / "(Warning)" label inline, verbatim
  body: string;
}

export interface CategoryHoleGroup {
  heading?: string; // e.g. "Supabase, the holes" (backends only)
  items: CategoryHole[];
  toolLink?: { label: string; slug: string }; // "Full guide" → /scanners/<slug>
}

export interface CategoryTool {
  name: string;
  slug: string; // → /scanners/<slug> when it exists
  note?: string;
}

export interface CategoryBlock {
  heading: string;
  paras?: string[];
  bullets?: string[];
}

export interface ScannerCategory {
  slug: string;
  name: string; // display name, e.g. "AI coding agents"
  label: string; // eyebrow, e.g. "VIBECODING TOOLS"
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  directAnswer: string;
  /** Narrative prose blocks shown between the short answer and the holes list. */
  sections?: CategoryBlock[];
  why?: { heading: string; paras: string[] };
  holes: { heading: string; groups: CategoryHoleGroup[] };
  toolsHeading?: string;
  tools?: CategoryTool[];
  check: CategoryBlock;
  fix?: CategoryBlock;
  ctaHeading: string;
  sources: { label: string; href?: string }[];
}

/** Canonical source URLs, reused from elsewhere in the repo where they exist. */
const SRC = {
  cve: { label: 'CVE-2025-48757 (NIST NVD)', href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757' },
  veracode: { label: 'Veracode 2025 GenAI Code Security Report (45% of AI code fails security tests)', href: 'https://www.veracode.com/blog/genai-code-security-report/' },
  wiz: { label: 'Wiz Research: Moltbook exposed database (1.5M API keys, 35k emails)', href: 'https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys' },
  revolter: { label: 'Revolter Tech: the vibe-coding trap (Enrichlead)', href: 'https://www.revolter.se/en/blog/vibe-coding-trap-easy-and-risky' },
  register: { label: 'The Register: Replit AI deleted a production database', href: 'https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/' },
  gitguardian: { label: 'GitGuardian: The State of Secrets Sprawl 2026 (28.6M secrets on public GitHub in 2025)', href: 'https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/' },
  media404: { label: '404 Media: Tea app breach (Firebase bucket, 72k images)', href: 'https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/' },
  nyu: { label: 'Pearce et al., NYU 2022: "Asleep at the Keyboard" (~40% of Copilot completions vulnerable)', href: 'https://arxiv.org/abs/2108.09293' },
  stanford: { label: 'Perry et al., Stanford 2023: developers with AI wrote less secure code, more confidently', href: 'https://arxiv.org/abs/2211.03622' },
  fu: { label: 'Fu et al., 2025: Security Weaknesses of Copilot-Generated Code (43 CWEs)', href: 'https://arxiv.org/abs/2310.02059' },
  pillar: { label: 'Pillar Security: the Rules File Backdoor', href: 'https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents' },
} as const;

export const SCANNER_CATEGORIES: ScannerCategory[] = [
  {
    slug: 'vibecoding-tools',
    name: 'Vibecoding tools',
    label: 'VIBECODING TOOLS',
    metaTitle: 'Vibecoding app security scanner | Veilguard',
    metaDescription:
      'Lovable, Bolt, Replit and v0 build the whole app in one prompt, and routinely leave the database open and keys in the browser. Scan your live app free and get the exact fix.',
    keywords: ['vibecoding security', 'lovable security scanner', 'bolt security', 'replit security', 'v0 security', 'is my vibe-coded app secure'],
    h1: 'Your vibe-coded app works. Is it actually safe to charge money?',
    directAnswer:
      'Often not yet, because the tools that build your whole app in one prompt optimize for "does it work," not "is it safe." Lovable, Bolt, Replit, and v0 generate a full application and wire up a backend (usually Supabase), but they routinely leave the database unlocked, ship secret keys to the browser, and put security checks in the wrong place. This is not rare: [Veracode’s 2025 study](https://www.veracode.com/blog/genai-code-security-report/) found AI writes insecure code about 45% of the time, and [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) catalogs 170+ live Lovable apps whose databases anyone could read. The result works perfectly in your browser and is wide open to a stranger. Veilguard scans your live app the way an attacker would, grades it A to F, and hands you the exact fix.',
    why: {
      heading: 'Why prompt-to-app tools ship exposed',
      paras: [
        'These tools share one dangerous pattern: they build the visible app and the invisible backend at the same time, and only the visible part gets your attention. You see a working signup, a working dashboard, a working checkout. What you can’t see is whether the database behind it is locked. The AI’s job is to make the feature work in testing, and the fastest way to do that is to leave access controls open. It works, you ship, and the door stays unlocked. You never notice, because you are logged in. A stranger with your public key sees everything.',
        'The proof this is a pattern, not bad luck: in [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757), researcher Matt Palmer scanned 1,645 live Lovable apps and found 170 (10.3%) with databases anyone could read, across 303 endpoints. And [Moltbook](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys), an AI-built app, leaked 1.5M auth tokens and 35,000 emails the same way. Different apps, identical mistake.',
      ],
    },
    holes: {
      heading: 'What tends to go wrong in a vibe-coded app',
      groups: [
        {
          items: [
            { title: 'Open database (Critical)', body: 'Supabase Row-Level Security left off or set to allow-everyone, so the public anon key reads and writes every table. The [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) pattern.' },
            { title: 'Secret keys in the browser (Critical)', body: 'the tool drops a Supabase service_role, Stripe, or OpenAI key into the frontend to fix an error. Anyone who opens the page can copy it.' },
            { title: 'Paywall or auth in the browser (Critical)', body: 'access checks run on the visitor’s screen, so the visitor controls them.' },
            { title: 'Public storage buckets (Warning)', body: 'uploaded IDs, invoices, and photos left crawlable.' },
            { title: 'AI acting on production (Critical)', body: 'some tools’ agents can act on your live database. In one documented case Replit’s Agent wiped a production database and generated fake records to cover it ([The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/)).' },
          ],
        },
      ],
    },
    toolsHeading: 'Pick your tool',
    tools: [
      { name: 'Lovable', slug: 'lovable', note: 'wires Supabase by default; RLS frequently off or too broad; anon key + open tables (CVE-2025-48757).' },
      { name: 'Bolt', slug: 'bolt', note: 'generates full-stack apps fast; secrets in generated code; public Supabase tables.' },
      { name: 'Replit', slug: 'replit', note: 'the Agent can act on production; the SaaStr database wipe.' },
      { name: 'v0', slug: 'v0', note: 'Next.js output; secrets in NEXT_PUBLIC_ vars; exposed source maps; Vercel env leaks.' },
    ],
    check: {
      heading: 'How to check your app',
      paras: [
        'Because these are live apps, you can test them from the outside. Open your app, press F12, open the Network tab, refresh, and find requests to your backend (e.g. supabase.co). Your public key will be visible, that is normal. The real test is whether your data is protected behind it: in your Supabase dashboard, any table marked "RLS disabled" is exposed.',
        'The faster way: paste your app’s URL into [Veilguard](/) and it probes your deployed app the way an attacker would, no code access needed. For the deepest read, connect your repo. Either way you get an A to F grade and the exact fix for each issue.',
      ],
    },
    ctaHeading: 'Scan your app free',
    sources: [SRC.cve, SRC.veracode, SRC.wiz],
  },

  {
    slug: 'ai-coding-agents',
    name: 'AI coding agents',
    label: 'AI CODING AGENTS',
    metaTitle: 'AI coding agent security: is the code secure? | Veilguard',
    metaDescription:
      'Cursor, Windsurf, Claude and Copilot help you write code, but studies find 40 to 45% of it ships insecure. Scan the code you built with them free and get the exact fix.',
    keywords: ['ai coding agent security', 'is ai generated code secure', 'cursor security', 'copilot code security', 'cursorrules security'],
    h1: 'The code your AI assistant writes isn’t automatically secure',
    directAnswer:
      'AI coding agents help you write code fast, but the code they produce ships insecure more often than not, and it’s the app you build and deploy that carries the risk. These tools don’t have apps or databases of their own, so there’s nothing to "breach" in the tool itself. The problem is what ends up in your codebase: [Veracode’s 2025 study](https://www.veracode.com/blog/genai-code-security-report/) found AI writes insecure code about 45% of the time, and [a Stanford study](https://arxiv.org/abs/2211.03622) found developers using AI assistants wrote more vulnerabilities while feeling more confident their code was safe. Veilguard reads the actual code you built with these tools and shows you, in plain English, what’s insecure and how to fix it.',
    sections: [
      {
        heading: 'What these tools actually are (and aren’t)',
        paras: [
          'Cursor, Windsurf, Claude, and Copilot are assistants that write and edit code inside your editor. You describe what you want; they generate code; you accept it. That’s the whole relationship. They don’t run your app, host your database, or hold your users’ data, so a "Cursor breach" or "Copilot breach" isn’t a thing. What is a thing: the code they suggest becomes part of your app, and if that code is insecure, your deployed app is insecure. The vulnerability is yours, in your repo, on your stack.',
        ],
      },
      {
        heading: 'Why AI-written code is so often insecure',
        paras: [
          'These models learn from enormous amounts of public code, which contains insecure patterns right alongside secure ones, so they reproduce both, confidently. When the fastest way to make a feature "work" is the insecure way (put the auth check in the browser, hardcode the key, skip input validation), that’s frequently what they suggest, and a non-expert accepts it because it works. Studies back this up: [NYU](https://arxiv.org/abs/2108.09293) found 40% of Copilot’s suggestions were vulnerable; [a 2025 study of real GitHub projects](https://arxiv.org/abs/2310.02059) found ~30% of Copilot snippets had weaknesses across 43 different vulnerability types.',
          'There’s also a risk unique to these tools: rules/instruction files (.cursorrules, CLAUDE.md, AGENTS.md, Copilot instructions). These shape how the agent writes code across your entire project. [Pillar Security](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents) showed in 2025 that a poisoned rules file (the "Rules File Backdoor") can steer an agent into writing insecure code everywhere, and both GitHub and Cursor said reviewing the output is your responsibility.',
        ],
      },
    ],
    holes: {
      heading: 'What tends to be wrong in AI-assisted code',
      groups: [
        {
          items: [
            { title: 'Authorization in the browser', body: 'access checks the visitor can flip. (Enrichlead, a SaaS built with Cursor, was breached this way: the paywall was bypassed and its exposed API keys abused. Source: [Revolter Tech](https://www.revolter.se/en/blog/vibe-coding-trap-easy-and-risky).)' },
            { title: 'Hardcoded / committed secrets', body: 'keys embedded to fix an error, then shipped or committed. (28.6M secrets hit public GitHub in 2025, [GitGuardian](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/).)' },
            { title: 'Missing input validation & injection', body: 'request data used directly in queries and commands.' },
            { title: 'Weak error handling', body: 'raw errors and stack traces leaked to users.' },
            { title: 'Risky rules files', body: 'insecure directives that affect every file the agent writes.' },
          ],
        },
      ],
    },
    toolsHeading: 'Pick your tool for guidance tuned to it',
    tools: [
      { name: 'Cursor', slug: 'cursor' },
      { name: 'Windsurf', slug: 'windsurf' },
      { name: 'Claude', slug: 'claude' },
      { name: 'Copilot', slug: 'copilot' },
    ],
    check: {
      heading: 'How to check the code you built',
      paras: [
        'These issues live in your source code, not on a URL, so connect your GitHub repo or upload your project to [Veilguard](/), and it reads the actual files, flags the insecure patterns, and gives you the exact fix (code, or a prompt to paste back into your agent).',
      ],
    },
    ctaHeading: 'Scan your code free',
    sources: [SRC.veracode, SRC.stanford, SRC.nyu, SRC.fu, SRC.pillar, SRC.revolter, SRC.gitguardian],
  },

  {
    slug: 'backends',
    name: 'Backends',
    label: 'BACKENDS',
    metaTitle: 'Supabase & Firebase security scanner | Veilguard',
    metaDescription:
      'Supabase ships tables with RLS off and Firebase starts with open rules. Under the shared-responsibility model, locking your data is your job. Scan your backend free.',
    keywords: ['supabase security scanner', 'firebase security', 'supabase rls checker', 'firebase rules checker', 'is my backend secure'],
    h1: 'Is your Supabase or Firebase backend actually locked down?',
    directAnswer:
      'Only if you locked it yourself. Supabase and Firebase give you secure infrastructure, but they run on a shared-responsibility model: the platform protects itself, and your data-access rules are your job, and they do not turn on automatically. Supabase ships new tables with Row-Level Security off. Firebase projects often start in "test mode" that silently expires, so developers paste allow read, write: if true to fix it and ship it. This is the exact layer where the worst breaches happen: [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) exposed 170+ Supabase-backed apps, and the [Tea app](https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/) leaked 72,000 images (including 13,000 IDs) through a public Firebase bucket. Veilguard checks whether your backend is actually protected and shows you the exact rule to add.',
    why: {
      heading: 'The shared-responsibility trap',
      paras: [
        'Both platforms are secure by design, but "secure infrastructure" is not "secure app." Unlike a database sitting behind your server, Supabase and Firebase are directly accessible from the browser. Your app’s public config (the Supabase anon key, the Firebase config object) is visible to anyone, and that is intended, those are identifiers, not secrets.',
        'The only thing standing between your data and the public internet is your rules: Supabase RLS policies and Firebase Security Rules. Founders assume the platform handles it. It doesn’t, and it never warns you. That gap is exactly what [CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757) (Supabase RLS off) and the [Tea breach](https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/) (Firebase public bucket) exploited.',
      ],
    },
    holes: {
      heading: 'Where each backend leaks',
      groups: [
        {
          heading: 'Supabase',
          toolLink: { label: 'Full Supabase guide', slug: 'supabase' },
          items: [
            { title: 'RLS not enabled (Critical)', body: 'new tables are open by default; the public anon key reads everything. The anon key is meant to be public; RLS is what makes that safe. Without it, it is a master key. ([CVE-2025-48757](https://nvd.nist.gov/vuln/detail/CVE-2025-48757): about 10% of scanned Supabase-backed apps leaked this way.)' },
            { title: 'Permissive policies (Critical)', body: 'USING (true), or auth-only policies that let any logged-in user read everyone else’s rows.' },
            { title: 'service_role key exposure (Critical)', body: 'the admin key bypasses all RLS; catastrophic if it reaches the browser. ([Moltbook](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) leaked 1.5M tokens this way.)' },
            { title: 'Public Storage buckets (Warning)', body: 'uploaded files readable by anyone.' },
            { title: 'SECURITY DEFINER views', body: 'views that run with elevated rights and skip RLS.' },
          ],
        },
        {
          heading: 'Firebase',
          toolLink: { label: 'Full Firebase guide', slug: 'firebase' },
          items: [
            { title: 'Open rules (Critical)', body: 'allow read, write: if true leaves the whole database public, often pasted in from the console’s expired test mode. (The [Tea app](https://www.404media.co/women-dating-safety-app-tea-breached-users-ids-posted-to-4chan/) exposed 72,000 images including 13,000 IDs and 1.1M messages.)' },
            { title: 'Auth’d-but-unscoped (Critical)', body: 'allow read, write: if request.auth != null looks safe but lets any logged-in user read everyone’s data, the most common real Firebase mistake.' },
            { title: 'Open Storage buckets (Critical)', body: 'locking Firestore does not lock Storage; they are separate rule sets.' },
            { title: 'Missing App Check (Warning)', body: 'no protection against abuse or billing fraud from outside your app.' },
          ],
        },
      ],
    },
    check: {
      heading: 'How to check',
      paras: [
        'Because these backends are client-accessible, paste your live app’s URL into [Veilguard](/) and it probes what an anonymous or logged-in visitor can actually read, the same thing an attacker would do. Connect your repo for the deepest read of your actual rules files.',
        'Live rule-probing is tuned for Supabase and Firebase. If your app uses Neon or MongoDB instead, see those guides, Veilguard scans your code for exposed connection strings and app-level access gaps, and the guide walks you through locking the database down yourself.',
      ],
    },
    ctaHeading: 'Scan your backend free',
    sources: [SRC.cve, SRC.media404, SRC.wiz],
  },
];

export const CATEGORY_SLUGS = SCANNER_CATEGORIES.map((c) => c.slug);

export function getCategory(slug: string): ScannerCategory | undefined {
  return SCANNER_CATEGORIES.find((c) => c.slug === slug);
}

/** True when a tool has its own /scanners/<slug> landing page (so we can link it). */
export function toolHasPage(slug: string): boolean {
  return SCANNER_SLUGS.includes(slug);
}
