import { Card } from './primitives';
import type { PassedCheck } from '@/lib/scans';

/**
 * "What's solid" — the security checks the app PASSED (positive results). Shown to
 * everyone (never paywalled, unlike fixes); carries no severity/fix. Renders
 * nothing when there are no passes.
 */
export default function PassedChecks({ passed }: { passed?: PassedCheck[] }) {
  if (!passed || passed.length === 0) return null;
  return (
    <Card flat className="py-7 border-t border-border">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-medium">What&rsquo;s solid</h2>
        <span className="tnum text-[13px]" style={{ color: '#16A34A' }}>{passed.length}</span>
      </div>
      <p className="text-[13px] mb-1" style={{ color: '#737373' }}>Security checks your app passed.</p>
      <div className="flex flex-col">
        {passed.map((p, i) => (
          <div key={p.id} className="flex items-start gap-3 py-[12px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
            <span className="mt-[1px] w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: '#F0FDF4' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium">{p.title}</div>
              {p.detail && <div className="text-[13px] mt-[2px] leading-[1.5]" style={{ color: '#737373' }}>{p.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
