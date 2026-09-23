# Veilguard — Product Brief for the Launch Video

> Paste everything below into your design tool. It's the accurate, code-verified behavior of Veilguard —
> use it to script narration and visualize real screens/flows. Do not invent features, prices, or steps.

---

## HOW TO USE THIS BRIEF
You are producing a product-launch video for **Veilguard**. Everything below is the accurate, current
behavior of the product. Use it to script narration and visualize screens/flows. Do **not** invent
features, steps, prices, or UI that aren't described here. When you show a flow, follow the exact step
order given (especially "connect first, then scan").

## 1. WHAT VEILGUARD IS (positioning + value)
Veilguard is a **self-serve web security scanner for apps built with AI coding tools**. You paste your
app's link (or connect your repo) and get a **plain-English A-to-F security grade in about 60 seconds**,
plus the **exact fix for every issue** — copy-paste code and a ready-made prompt for your AI tool.
- One-liner: *"Find out if your app is safe to charge money."*
- The promise: understand your security posture in plain English, get the exact fix, and stay safe as you
  keep shipping — without needing to be a security expert.

## 2. WHO IT'S FOR
Non-technical founders and solo builders who ship apps fast with AI tools — **Lovable, Bolt, Cursor,
Replit, v0, Claude Code, Windsurf** — on backends like **Supabase / Firebase**. They can build, but can't
tell if what they shipped is safe (exposed API keys, world-readable databases, missing protections).

## 3. THE PROBLEM (the "why")
AI writes and ships an app in minutes, but nothing in that loop checks whether it's safe to take real
users' data or money. The result: exposed secrets, databases anyone can read, missing security headers,
paywalls that can be bypassed. Veilguard is the security check that fits into that vibe-coding workflow.

## 4. THE THREE WAYS TO SCAN (the core of the product)
"Three ways to scan your app" — from a 60-second check of a live URL to a deep read of your actual code.

### 4A. URL scan (black-box) — FREE, the fastest path
- What it does: probes your **deployed, live app from the outside**, the way an attacker on the internet
  would. No access to your code. ~60 seconds.
- Steps: paste your app URL → Veilguard checks HTTPS & headers, exposed secrets in the shipped
  JavaScript, open APIs/CORS, etc. → you get a grade + findings.
- Catches things like: secrets/keys exposed in the client bundle, missing security headers, misconfigs.

### 4B. GitHub repo deep scan (white-box / "code scan") — GUARD only. CONNECT FIRST.
This is a two-part flow — **you must connect GitHub before you can scan a repo.**
- **Connect (one-time):** Settings → Connections → Connect GitHub → you install the **Veilguard GitHub
  App** (read-only, single repo) on GitHub → redirected back, now connected ("Read-only · owner/repo").
  Veilguard stores only the installation id; it mints a fresh short-lived token per scan and never stores
  code or long-lived tokens.
- **Scan:** "New scan" → "GitHub repo" → pick a repo from the list → Scan. Veilguard does a read-only
  shallow clone into a temporary sandbox, reads your **source code + config files + any committed `.sql`
  migrations**, runs the deep rules, then **deletes the workspace** (your code is never saved; only the
  findings are). Guard users also get AI-tailored fixes generated while the code is on disk.
- Catches deeper things a URL scan can't see: secrets in `.env`/config, insecure code patterns, database
  rules committed in the repo, dependency/config issues.

### 4C. Folder / ZIP upload (white-box) — GUARD only
- For code that isn't on GitHub. "New scan" → "Upload a folder" → pick a folder (or drag-drop a folder or
  a `.zip`).
- Privacy: the folder is zipped **in your browser**, and it **respects your `.gitignore`** and skips junk
  (`node_modules`, `.git`, large files) so secrets/`.env` never leave your machine. Uploaded straight to
  cloud storage, scanned in a sandbox, and the uploaded archive is **deleted right after** extraction.
- Same deep code analysis as the repo scan; same grade + fixes.

### 4D. Supabase database / RLS scan (white-box) — GUARD only. CONNECT FIRST.
- Row-Level Security lives on Supabase's servers, not in your code, so a code scan alone can't see it.
- **Connect:** Settings → Connections → Connect Supabase → authorize **read-only** access → connected
  ("project <ref>").
- **Use it:** on a repo deep scan that detects Supabase, Veilguard nudges "scan your database too" →
  "Re-scan with database" runs a **combined code + database scan** for one unified grade. It reads your
  schema + RLS policies read-only and runs a live **anon-read probe** that produces critical findings like
  *"Anyone can read your `orders` table."*

> Ordering to show on screen: **Connect (GitHub / Supabase) in Settings → then scan.** Never show picking a
> repo or DB scan before connecting.

