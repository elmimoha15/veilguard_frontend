import ScanInput from '@/components/sections/ScanInput';

/** Hero: centered headline + scan box on the clean white page. */
export default function Hero() {
  return (
    <section id="top" className="relative w-screen ml-[calc(50%-50vw)] pt-[clamp(100px,12vw,150px)]">
      <div className="an-max relative z-10 flex flex-col items-center text-center px-5">
        <h1 className="max-w-[16ch] text-[clamp(38px,6vw,64px)] font-semibold tracking-[-0.03em] leading-[1.03] text-ink text-balance">
          Find out if your app is safe to charge money.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[clamp(16px,1.7vw,19px)] leading-[1.5] text-muted text-pretty">
          Paste your app link and get a plain-English A to F security grade in 60 seconds, plus the exact fix for every issue.
        </p>

        <ScanInput />

        <p className="mt-5 text-[14px] text-muted">Join 200+ founders shipping safer apps with Veilguard</p>
      </div>

      <div className="pb-[clamp(48px,6vw,80px)]" />
    </section>
  );
}
