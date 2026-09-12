import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Renders a plain string with inline markdown-style links `[label](url)` turned
 * into real anchors, so sources can be cited inside the sentence where the claim
 * is made. Internal links (starting with "/") use next/link; external links open
 * in a new tab. Everything else is passed through as text.
 */
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const linkCls = 'text-ink font-medium underline decoration-2 decoration-[#F3C500] underline-offset-2 hover:text-yellow-dark transition-colors';

export function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  LINK.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINK.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const label = m[1];
    const url = m[2];
    out.push(
      /^https?:\/\//.test(url) ? (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={linkCls}>{label}</a>
      ) : (
        <Link key={i} href={url} className={linkCls}>{label}</Link>
      ),
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
