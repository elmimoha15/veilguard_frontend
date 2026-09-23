'use client';

import { useAuth } from '@/lib/auth';

/** Backend UNLIMITED sentinel is 1,000,000; anything this large means "no cap". */
const UNLIMITED_MIN = 100_000;

/**
 * Compact "scans this month" chip for the shell top bar. Uses the server-computed
 * values on /me (profile.usage.scansThisMonth counts only DONE scans, so failed or
 * in-progress scans never count). Guard shows a tiny bar + "used/limit" (amber near
 * the cap, red at it); Free is unlimited, so it shows just the count. Renders
 * nothing until usage has loaded.
 */
export default function ScanUsage() {
  const { profile } = useAuth();
  const usage = profile?.usage;
  const limit = profile?.caps?.maxScansPerMonth;
  if (!usage || limit == null) return null;

  const used = usage.scansThisMonth ?? 0;
  const unlimited = limit >= UNLIMITED_MIN;

  if (unlimited) {
    return (
      <span className="hidden min-[560px]:inline text-[12.5px]" style={{ color: '#737373' }} title="Scans this month">
        <span className="tnum font-medium text-ink">{used}</span> scans this month
      </span>
    );
  }

  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const atCap = used >= limit;
  const color = atCap ? '#DC2626' : pct >= 80 ? '#D97706' : '#16A34A';

  return (
    <span className="hidden min-[560px]:flex items-center gap-[8px]" title="Scans this month (resets as older scans roll off the 30 day window)">
      <span className="w-[46px] h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--color-track)' }}>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="text-[12.5px] tnum font-medium" style={{ color: atCap ? '#DC2626' : '#525252' }}>{used}/{limit}</span>
      <span className="text-[12.5px]" style={{ color: '#A3A3A3' }}>scans this month</span>
    </span>
  );
}
