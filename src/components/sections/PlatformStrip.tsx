import { BRANDS } from '@/components/ui/BrandIcons';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function PlatformStrip() {
  return (
    <section className="px-6 py-[clamp(36px,5vw,56px)]">
      <div className="mx-auto max-w-[1160px] text-center">
        <p className="font-mono text-[12px] tracking-[0.16em] uppercase text-faint">
          Deep checks for the tools you build with
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {BRANDS.map(({ key, name }) => {
            return (
              <li key={key} className="flex items-center gap-2.5">
                <BrandLogo name={key} size={26} />
                <span className="text-[18px] font-bold tracking-[-0.02em] text-[#3b3a37]">
                  {name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
