'use client';

import { MotionConfig } from 'framer-motion';

/**
 * `reducedMotion="user"` makes framer-motion skip transform/layout animations
 * (movement) for visitors who prefer reduced motion, while still allowing
 * opacity fades. Pairs with the CSS reduced-motion override in globals.css,
 * which zeroes out CSS animations/transitions.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
