import type { Article } from './types';

/**
 * Security-hole library (/security/{slug}). Each article: plain-English question
 * H1 → direct quotable answer → what it is → why it matters → how to check →
 * how it happens in AI-built apps → the fix → sources. Every stat/CVE is real
 * and linked (see `sources`); no invented breaches.
 */
const SCAN_CTA = { label: 'Scan my app free', href: '/#scan' };

export const SECURITY_LIBRARY: Article[] = [
  /* ── Evergreen ───────────────────────────────────────────────── */
  {
    slug: 'exposed-api-keys',
    type: 'security',
    category: '// SECURITY',
    title: 'Exposed API keys & secrets in the browser',
    metaTitle: 'Exposed API Keys in AI-Built Apps: Find & Fix | Veilguard',
    metaDescription:
      'AI coding tools often ship secret API keys into the browser, where anyone can read them. Here is what that means, how to check your app in two minutes, and how to fix it.',
    keywords: ['exposed api keys', 'secret keys in browser', 'leaked api key', 'client-side secret'],
    h1: 'What does it mean when your API keys are exposed in the browser?',
    directAnswer:
      'An exposed API key is a secret credential that ended up in code your visitors can read. Anything shipped to the browser (page source, JavaScript bundle, or network requests) is public, so a leaked Stripe, OpenAI, or database key can be copied and used to run up your bill or reach your data. Secret keys must live only on the server.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'There are two kinds of keys: publishable keys, which are safe to expose (like a Stripe publishable key or a Supabase anon key), and secret keys, which are not. A secret key is like the master password for a service. If it appears anywhere the browser can see it, anyone who opens your app can take it.',
      },
      {
        h2: 'Why it matters to you',
        body: 'A leaked secret key lets a stranger spend your money and reach your data with your own permissions.',
        bullets: [
          'An OpenAI or cloud key can be used until your bill hits the limit.',
          'A Stripe secret key can read your customers and payments.',
          'A database service key can read or delete every row you have.',
        ],
      },
      {
        h2: 'How to tell if your app has it',
        body: 'You can check this yourself in about two minutes, no tools required.',
        numbered: true,
        bullets: [
          'Open your live app, then open developer tools (F12) and go to the Network tab.',
          'Reload the page and click through a few actions.',
          'Search the requests and the page source for "key", "secret", "sk_", "service_role", or "api". A secret key visible here is exposed.',
        ],
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'AI builders optimize for "it works," so they wire keys wherever the code runs, which is usually the browser. In Vite/Next.js apps, prefixing a variable with VITE_ or NEXT_PUBLIC_ ships it to the client. Tools like Bolt and v0 frequently do this with keys that should have stayed on the server.',
      },
      {
        h2: 'The fix',
        body: 'Move every secret key to the server and rotate anything that was exposed.',
        bullets: [
          'Delete the exposed key in the provider dashboard and issue a new one (assume the old one is compromised).',
          'Store secret keys in server-side environment variables, never in VITE_/NEXT_PUBLIC_ vars.',
          'Call paid or privileged services from a server route or edge function, not from the browser.',
        ],
        code: {
          label: 'Prompt for your AI tool',
          content:
            'Find every API key in this project that is exposed to the browser (including VITE_ and NEXT_PUBLIC_ env vars). Move all secret keys to server-side environment variables and call those services from a server route instead of the client. List which keys need rotating.',
        },
      },
    ],
    keyTakeaways: [
      'Anything the browser can load is public, including keys in your JS bundle or network calls.',
      'Publishable/anon keys are fine to expose; secret/service keys are not.',
      'If a secret key was ever exposed, rotate it, moving it is not enough.',
    ],
    faqs: [
      { q: 'Is the Supabase anon key safe to expose?', a: 'Yes. The anon key is designed to be public, but it is only safe if your Row-Level Security policies are correct, because that key is what the browser uses to query your database.' },
      { q: 'How do I know which keys are secret?', a: 'As a rule: keys that start with sk_, service_role, or are labelled "secret"/"private" in the provider dashboard must stay server-side. Keys labelled "publishable", "public", or "anon" are safe in the browser.' },
    ],
    related: [
      { label: 'How to check for exposed API keys', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: 'Bolt security scanner', href: '/scanners/bolt' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'Stripe: API keys (keep secret keys server-side)', href: 'https://docs.stripe.com/keys' },
      { label: 'Supabase: understanding API keys (anon vs service_role)', href: 'https://supabase.com/docs/guides/api/api-keys' },
    ],
  },

  {
    slug: 'open-database-rls',
    type: 'security',
    category: '// SECURITY',
    title: 'Public databases & missing Row-Level Security',
    metaTitle: 'Public Database / Missing RLS: Is Your Data Open? | Veilguard',
    metaDescription:
      'If Row-Level Security is off, anyone with your public key can read your whole database. Here is what RLS is, how to tell if your app is exposed, and how to lock it down.',
    keywords: ['missing row level security', 'public database', 'supabase RLS', 'open database', 'RLS not enabled'],
    h1: 'What happens if your database has no Row-Level Security?',
    directAnswer:
      'Without Row-Level Security (RLS), any table your app can reach is readable by anyone holding your public API key, which sits in the browser. That means a stranger can pull your entire user list, orders, and messages without logging in. RLS is the rule layer that decides who can see which rows; if it is off, the answer is "everyone."',
    readMinutes: 6,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Supabase and Firebase talk to the browser directly using a public key. Row-Level Security (Supabase) and Security Rules (Firebase) are the gate that decides which rows each request may read or write. Turn the gate off and the public key becomes a key to everything.',
      },
      {
        h2: 'Why it matters to you',
        body: 'This is the single most damaging mistake in AI-built apps. CVE-2025-48757 (CVSS 9.3) showed 170+ Lovable-built apps left readable because RLS was never enabled, exposing full user lists, payment records, and API keys to anyone who opened developer tools.',
      },
      {
        h2: 'How to tell if your app has it',
        numbered: true,
        bullets: [
          'Open your app, press F12, and watch the Network tab for requests to *.supabase.co or firestore.',
          'If rows come back before you log in, those tables are public.',
          'In Supabase, the dashboard shows an "RLS disabled" warning on any unprotected table.',
        ],
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'Supabase ships new tables with RLS off so you can prototype fast, and AI builders rarely turn it on or write correct policies. Two policies look safe but are not: USING(true) allows everyone, and auth.uid() IS NOT NULL allows any logged-in user to read everyone else’s rows.',
      },
      {
        h2: 'The fix',
        body: 'Enable RLS on every table and write policies that scope rows to their owner.',
        code: {
          label: 'Supabase: lock a table to its owner',
          content:
            'alter table orders enable row level security;\n\ncreate policy "own rows" on orders\n  for select using ( auth.uid() = user_id );',
        },
        note: 'Repeat for insert/update/delete, and for every table. A table with RLS enabled but no policy denies all access by default, which is safe.',
      },
    ],
    keyTakeaways: [
      'The public/anon key is only safe when RLS is correct, it is not a secret.',
      'USING(true) and auth.uid() IS NOT NULL are the two "looks fine, is not" policies.',
      'Enable RLS on every table; scope rows with auth.uid() = user_id.',
    ],
    faqs: [
      { q: 'Is Supabase insecure?', a: 'No. Supabase is secure by design, but only if you enable RLS and write correct policies. The defaults are permissive so you can build quickly, which is exactly the step AI builders skip.' },
      { q: 'How do I know which tables are open?', a: 'The Supabase dashboard flags tables with RLS disabled. Veilguard also probes what your public key can actually reach from the outside and lists every open table with the SQL to fix it.' },
    ],
    related: [
      { label: 'Supabase Row-Level Security, explained for non-developers', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
      { label: 'How do I know if my Supabase database is exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
      { label: 'Supabase security checker', href: '/scanners/supabase' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'Supabase: Row Level Security (official docs)', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
      { label: 'CVE-2025-48757: missing RLS exposed 170+ AI-built apps (CVSS 9.3)', href: 'https://securityonline.info/cve-2025-48757-lovables-row-level-security-breakdown-exposes-sensitive-data-across-hundreds-of-projects/' },
    ],
  },

  {
    slug: 'idor',
    type: 'security',
    category: '// SECURITY',
    title: 'Broken access control / IDOR (reading other users’ data)',
    metaTitle: 'IDOR & Broken Access Control in AI Apps | Veilguard',
    metaDescription:
      'IDOR lets a user change an id in a URL or request and read someone else’s data. Here is what it is, how to test for it, and how to fix it in an AI-built app.',
    keywords: ['IDOR', 'broken access control', 'insecure direct object reference', 'read other users data'],
    h1: 'What is IDOR (broken access control) and does your app have it?',
    directAnswer:
      'IDOR (Insecure Direct Object Reference) is when changing an id in a request lets you read or edit data that is not yours, for example switching /invoice/123 to /invoice/124 and seeing another customer’s invoice. It happens when the server returns records by id without checking that the record belongs to the person asking.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Broken access control is the number-one risk in the OWASP Top 10. IDOR is its most common everyday form: the app trusts the id in the request and forgets to ask "is this yours?" Because ids are often sequential, an attacker just counts up.',
      },
      {
        h2: 'Why it matters to you',
        body: 'One curious user with your app open can walk through every record you have: orders, messages, profiles, uploaded files. No special tools, just editing a number.',
      },
      {
        h2: 'How to tell if your app has it',
        numbered: true,
        bullets: [
          'Log in as yourself and open something with an id in the URL or request (an order, a profile, a file).',
          'Change the id to a nearby number.',
          'If you can see someone else’s data, you have IDOR.',
        ],
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'AI builders generate endpoints that fetch by id and stop there, because that is enough to "work." On Supabase/Firebase, the same gap appears as a missing ownership check in the row policy, letting any logged-in user read every row.',
      },
      {
        h2: 'The fix',
        body: 'Always scope every read and write to the current user on the server.',
        bullets: [
          'In your API, filter by the authenticated user id, never trust an id from the request alone.',
          'In Supabase, use a policy like using ( auth.uid() = user_id ) instead of auth.uid() IS NOT NULL.',
          'Prefer non-sequential ids (UUIDs) so records are not guessable, as defense in depth, not the primary fix.',
        ],
      },
    ],
    keyTakeaways: [
      'IDOR = the server returns records by id without checking ownership.',
      'Test it by changing an id and seeing if you can read someone else’s data.',
      'Fix it by scoping every query to the logged-in user on the server.',
    ],
    faqs: [
      { q: 'Is IDOR the same as missing RLS?', a: 'They are closely related. Missing RLS is IDOR at the database layer: any logged-in user can read any row. The fix is the same idea, check ownership, not just "is logged in".' },
    ],
    related: [
      { label: 'Public databases & missing Row-Level Security', href: '/security/open-database-rls' },
      { label: 'Weak or missing authentication', href: '/security/broken-auth' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'OWASP Top 10: A01 Broken Access Control', href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/' },
    ],
  },

  {
    slug: 'unverified-webhooks',
    type: 'security',
    category: '// SECURITY',
    title: 'Fake "payment succeeded" / unverified webhooks',
    metaTitle: 'Unverified Webhooks: Fake Payments in AI Apps | Veilguard',
    metaDescription:
      'If your payment webhook does not verify its signature, anyone can fake a "payment succeeded" event and unlock paid features for free. Here is how to check and fix it.',
    keywords: ['unverified webhook', 'fake payment', 'stripe webhook signature', 'webhook security'],
    h1: 'Can someone fake a payment on your app with an unverified webhook?',
    directAnswer:
      'Yes. If your payment webhook accepts any request without verifying the provider’s signature, anyone can send a fake "payment succeeded" event and unlock paid features without paying. The fix is to verify the signature on every webhook using your provider’s signing secret before you trust the event.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'A webhook is a message your payment provider (Stripe, Paystack) sends your server to say "this order was paid." Your app then grants access. If the endpoint does not check that the message really came from the provider, a stranger can send the same message themselves.',
      },
      {
        h2: 'Why it matters to you',
        body: 'Free lifetime access for anyone who reads your API docs, plus fake orders polluting your data and revenue you never actually collected.',
      },
      {
        h2: 'How to tell if your app has it',
        body: 'Look at your webhook handler. If it reads the event body and grants access without a signature-verification step (Stripe’s constructEvent with your signing secret, for example), it is unverified.',
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'AI builders wire the happy path, receive event, mark as paid, because that demos correctly. Signature verification is an extra step the prompt never asked for, so it is skipped.',
      },
      {
        h2: 'The fix',
        body: 'Verify every webhook signature before acting on it, and only grant access on verified, expected event types.',
        code: {
          label: 'Stripe: verify the signature',
          content:
            "const event = stripe.webhooks.constructEvent(\n  rawBody, // the raw request body, not parsed JSON\n  req.headers['stripe-signature'],\n  process.env.STRIPE_WEBHOOK_SECRET,\n); // throws if the signature is invalid",
        },
        note: 'Also make the handler idempotent (ignore duplicate event ids) so a replayed event cannot double-grant.',
      },
    ],
    keyTakeaways: [
      'An unverified webhook lets anyone fake a paid event.',
      'Verify the signature with your provider’s signing secret before trusting any event.',
      'Grant access only on verified, expected event types, and dedupe by event id.',
    ],
    faqs: [
      { q: 'Isn’t the webhook URL secret enough?', a: 'No. URLs leak, and attackers guess predictable paths. Only a verified signature proves the event genuinely came from your payment provider.' },
    ],
    related: [
      { label: 'Is it safe to take payments on a vibe-coded app?', href: '/guides/is-it-safe-to-take-payments-on-a-vibe-coded-app' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'Stripe: check webhook signatures', href: 'https://docs.stripe.com/webhooks#verify-events' },
    ],
  },

  {
    slug: 'public-storage-buckets',
    type: 'security',
    category: '// SECURITY',
    title: 'Public file storage / leaked uploads',
    metaTitle: 'Public Storage Buckets: Leaked Uploads in AI Apps | Veilguard',
    metaDescription:
      'A public storage bucket exposes every file your users upload, often with no link required. Here is how to tell if yours is open and how to make it private.',
    keywords: ['public storage bucket', 'leaked uploads', 'supabase storage', 'firebase storage rules'],
    h1: 'Are the files your users upload sitting in a public bucket?',
    directAnswer:
      'If your storage bucket is public, every file uploaded to it, ID photos, invoices, private images, can be listed or downloaded by anyone, often without even a link. Storage should be private by default, with signed URLs or per-user rules controlling who can read each file.',
    readMinutes: 4,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Supabase Storage and Firebase Storage hold user uploads. A "public" bucket serves any file to anyone who has (or guesses) its path. A private bucket only serves files through rules or short-lived signed URLs.',
      },
      {
        h2: 'Why it matters to you',
        body: 'People upload sensitive things: government IDs, receipts, personal photos. A public bucket turns that into a folder anyone can browse, the kind of leak that ends up dumped online.',
      },
      {
        h2: 'How to tell if your app has it',
        numbered: true,
        bullets: [
          'Find a file URL your app loads (right-click an image, "copy image address").',
          'Open it in a private/incognito window while logged out.',
          'If it loads, the bucket is public. Try editing the path to guess other files.',
        ],
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'Making the bucket public is the fastest way to get an uploaded image to display, so that is what AI builders do. Private buckets with signed URLs take an extra step the tool skips.',
      },
      {
        h2: 'The fix',
        bullets: [
          'Make buckets private by default.',
          'Serve files through signed URLs (Supabase createSignedUrl) or per-user Storage rules (Firebase).',
          'Never rely on an unguessable path as the only protection.',
        ],
      },
    ],
    keyTakeaways: [
      'Public buckets expose every file, often without a link.',
      'Test by opening a file URL while logged out in incognito.',
      'Make storage private and serve files via signed URLs or per-user rules.',
    ],
    faqs: [
      { q: 'What about profile pictures that should be public?', a: 'Genuinely public assets (like a logo) are fine in a public bucket. The rule is: anything tied to a specific user or private by nature belongs in a private bucket with access control.' },
    ],
    related: [
      { label: 'Public databases & missing Row-Level Security', href: '/security/open-database-rls' },
      { label: 'Firebase security checker', href: '/scanners/firebase' },
      { label: 'Supabase security checker', href: '/scanners/supabase' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'Supabase Storage: access control', href: 'https://supabase.com/docs/guides/storage/security/access-control' },
      { label: 'Firebase Storage: security rules', href: 'https://firebase.google.com/docs/storage/security' },
    ],
  },

  {
    slug: 'sql-injection',
    type: 'security',
    category: '// SECURITY',
    title: 'SQL injection, in plain English',
    metaTitle: 'SQL Injection Explained for Non-Developers | Veilguard',
    metaDescription:
      'SQL injection lets an attacker rewrite your database query by typing into a form. Here is what it is in plain English, whether AI-built apps are at risk, and how to prevent it.',
    keywords: ['sql injection', 'sqli', 'database injection', 'parameterized queries'],
    h1: 'What is SQL injection, and can it happen to an AI-built app?',
    directAnswer:
      'SQL injection is when user input is pasted straight into a database query, letting an attacker rewrite that query, to dump, change, or delete data, just by typing the right thing into a form or URL. It is prevented by using parameterized queries so input is always treated as data, never as commands.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Think of a query as a sentence the database obeys. If your app builds that sentence by gluing in whatever the user typed, a clever user can add their own clauses, and the database will obey those too.',
      },
      {
        h2: 'Why it matters to you',
        body: 'A single crafted request can dump your entire database, or wipe it. It is one of the oldest and most damaging web vulnerabilities.',
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'If you use Supabase or Firebase client libraries as intended, you are mostly protected, they parameterize for you. The risk shows up when AI writes custom SQL, database functions, or a raw query that concatenates user input as a string.',
      },
      {
        h2: 'The fix',
        bullets: [
          'Always use parameterized queries / prepared statements, never string-concatenate user input into SQL.',
          'Use your ORM or the Supabase/Firebase client query builders rather than hand-built SQL strings.',
          'Validate and constrain inputs (type, length, allowed values) as an extra layer.',
        ],
        code: {
          label: 'Do this, not string concatenation',
          content:
            "// unsafe: `select * from users where email = '${email}'`\n// safe (parameterized):\nselect * from users where email = $1;  -- pass `email` as a bound parameter",
        },
      },
    ],
    keyTakeaways: [
      'SQL injection = user input treated as commands instead of data.',
      'Client libraries (Supabase/Firebase) parameterize for you; raw SQL from AI is the risk.',
      'Always parameterize; never glue user input into a query string.',
    ],
    faqs: [
      { q: 'Am I safe because I use Supabase?', a: 'Mostly, as long as you use the query builder. If your app or a database function runs raw SQL built from user input, injection is still possible.' },
    ],
    related: [
      { label: 'The 7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Public databases & missing Row-Level Security', href: '/security/open-database-rls' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'OWASP: SQL Injection', href: 'https://owasp.org/www-community/attacks/SQL_Injection' },
    ],
  },

  {
    slug: 'broken-auth',
    type: 'security',
    category: '// SECURITY',
    title: 'Weak or missing authentication',
    metaTitle: 'Broken Authentication in AI-Built Apps | Veilguard',
    metaDescription:
      'When the "are you allowed?" check runs in the browser, the visitor holds the key. Here is how broken auth shows up in AI-built apps and how to fix it.',
    keywords: ['broken authentication', 'client-side auth', 'missing authorization', 'auth bypass'],
    h1: 'Why is client-side authentication a security hole?',
    directAnswer:
      'Because anything that runs in the browser can be changed by the user. If your app decides "is this person allowed?" in front-end code, a visitor can flip that decision, unlocking paid features or admin pages, by editing a value in developer tools. Every real permission check must happen on the server.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Authentication is "who are you"; authorization is "what are you allowed to do." Broken auth is when either check is missing, or done somewhere the user controls (the browser).',
      },
      {
        h2: 'Why it matters to you',
        body: 'People bypass your paywall by editing one value in the console, and you keep the users but lose the revenue. In worse cases, an ordinary user reaches admin functions.',
      },
      {
        h2: 'How to tell if your app has it',
        numbered: true,
        bullets: [
          'Find a paid or admin-only feature.',
          'Open developer tools and look for a flag like isPro or isAdmin in state or local storage.',
          'If flipping it unlocks the feature, your access check is client-side and broken.',
        ],
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'Hiding a button when isPro is false looks like it "gates" the feature, so AI builders stop there. But hiding the button does not protect the data or action behind it, the server still answers anyone who asks.',
      },
      {
        h2: 'The fix',
        bullets: [
          'Enforce every permission on the server (API route, edge function, or database policy), not in the UI.',
          'Treat the front-end as a convenience only; assume users can send any request they like.',
          'Use your auth provider’s session on the server to check both identity and role on each request.',
        ],
      },
    ],
    keyTakeaways: [
      'The browser is controlled by the user; front-end checks are not security.',
      'Hiding a button is not gating a feature, the server must enforce it.',
      'Check identity and permission on the server for every sensitive request.',
    ],
    faqs: [
      { q: 'Do I still need front-end checks?', a: 'Yes, for user experience (hiding what someone cannot use). Just never rely on them for security, the server must independently enforce the same rule.' },
    ],
    related: [
      { label: 'Broken access control / IDOR', href: '/security/idor' },
      { label: 'Can someone hack an app built with AI?', href: '/security/can-someone-hack-an-app-built-with-ai' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'OWASP Top 10: A07 Identification and Authentication Failures', href: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/' },
    ],
  },

  {
    slug: 'security-headers-cors',
    type: 'security',
    category: '// SECURITY',
    title: 'Missing security headers & open CORS',
    metaTitle: 'Security Headers & Open CORS in AI Apps | Veilguard',
    metaDescription:
      'Missing security headers and a wide-open CORS policy let other sites attack your users. Here is what they are, why they matter, and the safe settings.',
    keywords: ['security headers', 'open CORS', 'CORS misconfiguration', 'HSTS', 'content security policy'],
    h1: 'What do missing security headers and open CORS actually expose?',
    directAnswer:
      'Security headers tell the browser how to protect your users (force HTTPS, block clickjacking, restrict scripts). CORS decides which other websites may call your API. Missing headers and a wildcard CORS policy (Access-Control-Allow-Origin: *) let a stranger’s site act against your API on behalf of your logged-in users.',
    readMinutes: 4,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What it is',
        body: 'Headers like HSTS, X-Frame-Options/frame-ancestors, and Content-Security-Policy are instructions the browser follows to reduce attacks. CORS is a separate control listing which origins may call your API from a browser.',
      },
      {
        h2: 'Why it matters to you',
        body: 'A wide-open CORS policy means any website can make authenticated requests to your API using your users’ sessions. Missing HSTS allows downgrade attacks; missing frame protection allows clickjacking.',
      },
      {
        h2: 'How it happens in AI-built apps',
        body: 'CORS is often set to * to "make the API work" during development and never tightened. Security headers are simply never added, because the app functions perfectly without them.',
      },
      {
        h2: 'The fix',
        bullets: [
          'Set CORS to an explicit allow-list of your own domains, never * for authenticated APIs.',
          'Add HSTS, X-Content-Type-Options: nosniff, and a frame-ancestors / X-Frame-Options policy.',
          'Add a Content-Security-Policy to limit which scripts can run.',
        ],
      },
    ],
    keyTakeaways: [
      'Access-Control-Allow-Origin: * on an authenticated API lets any site abuse your users’ sessions.',
      'Restrict CORS to your own domains.',
      'Add HSTS, frame protection, nosniff, and a CSP.',
    ],
    faqs: [
      { q: 'Are security headers really necessary for a small app?', a: 'Yes. They are free, quick to add, and close whole classes of attack. Attackers scan for missing headers first because they signal an app nobody hardened.' },
    ],
    related: [
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: 'Weak or missing authentication', href: '/security/broken-auth' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'MDN: Cross-Origin Resource Sharing (CORS)', href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
      { label: 'OWASP Secure Headers Project', href: 'https://owasp.org/www-project-secure-headers/' },
    ],
  },

  /* ── Trending (verified sources) ─────────────────────────────── */
  {
    slug: 'lovable-rls-cve',
    type: 'security',
    category: '// SECURITY',
    title: 'The Lovable RLS exposure explained (CVE-2025-48757)',
    metaTitle: 'CVE-2025-48757: The Lovable RLS Exposure | Veilguard',
    metaDescription:
      'CVE-2025-48757 exposed 170+ Lovable-built apps because Row-Level Security was off by default. Here is what happened, whether your app is affected, and how to fix it.',
    keywords: ['CVE-2025-48757', 'Lovable RLS', 'Lovable vulnerability', 'Lovable Supabase exposure'],
    h1: 'What was CVE-2025-48757, the Lovable RLS exposure?',
    directAnswer:
      'CVE-2025-48757 (CVSS 9.3) was a critical exposure disclosed in 2025 where Lovable generated Supabase projects with Row-Level Security disabled by default. Because the public anon key sits in the browser, unauthenticated attackers could read and write data across 170+ live apps, dumping user lists, payment records, and API keys, without logging in.',
    readMinutes: 5,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What happened',
        body: 'Researchers found that Lovable-built apps were shipping Supabase schemas without enabling Row-Level Security. The public anon key embedded in every app let anyone query the database directly. Over 170 production apps were confirmed exposed.',
      },
      {
        h2: 'Why it mattered',
        body: 'With RLS off, "log in" was optional. Anyone who opened developer tools could see the API key and read every row in every unprotected table, full user lists, payment records, and secrets included.',
      },
      {
        h2: 'Are you affected?',
        numbered: true,
        bullets: [
          'If you built with Lovable (or any tool on Supabase) before mid-2025 and never reviewed RLS, assume you may be.',
          'Open your app, press F12, and check the Network tab: if Supabase returns data before you log in, you are exposed.',
          'In the Supabase dashboard, look for tables flagged "RLS disabled".',
        ],
      },
      {
        h2: 'The fix',
        body: 'Enable Row-Level Security on every table and add owner-scoped policies (see our RLS guide). Rotate any secrets that were reachable while the tables were open.',
      },
    ],
    keyTakeaways: [
      'CVE-2025-48757 (CVSS 9.3) exposed 170+ Lovable apps via missing RLS.',
      'The public anon key made every unprotected table readable without login.',
      'Fix: enable RLS + owner-scoped policies on every table, and rotate exposed secrets.',
    ],
    faqs: [
      { q: 'Is Lovable safe to use now?', a: 'Lovable is a tool; safety depends on your database rules. Whatever you build on Supabase, you must enable RLS and write correct policies, that responsibility sits with the app owner, not the builder.' },
    ],
    related: [
      { label: 'Public databases & missing Row-Level Security', href: '/security/open-database-rls' },
      { label: 'Supabase Row-Level Security, explained for non-developers', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
      { label: 'Lovable security scanner', href: '/scanners/lovable' },
    ],
    builder: { label: 'Scan my Lovable app', href: '/scanners/lovable' },
    sources: [
      { label: 'CVE-2025-48757: Lovable RLS breakdown (CVSS 9.3, 170+ apps)', href: 'https://securityonline.info/cve-2025-48757-lovables-row-level-security-breakdown-exposes-sensitive-data-across-hundreds-of-projects/' },
      { label: 'Superblocks: how 170+ Lovable apps were exposed', href: 'https://www.superblocks.com/blog/lovable-vulnerabilities' },
    ],
  },

  {
    slug: 'ai-code-vulnerability-rate',
    type: 'security',
    category: '// SECURITY',
    title: 'Why ~45% of AI-generated code ships insecure',
    metaTitle: 'Why 45% of AI-Generated Code Is Insecure | Veilguard',
    metaDescription:
      'Veracode’s 2025 research found AI models pick the insecure way to write code 45% of the time. Here is what that means for your app and what to do about it.',
    keywords: ['AI generated code security', 'insecure AI code', 'Veracode AI report', 'vibe coding security'],
    h1: 'Why does so much AI-generated code ship with security holes?',
    directAnswer:
      'Veracode’s 2025 GenAI Code Security Report found that when there is a secure and an insecure way to write something, AI models choose the insecure one 45% of the time, across 80 tasks and 100+ models. AI is trained to produce code that works, not code that is safe, and getting bigger has not fixed it.',
    readMinutes: 4,
    updated: '2026-08-11',
    sections: [
      {
        h2: 'What the research found',
        body: 'Across 80 curated tasks and more than 100 large language models, models picked the insecure implementation 45% of the time. For cross-site scripting specifically, they failed to defend against it in 86% of relevant samples. Security performance stayed flat regardless of model size, even as functional correctness improved.',
      },
      {
        h2: 'Why it happens',
        body: 'Models learn from vast amounts of public code, much of which is insecure, and they optimize for "does it run," not "is it safe." Veracode also reports AI-generated code carries about 2.74x more vulnerabilities than human-written code.',
      },
      {
        h2: 'What it means for your app',
        body: 'If you shipped a vibe-coded app without a security review, the base rate says roughly half the security-relevant decisions may have gone the wrong way. That is not a reason to stop building with AI, it is a reason to check the output.',
      },
      {
        h2: 'What to do about it',
        bullets: [
          'Run a security scan before you take real users or payments.',
          'Focus first on the highest-impact holes: RLS, exposed keys, access control, payments.',
          'Use the fix, not just the finding, apply the exact change and re-scan.',
        ],
      },
    ],
    keyTakeaways: [
      'AI picks the insecure option 45% of the time (Veracode 2025).',
      'AI-generated code has ~2.74x more vulnerabilities than human code.',
      'Bigger models did not get safer, review the output before launch.',
    ],
    faqs: [
      { q: 'Should I stop using AI to build?', a: 'No. AI is great for shipping fast. The takeaway is to add one step, a security check, before real users or payments, because the tool will not do it for you.' },
    ],
    related: [
      { label: 'The 7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Are AI-generated apps safe to launch?', href: '/guides/are-ai-generated-apps-safe-to-launch' },
    ],
    builder: SCAN_CTA,
    sources: [
      { label: 'Veracode 2025 GenAI Code Security Report', href: 'https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/' },
      { label: 'Veracode press release: AI code insecure in ~45% of tasks', href: 'https://www.businesswire.com/news/home/20250730694951/en/AI-Generated-Code-Poses-Major-Security-Risks-in-Nearly-Half-of-All-Development-Tasks-Veracode-Research-Reveals' },
    ],
  },
];
