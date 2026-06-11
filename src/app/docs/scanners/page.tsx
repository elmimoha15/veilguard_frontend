import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veilguard Scanners — 14 Security Checks for AI-Generated Code',
  description: 'Detailed documentation for all 14 Veilguard security scanners. Secret detection, SQL injection, Supabase RLS audit, webhook verification, supply chain checks, app-layer security, AI rules-file backdoors, and more.',
  keywords: ['API key scanner', 'secret detection tool', 'SQL injection scanner', 'Supabase RLS audit tool', 'webhook security scanner', 'supply chain attack detection', 'CORS scanner', 'vibe coding security scanners'],
  alternates: { canonical: '/docs/scanners' },
  openGraph: { url: 'https://veilguard.dev/docs/scanners' },
};

const scanners = [
  {
    id: 'scan_secrets',
    name: 'Secret Scanner',
    pro: false,
    desc: 'Detects 60+ hardcoded API key patterns across all your files — Stripe, Supabase, OpenAI, Paystack, Flutterwave, M-Pesa, AWS, Firebase, GitHub, Twilio, SendGrid, Resend, MongoDB/Postgres/Redis URIs, and more. Specifically catches the most common AI coding mistake: live keys embedded as fallback values (e.g. process.env.STRIPE_KEY || \'sk_live_...\'). These end up in your git history even after you "delete" them.',
    trigger: 'Ask your AI agent to scan any file or set of files',
    example: 'CRITICAL: Stripe live key detected in src/lib/payments.ts:14',
  },
  {
    id: 'scan_injection',
    name: 'Injection Scanner',
    pro: false,
    desc: 'Finds SQL injection via template literals (db.query(`SELECT * FROM users WHERE id = ${id}`)), unsanitized req.body passed directly to database inserts, exec() calls with user-controlled input, NoSQL injection patterns, IDOR vulnerabilities, and mass assignment risks. AI coding tools regularly produce these patterns when speed is prioritized over safety.',
    trigger: 'Ask your AI agent to scan API routes or database query files',
    example: 'CRITICAL: SQL injection risk in db.query() at app/api/users/route.ts:23',
  },
  {
    id: 'scan_webhooks',
    name: 'Webhook Verifier',
    pro: false,
    desc: 'Checks webhook endpoint handlers for missing signature verification. Catches unverified Stripe webhooks (missing constructEvent), Paystack (missing HMAC check on x-paystack-signature), M-Pesa/Daraja (missing IP allowlist for 196.201.214.*, 196.201.213.*), GitHub (missing HMAC signature), and Flutterwave (missing verif-hash header check). An unverified webhook lets any attacker send fake payment confirmations to your app.',
    trigger: 'Ask your AI agent to scan your API routes or webhooks folder',
    example: 'CRITICAL: Stripe webhook in app/api/webhooks/route.ts missing constructEvent verification',
  },
  {
    id: 'check_env',
    name: 'Environment Security',
    pro: false,
    desc: 'Verifies that .env files are listed in .gitignore and not tracked by git. Detects secrets accidentally exposed to the browser via NEXT_PUBLIC_ or VITE_ variable prefixes — anything prefixed this way gets bundled into client-side JavaScript and is visible to every visitor. Also flags .env.local and .env.production files committed to the repo.',
    trigger: 'Ask your AI agent to check your environment configuration',
    example: 'WARNING: NEXT_PUBLIC_SUPABASE_SERVICE_KEY exposes a secret to the browser bundle',
  },
  {
    id: 'check_cors',
    name: 'CORS Misconfiguration',
    pro: false,
    desc: 'Catches cors({ origin: \'*\' }) on Express or Next.js apps that have authentication — a wildcard origin allows any website to make credentialed requests to your API on behalf of your users. Also detects overly permissive Access-Control-Allow-Origin headers set manually in API routes. AI tools frequently generate wildcard CORS as a "just make it work" fix.',
    trigger: 'Ask your AI agent to check your API server or middleware configuration',
    example: 'WARNING: Wildcard CORS origin on authenticated app in server/index.ts:12',
  },
  {
    id: 'check_supply_chain',
    name: 'Supply Chain Scanner',
    pro: false,
    desc: 'Compares your installed npm packages against a database of known malicious and typosquatted package names. Catches packages like lodahs (typosquat of lodash), crossenv (known credential stealer that exfiltrates environment variables on install), and dozens of other confirmed malicious packages. AI agents sometimes suggest slightly wrong package names that resolve to malicious packages.',
    trigger: 'Ask your AI agent to check your package.json for supply chain risks',
    example: 'CRITICAL: crossenv@1.0.0 is a known credential-stealing package — did you mean cross-env?',
  },
  {
    id: 'scan_dependencies',
    name: 'Dependency CVE Checker',
    pro: false,
    desc: 'Sends your npm dependency names and versions to Google\'s OSV.dev API (no code is sent — package names only) and returns known CVEs for each package. Flags critical and high-severity vulnerabilities with the fix version so you can upgrade immediately. Runs without sending any of your source code.',
    trigger: 'Ask your AI agent to check your dependencies for known vulnerabilities',
    example: 'WARNING: CVE-2024-34352 in next-auth@4.24.5 — upgrade to 4.24.7',
  },
  {
    id: 'check_auth_config',
    name: 'Auth Configuration',
    pro: false,
    desc: 'Validates your authentication setup for Clerk, NextAuth, and Supabase Auth. Catches getSession() used in server-side code (should be getUser() — session data can be spoofed), sessions stored in localStorage instead of HTTP-only cookies, missing rate limiting on login and signup endpoints, and JWT secret keys that are too short or hardcoded.',
    trigger: 'Ask your AI agent to audit your authentication configuration',
    example: 'WARNING: getSession() used in server context at lib/auth.ts:8 — use getUser() to prevent session spoofing',
  },
  {
    id: 'check_headers',
    name: 'Security Headers',
    pro: false,
    desc: 'Checks your deployed application URL for the presence and correct configuration of HTTP security headers: Content-Security-Policy (prevents XSS), Strict-Transport-Security (enforces HTTPS), X-Frame-Options (prevents clickjacking), X-Content-Type-Options (prevents MIME sniffing), Referrer-Policy, and Permissions-Policy. Requires a deployed URL to run.',
    trigger: 'Ask your AI agent to check security headers on your deployed URL',
    example: 'WARNING: Missing Content-Security-Policy header on https://yourapp.com',
  },
  {
    id: 'check_git',
    name: 'Git Security',
    pro: false,
    desc: 'Scans your git history for secrets that were committed and later "deleted" — deletion removes them from HEAD but they remain fully readable in git history. Also finds .gitignore gaps (common secret files not covered), .env files currently tracked by git, and committed node_modules. This is critical because anyone who clones your repo, including public forks, can read deleted secrets.',
    trigger: 'Ask your AI agent to scan your git history for leaked secrets',
    example: 'CRITICAL: Stripe key found in commit abc1234 — deleted in HEAD but readable in git history',
  },
  {
    id: 'check_supabase_rls',
    name: 'Supabase RLS Audit',
    pro: false,
    desc: 'Deep analysis of your Supabase Row Level Security policies by querying pg_policies. Catches the most dangerous RLS patterns: USING(true) (allows anyone to read all rows), disabled RLS on tables with sensitive data, auth.role() = \'authenticated\' bypass (any logged-in user can access all rows, not just their own), auth.uid() IS NOT NULL bypass, missing policies entirely, and storage bucket misconfiguration. These are the exact patterns behind the Moltbook breach (1.5M API keys leaked) and Lovable CVE-2025-48757 (170 apps exposed).',
    trigger: 'Ask your AI agent to audit your Supabase Row Level Security',
    example: 'CRITICAL: Missing Row Level Security on "users" table — any anon key holder can read all rows',
  },
  {
    id: 'check_firebase',
    name: 'Firebase Rules Audit',
    pro: false,
    desc: 'Reads and analyzes your Firebase security rules files (firestore.rules, storage.rules). Catches allow read, write: if true (fully public database), client-controlled userId checks where the attacker sets their own ID to bypass ownership rules, authentication-only policies that allow any authenticated user to access any document, and missing auth checks entirely.',
    trigger: 'Ask your AI agent to audit your Firebase security rules',
    example: 'WARNING: Insecure "if true" rule in Firestore rules — allows public read/write on all documents',
  },
  {
    id: 'scan_app_security',
    name: 'App Security Scanner',
    pro: false,
    desc: 'Detects application-layer security gaps that AI agents routinely ship: missing rate limiting on auth and payment routes, IDOR (insecure direct object references — where changing an ID in the URL exposes another user\'s data), insecure password storage (plaintext, MD5, SHA-1, unsalted SHA-256, low-cost bcrypt), unsafe file uploads (no size limit, no type filter, public upload dirs), leaked error stack traces, sensitive data in logs, open redirects, and mass assignment via req.body spread.',
    trigger: 'Ask your AI agent to check your app for IDOR, rate limiting, and password storage issues',
    example: 'CRITICAL: IDOR in app/api/orders/[id]/route.ts — any user can read another user\'s order by changing the ID',
  },
  {
    id: 'scan_rules_files',
    name: 'AI Rules File Scanner',
    pro: false,
    desc: 'Scans your AI rules files (.cursorrules, .windsurfrules, CLAUDE.md, .github/copilot-instructions.md, and similar) for hidden attacks that hijack your coding agent: invisible Unicode characters and zero-width backdoors, base64-encoded payloads, suspicious URLs, and malicious instructions injected into the very files that steer your AI. A poisoned rules file can silently tell your agent to exfiltrate secrets or write in vulnerabilities.',
    trigger: 'Ask your AI agent to scan your rules files for hidden instructions or backdoors',
    example: 'CRITICAL: Hidden Unicode instruction detected in .cursorrules — possible prompt-injection backdoor',
  },
  {
    id: 'full_audit',
    name: 'Full Security Audit',
    pro: true,
    desc: 'Runs all the codebase scanners in sequence across your entire project, calculates a security score from 0 to 100, and assigns a letter grade from A+ to F. Then generates a single AI-ready fix prompt containing every issue found — paste it into your coding agent to fix everything at once. Pro-only and unlimited; on free, calling it returns an upgrade prompt (run the individual scanners for free vulnerability alerts).',
    trigger: 'Ask your AI agent to run a full security audit before deployment',
    example: 'GRADE B: 11 issues found across your project. AI fix prompt generated — paste to fix all.',
  },
];

