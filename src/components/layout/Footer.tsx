import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { SCANNERS } from '@/content/scanners';

const PRODUCT_LINKS = [
  { href: '/#scan', label: 'Scan' },
  { href: '/#how', label: 'How it works' },
  { href: '/#risks', label: 'What goes wrong' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-[1160px] mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={40} wordmarkClassName="text-white text-[23px]" />
            <p className="mt-4 text-[15px] text-white/60 max-w-xs">
              Security for people who build with AI. Paste your app link, get a plain-English grade,
              and the exact fix for every issue.
            </p>
          </div>

          <nav aria-label="Security scanners">
            <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/40">
              Security scanners
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SCANNERS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    className="text-[14.5px] text-white/70 hover:text-white transition-colors"
                  >
                    {s.tool} security scanner
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product">
            <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/40">
              Product
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14.5px] text-white/70 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase text-white/40">
          <p>© 2026 Veilguard Studio</p>
          <p>Privacy-first · Read-only · Your code stays yours</p>
        </div>
      </div>
    </footer>
  );
}
