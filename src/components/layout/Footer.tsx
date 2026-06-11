import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#060C10] border-t border-[#94A3B8]/10 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logos/logo-icon.png" width={40} height={40} alt="Veilguard" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-[#F1F5F9] text-lg tracking-tight">veilguard</span>
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-xs">
              Built by developers who&apos;ve seen too many vibe-coded apps get breached.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#F1F5F9] font-semibold mb-4 text-xs tracking-widest uppercase font-mono">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/docs" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Documentation</Link></li>
              <li><Link href="/pro" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Pro — $19/month</Link></li>
              <li><a href="https://polar.sh/veilguard/portal" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Manage Subscription</a></li>
              <li><Link href="/docs/scanners" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Scanner Reference</Link></li>
              <li><Link href="/docs/scoring" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Security Scoring</Link></li>
              <li><Link href="/docs/fintech" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">African Fintech Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#F1F5F9] font-semibold mb-4 text-xs tracking-widest uppercase font-mono">Install</h4>
            <ul className="space-y-3">
              <li><Link href="/docs/install/cursor" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Cursor</Link></li>
              <li><Link href="/docs/install/claude-code" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Claude Code</Link></li>
              <li><Link href="/docs/install/windsurf" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Windsurf</Link></li>
              <li><Link href="/docs/install/vscode" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">VS Code</Link></li>
              <li><Link href="/docs/install/antigravity" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Antigravity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#F1F5F9] font-semibold mb-4 text-xs tracking-widest uppercase font-mono">Resources</h4>
            <ul className="space-y-3">
              <li><a href="https://github.com/elmimoha15/veilguard" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">GitHub</a></li>
              <li><a href="https://npmjs.com/package/veilguard" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">npm package</a></li>
              <li><Link href="/docs/faq" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">FAQ &amp; Troubleshooting</Link></li>
              <li><Link href="/privacy" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Terms</Link></li>
              <li><Link href="/refund" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#94A3B8]/10 text-sm text-[#475569]">
          <p>© 2026 Veilguard. MIT License.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://github.com/elmimoha15/veilguard" target="_blank" rel="noopener noreferrer" className="hover:text-[#F1F5F9] transition-colors" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F1F5F9] transition-colors" aria-label="X (Twitter)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
