/** Small pill eyebrow badge (Annot style, in Veilguard yellow). */
export function PillLabel({ children }: { children: React.ReactNode }) {
  return <span className="an-pill" style={{ fontSize: '19px', fontWeight: 500, letterSpacing: '0.01em' }}>{children}</span>;
}

/** Centered section header: pill eyebrow + headline + optional subhead. */
export function CenterHead({ eyebrow, title, sub, className }: { eyebrow?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={`text-center ${className ?? ''}`}>
      {eyebrow && <PillLabel>{eyebrow}</PillLabel>}
      <h2 className="mt-4 mx-auto max-w-[22ch] text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] leading-[1.08] text-ink text-balance">{title}</h2>
      {sub && <p className="mt-4 mx-auto max-w-[54ch] text-[16px] leading-[1.6] text-muted text-pretty">{sub}</p>}
    </div>
  );
}
