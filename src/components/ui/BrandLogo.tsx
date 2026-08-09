import { BRAND_ICON, type BrandKey } from './BrandIcons';

/**
 * Renders a company's REAL logo: an official asset from `public/svgs/` when we
 * have one, otherwise the existing hand-drawn `BrandIcons` mark (Supabase /
 * Firebase / Lovable). No bordered box — the logo sits directly on whatever's
 * behind it. The provided SVGs are monochrome black, so pass `invert` when the
 * logo sits on a dark tile (renders it white).
 */
export type BrandLogoName = BrandKey | 'stripe';

/** Brands with a real asset in public/svgs (rest fall back to BrandIcons). */
const ASSET: Partial<Record<BrandLogoName, string>> = {
  cursor: '/svgs/cursor.svg',
  github: '/svgs/github.svg',
  replit: '/svgs/replit.svg',
  v0: '/svgs/v0.svg',
  stripe: '/svgs/stripe.svg',
  bolt: '/svgs/bolt.png',
};

export function BrandLogo({
  name,
  size = 24,
  className,
  title,
  invert,
}: {
  name: BrandLogoName;
  size?: number;
  className?: string;
  title?: string;
  invert?: boolean;
}) {
  const asset = ASSET[name];
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
  // No real asset yet (lovable / supabase / firebase) → existing colored mark.
  const Icon = BRAND_ICON[name as BrandKey];
  return Icon ? <Icon size={size} className={className} title={title} /> : null;
}
