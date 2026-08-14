"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';

export type LinkItem = { label: string; href: string };
export type NavMenus = { scanners: LinkItem[]; guides: LinkItem[]; security: LinkItem[] };

const MOBILE_LINKS: LinkItem[] = [
  { href: '/#how', label: 'How it works' },
  { href: '/scanners', label: 'Scanners' },
  { href: '/guides', label: 'Guides' },
  { href: '/security', label: 'Security' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A nav link that reveals a clean dropdown of its hub pages on hover/focus. */
function NavDropdown({ label, href, allLabel, items }: { label: string; href: string; allLabel: string; items: LinkItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={href}
        className="flex items-center gap-1 text-[14.5px] font-medium text-muted hover:text-ink transition-colors"
        onFocus={() => setOpen(true)}
        aria-expanded={open}
      >
        {label}
        <Chevron open={open} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            // pt-3 keeps an invisible hover bridge between trigger and panel
            className="absolute left-1/2 -translate-x-1/2 top-full pt-3"
          >
            <div className="w-[300px] rounded-2xl border border-border bg-white shadow-[0_24px_70px_-28px_rgba(0,0,0,0.4)] p-2">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="block rounded-xl px-3 py-2.5 text-[14px] font-medium text-ink leading-snug hover:bg-bg-soft transition-colors"
                >
                  {it.label}
                </Link>
              ))}
              <div className="mt-1 pt-1 border-t border-border">
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-yellow-dark hover:bg-bg-soft transition-colors"
                >
                  {allLabel}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ menus }: { menus: NavMenus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative z-50" aria-label="Veilguard home">
            <Logo size={36} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/#how" className="text-[14.5px] font-medium text-muted hover:text-ink transition-colors">
              How it works
            </Link>
            <NavDropdown label="Scanners" href="/scanners" allLabel="All scanners" items={menus.scanners} />
            <NavDropdown label="Guides" href="/guides" allLabel="All guides" items={menus.guides} />
            <NavDropdown label="Security" href="/security" allLabel="All security" items={menus.security} />
            <Link href="/#pricing" className="text-[14.5px] font-medium text-muted hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="text-[14.5px] font-medium text-muted hover:text-ink transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[14.5px] font-medium text-muted hover:text-ink transition-colors px-3 h-10 inline-flex items-center"
            >
              Log in
            </Link>
            <Link
              href="/#scan"
              className="text-[14px] font-semibold bg-ink text-white px-5 h-10 inline-flex items-center rounded-full hover:opacity-90 transition-opacity duration-150"
            >
              Scan my app
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden relative z-50 text-ink p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl px-6 pt-24 pb-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg">
              {MOBILE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-ink font-medium border-b border-border pb-4"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center border border-border text-ink px-6 py-4 rounded-xl font-semibold"
              >
                Log in
              </Link>
              <Link
                href="/#scan"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-ink text-white px-6 py-4 rounded-xl font-semibold"
              >
                Scan my app
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
