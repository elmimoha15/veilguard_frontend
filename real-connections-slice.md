# Veilguard — SLICE: Real Connections (read-only, extensible provider registry)

Where this sits: Slices 1–5 are gate-green (scanner, scan service, free-scan, auth, connected deep scans **in MOCK mode**). This slice turns the mock connections into **real, read-only** integrations and makes adding new tools a small, isolated change. It should land **before or alongside Slice 6 (billing)** — deep scans are the paid value, so real connections need to exist first.

---

## 0. Current state (what already exists — do NOT rebuild)

- `connectGitHub` / `connectSupabase` / `disconnect` / `createDeepScan` endpoints, wired to the frontend (Settings, onboarding, ⚡ Deep scan).
- `secrets/{uid}` — encrypted credential storage (AES-256-GCM, `shared/src/crypto.ts`); `firestore.rules` DENY it to all clients.
- `users/{uid}.connections` — client-readable, non-secret connection metadata.
- Ephemeral workspace: worker copies/fetches source into `os.tmpdir()/veilguard-ws/{scanId}` and **deletes it in `finally`** (source never persisted).
- White-box engine consumes a workspace directory and streams findings.
- **MOCK mode** (`config.mockConnections`, auto-on under emulator): connect points at a local fixture; `createDeepScan` scans the fixture, not the user's real code.
- `Provider` type is currently the union `'github' | 'supabase'`.

**The gap:** no real OAuth / app-install / service-account flows; Firebase + Vercel/etc. aren't providers; "real mode" in `connect.ts` is a stub that expects a token nothing produces.

---

## 1. Goals

1. A user connects their **real** GitHub, Supabase, and Firebase (and, extensibly, Vercel/Netlify/Clerk/Auth0/…) with **least-privilege, read-only** access.
2. `createDeepScan` pulls artifacts from **every connected provider** and returns one unified white-box + black-box grade for the app.
3. Adding a new provider = drop in one module + register it. No changes to the queue, worker core, rules, or scan model.
4. **Security invariants preserved:** credentials encrypted at rest, `secrets/{uid}` denied to clients, source deleted after every scan, `private/fix` still locked (`firestore.rules` UNCHANGED), disconnect **revokes** access at the provider.
5. **Mock mode stays** for CI/tests/local so the existing gates stay green without real credentials.

---

## 2. Architecture — the Provider Registry (the core design)

Define a single interface every tool implements, and a registry the rest of the system iterates. Nothing else in the backend knows provider names.

```ts
// shared/src/providers/types.ts
type AuthKind = 'github_app' | 'oauth2' | 'service_account' | 'api_key' | 'paste';

interface ConnectionProvider {
  id: string;                       // 'github', 'supabase', 'firebase', 'vercel', …
  displayName: string;
  authKind: AuthKind;
  readOnlyScopes: string[];         // documented least-privilege scopes
  // 1) start: return where to send the user (OAuth URL) or the form fields to collect.
  begin(uid: string): Promise<{ redirectUrl?: string; fields?: FieldSpec[]; state?: string }>;
  // 2) finish: exchange code/receive credentials → return encrypted secret + public metadata.
  complete(uid: string, input: CompleteInput): Promise<{ secret: ProviderSecret; meta: ConnectionMeta }>;
  // 3) fetch: materialize read-only artifacts into the scan workspace (repo files, SQL policies,
  //    firestore.rules, env manifests…). MUST NOT write to the provider.
  fetch(secret: ProviderSecret, workspace: string): Promise<FetchResult>;
  // 4) revoke: best-effort revoke/uninstall at the provider on disconnect.
  revoke(secret: ProviderSecret): Promise<void>;
}

// shared/src/providers/index.ts  — the ONLY place providers are listed
export const PROVIDERS: Record<string, ConnectionProvider> = {
  github: githubProvider,
  supabase: supabaseProvider,
  firebase: firebaseProvider,
  vercel: vercelProvider,      // add new tools here — nothing else changes
};
```

