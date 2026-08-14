import type { Article } from './types';

/**
 * Flagship research page ("// RESEARCH"). SCAFFOLD ONLY.
 *
 * ACCURACY RULE: this page must contain ZERO invented numbers. Every statistic,
 * count, percentage, or finding is the literal token [DATA NEEDED] until it is
 * replaced with real data from an actual scan run. Do not publish until filled.
 */
export const RESEARCH: Article[] = [
  {
    slug: 'we-scanned-ai-built-apps-what-we-found',
    type: 'research',
    category: '// RESEARCH',

    title: 'We scanned [DATA NEEDED] AI-built apps',
    metaTitle: 'We Scanned [DATA NEEDED] AI-Built Apps: The Findings',
    metaDescription:
      'Original Veilguard research into the security of apps built with AI coding tools. SCAFFOLD, every figure is [DATA NEEDED] until replaced with real scan data before publishing.',
    keywords: [
      'AI-built app security research',
      'AI app security study',
      'Lovable security',
      'Supabase RLS study',
      'vibe coding security',
    ],

    h1: "We scanned [DATA NEEDED] AI-built apps, here's what we found",
    directAnswer:
      "We ran Veilguard against [DATA NEEDED] apps built with AI coding tools and found that [DATA NEEDED] of them shipped at least one serious security issue. The most common problem was [DATA NEEDED], appearing in [DATA NEEDED] of the apps we scanned. [DATA NEEDED], one-sentence takeaway for a founder. Full methodology and per-builder breakdown below. (SCAFFOLD: every figure here is a placeholder until real scan data is in.)",
    readMinutes: 7,
    updated: '2026-08-07',

    sections: [
      {
        h2: 'Methodology, how we collected the sample',
        body: "We scanned a sample of [DATA NEEDED] apps built with AI coding tools between [DATA NEEDED] and [DATA NEEDED]. The intended method: describe here exactly how the sample was sourced, [DATA NEEDED] (e.g. opt-in scans, a curated list of public URLs, a specific directory), and note any selection bias plainly. Each app was scanned with [DATA NEEDED: black-box URL scan / connected white-box scan / both]. We counted an app as having an issue when [DATA NEEDED, the exact severity threshold]. All scans were read-only and no source code was stored.",
        note: 'Draft scaffold, do not publish until filled with real scan data.',
      },
      {
        h2: 'Headline findings',
        body: 'The numbers below are placeholders. Replace each one with a real figure from the scan run, and keep the description accurate to what that figure actually measures. Do not add a finding we did not measure.',
        bullets: [
          '[DATA NEEDED], share of scanned apps with at least one serious issue.',
          '[DATA NEEDED], share with a publicly readable database (e.g. missing or permissive Row Level Security).',
          '[DATA NEEDED], share leaking a secret or API key into the browser bundle.',
          '[DATA NEEDED], share with authentication or authorization enforced only client-side.',
          '[DATA NEEDED], share with unsigned or unverified payment webhooks.',
          '[DATA NEEDED], share with a public / world-readable storage bucket.',
          '[DATA NEEDED], average number of issues per app.',
        ],
      },
      {
        h2: 'Breakdown by builder',
        body: "How findings differed across the AI tools apps were built with. Fill each row with real per-builder figures and the sample size for that builder (small samples are not comparable, say so). If a builder had too few apps to report, write that plainly rather than implying a trend.",
        bullets: [
          'Lovable, sample [DATA NEEDED]; share with a serious issue [DATA NEEDED]; most common issue [DATA NEEDED].',
          'Bolt, sample [DATA NEEDED]; share with a serious issue [DATA NEEDED]; most common issue [DATA NEEDED].',
          'Cursor, sample [DATA NEEDED]; share with a serious issue [DATA NEEDED]; most common issue [DATA NEEDED].',
          'Replit, sample [DATA NEEDED]; share with a serious issue [DATA NEEDED]; most common issue [DATA NEEDED].',
          'v0, sample [DATA NEEDED]; share with a serious issue [DATA NEEDED]; most common issue [DATA NEEDED].',
        ],
        note: 'Do not compare builders unless each sample is large enough to be meaningful. Report sample sizes alongside every figure.',
      },
      {
        h2: 'The most common issue',
        body: "The single most frequent problem was [DATA NEEDED], found in [DATA NEEDED] of scanned apps. Explain in plain English what it is, why AI tools tend to ship it by default, and what an attacker could actually do with it, [DATA NEEDED for the specifics]. Keep this non-alarmist but honest, and describe only what the data supports.",
      },
      {
        h2: 'What it means for founders',
        body: "Translate the findings into plain, practical guidance for a non-technical founder who is charging money or about to launch, [DATA NEEDED to ground each point in a real figure]. The message is not 'panic'; it's 'these are common, they're fixable, and you should check before someone else does.' Link the reader to the free URL scan so they can see where their own app stands.",
      },
      {
        h2: 'Method notes and limitations',
        body: "State the limits honestly so the research holds up to scrutiny: sample size and how it was sourced ([DATA NEEDED]); any selection bias ([DATA NEEDED]); the fact that a scanner finds common patterns and is not a manual penetration test; the date range of the scans ([DATA NEEDED]); and that results reflect apps at the moment of scanning, not afterward. Note what we deliberately did not measure so no one over-reads the numbers.",
      },
    ],

    keyTakeaways: [
      '[DATA NEEDED], headline: share of AI-built apps with at least one serious security issue.',
      '[DATA NEEDED], the single most common issue and how often it appeared.',
      '[DATA NEEDED], the most notable difference (if any) between builders, with sample sizes.',
      '[DATA NEEDED], the one thing a founder should do first based on the findings.',
      'Every figure on this page is a placeholder until replaced with real scan data.',
    ],

    faqs: [
      {
        q: 'How many apps did you scan?',
        a: '[DATA NEEDED], fill in the real sample size and the date range once the scan run is complete.',
      },
      {
        q: 'How did you choose which apps to scan?',
        a: '[DATA NEEDED], describe exactly how the sample was sourced and disclose any selection bias. Do not overstate how representative it is.',
      },
      {
        q: 'Does this mean AI coding tools are unsafe?',
        a: "[DATA NEEDED], answer from what the data actually shows. The honest framing: AI tools ship insecure defaults that are common and fixable, not that the tools are unusable. Only claim what the numbers support.",
      },
    ],

    related: [
      {
        label: '7 security holes AI coding tools leave behind',
        href: '/guides/7-security-holes-ai-coding-tools-leave-behind',
      },
      {
        label: 'Complete security checklist for AI-built apps',
        href: '/guides/complete-security-checklist-for-ai-built-apps',
      },
    ],
    builder: { label: 'Scan your app free', href: '/scanners/lovable' },

    hasPlaceholders: true,
  },
];
