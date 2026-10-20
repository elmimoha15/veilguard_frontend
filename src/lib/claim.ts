import { api } from '@/lib/api';
import { claimSettled, clearPendingScan, getPendingScan } from '@/lib/onboardingFlow';

/**
 * Claim an anonymous scan onto the signed-in account. Idempotent server-side
 * (claiming your own scan again is a 200), so every handoff point can call it
 * without creating duplicates. Drops the pending marker only once settled.
 */
export async function claimScanForUser(scanId: string): Promise<{ ok: boolean; status: number; error?: string }> {
  const r = await api.claimScan(scanId);
  if (claimSettled(r.status) && getPendingScan() === scanId) clearPendingScan();
  return { ok: r.ok, status: r.status, error: r.data?.error };
}

/** Claim whatever anonymous scan this browser was about to sign up for, if any. */
export async function claimPendingScan(): Promise<void> {
  const id = getPendingScan();
  if (id) await claimScanForUser(id).catch(() => {});
}
