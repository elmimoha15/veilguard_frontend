import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Install Veilguard — Step-by-Step Guides for Every IDE',
  description: 'Step-by-step installation guides for Veilguard. Choose your IDE: Cursor, Windsurf, VS Code, or Claude Code. Get 14 security tools running in under a minute.',
  keywords: ['install veilguard', 'MCP server install', 'Cursor security setup', 'Claude Code MCP server', 'VS Code security extension install', 'Windsurf MCP server', 'npx veilguard'],
  alternates: { canonical: '/docs/install' },
  openGraph: { url: 'https://veilguard.dev/docs/install' },
};

const ides = [
  {
    name: 'Cursor',
    href: '/docs/install/cursor',
    config: '.cursor/mcp.json',
    method: 'Create one JSON file, restart',
    badge: 'Best experience',
    badgeColor: 'text-accent bg-accent-muted border-accent/20',
  },
  {
    name: 'Windsurf',
    href: '/docs/install/windsurf',
    config: '~/.windsurf/mcp_config.json',
    method: 'Edit global config, restart',
    badge: null,
    badgeColor: '',
  },
  {
    name: 'VS Code',
    href: '/docs/install/vscode',
    config: '~/.config/Code/User/mcp.json',
    method: 'Command Palette wizard — no JSON editing',
    badge: 'Easiest setup',
    badgeColor: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20',
  },
  {
    name: 'Claude Code',
    href: '/docs/install/claude-code',
    config: '.claude/mcp.json',
    method: 'One terminal command',
    badge: 'Most coverage',
    badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
  },
  {
    name: 'Antigravity',
    href: '/docs/install/antigravity',
    config: '~/.gemini/antigravity/mcp_config.json',
    method: 'Edit global config, click Refresh',
    badge: null,
    badgeColor: '',
  },
];

export default function DocsInstallPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'Install', url: '/docs/install' }]} />
      <h1 className="text-2xl font-semibold mb-3">Installation</h1>
      <p className="text-sm text-text-body mb-8">
        Pick your IDE below for a step-by-step guide with screenshots. Requires Node.js 18 or later.
      </p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {ides.map((ide) => (
          <Link
            key={ide.name}
            href={ide.href}
            className="group flex flex-col p-6 bg-background-card border border-border rounded-xl hover:border-border-hover hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-heading group-hover:text-accent transition-colors">{ide.name}</h2>
              {ide.badge && (
                <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${ide.badgeColor}`}>{ide.badge}</span>
              )}
            </div>
            <p className="text-sm text-text-muted mb-4 font-mono">{ide.config}</p>
            <p className="text-sm text-text-body flex-grow">{ide.method}</p>
            <div className="mt-5 flex items-center gap-1 text-accent text-sm font-medium">
              View guide <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="not-prose border-t border-border pt-8">
        <h3 className="text-base font-medium text-text-heading mb-4">The MCP config (same for all IDEs)</h3>
        <p className="text-sm text-text-body mb-4">Only the file path and how you add it differs per IDE. The JSON config block is identical:</p>
        <div className="bg-background-code border border-border rounded-xl p-6 font-mono text-sm text-text-body overflow-x-auto">
          <pre>{`{
  "mcpServers": {
    "veilguard": {
      "command": "npx",
      "args": ["-y", "--package=veilguard", "veilguard-mcp"],
      "env": {
        "VEILGUARD_KEY": ""
      }
    }
  }
}`}</pre>
        </div>
        <p className="text-sm text-text-muted mt-3">Leave <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">VEILGUARD_KEY</code> empty for free tier. Add your key for Pro.</p>
      </div>
    </>
  );
}
