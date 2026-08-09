'use client';

import { doc, collection, query, where, orderBy, onSnapshot, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { api } from './api';
import { hostOf } from './url';

/**
 * Merge fields into the user's OWN profile doc. `updateDoc` throws `not-found`
 * when `users/{uid}` was never created — and the client never creates it (the
 * doc is seeded server-side by `ensureUser`, an idempotent, existence-guarded
 * transaction, via `POST /me`). This happens whenever `/me` didn't run/succeed
 * this session (e.g. an anonymous scan later claimed). So on `not-found` we ask
 * the backend to create the doc, then retry once. `plan`/`uid` stay server-owned
 * and untouched, so firestore.rules still permit the write.
 */
async function writeUserDoc(uid: string, data: Record<string, unknown>): Promise<void> {
  const ref = doc(db(), 'users', uid);
  try {
    await updateDoc(ref, data);
  } catch (e) {
    if ((e as { code?: string }).code !== 'not-found') throw e;
    const res = await api.me();
    if (!res.ok) {
      throw new Error(
        (res.data as { error?: string })?.error || 'Could not reach the server to set up your account.',
      );
    }
    await updateDoc(ref, data);
  }
}

/** Persist the user's account-wide notification preferences (their own doc). */
export async function saveNotifications(
  uid: string,
  notifications: { email: boolean; critical: boolean; deploy: boolean; summary: boolean },
): Promise<void> {
  await writeUserDoc(uid, { notifications });
}

/** Flip the user's own onboarded flag after the wizard. */
export async function markOnboarded(uid: string): Promise<void> {
  await writeUserDoc(uid, { onboarded: true });
}

/** The onboarding quiz answers we persist for segmentation. */
export interface OnboardingAnswers {
  builtWith?: string;
  backend?: string;
  handles?: string[];
  codeComfort?: string;
  scanTarget?: 'url' | 'repo' | 'upload' | '';
  shipFrequency?: string;
}

/**
 * Persist the onboarding answers + alert email onto the user's own doc and flip
 * `onboarded`. Kept as top-level fields (queryable: `onboarding.builtWith ==`,
 * `handles array-contains`). Goes through the same client write path as
 * markOnboarded — `plan`/billing stay server-owned, so firestore.rules permit it.
 */
export async function saveOnboarding(
  uid: string,
  answers: OnboardingAnswers,
  alertEmail?: string,
): Promise<void> {
  const onboarding = Object.fromEntries(
    Object.entries(answers).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  );
  await writeUserDoc(uid, {
    onboarding,
    ...(alertEmail ? { alertEmail } : {}),
    onboarded: true,
    onboardedAt: new Date().toISOString(),
  });
}

/** Raw backend shapes (mirror ../veilguard-backend). Kept loose on purpose. */
export interface BackendFinding {
  ruleId: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cwe?: string;
  owasp?: string;
  title: string;
  whyItMatters: string;
  evidence?: string;
  location?: { file?: string; line?: number; url?: string };
  confidence?: string;
  mode?: string;
}

export interface ScanDoc {
  id: string;
  target: { type: 'url' | 'repo'; value: string };
  type?: 'url' | 'deep' | 'upload';
  sources?: { github?: boolean; githubRepo?: string; supabase?: boolean; url?: string };
  ownerUid?: string | null;
  /** Slice 7: 'monitor' = an automatic re-scan; `appId` ties it to a registry app. */
  origin?: 'user' | 'monitor';
  appId?: string;
  status: 'queued' | 'running' | 'done' | 'error';
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  score?: number;
  counts?: { critical: number; high: number; medium: number; low: number; info: number; passed: number };
  error?: string;
  stack?: { supabase?: boolean; firebase?: boolean; firebaseRulesInRepo?: boolean };
  createdAt: string;
  finishedAt?: string;
  progress?: { done: number; total: number; phase: string };
}

export function subscribeScan(scanId: string, cb: (scan: ScanDoc | null) => void): () => void {
  return onSnapshot(
    doc(db(), 'scans', scanId),
    (snap) => cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as ScanDoc) : null),
    () => cb(null),
  );
}

export function subscribeFindings(
  scanId: string,
  cb: (findings: (BackendFinding & { id: string })[]) => void,
): () => void {
  return onSnapshot(
    collection(db(), 'scans', scanId, 'findings'),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as BackendFinding) }))),
    () => cb([]),
  );
}

/** One-shot read of a (historical) scan's findings — used to diff against the previous scan. */
export async function getFindings(scanId: string): Promise<(BackendFinding & { id: string })[]> {
  const snap = await getDocs(collection(db(), 'scans', scanId, 'findings'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as BackendFinding) }));
}

export function subscribeFinding(
  scanId: string,
  findingId: string,
  cb: (finding: (BackendFinding & { id: string }) | null) => void,
): () => void {
  return onSnapshot(
    doc(db(), 'scans', scanId, 'findings', findingId),
    (snap) => cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as BackendFinding) }) : null),
    () => cb(null),
  );
}

