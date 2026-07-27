'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { ScanDoc } from '@/lib/scans';
import { SupabaseIcon } from '@/components/ui/BrandIcons';

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
    <div className="flex flex-col gap-3 mt-5">
      {showConnect && (
        <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: 'rgba(62,207,142,.09)', border: '1px solid rgba(62,207,142,.4)' }}>
          <span className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#1E1D1B' }}><SupabaseIcon size={18} /></span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14.5px]">This repo uses Supabase — scan your database too</div>
            <div className="text-[13px] text-muted mt-[2px]">Your Row-Level Security rules live on Supabase’s servers, not in the code. Connect Supabase (read-only) to catch the “anyone can read everyone’s data” bugs the code scan can’t see.</div>
          </div>
          <button onClick={() => router.push('/settings')} className="vg-press shrink-0 bg-ink text-white rounded-[9px] px-[14px] py-2 text-[13px] font-bold">Connect Supabase →</button>
        </div>
      )}

      {showRescan && (
        <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: 'rgba(62,207,142,.09)', border: '1px solid rgba(62,207,142,.4)' }}>
          <span className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#1E1D1B' }}><SupabaseIcon size={18} /></span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14.5px]">Supabase is connected — include your database</div>
            <div className="text-[13px] text-muted mt-[2px]">Re-run this scan to also read your Supabase schema + RLS policies for one combined grade.</div>
          </div>
          <button onClick={rescanWithDb} disabled={busy} className="vg-press shrink-0 bg-ink text-white rounded-[9px] px-[14px] py-2 text-[13px] font-bold disabled:opacity-60">{busy ? 'Starting…' : 'Re-scan with database →'}</button>
        </div>
      )}

      {showFirebase && (
        <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: '#FFF7D6', border: '1px solid #E7CE63' }}>
          <span className="shrink-0 text-[18px] mt-[2px]">ℹ️</span>
          <div className="flex-1 min-w-0 text-[13px]" style={{ color: '#7a5b00' }}>
            <span className="font-bold">This app uses Firebase, but no security-rules file is committed.</span> Your <code className="font-mono">firestore.rules</code>/<code className="font-mono">storage.rules</code> may live only in the Firebase console — we can only check rules that are in the repo.
          </div>
        </div>
      )}
    </div>
  );
}
