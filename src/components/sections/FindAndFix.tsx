import SectionHead from '@/components/sections/SectionHead';
import FixShot from '@/components/sections/shots/FixShot';

const FEATURES: { title: string; desc: string; icon: React.ReactNode }[] = [
  { title: 'Plain-English explanations', desc: 'What the issue is and why it matters, with no jargon.', icon: <path d="M4 5h16M4 12h16M4 19h9" /> },
  { title: 'The exact fix', desc: 'Copy-paste code or a ready-made prompt for your AI tool.', icon: <path d="M9 7H5v12h14v-4M14 4h6v6M20 4l-9 9" /> },
  { title: 'Prioritized for you', desc: 'We tell you which issue actually gets you hacked first.', icon: <path d="M12 3l2.4 5.4L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.6L12 3z" /> },
];

/**
 * The difference: other scanners hand you a scary list; we hand you the exact fix.
 * The panel is a real finding-detail product shot (grade pills + the actual code fix).
 */
export default function FindAndFix() {
  return (
    <section id="fix" className="el-x el-sec el-divide scroll-mt-20">
      <SectionHead
        eyebrow="The difference"
        title={<>Other scanners hand you a scary list. We hand you the <span style={{ color: '#157A43' }}>fix.</span></>}
        description="Every issue comes with a plain-English explanation and the exact repair, so you know which one actually matters and exactly what to do about it."
      />

      <div className="mt-10 el-panel p-3 sm:p-5 max-w-[760px]">
        <FixShot />
      </div>

      <div className="mt-[clamp(32px,4vw,56px)] grid gap-x-10 gap-y-8 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t border-hairline pt-5">
            <span className="text-ink" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
            </span>
            <div className="mt-3 font-semibold text-[15px] text-ink">{f.title}</div>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
