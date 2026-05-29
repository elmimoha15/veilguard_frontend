# VEILGUARD LANDING PAGE — COMPLETE CONTENT & SEO SPECIFICATION

This document contains ALL the content, page structure, SEO metadata, structured data, and sitemap specification for veilguard.dev. Hand this to your website builder (Antigravity, Lovable, or any frontend tool) along with your brand kit.

---

## BRAND KIT (reference for builder)

- Name: Veilguard
- Tagline: "Silent security for vibe coders"
- Voice: Calm, confident, technical but approachable. Never alarming.
- Background: #080E12
- Cards: #0D1820
- Accent: #34D399 (teal-green)
- Headings: #F1F5F9
- Body text: #94A3B8
- Critical red: #EF4444
- Warning amber: #F59E0B
- Fonts: Inter (UI) + JetBrains Mono (code)

---

## SITE ARCHITECTURE (9 crawlable pages)

```
veilguard.dev/                  → Homepage (main landing page)
veilguard.dev/pro               → Pro upgrade + checkout
veilguard.dev/docs              → Documentation hub
veilguard.dev/docs/install      → Installation guide
veilguard.dev/docs/scanners     → All 13 scanners explained
veilguard.dev/docs/vs-code      → VS Code extension guide
veilguard.dev/docs/mcp          → MCP server setup (all IDEs)
veilguard.dev/blog              → Blog index
veilguard.dev/blog/vibe-coding-security-risks  → First blog post (SEO magnet)
```

---

## GLOBAL SEO CONFIGURATION

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://veilguard.dev/sitemap.xml
```

### sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://veilguard.dev/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://veilguard.dev/pro</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://veilguard.dev/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://veilguard.dev/docs/install</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://veilguard.dev/docs/scanners</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://veilguard.dev/docs/vs-code</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://veilguard.dev/docs/mcp</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://veilguard.dev/blog</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://veilguard.dev/blog/vibe-coding-security-risks</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>
```

### Global <head> tags (every page)
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://veilguard.dev{path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#080E12">
<meta name="robots" content="index, follow">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">

<!-- Open Graph (all pages) -->
<meta property="og:site_name" content="Veilguard">
<meta property="og:type" content="website">
<meta property="og:image" content="https://veilguard.dev/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://veilguard.dev/og-image.png">
```

### Global Schema.org (every page)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Veilguard",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "macOS, Windows, Linux",
  "description": "Silent security scanner for AI-generated code. Catches leaked API keys, SQL injection, broken database security, and supply chain attacks in vibe-coded applications.",
  "url": "https://veilguard.dev",
  "offers": [
    {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier — 13 scanners, depth-limited"
    },
    {
      "@type": "Offer",
      "price": "19",
      "priceCurrency": "USD",
      "billingIncrement": "P1M",
      "description": "Pro — full depth, Supabase RLS audit, Firebase audit, full security grade"
    }
  ],
  "featureList": [
    "Secret detection for 50+ API key patterns",
    "SQL injection detection",
    "Supabase Row Level Security audit",
    "Supply chain attack detection",
    "VS Code extension with real-time lint",
    "MCP server for Cursor, Claude Code, Windsurf"
  ]
}
```

---

## PAGE 1: HOMEPAGE (veilguard.dev/)

### SEO Meta
```html
<title>Veilguard — Silent Security Scanner for Vibe Coders | Catch AI Code Vulnerabilities</title>
<meta name="description" content="Free security scanner that catches vulnerabilities in AI-generated code. Detects leaked API keys, SQL injection, broken Supabase RLS, and supply chain attacks. Works in Cursor, Claude Code, VS Code, and Windsurf.">
<meta name="keywords" content="vibe coding security, AI code scanner, secret detection, Supabase RLS audit, MCP security server, Cursor security, Claude Code security, vibe coding vulnerabilities, AI generated code security, leaked API keys, SQL injection scanner, supply chain attack detection">
<meta property="og:title" content="Veilguard — Silent Security for Vibe Coders">
<meta property="og:description" content="Free security scanner for AI-generated code. 13 scanners. Works in every IDE. Catches what AI gets wrong.">
<meta property="og:url" content="https://veilguard.dev">
```

### SECTION 1: Hero

Headline: "Your AI writes code. Veilguard makes sure it doesn't get you hacked."