export function subscribeMyScans(uid: string, cb: (scans: ScanDoc[]) => void): () => void {
  const q = query(collection(db(), 'scans'), where('ownerUid', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScanDoc))),
    () => cb([]),
  );
}

/* -------------------------------------------------------------------------- */
/* App registry                                                               */
/*                                                                            */
/* An "app" is one project the user is protecting; it can hold a URL scan     */
/* (outside-in) and/or a Deep scan (a connected repo, inside-out). Scans stay */
/* their own Firestore docs; the registry just records which URL + repo       */
/* belong to the same project so the two lenses roll up under one card. It    */
/* lives on the user's OWN profile doc — writable by the client because       */
/* firestore.rules permit self-updates that leave `plan`/`uid` unchanged      */
/* (same door `markOnboarded` uses). No scan-pipeline or backend change.      */
/* -------------------------------------------------------------------------- */

/** How often an app is automatically re-scanned. 'push' = on every git push. */
export type Cadence = 'off' | 'push' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** Per-app monitoring config (mirrors the backend `AppMonitoring`). */
export interface AppMonitoring {
  cadence: Cadence;
  emailAlerts: boolean;
  severity?: 'critical' | 'high';
}

export interface AppRecord {
  id: string;
  name: string;
  /** Normalized to a bare host by callers via `upsertApp`; may be a full URL. */
  url?: string;
  githubRepo?: string;
  createdAt: string;
  monitoring?: AppMonitoring;
}

/** A monitoring event (diff of one auto re-scan vs the previous). Read-only. */
export interface MonitorEvent {
  id: string;
  uid: string;
  appId: string;
  scanId: string;
  prevScanId: string | null;
  newFindings: { key: string; ruleId: string; severity: string; title: string; where?: string }[];
  resolvedFindings: { key: string; ruleId: string; severity: string; title: string; where?: string }[];
  gradeBefore: string | null;
  gradeAfter: string | null;
  alerted: boolean;
  createdAt: string;
}

/** Live list of the user's app-registry entries (from their profile doc). */
export function subscribeMyApps(uid: string, cb: (apps: AppRecord[]) => void): () => void {
  return onSnapshot(
    doc(db(), 'users', uid),
    (snap) => cb((snap.data()?.apps as AppRecord[] | undefined) ?? []),
    () => cb([]),
  );
}

/** Overwrite the whole registry array. Allowed because plan/uid are untouched. */
export async function saveApps(uid: string, apps: AppRecord[]): Promise<void> {
  await writeUserDoc(uid, { apps });
}

/**
 * Return a new registry that links `patch` (a url and/or repo) into one app:
 * merges into an existing entry that already shares the url-host or repo,
 * otherwise appends a new entry. This is how the two lenses get explicitly
 * tied together when a user adds the second scan to a project.
 */
export function upsertApp(records: AppRecord[], patch: { url?: string; githubRepo?: string; name?: string }): AppRecord[] {
  const host = patch.url ? hostOf(patch.url) : undefined;
  const idx = records.findIndex(
    (r) => (!!host && !!r.url && hostOf(r.url) === host) || (!!patch.githubRepo && r.githubRepo === patch.githubRepo),
  );
  if (idx >= 0) {
    const cur = records[idx]!;
    const merged: AppRecord = { ...cur, url: cur.url ?? patch.url, githubRepo: cur.githubRepo ?? patch.githubRepo };
    return records.map((r, i) => (i === idx ? merged : r));
  }
  const rec: AppRecord = {
    id: crypto.randomUUID(),
    name: patch.name ?? host ?? patch.githubRepo ?? 'App',
    url: patch.url,
    githubRepo: patch.githubRepo,
    createdAt: new Date().toISOString(),
  };
  return [...records, rec];
}

/**
 * Set an app's monitoring config, creating/linking its registry entry first if
 * needed (so monitoring works even for a derived, not-yet-saved app). The backend
 * scheduler/webhook read exactly this `monitoring` field.
 */
export async function setAppMonitoring(
  uid: string,
  records: AppRecord[],
  appLike: { url?: string; githubRepo?: string; name?: string },
  monitoring: AppMonitoring,
): Promise<void> {
  const host = appLike.url ? hostOf(appLike.url) : undefined;
  const next = upsertApp(records, appLike).map((r) => {
    const match = (!!host && !!r.url && hostOf(r.url) === host) || (!!appLike.githubRepo && r.githubRepo === appLike.githubRepo);
    return match ? { ...r, monitoring } : r;
  });
  await saveApps(uid, next);
}

/** Live monitoring events for the user (newest-first; sorted client-side, no index needed). */
export function subscribeMonitorEvents(uid: string, cb: (events: MonitorEvent[]) => void): () => void {
  return onSnapshot(
    query(collection(db(), 'monitorEvents'), where('uid', '==', uid)),
    (snap) => {
      const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MonitorEvent);
      events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      cb(events);
    },
    () => cb([]),
  );
}