- `Provider` type becomes `keyof typeof PROVIDERS` (string), not a hardcoded union.
- Generic endpoints replace the per-provider ones (keep old routes as thin aliases for back-compat):
  - `POST /connect/begin   { provider }`            → `{ redirectUrl }` or `{ fields }`
  - `POST /connect/complete{ provider, code|form }` → stores encrypted secret + metadata
  - `POST /disconnect      { provider }`            → calls `revoke()` then deletes secret+meta
  - `GET  /connections`                             → the caller's connection metadata
- `createDeepScan` iterates the user's connected providers, calls each `fetch()` into the workspace, runs the engine once over the combined workspace, streams unified findings. Same idempotency/cleanup as today.
- **Mock seam kept:** each provider has a `mock` implementation used when `config.mockConnections` is on (fixture instead of network). Real impl used otherwise. One flag, no branching in call sites.

---

## 3. Per-provider real design

### GitHub (`authKind: github_app`) — highest value
- A **GitHub App** (not a broad OAuth token): permissions **Contents: Read** + **Metadata: Read**, no write, installable on **a single selected repo**.
- Flow: `begin` → GitHub App install URL (state param) → user installs on one repo → callback → `complete` exchanges the installation for a short-lived **installation access token**; store `{ installationId }` encrypted (mint fresh tokens per scan, don't store long-lived tokens).
- `fetch`: tarball/clone the repo at HEAD into the workspace (size-capped, `DEEP_SCAN_MAX_BYTES`).
- `revoke`: delete the installation (or the stored installation id).

### Supabase (`authKind: oauth2` + `paste` fallback)
- Preferred: Supabase **OAuth** (management API) → read project migrations / policies read-only; or a **read-only Postgres role** connection string; store encrypted.
- Fallback (works today): **paste your SQL policies** → analyzed directly. Keep this as a zero-setup option.
- `fetch`: pull migrations / `policies.sql` / schema into the workspace for the RLS + SECURITY DEFINER + over-permissive-policy rules.

### Firebase (`authKind: service_account`) — new
- User uploads a **service-account JSON** (or connects via Google OAuth to list projects). Read **Firestore/Storage security rules** + App Check status. Read-only.
- `fetch`: write `firestore.rules` / `storage.rules` into the workspace for the open-rules (`allow … if true`), auth-only-without-ownership rules.
- Store the service-account key encrypted; never client-readable.

### Vercel / Netlify / Clerk / Auth0 / … (`oauth2` or `api_key`) — extensible, later phase
- Each a small module: env-var exposure (secret-named vars behind `NEXT_PUBLIC_`), unauthenticated edge functions (Vercel/Netlify), wildcard redirect URIs + multi-tenant org checks (Clerk/Auth0).
- Ship the registry so these are additive; implement 1–2 to prove extensibility, stub the rest with a "coming soon" provider flag surfaced to the UI.

---

## 4. Credential & data security (non-negotiable)

- All secrets encrypted at rest in `secrets/{uid}` (reuse `crypto.ts`); `firestore.rules` for `secrets/**` stay `deny all`. **Do not change `firestore.rules`' `private/fix` lock.**
- **Least privilege, read-only, single-resource** per provider; document exact scopes in each module + the connect UI.
- **Source never persisted:** keep the ephemeral-workspace-deleted-in-`finally` guarantee; add a test that the workspace is gone after success AND error.
- **Disconnect revokes** at the provider (uninstall app / revoke token), not just a local delete.
- OAuth: `state` param (CSRF), PKCE for public clients, exact callback allow-list. Tokens minted per-scan where possible (GitHub installation tokens), refresh handled server-side.
- **Isolation:** a user can only ever fetch with their OWN connection (server keys everything by `uid` via `requireAuth`); add a test that user B can't trigger a scan using user A's connection.

---

## 5. Frontend integration

- **Settings → Connections**: one row per registered provider (from `/connections` + registry manifest), each with real **Connect** (opens OAuth popup / upload form) → connected state (repo/project, scopes, "read-only") → **Disconnect** (revokes). Replace the current mock-fixture wiring.
- **Onboarding** connect step: same real flow (GitHub + Supabase + Firebase toggles).
- **Deep scan**: ⚡ button runs `createDeepScan` across all connected providers; results in the in-shell scan view + Findings page (already built).
- **Anonymous black-box results upsell** (do this even before real backend): after a free URL scan, a clear panel — *"We scanned everything visible from outside. To catch backend issues — exposed server secrets, broken database rules, unverified webhooks, injection — connect your GitHub / Supabase / Firebase (read-only)."* → sign-up → connect.
- Remove/relabel the dev "mock" language once real mode is live; keep a dev-only mock toggle.

---

## 6. External setup YOU must provide (blocks real mode)

I can build the entire framework, all mock paths, unit tests, and the frontend; real connections need credentials only you can create:

- [ ] **GitHub App** created → App ID, private key (.pem), client ID/secret, callback URL, webhook secret.
- [ ] **Supabase OAuth app** (or a read-only DB role) → client ID/secret, redirect URL. (Paste-policies needs nothing.)
- [ ] **Firebase**: enable service-account upload (or Google OAuth client) → OAuth client credentials if using OAuth.
- [ ] Per tool added later (Vercel/Netlify/Clerk/Auth0): its OAuth app / API key.
- [ ] A public **callback URL** for local dev (tunnel, e.g. cloudflared/ngrok) or use providers' localhost-callback support.

Store all as backend env/secrets — never in the frontend bundle.

---

## 7. ★ TESTING GATE — must pass before this slice is "done" ★

Honest mock/real split (real OAuth can't run on the bare emulator; CI uses mock + HTTP-mocked unit tests, real is a documented manual smoke).

- **A) Registry**: adding a no-op provider module + one registry line makes it appear in `/connections` and the UI with zero other changes.
- **B) GitHub real (manual, documented)**: install the GitHub App on one real repo → `/connect/complete` stores an encrypted installation → `createDeepScan` fetches THAT repo → white-box findings stream → grade. Screenshot/transcript.
- **C) Supabase**: OAuth/role path fetches real policies (manual); **paste-policies path automated** in CI.
- **D) Firebase**: upload a service-account (manual) → reads `firestore.rules` → flags open rules; automated unit test with a fixture rules file.
- **E) Least privilege**: each provider requests only read-only scopes; asserted in unit tests against each module's manifest.
- **F) Source deletion**: workspace deleted after success AND after a thrown error (automated).
- **G) Revoke on disconnect**: disconnect calls the provider revoke (HTTP-mocked assert) then removes secret+meta.
- **H) Isolation**: user B cannot connect-read or deep-scan using user A's connection (automated, client-SDK + API).
- **I) Rules unchanged**: `git diff firestore.rules` empty; `secrets/**` and `private/fix` still denied to clients (automated).
- **J) Mock still green**: existing Slice 5 gate + all prior backend gates still pass with `MOCK_CONNECTIONS=1`.
- **K) Multi-provider deep scan**: with GitHub + Supabase + Firebase connected, one deep scan produces a unified report spanning all three (mock fixtures in CI).
- **L) Frontend**: real connect/disconnect works in the UI; anonymous results shows the connect-to-go-deeper upsell; typecheck + build + lint clean.

Print a GATE RESULTS table (A–L), honest about which are mock vs. real-manual.

---

## 8. Deliverables

The provider-registry code, per-provider modules (GitHub + Supabase + Firebase real; Vercel/others scaffolded), generic connect endpoints, updated `createDeepScan`, frontend connect UX + anonymous upsell, the external-setup README, and the GATE RESULTS table + confirmation `firestore.rules` is unchanged.

---

## Suggested execution order (step by step)

1. **Provider registry + generic endpoints + mock seam** (no external creds; keeps gate green). ← safe to start immediately
2. **GitHub App** real flow (needs your GitHub App).
3. **Supabase** (paste-policies automated first, then OAuth/role).
4. **Firebase** service-account provider.
5. **Frontend** real connect UX + anonymous upsell.
6. **Vercel/Netlify/Clerk/Auth0** as additive modules.
7. Gate A–L, then hand off to Slice 6 (billing) which gates deep scans behind the real plan.
