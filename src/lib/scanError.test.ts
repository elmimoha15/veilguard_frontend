import { describe, it, expect } from 'vitest';
import { startFailure } from './scanError';

describe('startFailure', () => {
  it('turns the per-IP rate limit into friendly copy (not the raw "rate limited")', () => {
    const f = startFailure(429, { error: 'rate limited' });
    expect(f.message).not.toBe('rate limited');
    expect(f.message).toMatch(/wait a minute/i);
    expect(f.message).not.toMatch(/[—–]/);
  });
  it('keeps the Guard monthly cap message (also a 429, but coded)', () => {
    const f = startFailure(429, { code: 'E_SCAN_LIMIT', error: 'You’ve used all 30 scans.' });
    expect(f.quota).toBe(true);
    expect(f.message).toBe('You’ve used all 30 scans.');
  });
});
