'use client';

import ProductFrame from '@/components/ui/ProductFrame';
import { Card, GradeSquare, ScoreChart } from '@/components/app/primitives';
import { MONITOR_ALERT } from '@/content/landing';
import type { Grade } from '@/components/app/data';

const DEPLOYS: { n: number; grade: Grade }[] = [
  { n: 44, grade: 'B' }, { n: 45, grade: 'B' }, { n: 46, grade: 'B' }, { n: 47, grade: 'D' }, { n: 48, grade: 'B' },
];
// Security score over 30 days, with the deploy-#47 dip.
const SCORE = [84, 85, 83, 86, 84, 85, 83, 84, 52, 55, 86, 85];

export default function MonitorShot() {
  const a = MONITOR_ALERT;
  return (
    <ProductFrame url="app.veilguard.dev/monitoring" bodyClassName="p-4 sm:p-5">
      <div className="grid gap-4 min-[640px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Security over time</span>
            <span className="text-[12px]" style={{ color: '#A3A3A3' }}>last 30 days</span>
          </div>
          <div className="mt-2"><ScoreChart points={SCORE} reduce /></div>
          <div className="mt-3 flex items-center justify-between">
            {DEPLOYS.map((d) => (
              <div key={d.n} className="flex flex-col items-center gap-1.5">
                <GradeSquare grade={d.grade} size={26} />
                <span className="font-mono text-[10.5px]" style={{ color: '#A3A3A3' }}>#{d.n}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13px] font-medium mb-3">Instant alert</div>
          <div className="rounded-[12px] border border-[#F0EFEB] bg-[#FAFAF9] p-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-[1px] w-7 h-7 rounded-full inline-flex items-center justify-center" style={{ background: '#FBEAEA' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#E5484D" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M12 9v4.5M12 16.6v.4" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-ink">{a.title} after {a.deploy}</div>
                <p className="text-[12.5px] leading-[1.5] mt-[3px]" style={{ color: '#737373' }}>{a.body}</p>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[11.5px] font-semibold" style={{ color: '#E5484D' }}>grade {a.gradeFrom} → {a.gradeTo}</span>
                  <span className="font-mono text-[11px]" style={{ color: '#A3A3A3' }}>emailed you in 2 min</span>
                </div>
              </div>
            </div>
            <button className="mt-3 inline-flex items-center h-9 px-4 rounded-[10px] bg-ink text-white font-medium text-[13px]">View the fix →</button>
          </div>
        </Card>
      </div>
    </ProductFrame>
  );
}
