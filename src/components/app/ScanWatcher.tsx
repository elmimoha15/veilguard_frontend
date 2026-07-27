'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './state';
import { subscribeScan } from '@/lib/scans';

/**
 * Watches the scan the user most recently started (`pendingScanId`) and reveals
 * its result page the moment it finishes — even if they left the scanning screen
 * to browse elsewhere ("Run in background"). Mounted app-wide at the (app) layout
 * so it survives navigation.
 *
 * On the scanning screen itself we defer to ScanningScreen's own redirect (which
 * also handles the onboarding/anonymous → /results branch) and just clear, so the
 * two never double-navigate. Renders nothing.
 */
export default function ScanWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { pendingScanId, setPendingScanId, toast } = useApp();

  useEffect(() => {
    if (!pendingScanId) return;
    return subscribeScan(pendingScanId, (scan) => {
      if (!scan) return;
      if (scan.status === 'done') {
        if (pathname !== '/scanning' && pathname !== '/scan') {
          router.push(`/scan?scan=${pendingScanId}`);
        }
        setPendingScanId(null);
      } else if (scan.status === 'error') {
        if (pathname !== '/scanning') toast('A scan failed — open it to see why.', '#E5352B');
        setPendingScanId(null);
      }
    });
  }, [pendingScanId, pathname, router, setPendingScanId, toast]);

  return null;
}
