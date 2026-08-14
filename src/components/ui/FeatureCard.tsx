import FadeIn from '@/components/ui/FadeIn';
import { cn } from '@/lib/utils';

/**
 * Small feature card (ElevenLabs style): a monochrome line icon in a soft tile,
 * a title, and a one-line description. Compose several inside `FeatureCardRow`.
 */
export function FeatureCard({
  icon,
  title,
  body,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'h-full rounded-[16px] border border-border bg-card p-5 transition-[border-color,box-shadow] duration-200 hover:border-black/[0.12] hover:shadow-[0_16px_36px_-26px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-bg-soft text-ink ring-1 ring-black/[0.04]"
      >
        {icon}
      </span>
      <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted">{body}</p>
    </div>
  );
}

/** Responsive grid wrapper for a row of FeatureCards, with staggered reveal. */
export function FeatureCardRow({
  items,
  className,
}: {
  items: { icon: React.ReactNode; title: string; body: string }[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {items.map((it, i) => (
        <FadeIn key={it.title} delay={i * 0.06} className="h-full">
          <FeatureCard icon={it.icon} title={it.title} body={it.body} />
        </FadeIn>
      ))}
    </div>
  );
}
