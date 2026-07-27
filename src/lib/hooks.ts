'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth';
import { subscribeMyScans, subscribeMyApps, subscribeMonitorEvents, type ScanDoc, type AppRecord, type MonitorEvent, type AppMonitoring } from './scans';
import { api, type GitHubRepo } from './api';
import { hostOf } from './url';

/** Live list of the signed-in user's scans (newest first). */
export function useMyScans(): { scans: ScanDoc[]; loading: boolean } {
  const { user } = useAuth();
  const [state, setState] = useState<{ scans: ScanDoc[]; loading: boolean }>({ scans: [], loading: true });
  useEffect(() => {
    if (!user) return;
    // setState only from the Firestore subscription callback (the legitimate
    // external-store case), never synchronously in the effect body.
    return subscribeMyScans(user.uid, (scans) => setState({ scans, loading: false }));
  }, [user]);
  // Signed-out is a derived state — no scans, nothing loading.
  return user ? state : { scans: [], loading: false };
}

export type GitHubReposState = {
  repos: GitHubRepo[];
  loading: boolean;
  /** 'not-connected' when GitHub isn't linked; a message string on other failures. */
  error: 'not-connected' | string | null;
  reload: () => void;
};

/** Fetch the repos the user's GitHub connection can scan (for the repo picker). */
export function useGitHubRepos(enabled = true): GitHubReposState {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not-connected' | string | null>(null);
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.githubRepos().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setRepos(res.data.repos ?? []);
        setError(null);
      } else if (res.status === 409) {
        setError('not-connected');
      } else {
        setError(res.data?.error || 'Could not load your repositories.');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [enabled, user, nonce]);

  return { repos, loading, error, reload };
}

/** Live list of the user's app-registry entries (see `scans.ts`). */
export function useMyApps(): { apps: AppRecord[]; loading: boolean } {
  const { user } = useAuth();
  const [state, setState] = useState<{ apps: AppRecord[]; loading: boolean }>({ apps: [], loading: true });
  useEffect(() => {
    if (!user) return;
    return subscribeMyApps(user.uid, (apps) => setState({ apps, loading: false }));
  }, [user]);
  return user ? state : { apps: [], loading: false };
}

/**
 * An `App` is one project seen through up to two lenses: a URL scan (outside-in)
 * and a Deep scan (a connected repo, inside-out). It is a superset of the old
 * per-host "site" — it still exposes `host`/`latest`/`scans` for the screens
 * that render a single rolled-up view — plus the split lenses used by the Apps
 * page. `labels` are every target label under this app, so the top-bar picker's
 * `activeSite` string resolves whether it was set from a URL host or a repo name.
 */
export interface App {
  key: string;
  name: string;
  host: string;
  url?: string;
  githubRepo?: string;
  scans: ScanDoc[];
  latest: ScanDoc | null;
  grade?: ScanDoc['grade'];
  urlScans: ScanDoc[];
  deepScans: ScanDoc[];
  latestUrlScan: ScanDoc | null;
  latestDeepScan: ScanDoc | null;
  labels: string[];
  derived: boolean;
  monitoring?: AppMonitoring;
}

/** White-box scans (a connected repo OR an uploaded folder) — the "code" lens. */
const isCodeScan = (s: ScanDoc): boolean => s.type === 'deep' || s.type === 'upload';

/** Short lens label for a scan in history rows. */
export function lensLabel(s: Pick<ScanDoc, 'type'>): 'Upload' | 'Deep' | 'URL' {
  return s.type === 'upload' ? 'Upload' : s.type === 'deep' ? 'Deep' : 'URL';
}

function makeApp(base: Partial<App> & { key: string; name: string; host: string; derived: boolean }, scans: ScanDoc[]): App {
  const sorted = [...scans].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const urlScans = sorted.filter((s) => !isCodeScan(s));
  const deepScans = sorted.filter(isCodeScan);
  const labels = [...new Set([base.host, ...sorted.map(scanLabel)])].filter(Boolean) as string[];
  return {
    url: undefined,
    githubRepo: undefined,
    ...base,
    scans: sorted,
    latest: sorted[0] ?? null,
    grade: sorted[0]?.grade,
    urlScans,
    deepScans,
    latestUrlScan: urlScans[0] ?? null,
    latestDeepScan: deepScans[0] ?? null,
    labels,
  };
}

/**
 * Group scans (newest-first) into apps. Registry entries claim their URL scans
 * (by matching host) and Deep scans (by matching repo) so both lenses of one
 * project merge into a single card. Any scan not claimed by a registry entry
 * falls back to a derived app keyed by its label — so nothing ever disappears
 * and no migration is needed for scans that predate the registry.
 */
