import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';
import Pill from '@/components/ui/Pill';
import { LogoMark } from '@/components/ui/Logo';
import { MONITOR_ALERT } from '@/content/landing';

export default function Monitor() {
  const a = MONITOR_ALERT;
  return (
    <section className="bg-bg-soft">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(60px,8vw,96px)] grid gap-12 lg:grid-cols-2 lg:items-center">
        <FadeIn>
          <Eyebrow className="text-yellow-dark">{'// ALWAYS ON'}</Eyebrow>
          <h2 className="mt-4">You’ll keep vibe-coding. We’ll keep watching.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-muted max-w-[46ch]">
            Every new feature can open a new hole. Veilguard re-scans your app on every deploy and
            emails you the moment something breaks — so a shipping streak never turns into a breach.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} direction="left">
          {/* Sample alert card */}
          <div className="rounded-[18px] bg-ink text-white p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <LogoMark size={30} />
              <span className="font-bold text-[15px]">Veilguard</span>
              <span className="ml-auto font-mono text-[11px] text-white/40">just now</span>
            </div>
            <div className="mt-4">
              <Pill className="bg-orange/[0.16] text-orange">New warning · {a.deploy}</Pill>
            </div>
            <p className="mt-4 text-[15px] font-semibold">{a.title} on {a.app}</p>
            <p className="mt-2 text-[14px] leading-[1.5] text-white/70">{a.body}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="font-mono text-[12px] text-white/50">Grade</span>
              <span className="inline-flex items-center gap-2 font-mono text-[13px] font-bold">
                <span className="text-green">{a.gradeFrom}</span>
                <span className="text-white/40">→</span>
                <span className="text-orange">{a.gradeTo}</span>
              </span>
              <button className="ml-auto inline-flex items-center h-9 px-4 rounded-[10px] bg-yellow text-ink font-bold text-[13px]">
                View the fix →
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