export default function DocsScannersPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-3">Scanner Reference</h1>
      <p className="text-sm text-text-body mb-2">
        All 14 security scanners Veilguard can run on your project. To use any scanner, ask your AI agent directly — for example: <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded">&quot;scan this file for secrets&quot;</span> or <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded">&quot;audit my Supabase RLS policies&quot;</span>.
      </p>
      <p className="text-sm text-text-muted mb-8">
        All 14 scanners are free. The Full Security Audit runs them all together — its letter grade and AI-ready fix prompt are the Pro upgrade.
      </p>

      <div className="space-y-6 not-prose">
        {scanners.map((s) => (
          <div
            key={s.id}
            className={`p-6 rounded-xl border bg-background-card ${
              s.pro
                ? 'border-accent/40 shadow-[0_0_20px_rgba(52,211,153,0.05)]'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-sm font-mono text-text-heading">{s.id}</h3>
              {s.pro && (
                <span className="bg-accent-muted text-accent border border-accent/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                  Pro
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-text-heading mb-3">{s.name}</p>

            <p className="text-sm text-text-body mb-5 leading-relaxed">{s.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background-code rounded-lg p-4 border border-[#334155]">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Example Output</div>
                <div className="font-mono text-sm text-status-warning" title={s.example}>
                  {s.example}
                </div>
              </div>
              <div className="bg-background-code rounded-lg p-4 border border-[#334155]">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">How to Trigger</div>
                <div className="text-sm text-text-body">{s.trigger}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
