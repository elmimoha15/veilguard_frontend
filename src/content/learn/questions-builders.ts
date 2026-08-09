import type { Article } from './types';

/**
 * Builder-specific "Is my <tool> app secure?" answer pages.
 * Each is tuned to the tool's usual stack and the misconfiguration patterns
 * we see most often. Written for non-technical founders. No fabricated stats:
 * any unverifiable number is left as a [SOURCE NEEDED] placeholder and the
 * article is flagged with hasPlaceholders.
 */
export const BUILDER_QUESTIONS: Article[] = [
  // 1 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'is-my-lovable-app-secure',
    type: 'question',
    category: 'Answers',
    title: 'Is my Lovable app secure?',
    metaTitle: 'Is My Lovable App Secure? | Veilguard',
    metaDescription:
      'Lovable apps run on Supabase. The main risk is a database with Row Level Security off or set to allow everyone. Here is how to check yours in plain English.',
    keywords: [
      'is my lovable app secure',
      'lovable security',
      'lovable supabase security',
      'lovable rls',
      'lovable anon key',
    ],
    h1: 'Is my Lovable app secure?',
    directAnswer:
      'A Lovable app can absolutely be secure, but it is not secure automatically. Lovable builds on Supabase, and the single most common problem we see is a database where Row Level Security (RLS) is either switched off or set to a rule that lets anyone read and write every row. Your app also ships a "anon key" in the browser, which is normal and fine on its own, but it is only safe when those database rules are locked down. A 60-second scan tells you which side of that line your app is on.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'What Lovable actually builds under the hood',
        body: 'When Lovable creates an app for you, the front end (the part people see) usually talks directly to Supabase for its data, logins, and file storage. That is a genuinely good, modern setup. But it also means your database is reachable from the public internet, and the thing standing between "reachable" and "everyone can read your customers\' data" is a set of database rules you probably never saw.\n\nThe rest of this page is about those rules and a couple of related traps. None of it requires you to read code.',
      },
      {
        h2: 'The anon key in your browser is normal — here is why',
        body: 'If you open your app in a browser and look at the network traffic, you will find a long "anon" (anonymous) key. It is tempting to panic and think a secret leaked. It did not. The anon key is designed to be public. It only identifies your project; it does not, by itself, grant access to anything.',
        bullets: [
          'The anon key is safe in the browser by design — Supabase intends it to be there.',
          'It is only safe when Row Level Security is turned on and your policies are correct.',
          'If RLS is off, that same public key lets anyone read and write your tables — that is the real problem, not the key.',
          'There is a second key, the service_role key, that must NEVER appear in the browser or in front-end code. That one bypasses all rules.',
        ],
        note: 'Rule of thumb: the anon key being public is expected. A service_role key being public is an emergency.',
      },
      {
        h2: 'The RLS mistakes we see most in Lovable apps',
        body: 'Row Level Security decides, row by row, who is allowed to see or change data. When an AI tool (or a "just make it work" prompt) sets this up quickly, three patterns show up again and again.',
        bullets: [
          'RLS turned off entirely on a table — often done to fix a "why is my data not loading?" moment, then forgotten.',
          'A policy set to `using (true)`, which literally means "allow everyone" — it works in the demo and quietly exposes every row.',
          'RLS on for one table but forgotten on the new table added last week.',
        ],
        code: {
          label: 'A risky policy vs. a safe one (Supabase / Postgres)',
          content:
            '-- Risky: anyone with your public anon key can read every row\ncreate policy "public read"\n  on public.profiles for select\n  using ( true );\n\n-- Safer: a logged-in user can read only their own row\ncreate policy "read own profile"\n  on public.profiles for select\n  using ( auth.uid() = user_id );',
        },
      },
      {
        h2: 'Beyond the database: storage, functions, and payments',
        body: 'The database is the biggest one, but a few other Lovable/Supabase pieces are worth a look, especially if you are charging money.',
        bullets: [
          'Storage buckets: a bucket set to public means the files inside (invoices, uploads, IDs) can be opened by anyone with the link.',
          'Edge functions: if a function trusts data the browser sends without re-checking it, users can send whatever they like.',
          'Payment webhooks: the message your payment provider sends to confirm a purchase must be verified with a signing secret, or someone can fake a "payment succeeded" event.',
          'In one review of AI-built apps, [SOURCE NEEDED], a large share had at least one table with no working access rule.',
        ],
      },
      {
        h2: 'How to check your Lovable app without reading code',
        body: 'You do not need a security background to find out where you stand.',
        bullets: [
          'Run a free URL scan — it checks your public database rules, exposed keys, and storage from the outside, the same way an attacker would.',
          'You get a plain-English A–F grade and a list of what is open, in about a minute.',
          'For the full picture (every table, every policy), connect the repo so the scan can read what the browser cannot.',
        ],
      },
    ],
    keyTakeaways: [
      'Lovable apps run on Supabase — your security depends mostly on Supabase Row Level Security being on and correct.',
      'The public anon key in the browser is normal; a public service_role key is not.',
      'The classic mistakes are RLS turned off and policies set to `using (true)` ("allow everyone").',
      'Also check public storage buckets and that payment webhooks are signature-verified.',
      'A free 60-second URL scan tells you what is exposed before a customer or attacker finds it.',
    ],
    faqs: [
      {
        q: 'Is the Supabase anon key in my Lovable app a security hole?',
        a: 'No, on its own. The anon key is meant to be public and live in the browser. It only becomes a problem when Row Level Security is off or misconfigured, because then that public key can be used to read and write your data.',
      },
      {
        q: 'Why can I see my database data in the browser network tab?',
        a: 'Because a Lovable front end talks to Supabase directly, requests and responses pass through the browser. That is expected. The question is whether the database would return that data to just anyone — which comes down to your RLS policies.',
      },
      {
        q: 'I turned off RLS to fix a bug. Is that dangerous?',
        a: 'Yes. Turning RLS off is a very common "make it work" step that leaves the table open to everyone. Turn it back on and add a policy that limits rows to the right user. A scan will flag any table where RLS is off.',
      },
      {
        q: 'Can I make my Lovable app secure without a developer?',
        a: 'Largely, yes. A scan gives you a plain-English grade plus the exact SQL fix or an AI prompt you can paste back into Lovable. The paid tier unlocks every fix and re-scans on each deploy.',
      },
    ],
    related: [
      {
        label: 'Supabase Row Level Security, explained for non-developers',
        href: '/learn/supabase-row-level-security-explained-for-non-developers',
      },
      {
        label: 'How do I know if my Supabase database is exposed?',
        href: '/learn/how-do-i-know-if-my-supabase-database-is-exposed',
      },
      {
        label: 'Is my Bolt app secure?',
        href: '/learn/is-my-bolt-app-secure',
      },
    ],
    builder: { label: 'Scan your Lovable app free', href: '/lovable-security-scanner' },
    hasPlaceholders: true,
  },

  // 2 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'is-my-bolt-app-secure',
    type: 'question',
    category: 'Answers',
    title: 'Is my Bolt app secure?',
    metaTitle: 'Is My Bolt App Secure? | Veilguard',
    metaDescription:
      'Bolt.new apps are fast to build, which makes it easy to ship secrets to the browser or skip database rules. Here is how to check your Bolt app in plain English.',
    keywords: [
      'is my bolt app secure',
      'bolt.new security',
      'bolt stackblitz security',
      'bolt env variables',
      'bolt supabase security',
    ],
    h1: 'Is my Bolt app secure?',
    directAnswer:
      'Bolt (Bolt.new) can produce a secure app, but the same speed that makes it great also makes it easy to ship a secret to the browser or skip your database rules. Bolt often wires up Supabase or a lightweight backend, and the risks cluster around two things: private keys accidentally exposed in front-end code or environment variables, and a database with no Row Level Security. A quick scan checks both without you reading any code.',
    readMinutes: 6,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'What Bolt builds and where the risk tends to live',
        body: 'Bolt is front-end heavy: it spins up a working app in the browser fast, and it often connects that app straight to Supabase or a small backend it generates. Because so much runs in the browser, the two questions that matter most are (1) did any secret end up in front-end code, and (2) is the database actually locked down.',
      },
      {
        h2: 'The secret-in-the-browser trap',
        body: 'Anything your app needs in the browser gets bundled and shipped to every visitor. That is fine for values meant to be public, and a disaster for values meant to be secret. Bolt projects commonly use a bundler (like Vite) where variables prefixed with `VITE_` are inlined into the browser build. A "secret" placed there is not secret.',
        bullets: [
          'A publishable key (like a Supabase anon key or a Stripe publishable key) is safe in the browser by design.',
          'A service_role key, a Stripe secret key, or any private API key must never be in front-end code or a browser-exposed env var.',
          'If a private key did leak into the bundle, treat it as compromised and rotate (replace) it, then move it server-side.',
        ],
        code: {
          label: 'Front-end env vars: what belongs and what does not',
          content:
            '# Anything the bundler inlines is PUBLIC. A "secret" here is not secret.\nVITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...   # never expose the service_role key\nVITE_STRIPE_SECRET_KEY=sk_live_...      # never put a secret key in front-end env\n\n# Only values meant to be public belong in front-end env\nVITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...           # public by design — safe only if RLS is on',
        },
      },
      {
        h2: 'Database rules Bolt may leave open',
        body: 'If Bolt connected your app to Supabase, the same rule as any Supabase app applies: your data is only as private as your Row Level Security policies. Two patterns show up when a database is set up in a hurry.',
        bullets: [
          'RLS switched off on a table so data "just loads" during the build — which means anyone can read and write it.',
          'A blanket policy that allows everyone (the `using (true)` pattern) instead of limiting rows to the logged-in owner.',
          'If Bolt generated its own small backend instead, the equivalent question is whether each endpoint checks who is calling before returning private data.',
        ],
      },
      {
        h2: 'Features that get prompted in without the safety checks',
        body: 'When you ask an AI tool to "add login" or "let users pay," it will happily add the visible part. The invisible safety part is easy to miss.',
        bullets: [
          'Auth that only hides a button or a page in the browser, while the underlying data endpoint stays open to anyone.',
          'Payment confirmation webhooks that are not signature-verified, so a fake "payment succeeded" message could unlock paid features.',
          'File uploads landing in a public storage bucket that anyone can browse with the right link.',
        ],
      },
      {
        h2: 'How to check your Bolt app',
        body: 'You do not need to open the code to get a clear answer.',
        bullets: [
          'Run a free URL scan for exposed keys, open database rules, and public storage — you get an A–F grade in about a minute.',
          'Every finding comes with a plain-English explanation and the exact fix or an AI prompt you can paste back into Bolt.',
          'Connect the repo for a deeper (white-box) scan that reads your env config and every database policy.',
        ],
      },
    ],
    keyTakeaways: [
      'Bolt apps are front-end heavy, so the top risk is a secret accidentally shipped to the browser.',
      'Variables prefixed for the front-end bundle (like `VITE_`) are public — never put a service_role or secret key there.',
      'If Bolt used Supabase, check that Row Level Security is on and policies are not set to "allow everyone".',
      'Verify payment webhooks are signature-checked and that auth is enforced on the data, not just the UI.',
      'A free URL scan flags exposed keys and open data without you reading any code.',
    ],
    faqs: [
      {
        q: 'Are the environment variables in my Bolt app safe?',
        a: 'It depends on the prefix. Front-end variables (often prefixed `VITE_`) get bundled into the browser and are effectively public. Publishable/anon keys are fine there; any secret key is not and should be moved server-side and rotated.',
      },
      {
        q: 'Bolt built my whole app in minutes — did it skip security?',
        a: 'Not necessarily, but it is worth checking. The speed means safety steps like database rules, webhook verification, and keeping secrets server-side are easy to leave incomplete. A scan confirms whether they are in place.',
      },
      {
        q: 'What is the difference between the anon key and the service_role key?',
        a: 'The anon key is public and safe in the browser as long as Row Level Security is on. The service_role key bypasses all rules and must stay on the server only. If it ever appears in front-end code, treat it as leaked and replace it.',
      },
      {
        q: 'Can I fix Bolt security issues myself?',
        a: 'Usually yes. Each finding includes the exact fix or a prompt you can paste back into Bolt. The paid tier unlocks all fixes and re-scans automatically whenever you deploy.',
      },
    ],
    related: [
      {
        label: 'How to check for exposed API keys',
        href: '/learn/how-to-check-for-exposed-api-keys',
      },
      {
        label: 'How do I know if my Supabase database is exposed?',
        href: '/learn/how-do-i-know-if-my-supabase-database-is-exposed',
      },
      {
        label: 'Is my Lovable app secure?',
        href: '/learn/is-my-lovable-app-secure',
      },
    ],
    builder: { label: 'Scan your Bolt app free', href: '/bolt-security-scanner' },
  },

  // 3 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'is-my-cursor-app-secure',
    type: 'question',
    category: 'Answers',
    title: 'Is the app I built with Cursor secure?',
    metaTitle: 'Is My Cursor App Secure? | Veilguard',
    metaDescription:
      'Cursor is an AI code editor, so its security depends on the code the AI wrote. The usual gaps: client-side auth, secrets in the repo, and untightened database rules.',
    keywords: [
      'is my cursor app secure',
      'cursor ai security',
      'cursor next.js supabase security',
      'client-side auth check',
      'secrets in repo',
    ],
    h1: 'Is the app I built with Cursor secure?',
    directAnswer:
      'Cursor is an AI code editor, not a hosting platform, so "is my Cursor app secure?" really means "is the code the AI wrote for me secure?" That varies more than with template-based tools, because Cursor builds whatever you and the model prompt — commonly a Next.js app with Supabase or Firebase behind it. The recurring problems are auth checks that run only in the browser, secrets committed into the repo or the wrong env file, and database rules the AI never tightened. A scan reads the actual code and rules and tells you where you stand.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'Cursor is an editor, so the risk lives in the code',
        body: 'Unlike a template-based builder, Cursor does not impose one "default" setup. It writes whatever you ask for, and different prompts produce different code. That is honest and important: there is no single Cursor misconfiguration to point at. What we can point at are the mistakes AI models tend to make regardless of the app — and they are consistent enough to check for.',
      },
      {
        h2: 'Client-side auth checks that do not actually protect anything',
        body: 'This is the most common and most misunderstood issue. An AI model will happily write code that hides an admin button or redirects a logged-out user. That improves the experience, but it does not protect your data. The check runs in the browser, where anyone can bypass it. The real protection has to live on the server or in your database rules.',
        code: {
          label: 'Hiding the UI is not the same as protecting the data',
          content:
            '// This only hides the button. The data endpoint is still open to anyone.\nif (user.isAdmin) {\n  return <DeleteAllButton />;\n}\n\n// The real protection must live on the server or in your database rules:\n// the API route (or the RLS policy) has to re-check that the caller is an admin\n// before it does anything. Never trust a browser-side check alone.',
        },
        note: 'A good test: if the only thing stopping an action is a hidden button, it is not protected.',
      },
      {
        h2: 'Secrets in the code and the wrong env file',
        body: 'Because you can see your own files in Cursor, it is easy for a secret to end up somewhere it should not — hardcoded in a file, committed to the repo, or placed in a front-end-exposed variable.',
        bullets: [
          'Keys pasted directly into a source file, then pushed to GitHub where they may be public.',
          'A .env file committed to the repo instead of being ignored — anyone with repo access gets every secret.',
          'In Next.js, a secret placed behind the `NEXT_PUBLIC_` prefix, which ships it to every visitor\'s browser.',
          'If a key was ever exposed, replace (rotate) it — deleting the line from a file does not un-leak a key that was already pushed.',
        ],
      },
      {
        h2: 'The database the AI scaffolded',
        body: 'If your Cursor app uses Supabase or Firebase, the AI may have got it working without locking it down.',
        bullets: [
          'Supabase: Row Level Security left off, or a policy set to `using (true)` that allows everyone.',
          'Firebase: security rules left in test mode — `allow read, write: if true` — which lets anyone read and write your whole database.',
          'Either way, the app works perfectly in the demo and is wide open in production.',
        ],
      },
      {
        h2: 'How to check when there is no single template',
        body: 'Because Cursor apps vary, the most reliable answer comes from reading the actual code and config rather than guessing from the outside.',
        bullets: [
          'Start with a free URL scan to catch anything exposed from the outside — open data, leaked keys, missing auth.',
          'Connect the repo for a white-box scan that reads your auth logic, env files, and database rules directly — the best fit for a Cursor project.',
          'Every finding comes with the exact fix or a prompt you can hand straight back to Cursor.',
        ],
      },
    ],
    keyTakeaways: [
      'Cursor is an AI editor, so security depends on the code it wrote — there is no single "default" to blame.',
      'The most common flaw is an auth check that runs only in the browser and leaves the data open.',
      'Watch for secrets hardcoded in files, a committed .env, or a secret behind `NEXT_PUBLIC_`.',
      'Check Supabase RLS and Firebase rules — test-mode rules like `allow read, write: if true` are wide open.',
      'A repo-connected (white-box) scan is the most accurate way to check a Cursor project.',
    ],
    faqs: [
      {
        q: 'Cursor wrote all my code — how do I know it is secure?',
        a: 'You check the code and config, not the tool. The reliable approach is a repo-connected scan that reads your auth logic, secrets handling, and database rules, then reports issues in plain English with exact fixes.',
      },
      {
        q: 'My app checks if the user is logged in before showing a page. Is that enough?',
        a: 'Usually not. If that check runs in the browser, it only affects what people see, not what they can request. The data endpoint or database rule must also verify the caller. Browser checks are for experience; server checks are for security.',
      },
      {
        q: 'I committed my .env file to GitHub. What now?',
        a: 'Rotate every key it contained — assume they are compromised, because removing the file does not un-publish keys that were already pushed. Then keep secrets out of the repo and out of any browser-exposed variable.',
      },
      {
        q: 'Does it matter whether I used Supabase or Firebase with Cursor?',
        a: 'The principle is the same: your data is only as private as its rules. Supabase uses Row Level Security; Firebase uses security rules. Both are frequently left open in test mode, and both are checked by a scan.',
      },
    ],
    related: [
      {
        label: 'How to check for exposed API keys',
        href: '/learn/how-to-check-for-exposed-api-keys',
      },
      {
        label: '7 security holes AI coding tools leave behind',
        href: '/learn/7-security-holes-ai-coding-tools-leave-behind',
      },
      {
        label: 'Are AI-generated apps safe to launch?',
        href: '/learn/are-ai-generated-apps-safe-to-launch',
      },
    ],
    builder: { label: 'Scan your Cursor app free', href: '/cursor-security-scanner' },
  },

  // 4 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'is-my-replit-app-secure',
    type: 'question',
    category: 'Answers',
    title: 'Is my Replit app secure?',
    metaTitle: 'Is My Replit App Secure? | Veilguard',
    metaDescription:
      'A public Repl can expose your source code and any keys pasted into it. Use Replit Secrets, lock down your database, and scan your app to check what is exposed.',
    keywords: [
      'is my replit app secure',
      'replit security',
      'replit secrets',
      'public repl exposed',
      'replit agent security',
    ],
    h1: 'Is my Replit app secure?',
    directAnswer:
      'A Replit app can be perfectly secure, but Replit has one risk that is specific to it: if your Repl is public, anyone can read your source code — including any keys you pasted directly into it. Replit gives you a Secrets manager for exactly this reason. The usual suspects apply too: database rules left wide open and keys shipped to the browser. A scan checks whether anything sensitive is exposed.',
    readMinutes: 6,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'Public Repls can expose your code — and anything in it',
        body: 'On Replit, a project (a "Repl") can be public or private. A public Repl is convenient for sharing and learning, but it means anyone can read every file — including any secret you typed straight into the code. This is the Replit-specific trap: the app runs fine, and the leak is sitting in plain sight in the source.',
        bullets: [
          'Check whether your Repl is public or private before you launch or take payments.',
          'If it is public and you pasted any key into a file, treat that key as compromised and rotate it.',
          'Making a Repl private later does not un-leak a key that was already visible — rotate it anyway.',
          'In reviews of public Repls, [SOURCE NEEDED], a meaningful share were found to contain live keys or credentials in their source.',
        ],
      },
      {
        h2: 'Use Replit Secrets, not hardcoded keys',
        body: 'Replit has a built-in Secrets tab specifically so you never have to put a key in your code. Secrets are stored separately, read by your app at runtime, and are not part of the shared source. This is the single biggest habit that keeps a Replit app safe.',
        code: {
          label: 'Hardcoded key vs. Replit Secrets (Python example)',
          content:
            '# Hardcoded in your source — visible to anyone who can see the Repl\nstripe.api_key = "sk_live_51H..."\n\n# Stored in the Replit "Secrets" tab, read at runtime, never in the code\nimport os\nstripe.api_key = os.environ["STRIPE_SECRET_KEY"]',
        },
        note: 'Same idea in Node/JavaScript: read secrets from process.env, never paste them into a file.',
      },
      {
        h2: 'What the Replit Agent scaffolds',
        body: 'If you used the Replit Agent to build the app, it likely set up a database and login for you. Those need the same checks as any AI-built stack.',
        bullets: [
          'If it connected Supabase, confirm Row Level Security is on and policies are not set to allow everyone.',
          'If it used Firebase, confirm the rules are not still in test mode (`allow read, write: if true`).',
          'If it built its own backend and database, confirm each endpoint checks who is calling before returning private data.',
        ],
      },
      {
        h2: 'Deployments and what reaches the browser',
        body: 'When you deploy a Replit app, the front end is served to real visitors. The same browser rule as everywhere applies: only publishable values belong in front-end code.',
        bullets: [
          'A secret key belongs in Secrets and should be used only by server-side code, never sent to the browser.',
          'Publishable/anon keys are fine in the front end, but a Supabase anon key is only safe if Row Level Security is on.',
          'Double-check that debug pages, admin routes, or test endpoints were not left open on the deployed version.',
        ],
      },
      {
        h2: 'How to check your Replit app',
        body: 'You can get a clear answer without auditing files by hand.',
        bullets: [
          'Run a free URL scan on your deployed app for exposed keys, open data, and missing auth — an A–F grade in about a minute.',
          'Set your Repl to private and move every key into Secrets, then rotate anything that was ever hardcoded.',
          'Connect the repo for a deeper scan that reads your Secrets usage and database rules and hands you exact fixes.',
        ],
      },
    ],
    keyTakeaways: [
      'A public Repl exposes your source code, so any key pasted into a file is readable by anyone.',
      'Use Replit\'s Secrets tab for every key; never hardcode secrets in your code.',
      'Rotate any key that was ever hardcoded in a public Repl — going private later does not undo the exposure.',
      'If the Agent set up Supabase or Firebase, confirm the database rules are locked down, not in test mode.',
      'A free URL scan on your deployed app shows what is exposed from the outside.',
    ],
    faqs: [
      {
        q: 'Is my Replit app public or private, and does it matter?',
        a: 'It matters a lot. A public Repl lets anyone read your source code, including any keys typed into it. Check the visibility of your Repl, and if it is public, move keys into Secrets and rotate anything that was exposed.',
      },
      {
        q: 'What are Replit Secrets and why should I use them?',
        a: 'Secrets is Replit\'s built-in place to store keys separately from your code. Your app reads them at runtime, and they are not part of the shared source. Using Secrets is the main way to keep keys out of a readable Repl.',
      },
      {
        q: 'I hardcoded an API key in a public Repl. Is deleting the line enough?',
        a: 'No. Once a key was visible, assume it is compromised and rotate (replace) it. Then store the new key in Secrets. Deleting the line or going private does not un-expose a key that was already readable.',
      },
      {
        q: 'The Replit Agent built my database. Is it secure by default?',
        a: 'Do not assume so. Whether it used Supabase, Firebase, or its own backend, confirm the access rules limit data to the right user. A scan checks this and gives you the exact fix.',
      },
    ],
    related: [
      {
        label: 'How to check for exposed API keys',
        href: '/learn/how-to-check-for-exposed-api-keys',
      },
      {
        label: 'Complete security checklist for AI-built apps',
        href: '/learn/complete-security-checklist-for-ai-built-apps',
      },
      {
        label: 'Is my Replit app safe to take payments on?',
        href: '/learn/is-it-safe-to-take-payments-on-a-vibe-coded-app',
      },
    ],
    builder: { label: 'Scan your Replit app free', href: '/replit-security-scanner' },
    hasPlaceholders: true,
  },

  // 5 ────────────────────────────────────────────────────────────────────────
  {
    slug: 'is-my-v0-app-secure',
    type: 'question',
    category: 'Answers',
    title: 'Is my v0 app secure?',
    metaTitle: 'Is My v0 App Secure? | Veilguard',
    metaDescription:
      'v0 builds Next.js apps, where any NEXT_PUBLIC_ variable is shipped to the browser. Put a secret there and it is published. Here is how to check your v0 app.',
    keywords: [
      'is my v0 app secure',
      'v0 security',
      'vercel v0 security',
      'next_public env variables',
      'v0 next.js supabase security',
    ],
    h1: 'Is my v0 app secure?',
    directAnswer:
      'v0 builds Next.js App Router apps, and Next.js has one rule that trips up non-engineers: any environment variable whose name starts with `NEXT_PUBLIC_` is bundled into the browser for everyone to see. Put a secret behind that prefix and you have published it. The other v0-specific things to check are server actions that do not re-verify who is calling them, and a Supabase database with open rules. A scan flags all three.',
    readMinutes: 7,
    updated: '2026-08-07',
    sections: [
      {
        h2: 'What v0 builds: Next.js, server and client together',
        body: 'v0 generates modern Next.js App Router apps. In that world, some code runs on the server (where secrets are safe) and some runs in the browser (where nothing is secret). Most v0 security questions come down to one thing: did something that should stay on the server end up in the browser? Data behind a v0 app is often Supabase, so its rules matter too.',
      },
      {
        h2: 'The NEXT_PUBLIC_ rule is the one that matters most',
        body: 'Next.js decides what to send to the browser by the variable name. Anything starting with `NEXT_PUBLIC_` is inlined into the browser build and visible to every visitor. Anything without that prefix stays on the server. This is a naming convention doing a security job, and it is easy to get wrong when you are moving fast.',
        code: {
          label: 'Next.js env vars: the prefix decides who can see it',
          content:
            '# Shipped to every visitor\'s browser. Anything with NEXT_PUBLIC_ is public.\nNEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...   # a service_role key here = full DB access for anyone\nNEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...      # a secret key here is fully exposed\n\n# Server-only secrets have NO prefix — they stay on the server\nSUPABASE_SERVICE_ROLE_KEY=eyJ...\nSTRIPE_SECRET_KEY=sk_live_...\n\n# Values that are public by design are fine with the prefix\nNEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # public by design — safe only if RLS is on',
        },
        note: 'If a real secret ever had the NEXT_PUBLIC_ prefix, rotate it — it was shipped to the browser.',
      },
      {
        h2: 'Server actions and route handlers must re-check the caller',
        body: 'App Router apps use server actions and route handlers to do real work — save data, charge a card, delete a record. It is easy to assume that because a button is hidden from logged-out users, the action behind it is protected. It is not. Anyone can call that action directly, so it has to verify who is asking every time.',
        bullets: [
          'Each server action should confirm the user is logged in and allowed to do that specific thing.',
          'Do not rely on the browser having hidden a button — the action is reachable regardless.',
          'Admin-only actions especially need a server-side role check, not just a hidden link.',
        ],
      },
      {
        h2: 'The database behind it (often Supabase)',
        body: 'When a v0 app stores data in Supabase, the familiar rule returns: your data is only as private as your Row Level Security policies.',
        bullets: [
          'Confirm Row Level Security is turned on for every table that holds user data.',
          'Avoid the "allow everyone" policy (`using (true)`) — limit rows to the logged-in owner instead.',
          'Remember the anon key is safe in the browser only because RLS is doing the real gatekeeping.',
        ],
      },
      {
        h2: 'How to check your v0 app',
        body: 'You can confirm all of this without reading the code.',
        bullets: [
          'Run a free URL scan for anything exposed to the browser — leaked keys, open data, unprotected endpoints — and get an A–F grade in about a minute.',
          'Connect the repo for a deeper scan that reads your env config, server actions, and Supabase policies.',
          'Every finding includes the exact fix or an AI prompt you can paste back into v0.',
        ],
      },
    ],
    keyTakeaways: [
      'v0 builds Next.js App Router apps, so the `NEXT_PUBLIC_` rule is the most important thing to get right.',
      'Any variable starting with `NEXT_PUBLIC_` is public — never put a secret key behind that prefix.',
      'Server actions and route handlers must re-check who is calling; a hidden button is not protection.',
      'If the app uses Supabase, confirm Row Level Security is on and not set to "allow everyone".',
      'A free URL scan shows what a v0 app is exposing to the browser in about a minute.',
    ],
    faqs: [
      {
        q: 'What does the NEXT_PUBLIC_ prefix actually do?',
        a: 'It tells Next.js to include that variable in the browser build, where every visitor can read it. Use it only for values meant to be public, like a Supabase URL or anon key. A secret key must never carry that prefix.',
      },
      {
        q: 'I put my Stripe secret key in a NEXT_PUBLIC_ variable. How bad is that?',
        a: 'Serious, but fixable. That key was shipped to the browser, so rotate it immediately in your Stripe dashboard, then store the new key in a server-only variable (no prefix) and use it only in server code.',
      },
      {
        q: 'My v0 app hides admin buttons from normal users. Is that secure?',
        a: 'Hiding the button improves the experience but does not secure the action behind it. The server action or route handler must independently verify the user is an admin, because it can be called directly.',
      },
      {
        q: 'Does v0 secure my Supabase database for me?',
        a: 'No tool secures your database automatically. Confirm Row Level Security is on for each table and that policies limit data to the right user. A scan checks your policies and gives you the exact SQL fix.',
      },
    ],
    related: [
      {
        label: 'How to check for exposed API keys',
        href: '/learn/how-to-check-for-exposed-api-keys',
      },
      {
        label: 'Supabase Row Level Security, explained for non-developers',
        href: '/learn/supabase-row-level-security-explained-for-non-developers',
      },
      {
        label: 'Is my Cursor app secure?',
        href: '/learn/is-my-cursor-app-secure',
      },
    ],
    builder: { label: 'Scan your v0 app free', href: '/v0-security-scanner' },
  },
];
