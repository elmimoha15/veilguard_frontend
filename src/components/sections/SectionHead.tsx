import { cn } from '@/lib/utils';
import Eyebrow from '@/components/ui/Eyebrow';

/**
 * The ElevenLabs two-column section header: a small gray eyebrow + a big tight
 * headline on the left, a supporting paragraph on the right. Stacks on mobile.
 * One component so every landing section shares the same rhythm.
 */
export default function SectionHead({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-x-12 gap-y-5 md:grid-cols-2 items-start', className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 className="el-h text-[clamp(28px,3.7vw,46px)] max-w-[15ch] m-0">{title}</h2>
      </div>
      {description && (
        <p className="text-muted text-[clamp(15px,1.35vw,18px)] leading-[1.55] md:max-w-[44ch] md:pt-[6px]">
          {description}
        </p>
      )}
    </div>
  );
}
