import type { Article } from './types';

/**
 * General "// ANSWER" pages — question → direct answer, written for a
 * non-technical founder who is charging money and needs the truth in plain
 * English. Accuracy rule (see types.ts): never invent a stat, breach, or
 * named incident. Real citation needed → the literal token [SOURCE NEEDED],
 * and set hasPlaceholders: true on that article.
 */
export const GENERAL_QUESTIONS: Article[] = [
  // 1 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'how-do-i-know-if-my-supabase-database-is-exposed',
    type: 'question',
    category: '// ANSWER',
    title: 'How do I know if my Supabase database is exposed?',
    metaTitle: 'Is My Supabase Database Exposed? How to Check | Veilguard',
    metaDescription:
      'A non-developer test for whether strangers can read your Supabase tables: the anon key is fine, but Row Level Security is the real gate. Here is how to check.',
    keywords: [
      'supabase database exposed',
      'supabase anon key safe',
      'supabase row level security',
      'is my supabase secure',
      'check supabase table policies',
    ],
    h1: 'How do I know if my Supabase database is exposed?',
    directAnswer:
      'Seeing your Supabase URL and "anon" key in the browser does not mean your database is exposed — those are designed to be public. What decides whether strangers can read or change your data is Row Level Security (RLS): a per-table gate that must be turned on with policies that actually restrict access. If a table has RLS off, or a policy that always passes, anyone who opens your app can pull every row through Supabase\'s automatic API. The fastest check is your Supabase dashboard, and you can confirm it in your browser\'s network tab in about a minute.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'First: the anon key in your browser is supposed to be there',
        body:
          'When you built your app, your AI tool put a Supabase URL and a long "anon" (anonymous / publishable) key into the front-end code. Anyone can see it — right-click, View Source, and there it is. This scares a lot of founders, but it is by design. That key only identifies your project; it is not a password. Supabase expects it to live in the browser.\n\nThe thing that actually protects your data is a separate layer called Row Level Security. So the anon key being visible is not the problem. A missing or fake RLS policy is. There is a second, different key — the "service_role" key — that does bypass all protection. That one must never appear in your browser or your public code.',
        note: 'Anon key in the browser = normal. service_role key in the browser = emergency — rotate it immediately and move it to server-side code only.',
      },
      {
        h2: 'The real test is Row Level Security (RLS)',
        body:
          'Supabase automatically exposes every table in your database through a web API. That means a table called "profiles" or "orders" can be requested directly over the internet, using only the public anon key, unless something stops it. Row Level Security is that something.\n\nRLS works in two steps, and you need both. First, RLS has to be turned ON for the table. Second, you write policies that say who can see or change which rows — for example, "a user can only read their own row." If RLS is off, the table is wide open. If RLS is on but the only policy always says yes, it is also wide open. "Exposed" almost always means one of those two.',
      },
      {
        h2: 'How to check a table\'s policies in the dashboard',
        body:
          'You do not need to write code to check this. In your Supabase project dashboard:',
        bullets: [
          'Open the Table Editor and look at your list of tables. Supabase flags tables without protection — a table showing an "Unrestricted" label (or a warning icon) has RLS off and is readable by anyone.',
          'Go to Authentication → Policies (or Database → Policies). For each table, read the policies listed.',
          'A protected table has RLS enabled and at least one policy that references the logged-in user — you will see something like auth.uid() = user_id.',
          'A table with RLS enabled but zero policies blocks everyone (safe, though your app may break). A table with RLS off, or a policy set to "true", lets everyone in.',
        ],
        numbered: true,
        note: 'Check every table that holds anything private: users, profiles, orders, messages, uploads, API keys, subscriptions.',
      },
      {
        h2: 'What "using (true)" actually means',
        body:
          'When you read a policy, the part after "using" is the condition Supabase checks before it hands over a row. If that condition is the word true, it passes for everyone, every time — which is the same as having no protection at all. AI tools sometimes generate this to make the app "just work" during building, and it quietly ships to production.\n\nHere is the difference in plain SQL. The first policy lets the whole internet read the table. The second only lets people read their own rows.',
        code: {
          label: 'Wide-open vs. locked-down (orders table)',
          content:
            '-- EXPOSED: this passes for anyone with your public anon key\ncreate policy "read orders"\n  on orders for select\n  using ( true );\n\n-- SAFE: a signed-in user can only read rows that belong to them\ncreate policy "read own orders"\n  on orders for select\n  using ( auth.uid() = user_id );',
        },
      },
      {
        h2: 'The network-tab tell (a 60-second test anyone can do)',
        body:
          'You can watch your own app talk to Supabase. Open your live site, press F12 (or right-click → Inspect) to open developer tools, and click the "Network" tab. Reload the page and use the app for a moment.',
        bullets: [
          'Look for requests going to a URL like your-project.supabase.co/rest/v1/something — that "something" is a table name.',
          'Click one and look at the response. If you can see rows of real data before logging in — or data that belongs to other users — that table is exposed.',
          'A telling sign: paste that same /rest/v1/ request URL into a fresh private browser window with no login. If it still returns data, so can a stranger.',
        ],
        note: 'This shows you the same thing an opportunistic scanner sees. If a table hands over data to a logged-out request, treat it as public.',
      },
      {
        h2: 'What "exposed" looks like vs. what is fine',
        body:
          'To keep it straight: your anon key being visible is fine. Your Supabase URL being visible is fine. A public table that only contains genuinely public content (like blog posts you want everyone to read) is fine. What is not fine is any table with private data that returns rows to a logged-out or unrelated request. If you are unsure, a scan can check every table for you in about a minute and tell you which ones are open — without touching or storing your data.',
      },
    ],
    keyTakeaways: [
      'Your Supabase anon key is meant to be public — its visibility is not the vulnerability.',
      'Row Level Security is the real gate: it must be turned on AND backed by policies that restrict rows.',
      'A policy that uses "true" allows everyone — it is the same as no protection.',
      'The service_role key must never appear in your browser or public code; rotate it if it has.',
      'You can confirm exposure yourself in the network tab: if a logged-out request returns private rows, that table is open.',
    ],
    faqs: [
      {
        q: 'Is it dangerous that my Supabase key is visible in the browser?',
        a: 'Not on its own. The anon (publishable) key is designed to be public and only identifies your project. Your protection comes from Row Level Security, not from hiding that key. The key you must keep secret is the service_role key.',
      },
      {
        q: 'Does turning on RLS break my app?',
        a: 'It can, temporarily. Enabling RLS with no policies blocks all access, so parts of your app may stop loading until you add policies that allow the right people to see the right rows. That is expected — it means the gate is now closed and you are deciding who gets through.',
      },
      {
        q: 'I never touched security settings — am I protected by default?',
        a: 'Do not assume so. Whether a given table ends up protected depends on how your AI tool generated it and whether policies were added. The only way to be sure is to check each table\'s RLS status and policies, or run a scan that does it for you.',
      },
      {
        q: 'Can someone really find my database without knowing my company?',
        a: 'Yes. Attackers rarely target a specific small app — automated tools scan public code and live endpoints for open databases at scale. Your app does not need to be famous to be found.',
      },
    ],
    related: [
      { label: 'Supabase Row Level Security, explained for non-developers', href: '/learn/supabase-row-level-security-explained-for-non-developers' },
      { label: '7 security holes AI coding tools leave behind', href: '/learn/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Can someone hack an app built with AI?', href: '/learn/can-someone-hack-an-app-built-with-ai' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
    ],
    builder: { label: 'Check your Supabase security free', href: '/supabase-security-checker' },
  },

  // 2 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'are-ai-generated-apps-safe-to-launch',
    type: 'question',
    category: '// ANSWER',
    title: 'Are AI-generated apps safe to launch?',
    metaTitle: 'Are AI-Generated Apps Safe to Launch? | Veilguard',
    metaDescription:
      'An honest answer for founders: AI-built apps can be safe to launch, but AI tools optimize for "works," not "secure." Here are the recurring gaps to check first.',
    keywords: [
      'are ai generated apps safe',
      'is vibe coding safe',
      'ai app security',
      'launch ai built app',
      'lovable bolt cursor security',
    ],
    h1: 'Are AI-generated apps safe to launch?',
    directAnswer:
      'Yes, an AI-generated app can be safe to launch — but it is not safe automatically. AI coding tools are built to make something that works and looks finished, not something that is secure, so they routinely ship code that runs perfectly while leaving the database open, keys in the browser, or payments unverified. None of that shows up as a bug or an error message; the app just works until someone looks in the wrong place. The good news is these gaps follow a short, predictable list, and most are quick to fix once you know to check them.',
    readMinutes: 6,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'The honest short answer',
        body:
          'Launching an AI-built app is not reckless, and you do not need to rebuild it by hand to be responsible. Plenty of real, paying products were built with Lovable, Bolt, Cursor, Replit, or v0. But "it works" and "it is safe" are two different tests, and AI tools only guarantee the first. Treat launch security as a checklist you run once, not a reason to stall.',
      },
      {
        h2: 'Why AI tools optimize for "works," not "safe"',
        body:
          'When you prompt an AI tool, you ask for a feature — a login, a dashboard, a checkout. The tool succeeds when that feature runs on screen. Security is invisible in that moment: an open database still returns data, an exposed key still works, an unverified payment still shows a success page. So the fastest path to a working demo is often the least safe one, and the tool takes it because nothing tells it not to.\n\nThis is not the AI being careless — it is doing exactly what it was asked. The result is code that passes the "does it work?" test while quietly failing the "can a stranger abuse it?" test.',
      },
      {
        h2: 'The recurring gaps',
        body:
          'Across AI-built apps on Next.js with Supabase, Firebase, and Stripe, the same handful of issues show up again and again:',
        bullets: [
          'Open database tables — Row Level Security (Supabase) or security rules (Firebase) left off, so private rows are readable by anyone.',
          'Secret keys in the browser — a real secret placed in a NEXT_PUBLIC_ variable or hard-coded into front-end code, where it ships to every visitor.',
          'Client-side auth checks — "only admins can do this" enforced in the browser, where a user can simply bypass it, instead of on the server.',
          'Unverified payment webhooks — the server trusting a "payment succeeded" message without checking it truly came from Stripe.',
          'Public storage buckets — uploaded files (IDs, invoices, user photos) sitting on a public URL anyone can guess or crawl.',
          'Unvalidated input — forms and API routes that accept whatever they are sent, opening the door to junk or malicious data.',
        ],
      },
      {
        h2: 'What to check before you charge money',
        body:
          'Before you take a single real payment, walk through these. Each maps to one of the gaps above:',
        bullets: [
          'Can a logged-out visitor read any private table? (Check RLS / security rules.)',
          'Is any secret key visible in View Source, the network tab, or your JavaScript bundle?',
          'Are your permission checks enforced on the server, not just hidden in the interface?',
          'Does your payment code verify events with Stripe rather than trusting the browser?',
          'Are user uploads private by default, requiring a signed link to view?',
          'Is your .env file kept out of your public code and its git history?',
        ],
        numbered: true,
      },
      {
        h2: 'It is fixable — you do not need to rebuild',
        body:
          'Almost every issue on that list is a configuration change or a few lines of code, not a ground-up rewrite. Turning on RLS, moving a key to the server, adding a webhook signature check — these are small, well-understood fixes. The hard part is knowing which ones apply to your app, which is exactly what a scan is for: it grades your app A–F, points at the specific gaps, and hands you the exact fix for each one.',
      },
    ],
    keyTakeaways: [
      'AI-built apps can be safe to launch, but never assume they are safe by default.',
      'AI tools succeed at "it works" and are blind to "it is safe" — the two are different tests.',
      'The risky gaps are predictable: open databases, keys in the browser, client-side auth, unverified payments, public buckets.',
      'Run a short pre-launch checklist before you charge money, not after.',
      'Most fixes are small config or code changes, not a rebuild.',
    ],
    faqs: [
      {
        q: 'Do I need to hire a security engineer before launching?',
        a: 'Usually not for an early-stage AI-built app. The common issues follow a known list and have known fixes. A scan can find them and give you copy-paste fixes; you only need outside help if you have unusual or highly sensitive requirements.',
      },
      {
        q: 'My app has been live for months with no problems — am I fine?',
        a: 'No problems that you have noticed is not the same as no problems. Data exposure and paywall bypasses often leave no visible trace until money or data has already leaked. "It has been fine" is not evidence that it is secure.',
      },
      {
        q: 'Is a specific AI tool (Lovable, Bolt, Cursor, Replit, v0) more secure than the others?',
        a: 'They share the same root issue: all optimize for a working result. The exact defaults differ, but the categories of gaps are the same across tools. Check the app you shipped, not the logo of the tool that built it.',
      },
      {
        q: 'What is the single most important thing to check?',
        a: 'Whether a logged-out stranger can read your private database tables. That one issue exposes customer data directly and is the most common serious gap in AI-built apps.',
      },
    ],
    related: [
      { label: 'Security checks before launching your SaaS', href: '/learn/security-checks-before-launching-your-saas' },
      { label: '7 security holes AI coding tools leave behind', href: '/learn/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
      { label: 'How to secure your app before launch', href: '/learn/how-to-secure-your-app-before-launch' },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'how-to-check-for-exposed-api-keys',
    type: 'question',
    category: '// ANSWER',
    title: 'How to check for exposed API keys',
    metaTitle: 'How to Check for Exposed API Keys | Veilguard',
    metaDescription:
      'An exposed API key is a secret anyone can read from your app. Here is where AI tools leak them, how a non-developer can find theirs, and how to rotate and fix it.',
    keywords: [
      'exposed api keys',
      'find api key in browser',
      'next_public secret leak',
      'api key in git history',
      'rotate leaked api key',
    ],
    h1: 'How do I check for exposed API keys?',
    directAnswer:
      'An exposed API key is a secret credential — like a password for a paid service — that anyone can read straight from your app or your code. You can check for one in a few minutes: view your site\'s source, watch the network tab, and search your JavaScript bundle for the tell-tale prefixes (sk_, service_role, and similar). Some keys, like Stripe\'s pk_ publishable key or Supabase\'s anon key, are meant to be public and are fine. If you find a true secret exposed, the fix is always the same: rotate it (generate a new one) and move the secret to server-side code where visitors cannot see it.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'What an exposed API key actually is',
        body:
          'An API key lets your app talk to a paid or private service — Stripe for payments, OpenAI for AI features, SendGrid for email, Supabase for your database. Some of these keys are public by design and some are secret. A public key only identifies your account; a secret key can spend money, read data, or send messages on your behalf.\n\n"Exposed" means a secret key ended up somewhere a stranger can read it — in the browser, in your public code, or in your project\'s history. Once it is out, anyone can use it to run up your bill, drain your quota, or reach your data, and you will not get a warning first.',
        bullets: [
          'Safe to be public: Stripe publishable key (pk_...), Supabase anon key, Firebase config values. These are meant for the browser.',
          'Must stay secret: Stripe secret key (sk_...), Supabase service_role key, OpenAI keys (sk-...), email/SMS provider keys, any database password.',
        ],
      },
      {
        h2: 'Where AI tools leak them',
        body:
          'AI coding tools leak secrets in a few predictable ways, usually because putting the key in the front-end is the shortest path to a working feature:',
        bullets: [
          'The NEXT_PUBLIC_ trap — in Next.js, any environment variable that starts with NEXT_PUBLIC_ is baked into the browser bundle on purpose. Put a secret there and it ships to every visitor. Secrets must NOT carry that prefix.',
          'Hard-coded in front-end code — the key pasted directly into a component or script that runs in the browser.',
          'A committed .env file — the file that holds your secrets accidentally pushed to a public GitHub repo.',
          'Git history — even after you delete a key from a file, it usually still sits in the repo\'s history, viewable by anyone who clones it. Deleting is not enough; you must rotate.',
        ],
        note: 'Automated bots scan public code hosts for secret keys continuously, and leaked keys are often abused within minutes of being committed. [SOURCE NEEDED]',
      },
      {
        h2: 'How to find yours (no coding required)',
        body:
          'You can look with the same tools a curious stranger would use:',
        bullets: [
          'View Source — open your live site, right-click, and choose "View Page Source." Use Ctrl+F to search the text for sk_, service_role, secret, and the names of services you use.',
          'The network tab — press F12, open the "Network" tab, reload, and inspect requests. Secrets sometimes travel in request headers or URLs where they should not.',
          'Search the JavaScript bundle — in developer tools, open the "Sources" tab, then use the global search (Ctrl+Shift+F) across all loaded scripts for the same prefixes. Your whole front-end is downloaded to every visitor, so anything in it is readable.',
          'Check your repository — if your code is on GitHub, search the repo (including older commits) for .env, sk_, and service_role.',
        ],
        numbered: true,
        note: 'Finding a pk_ or anon key here is normal. Finding an sk_, service_role, or provider secret is the problem.',
      },
      {
        h2: 'If you find one: rotate, then move it server-side',
        body:
          'Do these in order. Rotating first is critical — the moment a key is exposed, you must assume someone has copied it, so a new key is the only thing that truly closes the door.',
        bullets: [
          'Rotate — in the service\'s dashboard (Stripe, Supabase, OpenAI, etc.), generate a new secret key and revoke the old one. This instantly kills any copy an attacker holds.',
          'Move it server-side — store the new secret in a server-only environment variable (no NEXT_PUBLIC_ prefix) and use it only from server code, such as a Next.js API route or route handler.',
          'Purge and re-check — remove the secret from front-end code, and remember that removing it from git history requires rewriting history, not just deleting the file.',
        ],
        numbered: true,
        code: {
          label: 'Leaked in the browser vs. safe on the server (Next.js)',
          content:
            '// EXPOSED: this runs in the browser, so the secret ships to every visitor.\n// The NEXT_PUBLIC_ prefix forces it into the public bundle.\nconst stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);\n\n// SAFE: keep the secret server-only (no NEXT_PUBLIC_ prefix) and use it\n// inside a server route the browser never sees.\n// file: app/api/checkout/route.ts  (runs on the server)\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY);',
        },
      },
      {
        h2: 'Which keys you can leave alone',
        body:
          'Do not panic-rotate the public keys. Stripe\'s publishable key, Supabase\'s anon key, and Firebase config values are designed to sit in the browser — their protection comes from other layers (Stripe\'s server-side checks, Supabase RLS, Firebase security rules), not from being hidden. Rotating them will not improve security and may break your app. Focus your effort on the true secrets.',
      },
    ],
    keyTakeaways: [
      'An exposed API key is a secret anyone can read from your app — it can spend money or reach your data.',
      'Public keys (pk_, Supabase anon, Firebase config) are meant to be visible; secrets (sk_, service_role, provider keys) are not.',
      'AI tools leak secrets via the NEXT_PUBLIC_ prefix, hard-coded front-end code, committed .env files, and git history.',
      'You can find leaks yourself with View Source, the network tab, and a search of the JavaScript bundle.',
      'If a secret is exposed, rotate it first, then move it to server-only code — deleting the file alone does not undo the leak.',
    ],
    faqs: [
      {
        q: 'Is it safe that my Stripe or Supabase key is visible?',
        a: 'If it is the publishable key (pk_) or the Supabase anon key, yes — those are built to be public. If it starts with sk_ or is the service_role key, no; that is a secret and must be rotated and moved server-side.',
      },
      {
        q: 'I deleted the key from my code. Am I safe now?',
        a: 'Not necessarily. If the key was ever committed to git, it usually still lives in the repository history where anyone can read it. The only reliable fix is to rotate the key so the old value stops working.',
      },
      {
        q: 'What does NEXT_PUBLIC_ mean and why does it matter?',
        a: 'In Next.js, the NEXT_PUBLIC_ prefix tells the framework to include that value in the browser bundle. It is meant for public values. Putting a secret behind that prefix ships the secret to every visitor, so secrets must never use it.',
      },
      {
        q: 'How would someone even find my key?',
        a: 'Mostly through automated scanning, not manual effort. Bots continuously crawl public code repositories and live sites for key patterns, so a leaked secret can be discovered and abused without anyone targeting you specifically.',
      },
    ],
    related: [
      { label: 'Exposed API keys: what they are, how to find and fix', href: '/learn/exposed-api-keys-what-they-are-how-to-find-and-fix' },
      { label: '7 security holes AI coding tools leave behind', href: '/learn/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Can someone hack an app built with AI?', href: '/learn/can-someone-hack-an-app-built-with-ai' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
    ],
    hasPlaceholders: true,
  },

  // 4 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'is-it-safe-to-take-payments-on-a-vibe-coded-app',
    type: 'question',
    category: '// ANSWER',
    title: 'Is it safe to take payments on a vibe-coded app?',
    metaTitle: 'Is It Safe to Take Payments on a Vibe-Coded App? | Veilguard',
    metaDescription:
      'Taking Stripe payments on an AI-built app is safe only if the server verifies the money. Here are the traps: client-side "success," unverified webhooks, price tampering.',
    keywords: [
      'vibe coded app payments',
      'stripe security ai app',
      'stripe webhook verification',
      'is stripe safe',
      'payment security saas',
    ],
    h1: 'Is it safe to take payments on a vibe-coded app?',
    directAnswer:
      'It can be — Stripe itself is secure, and the card details never touch your app. The risk is in the code around the payment, which AI tools often get wrong. The core rule is simple: your server must be the only thing that decides whether money was actually received, and it must confirm that directly with Stripe. If your app trusts a "payment succeeded" message from the browser, accepts a price sent by the browser, or acts on webhook messages without checking their signature, then it is not yet safe to charge real customers.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'The short answer, and what actually protects you',
        body:
          'You are not handling raw card numbers — Stripe does that on its own secure pages, which keeps the most sensitive part out of your app entirely. So "is it safe to take payments" is really "does my app correctly confirm what Stripe tells it?" That confirmation has to happen on your server, using your Stripe secret key, because anything that happens in the browser can be edited by the person using it.\n\nThe three ways AI-built payment code goes wrong all come down to trusting the browser when it should be trusting the server.',
      },
      {
        h2: 'Trap 1: trusting the browser\'s "payment succeeded"',
        body:
          'A common AI-generated pattern is: the browser talks to Stripe, sees a success result, and then tells your app "they paid — give them access." The problem is that the "they paid" message comes from the browser, and anyone can fake a request from their own browser. A user can trigger the "unlock" step without ever paying.\n\nThe fix is to never grant access based on a browser message. Your server should confirm the payment independently — either by handling Stripe\'s server-to-server webhook or by retrieving the payment from Stripe with your secret key — before it unlocks anything.',
      },
      {
        h2: 'Trap 2: unverified webhooks',
        body:
          'Stripe can notify your server when a payment happens by sending a "webhook" — a message to a URL in your app. That URL is public, so anyone (or any bot) can send it a fake message that says "payment succeeded." If your server acts on those messages without checking them, an attacker can hand themselves a paid account for free.\n\nStripe solves this by signing every real webhook. Your server must verify that signature with your webhook signing secret and reject anything that fails. AI tools often generate the endpoint that reads the message but skip the verification step.',
        code: {
          label: 'Unverified vs. verified Stripe webhook (server route)',
          content:
            '// UNSAFE: trusts whatever is POSTed to the public webhook URL.\nexport async function POST(req) {\n  const event = await req.json();\n  if (event.type === "checkout.session.completed") {\n    grantAccess(event); // anyone can fake this\n  }\n}\n\n// SAFE: verify the Stripe signature before trusting the event.\nexport async function POST(req) {\n  const body = await req.text();\n  const signature = req.headers.get("stripe-signature");\n  const event = stripe.webhooks.constructEvent(\n    body,\n    signature,\n    process.env.STRIPE_WEBHOOK_SECRET, // rejects forged messages\n  );\n  if (event.type === "checkout.session.completed") {\n    grantAccess(event);\n  }\n}',
        },
      },
      {
        h2: 'Trap 3: price tampering',
        body:
          'If the amount to charge is sent from the browser to your server — "charge this customer $49" — then the customer can change that number before it is sent, and pay $0.49 instead. AI tools do this because it is the simplest way to wire up a dynamic price.\n\nThe fix is to never accept the price from the browser. The browser should send only what was chosen (a product or plan identifier), and the server should look up the real price — ideally by referencing a fixed Stripe Price you created in the Stripe dashboard, so the amount is decided by Stripe and your server, never the shopper.',
      },
      {
        h2: 'What "safe to charge" actually requires',
        body:
          'Before you take real money, confirm all of these are true:',
        bullets: [
          'Access is granted only after your server confirms payment with Stripe — never from a browser message alone.',
          'Your webhook endpoint verifies Stripe\'s signature and rejects anything unsigned or altered.',
          'Prices are set on the server (or fixed Stripe Price IDs), never accepted from the browser.',
          'Your Stripe secret key (sk_) lives only in server code — never in the browser or public repo.',
          'You handle the case where a payment is refunded, disputed, or a subscription is canceled, so access is revoked too.',
        ],
        numbered: true,
      },
    ],
    keyTakeaways: [
      'Stripe is secure and card data never touches your app — the risk is in the code around the payment.',
      'Never grant access based on a "payment succeeded" message from the browser; confirm it on your server.',
      'Verify every Stripe webhook\'s signature with your signing secret, or forged messages can buy free access.',
      'Decide prices on the server (or with fixed Stripe Price IDs), never trust an amount sent by the browser.',
      'Keep your Stripe secret key server-side only, and revoke access on refunds and cancellations.',
    ],
    faqs: [
      {
        q: 'Does taking payments mean I have to store credit card numbers?',
        a: 'No. With Stripe, card details are entered on Stripe\'s own secure fields and never reach your servers, which keeps you out of the most sensitive and heavily regulated part of payments. Your job is to correctly confirm the result.',
      },
      {
        q: 'How would someone bypass my paywall?',
        a: 'The two most common ways are triggering your "unlock" step directly without paying (when access is granted from the browser) and sending a forged webhook to your unverified endpoint. Both are closed by confirming payments on the server.',
      },
      {
        q: 'Is a Stripe Checkout / Payment Link safer than a custom form?',
        a: 'It removes some risk because Stripe hosts the payment page and sets the price, but you still must verify the webhook or check the session on your server before granting access. Hosted checkout is not a substitute for server-side confirmation.',
      },
      {
        q: 'How do I know if my current setup is vulnerable?',
        a: 'Look for whether access is unlocked from browser code, whether your webhook checks a signature, and whether the charge amount comes from the browser. If you are unsure, a scan can inspect your payment flow and flag which of these traps apply.',
      },
    ],
    related: [
      { label: 'Security checks before launching your SaaS', href: '/learn/security-checks-before-launching-your-saas' },
      { label: 'Are AI-generated apps safe to launch?', href: '/learn/are-ai-generated-apps-safe-to-launch' },
      { label: '7 security holes AI coding tools leave behind', href: '/learn/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'security-checks-before-launching-your-saas',
    type: 'question',
    category: '// ANSWER',
    title: 'Security checks before launching your SaaS',
    metaTitle: 'Security Checks Before Launching Your SaaS | Veilguard',
    metaDescription:
      'A short pre-launch security checklist for AI-built SaaS: the handful of checks that actually matter — open databases, exposed keys, auth, payments, uploads.',
    keywords: [
      'saas security checklist',
      'pre launch security checks',
      'ai app launch checklist',
      'secure saas before launch',
      'vibe coding security',
    ],
    h1: 'What security checks should I do before launching my SaaS?',
    directAnswer:
      'You do not need a long audit — for an AI-built SaaS, a handful of checks catch almost all of the serious risk. Confirm that no private database table is readable by a logged-out stranger, that no secret keys are visible in the browser, that permission checks run on the server rather than in the interface, that payments are verified server-side, and that user uploads are not sitting on public URLs. Run these before you take a real payment, not after. Each one has a clear yes/no answer and a known fix.',
    readMinutes: 6,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'The five checks that actually matter',
        body:
          'Security advice for engineers can run to hundreds of items. For a founder launching an AI-built SaaS, the risk is concentrated in a few places. Get these right and you have handled the issues most likely to leak customer data or money:',
        bullets: [
          '1. Database access — can a logged-out visitor read any private table? Check Supabase Row Level Security or Firebase security rules on every table that holds user data.',
          '2. Exposed secrets — is any secret key visible in View Source, the network tab, or your JavaScript bundle? Public keys are fine; sk_ and service_role keys are not.',
          '3. Server-side permissions — are "who can do what" checks enforced on the server, not just hidden in the front-end where a user can bypass them?',
          '4. Payment verification — does your server confirm payments with Stripe (verified webhook or a server-side check) instead of trusting the browser?',
          '5. File uploads — are user files private by default and served through signed links, not sitting on guessable public URLs?',
        ],
        numbered: true,
      },
      {
        h2: 'Why these five and not fifty',
        body:
          'These are the checks where an AI tool\'s "make it work" shortcut turns directly into exposed data or lost money, and where the problem is invisible until someone finds it. They are also the areas AI tools most reliably get wrong on Next.js, Supabase, Firebase, and Stripe. Longer lists exist and have their place, but if you only have an afternoon before launch, spend it here.',
      },
      {
        h2: 'How to actually run each check',
        body:
          'None of these require you to be an engineer:',
        bullets: [
          'Database: in a private browser window with no login, try to load pages and watch the network tab for /rest/v1/ (Supabase) requests that return real data. In the dashboard, confirm RLS is on with real policies.',
          'Secrets: right-click → View Source and search for sk_, service_role, and secret. Search your loaded scripts too (developer tools → Sources → global search).',
          'Permissions: try to open an admin page or edit another user\'s data while logged in as a normal user. If the interface merely hides the button, that is not protection.',
          'Payments: check whether access unlocks from browser code and whether your Stripe webhook verifies a signature.',
          'Uploads: copy a file\'s URL and open it in a logged-out window. If it loads for anyone, the bucket is public.',
        ],
      },
      {
        h2: 'Do it once, then keep watching',
        body:
          'Launch security is not a one-time event, because every new feature your AI tool ships can reopen a gap — a new table without RLS, a new key in the wrong place. Run the checklist before launch, and re-run the relevant checks whenever you ship something that touches data, auth, or payments. A scan can do this automatically on every deploy and email you when a new hole appears, so you are not relying on memory.',
      },
    ],
    keyTakeaways: [
      'Most serious risk in an AI-built SaaS sits in five areas: database access, exposed secrets, server-side permissions, payment verification, and file uploads.',
      'Run these checks before you take a real payment, not after.',
      'Each check has a clear yes/no answer you can test yourself, mostly using a private browser window and developer tools.',
      'Hiding a button in the interface is not a permission check — enforcement must happen on the server.',
      'Re-check after every feature that touches data, auth, or payments; new code can reopen old gaps.',
    ],
    faqs: [
      {
        q: 'How long does a pre-launch security check take?',
        a: 'The manual version of these five checks is an afternoon\'s work for most small apps. An automated scan returns a graded result in about a minute and points you straight at what needs fixing.',
      },
      {
        q: 'Do I need penetration testing before launch?',
        a: 'A formal pentest is usually overkill for an early-stage AI-built SaaS and is aimed at engineers. Start with the five checks here; consider a pentest later if you handle especially sensitive data or a customer requires one.',
      },
      {
        q: 'What if I only have time for one check?',
        a: 'Check database access. Whether a logged-out stranger can read your private tables is the most common serious flaw in AI-built apps and the one that leaks customer data directly.',
      },
    ],
    related: [
      { label: 'How to secure your app before launch', href: '/learn/how-to-secure-your-app-before-launch' },
      { label: 'Are AI-generated apps safe to launch?', href: '/learn/are-ai-generated-apps-safe-to-launch' },
      { label: 'Is it safe to take payments on a vibe-coded app?', href: '/learn/is-it-safe-to-take-payments-on-a-vibe-coded-app' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'can-someone-hack-an-app-built-with-ai',
    type: 'question',
    category: '// ANSWER',
    title: 'Can someone hack an app built with AI?',
    metaTitle: 'Can Someone Hack an App Built With AI? | Veilguard',
    metaDescription:
      'Yes, but not the way you picture it. The realistic threat to AI-built apps is automated scanning for exposed keys and open databases — not elite hackers targeting you.',
    keywords: [
      'can ai app be hacked',
      'vibe coded app security risk',
      'ai app threat model',
      'automated scanning exposed keys',
      'is my ai app safe',
    ],
    h1: 'Can someone hack an app built with AI?',
    directAnswer:
      'Yes — but almost never the way movies portray it. The realistic threat to an AI-built app is not a skilled hacker choosing to target you; it is automated software constantly scanning the entire internet for easy, opportunistic wins: exposed keys, open databases, and public files. Your app does not need to be well-known or valuable to be found — the scanning is indiscriminate. That is also the reassuring part: the same handful of common misconfigurations that make you a target are quick and cheap to close.',
    readMinutes: 6,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'The short answer: yes, but not how you imagine',
        body:
          'When founders picture "getting hacked," they picture a person deciding to break into their specific app. For a small AI-built product, that is rarely what happens. The overwhelming majority of trouble comes from automated tools that scan everything, everywhere, looking for doors that were left unlocked. You are not singled out — you are simply found.\n\nThis matters because it changes what you need to defend against. You do not need to outsmart an expert; you need to not be the low-hanging fruit the scanners are built to catch.',
      },
      {
        h2: 'The realistic threat: opportunistic, automated, at scale',
        body:
          'Think of it like a burglar walking down a street trying every car door rather than picking a specific lock. Automated scanners crawl public code, ranges of internet addresses, and live sites nonstop, checking for known-easy mistakes. When they find one, they exploit it automatically. There is no judgment about whether your app is worth it — the cost of trying is near zero, so they try everything.',
        bullets: [
          'They are not "elite hackers" — they are scripts and bots running around the clock.',
          'They do not care how big or small you are; discovery is automated and indiscriminate.',
          'They go after known patterns, not clever custom attacks — which is exactly why AI tools\' predictable mistakes are so risky.',
        ],
      },
      {
        h2: 'How attackers actually find vibe-coded apps',
        body:
          'The common entry points map directly to the gaps AI tools leave behind:',
        bullets: [
          'Exposed keys in public code — bots continuously scan public GitHub repositories for secret keys, and a leaked key can be found and abused within minutes of being pushed. [SOURCE NEEDED]',
          'Open databases — scanners probe common endpoints (like Supabase\'s /rest/v1/ API) to see if a table returns data to a request with no login.',
          'Public storage buckets — crawlers look for readable file stores and guessable file URLs full of user uploads.',
          'Client-side-only permissions — anyone can open developer tools and call the same functions your app calls, bypassing checks that live only in the browser.',
          'Unverified payment webhooks — public webhook URLs get probed with forged "payment succeeded" messages to see if access is handed over for free.',
        ],
      },
      {
        h2: 'What they do once they are in',
        body:
          'The payoff is usually mundane and financial, not dramatic. With an exposed key, they run up your Stripe or AI-provider bill or drain your quota. With an open database, they copy your customer list — emails, names, whatever you store — which can lead to leaked data, extortion, or breach obligations. With a bypassed paywall, they simply use your product for free. None of this requires them to understand or care about your business; it is automated harvesting.',
      },
      {
        h2: 'The good news: the fixes are the same, and they are small',
        body:
          'Because the threat is opportunistic and pattern-based, you defend against it by closing the well-known gaps — not by hiring a security team. Turn on Row Level Security, move secrets to the server and rotate any that leaked, make uploads private, enforce permissions server-side, and verify your payment webhooks. Each is a small change, and together they take you out of the "unlocked door" category the scanners feed on. A scan can tell you which of these are open on your app right now and hand you the exact fix for each.',
      },
    ],
    keyTakeaways: [
      'AI-built apps can be hacked, but the real threat is automated, opportunistic scanning — not targeted expert attackers.',
      'Scanners crawl public code, address ranges, and live sites nonstop; being small or unknown does not protect you.',
      'The common entry points are exactly the gaps AI tools leave: exposed keys, open databases, public buckets, client-side auth, unverified webhooks.',
      'The payoff is usually financial or data theft, harvested automatically — not a dramatic, personal break-in.',
      'Because the attacks target known patterns, the defenses are a short, known list of small fixes.',
    ],
    faqs: [
      {
        q: 'My app is tiny and unknown — why would anyone bother?',
        a: 'Because no one is bothering with you specifically. Automated scanners test the whole internet indiscriminately, and trying your app costs them nothing. Obscurity is not protection when discovery is automated.',
      },
      {
        q: 'Do I need to worry about sophisticated, custom attacks?',
        a: 'Rarely at the early stage. The vast majority of real incidents for small AI-built apps come from opportunistic exploitation of common misconfigurations, not bespoke attacks. Close the common gaps first — that is where the risk actually is.',
      },
      {
        q: 'How would I even know if my app has been accessed?',
        a: 'Often you would not, at least not right away — data reads and paywall bypasses can leave little visible trace. That is why the practical approach is to close the known gaps proactively rather than wait for a sign.',
      },
      {
        q: 'What is the fastest way to stop being an easy target?',
        a: 'Check the highest-impact gaps first: make sure no private database table is readable without a login, and that no secret key is exposed in your front-end. Those two cover the most common automated attacks.',
      },
    ],
    related: [
      { label: 'How do I know if my Supabase database is exposed?', href: '/learn/how-do-i-know-if-my-supabase-database-is-exposed' },
      { label: 'How to check for exposed API keys', href: '/learn/how-to-check-for-exposed-api-keys' },
      { label: '7 security holes AI coding tools leave behind', href: '/learn/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'The complete security checklist for AI-built apps', href: '/learn/complete-security-checklist-for-ai-built-apps' },
    ],
    hasPlaceholders: true,
  },
];
