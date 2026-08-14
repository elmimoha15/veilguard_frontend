/**
 * Hardcoded product tokens for the Remotion demo composition, so scenes render
 * identically regardless of any CSS-var scope. Mirrors the app's real palette
 * (SEV_COLOR / SEV_TINT in components/app/data.ts, GRADE_TINT in lib/hooks.ts)
 * with the Sendr-style rose accent.
 */
export const T = {
  canvas: '#F4F4F3',
  card: '#FFFFFF',
  ink: '#0A0A0A',
  muted: '#6E6E6A',
  faint: '#A4A39E',
  hairline: '#EFEEEA',
  border: '#E8E7E3',
  bgSoft: '#F7F7F6',
  accent: '#EC4E6B',
  sidebar: '#0E0E0D',
  sev: { critical: '#E5484D', warning: '#E0932F', passed: '#1F9D57' },
  sevTint: {
    critical: { bg: '#FBEAEA', fg: '#C23B3F' },
    warning: { bg: '#FBF1E1', fg: '#9A6412' },
    passed: { bg: '#EAF6EF', fg: '#157A43' },
  },
  grade: {
    A: { bg: '#EAF6EF', fg: '#1F9D57' },
    B: { bg: '#EAF6EF', fg: '#1F9D57' },
    C: { bg: '#FBF1E1', fg: '#E0932F' },
    D: { bg: '#FBEAEA', fg: '#E5484D' },
    F: { bg: '#FBEAEA', fg: '#E5484D' },
  } as Record<string, { bg: string; fg: string }>,
  font: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
  mono: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
} as const;

export const FPS = 30;
export const DEMO_W = 1280;
export const DEMO_H = 800;
// scene lengths (frames)
export const SCENES = {
  scan: 110,
  scanning: 90,
  results: 150,
  fix: 150,
  monitor: 120,
};
export const OVERLAP = 12;
export const TOTAL =
  SCENES.scan + SCENES.scanning + SCENES.results + SCENES.fix + SCENES.monitor;
