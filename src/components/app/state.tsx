'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { Sev, Status } from './data';

export type Toast = { id: number; msg: string; color: string };
export type Modal = null | 'addApp' | 'cancel';

export interface OnboardingState {
  step: number;
  /** What the user wants to check — drives the target step. */
  scanTarget: 'url' | 'repo' | 'upload' | '';
  builtWith: string;
  backend: string;
  /** Multi-select: payments / logins / personal data / not yet. */
  handles: string[];
  codeComfort: string;
  shipFrequency: string;
  url: string;
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
  builtWith: '',
  backend: '',
  handles: [],
  codeComfort: '',
  shipFrequency: '',
  url: '',
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
  // when it finishes — even if the user left the scanning screen to browse — we
  // reveal its result page. Cleared once handled.
  pendingScanId: string | null;
  setPendingScanId: (id: string | null) => void;
  // filters
  filterSev: 'all' | Sev;
  filterStatus: 'all' | Status;
  setFilterSev: (v: 'all' | Sev) => void;
  setFilterStatus: (v: 'all' | Status) => void;
  // onboarding
  ob: OnboardingState;
  setOb: (patch: Partial<OnboardingState>) => void;
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
  const [pendingScanId, setPendingScanId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [newAppUrl, setNewAppUrl] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const toastId = useRef(0);

  const toggle = useCallback((key: 'email' | 'critical' | 'deploy') => {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }, []);

  const setOb = useCallback((patch: Partial<OnboardingState>) => {
    setObState((prev) => ({ ...prev, ...patch }));
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
      filterSev,
      filterStatus,
      setFilterSev,
      setFilterStatus,
      ob,
      setOb,
      modal,
      setModal,
      newAppUrl,
      setNewAppUrl,
      toasts,
      toast,
      celebrate,
      celebrateNow,
    }),
    [reduce, toggles, toggle, activeSite, pendingScanId, filterSev, filterStatus, ob, setOb, modal, newAppUrl, toasts, toast, celebrate, celebrateNow],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
