/**
 * Informational notes about HOW a scan ran (not findings) — e.g. "History too
 * large — scanned current files only". Written by the worker onto the scan doc
 * (`scan.notes`); purely informational, never affects the grade. Renders nothing
 * when there are no notes. Styled like the info rows in DeepScanHints.
 */
export default function ScanNotes({ notes }: { notes?: string[] }) {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="flex flex-col divide-y divide-border border-y border-border mt-5">
      {notes.map((note, i) => (
        <div key={i} className="py-4 flex items-start gap-3">
          <span className="shrink-0 mt-[1px] text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" strokeLinecap="round" />
              <circle cx="12" cy="7.6" r="0.7" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className="flex-1 min-w-0 text-[14px] text-muted">{note}</div>
        </div>
      ))}
    </div>
  );
}
