'use client';

import { useEffect, useRef, useState } from 'react';

/** One reassuring line per grade — plain English for non-technical founders. */
const GRADE_MEANINGS: { g: string; color: string; text: string }[] = [
  { g: 'A', color: '#1FB86B', text: 'Looking great — no urgent issues.' },
  { g: 'B', color: '#1FB86B', text: 'Solid, with a few small things to tidy.' },
  { g: 'C', color: '#F2851F', text: 'Some real gaps worth fixing soon.' },
  { g: 'D', color: '#E5352B', text: 'Serious holes — worth fixing now.' },
  { g: 'F', color: '#E5352B', text: 'Urgent — fix these before attackers find them.' },
];

/**
 * A small, keyboard-reachable "?" popover that explains the A–F grade scale.
 * Escape or an outside click closes it. Reusable next to any grade display.
 */
export function GradeHelp({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <span ref={ref} className={`relative inline-flex align-middle ${className ?? ''}`}>
      <button
        type="button"
        aria-label="What does this grade mean?"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-[18px] h-[18px] rounded-full border border-border text-[11px] font-bold text-tertiary hover:text-ink hover:border-ink transition-colors cursor-pointer flex items-center justify-center leading-none"
      >
        ?
      </button>
      {open && (
        <div role="tooltip" className="absolute z-[200] top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[264px] bg-card border border-border rounded-[12px] p-4 shadow-[var(--shadow-pop)] text-left vg-fade">
          <div className="font-semibold text-[13px] mb-2">What your grade means</div>
          <ul className="flex flex-col gap-[7px] text-[12.5px] leading-[1.4]">
            {GRADE_MEANINGS.map((m) => (
              <li key={m.g} className="flex gap-2">
                <span className="font-bold w-[14px] shrink-0" style={{ color: m.color }}>{m.g}</span>
                <span className="text-muted">{m.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}
