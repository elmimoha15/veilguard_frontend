import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { SCANNERS } from '@/content/scanners';
import { INDEXABLE_GUIDE_ARTICLES, INDEXABLE_SECURITY_ARTICLES, articleHref } from '@/content/learn';
import { LEGAL, SUPPORT_MAILTO } from '@/content/site';

const PRODUCT_LINKS = [
  { href: '/#top', label: 'Scan' },
  { href: '/#scan-types', label: 'How it works' },
  { href: '/#risks', label: 'What goes wrong' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

const headCls = 'text-[12px] font-medium text-white/40';
const linkCls = 'text-[14px] text-white/65 hover:text-white transition-colors';

export default function Footer() {
  const guides = INDEXABLE_GUIDE_ARTICLES.slice(0, 5);
  const security = INDEXABLE_SECURITY_ARTICLES.slice(0, 5);

  return (
    <footer className="an-x pb-8 pt-4">
      <div className="an-max bg-[#17171A] text-white px-8 sm:px-12 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-0 lg:divide-x lg:divide-white/[0.12]">
          <div className="lg:pr-10">
            <Logo size={30} tone="onDark" />
            <p className="mt-4 text-[14.5px] text-white/55 max-w-xs leading-[1.55]">
              Security for people who build with AI. Paste your app link, get a plain-English grade, and the exact fix for every issue.
            </p>
          </div>

          <nav aria-label="Tools we cover" className="lg:px-10">
            <h2 className={headCls}>Tools</h2>
            <ul className="mt-4 space-y-2.5">
              {SCANNERS.map((s) => (
                <li key={s.slug}><Link href={`/scanners/${s.slug}`} className={linkCls}>{s.tool} scanner</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guides" className="lg:px-10">
            <h2 className={headCls}>Guides</h2>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/guides" className={linkCls}>All guides</Link></li>
              {guides.map((a) => <li key={a.slug}><Link href={articleHref(a.slug)} className={linkCls}>{a.title}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Security topics" className="lg:px-10">
            <h2 className={headCls}>Security topics</h2>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/security" className={linkCls}>All topics</Link></li>
              {security.map((a) => <li key={a.slug}><Link href={articleHref(a.slug)} className={linkCls}>{a.title}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Product" className="lg:pl-10">
            <h2 className={headCls}>Product</h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((l) => <li key={l.href}><Link href={l.href} className={linkCls}>{l.label}</Link></li>)}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12.5px] text-white/40">
          <p>© 2026 Veilguard Studio</p>
          <nav className="flex items-center gap-4">
            <Link href={LEGAL.privacy} className="hover:text-white transition-colors">Privacy</Link>
            <Link href={LEGAL.terms} className="hover:text-white transition-colors">Terms</Link>
            <Link href={LEGAL.refund} className="hover:text-white transition-colors">Refund</Link>
            <a href={SUPPORT_MAILTO} className="hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
