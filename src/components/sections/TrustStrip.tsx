const ITEMS: { icon: React.ReactNode; text: React.ReactNode }[] = [
  {
    icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    text: 'Read-only. We never store your code.',
  },
  {
    icon: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
    text: 'Non-destructive. We never touch your live data.',
  },
  {
    icon: <><path d="M12 3l2.5 2 3-.3 1 2.9 2.5 1.7-1 2.9 1 2.9-2.5 1.7-1 2.9-3-.3-2.5 2-2.5-2-3 .3-1-2.9L2.5 15l1-2.9-1-2.9L5 7.6l1-2.9 3 .3z" /><path d="M9 12l2 2 4-4" /></>,
    text: 'Scans for real, documented threats, like the Lovable RLS exposure (CVE-2025-48757).',
  },
];

/** Thin trust strip under the hero: three honest security promises, Annot card. */
export default function TrustStrip() {
  return (
    <section className="an-x pt-2">
      <div className="an-max">
        <div className="an-card grid gap-x-8 gap-y-5 px-7 py-6 sm:grid-cols-3">
          {ITEMS.map((it, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-[1px] flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#FEF6D6] text-yellow-dark" aria-hidden>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
              </span>
              <span className="text-[13.5px] leading-[1.45] text-muted">{it.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