Subheadline: "Free security scanner for AI-generated code. Catches leaked API keys, SQL injection, broken database policies, and supply chain attacks — while you vibe."

CTA button 1: "Install Free" → links to /docs/install
CTA button 2: "See What It Catches" → scrolls to scanners section

Below CTA, a trust line: "Works in Cursor · Claude Code · VS Code · Windsurf · JetBrains · Antigravity"

### SECTION 2: The Problem (social proof through data)

Section heading: "AI-generated code has a security problem"

Stats to display as large numbers:

- "45%" → "of AI-generated code contains security vulnerabilities (Veracode, 2025)"
- "28.6M" → "hardcoded secrets pushed to public GitHub repos in 2025 — a 34% increase year over year (GitGuardian)"
- "1.5M" → "API keys leaked in the Moltbook breach — a fully vibe-coded app with zero security review"
- "74" → "CVEs directly attributed to AI coding tools tracked by Georgia Tech's Vibe Security Radar"

Below stats: "Vibe coding ships products in days. It also ships vulnerabilities. Tools like Cursor, Claude Code, and Windsurf generate functional code fast — but they don't check for hardcoded secrets, SQL injection, broken database policies, or malicious dependencies. Veilguard does."

### SECTION 3: How It Works (3 steps)

Section heading: "Install once. Code normally. Sleep well."

Step 1 — "Install in 30 seconds"
"One command. Auto-detects your IDE. Sets up security rules and the MCP server config."
Show code block: npx @veilguard/cli init

Step 2 — "Code like you always do"
"Veilguard runs silently while you and your AI agent write code. It scans every file your AI creates or modifies. If everything is clean — total silence. You never know it's there."

Step 3 — "Get a nudge when something's wrong"
"Found a leaked Stripe key on line 7? A red underline appears. SQL injection in your API route? Yellow warning in the Problems panel. Your AI agent can auto-fix the issue in one click."

### SECTION 4: What It Catches (the 13 scanners)

Section heading: "13 scanners. Every vulnerability AI introduces."

Display as a grid or list:

FREE SCANNERS:
- Secret Detection — "Catches 50+ API key patterns: Stripe, OpenAI, Supabase, Paystack, Flutterwave, M-Pesa, AWS, Google Cloud, and more. Detects the #1 vibe coding mistake: AI adding live keys as fallback values in process.env || 'sk_live_...'."
- SQL Injection — "Detects template literal injection (db.query(`SELECT * FROM users WHERE id = ${id}`)), unsanitized req.body passed directly to database inserts, and command injection."
- Webhook Verification — "Finds webhook endpoints missing signature verification for Stripe (constructEvent), Paystack (HMAC), M-Pesa (IP check), GitHub, and Flutterwave."
- Environment Security — "Checks .env is in .gitignore, detects secrets exposed via NEXT_PUBLIC_ or VITE_ prefixes, finds .env files tracked by git."
- CORS Misconfiguration — "Catches cors({ origin: '*' }) on applications with authentication — the most common security header mistake in AI-generated Express apps."
- Supply Chain — "Detects malicious and typosquatted npm packages. Catches packages like 'lodahs' (typosquat of lodash), 'crossenv' (known credential stealer), and 17 other known malicious packages."
- Dependency CVEs — "Checks every npm dependency against Google's OSV.dev database for known vulnerabilities. Flags critical CVEs before you ship."
- Auth Configuration — "Validates Clerk, NextAuth, and Supabase Auth setup. Catches getSession() spoofing (should use getUser()), localStorage sessions, and missing rate limiting."
- Security Headers — "Checks deployed URLs for Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy."
- Git Security — "Scans for secrets in git history, .gitignore gaps, tracked .env files, and committed node_modules."

PRO SCANNERS ($19/month):
- Supabase RLS Audit — "Deep analysis of Row Level Security policies. Catches the exact patterns behind the Moltbook breach (1.5M leaked keys) and the Lovable CVE-2025-48757 (170 apps exposed). Detects USING(true), auth.uid() IS NOT NULL bypass, missing RLS on tables, and select(*) without ownership filters."
- Firebase Rules Audit — "Analyzes Firebase security rules for allow read, write: if true, client-controlled userId checks, and authentication-only policies without ownership verification."
- Full Security Audit — "Runs all 13 scanners, calculates a security score (0-100), assigns a grade (A+ to F), and generates an AI-ready fix prompt you can paste into your coding agent to fix every issue at once. 3 audits per month."

