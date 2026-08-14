import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { SCANNERS } from '@/content/scanners';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';
import { LEGAL, SUPPORT_MAILTO } from '@/content/site';

const PRODUCT_LINKS = [
  { href: '/#scan', label: 'Scan' },
  { href: '/#how', label: 'How it works' },
  { href: '/#risks', label: 'What goes wrong' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

const linkCls = 'text-[14.5px] text-white/70 hover:text-white transition-colors';
const headCls = 'font-mono text-[11px] tracking-[0.14em] uppercase text-white/40';

export default function Footer() {
  const guides = INDEXABLE_GUIDE_ARTICLES.slice(0, 5);
  const security = INDEXABLE_SECURITY_ARTICLES.slice(0, 5);

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 60% at 50% 118%, rgba(236,78,107,0.24), rgba(255,150,110,0.10) 45%, transparent 66%)' }}
      />
      <div className="relative max-w-[1160px] mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo size={40} wordmarkClassName="text-white text-[23px]" />
            <p className="mt-4 text-[15px] text-white/60 max-w-xs">
              Security for people who build with AI. Paste your app link, get a plain-English grade,
              and the exact fix for every issue.
            </p>
          </div>

          <nav aria-label="Security scanners">
            <h2 className={headCls}>Security scanners</h2>
            <ul className="mt-4 space-y-2.5">
              {SCANNERS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/scanners/${s.slug}`} className={linkCls}>{s.tool} scanner</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guides">
            <h2 className={headCls}>Guides</h2>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/guides" className={linkCls}>All guides</Link></li>
              {guides.map((a) => (
                <li key={a.slug}><Link href={articleHref(a.slug)} className={linkCls}>{a.title}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Security topics">
            <h2 className={headCls}>Security topics</h2>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/security" className={linkCls}>All topics</Link></li>
              {security.map((a) => (
                <li key={a.slug}><Link href={articleHref(a.slug)} className={linkCls}>{a.title}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product">
            <h2 className={headCls}>Product</h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase text-white/40">
          <p>© 2026 Veilguard Studio</p>
          <nav className="flex items-center gap-4">
            <Link href={LEGAL.privacy} className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href={LEGAL.terms} className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href={LEGAL.refund} className="hover:text-white/70 transition-colors">Refund</Link>
            <a href={SUPPORT_MAILTO} className="hover:text-white/70 transition-colors">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
