/**
 * Recognizable inline-SVG marks for the AI builders and backends we scan.
 * Inline (not <img>) so they inherit crisp rendering, need no network request,
 * and work under the site's static export + strict asset model. Colors are each
 * tool's signature brand color; shapes are simplified but evocative.
 *
 * These are used decoratively to signal "works with" — the hero orbit, the
 * platform strip, the scanners grid, and each tool landing page.
 */

type IconProps = { size?: number; className?: string; title?: string };

function Svg({
  size = 24,
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// Lovable — heart mark, warm coral.
export function LovableIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Lovable'}>
      <path
        d="M12 20.5C6.8 17.1 3.5 13.9 3.5 10.2 3.5 7.4 5.6 5.5 8 5.5c1.7 0 3.1.9 4 2.3.9-1.4 2.3-2.3 4-2.3 2.4 0 4.5 1.9 4.5 4.7 0 3.7-3.3 6.9-8.5 10.3z"
        fill="#FF6A8B"
      />
    </Svg>
  );
}

// Bolt.new — lightning inside a rounded square (favicon style).
export function BoltIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Bolt'}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#0B0B0F" />
      <path d="M13 5.5 7.5 13H11l-1 5.5L16 10.5h-3.5z" fill="#FFFFFF" />
    </Svg>
  );
}

// Supabase — bolt mark, signature green.
export function SupabaseIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Supabase'}>
      <path
        d="M13.4 1.8c.6-.75 1.8-.18 1.6.77l-1.3 6.3h5.9c1 0 1.55 1.16.9 1.94l-8.9 10.7c-.6.72-1.75.14-1.55-.78l1.3-6.3H5.4c-1 0-1.55-1.16-.9-1.94z"
        fill="#3ECF8E"
      />
    </Svg>
  );
}

// Firebase — folded flame, amber + gold.
export function FirebaseIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Firebase'}>
      <path d="M4.8 18.2 8 3.9c.2-.9 1.4-1 1.8-.2l2.1 4-1.7 3.1-2.9 8z" fill="#FF9100" />
      <path d="m4.8 18.2 6.5-11.5 1.9 3.3c.5.85 1.7.85 2.2 0l.9-1.5 2.9 9.7z" fill="#FFC24A" />
      <path d="M4.8 18.2 12 22l7.2-3.8-2.9-9.7z" fill="#FFA000" />
    </Svg>
  );
}

// Replit — three offset rounded blocks, signature orange.
export function ReplitIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Replit'}>
      <rect x="3" y="3" width="8.5" height="8.5" rx="2" fill="#F26207" />
      <rect x="12.5" y="3" width="8.5" height="8.5" rx="2" fill="#F26207" />
      <rect x="3" y="12.5" width="8.5" height="8.5" rx="2" fill="#F26207" />
    </Svg>
  );
}

// v0 (by Vercel) — the Vercel triangle.
export function V0Icon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'v0'}>
      <path d="M12 3 22 20.5H2z" fill="#0B0B0F" />
    </Svg>
  );
}

// Cursor — classic pointer, ink.
export function CursorIcon(p: IconProps) {
  return (
    <Svg {...p} title={p.title ?? 'Cursor'}>
      <path
        d="M5 2.5 5 19l4.4-4.2 2.6 5.7 2.9-1.3-2.6-5.6H18z"
        fill="#0B0B0F"
        stroke="#0B0B0F"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export type BrandKey =
  | 'lovable'
  | 'bolt'
  | 'supabase'
  | 'firebase'
  | 'replit'
  | 'v0'
  | 'cursor';

export const BRAND_ICON: Record<BrandKey, (p: IconProps) => React.JSX.Element> = {
  lovable: LovableIcon,
  bolt: BoltIcon,
  supabase: SupabaseIcon,
  firebase: FirebaseIcon,
  replit: ReplitIcon,
  v0: V0Icon,
  cursor: CursorIcon,
};

/** Display order used by the hero, platform strip, and scanners grid. */
export const BRANDS: { key: BrandKey; name: string }[] = [
  { key: 'lovable', name: 'Lovable' },
  { key: 'bolt', name: 'Bolt' },
  { key: 'supabase', name: 'Supabase' },
  { key: 'firebase', name: 'Firebase' },
  { key: 'replit', name: 'Replit' },
  { key: 'v0', name: 'v0' },
  { key: 'cursor', name: 'Cursor' },
];
