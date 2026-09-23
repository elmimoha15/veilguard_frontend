'use client';

import { useAuth } from '@/lib/auth';
import { ProgressBar } from './primitives';

/** Backend UNLIMITED sentinel is 1,000,000; anything this large means "no cap". */
const UNLIMITED_MIN = 100_000;

/**
 * "Scans this month" usage counter, from the server-computed values on /me
 * (profile.usage.scansThisMonth + profile.caps.maxScansPerMonth). Guard shows a
 * progress bar toward the monthly cap (amber near it, red at it); Free is
 * unlimited, so it shows the count with an "Unlimited" tag and no bar. Renders
 * nothing until the profile (and its usage) has loaded.
 */
export default function ScanUsage({ className }: { className?: string }) {
  const { profile } = useAuth();
  const usage = profile?.usage;
  const limit = profile?.caps?.maxScansPerMonth;
  if (!usage || limit == null) return null;

  const used = usage.scansThisMonth ?? 0;
  const unlimited = limit >= UNLIMITED_MIN;

  if (unlimited) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-medium">Scans this month</span>
          <span className="inline-flex items-center gap-[7px]">
            <span className="tnum text-[13.5px] font-medium">{used}</span>
            <span className="text-[11px] font-medium px-[8px] py-[2px] rounded-full" style={{ background: '#F0FDF4', color: '#15803D' }}>Unlimited</span>
          </span>
        </div>
      </div>
    );
  }

  const ratio = limit > 0 ? used / limit : 0;
  const atCap = used >= limit;
  const color = atCap ? '#DC2626' : ratio >= 0.8 ? '#D97706' : '#16A34A';

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-[8px]">
        <span className="text-[13.5px] font-medium">Scans this month</span>
        <span className="tnum text-[13.5px] font-medium" style={{ color: atCap ? '#DC2626' : undefined }}>{used} of {limit}</span>
      </div>
      <ProgressBar value={Math.min(used, limit)} total={limit} color={color} />
      {atCap && (
        <div className="text-[12.5px] mt-[8px]" style={{ color: '#737373' }}>
          You&rsquo;ve used all your scans this month. It resets as your older scans roll off the 30 day window.
        </div>
      )}
    </div>
  );
}
