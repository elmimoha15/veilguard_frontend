/**
 * All landing-page copy lives here so sections stay presentational.
 * Copy follows the approved content brief; visuals follow the design file.
 */

export const TRUST_LINE = 'Free · No signup · Your code stays yours · Results in ~60s';

/* ---- Problem stats -------------------------------------------------- */
export const STATS = [
  {
    value: '45%',
    label: 'of AI-generated code ships with a security vulnerability',
    source: 'Veracode, 2025',
  },
  {
    value: '170+',
    label: 'live apps exposed by one class of Lovable misconfiguration, with row-level security left off',
    source: 'CVE-2025-48757',
  },
];

/* ---- Breach types: "what actually goes wrong" ----------------------- */
export interface BreachType {
  title: string;
  means: string;
  cost: string;
  seen?: string;
}

export const BREACH_TYPES: BreachType[] = [
  {
    title: 'Your database is set to “public”',
    means:
      'Row-level security or Firebase rules left open means the app works for everyone, including strangers who never signed up.',
    cost: 'Every customer’s data, names, emails, orders, readable by anyone who opens your site’s network tab.',
    seen: 'Lovable · Moltbook · Tea',
  },
  {
    title: 'Your secret keys ship inside the page',
    means: 'AI tools drop API keys straight into the browser bundle, where they’re one right-click away.',
    cost: 'Someone drains your Stripe, runs up your OpenAI bill, or takes over whatever those keys unlock.',
    seen: 'Enrichlead',
  },
  {
    title: 'The lock is on the browser, not the door',
    means: 'When the “are you allowed?” check runs in the browser, the visitor is the one holding the key.',
    cost: 'People bypass your paywall by editing one value in the console, you keep the users and lose the revenue.',
    seen: 'Enrichlead',
  },
  {
    title: 'Anyone can fake “payment succeeded”',
    means: 'Payment webhooks that skip signature checks trust any request that shows up looking official.',
    cost: 'Free lifetime access for anyone who reads your API docs, and fraudulent orders polluting your data.',
  },
  {
    title: 'Your uploads are a public folder',
    means: 'Storage buckets set public expose every file your users upload, often with no link required.',
    cost: 'ID photos, invoices and private images sitting in the open, ready to be scraped and dumped.',
    seen: 'Tea',
  },
  {
    title: 'User input runs as code',
    means: 'Unsanitized input passed into a database query lets an attacker rewrite that query.',
    cost: 'Your database gets dumped, or wiped, by a single carefully crafted request.',
  },
];

/* ---- Real breaches: "it's already happening" ------------------------ */
export interface RealBreach {
  app: string;
  when: string;
  tag: string;
  story: string;
  damage: string;
  source: string;
  href: string;
}

export const REAL_BREACHES: RealBreach[] = [
  {
    app: 'Enrichlead',
    when: 'March 2025',
    tag: 'Built with Cursor',
    story:
      'A founder shipped a SaaS with zero hand-written code, the security logic living in the browser and admin keys hardcoded into it. Attackers bypassed the paywall and drained $14,000 of OpenAI usage in days.',
    damage: 'Paywall bypassed, keys abused, and the app was permanently shut down.',
    source: 'Revolter Tech',
    href: '',
  },
  {
    app: 'Lovable apps',
    when: 'April 2025',
    tag: 'CVE-2025-48757',
    story:
      'Supabase tables shipped with row-level security off. Across 170+ live apps and 303 endpoints, anyone with the public key could read emails, payment logs and tokens, no login required.',
    damage: 'Emails, payment logs and tokens exposed across 303 endpoints. CVSS 9.3 (Critical).',
    source: 'NIST National Vulnerability Database',
    href: 'https://nvd.nist.gov/vuln/detail/CVE-2025-48757',
  },
  {
    app: 'Tea',
    when: 'July 2025',
    tag: 'Firebase misconfig',
    story:
      'A public storage bucket exposed 72,000 images, including 13,000 driver’s licenses, alongside 1.1 million private messages.',
    damage: 'Driver’s licenses and private messages leaked, followed by class-action lawsuits.',
    source: 'American Bar Association / 404 Media',
    href: 'https://www.404media.co',
  },
  {
    app: 'Base44',
    when: 'July 2025',
    tag: 'Built with Wix',
    story:
      'Researchers found the vibe-coding platform let anyone register a verified account for any private app using only its public app ID, walking straight past SSO and every access control.',
    damage: 'Every private app on the platform was reachable by a stranger. Patched within 24 hours.',
    source: 'Wiz Research',
    href: 'https://www.wiz.io/blog',
  },
  {
    app: 'Moltbook',
    when: 'January 2026',
    tag: 'Supabase RLS off',
    story:
      'Row-level security was never turned on. 1.5 million API tokens and 35,000 emails were exposed, and attackers could write and delete records as an admin.',
    damage: '1.5M API tokens and 35,000 emails exposed; attackers got admin write and delete.',
    source: 'Wiz Research',
    href: 'https://www.wiz.io/blog',
  },
  {
    app: 'Replit Agent',
    when: '2025',
    tag: 'AI agent gone wrong',
    story:
      'An AI coding agent wiped the production database during a run, then generated 4,000 fake records to hide that it had done it.',
    damage: 'Production database wiped, then 4,000 fake records created to cover it up.',
    source: 'The Register / Fortune',
    href: 'https://www.theregister.com',
  },
];

