'use client';

import { Card, SeverityText } from './primitives';
import { type Grade } from './data';
import type { UiFinding } from '@/lib/adapters';
import type { PassedCheck } from '@/lib/scans';

/**
 * "Why you got this grade" — a plain-English, per-scan explanation shown for
 * EVERY grade (A to F). Two honest halves built from real scan data:
 *   • What's protecting you  → the checks this scan PASSED (scan.passed)
 *   • What needs attention   → the open findings, worst-first
 * For A/B we lead with what's protecting you (an unexplained A reads as "did the
 * scan even run?"); for C to F we lead with what needs attention. Presentational
 * only, the caller supplies the passed list + the top findings.
 */

/** One plain sentence for the grade, from the counts + the grading rubric
 *  (any critical caps the grade at D until it's fixed). No jargon. */
function gradeWhy(grade: Grade, critical: number, warnings: number): string {
  const critN = critical;
  const critWord = critN === 1 ? 'critical issue' : 'critical issues';
  const warnWord = warnings === 1 ? 'warning' : 'warnings';
  switch (grade) {
    case 'A':
      return warnings > 0
        ? `No critical issues, and only ${warnings} minor ${warnWord}. The protections that matter are in place.`
        : 'No critical issues and no warnings. The protections that matter are in place.';
    case 'B':
      return `No critical issues. A few ${warnWord} to tidy up when you can, but the core protections are in place.`;
    case 'C':
      return `No critical issues, but ${warnings} ${warnWord} stacked up. Worth cleaning up before you charge money.`;
    case 'D':
      return critN > 0
        ? `${critN} ${critWord} cap the grade at D until ${critN === 1 ? 'it is' : 'they are'} fixed. Start there.`
        : `Enough issues piled up to pull the grade down to D. Work through them worst-first.`;
    case 'F':
      return critN > 0
        ? `${critN} ${critWord}, plus more on top. This needs work before it is safe to charge money.`
        : 'Too many issues to be safe yet. Work through them worst-first.';
  }
}

function CheckIcon() {
  return (
    <span className="mt-[1px] w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: '#F0FDF4' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export default function GradeExplainer({
  grade,
  critical,
  warnings,
  passed = [],
  attention = [],
  onViewFix,
  onSeeAll,
}: {
  grade?: Grade;
  critical: number;
  warnings: number;
  passed?: PassedCheck[];
  /** Top open findings, worst-first (already sliced by the caller). */
  attention?: UiFinding[];
  /** Route to a finding's fix (omit to hide "View fix", e.g. on the locked reveal). */
  onViewFix?: (f: UiFinding) => void;
  /** "See what to do" affordance under the attention list. */
  onSeeAll?: () => void;
}) {
  if (!grade) return null;
  const passFirst = grade === 'A' || grade === 'B';
  const showPass = passed.length > 0;
  const shownPass = passed.slice(0, 6);
  const morePass = passed.length - shownPass.length;

  const passBlock = (
    <div>
      <h3 className="text-[13px] font-semibold tracking-[0.02em]" style={{ color: '#15803D' }}>What&rsquo;s protecting you</h3>
      {showPass ? (
        <div className="flex flex-col mt-1">
          {shownPass.map((p, i) => (
            <div key={p.id} className="flex items-start gap-3 py-[10px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
              <CheckIcon />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium">{p.title}</div>
                {p.detail && <div className="text-[13px] mt-[2px] leading-[1.5]" style={{ color: '#737373' }}>{p.detail}</div>}
              </div>
            </div>
          ))}
          {morePass > 0 && <div className="text-[12.5px] mt-[8px]" style={{ color: '#A3A3A3' }}>and {morePass} more passing {morePass === 1 ? 'check' : 'checks'}.</div>}
        </div>
      ) : (
        <p className="text-[13px] mt-[6px] leading-[1.5]" style={{ color: '#737373' }}>We didn&rsquo;t record specific passing checks for this scan.</p>
      )}
    </div>
  );

  const attnBlock = attention.length > 0 && (
    <div>
      <h3 className="text-[13px] font-semibold tracking-[0.02em]" style={{ color: '#B45309' }}>What needs attention</h3>
      <div className="flex flex-col mt-1">
        {attention.map((f, i) => (
          <div key={f.id} className="flex items-start gap-3 py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
            <div className="flex-1 min-w-0">
              <SeverityText sev={f.sev} />
              <div className="text-[14px] font-medium mt-[3px]">{f.title}</div>
              {f.what && <div className="text-[13px] mt-[2px] leading-[1.5]" style={{ color: '#737373' }}>{f.what}</div>}
            </div>
            {onViewFix && (
              <button onClick={() => onViewFix(f)} className="shrink-0 self-center vg-press cursor-pointer inline-flex items-center gap-[5px] text-[12.5px] font-medium text-ink hover:opacity-70 transition-opacity">
                View fix
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="mt-[10px] vg-press cursor-pointer text-[13px] font-medium text-muted hover:text-ink transition-colors">See what to do</button>
      )}
    </div>
  );

  return (
    <Card flat className="py-7 border-t border-border">
      <h2 className="text-[16px] font-medium">Why you got a {grade}</h2>
      <p className="text-[13.5px] mt-[6px] leading-[1.55] max-w-[64ch]" style={{ color: '#737373' }}>{gradeWhy(grade, critical, warnings)}</p>
      <div className="mt-5 flex flex-col gap-6">
        {passFirst ? <>{passBlock}{attnBlock}</> : <>{attnBlock}{passBlock}</>}
      </div>
    </Card>
  );
}
