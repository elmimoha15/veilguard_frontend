/* eslint-disable @next/next/no-img-element */

/**
 * "Works with your stack" logo wall: real brand logos rendered uniformly white on
 * a black panel (brightness-0 + invert), grouped into the three surfaces we scan —
 * AI coding agents, vibecoding tools and backends — split by light hairlines.
 */
const GROUPS: { label: string; logos: { src: string; alt: string }[] }[] = [
  {
    label: 'AI coding agents',
    logos: [
      { src: '/svgs/cursor.svg', alt: 'Cursor' },
      { src: '/svgs/windsurf.svg', alt: 'Windsurf' },
      { src: '/svgs/claude.svg', alt: 'Claude' },
      { src: '/svgs/copilot.svg', alt: 'GitHub Copilot' },
    ],
  },
  {
    label: 'Vibecoding tools',
    logos: [
      { src: '/svgs/lovable.svg', alt: 'Lovable' },
      { src: '/svgs/bolt.svg', alt: 'Bolt' },
      { src: '/svgs/replit.svg', alt: 'Replit' },
      { src: '/svgs/v0.svg', alt: 'v0' },
    ],
  },
  {
    label: 'Backends',
    logos: [
      { src: '/svgs/supabase.svg', alt: 'Supabase' },
      { src: '/svgs/firebase.svg', alt: 'Firebase' },
    ],
  },
];

export default function LogoWall() {
  return (
    <section className="an-x pt-2 pb-12 relative z-10">
      <div className="an-max border-t border-[#E8E7E3] pt-12">
        <p className="text-center text-[16px] font-medium tracking-[0.01em] text-muted mb-11">
          Works with the tools you already build with
        </p>

        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E7E3]">
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col items-center px-6 py-8 sm:py-1 sm:px-10 first:sm:pl-0 last:sm:pr-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-faint mb-7">{g.label}</div>
              <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-7 [&_img]:brightness-0 [&_img]:opacity-60">
                {g.logos.map((l) => (
                  <img key={l.src} src={l.src} alt={l.alt} draggable={false} className="h-[26px] w-auto select-none" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
