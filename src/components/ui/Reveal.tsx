'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fades + rises its children into view the first time they scroll into the
 * viewport (marketing sections). SSR renders them hidden via `.reveal`; on mount
 * an IntersectionObserver adds `.reveal--in`. Reduced-motion or environments
 * without IntersectionObserver reveal instantly, and a `<noscript>` fallback in
 * the marketing layout keeps content visible with JS disabled. The wrapper is a
 * plain block, so it adds no layout shift.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Optional stagger, in ms. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion still gets a scroll-triggered crossfade (the CSS drops the
    // slide), so we only bypass the observer when it's genuinely unavailable.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('reveal--in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { el.classList.add('reveal--in'); io.disconnect(); break; }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ? `reveal ${className}` : 'reveal'} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
