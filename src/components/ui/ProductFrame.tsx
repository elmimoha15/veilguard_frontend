import { cn } from '@/lib/utils';

/**
 * A rounded "browser" frame for product screenshots/mocks — a subtle top chrome
 * bar (three dots + a faux address) over a white body. The whole frame is
 * wrapped in `.app-theme` so the product's real token palette (`.vg-surface`,
 * `.vg-row`, `.tnum`, grade/severity tints) resolves inside, making mocks look
 * like genuine in-app screenshots. Matches the ElevenLabs product-shot style.
 */
export default function ProductFrame({
  url = 'app.veilguard.dev',
  children,
  className,
  bodyClassName,
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        'app-theme overflow-hidden rounded-[16px] border border-[#E6E5E1] bg-white shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)]',
        className,
      )}
      style={{ background: '#FFFFFF' }}
    >
      {/* chrome bar */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-[#EFEEEA] bg-[#FBFBFA]">
        <span className="flex gap-[6px]" aria-hidden>
          <span className="w-[10px] h-[10px] rounded-full bg-[#E3E2DE]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#E3E2DE]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#E3E2DE]" />
        </span>
        <span className="mx-auto flex items-center gap-2 rounded-md bg-white border border-[#EDECE8] px-3 h-6 max-w-[60%]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" stroke="#A4A39E" strokeWidth="1.7" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="#A4A39E" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-[11.5px] text-[#8B8A86] truncate">{url}</span>
        </span>
      </div>
      <div className={cn('p-4 sm:p-6', bodyClassName)}>{children}</div>
    </div>
  );
}
