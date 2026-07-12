import type { BrandKey } from '@/components/ui/BrandIcons';

/**
 * Per-tool SEO landing pages. Each targets a distinct keyword cluster
 * ("Lovable security scanner", "Supabase RLS checker", …) with unique,
 * non-thin copy — the on-page content, checks, and FAQ all differ per tool so
 * every page earns its own ranking rather than reading as a template clone.
 */
export interface Check {
  title: string;
  body: string;
  severity: 'critical' | 'warning';
}

export interface ScannerPage {
  slug: string; // URL: /<slug>
  tool: string; // "Lovable"
  brand: BrandKey; // icon key
  eyebrow: string; // mono kicker
  /** SEO */
  metaTitle: string; // full <title>, ≤ 60 chars incl. brand
  metaDescription: string; // ~150–160 chars
  keywords: string[];
  /** Hero */
  h1: string;
  intro: string;
  /** "What we check" */
  checksHeading: string;
  checks: Check[];
  /** "Why … apps ship exposed" */
  whyHeading: string;
  why: string;
  /** Objection-handling FAQ (also emitted as FAQPage schema) */
  faqs: { q: string; a: string }[];
}

export const SCANNERS: ScannerPage[] = [
  {
    slug: 'lovable-security-scanner',
    tool: 'Lovable',
    brand: 'lovable',
    eyebrow: '// LOVABLE SECURITY SCANNER',
    metaTitle: 'Lovable Security Scanner — Check Your App Free | Veilguard',
    metaDescription:
      'Built your app with Lovable? Scan it free for exposed keys, open Supabase rules and auth holes — a plain-English A–F grade in 60 seconds, plus the exact fixes.',
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
      'Lovable ships you a working app in minutes — and it almost always wires straight into Supabase. That is exactly where the dangerous mistakes hide: row-level security left wide open, API keys shipped to the browser, and logins with no real lock on the door. Veilguard scans your live Lovable app the way an attacker would, grades it A to F, and hands you the exact fix for every issue.',
    checksHeading: 'What Veilguard checks in a Lovable app',
    checks: [
      {
        title: 'Supabase row-level security left open',
        body: 'The single most common — and most damaging — Lovable issue. If RLS is off or a policy reads USING(true), anyone can read every customer’s data. We catch it and give you the exact policy to paste.',
        severity: 'critical',
      },
      {
        title: 'API keys exposed in the browser',
        body: 'Lovable often ships Supabase, Stripe or OpenAI keys into the client bundle where anyone can copy them from your page source.',
        severity: 'critical',
      },
      {
        title: 'Logins that trust the browser',
        body: 'Auth checks done on the client, missing server-side validation, and sessions stored where any script can steal them.',
        severity: 'critical',
      },
      {
        title: 'Public storage buckets',
        body: 'Uploaded files, invoices and user photos sitting in a bucket that is readable by the whole internet.',
        severity: 'warning',
      },
      {
        title: 'Wide-open CORS',
        body: 'Your API set to allow any website to call it, so a stranger’s site can act on behalf of your users.',
        severity: 'warning',
      },
      {
        title: 'Missing HTTPS & security headers',
        body: 'No HSTS, clickjacking protection or content-type guards — the basics attackers probe for first.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Lovable apps ship exposed',
    why:
      'Lovable is built to make your app work, not to make it safe — and it never tells you what it left open. Supabase ships new tables with permissive defaults, and the CVE-2025-48757 disclosure showed how a single inverted access-control rule exposed 170 Lovable-built apps at once. The founder has no idea anything is wrong until someone else finds it. Veilguard is the check nobody built into the tool.',
    faqs: [
      {
        q: 'Does Veilguard work with Lovable and Supabase?',
        a: 'Yes — that combination is our specialty. Broken Supabase row-level security is the number-one critical issue we find in Lovable apps, and we give you the exact SQL policy to fix it.',
      },
      {
        q: 'Do I have to connect my Lovable project?',
        a: 'No. The free scan only looks at your live app from the outside — what an attacker already sees. For a deeper audit you can optionally connect Supabase or GitHub with read-only access, and your source is never stored.',
      },
      {
        q: 'I’m not technical — can I actually fix what it finds?',
        a: 'Yes. Every fix is either copy-paste code and SQL, or a ready-made prompt you hand straight to Lovable to apply for you. You don’t need to read the code.',
      },
    ],
  },
  {
    slug: 'bolt-security-scanner',
    tool: 'Bolt',
    brand: 'bolt',
    eyebrow: '// BOLT.NEW SECURITY SCANNER',
    metaTitle: 'Bolt.new Security Scanner — Check Your App | Veilguard',
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
      'Bolt.new turns a prompt into a full-stack app in one sitting — frontend, backend and database wired together for you. The speed is the point, but nobody stops to check what got left open: environment secrets bundled into the client, a database anyone can query, and payment flows with no verification. Veilguard scans your live Bolt app from the outside, grades it A to F, and shows you the exact fix for each hole.',
    checksHeading: 'What Veilguard checks in a Bolt.new app',
    checks: [
      {
        title: 'Secrets leaked through VITE_ / public env vars',
        body: 'Bolt frequently exposes API keys by prefixing them so they get bundled into the browser. We flag every secret an attacker can read from your page.',
        severity: 'critical',
      },
      {
        title: 'Database rules left wide open',
        body: 'Supabase RLS or Firebase rules that let any visitor read or write your tables — the fastest path to a full data leak.',
        severity: 'critical',
      },
      {
        title: 'Payment webhooks with no signature check',
        body: 'Stripe or Paystack webhooks that accept any request, so anyone can fake a “payment succeeded” event.',
        severity: 'critical',
      },
      {
        title: 'Auth and rate-limiting gaps',
        body: 'Login and signup endpoints with no throttling, and access checks that run only in the browser.',
        severity: 'warning',
      },
      {
        title: 'Overly permissive CORS',
        body: 'APIs that answer requests from any origin, letting other sites ride on your users’ sessions.',
        severity: 'warning',
      },
      {
        title: 'Missing security headers',
        body: 'No HSTS, X-Frame-Options or content-type protection on your deployed URL.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Bolt.new apps ship exposed',
    why:
      'Bolt optimizes for a working prototype in minutes, so it makes the pragmatic choices that get an app running — permissive defaults, secrets wherever they are convenient, and no verification on money flows. Those choices are fine for a demo and dangerous the moment real customers and real payments show up. Veilguard catches them before your launch does.',
    faqs: [
      {
        q: 'Can Veilguard scan a Bolt.new app?',
        a: 'Yes. Paste your deployed Bolt URL and we scan it from the outside — no install, no signup. If your app uses Supabase or Firebase, we run a deeper database-rules audit too.',
      },
      {
        q: 'What’s the most common problem in Bolt apps?',
        a: 'Exposed secrets and open database rules. Bolt often bundles keys into the browser and leaves Supabase/Firebase permissions permissive, which together are exactly how vibe-coded apps get breached.',
      },
      {
        q: 'How do I fix the issues you find?',
        a: 'Each finding comes with the exact code fix or a copy-paste prompt you can hand back to Bolt to apply. No security background needed.',
      },
    ],
  },
  {
    slug: 'replit-security-scanner',
    tool: 'Replit',
    brand: 'replit',
    eyebrow: '// REPLIT SECURITY SCANNER',
    metaTitle: 'Replit Security Scanner — Check Your App Free | Veilguard',
    metaDescription:
      'Built and deployed with Replit Agent? Scan your app free for exposed secrets, open database rules and auth holes — an A–F security grade in 60 seconds, plus fixes.',
    keywords: [
      'Replit security',
      'Replit Agent security',
      'is my Replit app secure',
      'Replit security scanner',
      'Replit deployment security',
    ],
    h1: 'Is your Replit app safe for real users?',
    intro:
      'Replit Agent writes your app and deploys it in the same breath, so the gap between “idea” and “live on the internet” is minutes. That is powerful — and it means security review never happens. Secrets end up readable, the database is left open, and the app is public before anyone checks it. Veilguard scans your live Replit deployment, grades it A to F, and gives you the exact fix for every issue it finds.',
    checksHeading: 'What Veilguard checks in a Replit app',
    checks: [
      {
        title: 'Exposed secrets and API keys',
        body: 'Keys that made it into your client bundle or committed files, where anyone can lift them. We check the deployed app and your git history.',
        severity: 'critical',
      },
      {
        title: 'Open database access',
        body: 'Replit DB, Supabase or Postgres left readable or writable by any visitor — the top cause of vibe-coded data leaks.',
        severity: 'critical',
      },
      {
        title: 'Authentication holes',
        body: 'Access checks that only run in the browser, missing rate limits on login, and weak password handling.',
        severity: 'critical',
      },
      {
        title: 'Injection risks',
        body: 'User input passed straight into database queries or shell commands — classic SQL injection the Agent doesn’t guard against.',
        severity: 'warning',
      },
      {
        title: 'Wide-open CORS',
        body: 'An API that any website can call, opening the door to cross-site abuse of your users’ sessions.',
        severity: 'warning',
      },
      {
        title: 'Missing HTTPS & security headers',
        body: 'The baseline protections attackers probe for first, often absent on fresh deployments.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Replit apps ship exposed',
    why:
      'When building and deploying are a single action, there is no natural moment to ask “is this safe to be public?” Replit Agent makes reasonable functional choices, but it does not harden your app or warn you about what it left open. Veilguard adds the missing checkpoint — after you ship, before anyone gets hurt.',
    faqs: [
      {
        q: 'Does Veilguard work with Replit deployments?',
        a: 'Yes. Paste your live Replit URL and we scan it from the outside in about 60 seconds. Connect GitHub or your database read-only for a deeper audit that includes secrets in your git history.',
      },
      {
        q: 'Will it catch secrets committed to my Repl?',
        a: 'With a read-only GitHub connection, yes — we scan your git history for keys and tokens that were committed and are still exposed, then tell you exactly which to rotate.',
      },
      {
        q: 'Do I need to understand the fixes?',
        a: 'No. Every issue comes with copy-paste code or a ready-made prompt you can give back to Replit Agent to apply for you.',
      },
    ],
  },
  {
    slug: 'v0-security-scanner',
    tool: 'v0',
    brand: 'v0',
    eyebrow: '// V0 SECURITY SCANNER',
    metaTitle: 'v0 Security Scanner — Check Your App Free | Veilguard',
    metaDescription:
      'Built your app with v0 by Vercel? Scan it free for exposed keys, open database rules and auth gaps. Get a plain-English A–F grade in 60 seconds, plus the exact fixes.',
    keywords: [
      'v0 security',
      'v0 by Vercel security',
      'is my v0 app secure',
      'v0 security scanner',
      'v0 Supabase security',
    ],
    h1: 'Is your v0 app safe to charge people money?',
    intro:
      'v0 turns a prompt into a polished Next.js app, and it is easy to wire in Supabase or Neon and push it live on Vercel the same day. The UI looks production-ready — but looking finished and being safe are not the same thing. Server actions, environment variables and database rules are where the real risk sits. Veilguard scans your live v0 app, grades it A to F, and hands you the exact fix for every issue.',
    checksHeading: 'What Veilguard checks in a v0 app',
    checks: [
      {
        title: 'Exposed environment variables',
        body: 'Keys marked NEXT_PUBLIC_ or otherwise shipped to the browser, where they are one right-click away from anyone.',
        severity: 'critical',
      },
      {
        title: 'Open database rules',
        body: 'Supabase RLS or your Postgres policies left permissive, so any visitor can read or change data that isn’t theirs.',
        severity: 'critical',
      },
      {
        title: 'Unprotected server actions & routes',
        body: 'Next.js server actions and API routes that skip authorization, letting the wrong user trigger privileged operations.',
        severity: 'critical',
      },
      {
        title: 'Payment webhook verification',
        body: 'Stripe webhooks that accept unsigned requests, so a forged event can mark orders as paid.',
        severity: 'warning',
      },
      {
        title: 'Overly open CORS',
        body: 'APIs that respond to any origin, exposing your users to cross-site requests.',
        severity: 'warning',
      },
      {
        title: 'Missing security headers',
        body: 'HSTS, framing and content-type protections absent on your deployment.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why v0 apps ship exposed',
    why:
      'v0 is exceptional at generating interfaces, and that polish is exactly what hides the risk: an app that looks done reads as safe. But the security-critical parts — who is allowed to do what, and which secrets reach the browser — are decisions v0 makes for convenience, not safety. Veilguard reviews those decisions for you before your customers do.',
    faqs: [
      {
        q: 'Can Veilguard scan a v0 (Vercel) app?',
        a: 'Yes. Paste your deployed URL and we scan it from the outside in about a minute. If it uses Supabase, we run a deeper row-level-security audit as well.',
      },
      {
        q: 'Does it check Next.js server actions and API routes?',
        a: 'With a read-only GitHub connection we check for authorization gaps in server actions and routes — a common way v0 apps let the wrong user do privileged things.',
      },
      {
        q: 'How are the fixes delivered?',
        a: 'As copy-paste code or a ready-made prompt you can hand back to v0. You don’t need to understand the code to apply them.',
      },
    ],
  },
  {
    slug: 'cursor-security-scanner',
    tool: 'Cursor',
    brand: 'cursor',
    eyebrow: '// CURSOR SECURITY SCANNER',
    metaTitle: 'Cursor Security Scanner — Check Your App Free | Veilguard',
    metaDescription:
      'Building with Cursor’s AI? Scan your app free for exposed secrets, injection, open database rules and auth holes — a plain-English A–F grade in 60 seconds, plus fixes.',
    keywords: [
      'Cursor security',
      'Cursor AI security',
      'is my Cursor app secure',
      'Cursor security scanner',
      'AI generated code security',
    ],
    h1: 'Is the app you built with Cursor actually secure?',
    intro:
      'Cursor makes you fast — it writes whole features on request and accepts them with a keystroke. But AI-written code carries AI-written mistakes, and nearly half of it ships with a security vulnerability. Injection, exposed secrets and open database rules slip in between commits without anyone noticing. Veilguard scans the live app you built with Cursor, grades it A to F, and shows you the exact fix for each problem.',
    checksHeading: 'What Veilguard checks in a Cursor-built app',
    checks: [
      {
        title: 'Secrets in code and git history',
        body: 'API keys the assistant hardcoded or committed, still sitting in your bundle or repository history where they can be lifted.',
        severity: 'critical',
      },
      {
        title: 'Injection vulnerabilities',
        body: 'User input passed unsanitized into SQL, shell commands or queries — the injection bugs AI code introduces most often.',
        severity: 'critical',
      },
      {
        title: 'Open database rules',
        body: 'Supabase RLS or Firebase rules left permissive, letting any visitor read data that isn’t theirs.',
        severity: 'critical',
      },
      {
        title: 'Broken access control',
        body: 'Endpoints that forget to check who is calling, so one user can act as another (IDOR).',
        severity: 'warning',
      },
      {
        title: 'Vulnerable dependencies',
        body: 'Known-vulnerable or typosquatted packages the assistant pulled in without flagging the risk.',
        severity: 'warning',
      },
      {
        title: 'Missing HTTPS & security headers',
        body: 'The baseline protections that should be on every deployed app but frequently aren’t.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Cursor-built apps ship exposed',
    why:
      'Cursor is brilliant at producing code that works, and reviewing every line it writes defeats the point of moving fast. So security issues accumulate quietly across dozens of accepted suggestions. You don’t need to read all that code — Veilguard reads the result for you and tells you, in plain English, what to fix.',
    faqs: [
      {
        q: 'Does Veilguard scan apps built with Cursor?',
        a: 'Yes. Paste your live app’s URL for an external scan, or connect GitHub read-only so we can also check for secrets in your history, injection risks and vulnerable dependencies.',
      },
      {
        q: 'Isn’t AI-generated code already safe?',
        a: 'Independent research finds that close to half of AI-generated code contains a security vulnerability. Cursor optimizes for working code, not hardened code — the gap is exactly what Veilguard checks.',
      },
      {
        q: 'How do I apply the fixes?',
        a: 'Each finding includes copy-paste code or a ready-made prompt you can drop straight into Cursor to apply the fix for you.',
      },
    ],
  },
  {
    slug: 'supabase-security-checker',
    tool: 'Supabase',
    brand: 'supabase',
    eyebrow: '// SUPABASE SECURITY CHECKER',
    metaTitle: 'Supabase Security Checker — RLS & Rules | Veilguard',
    metaDescription:
      'Check your Supabase project free for open row-level security, exposed keys and public buckets. Get a plain-English A–F grade in 60 seconds, plus the exact RLS fixes.',
    keywords: [
      'Supabase security',
      'Supabase RLS checker',
      'Supabase row level security',
      'Supabase security scanner',
      'is my Supabase secure',
      'Supabase RLS check',
    ],
    h1: 'Is your Supabase database actually locked down?',
    intro:
      'Supabase gives your app a real Postgres database in seconds — and leaves it to you to decide who can read and write it. That decision is row-level security, and it is the single most common place vibe-coded apps get breached. A table with RLS off, or a policy that reads USING(true), means anyone on the internet can read every row. Veilguard checks your live Supabase-backed app, grades it A to F, and hands you the exact policy to paste.',
    checksHeading: 'What Veilguard checks in your Supabase project',
    checks: [
      {
        title: 'RLS disabled on a table',
        body: 'Any table with row-level security turned off is fully readable and writable by anyone with your public anon key. We find every one.',
        severity: 'critical',
      },
      {
        title: 'Policies that read USING(true)',
        body: 'A policy that always evaluates true is the same as no policy at all — it just looks protected. This is the exact pattern behind real Supabase breaches.',
        severity: 'critical',
      },
      {
        title: 'auth.uid() IS NOT NULL bypass',
        body: 'Policies that only check a user is logged in — not that the row belongs to them — let any signed-in user read everyone’s data.',
        severity: 'critical',
      },
      {
        title: 'Exposed service-role key',
        body: 'The service key bypasses RLS entirely. If it reaches the browser, your database has no protection at all.',
        severity: 'critical',
      },
      {
        title: 'Public storage buckets',
        body: 'Storage buckets set public, exposing uploaded files, invoices and user photos to the whole internet.',
        severity: 'warning',
      },
      {
        title: 'Missing policies on new tables',
        body: 'Tables created without any policy, so access falls back to insecure defaults nobody reviewed.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Supabase projects end up exposed',
    why:
      'Supabase is secure by design — but only if you write the right policies, and AI builders like Lovable and Bolt frequently don’t. The database ships permissive so you can move fast, and the danger is invisible: the app works perfectly whether or not RLS is correct. The Moltbook breach leaked 1.5 million API keys from exactly this mistake. Veilguard tells you which tables are open and gives you the SQL to close them.',
    faqs: [
      {
        q: 'How does Veilguard check my Supabase RLS?',
        a: 'From your live app we probe what the public anon key can actually reach. Connect Supabase read-only for a full policy-by-policy audit that lists every open table and the exact SQL to lock it down.',
      },
      {
        q: 'What is the most common Supabase mistake?',
        a: 'Row-level security that is off or effectively open — a table with RLS disabled, or a policy that reads USING(true) or only checks auth.uid() IS NOT NULL. All three let the wrong people read your data.',
      },
      {
        q: 'Will you give me the fix, not just the problem?',
        a: 'Yes. Every finding comes with the exact RLS policy to paste into the Supabase SQL editor, or a prompt you can hand to your AI tool to apply it.',
      },
    ],
  },
  {
    slug: 'firebase-security-checker',
    tool: 'Firebase',
    brand: 'firebase',
    eyebrow: '// FIREBASE SECURITY CHECKER',
    metaTitle: 'Firebase Security Rules Checker — Free Scan | Veilguard',
    metaDescription:
      'Check your Firebase security rules free for open read/write access, weak auth and exposed config. Get a plain-English A–F grade in 60 seconds, plus the exact fixes.',
    keywords: [
      'Firebase security',
      'Firebase security rules checker',
      'Firestore security rules',
      'Firebase security scanner',
      'is my Firebase secure',
      'Firebase rules check',
    ],
    h1: 'Are your Firebase security rules leaving the door open?',
    intro:
      'Firebase makes it trivial to store and sync data straight from the browser — which means your security rules are the only thing standing between a stranger and your entire database. AI builders love to start with allow read, write: if true just to get things working, and that line quietly ships to production. Veilguard checks your live Firebase-backed app, grades it A to F, and gives you the exact rules to lock it down.',
    checksHeading: 'What Veilguard checks in your Firebase project',
    checks: [
      {
        title: 'allow read, write: if true',
        body: 'The rule that makes your entire database public. It’s the default starting point and the number-one Firebase mistake — we flag it immediately.',
        severity: 'critical',
      },
      {
        title: 'Auth-only rules without ownership checks',
        body: 'Rules that only require a user to be signed in — not that the document is theirs — let any logged-in user read and edit everyone’s data.',
        severity: 'critical',
      },
      {
        title: 'Client-controlled userId',
        body: 'Rules that trust an ID sent from the browser, which an attacker can simply change to impersonate another user.',
        severity: 'critical',
      },
      {
        title: 'Exposed Firebase config & keys',
        body: 'Sensitive keys shipped in the client beyond the expected public config, giving attackers more than they should have.',
        severity: 'warning',
      },
      {
        title: 'Open Cloud Storage rules',
        body: 'Storage rules that let anyone read or upload files, exposing user content and inviting abuse.',
        severity: 'warning',
      },
      {
        title: 'Missing HTTPS & security headers',
        body: 'Baseline protections absent on your hosting, which attackers check for first.',
        severity: 'warning',
      },
    ],
    whyHeading: 'Why Firebase projects end up exposed',
    why:
      'Because Firebase talks directly to the browser, a weak rule isn’t a small mistake — it’s a fully open database on the public internet. The permissive starter rules are meant to be temporary, but when an AI builds your app there’s no one to remember to tighten them. Veilguard reads your rules the way an attacker would and tells you, in plain English, exactly what to change.',
    faqs: [
      {
        q: 'Can Veilguard check my Firebase security rules?',
        a: 'Yes. We probe your live app for what an unauthenticated visitor can reach, and with a read-only connection we review your Firestore and Storage rules line by line.',
      },
      {
        q: 'What’s the worst Firebase rule to leave in?',
        a: 'allow read, write: if true — it makes your whole database public. Auth-only rules without an ownership check are a close second, since any signed-in user can then reach everyone’s data.',
      },
      {
        q: 'Do I get the corrected rules?',
        a: 'Yes. Each finding includes the exact rule to paste into your firebase.rules file, or a prompt you can give your AI tool to apply it for you.',
      },
    ],
  },
];

export const SCANNER_SLUGS = SCANNERS.map((s) => s.slug);

export function getScanner(slug: string): ScannerPage | undefined {
  return SCANNERS.find((s) => s.slug === slug);
}
