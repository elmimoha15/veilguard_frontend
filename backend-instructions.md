# Veilguard Backend — Build Plan & SLICE 1: The Scanner Core

We build the backend in **vertical slices**, in order. Each slice ends with a **testing gate** — a checklist that must fully pass before the next slice is written. Do not move on until the gate passes.

**The slices (for context — you're building Slice 1 now):**
1. **Scanner core (standalone CLI)** ← THIS FILE. Detect real vulnerabilities, output JSON. No Firebase, no frontend, no auth.
2. Scan service: wrap the core in a Cloud Run worker + Cloud Tasks queue + Firestore.
3. Free-scan path end-to-end with a throwaway UI (live-streaming findings).
4. Auth + accounts (Firebase Auth).
5. Connected/deep scans (GitHub + Supabase read-only).
6. Billing (Stripe) + server-side paywall on fixes.
7. Monitoring (GitHub webhooks + scheduled re-scans + email alerts).
Real designed frontend is integrated last.

---

# SLICE 1 — Scanner Core (paste into Claude Code)

```
Build a STANDALONE security scanner as a Node.js + TypeScript CLI. This is the core engine of a product that scans web/SaaS apps (especially AI-built apps on Next.js + Supabase/Firebase + Stripe) for security holes. In THIS slice there is NO Firebase, NO web frontend, NO auth, NO database. The deliverable is a program I run from the terminal that takes a target and prints findings as JSON. It must be well-tested before we build anything else.

═══════════════════════════════════════════
GOALS
═══════════════════════════════════════════
- Input: either a live URL (black-box) or a local path to a code repo (white-box). Support both.
- Output: a JSON report of findings + an A–F grade, plus a readable terminal summary.
- Accurate: it must catch real vulnerabilities AND must NOT false-positive on values that are public by design (e.g. Stripe publishable keys). The false-positive suppression is as important as detection — getting this wrong makes the product look amateur.
- Extensible: adding a new rule later must be a small, isolated change.

═══════════════════════════════════════════
TECH & PROJECT STRUCTURE
═══════════════════════════════════════════
- Node.js (LTS) + TypeScript, strict mode. Package name: veilguard-scanner.
- CLI via commander. Schema validation via zod. Shell out to external tools via execa. HTML parsing via cheerio. JS/TS AST via @babel/parser (or ts-morph). Fast file globbing via fast-glob.
- External OSS engines invoked as CLIs (document install steps in the README, and detect gracefully if missing):
  - **Semgrep** — SAST for code patterns.
  - **gitleaks** — secret detection incl. git history.
  - **osv-scanner** — dependency CVE detection (Google OSV).
- Structure:
  src/
    cli.ts                      # entry: `veilguard scan <target> [--json] [--out file]`
    types.ts                    # Finding, Severity, Category, ScanContext, ScanReport (zod schemas + types)
    engine/
      recon.ts                  # detect target type; for URL fetch homepage/headers/bundles/common paths; for repo load files + build AST index
      runner.ts                 # loads the rule registry, runs applicable rules in parallel, collects findings
      normalize.ts              # convert Semgrep/gitleaks/osv JSON output into our Finding shape
      suppress.ts               # false-positive suppression pass (the safe-key matrix)
      grade.ts                  # compute A–F from weighted findings
    rules/
      index.ts                  # the RULE REGISTRY — array of all rule modules
      secrets/*.ts
      database/*.ts
      auth/*.ts
      injection/*.ts
      api-webhooks/*.ts
      web-config/*.ts
      dependencies/*.ts
      ai-specific/*.ts
      platform/*.ts
      business-logic/*.ts
    semgrep-rules/*.yaml         # custom Semgrep rules for the patterns below
  test-fixtures/
    vulnerable/                 # sample insecure code + configs (see testing gate)
    safe/                       # sample SAFE values that must NOT be flagged
  test/                         # the test suite
  README.md                     # install (incl. semgrep/gitleaks/osv-scanner), usage, how to run tests

═══════════════════════════════════════════
CORE DATA MODEL (types.ts)
═══════════════════════════════════════════
Define and export (with zod schemas):

Category = 'secrets' | 'database' | 'auth' | 'injection' | 'api_webhooks' | 'web_config' | 'dependencies' | 'ai_specific' | 'platform' | 'business_logic'
Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

Finding = {
  ruleId: string            // stable, e.g. "SECRETS_STRIPE_SECRET_KEY"
  category: Category
  severity: Severity
  cwe?: string              // e.g. "CWE-798"
  owasp?: string            // e.g. "A01:2021"
  title: string             // plain-English, founder-friendly ("Your Stripe secret key is exposed")
  whyItMatters: string      // one plain sentence of real-world impact
  evidence?: string         // REDACTED snippet or matched indicator (never print full secrets)
  location?: { file?: string; line?: number; url?: string }
  fix?: string              // concrete fix (code/SQL/steps)
  fixPrompt?: string        // a copy-paste prompt the user can hand to their AI tool
  confidence: 'high' | 'medium' | 'low'
  mode: 'blackbox' | 'whitebox'
}

ScanContext = {
  target: { type: 'url' | 'repo', value: string }
  // black-box artifacts (populated for URL targets):
  http?: { baseUrl, homepageHtml, headers, jsBundles: {url, content}[], cookies }
  discovered?: { supabaseUrl?, supabaseAnonKey?, firebaseConfig? }   // parsed from bundles
  // white-box artifacts (populated for repo targets):
  repo?: { root, files: string[], readFile(path), sqlFiles, envFiles, packageManifest, astFor(path) }
  helpers: { httpGet, safeRegexScan, redact, ... }
}

ScanReport = { target, startedAt, finishedAt, grade: 'A'|'B'|'C'|'D'|'F', counts: {critical,high,medium,low,passed}, findings: Finding[] }

Rule = { id: string; category: Category; mode: 'blackbox'|'whitebox'|'both'; run(ctx: ScanContext): Promise<Finding[]> }

The runner loads rules/index.ts, runs each rule whose mode matches the target, gathers Findings, runs the suppression pass, then grading, then emits ScanReport.

═══════════════════════════════════════════
RULES TO IMPLEMENT (map each to a rule module; wire OSS engines where noted)
═══════════════════════════════════════════
Implement ALL of the following. Each produces Finding(s) with title/whyItMatters/fix/fixPrompt.

## Secrets & credentials
- Hardcoded secrets in source (gitleaks + custom regex/AST): Stripe `sk_live_`/`sk_test_`/`rk_live_`, Supabase `service_role`/`sb_secret_`, Firebase service-account `privateKey`, AWS `AKIA…`, DB connection strings `postgres://user:pass@…`, generic high-entropy strings passed as literals to `createClient`/`new Stripe`/`initializeApp`.
- Secrets in frontend JS bundle (black-box): fetch each JS bundle from the URL and regex for the dangerous patterns above.
- Secrets in `.env*` files committed (white-box) and in git history (gitleaks `--log-opts`).
- `.env` / `.git/config` served publicly (black-box): GET `/.env`, `/.env.local`, `/.env.production`, `/.git/config` → 200 with secret-like content.

## Database access rules  (the crown-jewel category — be thorough)
- Supabase RLS disabled (white-box: SQL migration parser — `create table` in public schema with no `enable row level security`).
- Over-permissive RLS policy (white-box regex/AST: `using (true)`, `using (auth.uid() is not null)`, `using (1=1)`).
- Supabase RLS open (black-box: use the anon key + project URL discovered from the bundle; GET `/rest/v1/<table>?select=*` with a wordlist of common table names [users, profiles, orders, payments, billing, logs]; a 200 returning rows = exposed).
- SECURITY DEFINER views bypassing RLS (white-box: `create view` without `with (security_invoker = true)`).
- service_role key used in a non-server / client file, or in a route without a user_id filter (white-box AST).
- Firebase Firestore/Storage rules open (white-box: `allow read, write: if true`, or auth-only without ownership).
- Open DB port with default creds (white-box: scan docker-compose/config for `0.0.0.0/0` bindings). (Skip active port scanning in this slice.)

## Auth & authorization
- Missing auth on endpoints (white-box AST: route handlers with no session/token check).
- IDOR / BOLA, incl. Next.js Server Actions (white-box: `'use server'` fns doing db update/delete keyed on an input arg with no ownership check).
- Next.js middleware bypass CVE-2025-29927 (white-box version check on next: 15.x<15.2.3, 14.x<14.2.25, 13.x<13.5.9; black-box: send `x-middleware-subrequest` header to a protected route and see if it bypasses).
- JWT flaws (white-box AST: `jwt.verify` without an explicit `algorithms:[…]`; black-box: send `alg:none` forged token).
- Weak/hardcoded JWT secret (white-box: short/hardcoded secret literals).
- No login rate limiting; weak password policy (white-box: signup/login handlers lacking validation/limits).
- Privilege escalation / parameter tampering (white-box: user-supplied `role`/`isAdmin` written to db).

## Injection
- SQL injection incl. Prisma `$queryRawUnsafe` / string-concatenated queries (Semgrep custom rule).
- NoSQL injection (raw JSON filter from user input).
- OS command injection: `exec`/`spawn`/`execSync` with interpolated user input (Semgrep).
- SSRF, incl. Next.js image optimizer CVE-2024-34351 (white-box: `next.config.js` remotePatterns wildcard `**`; version < 14.1.1) and generic user-controlled `fetch(url)`.
- XSS: `dangerouslySetInnerHTML` without sanitization (Semgrep).
- Template injection, path traversal (`fs.readFile` with user input), prototype pollution (`_.merge(obj, req.body)`), open redirects.

## APIs & webhooks
- Unverified Stripe/GitHub webhook signatures (white-box: webhook handler that parses body without `stripe.webhooks.constructEvent` / HMAC check; black-box: POST a fake event, see if processed).
- Payment-flag / mass-assignment tampering (white-box: PATCH/POST handlers writing `isPro`/`tier`/`is_admin`/`credits` from client body).
- Missing rate limiting on APIs.
- GraphQL introspection enabled (black-box probe `__schema` query) + batching/alias abuse.
- Excessive data exposure.

## Web / transport / config
- Missing security headers (black-box): CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Permissive CORS (black-box: send `Origin: https://evil.com`; flag if reflected + `Allow-Credentials: true`).
- Weak cookie flags (black-box: Set-Cookie missing HttpOnly/Secure/SameSite).
- Missing HTTPS/HSTS; clickjacking; directory listing; exposed source maps (`*.js.map` → 200); exposed admin/debug endpoints; verbose stack traces.

## Dependencies & supply chain
- Known-CVE / outdated packages via **osv-scanner** on the lockfile.
- React Server Components RCE "React2Shell" (CVE-2025-55182) version check; Next.js version-range CVEs above.
- Typosquatted/suspicious package names; unpinned versions; external `<script>` without SRI.

## AI-coding-specific
- Insecure generated defaults: `rejectUnauthorized:false`, `NODE_TLS_REJECT_UNAUTHORIZED='0'` (Semgrep/AST).
- Malicious/risky AI rules files: scan `.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*` for base-URL overrides, "disable auth/skip validation/hardcode secrets" instructions.
- Prompt-injection surface: user input concatenated into an LLM system prompt.

## Platform gotchas
- Supabase: anon key public is fine — but require RLS on; alert only on `service_role`/`sb_secret_` exposure.
- Firebase: open default rules; missing App Check note.
- Vercel/Netlify: secret-named var behind `NEXT_PUBLIC_`; unauthenticated edge/serverless functions.
- Clerk/Auth0: wildcard redirect URIs; multi-tenant org-id taken from client without verifying membership.
- Stripe: `sk_` in client; missing webhook verification; test-vs-live key mismatch.

## Business logic & data
- PII exposure in responses; missing encryption in transit; insecure file uploads (no type/size validation); insufficient logging (info-level note).

═══════════════════════════════════════════
FALSE-POSITIVE SUPPRESSION (suppress.ts) — build this carefully
═══════════════════════════════════════════
Apply as a final pass over findings. A matched value is SUPPRESSED (never reported as a leak) when it is public-by-design:
- Stripe publishable: `pk_live_…`, `pk_test_…`
- Supabase publishable/anon: `sb_publishable_…`, and legacy anon JWTs (role claim = "anon")
- Firebase web config values: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
- PostHog `phc_…`, Sentry DSN, Clerk/Auth0 client IDs (public)
- Values correctly behind `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_` whose name does NOT contain SECRET/PRIVATE/SERVICE_ROLE/PASSWORD/TOKEN/ADMIN
- Obvious placeholders: `YOUR_KEY_HERE`, `example`, `changeme`, `abc123`, `xxxx`
NEVER suppress (always alert): `sk_live_`/`sk_test_`/`rk_live_`, Supabase `service_role`/`sb_secret_`, Firebase service-account `privateKey`, `whsec_`, DB passwords, AWS `AKIA…`. A Supabase anon JWT with a "service_role" claim must be treated as dangerous, not anon.
Implement this as a per-provider table so it's easy to extend. Each suppressed match is dropped from the report (optionally logged at debug level with a reason).

═══════════════════════════════════════════
GRADING (grade.ts)
═══════════════════════════════════════════
Start at 100. Subtract weights: critical −35, high −15, medium −6, low −2 (cap the floor at 0). Map: A ≥ 90, B 75–89, C 60–74, D 40–59, F < 40. Any unresolved CRITICAL caps the grade at D at best. Include the counts in the report.

═══════════════════════════════════════════
CLI OUTPUT
═══════════════════════════════════════════
`veilguard scan <url-or-path>` → readable terminal summary (grade, counts, findings grouped by severity with title + location).
`--json` / `--out report.json` → the full ScanReport JSON, validated against the zod schema.

═══════════════════════════════════════════
★ TESTING GATE — must fully pass before Slice 2 ★
═══════════════════════════════════════════
Build a test suite (vitest or jest) and test fixtures. Do not consider this slice done until ALL of the following pass:

A) UNIT TESTS: at least one test per rule module, using small fixtures under test-fixtures/, asserting the rule fires on the insecure sample and does NOT fire on a clean sample.