export function groupApps(scans: ScanDoc[], records: AppRecord[]): App[] {
  const claimed = new Set<string>();
  const registryApps: App[] = records.map((r) => {
    const recHost = r.url ? hostOf(r.url) : undefined;
    const mine = scans.filter((s) => {
      // Upload scans are one-shot and never link to a registry repo/url → derived.
      if (isCodeScan(s)) return s.type === 'deep' && !!r.githubRepo && s.sources?.githubRepo === r.githubRepo;
      return !!recHost && hostOf(s.target.value) === recHost;
    });
    mine.forEach((s) => claimed.add(s.id));
    return makeApp(
      { key: r.id, name: r.name, host: recHost ?? r.githubRepo ?? r.name, url: r.url, githubRepo: r.githubRepo, derived: false, monitoring: r.monitoring },
      mine,
    );
  });

  const byLabel = new Map<string, ScanDoc[]>();
  for (const s of scans) {
    if (claimed.has(s.id)) continue;
    const key = scanLabel(s);
    (byLabel.get(key) ?? byLabel.set(key, []).get(key)!).push(s);
  }
  const derivedApps: App[] = [...byLabel.entries()].map(([label, list]) => {
    const isDeep = isCodeScan(list[0]!);
    return makeApp(
      {
        key: `derived:${label}`,
        name: label,
        host: label,
        url: isDeep ? undefined : list[0]!.target.value,
        githubRepo: isDeep ? list[0]!.sources?.githubRepo : undefined,
        derived: true,
      },
      list,
    );
  });

  // Registry apps first (explicit projects), then derived, newest-scan first.
  const ts = (a: App) => a.latest?.createdAt ?? '';
  return [...registryApps, ...derivedApps].sort((a, b) => (ts(a) < ts(b) ? 1 : -1));
}

/** Short kind label for an app (drives the picker's type badge + monitoring options). */
export function appKind(app: Pick<App, 'githubRepo' | 'url' | 'latest'>): 'Repo' | 'URL' | 'Upload' {
  if (app.githubRepo) return 'Repo';
  if (app.latest?.type === 'upload') return 'Upload';
  return 'URL';
}

/** Resolve the active app from an `activeSite` label (host OR a child scan label). */
export function findActiveApp(apps: App[], activeSite: string | null): App | null {
  if (!apps.length) return null;
  if (!activeSite) return apps[0]!;
  return apps.find((a) => a.host === activeSite || a.key === activeSite || a.labels.includes(activeSite)) ?? apps[0]!;
}

/** Live monitoring events (auto re-scan diffs / alerts) for the signed-in user. */
export function useMonitorEvents(): { events: MonitorEvent[]; loading: boolean } {
  const { user } = useAuth();
  const [state, setState] = useState<{ events: MonitorEvent[]; loading: boolean }>({ events: [], loading: true });
  useEffect(() => {
    if (!user) return;
    return subscribeMonitorEvents(user.uid, (events) => setState({ events, loading: false }));
  }, [user]);
  return user ? state : { events: [], loading: false };
}

/** Scans + registry rolled up into apps (the primary hook the shell screens use). */
export function useApps(): { apps: App[]; records: AppRecord[]; scans: ScanDoc[]; loading: boolean } {
  const { scans, loading: scansLoading } = useMyScans();
  const { apps: records, loading: appsLoading } = useMyApps();
  const apps = useMemo(() => groupApps(scans, records), [scans, records]);
  return { apps, records, scans, loading: scansLoading || appsLoading };
}

/**
 * A friendly label for a scan's target. Deep scans carry the repo name (either
 * in `sources.githubRepo` or encoded in the target as `connected:<repo>`), so
 * each repo shows as its own card and re-scans of the same repo roll up. URLs use
 * the hostname.
 */
export function scanLabel(scan: Pick<ScanDoc, 'type' | 'target'> & { sources?: { githubRepo?: string } }): string {
  if (scan.type === 'deep') {
    if (scan.sources?.githubRepo) return scan.sources.githubRepo;
    const v = scan.target.value.startsWith('connected:') ? scan.target.value.slice('connected:'.length) : scan.target.value;
    return v === 'github' || v === 'deep' ? 'Connected repo' : v;
  }
  if (scan.type === 'upload') {
    const v = scan.target.value.startsWith('upload:') ? scan.target.value.slice('upload:'.length) : scan.target.value;
    return v || 'Uploaded folder';
  }
  try {
    return new URL(scan.target.value.startsWith('http') ? scan.target.value : `https://${scan.target.value}`).hostname;
  } catch {
    return scan.target.value;
  }
}

/** Compact relative time — "just now", "5m ago", "2h ago", "3d ago", or a date. */
export function timeAgo(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const GRADE_TINT: Record<string, { bg: string; fg: string }> = {
  A: { bg: 'rgba(31,184,107,.16)', fg: '#1FB86B' },
  B: { bg: 'rgba(31,184,107,.16)', fg: '#1FB86B' },
  C: { bg: 'rgba(242,133,31,.16)', fg: '#F2851F' },
  D: { bg: 'rgba(229,53,43,.16)', fg: '#E5352B' },
  F: { bg: 'rgba(229,53,43,.16)', fg: '#E5352B' },
};
