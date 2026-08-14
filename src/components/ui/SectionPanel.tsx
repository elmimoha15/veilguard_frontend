import FadeIn from '@/components/ui/FadeIn';
import Eyebrow from '@/components/ui/Eyebrow';
import { cn } from '@/lib/utils';

/**
 * The signature ElevenLabs-style block: a light-gray rounded panel with a
 * left-aligned header (small label + restrained heading + optional subhead) and
 * an optional right-aligned slot (tab toggle / link). Children render below.
 *
 * `bare` drops the panel background/border (for sections that want the airy
 * header + content rhythm without the gray card).
 */
export default function SectionPanel({
  id,
  label,
  title,
  subtitle,
  headerRight,
  children,
  bare = false,
  className,
  innerClassName,
}: {
  id?: string;
  label?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  bare?: boolean;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section id={id} className={cn('px-[clamp(14px,3vw,28px)] scroll-mt-24', className)}>
      <div
        className={cn(
          'mx-auto max-w-[1200px]',
          bare ? '' : 'el-panel px-[clamp(20px,4vw,56px)] py-[clamp(36px,5vw,72px)]',
          innerClassName,
        )}
      >
        <FadeIn>
          <div className="flex items-end justify-between gap-6 flex-wrap max-w-[860px]">
            <div className="max-w-[680px]">
              {label && <Eyebrow className="text-yellow-dark">{label}</Eyebrow>}
              <h2 className={cn('el-h text-[clamp(26px,3.4vw,42px)]', label && 'mt-3')}>{title}</h2>
              {subtitle && (
                <p className="mt-4 text-[16.5px] leading-[1.55] text-muted max-w-[52ch]">{subtitle}</p>
              )}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </FadeIn>

        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
