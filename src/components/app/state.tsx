'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { Sev, Status } from './data';

export type Toast = { id: number; msg: string; color: string };
export type Modal = null | 'addApp' | 'cancel';

// sessionStorage keys so in-progress work survives a refresh / accidental nav.
// (Distinct from `vg_pending_scan`, which is the anonymous scan-CLAIM token.)
const PENDING_SCAN_KEY = 'vg_pending_scan_watch';
export const OB_KEY = 'vg_onboarding';
// When the user last opened the Alerts page (ms). Persisted per-device so the
// unread count + NEW badges mean "changed since you last checked".
export const ALERTS_SEEN_KEY = 'vg_alerts_seen_at';

export interface OnboardingState {
  step: number;
  /** What the user wants to check, drives the target step. */
  scanTarget: 'url' | 'repo' | 'upload' | '';
  /** Multi-select: which tools the app was built with (people use more than one). */
  builtWith: string[];
  /** Multi-select: which backend(s) the app uses. */
  backend: string[];
  /** Multi-select: payments / logins / personal data / uploads / etc. */
  handles: string[];
  /** Multi-select: where the user heard about Veilguard (attribution/analytics). */
  heardFrom: string[];
  url: string;
  /** True when the URL arrived from a marketing scan box, so onboarding skips the URL step. */
  fromMarketing: boolean;
  email: string;
  /** Chosen plan key ('free' | 'guard'); a paid plan is granted only by the Polar webhook. */
  plan: string;
  gh: boolean;
  sb: boolean;
  /** The scan kicked off inside onboarding (shown inline before the dashboard). */
  scanId: string | null;
}

const INITIAL_OB: OnboardingState = {
  step: 1,
  scanTarget: 'url',
  builtWith: [],
  backend: [],
  handles: [],
  heardFrom: [],
  url: '',
  fromMarketing: false,
  email: '',
  plan: 'free', // Free is the default; Guard is chosen explicitly (opens checkout).
  gh: false,
  sb: false,
  scanId: null,
};

interface AppState {
  reduce: boolean;
  // toggles
  toggles: { email: boolean; critical: boolean; deploy: boolean };
  toggle: (key: 'email' | 'critical' | 'deploy') => void;
  // active site selection (host key). Global across every shell page: the
  // top-bar picker changes THIS and the whole app re-scopes, no navigation.
  activeSite: string | null;
  setActiveSite: (host: string | null) => void;
  // The scan the user most recently kicked off. <ScanWatcher> watches it so that
  // when it finishes, even if the user left the scanning screen to browse, we
  // reveal its result page. Cleared once handled.
  pendingScanId: string | null;
  setPendingScanId: (id: string | null) => void;
  // Alerts "seen" watermark (ms): everything newer than this is unread. Read by the
  // sidebar badge; bumped to now when the user opens the Alerts page.
  alertsSeenAt: number;
  markAlertsSeen: () => void;
  // filters
  filterSev: 'all' | Sev;
  filterStatus: 'all' | Status;
  setFilterSev: (v: 'all' | Sev) => void;
  setFilterStatus: (v: 'all' | Status) => void;
  // onboarding
  ob: OnboardingState;
  setOb: (patch: Partial<OnboardingState>) => void;
  /** Reset onboarding answers + clear the persisted draft (call on finish). */
  clearOb: () => void;
  // modals
  modal: Modal;
  setModal: (m: Modal) => void;
  newAppUrl: string;
  setNewAppUrl: (v: string) => void;
  // toasts + confetti
  toasts: Toast[];
  toast: (msg: string, color?: string) => void;
  celebrate: boolean;
  celebrateNow: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within <AppStateProvider>');
  return ctx;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  const [toggles, setToggles] = useState({ email: true, critical: true, deploy: true });
  const [filterSev, setFilterSev] = useState<'all' | Sev>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [ob, setObState] = useState<OnboardingState>(INITIAL_OB);
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [pendingScanId, setPendingScanIdState] = useState<string | null>(null);
  const [alertsSeenAt, setAlertsSeenAtState] = useState<number>(0);
  const [modal, setModal] = useState<Modal>(null);
  const [newAppUrl, setNewAppUrl] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const toastId = useRef(0);

  // Restore persisted drafts once after mount (not in the useState initializer, so
  // the prerendered HTML and first client render match, no hydration mismatch).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const rawOb = window.sessionStorage.getItem(OB_KEY);
      if (rawOb) setObState((prev) => ({ ...prev, ...(JSON.parse(rawOb) as Partial<OnboardingState>) }));
      const ps = window.sessionStorage.getItem(PENDING_SCAN_KEY);
      if (ps) setPendingScanIdState(ps);
      const seen = window.localStorage.getItem(ALERTS_SEEN_KEY);
      if (seen) setAlertsSeenAtState(Number(seen) || 0);
    } catch { /* storage off */ }
  }, []);

  const toggle = useCallback((key: 'email' | 'critical' | 'deploy') => {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }, []);

  // Persist onboarding answers + step on every change so a refresh resumes here.
  const setOb = useCallback((patch: Partial<OnboardingState>) => {
    setObState((prev) => {
      const next = { ...prev, ...patch };
      try { window.sessionStorage.setItem(OB_KEY, JSON.stringify(next)); } catch { /* storage off */ }
      return next;
    });
  }, []);

  const clearOb = useCallback(() => {
    try { window.sessionStorage.removeItem(OB_KEY); } catch { /* storage off */ }
    setObState(INITIAL_OB);
  }, []);

  const markAlertsSeen = useCallback(() => {
    const now = Date.now();
    setAlertsSeenAtState(now);
    try { window.localStorage.setItem(ALERTS_SEEN_KEY, String(now)); } catch { /* storage off */ }
  }, []);

  // Persist the ambient running-scan so its progress chip survives a hard refresh.
  const setPendingScanId = useCallback((id: string | null) => {
    setPendingScanIdState(id);
    try {
      if (id) window.sessionStorage.setItem(PENDING_SCAN_KEY, id);
      else window.sessionStorage.removeItem(PENDING_SCAN_KEY);
    } catch { /* storage off */ }
  }, []);

  const toast = useCallback((msg: string, color = '#1F9D57') => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, msg, color }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2600);
  }, []);

  const celebrateNow = useCallback(() => {
    if (reduce) return;
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2200);
  }, [reduce]);

  const value = useMemo<AppState>(
    () => ({
      reduce,
      toggles,
      toggle,
      activeSite,
      setActiveSite,
      pendingScanId,
      setPendingScanId,
      alertsSeenAt,
      markAlertsSeen,
      filterSev,
      filterStatus,
      setFilterSev,
      setFilterStatus,
      ob,
      setOb,
      clearOb,
      modal,
      setModal,
      newAppUrl,
      setNewAppUrl,
      toasts,
      toast,
      celebrate,
      celebrateNow,
    }),
    [reduce, toggles, toggle, activeSite, pendingScanId, setPendingScanId, alertsSeenAt, markAlertsSeen, filterSev, filterStatus, ob, setOb, clearOb, modal, newAppUrl, toasts, toast, celebrate, celebrateNow],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
