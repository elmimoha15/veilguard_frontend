/**
 * The Veilguard mark: a black angular "V" on a brand-yellow (#FFE24D) squircle.
 * Inline SVG (exact handoff path) so the sidebar mark scales crisply and uses
 * the brand yellow directly, one of the only three places yellow appears.
 */
export function VeilMark({ size = 21 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.24), background: '#FFE24D' }}
      aria-hidden
    >
      <svg width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} viewBox="0 0 100 100" fill="#0A0A0A">
        <path d="M20 20 H38 V58 H20 Z M46 20 H72 V40 L52 82 H40 Z M33 58 H47 L40 72 Z" />
      </svg>
    </span>
  );
}