### SECTION 5: Two Ways to Use Veilguard

Section heading: "VS Code extension + MCP server. Choose your fighter."

Card 1 — VS Code Extension:
"Real-time security lint. Red underlines on leaked secrets, yellow warnings on SQL injection — just like ESLint but for security. Works on every file save. No AI chat needed."
CTA: "Install VS Code Extension"

Card 2 — MCP Server:
"Your AI agent becomes security-aware. In Cursor, Claude Code, and Windsurf, Veilguard auto-scans every file your AI writes and tells you when something is wrong. Clean code = total silence."
CTA: "Set Up MCP Server"

### SECTION 6: Free vs Pro

Section heading: "Free is powerful. Pro is complete."

Table:

| Feature | Free | Pro ($19/mo) |
|---------|------|-------------|
| All 13 scanners | ✓ | ✓ |
| VS Code extension | ✓ | ✓ |
| MCP server (all IDEs) | ✓ | ✓ |
| Findings per scan | First 3 | All |
| Fix suggestions | Hidden on critical | All shown |
| Dependency scanning | Critical CVEs only | All severities |
| Supply chain check | Top 20 packages | All packages |
| Git history scan | Current files only | Full history |
| Supabase RLS deep audit | — | ✓ |
| Firebase rules audit | — | ✓ |
| Full audit with grade | — | 3/month |
| Breach context | — | ✓ (which real breach each pattern caused) |

CTA: "Start Free" / "Go Pro — $19/month"

### SECTION 7: IDE Support

Section heading: "Works in every AI coding IDE"

Show IDE logos + setup:
- Cursor — "Auto-scans via .cursorrules. Best experience."
- Claude Code — "Auto-scans + post-save hooks via CLAUDE.md"
- Windsurf — "Auto-scans via .windsurfrules"
- VS Code — "Real-time lint via extension + MCP server via Copilot Chat"
- JetBrains — "MCP server via Settings → Tools → MCP Server"
- Antigravity — "MCP server via MCP Settings Panel"

### SECTION 8: Built for Real Threats

Section heading: "Based on real breaches. Not theoretical risks."

Show 3 breach cards:

Card 1: "Moltbook (January 2026) — AI-generated app leaked 1.5 million API keys and 35,000 emails. Root cause: Supabase RLS disabled + API key in client JavaScript. Veilguard's check_supabase_rls catches this pattern."

Card 2: "Lovable CVE-2025-48757 (May 2025) — 170 apps exposed user data including names, emails, phone numbers, and financial records. Root cause: inverted access control logic in AI-generated RLS policies. Veilguard detects auth.uid() IS NOT NULL bypass."

Card 3: "GitGuardian 2026 Report — 28.65 million hardcoded secrets pushed to public repos in 2025. AI-assisted commits show a 3.2% secret leak rate, double the baseline. Veilguard's scan_secrets catches 50+ patterns instantly."

### SECTION 9: Privacy & Architecture

Section heading: "100% local. Your code never leaves your machine."

"Veilguard runs entirely on your laptop. It reads your files locally, matches patterns locally, and returns results locally. The only outbound calls are to Google's OSV.dev API (sends package names only, never code) and veilguard.dev for Pro license validation. No telemetry. No data collection. No cloud processing. Open source on GitHub."

CTA: "View on GitHub" → https://github.com/elmimoha15/veilguard

### SECTION 10: Footer CTA

Headline: "Ship fast. Ship secure."
Subheadline: "Install Veilguard in 30 seconds. Free forever for indie developers."
CTA: "Install Free — npx @veilguard/cli init"

### Footer
Links: Docs, GitHub, Pro, Blog, Privacy, Terms
"Built by developers who've seen too many vibe-coded apps get breached."
"© 2026 Veilguard. MIT License."

---

## PAGE 2: PRO (/pro)

### SEO Meta
```html
<title>Veilguard Pro — Full Security Audit for AI-Generated Code | $19/month</title>
<meta name="description" content="Unlock Supabase RLS deep audit, Firebase rules analysis, full security grade (A+ to F), and unlimited scan depth. Catches the exact patterns behind the Moltbook and Lovable breaches. $19/month or $149/year.">
<meta name="keywords" content="vibe coding security audit, Supabase RLS audit, Firebase security audit, AI code security grade, veilguard pro, pre-launch security check, vibe coding vulnerabilities fix">
<meta property="og:title" content="Veilguard Pro — Full Depth Security for AI-Generated Code">
<meta property="og:url" content="https://veilguard.dev/pro">
```

