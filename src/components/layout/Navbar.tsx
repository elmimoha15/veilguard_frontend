'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { ActionInner } from '@/components/ui/ActionButton';
import { BrandLogo, type BrandLogoName } from '@/components/ui/BrandLogo';
import { SCANNER_CATEGORIES } from '@/content/scanner-categories';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';

/** Kept for the marketing layout's prop; the Annot nav uses anchor links instead. */
export type LinkItem = { label: string; href: string };
export type NavMenus = { scanners: LinkItem[]; guides: LinkItem[]; security: LinkItem[] };

type MenuItem = { href: string; title: string; desc?: string; brand?: BrandLogoName };

const CATEGORY_DESC: Record<string, string> = {
  'ai-coding-agents': 'Cursor, Windsurf, Claude, Copilot',
  'vibecoding-tools': 'Lovable, Bolt, Replit, v0',
  backends: 'Supabase, Firebase',
};
const SCANNER_ITEMS: MenuItem[] = SCANNER_CATEGORIES.map((c) => ({
  href: `/scanners/${c.slug}`,
  title: c.name,
  desc: CATEGORY_DESC[c.slug],
}));
const GUIDE_ITEMS: MenuItem[] = INDEXABLE_GUIDE_ARTICLES.slice(0, 5).map((a) => ({
  href: articleHref(a.slug),
  title: a.title,
  desc: a.metaDescription,
}));
const SECURITY_ITEMS: MenuItem[] = INDEXABLE_SECURITY_ARTICLES.slice(0, 5).map((a) => ({
  href: articleHref(a.slug),
  title: a.title,
  desc: a.metaDescription,
}));

const Chevron = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function NavDropdown({ label, href, items, allLabel, columns = 1, width }: { label: string; href: string; items: MenuItem[]; allLabel: string; columns?: 1 | 2; width: number }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 110);
  };
  const close = () => setOpen(false);

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[14.5px] font-medium text-muted hover:text-ink transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        onFocus={enter}
      >
        {label}
        <Chevron open={open} />
      </Link>

      {/* pt-3 keeps a hover bridge between trigger and panel */}
      <div className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 ${open ? '' : 'pointer-events-none'}`} style={{ width }}>
        <div
          className={`rounded-2xl border border-border bg-white p-2 shadow-[0_28px_70px_-28px_rgba(23,23,22,0.35)] origin-top transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
          role="menu"
        >
          <div className={columns === 2 ? 'grid grid-cols-2 gap-0.5' : 'flex flex-col gap-0.5'}>
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={close}
                role="menuitem"
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 hover:bg-[#F6F5F2] transition-colors"
              >
                {it.brand && (
                  <span className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F6F5F2]">
                    <BrandLogo name={it.brand} size={16} icon />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium text-ink leading-snug">{it.title}</span>
                  {it.desc && <span className="mt-0.5 block text-[12px] leading-snug text-muted line-clamp-1">{it.desc}</span>}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-1 border-t border-border px-3 pt-2 pb-1">
            <Link href={href} onClick={close} className="inline-flex items-center gap-1 text-[13px] font-semibold text-yellow-dark hover:opacity-80 transition-opacity">
              {allLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOBILE_LINKS: LinkItem[] = [
  { href: '/#scan-types', label: 'How it works' },
  { href: '/scanners', label: 'Tools' },
  { href: '/guides', label: 'Guides' },
  { href: '/security', label: 'Security' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

/** Annot-style floating nav bar with modern dropdowns for the multi-page sections. */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkCls = 'text-[14.5px] font-medium text-muted hover:text-ink transition-colors';
  return (
    <div className="sticky top-4 z-50 an-x">
      <div className="an-max">
        <div className="an-nav relative flex items-center justify-between h-14 pl-5 pr-2">
          <Link href="/" className="flex items-center relative z-10" aria-label="Veilguard home">
            <Logo size={26} />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/#scan-types" className={linkCls}>How it works</Link>
            <NavDropdown label="Tools" href="/scanners" items={SCANNER_ITEMS} allLabel="All tools" width={320} />
            <NavDropdown label="Guides" href="/guides" items={GUIDE_ITEMS} allLabel="All guides" width={340} />
            <NavDropdown label="Security" href="/security" items={SECURITY_ITEMS} allLabel="All topics" width={340} />
            <Link href="/#pricing" className={linkCls}>Pricing</Link>
            <Link href="/#faq" className={linkCls}>FAQ</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2 relative z-10">
            <Link href="/login" className="text-[14.5px] font-medium text-muted hover:text-ink transition-colors px-3 h-9 inline-flex items-center">Log in</Link>
            <Link href="/onboarding" className="vg-abtn vg-abtn--primary h-10 px-5"><ActionInner>Get Started</ActionInner></Link>
          </div>

          <button className="lg:hidden relative z-10 p-2 text-ink" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></> : <><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /></>}
            </svg>
          </button>
        </div>

        {open && (
          <div className="lg:hidden mt-2 an-card p-4 flex flex-col gap-1">
            {MOBILE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-2 py-2.5 text-[15px] font-medium text-ink">{l.label}</Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="text-center border border-border rounded-[10px] py-2.5 text-[15px] font-medium">Login</Link>
              <Link href="/onboarding" onClick={() => setOpen(false)} className="vg-abtn vg-abtn--primary w-full h-11"><ActionInner>Get Started</ActionInner></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
