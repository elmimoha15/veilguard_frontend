"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#scanners', label: 'Scanners' },
  { href: '/#fix', label: 'Find & fix' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-border">
        <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative z-50" aria-label="Veilguard home">
            <Logo size={36} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[14.5px] font-medium text-muted hover:text-yellow-dark transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[14.5px] font-medium text-muted hover:text-yellow-dark transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/#scan"
              className="text-[14px] font-semibold bg-ink text-white px-5 h-10 inline-flex items-center rounded-[10px] hover:scale-[1.02] transition-transform duration-150"
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
              {LINKS.map((l) => (
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