### Content

Headline: "See everything. Fix everything."
Subheadline: "Veilguard Pro unlocks full scan depth, Supabase RLS deep audit, Firebase rules analysis, and a security grade for your entire project."

What Pro adds:
- "All findings shown — free tier shows first 3, Pro shows every vulnerability in every file"
- "Fix suggestions on every finding — including critical issues"
- "Supabase RLS deep audit — catches USING(true), auth.uid() IS NOT NULL bypass, missing policies on tables, service_role key exposure. The patterns behind Moltbook and Lovable breaches."
- "Firebase security rules audit — detects allow if true, client-controlled userId, and auth-only policies without ownership checks"
- "Full security audit with grade — runs all 13 scanners, scores your project 0-100, assigns a grade A+ to F, generates an AI-ready fix prompt. 3 per month."
- "Full git history scan — finds secrets that were committed and 'deleted' but still exist in git history"
- "All dependency severities — free shows critical CVEs only, Pro shows all"
- "Breach context — every finding tells you which real-world breach this pattern caused"

Pricing:
- $19/month
- $149/year (save 35%)

How it works:
1. "Click 'Subscribe' below"
2. "You'll receive a license key via email"
3. "Add VEILGUARD_KEY=your_key to your MCP config or VS Code settings"
4. "Restart your IDE — Pro features are active immediately"
5. "Key is validated once, cached for 24 hours. Works offline after first check."

CTA: "Subscribe — $19/month" / "Subscribe — $149/year (save 35%)"

---

## PAGE 3: DOCS HUB (/docs)

### SEO Meta
```html
<title>Veilguard Documentation — Setup, Scanners, and IDE Integration</title>
<meta name="description" content="Complete documentation for Veilguard security scanner. Installation guide, all 13 scanners explained, VS Code extension setup, MCP server configuration for Cursor, Claude Code, Windsurf, and more.">
<meta name="keywords" content="veilguard docs, veilguard documentation, MCP security scanner setup, VS Code security extension, Cursor security scanner, vibe coding security tool documentation">
<meta property="og:url" content="https://veilguard.dev/docs">
```

### Content
Heading: "Documentation"
Subheading: "Everything you need to set up and use Veilguard."

Quick links:
- Installation → /docs/install
- All 13 Scanners → /docs/scanners
- VS Code Extension → /docs/vs-code
- MCP Server Setup → /docs/mcp

---

## PAGE 4: INSTALLATION (/docs/install)

### SEO Meta
```html
<title>Install Veilguard — Security Scanner for Cursor, Claude Code, VS Code, Windsurf</title>
<meta name="description" content="Install Veilguard in 30 seconds. One command auto-detects your IDE and configures the MCP security scanner. Works with Cursor, Claude Code, VS Code, Windsurf, JetBrains, and Antigravity.">
<meta name="keywords" content="install veilguard, MCP server install, Cursor security setup, Claude Code MCP server, VS Code security extension install, Windsurf MCP server, vibe coding security scanner install, npx veilguard">
<meta property="og:url" content="https://veilguard.dev/docs/install">
```

### Content

Heading: "Install Veilguard"

Prerequisites: Node.js 18 or higher.

Quick install:
npx @veilguard/cli init

This auto-detects your IDE and sets up:
1. MCP server config (so your IDE knows about Veilguard)
2. Security rules file (.cursorrules, .windsurfrules, or CLAUDE.md)
3. Post-save hooks (Claude Code only)
4. Adds .veilguard/ to .gitignore

Manual setup per IDE:

MCP config JSON (same for all IDEs):
```json
{
  "mcpServers": {
    "veilguard": {
      "command": "npx",
      "args": ["-y", "@veilguard/cli"],
      "env": {
        "VEILGUARD_KEY": ""
      }
    }
  }
}
```

Where to put it:
| IDE | File location |
|-----|--------------|
| Cursor | .cursor/mcp.json |
| Claude Code | .claude/mcp.json or run: claude mcp add veilguard -- npx -y @veilguard/cli |
| Windsurf | ~/.windsurf/mcp.json |
| VS Code | .vscode/mcp.json (use "servers" key, add "type": "stdio") |
| JetBrains | Settings → Tools → MCP Server → Add |
| Antigravity | MCP Settings Panel → Add Server |