## 5. ONBOARDING / FIRST RUN (signup-first funnel)
Sign-up happens **through onboarding** (there's no separate signup page). Sign-in is **Google or GitHub
only — no passwords.**
- Entry A — from a marketing scan box: user types their URL → lands in onboarding with the URL pre-filled
  (URL step skipped). (Invalid/unreachable URLs are refused right there.)
- Entry B/C — "Get Started" / opening onboarding directly: same wizard; the URL step is shown and optional.
- The wizard steps: (1) What did you build it with? (2) What's your backend? (3) What does your app handle?
  (4) Where did you hear about us? (5) Your app's URL [skipped if it came from marketing] → **(6) Sign up
  (Google/GitHub)** → **(7) Scan runs on your new account → gated result** → (8) Where to send alerts →
  (9) Pick a plan (Free or Guard; choosing Guard goes to checkout).
- The gated result shows the **grade + the single worst issue**, with the fix locked and "N more issues
  locked," pushing the upgrade (unlock every fix + scan your whole codebase).

## 6. WHAT YOU GET FROM A SCAN (results)
- **A plain-English grade, A to F.** (Scoring: start at 100, deduct per issue by severity; A≥90, B≥75,
  C≥60, D≥40, else F. Any **critical** issue forces the grade down to D or worse — nothing with a critical
  can score above D.) Grade colors: A/B green, C amber, D/F red.
- **Findings**, worst-first, in three buckets the user sees: **Critical**, **Warnings**, **Passed**. Each
  finding: a plain title, a plain-English "why it matters," and where it was found.
- **The fix (the payoff):** open a finding → "How to fix it: two ways — hand it to your AI, or paste the
  code yourself." Two tabs: **"Prompt for your AI"** and **"The exact code,"** each with a copy button.
  "Once it's deployed, re-scan and this issue clears itself."
- **Copy all fixes** (Guard): one master prompt with every fix, worst-first, to paste into your AI tool.
- **PDF report** (Report button): a branded report — grade, counts, and every finding with its exact fix +
  AI prompt (fixes shown only for what your plan unlocks). Also an account-wide summary report.

## 7. PLANS & GATING (Free vs Guard)
- **Free — $0, no signup to see a grade:** URL scans only. Full A-to-F grade and it tells you how many
  issues exist, but in the app it shows the **two worst findings in full and blurs the rest** behind a
  Guard lock, and unlocks **one sample fix**. (Server cap: 2 scans / month.)
- **Guard — $19/month:** everything — URL + GitHub repo + folder/ZIP + deep Supabase/Firebase audit;
  **every fix** (code + AI prompt) unlocked; repo/database connections; **monitoring + instant email
  alerts**; copy-all-fixes; the PDF fixes. (Server cap: 30 scans / month.)
- Cancel anytime; billing handled by Polar (merchant of record).

## 8. MONITORING & ALERTS (a key Guard value — "stay safe as you keep shipping")
- **Auto re-scan on every deploy:** connect your repo, turn on monitoring, and Veilguard re-scans on every
  push (via GitHub webhook).
- **Instant email alert** when a **new** critical/high issue appears or your grade drops (e.g. a freshly
  committed `.env`, a new exposed key). No email on a clean re-scan.
- **Alerts inbox** in the app: a cross-app feed of what changed (new issues from auto re-scans, failed
  scans), with a sidebar unread badge.
- Veilguard also sends: a **welcome** email, a **monthly security summary**, and billing emails (Guard
  activated, payment failed, subscription canceled). Emails come from Veilguard <info@veilguard.dev>.

## 9. THE APP / DASHBOARD (day-to-day)
- **Left sidebar:** Veilguard wordmark; **Overview**, **My apps** (count), **Alerts** (unread badge); your
  apps list; a big **New scan** button; **Billing**, **Settings**; account + Log out at the bottom.
- **Overview (dashboard):** a progress hero — *"You've fixed 7 of 25, 18 to go"* with a progress bar and
  grade; an "Issues resolved over time" chart; "What's at risk" impact buckets + a donut; **"Fix these
  first"** prioritized list (free users see 2, rest blurred); "App health" per app; a 28-day scan-activity
  heatmap; recent fixes; recent scans.
- **My apps:** each scanned URL/repo becomes a saved "app" (one project, seen through a URL lens and/or a
  deep/repo lens; repeat scans roll up as history). Table of app · issues · last scan · grade; add/remove.
- **Per-app hub:** tabs — **Overview** (latest scan, scan history, Re-scan, Report PDF), **Findings** (the
  findings list + fixes), and **Monitoring** (only for repo-connected apps).
- **Settings:** Profile (+ account report PDF), **Connections** (GitHub, Supabase — read-only), Notification
  toggles, Delete account.

## 10. BILLING (brief)
Upgrade to Guard from any "Upgrade" button or onboarding → hosted Polar checkout → plan is granted by
Polar's webhook. Manage/cancel/resume and view invoices in Billing. Canceling keeps access until the
period ends.

## 11. TONE / PROOF POINTS (for narration)
- Plain-English, reassuring, founder-friendly — not scary security jargon.
- "Read-only. We never store your code." "~60 seconds." "The exact fix, not just the problem."
- Real-world stat framing already used on the site: a large share of AI-generated code ships with a known
  security flaw; leaked keys get exploited within minutes.

## 12. ACCURACY GUARDRAILS (do NOT get these wrong)
- Sign-in is **Google or GitHub only** (no email/password).
- The **URL scan is the free, no-signup grade**; deep repo scan, folder upload, Supabase DB scan, all
  fixes, and monitoring are **Guard ($19/mo)**.
- Always show **connect-then-scan** for GitHub and Supabase.
- Veilguard **never stores your code**; repo/upload scans run in a sandbox that's deleted after.
- Don't claim fixes are auto-applied — Veilguard gives you the fix (code + AI prompt); you apply it, then
  re-scan to confirm.