B) SUPPRESSION TESTS (critical): given a fixture file containing a Stripe `pk_live_` key, a Supabase `sb_publishable_` key, a Firebase web `apiKey`, a `phc_` token, and a `NEXT_PUBLIC_API_URL`, the scanner reports ZERO secret findings. Given a fixture with `sk_live_…`, `sb_secret_…`, and a `privateKey`, it reports each as CRITICAL.

C) END-TO-END on a known-vulnerable app: include the QuickCart demo project as test-fixtures/vulnerable/quickcart (an intentionally insecure Next.js app: hardcoded Stripe secret key, SQL injection via string concat, unverified Stripe webhook, wildcard CORS + credentials, missing security headers in next.config, committed `.env` with secrets, `.gitignore` that omits `.env`, broken Supabase RLS policies [`using (auth.uid() is not null)` and RLS disabled], open Firebase rules [`allow read, write: if true`], outdated deps [next 13.4.0], and a `.cursorrules` telling the AI to skip security). If this fixture isn't present, generate it. Running `veilguard scan ./test-fixtures/vulnerable/quickcart` MUST:
   - return at least 12 findings,
   - include CRITICALs for: hardcoded Stripe secret key, SQL injection, missing webhook verification, broken Supabase RLS, exposed service credentials,
   - include the outdated-dependency and AI-rules-file findings,
   - produce a grade of D or F,
   - emit JSON that validates against the ScanReport schema.

D) NO CRASH on a clean project: scanning a minimal, secure sample app returns grade A/B and zero criticals.

E) README documents how to install semgrep/gitleaks/osv-scanner and how to run `npm test`.

Print a final "GATE RESULTS" summary showing each of A–E as pass/fail. Report honestly — if anything fails, fix it before declaring the slice complete. Then give me: the file tree, how to run a scan, and the GATE RESULTS.
```

---

When Claude Code reports the **GATE RESULTS all green**, tell me and paste the summary (or a sample `report.json`). I'll review it, and then write **Slice 2** (wrapping this engine in the Cloud Run worker + queue + Firestore) with its own testing gate. We keep going slice by slice until the backend is complete and proven — then integrate your real frontend. 