Free users: leave VEILGUARD_KEY empty.
Pro users: add your license key from veilguard.dev/pro.

Restart your IDE after setup. Veilguard is now active.

VS Code Extension:
Search "Veilguard" in the VS Code Extensions marketplace and click Install. The extension scans files automatically on save and shows red/yellow underlines on security issues. No MCP server needed for the extension — it works standalone.

---

## PAGE 5: SCANNERS (/docs/scanners)

### SEO Meta
```html
<title>Veilguard Scanners — 13 Security Checks for AI-Generated Code</title>
<meta name="description" content="Detailed documentation for all 13 Veilguard security scanners. Secret detection, SQL injection, Supabase RLS audit, webhook verification, supply chain checks, CORS, environment security, and more.">
<meta name="keywords" content="API key scanner, secret detection tool, SQL injection scanner, Supabase RLS audit tool, webhook security scanner, supply chain attack detection, CORS scanner, environment variable security, vibe coding security scanners, AI code vulnerability scanner">
<meta property="og:url" content="https://veilguard.dev/docs/scanners">
```

### Content

Document each of the 13 scanners with:
- Tool name
- What it checks
- When it auto-triggers
- Example finding
- How to fix

(Use the scanner descriptions from the README and HOW-IT-WORKS.md. Each scanner gets its own subsection with a code example showing what triggers it and what the fix looks like.)

---

## PAGE 6: VS CODE EXTENSION (/docs/vs-code)

### SEO Meta
```html
<title>Veilguard VS Code Extension — Real-Time Security Lint for AI-Generated Code</title>
<meta name="description" content="Install the Veilguard VS Code extension for real-time security scanning. Red underlines on leaked API keys, SQL injection, and broken database policies. Works like ESLint but for security.">
<meta name="keywords" content="VS Code security extension, VS Code secret scanner, VS Code security lint, real-time code security, API key detection VS Code, SQL injection VS Code, security linter VS Code, vibe coding VS Code">
<meta property="og:url" content="https://veilguard.dev/docs/vs-code">
```

### Content

Heading: "Veilguard VS Code Extension"
Subheading: "Security lint for AI-generated code. Red underlines on vulnerabilities, just like ESLint."

How it works:
1. Install from VS Code Marketplace (search "Veilguard")
2. Open any project
3. Save a file — Veilguard scans it instantly
4. Leaked secrets get red underlines. SQL injection gets yellow underlines.
5. Hover to see the fix. Check the Problems panel for all findings.
6. Fix the issue, save again — underlines disappear.

No AI chat needed. No commands to run. Fully automatic on every file save.

Settings:
- veilguard.enabled (boolean, default: true) — enable/disable scanning
- veilguard.scanOnSave (boolean, default: true) — scan on file save
- veilguard.severityLevel (critical/warning/info, default: info) — minimum severity to show
- veilguard.licenseKey (string) — Pro license key for full scan depth

---

## PAGE 7: MCP SERVER (/docs/mcp)

### SEO Meta
```html
<title>Veilguard MCP Server — Auto-Scanning Security for Cursor, Claude Code, Windsurf</title>
<meta name="description" content="Set up Veilguard's MCP server for automatic security scanning in Cursor, Claude Code, Windsurf, VS Code, JetBrains, and Antigravity. Your AI agent scans code while you vibe.">
<meta name="keywords" content="MCP security server, Cursor MCP server, Claude Code MCP security, Windsurf MCP scanner, MCP server setup, auto-scanning security, AI coding security, Model Context Protocol security">
<meta property="og:url" content="https://veilguard.dev/docs/mcp">
```

### Content

Heading: "MCP Server Setup"
Subheading: "Your AI agent becomes security-aware."

How auto-scanning works:
Veilguard installs a security rules file that tells your AI agent when to scan. In Cursor, Windsurf, and Claude Code, the agent calls Veilguard's tools automatically:
- After writing any file → scan_secrets
- After creating API routes → scan_webhooks + scan_injection
- After changing database schemas → check_supabase_rls
- After modifying package.json → check_supply_chain + scan_dependencies
- Before deploying → full_audit (Pro) or all free scanners

Clean scan = total silence. Issue found = calm nudge in the chat.

(Include the full MCP config JSON, per-IDE instructions, and troubleshooting table from HOW-IT-WORKS.md)

---

