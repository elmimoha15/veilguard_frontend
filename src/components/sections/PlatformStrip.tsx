import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';

const LOGOS: { name: string; logo: BrandLogoName }[] = [
  { name: 'Lovable', logo: 'lovable' },
  { name: 'Supabase', logo: 'supabase' },
  { name: 'Cursor', logo: 'cursor' },
  { name: 'Bolt', logo: 'bolt' },
  { name: 'Replit', logo: 'replit' },
  { name: 'v0', logo: 'v0' },
  { name: 'Firebase', logo: 'firebase' },
  { name: 'Stripe', logo: 'stripe' },
];

/** Logo loop: a slow, edge-faded marquee of the tools customers build with. */
export default function PlatformStrip() {
  const row = [...LOGOS, ...LOGOS]; // doubled so the -50% loop is seamless
  return (
    <section className="el-divide pt-[34px] pb-[40px]">
      <div className="el-x pb-[22px]">
        <span className="text-[14.5px]" style={{ color: '#8C8C84' }}>Built by founders shipping on the tools you already use</span>
      </div>
      <div className="vg-loop" aria-label="Tools our customers build with">
        <div className="vg-loop__track">
          {row.map((b, i) => (
            <span key={i} className="flex items-center gap-[10px] px-[44px] shrink-0 opacity-70">
              <BrandLogo name={b.logo} size={24} icon />
              <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{b.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
