import { BRAND_ICON, type BrandKey } from './BrandIcons';

/**
 * Renders a company's REAL logo: an official asset from `public/svgs/` when we
 * have one, otherwise the existing hand-drawn `BrandIcons` mark (Supabase /
 * Firebase / Lovable). No bordered box — the logo sits directly on whatever's
 * behind it. The provided SVGs are monochrome black, so pass `invert` when the
 * logo sits on a dark tile (renders it white).
 */
export type BrandLogoName = BrandKey | 'stripe' | 'claude' | 'windsurf' | 'copilot' | 'neon' | 'mongodb';

/** Brands with a real asset in public/svgs (rest fall back to BrandIcons). */
const ASSET: Partial<Record<BrandLogoName, string>> = {
  cursor: '/svgs/cursor.svg',
  github: '/svgs/github.svg',
  replit: '/svgs/replit.svg',
  v0: '/svgs/v0.svg',
  stripe: '/svgs/stripe.svg',
  bolt: '/svgs/bolt.svg',
  claude: '/svgs/claude.svg',
  windsurf: '/svgs/windsurf.svg',
  copilot: '/svgs/copilot.svg',
  lovable: '/svgs/lovable.svg',
  supabase: '/svgs/supabase.svg',
  firebase: '/svgs/firebase.svg',
  neon: '/svgs/neon.png',
  mongodb: '/svgs/mongodb.svg',
};

/** Square icon marks (no wordmark) — for onboarding + all marketing (only the
 *  under-hero logo wall uses the full wordmark logos). */
const ICON_ASSET: Partial<Record<BrandLogoName, string>> = {
  cursor: '/svgs/cursor-icon.svg',
  bolt: '/svgs/bolt-icon.svg',
  supabase: '/svgs/supabase-icon.svg',
  replit: '/svgs/replit-icon.svg',
  lovable: '/svgs/lovable-icon.svg',
  mongodb: '/svgs/mongodb-icon.svg',
  claude: '/svgs/claude-icon.svg',
  windsurf: '/svgs/windsurf-icon.svg',
  copilot: '/svgs/copilot-icon.svg',
  v0: '/svgs/v0.svg', // already a square mark
};

export function BrandLogo({
  name,
  size = 24,
  className,
  title,
  invert,
  icon,
}: {
  name: BrandLogoName;
  size?: number;
  className?: string;
  title?: string;
  invert?: boolean;
  /** Prefer the square icon mark (no wordmark) when one exists. */
  icon?: boolean;
}) {
  const iconSvg = icon ? ICON_ASSET[name] : undefined;
  const HandMark = BRAND_ICON[name as BrandKey];
  // When a square icon is requested but there's no dedicated icon SVG, prefer the
  // hand-drawn square mark (e.g. firebase) over squishing the wide wordmark asset.
  if (icon && !iconSvg && HandMark) {
    return <HandMark size={size} className={className} title={title} />;
  }
  const asset = iconSvg || ASSET[name];
  if (asset) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset}
        alt={title ?? name}
        width={size}
        height={size}
        draggable={false}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain', ...(invert ? { filter: 'invert(1)' } : {}) }}
      />
    );
  }
  return HandMark ? <HandMark size={size} className={className} title={title} /> : null;
}