## PAGE 8: BLOG INDEX (/blog)

### SEO Meta
```html
<title>Veilguard Blog — Vibe Coding Security, AI Code Vulnerabilities, and Developer Security Tips</title>
<meta name="description" content="Articles about vibe coding security risks, AI-generated code vulnerabilities, and how to ship secure applications built with Cursor, Claude Code, Lovable, and other AI coding tools.">
<meta name="keywords" content="vibe coding blog, AI code security blog, vibe coding security tips, AI generated code vulnerabilities, developer security blog">
<meta property="og:url" content="https://veilguard.dev/blog">
```

### Content
List of blog posts with title, date, and description.

---

## PAGE 9: FIRST BLOG POST (/blog/vibe-coding-security-risks)

THIS IS YOUR SEO MAGNET. This page targets the highest-volume keywords in your niche.

### SEO Meta
```html
<title>Vibe Coding Security Risks in 2026: Why 45% of AI-Generated Code Has Vulnerabilities</title>
<meta name="description" content="45% of AI-generated code contains security vulnerabilities. 28.6 million secrets leaked on GitHub in 2025. The Moltbook breach exposed 1.5M API keys from a fully vibe-coded app. Here's what's going wrong and how to fix it.">
<meta name="keywords" content="vibe coding security risks, AI generated code vulnerabilities, vibe coding security 2026, AI code security risks, Moltbook breach, Lovable security, Supabase RLS security, hardcoded API keys, vibe coding hacked, AI code vulnerabilities, cursor security risks, Claude Code security, is vibe coding safe, vibe coding security scanner, how to secure vibe coded app, AI code audit">
<meta property="og:title" content="Vibe Coding Security Risks: Why 45% of AI-Generated Code Has Vulnerabilities">
<meta property="og:url" content="https://veilguard.dev/blog/vibe-coding-security-risks">
```

