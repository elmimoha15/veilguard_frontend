import { CenterHead } from '@/components/sections/annot/kit';
import ProductFrame from '@/components/ui/ProductFrame';
import { GradeSquare, SeverityChip } from '@/components/app/primitives';
import type { Sev } from '@/components/app/data';
import ScanFlowShot from '@/components/sections/shots/ScanFlowShot';
import FixShot from '@/components/sections/shots/FixShot';
import MonitorShot from '@/components/sections/shots/MonitorShot';

const FINDINGS: { sev: Sev; title: string; where: string }[] = [
  { sev: 'CRITICAL', title: 'Orders table is world-readable', where: 'supabase/policies.sql' },
  { sev: 'WARNING', title: 'API token exposed to the browser', where: '.env.example' },
  { sev: 'WARNING', title: '.env committed with real values', where: 'backend/.env' },
];

function FindingsMock() {
  return (
    <ProductFrame url="app.veilguard.dev/findings" bodyClassName="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">Findings, worst first</span>
        <GradeSquare grade="C" size={28} />
      </div>
      <div className="mt-2 flex flex-col">
        {FINDINGS.map((f, i) => (
          <div key={f.title} className="flex items-start gap-3 py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F3EF' }}>
            <span className="pt-[1px]"><SeverityChip sev={f.sev} /></span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink truncate">{f.title}</div>
              <div className="mt-[2px] font-mono text-[11px] text-[#A3A29D] truncate">{f.where}</div>
            </div>
          </div>
        ))}
      </div>
    </ProductFrame>
  );
}

const CARDS: { eyebrow: string; title: string; desc: string; mock: React.ReactNode }[] = [
  { eyebrow: 'Fast setup', title: 'Grade any app in 60 seconds.', desc: 'Paste a live URL, connect a repo, or drop a folder. No config, no client logins.', mock: <ScanFlowShot id="url" /> },
  { eyebrow: 'Instant clarity', title: 'Every issue, worst first.', desc: 'A plain-English A to F grade with the critical stuff surfaced first, so you know exactly what to fix.', mock: <FindingsMock /> },
  { eyebrow: 'The exact fix', title: 'The repair, already written.', desc: 'Copy-paste code or a ready-made prompt for your AI tool, one issue at a time.', mock: <FixShot /> },
  { eyebrow: 'Always on', title: 'Re-scan on every deploy.', desc: 'We watch your repo and email you the moment a new hole appears.', mock: <MonitorShot /> },
];

export default function Features() {
  return (
    <section id="features" className="an-x an-sec">
      <div className="an-max">
        <CenterHead eyebrow="Features" title="Everything your current scanner was missing." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {CARDS.map((c) => (
            <div key={c.eyebrow} className="an-card p-7 sm:p-8 flex flex-col">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow-dark">
                <span className="w-[9px] h-[9px] rounded-[2px] bg-yellow" />{c.eyebrow}
              </span>
              <h3 className="mt-5 text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.02em] leading-[1.15] text-ink">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.55] text-muted max-w-[42ch]">{c.desc}</p>
              <div className="mt-6 an-inset p-3 sm:p-4">{c.mock}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
