/**
 * All landing-page copy lives here so sections stay presentational.
 * Copy follows the approved content brief; visuals follow the design file.
 */

export const TRUST_LINE = 'Free — no signup · Your code stays yours · Results in ~60s';

/* ---- Problem stats -------------------------------------------------- */
export const STATS = [
  {
    value: '45%',
    label: 'of AI-generated code ships with a security vulnerability',
    source: 'Veracode, 2025',
  },
  {
    value: '1.5M',
    label: 'API keys leaked from a single vibe-coded app — from one database rule nobody checked',
    source: 'Moltbook breach, 2026',
  },
  {
    value: 'under 60 min',
    label: 'for an attacker to go from finding your app to owning your data',
    source: 'Industry average',
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
      'Row-level security or Firebase rules left open means the app works for everyone — including strangers who never signed up.',
    cost: 'Every customer’s data — names, emails, orders — readable by anyone who opens your site’s network tab.',
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
    cost: 'People bypass your paywall by editing one value in the console — you keep the users and lose the revenue.',
    seen: 'Enrichlead',
  },
  {
    title: 'Anyone can fake “payment succeeded”',
    means: 'Payment webhooks that skip signature checks trust any request that shows up looking official.',
    cost: 'Free lifetime access for anyone who reads your API docs — and fraudulent orders polluting your data.',
  },
  {
    title: 'Your uploads are a public folder',
    means: 'Storage buckets set public expose every file your users upload — often with no link required.',
    cost: 'ID photos, invoices and private images sitting in the open, ready to be scraped and dumped.',
    seen: 'Tea',
  },
  {
    title: 'User input runs as code',
    means: 'Unsanitized input passed into a database query lets an attacker rewrite that query.',
    cost: 'Your database gets dumped — or wiped — by a single carefully crafted request.',
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
      'A founder proudly shipped a SaaS with “zero hand-written code” — and all the security logic in the browser. Within 72 hours, users worked out they could unlock the paid plan by changing a single value in the console.',
    damage: 'Paywall bypassed, API keys maxed out, database flooded with junk.',
    source: 'Tech Startups',
    href: 'https://techstartups.com/2025/03/26/when-vibe-coding-goes-wrong/',
  },
  {
    app: 'Lovable apps',
    when: 'May 2025',
    tag: 'CVE-2025-48757',
    story:
      'Researchers scanned live Lovable-built apps and found 170+ where anyone could pull full user lists, payment records and API keys straight from the database using the public key — no login required.',
    damage: 'Names, emails, addresses, payment data and developer keys exposed across 303 endpoints.',
    source: 'The Register',
    href: 'https://www.theregister.com/2026/02/27/lovable_app_vulnerabilities/',
  },
  {
    app: 'Tea',
    when: 'July 2025',
    tag: 'Firebase misconfig',
    story:
      'A storage bucket left wide open leaked 72,000 images — including 13,000 selfies and photo IDs — plus more than a million private messages. The files were dumped on 4chan within days.',
    damage: 'Driver’s licenses and DMs used to dox and harass users, followed by lawsuits.',
    source: 'NPR',
    href: 'https://www.npr.org/2025/08/02/nx-s1-5483886/tea-app-breach-hacked-whisper-networks',
  },
  {
    app: 'Moltbook',
    when: 'January 2026',
    tag: 'RLS never enabled',
    story:
      'An AI-built social network exposed its entire database — 1.5 million auth tokens, 35,000 emails and private messages — to anyone holding the public API key. Row-level security had simply never been turned on.',
    damage: '1.5M API tokens and 35,000 emails exposed to the public internet.',
    source: 'Wiz',
    href: 'https://www.techgines.com/post/vibe-coding-security-shadow-builders-exposed-apps',
  },
];

export const BREACH_STATS = [
  { value: '11%', label: 'of 20,000+ launched indie apps expose their Supabase keys in the browser', source: 'SupaExplorer, 2026' },
  { value: '98%', label: 'of 1,072 vibe-coded apps scanned had at least one security flaw', source: 'Symbiotic Security, 2026' },
  { value: '170+', label: 'live apps exposed by one class of Lovable misconfiguration alone', source: 'CVE-2025-48757' },
];

/* ---- How it works --------------------------------------------------- */
export const STEPS = [
  {
    n: '01',
    title: 'Scan',
    body: 'Paste your app’s link. No install, no signup — just the URL you already share with customers.',
  },
  {
    n: '02',
    title: 'Understand',
    body: 'A clear A–F grade and every issue in plain English: what it is, why it matters, and how bad it really is.',
  },
  {
    n: '03',
    title: 'Fix',
    body: 'The exact fix for each issue — copy-paste code or a ready-made prompt for your AI. Then we keep watching.',
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
      'Full A–F security grade',
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
    ctaHref: '#scan',
    featured: true,
    badge: 'Most popular',
  },
];

/* ---- FAQ ------------------------------------------------------------ */
export const FAQS = [
  {
    q: 'Do you see or store my code?',
    a: 'The free scan only looks at your live app from the outside — exactly what an attacker already sees. Deeper checks are opt-in, read-only, and your source is never stored.',
  },
  {
    q: 'I’m not technical — will I understand the results?',
    a: 'Yes. Every finding is written in plain English, and each fix is either copy-paste code or a ready-made prompt you can hand to your AI.',
  },
  {
    q: 'Does it work with Lovable and Supabase?',
    a: 'Yes — that’s our specialty. Broken Supabase row-level security is the #1 critical issue we find in vibe-coded apps.',
  },
  {
    q: 'Is the scan really free?',
    a: 'Yes. The grade and full issue list cost nothing and need no account. You only pay when you want the fixes or ongoing monitoring.',
  },
];
