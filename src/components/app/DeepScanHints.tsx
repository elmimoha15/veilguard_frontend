'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { ScanDoc } from '@/lib/scans';
import { BrandLogo } from '@/components/ui/BrandLogo';
import ActionButton from '@/components/ui/ActionButton';

/**
 * Stack-aware nudges for a deep (repo) scan:
 *  - repo uses Supabase but it isn't connected → prompt to connect (RLS lives on
 *    Supabase's servers, not the repo, so the code scan can't see it).
 *  - Supabase now connected + this scan was repo-only → offer a re-scan that also
 *    reads the database.
 *  - repo uses Firebase but no rules file is committed → info note (rules may live
 *    only in the Firebase console; we can only scan committed rules).
 */
export default function DeepScanHints({ scan }: { scan: ScanDoc | null }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!scan || scan.type !== 'deep' || !scan.stack) return null;
  const stack = scan.stack;
  const repo = scan.sources?.githubRepo;
  const supabaseConnected = !!(profile?.connections as Record<string, unknown> | undefined)?.supabase;
  const scannedWithDb = !!scan.sources?.supabase;

  const rescanWithDb = async () => {
    if (!repo || busy) return;
    setBusy(true);
    const r = await api.createDeepScan({ githubRepo: repo, supabase: true });
    if (r.ok && r.data.scanId) router.push(`/scanning?scanId=${r.data.scanId}`);
    else setBusy(false);
  };

  const showConnect = stack.supabase && !supabaseConnected;
  const showRescan = stack.supabase && supabaseConnected && !scannedWithDb && !!repo;
  const showFirebase = stack.firebase && !stack.firebaseRulesInRepo;
  if (!showConnect && !showRescan && !showFirebase) return null;

  return (
    <div className="flex flex-col divide-y divide-border border-y border-border mt-5">
      {showConnect && (
        <div className="py-4 flex items-start gap-3">
          <BrandLogo name="supabase" size={20} icon className="shrink-0 mt-[2px]" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15.5px]">This repo uses Supabase, scan your database too</div>
            <div className="text-[14px] text-muted mt-[2px]">Your Row-Level Security rules live on Supabase’s servers, not in the code. Connect Supabase (read-only) to catch the “anyone can read everyone’s data” bugs the code scan can’t see.</div>
          </div>
          <ActionButton onClick={() => router.push('/settings')} className="shrink-0">Connect Supabase</ActionButton>
        </div>
      )}

      {showRescan && (
        <div className="py-4 flex items-start gap-3">
          <BrandLogo name="supabase" size={20} icon className="shrink-0 mt-[2px]" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15.5px]">Supabase is connected, include your database</div>
            <div className="text-[14px] text-muted mt-[2px]">Re-run this scan to also read your Supabase schema + RLS policies for one combined grade.</div>
          </div>
          <ActionButton onClick={rescanWithDb} disabled={busy} className="shrink-0">{busy ? 'Starting…' : 'Re-scan with database'}</ActionButton>
        </div>
      )}

      {showFirebase && (
        <div className="py-4 flex items-start gap-3">
          <span className="shrink-0 mt-[1px] text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" strokeLinecap="round" />
              <circle cx="12" cy="7.6" r="0.7" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className="flex-1 min-w-0 text-[14px] text-muted">
            <span className="font-bold text-ink">This app uses Firebase, but no security-rules file is committed.</span> Your <code className="font-mono">firestore.rules</code>/<code className="font-mono">storage.rules</code> may live only in the Firebase console, we can only check rules that are in the repo.
          </div>
        </div>
      )}
    </div>
  );
}
