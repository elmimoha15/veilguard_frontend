'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { subscribeScan, type ScanDoc } from '@/lib/scans';
import { scanLabel, repoDisplay } from '@/lib/hooks';
import { Card, SectionLabel } from './primitives';
import { GradeRing } from './ui';

/**
 * Inline scan-progress card for the Overview page. Watches the pending scan and
 * renders under the page heading while it's queued/running, then UNMOUNTS the
 * instant it finishes (done or error) — the persistent floating ScanWatcher chip
 * still carries the "view results" affordance across pages. Matches the app's
 * card language (Card + SectionLabel + the same GradeRing used on the scan page).
 */
export default function OverviewScanCard() {
  const router = useRouter();
  const { pendingScanId } = useApp();
  const [scan, setScan] = useState<ScanDoc | null>(null);

  useEffect(() => {
    setScan(null);
    if (!pendingScanId) return;
    return subscribeScan(pendingScanId, setScan);
  }, [pendingScanId]);

  // Only while actively scanning — vanish the moment it's done/errored/cleared.
  if (!pendingScanId || !scan || (scan.status !== 'queued' && scan.status !== 'running')) return null;

  const p = scan.progress;
  const pct = p && p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  const phase = p?.phase || (scan.status === 'queued' ? 'Queued…' : 'Starting…');
  const kind = scan.type === 'deep' ? 'Deep scan' : scan.type === 'upload' ? 'Upload scan' : 'URL scan';

  return (
    <Card className="p-5 mb-4">
      <div className="flex items-center gap-4">
        <GradeRing size={48} pct={pct || 6} color="#F3C500" strokeWidth={7} animate>
          <span className="tnum text-[12px] font-semibold leading-none">{pct}<span className="text-[8px]">%</span></span>
        </GradeRing>
        <div className="flex-1 min-w-0">
          <SectionLabel>Scanning</SectionLabel>
          <div className="text-[15px] font-medium mt-[3px] truncate">{repoDisplay(scanLabel(scan))}</div>
          <div className="text-[13px] text-muted mt-[1px] truncate">{kind} · {phase}</div>
        </div>
        <button
          onClick={() => router.push(`/scanning?scanId=${scan.id}`)}
          className="vg-press shrink-0 text-[13px] font-medium text-muted hover:text-ink transition-colors cursor-pointer"
        >
          View
        </button>
      </div>
    </Card>
  );
}
