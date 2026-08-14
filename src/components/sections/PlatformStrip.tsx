import { BRANDS } from '@/components/ui/BrandIcons';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function PlatformStrip() {
  return (
    <section className="px-6 py-[clamp(32px,5vw,56px)]">
      <div className="mx-auto max-w-[1160px] text-center">
        <p className="text-[13px] text-tertiary">Built for the tools you ship with</p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
          {BRANDS.map(({ key, name }) => (
            <li
              key={key}
              className="group flex items-center gap-2.5"
            >
              <span>
                <BrandLogo name={key} size={24} />
              </span>
              <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