/** The Problem section stat row (all verified + sourced). */
export const PROBLEM_STATS = [
  { value: '45%', label: 'of AI-generated code ships with a known security flaw (OWASP Top 10)', source: 'Veracode, 2025' },
  { value: '3-5 min', label: 'from a leaked key hitting the internet to bots exploiting it', source: 'GitGuardian, 2025' },
  { value: '170+', label: 'live apps exposed by one Lovable misconfiguration', source: 'CVE-2025-48757 (NIST NVD)' },
  { value: '60s', label: 'to a plain-English A to F security grade', source: 'Veilguard' },
];

/** Supporting line under the breach cards. */
export const BREACH_SUPPORT =
  '28.6 million secrets were exposed on public GitHub in 2025 (GitGuardian). AI-authored commits leak secrets at roughly twice the human rate.';

/* ---- How it works --------------------------------------------------- */
export const STEPS = [
  {
    n: '01',
    title: 'Scan',
    body: 'Paste your app’s link. No install, no signup, just the URL you already share with customers.',
  },
  {
    n: '02',
    title: 'Understand',
    body: 'A clear A to F grade and every issue in plain English: what it is, why it matters, and how bad it really is.',
  },
  {
    n: '03',
    title: 'Fix',
    body: 'The exact fix for each issue, copy-paste code or a ready-made prompt for your AI. Then we keep watching.',
  },
];

/* ---- Find & Fix: before / after Supabase RLS ------------------------ */
export const FIX_BEFORE = `create policy "read orders"
on orders for select
using (
  auth.uid() is not null   -- lets ANY logged-in user read all rows
);`;

export const FIX_AFTER = `create policy "read orders"
on orders for select
using (
  auth.uid() = user_id     -- each user only reads their own rows
);`;

// Plain text copied to the clipboard by the "Copy the fix" button.
export const FIX_CLIPBOARD = `create policy "read orders"
on orders for select
using ( auth.uid() = user_id );`;

/* ---- Monitor alert -------------------------------------------------- */
export const MONITOR_ALERT = {
  app: 'myapp.lovable.app',
  deploy: 'DEPLOY #47',
  title: 'New critical issue detected',
  body: 'Last night’s update exposed a new API key in your public bundle. We caught it 2 minutes after deploy.',
  gradeFrom: 'B',
  gradeTo: 'D',
};

/* ---- Pricing -------------------------------------------------------- */
export interface Plan {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    name: 'Free scan',
    price: '$0',
    cadence: '',
    blurb: 'See exactly where you stand.',
    features: [
      'Full A to F security grade',
      'Every issue found & explained',
      'Plain-English results',
      'No signup required',
    ],
    cta: 'Scan my app',
    ctaHref: '#scan',
  },
  {
    name: 'Guard',
    price: '$19',
    cadence: '/month',
    blurb: 'Stay safe as you keep shipping.',
    features: [
      'Repo, upload & URL scans + AI-written fixes',
      'Auto re-scan on every deploy',
      'Instant email alerts',
      'Deep Supabase & Firebase audit',
    ],
    cta: 'Start monitoring',
    ctaHref: '/onboarding',
    featured: true,
    badge: 'Most popular',
  },
];

/* ---- FAQ ------------------------------------------------------------ */
export const FAQS = [
  {
    q: 'Do you see or store my code?',
    a: 'The free scan only looks at your live app from the outside, exactly what an attacker already sees. Deeper checks are opt-in, read-only, and your source is never stored.',
  },
  {
    q: 'I’m not technical, will I understand the results?',
    a: 'Yes. Every finding is written in plain English, and each fix is either copy-paste code or a ready-made prompt you can hand to your AI.',
  },
  {
    q: 'Does it work with Lovable and Supabase?',
    a: 'Yes, that’s our specialty. Broken Supabase row-level security is the #1 critical issue we find in vibe-coded apps.',
  },
  {
    q: 'Is the scan really free?',
    a: 'Yes. The grade and full issue list cost nothing and need no account. You only pay when you want the fixes or ongoing monitoring.',
  },
  {
    q: 'Is my Lovable app secure?',
    a: 'Not automatically. A Lovable app built on Supabase is only safe if Row-Level Security is switched on for every table, and it often isn’t, which can leave your database readable by anyone holding the public key. Paste your URL and Veilguard checks it in about 60 seconds, free.',
  },
  {
    q: 'How do I know if my Supabase database is exposed?',
    a: 'The quickest check: open your live app, press F12, and watch the Network tab for requests to a *.supabase.co address. If data comes back before you log in, it’s readable by anyone. Veilguard runs this and dozens of other Row-Level Security checks for you and shows exactly which tables are open.',
  },
  {
    q: 'Can someone hack an app built with AI?',
    a: 'Yes, and usually without any real “hacking.” Most AI-built apps leak data through misconfiguration, not clever attacks: open databases, secret keys shipped to the browser, or permission checks that run in the browser instead of on the server. They’re easy to find and easy to fix once you know where they are.',
  },
  {
    q: 'Is it safe to take payments on a vibe-coded app?',
    a: 'Only if your payment webhooks verify their signature and your pricing and access checks run on the server, not in the browser. AI tools often skip both, which lets people fake a “payment succeeded” event or unlock paid features by editing one value. Veilguard flags these before you charge real customers.',
  },
  {
    q: 'Do I need to code to use Veilguard?',
    a: 'No. Paste your app’s link and you get a plain-English A to F grade with every issue explained in everyday language, plus a copy-paste fix or a ready-made prompt for your AI tool. If you can ship an app, you can fix what we find.',
  },
];
