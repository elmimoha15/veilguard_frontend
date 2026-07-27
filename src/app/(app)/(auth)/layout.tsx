import Logo from '@/components/ui/Logo';

/**
 * Split-screen auth shell: a dark brand panel (hidden < 900px) beside the form
 * area on cream. The form itself (sign-up / log-in / reset) is the child page.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex vg-fade">
      {/* brand panel */}
      <div className="relative flex-[1_1_46%] bg-ink overflow-hidden hidden min-[900px]:block">
        <div aria-hidden className="absolute inset-0 bg-dots-dark" />
        <div
          aria-hidden
          className="absolute -top-[10%] -right-[10%] w-[520px] h-[520px] rounded-full glow-yellow"
        />
        <div className="relative h-full flex flex-col justify-between p-11">
          <Logo size={38} wordmarkClassName="text-white text-[21px]" />
          <div>
            <div className="flex gap-2 mb-[22px]">
              <GradeChip letter="A" bg="#1FB86B" fg="#0c1a12" />
              <GradeChip letter="C" bg="#F2851F" fg="#241304" />
              <GradeChip letter="F" bg="#E5352B" fg="#fff" />
            </div>
            <h2 className="font-extrabold text-[40px] leading-[1.05] tracking-[-0.03em] text-white m-0 max-w-[12ch]">
              Join founders who sleep better at night.
            </h2>
            <p className="text-[16px] leading-[1.55] text-white/60 mt-4 max-w-[38ch]">
              A plain-English security grade for the app your AI built — plus the exact fixes. No
              jargon. No judgment.
            </p>
          </div>
          <div className="font-mono text-[11.5px] tracking-[0.06em] text-white/40">
            READ-ONLY · YOUR CODE STAYS YOURS
          </div>
        </div>
      </div>
      {/* form area */}
      <div className="flex-[1_1_54%] flex items-center justify-center px-6 py-8 bg-bg-soft">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}

function GradeChip({ letter, bg, fg }: { letter: string; bg: string; fg: string }) {
  return (
    <span
      className="w-[52px] h-[52px] rounded-xl flex items-center justify-center font-extrabold text-[26px]"
      style={{ background: bg, color: fg }}
    >
      {letter}
    </span>
  );
}
