import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests for pure logic (no DOM, no Firebase). Run with `npm test`.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
