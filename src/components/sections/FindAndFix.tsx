import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import CodePanel from '@/components/ui/CodePanel';
import CopyFixButton from '@/components/ui/CopyFixButton';
import { FIX_AFTER, FIX_BEFORE, FIX_CLIPBOARD } from '@/content/landing';

// Render SQL, dimming the trailing `-- comment` on each line.
function Sql({ code, commentClass }: { code: string; commentClass: string }) {
  return (
    <>
      {code.split('\n').map((line, i) => {
        const idx = line.indexOf('--');
        return (
          <span key={i} className="block">
            {idx === -1 ? (
              line || ' '
            ) : (
              <>
                {line.slice(0, idx)}
                <span className={commentClass}>{line.slice(idx)}</span>
              </>
            )}
          </span>
        );
      })}
    </>
  );
}

export default function FindAndFix() {
  return (
    <section id="fix" className="relative bg-ink text-white scroll-mt-20 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-[800px] h-[360px]"
        style={{ background: 'radial-gradient(800px 360px at 12% 100%, rgba(243,197,0,0.14), transparent 60%)' }}
      />
      <div className="relative mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)]">
        <FadeIn className="max-w-[780px]">
          <Eyebrow className="text-yellow">{'// THE DIFFERENCE'}</Eyebrow>
          <h2 className="mt-4 text-white">
            Other scanners hand you a scary list. We hand you the{' '}
            <span className="text-green-light">fix.</span>
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <FadeIn>
            <CodePanel tone="bad" label="BEFORE — GRADE F" filename="orders.sql">
              <Sql code={FIX_BEFORE} commentClass="text-[#FF6B5E]/80" />
            </CodePanel>
          </FadeIn>
          <FadeIn delay={0.1}>
            <CodePanel
              tone="good"
              label="AFTER — GRADE A"
              action={<CopyFixButton text={FIX_CLIPBOARD} className="h-8 px-3 text-[12px]" />}
            >
              <Sql code={FIX_AFTER} commentClass="text-[#7fc39b]" />
            </CodePanel>
          </FadeIn>
        </div>

        <p className="mt-6 text-[15px] text-white/60 max-w-[680px]">
          Paste it into Supabase and you’re done. Not technical? Copy the prompt and let your AI apply it.
        </p>
      </div>
    </section>
  );
}
