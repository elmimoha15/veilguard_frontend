import { api } from '@/lib/api';
import { startFailure } from '@/lib/scanError';

/**
 * Start a URL scan. Anonymous when signed out (the backend's per-IP abuse limits
 * apply either way), owned when signed in. Returns the scan id, or friendly copy
 * for why it couldn't start.
 */
export async function startUrlScan(url: string): Promise<{ ok: true; scanId: string } | { ok: false; message: string }> {
  try {
    const r = await api.createScan(url);
    if (r.ok && r.data.scanId) return { ok: true, scanId: r.data.scanId };
    return { ok: false, message: startFailure(r.status, r.data).message };
  } catch {
    return { ok: false, message: 'Couldn’t start the scan. Please try again.' };
  }
}