### Schema.org for blog post
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Vibe Coding Security Risks in 2026: Why 45% of AI-Generated Code Has Vulnerabilities",
  "author": {"@type": "Organization", "name": "Veilguard"},
  "datePublished": "2026-05-10",
  "publisher": {"@type": "Organization", "name": "Veilguard", "url": "https://veilguard.dev"},
  "description": "45% of AI-generated code contains security vulnerabilities. Analysis of real breaches, data, and what developers can do to ship secure vibe-coded apps.",
  "mainEntityOfPage": "https://veilguard.dev/blog/vibe-coding-security-risks"
}
```

### Blog Post Content

Title: "Vibe Coding Security Risks in 2026: Why 45% of AI-Generated Code Has Vulnerabilities"

Opening paragraph:
"Vibe coding changed software development. Cursor, Claude Code, Windsurf, Lovable, and Bolt.new let anyone build functional applications in hours instead of months. 92% of developers now use AI coding assistants at least monthly. 41% of all code written globally is AI-generated. Collins English Dictionary named 'vibe coding' its Word of the Year for 2025. But there's a problem the industry is only starting to reckon with: the code AI writes is fast, functional — and frequently insecure."

Section: "The data is unambiguous"
"Veracode tested over 100 large language models on security-sensitive coding tasks. Result: 45% of AI-generated code samples introduced OWASP Top 10 vulnerabilities — and this pass rate has not improved across multiple testing cycles from 2025 through early 2026. AI-written code produces security flaws at 2.74 times the rate of human-written code, according to an analysis of 470 GitHub pull requests. GitGuardian's 2026 report documented 28.65 million hardcoded secrets pushed to public GitHub repos in 2025 — a 34% year-over-year increase. AI-assisted commits showed a 3.2% secret leak rate, double the baseline. Georgia Tech's Vibe Security Radar tracked 74 CVEs directly attributed to AI coding tools, with 35 in March 2026 alone — more than all of 2025 combined."

Section: "The Moltbook breach: what happens when vibe coding meets zero security review"
"In January 2026, Moltbook launched as an AI social network. Its founder stated publicly he didn't write a single line of code. Within three days, Wiz Security researchers discovered the app had exposed its entire production database. The AI-generated code placed a Supabase API key in client-side JavaScript without enabling Row Level Security. That single misconfiguration exposed 1.5 million API authentication tokens (including keys for OpenAI, Anthropic, AWS, and Google Cloud), 35,000 email addresses, thousands of private messages, and 4.75 million database records. No sophisticated attack. No zero-day exploit. The front door was simply left unlocked."

Section: "The Lovable vulnerability: 170 apps exposed at once"
"In May 2025, a security researcher scanned 1,645 applications from Lovable's showcase and found that 170 — 10.3% — had critical RLS failures (CVE-2025-48757). The exposed data included names, email addresses, phone numbers, home addresses, and financial records. The AI had implemented access control but inverted the logic: authenticated users were blocked while unauthenticated visitors had full access. The same pattern appeared across multiple apps."

Section: "The 5 security mistakes AI coding tools make most often"
1. "Hardcoded API keys as fallback values — AI writes process.env.STRIPE_KEY || 'sk_live_...' to make the code 'work' immediately. That live key ends up in your git history forever."
2. "SQL injection via template literals — AI uses db.query(`SELECT * FROM users WHERE id = ${id}`) instead of parameterized queries."
3. "Missing Supabase Row Level Security — AI creates tables and forgets ALTER TABLE ... ENABLE ROW LEVEL SECURITY. Without it, anyone with the public API key can read your entire database."
4. "Unverified webhooks — AI creates a Stripe webhook endpoint that reads req.body directly without calling stripe.webhooks.constructEvent(). Anyone can send fake payment events."
5. "Typosquatted packages — AI suggests 'lodahs' instead of 'lodash', or 'crossenv' instead of 'cross-env'. These packages steal your environment variables and exfiltrate credentials."

Section: "How to secure vibe-coded applications"
"The answer isn't to stop using AI coding tools. They're too productive to ignore. The answer is to add automated security scanning to your workflow — the same way the industry adopted linters and formatters. Veilguard is a free, open-source security scanner designed specifically for AI-generated code. It runs inside your IDE (Cursor, Claude Code, VS Code, Windsurf) and catches the exact vulnerability patterns that AI introduces. Secret detection for 50+ key patterns. SQL injection scanning. Supabase RLS deep audit. Supply chain attack detection. All running automatically while you code."

CTA: "Install Veilguard free — npx @veilguard/cli init"

---

## TARGET KEYWORDS BY SEARCH INTENT

### High-intent keywords (people ready to install a tool):
- "vibe coding security scanner"
- "AI code security scanner"
- "secret detection tool"
- "Supabase RLS audit tool"
- "MCP security server"
- "VS Code security extension"
- "Cursor security scanner"
- "Claude Code security"

### Problem-aware keywords (people who know they have a problem):
- "vibe coding security risks"
- "AI generated code vulnerabilities"
- "is vibe coding safe"
- "vibe coding hacked"
- "Moltbook breach"
- "Lovable security"
- "hardcoded API keys"
- "leaked API keys AI code"

### Informational keywords (people learning about the topic):
- "how to secure vibe coded app"
- "AI code audit"
- "Supabase RLS security"
- "vibe coding best practices security"
- "secure AI generated code"

### Long-tail keywords (specific, lower competition):
- "free security scanner for Cursor"
- "MCP server security scanning"
- "detect hardcoded secrets in AI code"
- "Supabase RLS checker free"
- "supply chain attack npm scanner"
- "SQL injection scanner for vibe coding"
- "Paystack API key leak detection"
- "Flutterwave secret key scanner"
- "M-Pesa webhook verification checker"

---

## INTERNAL LINKING STRATEGY

Every page should link to at least 2 other pages:
- Homepage → /docs/install, /pro, /blog/vibe-coding-security-risks
- /pro → /docs/scanners, /docs/install
- /docs/install → /docs/scanners, /docs/vs-code, /docs/mcp
- /docs/scanners → /pro (for Pro scanner details), /docs/install
- /docs/vs-code → /docs/install, /pro
- /docs/mcp → /docs/install, /docs/scanners
- /blog/vibe-coding-security-risks → /docs/install, /pro, /docs/scanners

The blog post is the primary SEO entry point. It should link to /docs/install at least twice and /pro once.

---

## OG IMAGE SPECIFICATION

Create a 1200x630px image for social sharing:
- Background: #080E12
- Left side: Veilguard logo (shield icon + "Veilguard" text in #F1F5F9)
- Right side: A fake terminal/code editor showing red underlines on hardcoded secrets
- Bottom: "Silent security for vibe coders" in #94A3B8
- Accent glow: subtle #34D399 gradient on the shield

This image is used across all pages for og:image and twitter:image.
