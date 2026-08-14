import type { Article } from './types';

/**
 * In-depth guides ("// GUIDE"). These are the deepest pages in the library:
 * long-form, genuinely usable walkthroughs for non-technical founders who
 * built an app with an AI tool (Lovable, Bolt, Cursor, Replit, v0) on a
 * Supabase/Firebase + Stripe + Next.js stack.
 *
 * ACCURACY: no invented stats, breaches, or named incidents. Anywhere a real
 * citation belongs, the literal token `[SOURCE NEEDED]` appears inline and the
 * article carries `hasPlaceholders: true`.
 */
export const GUIDES: Article[] = [
  // 1 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'complete-security-checklist-for-ai-built-apps',
    type: 'guide',
    category: '// GUIDE',
    title: 'The complete security checklist for AI-built apps',
    metaTitle: 'Security Checklist for AI-Built Apps | Veilguard',
    metaDescription:
      'A real, work-through security checklist for apps built with Lovable, Bolt, Cursor, Replit or v0, database, keys, auth, payments, storage, CORS and git.',
    keywords: [
      'ai app security checklist',
      'vibe coding security checklist',
      'lovable security checklist',
      'supabase security checklist',
      'launch security checklist',
      'secure ai built app',
    ],
    h1: 'The complete security checklist for AI-built apps',
    directAnswer:
      'Work through these eight areas in order, database access, secrets and API keys, authentication, payments and webhooks, storage buckets, CORS and headers, dependencies, and git history. For each item, this guide tells you what to check, how to tell if it is wrong, and the direction of the fix. You do not need a security background; you need about an hour and the willingness to open your project settings and your browser network tab.',
    readMinutes: 11,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'How to use this checklist',
        body:
          "AI coding tools like Lovable, Bolt, Cursor, Replit and v0 write code that works on the first try, which is exactly why security gaps hide so well. Nothing looks broken. The app loads, sign-up works, payments go through. The holes only show up when someone opens the browser's network tab or points a script at your database.\n\nThis checklist is ordered by blast radius: the earlier items are the ones that leak the most data or cost the most money when they go wrong. Do them top to bottom. For each item you will (1) check one specific thing, (2) look for one specific warning sign, and (3) move in one clear fix direction. If you get stuck on the fix, that is normal, knowing the hole exists is most of the battle, and a scan can hand you the exact code or SQL to paste.",
        note:
          'This is a black-box checklist you can run against a live app without touching the codebase. A connected (white-box) scan of the repo will catch more, but everything here is checkable by hand.',
      },
      {
        h2: 'The checklist',
        numbered: true,
        bullets: [
          'Database access (Supabase RLS / Firebase rules). Check: is Row Level Security ON for every table in Supabase, or are your Firestore/RTDB rules anything other than "allow read, write: if false" by default? Wrong if: RLS is off, or a policy uses "using (true)", or Firebase rules say "allow read, write: if true". How to tell: in Supabase, the Table Editor flags tables with RLS disabled; you can also hit your REST endpoint with just the anon key and see if rows come back. Fix direction: turn RLS on for every table and add a policy that ties each row to "auth.uid() = user_id"; in Firebase, scope every rule to "request.auth != null" and to the owner.',
          'Secrets and API keys. Check: which keys are reachable from the browser? Wrong if: any secret key (service_role, a Stripe "sk_" key, an OpenAI key, an SMTP password) appears in your frontend code, in a variable prefixed "NEXT_PUBLIC_", or in the built JavaScript bundle. How to tell: open your live site, view source / open the network tab, and search the JS for "sk_", "service_role", and "secret". Fix direction: any secret that shows up must be rotated (regenerated) and moved to server-side environment variables or an edge/serverless function; only publishable keys (Stripe "pk_", Supabase "anon") belong in the browser.',
          'Authentication and access control. Check: are the checks that decide "can this user see or do this?" running on the server, or in the browser? Wrong if: an admin page or a paid feature is hidden only by frontend code (a hidden button, a redirect, a conditional render). How to tell: log in as a normal user and try to reach a protected URL directly, or tamper with the request in the network tab. Fix direction: enforce every permission on the server (RLS, Firebase rules, or a check inside your API route), never trust the browser to police itself.',
          'Payments and webhooks (Stripe / Polar). Check: does your payment webhook verify the signature of every incoming event? Wrong if: your webhook route accepts any POST and grants access or credits without verifying the "stripe-signature" (or provider) header against your signing secret. How to tell: look at your webhook handler for a "constructEvent" / signature-verification step; if it is missing, anyone who finds the URL can fake a "payment succeeded" event. Fix direction: verify the signature with your webhook signing secret before trusting the event, and confirm the amount and currency match what you expect.',
          'Storage buckets (Supabase Storage / Firebase Storage). Check: are your file buckets public, and are upload/download rules scoped to the owner? Wrong if: a bucket is set to public and holds anything private (IDs, invoices, user uploads), or storage rules allow any authenticated user to read any file. How to tell: try opening a stored file URL in an incognito window with no login. Fix direction: make private buckets private, serve files through signed URLs, and scope storage policies to the file owner.',
          'CORS and security headers. Check: does your API allow requests from any origin? Wrong if: responses send "Access-Control-Allow-Origin: *" on authenticated endpoints, or you are missing basic headers. How to tell: inspect an API response in the network tab and look at the "access-control-allow-origin" value. Fix direction: restrict CORS to your own domain(s), and add standard headers (HSTS, X-Content-Type-Options, a Content-Security-Policy), most hosts let you set these in one config file.',
          'Dependencies. Check: are your packages up to date and free of known-vulnerable versions? Wrong if: "npm audit" reports high or critical issues, or your lockfile is months stale. How to tell: run "npm audit" (or "pnpm audit") in your project. Fix direction: update the flagged packages, prioritising anything in your auth, payments, or server code; re-run until high/critical are clear.',
          'Git history and committed files. Check: did a real ".env" file, a private key, or a credentials file ever get committed? Wrong if: your commit history contains an ".env" with real values, a service-account JSON, or a key, even if you later deleted it. How to tell: search your history ("git log -p -S sk_" or scan the repo with a secret scanner); GitHub also emails you secret-scanning alerts. Fix direction: rotate every exposed secret first (deleting the file does not un-leak it), then purge it from history and make sure ".env" is in ".gitignore".',
        ],
      },
      {
        h2: 'Database access is where most of the damage happens',
        body:
          'If you only fix one thing, fix this one. In a Supabase app, your database is reachable over the internet with the public "anon" key that ships in your frontend, that is by design, and it is safe only when Row Level Security (RLS) is turned on and every table has a policy. With RLS off (or a policy of "using (true)"), the anon key can read and write every row in the table. Firebase has the same shape: open rules ("allow read, write: if true") mean anyone can read your whole database.\n\nThe reason this bites AI-built apps specifically is that the fastest way to make a feature "work" during building is to loosen the rules, and AI tools, or the founder following their suggestion, often do exactly that and never tighten them back up. The app keeps working, so nothing signals that the front door is open.',
        note:
          'If you take payments or store any personal data, treat an RLS/rules failure as an emergency, not a to-do, this is the item most likely to expose customer records.',
      },
      {
        h2: 'The five-minute browser test anyone can run',
        body:
          'You can catch several of these holes without reading any code. On your live site: open your browser, right-click, choose "Inspect", and go to the "Network" tab. Then use the app normally, sign up, log in, load your dashboard.\n\nWatch the requests. If you see your database responding with rows of data to a request that only carries the public key, check whether it is returning other people\'s data too. Search the loaded JavaScript (the "Sources" tab) for "sk_", "service_role", and "secret", none of those should ever appear. Try opening a stored file link in a private window. Try visiting an admin or paid URL as a logged-out or basic user. Each of these maps directly to a checklist item above.',
      },
      {
        h2: 'What to do after you find something',
        body:
          'Do not panic and do not try to fix everything at once. Work in this order: first rotate any exposed secret (an exposed key stays dangerous until it is regenerated), then close database and storage access, then move auth and payment checks to the server, then handle CORS, dependencies, and git history.\n\nWrite down what you found and what you changed. When you re-test, use the same five-minute browser test, if the rows stop coming back, the keys are gone from the bundle, and the protected URLs bounce you, you have made real progress. A scan is the fastest way to both find the remaining items and get the exact fix for each one.',
      },
    ],
    keyTakeaways: [
      'Work the eight areas in order of blast radius: database, secrets, auth, payments, storage, CORS/headers, dependencies, git history.',
      'Database access (Supabase RLS / Firebase rules) is the highest-stakes item, an open database exposes every customer record.',
      'The public "anon"/publishable key in your browser is safe only when Row Level Security or Firebase rules are correctly locked down.',
      'Every permission and payment check must run on the server; anything enforced only in the browser can be bypassed.',
      'A five-minute browser network-tab test catches exposed keys, open databases, public files, and client-side-only auth without reading code.',
      'An exposed secret stays dangerous until you rotate it, deleting the file or the commit does not undo the leak.',
    ],
    faqs: [
      {
        q: 'Do I need to be able to code to use this checklist?',
        a: 'No. Every item has a check you can run from your browser or your project settings, and a fix direction described in plain English. You will need help (or a scan that hands you the code) to apply some fixes, but you can find every issue yourself.',
      },
      {
        q: 'How long should this take?',
        a: 'Budget about an hour for a first pass on a small app. The browser tests take five minutes; the database and payments items take the most time because they matter the most.',
      },
      {
        q: 'My app has been live for months, is it too late to check?',
        a: 'No, and it is more important, not less. If a hole has been open while you had real users, checking now tells you what to fix and, in the worst cases, whether you need to rotate keys or notify customers. Sooner is always better than later.',
      },
      {
        q: 'What is the single most important item?',
        a: 'Database access. Supabase RLS turned off, or Firebase rules left open, is the fastest way to leak every customer record, start there.',
      },
    ],
    related: [
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'How to secure your app before launch', href: '/guides/how-to-secure-your-app-before-launch' },
      { label: 'Security checks before launching your SaaS', href: '/guides/security-checks-before-launching-your-saas' },
      { label: 'How do I know if my Supabase database is exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
    ],
    hasPlaceholders: false,
  },

  // 2 ────────────────────────────────────────────────────────────────────────
  {
    slug: '7-security-holes-ai-coding-tools-leave-behind',
    type: 'guide',
    category: '// GUIDE',
    title: '7 security holes AI coding tools leave behind',
    metaTitle: '7 Security Holes AI Coding Tools Leave | Veilguard',
    metaDescription:
      'The seven security holes Lovable, Bolt, Cursor, Replit and v0 quietly ship, what each one is, why AI tools cause it, what it costs, and how to fix it.',
    keywords: [
      'ai coding security holes',
      'lovable security issues',
      'bolt security problems',
      'vibe coding vulnerabilities',
      'ai generated code security',
      'common ai app vulnerabilities',
    ],
    h1: '7 security holes AI coding tools leave behind',
    directAnswer:
      'AI coding tools repeatedly ship seven specific holes: public database rows, secret keys in the browser bundle, auth checks that only run client-side, unsigned payment webhooks, public storage buckets, wide-open CORS, and unsanitized input that allows injection. None of them look like bugs, the app works, which is exactly why they survive to launch. Below is what each one is, why AI tools cause it, what it costs you, and the direction of the fix.',
    readMinutes: 11,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'Why AI-built apps share the same seven weaknesses',
        body:
          'AI coding tools optimise for a working demo. When you ask Lovable, Bolt, Cursor, Replit or v0 to "add a database" or "let users upload files," the fastest path to something that runs is the permissive default, open access, keys wherever they are convenient, checks in the browser where they are easy to write. The result works on the first try, which removes the usual signal that something is wrong.\n\nThese are not exotic vulnerabilities. They are the same seven mistakes over and over, because they all come from the same root cause: convenience defaults that were never tightened. Learn to recognise them and you can audit almost any AI-built app.',
      },
      {
        h2: '1. Public database rows',
        body:
          'What it is: your database tables are readable (and sometimes writable) by anyone with the public key, because Row Level Security is off in Supabase or your Firebase rules are open.\n\nWhy AI tools cause it: to make a feature work quickly, the tool creates a table and skips the row-level policies, or explicitly disables RLS "to fix" a query that was returning nothing. The app then works perfectly, for you and for a stranger reading the same data.\n\nThe cost: every customer record, emails, orders, messages, whatever the table holds, can be downloaded by anyone who opens the network tab and reuses the public key. This is the single most common way AI-built apps leak data. [SOURCE NEEDED]\n\nThe fix: turn on RLS for every table and add a policy tying each row to its owner ("auth.uid() = user_id"); lock Firebase rules to authenticated owners. See our dedicated RLS guide for good-vs-bad policy examples.',
      },
      {
        h2: '2. Secret keys in the browser bundle',
        body:
          'What it is: a secret key, Supabase "service_role", a Stripe "sk_" key, an OpenAI key, an SMTP password, ends up in code that ships to the browser.\n\nWhy AI tools cause it: the tool needs a key to call a service and places it in the frontend where the calling code lives, sometimes behind a "NEXT_PUBLIC_" variable name that forces it into the public bundle. It works, so no one notices the key is now public.\n\nThe cost: a service_role key bypasses all your database rules. A leaked Stripe or OpenAI key can be used to run up charges on your account. Anyone who views source can copy it.\n\nThe fix: rotate the exposed key immediately, then move it to a server-side environment variable or a serverless/edge function. Only publishable keys (Stripe "pk_", Supabase "anon") belong in the browser.',
      },
      {
        h2: '3. Client-side-only auth checks',
        body:
          'What it is: the decision about whether a user is allowed to see a page or use a feature happens in the browser, a hidden button, a redirect, a conditional render, with nothing enforcing it on the server.\n\nWhy AI tools cause it: hiding a button when "user.role !== admin" is the most visible, easiest-to-generate way to "add permissions," and it looks correct in the preview.\n\nThe cost: anyone can bypass a check that only runs in their own browser. They visit the protected URL directly, or edit the request, and reach admin tools or paid features for free.\n\nThe fix: enforce every permission on the server, in your database rules (RLS / Firebase) or inside your API route. Client-side checks are fine for UX (hiding things), never for security.',
      },
      {
        h2: '4. Unsigned payment webhooks',
        body:
          'What it is: your payment webhook (the URL Stripe or Polar calls when a payment succeeds) accepts any incoming request and acts on it without verifying it really came from the payment provider.\n\nWhy AI tools cause it: the tool wires up a route that reads the event and grants access, but skips the signature-verification step because the happy path works without it.\n\nThe cost: anyone who discovers the webhook URL can send a fake "payment succeeded" event and unlock paid access, credits, or entitlements without paying. [SOURCE NEEDED]\n\nThe fix: verify the provider signature on every event using your webhook signing secret before you trust it, and confirm the amount and currency match what you expected.',
      },
      {
        h2: '5. Public storage buckets',
        body:
          'What it is: a file storage bucket (Supabase Storage or Firebase Storage) is set to public, or its rules let any logged-in user read any file, and it holds private content.\n\nWhy AI tools cause it: public is the simplest setting that makes uploaded images and files load without extra plumbing, so that is what gets generated.\n\nThe cost: private uploads, ID documents, invoices, user photos, exports, become accessible to anyone with (or who can guess) the URL. File URLs are often predictable.\n\nThe fix: make private buckets private, scope storage rules to the file owner, and serve private files through short-lived signed URLs instead of public links.',
      },
      {
        h2: '6. Wide-open CORS',
        body:
          'What it is: your API responds to requests from any website ("Access-Control-Allow-Origin: *"), including authenticated endpoints.\n\nWhy AI tools cause it: "allow everything" is the default that removes CORS errors during development, so it gets left in.\n\nThe cost: it widens the attack surface, other origins can call your API in contexts you never intended, which compounds the damage of any of the auth or key issues above.\n\nThe fix: restrict CORS to your own domain(s), and while you are in the config, add standard security headers (HSTS, X-Content-Type-Options, a Content-Security-Policy).',
      },
      {
        h2: '7. Unsanitized input and injection',
        body:
          'What it is: user-supplied input flows into a database query, a shell command, or the page without being safely handled, the classic setup for SQL injection or cross-site scripting.\n\nWhy AI tools cause it: when generated code builds a query by gluing strings together with user input, or renders user input as raw HTML, it works in the demo and hides the injection risk.\n\nThe cost: an attacker can craft input that reads or destroys data, or runs script in other users\' browsers. [SOURCE NEEDED]\n\nThe fix: use parameterised queries or the database client\'s query builder (never string-concatenated SQL), and escape or sanitise any user input before rendering it. Supabase\'s client and most ORMs do this for you when used as intended.',
      },
    ],
    keyTakeaways: [
      'The seven holes share one root cause: convenience defaults from the build stage that were never tightened before launch.',
      'Public database rows are the most common and most damaging, they leak every record to anyone with the public key.',
      'Secret keys in the browser bundle must be rotated and moved server-side; only publishable keys belong in the frontend.',
      'Auth and payment checks that run only in the browser can always be bypassed, enforce them on the server.',
      'Unsigned webhooks let anyone fake a successful payment; always verify the provider signature and the amount.',
      'None of these look like bugs, which is why they survive to production, deliberately checking for them is the only reliable catch.',
    ],
    faqs: [
      {
        q: 'Does my app have all seven of these?',
        a: 'Most AI-built apps have at least one or two, rarely all seven. The point is to check each deliberately, because a working app gives you no signal about which are present.',
      },
      {
        q: 'Which of the seven should I fix first?',
        a: 'Public database rows and secret keys in the bundle, in that order, they leak the most data and cost the most money, and they are the fastest to exploit.',
      },
      {
        q: 'Are these unique to AI coding tools?',
        a: 'The vulnerabilities themselves are classic and predate AI. What is specific to AI tools is how reliably they ship the permissive-default version, because the generated code works immediately and hides the gap.',
      },
      {
        q: 'Can a scan find all seven?',
        a: 'A connected (white-box) scan of your repo can flag all seven categories. A free URL scan catches the ones visible from outside, exposed keys, open databases, public files, and CORS.',
      },
    ],
    related: [
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: 'Supabase Row Level Security, explained for non-developers', href: '/guides/supabase-row-level-security-explained-for-non-developers' },
      { label: 'Can someone hack an app built with AI?', href: '/security/can-someone-hack-an-app-built-with-ai' },
      { label: 'Are AI-generated apps safe to launch?', href: '/guides/are-ai-generated-apps-safe-to-launch' },
    ],
    hasPlaceholders: true,
  },

  // 3 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'supabase-row-level-security-explained-for-non-developers',
    type: 'guide',
    category: '// GUIDE',
    title: 'Supabase Row Level Security, explained for non-developers',
    metaTitle: 'Supabase RLS Explained for Non-Developers | Veilguard',
    metaDescription:
      'What Supabase Row Level Security actually is, why the public anon key is safe only when RLS is right, the "using (true)" trap, and how to verify, in plain English.',
    keywords: [
      'supabase row level security explained',
      'what is supabase rls',
      'supabase anon key safe',
      'supabase rls for beginners',
      'supabase using true',
      'turn off rls supabase',
    ],
    h1: 'What is Supabase Row Level Security, and why does it decide whether your app is safe?',
    directAnswer:
      'Row Level Security (RLS) is a bouncer standing at every single row of your database, deciding per-request whether the person asking is allowed to see or change that row. Supabase puts your database on the public internet and hands your app a public "anon" key, that arrangement is safe only when RLS is turned on and every table has a correct policy. With RLS off, or a policy that says "allow everyone," that public key can read and write all of your data. This guide explains RLS in plain English, shows a good policy next to a dangerous one, and shows you how to verify yours.',
    readMinutes: 12,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'The bouncer at every row',
        body:
          'Imagine your database table is a members-only club and every row is a private booth. Row Level Security is a bouncer who stands at each booth and, every time someone asks to look inside, checks their ID against a rule: "you can only enter your own booth." That check happens on every request, for every row, no exceptions.\n\nWithout RLS, there is no bouncer. The doors are open. Anyone who walks up to the club, using nothing more than the public key that ships in your app, can walk into every booth and read (or rearrange) what is inside. RLS is the difference between "the database enforces who sees what" and "we just hope nobody looks."',
      },
      {
        h2: 'Why the public "anon" key is safe, but only if RLS is right',
        body:
          'Here is the part that trips up almost every founder. Supabase gives your frontend a key called the "anon" (anonymous) key, and that key is meant to be public, it ships in your browser code, and that is intentional and fine. People discover it in their network tab, panic, and assume they have been hacked.\n\nThe anon key is not a secret. It is more like the club\'s street address: knowing it just tells you where the door is. What actually keeps people out of the booths is the bouncer, RLS. So the anon key is completely safe to expose when RLS is on and your policies are correct, and completely dangerous when RLS is off, because then the address is all anyone needs to get into everything.\n\nThe key you must never expose is the "service_role" key, that one is a master key that walks past the bouncer entirely. It belongs only on your server, never in the browser.',
        note:
          'Finding your anon key in the browser is expected and not a vulnerability by itself. Finding your service_role key in the browser is an emergency, rotate it immediately.',
      },
      {
        h2: 'The two traps: "using (true)" and "I turned RLS off to make it work"',
        body:
          'There are two ways AI-built Supabase apps end up wide open, and they are worth naming because they feel like solutions at the time.\n\nThe first is turning RLS off. A query returns nothing, the app is broken, and the fastest way to "fix" it is to disable Row Level Security on the table. The app instantly works, because now there is no bouncer at all. The fix was actually the disease.\n\nThe second is a policy of "using (true)". This looks like a real security policy, so it feels safe, but "true" means "this check passes for everyone, always." It is a bouncer who waves through every single person. It is functionally the same as having no policy, every row is readable by anyone with the anon key.\n\nBoth happen because they make the app work, and a working app gives you no warning that the door is open.',
      },
      {
        h2: 'A dangerous policy next to a good one',
        code: {
          label: 'Bad vs good RLS policy (Supabase SQL)',
          content:
            "-- ❌ DANGEROUS: RLS turned off entirely.\n-- Anyone with the public anon key can read and write every row.\nalter table profiles disable row level security;\n\n-- ❌ ALSO DANGEROUS: RLS is on, but the policy lets everyone through.\n-- \"using (true)\" means the check passes for every request.\ncreate policy \"profiles are viewable\"\n  on profiles for select\n  using (true);\n\n-- ✅ GOOD: RLS on, and each user can only touch their OWN rows.\n-- auth.uid() is the id of the logged-in user making the request;\n-- user_id is the owner column on the row. They must match.\nalter table profiles enable row level security;\n\ncreate policy \"users can read their own profile\"\n  on profiles for select\n  using (auth.uid() = user_id);\n\ncreate policy \"users can update their own profile\"\n  on profiles for update\n  using (auth.uid() = user_id)\n  with check (auth.uid() = user_id);",
        },
        body:
          'Read the good example slowly: "using (auth.uid() = user_id)" is the bouncer\'s rule written out. "auth.uid()" is the ID of whoever is making the request; "user_id" is the column on the row that says who owns it. The row is only returned when those two match, you get your rows, and only your rows.\n\nNotice the good policy is written per action (select, update) and includes a "with check" on writes so a user cannot save a row as if it belonged to someone else. You want a policy like this on every table that holds user data.',
      },
      {
        h2: 'How to verify your RLS is actually working',
        body:
          'You do not have to take the dashboard\'s word for it. There are three checks, from easiest to most convincing.\n\nFirst, in the Supabase dashboard open the Table Editor, it visibly flags any table where RLS is disabled. Every table with user data should show RLS enabled.\n\nSecond, open the "Authentication" and "Policies" views and confirm each table has policies that reference "auth.uid()" (or a role/ownership check), not "true".\n\nThird, the real test: log out (or use an incognito window), and try to load data you should not be able to see. If your app can still fetch other users\' rows while logged out or logged in as a different account, RLS is not doing its job. This last test is exactly what a scan automates, it asks your database for data it should refuse, and tells you what came back.',
      },
      {
        h2: 'What a correct setup looks like end to end',
        bullets: [
          'RLS is enabled on every table that holds user or business data, not just the obvious ones.',
          'Every table has policies scoped to ownership or role, using "auth.uid()", none rely on "using (true)".',
          'Write policies include a "with check" so users cannot create or move rows into someone else\'s account.',
          'The anon (publishable) key is the only Supabase key in your frontend; the service_role key lives only on the server.',
          'Sensitive operations that must bypass RLS run in a server-side function using the service_role key, never in the browser.',
          'You have tested access while logged out and as a second user, and confirmed you cannot reach data you should not see.',
        ],
      },
    ],
    keyTakeaways: [
      'RLS is a per-row bouncer that checks, on every request, whether the requester is allowed to see or change that specific row.',
      'The public anon key is safe to expose only when RLS is on and policies are correct; with RLS off it is all an attacker needs.',
      'Never put the service_role key in the browser, it bypasses RLS entirely and is a master key to your database.',
      '"Turning RLS off to make it work" and a policy of "using (true)" are the two most common ways AI-built apps end up wide open.',
      'A good policy scopes rows to their owner with "auth.uid() = user_id" and adds "with check" on writes.',
      'Verify by trying to read data you should not be able to, logged out and as a second user, not by trusting the dashboard alone.',
    ],
    faqs: [
      {
        q: 'Is it bad that my Supabase anon key is visible in the browser?',
        a: 'No, the anon key is designed to be public and shipping it in your frontend is normal. What makes it dangerous is having RLS turned off, because then the public key can reach all your data. Fix RLS, and the exposed anon key is a non-issue.',
      },
      {
        q: 'I turned RLS off because my app broke, is that OK?',
        a: 'No. Turning RLS off makes the app work by removing all row-level protection, so anyone with the anon key can read and write everything. The correct fix is to keep RLS on and write a policy that allows the specific access your app needs.',
      },
      {
        q: 'What does "using (true)" mean and why is it dangerous?',
        a: 'It is a policy whose condition is always true, so the check passes for every request from everyone. It looks like security but behaves like none, every row becomes readable by anyone with the anon key.',
      },
      {
        q: 'How do I know if my RLS policies are correct without being a developer?',
        a: 'Try to read data you should not have access to, log out or use a second account and see if your app still returns other people\'s rows. If it does, RLS is not protecting you. A free Supabase security scan runs this test for you and reports exactly what was reachable.',
      },
    ],
    related: [
      { label: 'How do I know if my Supabase database is exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'Is my Lovable app secure?', href: '/scanners/lovable' },
    ],
    builder: { label: 'Check your Supabase security free', href: '/scanners/supabase' },
    hasPlaceholders: false,
  },

  // 4 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'how-to-secure-your-app-before-launch',
    type: 'guide',
    category: '// GUIDE',
    title: 'How to secure your AI-built app before launch',
    metaTitle: 'How to Secure Your App Before Launch | Veilguard',
    metaDescription:
      'A founder\'s ordered, pre-launch hardening walkthrough for AI-built apps on Supabase/Firebase + Stripe + Next.js, the exact steps, in the order to do them.',
    keywords: [
      'secure app before launch',
      'pre launch security checklist',
      'harden ai built app',
      'launch security steps',
      'vibe coded app launch security',
      'supabase firebase launch security',
    ],
    h1: 'How do I secure my AI-built app before I launch it?',
    directAnswer:
      'Harden in this order: lock down the database, get every secret off the client and rotate anything exposed, move auth and payment checks to the server, secure file storage, tighten CORS and headers, update dependencies, clean git history, then re-test the whole thing as an outsider. This is a sequence, not a menu, the early steps stop the biggest leaks, so do them first. Give yourself an afternoon, not five minutes.',
    readMinutes: 10,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'Before you start: what "secure enough to launch" means',
        body:
          'You are not trying to reach the security posture of a bank. You are trying to make sure that on launch day a stranger cannot download your customers\' data, spend your money, or unlock paid features for free. That bar is achievable in an afternoon for a typical AI-built app.\n\nThe steps below are ordered deliberately. If you run out of time, the work you have done still covers the biggest risks first. Have your project open in Supabase or Firebase, your payment provider dashboard (Stripe or Polar), and your hosting/deployment settings ready before you begin.',
      },
      {
        h2: 'Step 1, Lock down the database',
        body:
          'Start here because an open database is the fastest way to leak everything. In Supabase, turn on Row Level Security for every table that holds user or business data and add a policy scoping each row to its owner ("auth.uid() = user_id"); make sure no policy is "using (true)". In Firebase, replace any "allow read, write: if true" with rules that require "request.auth != null" and check ownership.\n\nThen prove it: log out or use a second account and confirm you cannot read data that is not yours. Do not move on until this passes, everything else matters less than this.',
      },
      {
        h2: 'Step 2, Get secrets off the client and rotate what leaked',
        body:
          'Open your live site and search the loaded JavaScript for "sk_", "service_role", and "secret". Any secret key you find in the browser must be treated as compromised: rotate it (generate a new one) first, then move it to a server-side environment variable or a serverless/edge function. Only publishable keys, Stripe "pk_", Supabase "anon", are allowed to remain in the frontend.\n\nRotate before you refactor. A key that has shipped in a public bundle is public forever; changing where it lives does nothing until the old value is revoked.',
      },
      {
        h2: 'Step 3, Move auth and permission checks to the server',
        body:
          'Walk through your protected areas, admin pages, paid features, account settings, and ask: what actually stops an unauthorised user here? If the answer is "the button is hidden" or "the page redirects," that is a client-side check and it can be bypassed by visiting the URL directly.\n\nEnforce every real permission on the server: in your database rules (RLS / Firebase) or inside your API routes. Keep the client-side hiding for a clean experience, but never rely on it for security. Test by trying to reach each protected URL as a logged-out user and as a basic (non-admin) user.',
      },
      {
        h2: 'Step 4, Secure payments and storage',
        body:
          'Payments: confirm your webhook verifies the provider signature before granting anything. If your Stripe or Polar webhook accepts events without checking the signing secret, anyone who finds the URL can fake a successful payment. Add signature verification and confirm the amount and currency match what you expected.\n\nStorage: check every Supabase/Firebase bucket. Anything private (IDs, invoices, user uploads) must be in a private bucket with owner-scoped rules, served via short-lived signed URLs, not public links. Test by opening a stored file URL in an incognito window with no login.',
      },
      {
        h2: 'Step 5, Tighten CORS, headers, dependencies, and git',
        numbered: true,
        bullets: [
          'CORS: restrict your API to your own domain(s) instead of "Access-Control-Allow-Origin: *", especially on authenticated endpoints.',
          'Security headers: add HSTS, X-Content-Type-Options, and a Content-Security-Policy, most hosts (Vercel, Netlify, Firebase Hosting) let you set these in one config file.',
          'Dependencies: run "npm audit" (or "pnpm audit"), then update anything flagged high or critical, prioritise packages in your auth, payments, and server code.',
          'Git history: search history for a committed ".env", key, or service-account file. If you find one, rotate the secret first, then purge it from history and confirm ".env" is in ".gitignore".',
        ],
      },
      {
        h2: 'Step 6, Re-test as an outsider, then launch',
        body:
          'Finish by attacking your own app the way a curious stranger would. Open the network tab and use the app normally: is your database returning only your rows? Are there any secret keys in the bundle? Can you open a private file logged out? Can you reach a protected URL you should not? Can you hit the webhook with a fake event?\n\nIf all of those fail, meaning the app correctly refuses, you have cleared the bar for launch. Re-run this same test after every significant change, because AI tools can reintroduce a hole in a single "fix." Continuous monitoring exists precisely because the next deploy can undo today\'s work.',
        note:
          'Security is not a one-time launch task. Every time you ask your AI tool to change a feature, it can loosen a rule again, re-test, or have something watching each deploy.',
      },
    ],
    keyTakeaways: [
      'Harden in order of blast radius: database first, then secrets, auth, payments/storage, CORS/headers/dependencies/git, then re-test.',
      'An open database is the biggest launch risk, do not move past step 1 until you can confirm you cannot read data that is not yours.',
      'Rotate any secret that has appeared in the browser before doing anything else; moving it server-side does not undo the leak.',
      'Real permissions and payment checks must run on the server; client-side hiding is UX, not security.',
      'Re-test as an outsider using the browser network tab, and re-test after every change, AI tools can reopen a hole in one edit.',
      '"Secure enough to launch" means a stranger cannot take your data, spend your money, or unlock paid features, an afternoon of work, not a rewrite.',
    ],
    faqs: [
      {
        q: 'How long does pre-launch hardening take?',
        a: 'For a typical small AI-built app, an afternoon. The database and payments steps take the most time; the browser-based tests take minutes. Rushing the database step is the most common mistake.',
      },
      {
        q: 'Do I need to hire a security engineer before launch?',
        a: 'For most indie and early-stage AI-built apps, no. The steps here cover the holes that actually get exploited. Hire an expert if you handle especially sensitive data (health, financial) or face specific compliance requirements.',
      },
      {
        q: 'What is the single most important step?',
        a: 'Locking down the database (Supabase RLS / Firebase rules). It is step 1 because an open database leaks every customer record, which is the worst-case launch-day outcome.',
      },
      {
        q: 'I already launched without doing this, what now?',
        a: 'Run the same sequence now, starting with the database and rotating any exposed secrets. If a hole was open while you had real users, closing it and rotating keys is urgent; in the worst cases you may also need to consider notifying affected users.',
      },
    ],
    related: [
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: 'Security checks before launching your SaaS', href: '/guides/security-checks-before-launching-your-saas' },
      { label: 'Is it safe to take payments on a vibe-coded app?', href: '/guides/is-it-safe-to-take-payments-on-a-vibe-coded-app' },
      { label: 'Exposed API keys: what they are, how to find and fix them', href: '/security/exposed-api-keys-what-they-are-how-to-find-and-fix' },
    ],
    hasPlaceholders: false,
  },

  // 5 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'exposed-api-keys-what-they-are-how-to-find-and-fix',
    type: 'guide',
    category: '// GUIDE',
    title: 'Exposed API keys: what they are, how to find and fix them',
    metaTitle: 'Exposed API Keys: Find & Fix Them | Veilguard',
    metaDescription:
      'Public vs secret keys, where AI tools leak them (NEXT_PUBLIC_, the bundle, committed .env, git history), and how to find, rotate and keep your keys server-side.',
    keywords: [
      'exposed api keys',
      'find leaked api key',
      'next_public secret key',
      'rotate api key',
      'api key in browser bundle',
      'committed env file git',
    ],
    h1: 'Exposed API keys: what they are, and how to find and fix yours',
    directAnswer:
      'An exposed API key is a credential that has ended up somewhere the public can read it, usually the browser bundle, a "NEXT_PUBLIC_" variable, a committed ".env" file, or your git history. The critical distinction is public vs secret: publishable keys (Stripe "pk_", Supabase "anon") are meant to be seen, but secret keys (Stripe "sk_", Supabase "service_role", OpenAI, SMTP) grant real power and must stay server-side. This guide shows you how to find yours step by step, how to rotate safely, and how to keep secrets off the client for good.',
    readMinutes: 10,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'Public keys vs secret keys, the distinction that matters',
        body:
          'Not every key in your browser is a problem. API keys come in two families, and confusing them causes both false panic and real breaches.\n\nPublishable (public) keys are designed to be seen by anyone. Stripe\'s "pk_" key and Supabase\'s "anon" key are examples, they identify your project but do not, on their own, grant access to anything sensitive (in Supabase\'s case, your Row Level Security policies are what actually protect the data). Finding these in your frontend is expected.\n\nSecret keys are the opposite. Stripe\'s "sk_" key, Supabase\'s "service_role" key, your OpenAI key, and SMTP or database passwords all grant real, often unrestricted power, charging cards, bypassing database rules, spending money, sending mail as you. These must never reach the browser. The whole job of this guide is telling the two apart and getting the secret ones back behind your server.',
        note:
          'Quick rule: "pk_" and "anon" are meant to be public. "sk_", "service_role", and anything called "secret", "private", or "password" are not, if one is in your browser, treat it as compromised.',
      },
      {
        h2: 'Where AI tools leak secret keys',
        bullets: [
          'The "NEXT_PUBLIC_" prefix trap: in Next.js, any environment variable named "NEXT_PUBLIC_..." is deliberately baked into the browser bundle. AI tools sometimes prefix a secret this way to "fix" it being undefined on the client, which publishes it to the world.',
          'Hardcoded in frontend code: the key is pasted directly into a component or client-side file because that is where the code calling the service lives.',
          'The built JavaScript bundle: even without "NEXT_PUBLIC_", a secret imported into client code gets bundled and shipped. Viewing source or the network tab reveals it.',
          'A committed ".env" file: the real ".env" (with actual values) gets committed to the repo instead of being ignored, so anyone with repo access reads every secret.',
          'Git history: a key was committed once, then removed in a later commit. It looks gone, but it lives on in history forever and is still readable.',
          'Client-side calls to third-party APIs: calling OpenAI, Resend, or a similar service directly from the browser forces the secret into the client, where it cannot be hidden.',
        ],
      },
      {
        h2: 'How to find your exposed keys, step by step',
        numbered: true,
        bullets: [
          'Open your live site, right-click, choose "Inspect", and open the "Sources" (or "Debugger") tab to see the loaded JavaScript.',
          'Search the loaded files for "sk_", "service_role", "secret", "api_key", and the names of services you use (e.g. "openai", "sk-"). Anything that matches a secret key is exposed.',
          'Open the "Network" tab, use your app normally, and inspect outgoing requests, a secret sent from the browser to a third-party API is exposed.',
          'In your codebase, search for "NEXT_PUBLIC_" and confirm every one of them is genuinely safe to be public; a secret behind that prefix is exposed.',
          'Check whether a real ".env" file is tracked by git (it should be listed in ".gitignore" and not appear in the repo).',
          'Search your git history for secrets, for example "git log -p -S sk_", a key that was committed and later deleted is still there. GitHub also sends secret-scanning alerts if it detects known key formats. [SOURCE NEEDED]',
        ],
      },
      {
        h2: 'How to rotate a leaked key safely',
        body:
          'Once a secret has been public, the only real fix is to rotate it, generate a new key and revoke the old one, because you cannot know who already copied it. Deleting the file, the commit, or the "NEXT_PUBLIC_" line does not undo the exposure.\n\nDo it in an order that avoids downtime: first create the new key in the provider dashboard, then add it to your server-side environment variables and deploy, confirm the app still works on the new key, and only then revoke the old key. For payment keys, do this carefully and check the provider\'s guidance so you do not interrupt live charges. After rotating, run the find steps again to confirm the old value is truly gone from the bundle and history.',
      },
      {
        h2: 'How to keep secrets server-side for good',
        body:
          'The durable fix is architectural: secrets should only ever be read by code that runs on a server, never by code that runs in a browser. In practice, that means routing any call that needs a secret key through a backend, a Next.js API route or server action, a Supabase Edge Function, or a serverless function, and storing the secret in that environment\'s variables (or a secrets manager), not in client code.\n\nSo instead of the browser calling Stripe or OpenAI directly with a secret key, the browser calls your own endpoint, and your endpoint (which the public cannot read) uses the secret to talk to the service. The browser keeps only publishable keys. This is the pattern AI tools skip because the direct-from-browser version is faster to generate, and it is the one worth insisting on.',
        code: {
          label: 'The pattern: secret stays on the server',
          content:
            "// ❌ WRONG, secret key shipped to the browser\n// This runs on the client, so the key is in the bundle for anyone to read.\nconst res = await fetch('https://api.openai.com/v1/...', {\n  headers: { Authorization: `Bearer sk_live_REAL_SECRET_KEY` },\n});\n\n// ✅ RIGHT, the browser calls YOUR endpoint; the secret never leaves the server.\n// Client code:\nconst res = await fetch('/api/generate', { method: 'POST', body });\n\n// Server code (e.g. a Next.js API route / server action / Edge Function):\n// process.env.OPENAI_API_KEY is read only here, never sent to the client.\nconst apiKey = process.env.OPENAI_API_KEY; // secret, server-side only\n// ... use apiKey to call the third-party API, return only the result",
        },
      },
    ],
    keyTakeaways: [
      'Publishable keys (Stripe "pk_", Supabase "anon") are meant to be public; secret keys ("sk_", "service_role", OpenAI, SMTP) must never reach the browser.',
      'AI tools leak secrets via the "NEXT_PUBLIC_" prefix, hardcoded frontend code, the JS bundle, committed ".env" files, git history, and direct client-side API calls.',
      'Find yours by searching the loaded JavaScript and network requests for "sk_"/"service_role"/"secret", auditing "NEXT_PUBLIC_" vars, and scanning git history.',
      'Any secret that has been public must be rotated, create the new key, deploy it, verify, then revoke the old one.',
      'Deleting a file or commit does not un-leak a key; the exposed value is compromised until it is revoked.',
      'The durable fix is to route secret-using calls through a server endpoint so the browser only ever holds publishable keys.',
    ],
    faqs: [
      {
        q: 'I found my Supabase anon key in the browser, is that a leak?',
        a: 'No. The anon key is a publishable key designed to be in the browser. What protects your data is Row Level Security, not the secrecy of that key. A leaked "service_role" key, by contrast, is a serious problem.',
      },
      {
        q: 'What does "NEXT_PUBLIC_" actually do, and why is it dangerous?',
        a: 'In Next.js, prefixing an environment variable with "NEXT_PUBLIC_" tells the build to embed it in the browser bundle. That is correct for publishable keys, but if a secret is given that prefix it becomes readable by anyone who views your site.',
      },
      {
        q: 'I deleted the commit that had my API key. Am I safe now?',
        a: 'No. The key was public the moment it was pushed, and it may remain in git history and in anyone\'s clone or cache. You must rotate the key, generate a new one and revoke the old, to be safe.',
      },
      {
        q: 'How do I call a service like OpenAI or Stripe without exposing the key?',
        a: 'Have the browser call your own backend endpoint (a Next.js API route, server action, or Supabase Edge Function), and let that server-side code use the secret key. The secret stays in server environment variables and never ships to the client.',
      },
    ],
    related: [
      { label: 'How to check for exposed API keys', href: '/security/how-to-check-for-exposed-api-keys' },
      { label: 'The complete security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
      { label: '7 security holes AI coding tools leave behind', href: '/guides/7-security-holes-ai-coding-tools-leave-behind' },
      { label: 'How to secure your app before launch', href: '/guides/how-to-secure-your-app-before-launch' },
    ],
    hasPlaceholders: true,
  },
];
