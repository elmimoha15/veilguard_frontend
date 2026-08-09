import type { Article } from './types';

/**
 * Comparison pages ("// COMPARE"). Honest, useful side-by-sides for a
 * non-technical founder deciding how to check their app's security.
 *
 * ACCURACY RULE: never invent competitor facts, pricing, or features. Any claim
 * about a named competitor must carry [SOURCE NEEDED] until verified from their
 * own site. The template entry is a fillable skeleton — it asserts nothing.
 */
export const COMPARISONS: Article[] = [
  {
    slug: 'how-to-check-your-apps-security-free-vs-veilguard',
    type: 'comparison',
    category: '// COMPARE',

    title: 'Free ways to check your app vs Veilguard',
    metaTitle: 'How to Check Your App Security: Free vs Veilguard',
    metaDescription:
      'A fair look at the real ways to check an AI-built app for security holes — DIY checks, free tools, hiring a pentester, and Veilguard. What each catches, misses, and costs.',
    keywords: [
      'check app security',
      'free security scanner',
      'AI app security',
      'how to test app security',
      'Supabase security check',
    ],

    h1: "How to check your app's security: free methods vs Veilguard",
    directAnswer:
      "There is no single 'best' way to check your app — the right choice depends on your risk and budget. Free DIY checks and generic tools catch some real problems for $0 but miss the ones specific to AI-built stacks and never tell you exactly how to fix them. Hiring a penetration tester is the gold standard but costs thousands and takes weeks. Veilguard sits in the middle: it scans an AI-built app in about 60 seconds, grades it A–F in plain English, and hands you the exact fix — but it is not a substitute for a professional audit on a genuinely high-risk product.",
    readMinutes: 8,
    updated: '2026-08-07',

    sections: [
      {
        h2: 'The four realistic options',
        body: "If you built an app with an AI tool and you're wondering whether it's safe, you have four honest choices. None of them is a scam and none of them is magic. This page lays out what each one actually does, what it misses, how much skill and time it takes, and what it costs — so you can pick based on your situation, not on hype.\n\nA quick rule of thumb: the more people trust your app with money or personal data, the more of these you should stack together. Free checks and Veilguard are not mutually exclusive with a professional audit — they are the sensible first steps before one.",
      },
      {
        h2: 'Option 1 — Manual DIY checks (view-source, network tab, reading your policies)',
        body: "You can learn a surprising amount for free just by poking at your own app the way an attacker would. Open your site, hit F12 to open your browser's developer tools, and watch the Network tab while you use the app. Look at what data comes back, and whether you can see other people's records. Use 'View Source' and search the page for anything that looks like a secret key. Open your Supabase or Firebase dashboard and actually read your Row Level Security (RLS) policies and rules.",
        bullets: [
          'What it catches: obvious leaks — secret keys shipped to the browser, an API that returns every user\'s data, a database table left fully public, a page you can reach without logging in.',
          'What it misses: anything you don\'t already know to look for. Unsigned payment webhooks, subtle policy gaps, injection flaws, and misconfigured storage buckets rarely show up unless you know the exact pattern.',
          'Effort / skill: low cost, but medium-to-high skill. You have to know what "bad" looks like, and most non-technical founders don\'t — which is exactly the trap.',
          'Cost: $0.',
        ],
        note: "Honest take: this is genuinely worth doing and it's free. But 'I looked and nothing seemed wrong' is not the same as 'it's secure' — you can only catch the holes you already understand.",
      },
      {
        h2: 'Option 2 — Free and generic tools (Supabase linter, header/SSL scanners, open-source scanners)',
        body: "There are good free tools, and you should use them. Supabase ships a built-in database linter that flags tables without RLS enabled. Free online scanners will grade your HTTPS setup and security headers. Open-source scanners can crawl your site for common web vulnerabilities. Each of these is real and useful within its lane.",
        bullets: [
          'What they catch: the specific thing each was built for — Supabase\'s linter flags RLS-off tables; SSL/header checkers grade your transport and headers; general web scanners find common, well-known vulnerability patterns.',
          'What they miss: the cross-cutting, stack-specific mistakes AI tools make. A linter tells you RLS is off, but not that your policy lets any logged-in user read every row. Header scanners know nothing about your database or payment flow.',
          'Effort / skill: low-to-medium. Running them is easy; stitching a dozen tools together and interpreting a wall of technical output is the hard part.',
          'Cost: $0, sometimes with paid upgrades.',
        ],
        note: "Honest take: free tools are excellent and you lose nothing by running them. Their limit isn't accuracy — it's that each one sees a sliver of the picture and speaks in jargon, so you're left assembling the puzzle yourself.",
      },
      {
        h2: 'Option 3 — Hiring a penetration tester',
        body: "A professional penetration test is a human security expert manually attacking your app, thinking creatively, and chaining small weaknesses into real exploits. This is the most thorough option that exists, full stop. If you handle sensitive data, take significant payments, or have compliance obligations, a real audit is the right call and nothing on this page replaces it.",
        bullets: [
          'What it catches: nearly everything the other options do, plus business-logic flaws and creative attack chains that no automated tool reliably finds.',
          'What it misses: it\'s a snapshot in time. The report reflects your app on the day of the test; your next AI-assisted deploy can reintroduce a hole the next morning.',
          'Effort / skill: low effort for you, but you must find a reputable tester and be ready to act on a technical report.',
          'Cost: typically thousands of dollars and days-to-weeks of turnaround. [SOURCE NEEDED] for any specific price figures.',
        ],
        note: "Honest take: this is the gold standard and we won't pretend otherwise. The catch is cost, speed, and that it's a one-time photo — not a continuous safety net.",
      },
      {
        h2: 'Option 4 — Veilguard',
        body: "Veilguard is a security scanner built specifically for apps made with AI coding tools (Lovable, Bolt, Cursor, Replit, v0) on stacks like Next.js with Supabase or Firebase and Stripe. You give it a URL and in about 60 seconds you get an A–F grade, every issue explained in plain English, and — this is the point — the exact copy-paste fix or a ready-made prompt for your AI tool. The paid tier adds connected repo and folder-upload scans, unlocks every fix, and keeps re-scanning on each deploy with email alerts when a new hole appears.",
        bullets: [
          'What it catches: the insecure defaults AI tools ship — public database rows, keys in the browser bundle, auth checks that run only in the browser, unsigned payment webhooks, public storage buckets — tuned to the exact mistakes these stacks make.',
          'What it misses: deep business-logic flaws and creative human attack chains. It is not a manual penetration test and does not claim to be.',
          'Effort / skill: very low. It\'s built for non-engineers — plain-English findings and fixes you can paste in, no security background required.',
          'Cost: free URL scan with the full grade and every issue explained, no signup; Guard is $19/month for connected scans, all fixes, and continuous monitoring.',
        ],
        note: "Honest take: our edge is plain English, the exact fix (not just a scary list), AI-stack specificity, and monitoring that keeps watching after you ship. Our limit is that we are not a replacement for a professional audit on a high-risk product — if that's you, use Veilguard to clean up first, then get audited.",
      },
      {
        h2: 'So which should you pick?',
        body: "Stack them, don't rank them. Almost everyone should start by running the free DIY checks and free tools — they cost nothing. If you're an AI-app builder who wants a clear grade, plain-English explanations, and the actual fixes without a security background, that's exactly what Veilguard is for, and the URL scan is free to try. If your app holds genuinely sensitive data or moves serious money, budget for a professional penetration test — and use the cheaper options to fix the easy stuff first so you're not paying an expert to find things a scanner would have caught.",
      },
    ],

    keyTakeaways: [
      'There is no single best method — match the effort to how much your app is trusted with money and personal data.',
      'Free DIY checks and generic tools are genuinely worth doing and cost $0, but they only catch what you already know to look for and speak in jargon.',
      'A professional penetration test is the gold standard, but it costs thousands, takes time, and only reflects your app on the day of the test.',
      "Veilguard's edge is plain English, the exact fix, AI-stack specificity, and continuous monitoring — with a free URL scan to start.",
      'Veilguard is not a replacement for a professional audit on a high-risk product. If that\'s you, fix the easy issues first, then get audited.',
    ],

    faqs: [
      {
        q: 'Is a free security check good enough before I launch?',
        a: "For a low-risk app it's a reasonable start, especially if you run the free DIY checks and free tools together. But free methods miss the stack-specific holes AI tools leave behind, so treat 'nothing obvious found' as a first pass, not a clean bill of health.",
      },
      {
        q: 'Does Veilguard replace hiring a penetration tester?',
        a: 'No, and we say so plainly. Veilguard finds and fixes the common insecure defaults in AI-built apps fast and in plain English. A professional pentester finds deeper business-logic and creative attack chains. On a high-risk product you want both — Veilguard first to clean up, then an audit.',
      },
      {
        q: 'Can I just use the Supabase linter instead?',
        a: "Use it — it's a good tool. It flags tables without Row Level Security enabled, but it won't tell you that an enabled policy still lets any logged-in user read everyone's rows, and it knows nothing about your payment flow or browser bundle. It sees one slice; Veilguard is built to see the whole picture and explain it.",
      },
    ],

    related: [
      {
        label: 'Complete security checklist for AI-built apps',
        href: '/learn/complete-security-checklist-for-ai-built-apps',
      },
      {
        label: 'Are AI-generated apps safe to launch?',
        href: '/learn/are-ai-generated-apps-safe-to-launch',
      },
      {
        label: 'How to secure your app before launch',
        href: '/learn/how-to-secure-your-app-before-launch',
      },
    ],
    builder: { label: 'Scan your Lovable app free', href: '/lovable-security-scanner' },

    hasPlaceholders: true,
  },

  {
    // REUSABLE TEMPLATE — duplicate this entry per competitor and fill every
    // [BRACKETED] placeholder. Never assert a fact about a real competitor
    // without a [SOURCE NEEDED] verified from their own site.
    slug: 'veilguard-vs-competitor-template',
    type: 'comparison',
    category: '// COMPARE',

    title: 'Veilguard vs [COMPETITOR] (template)',
    metaTitle: 'Veilguard vs [COMPETITOR]: AI App Security Scanners',
    metaDescription:
      'A fair, source-checked comparison of Veilguard and [COMPETITOR] for securing AI-built apps. TEMPLATE — duplicate per competitor and verify every claim from the competitor\'s own site.',
    keywords: [
      'veilguard vs [COMPETITOR]',
      '[COMPETITOR] alternative',
      'AI app security scanner comparison',
    ],

    h1: 'Veilguard vs [COMPETITOR]: which security scanner for AI-built apps?',
    directAnswer:
      'TEMPLATE — fill this in per competitor. Write a 2–4 sentence honest summary: what [COMPETITOR] is best at, what Veilguard is best at, and who should pick which. Do not declare a blanket winner — match the recommendation to the reader\'s situation. Verify every [COMPETITOR] claim from their own site before publishing; use [SOURCE NEEDED] until you have.',
    readMinutes: 6,
    updated: '2026-08-07',

    sections: [
      {
        h2: 'How to use this template',
        body: "This is a reusable skeleton, not a finished page. Duplicate this entry, give it a real slug (e.g. veilguard-vs-acme), and replace every bracketed placeholder. Rules: (1) Never assert a fact about a real competitor without verifying it from [COMPETITOR]'s own site or docs — mark anything unverified [SOURCE NEEDED]. (2) Be fair; describe what [COMPETITOR] genuinely does well. (3) Don't guess pricing or features. (4) Remove this 'How to use' section before publishing, and clear hasPlaceholders once every bracket is gone.",
        note: 'Draft template — do not publish until every [BRACKETED] placeholder is filled and every competitor claim is source-checked.',
      },
      {
        h2: 'Overview — what each product is',
        body: "Veilguard is a security scanner built specifically for apps made with AI coding tools (Lovable, Bolt, Cursor, Replit, v0) on Next.js with Supabase/Firebase and Stripe. It returns an A–F grade in plain English in about 60 seconds and hands you the exact fix for each issue, with continuous monitoring on the paid tier.\n\nFill in [COMPETITOR]'s overview — what category they position in and who they build for. Verify from their site; do not guess. [SOURCE NEEDED]",
      },
      {
        h2: 'What each one actually does',
        body: "Veilguard: free no-signup URL (black-box) scan with the full grade and every issue explained; paid Guard tier adds connected repo + folder-upload (white-box) scans, all fixes unlocked (code + AI prompt), auto re-scan on every deploy, and email alerts.\n\nFill in [COMPETITOR FEATURES] — describe what [COMPETITOR] scans, how, and what the output looks like, in the same plain terms. Verify each capability from their site. [SOURCE NEEDED]",
        bullets: [
          'Veilguard scans: [describe — already filled above, trim as needed]',
          '[COMPETITOR] scans: [COMPETITOR FEATURES] — verify from their site, do not guess. [SOURCE NEEDED]',
          'Output style — Veilguard: plain-English A–F grade + exact copy-paste fix or AI prompt.',
          'Output style — [COMPETITOR]: [SOURCE NEEDED] — describe their report format honestly.',
        ],
      },
      {
        h2: 'Pricing',
        body: "Veilguard: free URL scan (no signup); Guard is $19/month for connected scans, all fixes, and continuous monitoring; billed via Polar with a 14-day money-back guarantee.\n\nFill in [COMPETITOR PRICING] — copy their current tiers exactly from their pricing page and date-stamp when you checked, since pricing changes. Do not estimate. [SOURCE NEEDED]",
        bullets: [
          'Veilguard: Free URL scan · Guard $19/mo.',
          '[COMPETITOR]: [COMPETITOR PRICING] — verify from their pricing page, do not guess. [SOURCE NEEDED]',
        ],
      },
      {
        h2: 'Best for — who should pick which',
        body: "Be genuinely helpful here, not partisan. Describe the reader for whom [COMPETITOR] is the better fit as honestly as the reader for whom Veilguard is. A comparison that pretends the competitor has no strengths reads as marketing and loses trust.",
        bullets: [
          'Pick Veilguard if: you built with an AI tool, want a plain-English grade and the exact fix without a security background, and want monitoring on every deploy.',
          'Pick [COMPETITOR] if: [describe the situation where [COMPETITOR] is genuinely the better choice] — [SOURCE NEEDED] to back any capability claim.',
        ],
      },
      {
        h2: 'Honest verdict',
        body: "Write a fair closing summary. State plainly what [COMPETITOR] does well and where Veilguard is the stronger fit, and point the reader to the free Veilguard URL scan so they can judge for themselves. Avoid absolute claims like 'the best' or 'always'. Every factual statement about [COMPETITOR] must trace to [SOURCE NEEDED].",
      },
    ],

    keyTakeaways: [
      'TEMPLATE — replace every takeaway with a source-checked, specific point.',
      "[COMPETITOR]'s genuine strength is: [fill in — SOURCE NEEDED].",
      "Veilguard's edge for AI-built apps: plain English, the exact fix, AI-stack specificity, and monitoring.",
      'Neither is a replacement for a professional audit on a high-risk product — say so.',
      'Verify all [COMPETITOR] pricing/features from their own site and clear hasPlaceholders before publishing.',
    ],

    faqs: [
      {
        q: 'Is Veilguard or [COMPETITOR] better?',
        a: 'TEMPLATE — answer honestly for the reader\'s situation rather than declaring a universal winner. Verify all [COMPETITOR] claims from their site. [SOURCE NEEDED]',
      },
      {
        q: 'Does [COMPETITOR] support AI-built stacks like Lovable and Supabase?',
        a: '[SOURCE NEEDED] — confirm from [COMPETITOR]\'s own documentation before stating this either way. Do not guess.',
      },
    ],

    related: [
      {
        label: 'Complete security checklist for AI-built apps',
        href: '/learn/complete-security-checklist-for-ai-built-apps',
      },
      {
        label: 'Are AI-generated apps safe to launch?',
        href: '/learn/are-ai-generated-apps-safe-to-launch',
      },
      {
        label: 'How to secure your app before launch',
        href: '/learn/how-to-secure-your-app-before-launch',
      },
    ],
    builder: { label: 'Try the free Veilguard URL scan', href: '/lovable-security-scanner' },

    hasPlaceholders: true,
  },
];
