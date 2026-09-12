'use client';

import { Card, GradeSquare, SeverityChip, SeverityTiles, Donut } from '@/components/app/primitives';
import { SEV_COLOR, type Sev } from '@/components/app/data';

const ISSUES: { sev: Sev; title: string; app: string }[] = [
  { sev: 'CRITICAL', title: 'Supabase orders table is world-readable', app: 'store-frontend' },
  { sev: 'WARNING', title: 'API token exposed to the browser', app: 'store-frontend' },
  { sev: 'WARNING', title: '.env committed with real values', app: 'api-backend' },
];

/** One clean, contained overview/report panel — the hero product shot (plain card, no browser chrome). */
export default function OverviewShot() {
  return (
    <div className="app-theme pointer-events-none select-none overflow-hidden rounded-[20px] border border-[#ECEBE7] bg-white p-4 sm:p-6 shadow-[0_40px_90px_-55px_rgba(0,0,0,0.4)]">
      <div className="grid gap-4 min-[620px]:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[17px] font-medium tracking-[-0.01em]">A few things to fix before you charge money</h2>
                <p className="text-[12.5px] mt-[3px]" style={{ color: '#737373' }}>Just scanned store.myapp.com</p>
              </div>
              <GradeSquare grade="C" size={42} className="shrink-0" />
            </div>
            <div className="mt-4"><SeverityTiles critical={0} warnings={3} passed={12} /></div>
          </Card>

          <Card className="p-5">
            <div className="text-[14px] font-medium mb-1">Fix these first</div>
            <div className="flex flex-col">
              {ISSUES.map((it, i) => (
                <div key={it.title} className="flex items-start gap-3 py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                  <span className="pt-[1px]"><SeverityChip sev={it.sev} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{it.title}</div>
                    <div className="text-[11.5px] mt-[2px] truncate" style={{ color: '#A3A3A3' }}>{it.app}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center h-8 px-3.5 rounded-full bg-ink text-white text-[12.5px] font-medium">Fix</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col">
          <div className="text-[13px] font-medium mb-3">What&apos;s at risk</div>
          <div className="flex justify-center">
            <Donut
              size={124}
              centerValue={3}
              centerLabel="open"
              segments={[
                { label: 'Critical', value: 0, color: SEV_COLOR.CRITICAL },
                { label: 'Warnings', value: 3, color: SEV_COLOR.WARNING },
                { label: 'Passing', value: 12, color: SEV_COLOR.PASSED },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {([['Critical', 0, SEV_COLOR.CRITICAL], ['Warnings', 3, SEV_COLOR.WARNING], ['Passing', 12, SEV_COLOR.PASSED]] as const).map(([l, v, c]) => (
              <div key={l} className="flex items-center gap-2 text-[12px]">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span style={{ color: '#737373' }}>{l}</span>
                <span className="tnum font-semibold ml-auto">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
