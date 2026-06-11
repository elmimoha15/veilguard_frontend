import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import RulesFileStep from '@/components/ui/RulesFileStep';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Install Veilguard on Windsurf — Step-by-Step Guide',
  description: 'Step-by-step guide to install the Veilguard MCP security server on Windsurf. Edit mcp_config.json and get 14 security tools running in under a minute.',
  alternates: { canonical: '/docs/install/windsurf' },
  openGraph: { url: 'https://veilguard.dev/docs/install/windsurf' },
};

export default function WindsurfInstallPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'Install', url: '/docs/install' }, { name: 'Windsurf', url: '/docs/install/windsurf' }]} />
      <h1 className="text-2xl font-semibold mb-2">Install on Windsurf</h1>
      <p className="text-sm text-text-body mb-8">
        Windsurf uses a global MCP config that applies to all your projects. Edit one file and restart.
      </p>

      <div className="not-prose mb-3 flex items-center gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold">Prerequisite</span>
        <span>Node.js 18 or later — verify with <code className="bg-background-code px-2 py-0.5 rounded font-mono text-xs">node --version</code></span>
      </div>

      <div className="not-prose mb-6 flex items-start gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold shrink-0">First</span>
        <span>Open the project you want to protect in Windsurf before you start. The server is shared across projects, but the security rules (Step 5) are saved <strong className="text-text-heading">inside the open project</strong>, so make sure it&apos;s the right one.</span>
      </div>

      {/* Step 1 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">1</span>
          <h2 className="text-base font-semibold text-text-heading">Open Windsurf Settings → Cascade → MCP Servers</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Click the gear icon at the bottom-left, or go to <strong className="text-text-heading">Windsurf → Settings</strong>. In the Settings panel, find the <strong className="text-text-heading">Cascade</strong> section. You&apos;ll see <strong className="text-text-heading">MCP Servers</strong> with an <strong className="text-text-heading">Open MCP Registry</strong> button.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/windsurf/step1-settings.png"
            alt="Windsurf Settings showing Cascade section with arrow pointing to Open MCP Registry button"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">2</span>
          <h2 className="text-base font-semibold text-text-heading">Open the MCP Registry</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Click <strong className="text-text-heading">Open MCP Registry</strong>. Veilguard isn&apos;t in the registry yet — you&apos;ll need to add it manually via the config file in the next step.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/windsurf/step2-registry.png"
            alt="Windsurf MCP Registry with No Registry Servers Installed and arrow pointing to settings gear icon"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">3</span>
          <h2 className="text-base font-semibold text-text-heading">Paste the MCP Config code below </h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Paste the config below 
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl p-6 mb-5 font-mono text-sm text-text-body overflow-x-auto">
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
      </div>

      {/* Step 4 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">4</span>
          <h2 className="text-base font-semibold text-text-heading">Restart Windsurf and verify</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Save the file and <strong className="text-text-heading">close and reopen Windsurf completely</strong>. Then go back to <strong className="text-text-heading">Settings → Open MCP Registry</strong>. Under the <strong className="text-text-heading">Installed</strong> tab, you should see <strong className="text-text-heading">veilguard</strong> with <strong className="text-text-heading">14 / 14 tools</strong> and an <strong className="text-text-heading">Enabled</strong> badge.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/windsurf/step4-installed.png"
            alt="Windsurf MCP Registry Installed tab showing veilguard with 14/14 tools and Enabled badge, arrow pointing to it"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
        <p className="text-text-body mt-5 ml-11">
          You can also click the veilguard row to see all 14 tools listed and confirm they are enabled.
        </p>
      </div>

      {/* Step 5 - Rules file */}
      <RulesFileStep stepNumber={5} agentName="Cascade">
        <p className="text-text-body mb-1">
          In Windsurf, create a new file named <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">.windsurfrules</code> in your project&apos;s top folder (right where your <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">package.json</code> lives). Hit <strong className="text-text-heading">Copy</strong> below, paste it all into the file, and save — Cascade reads it on your next chat, no restart needed.
        </p>
      </RulesFileStep>

      {/* Pro key */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-background-card border border-accent/50 text-accent font-bold flex items-center justify-center text-xs shrink-0">Pro</span>
          <h2 className="text-base font-semibold text-text-heading">Add your Pro key (optional)</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Re-open <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">~/.windsurf/mcp_config.json</code> and paste your license key into the <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">VEILGUARD_KEY</code> field. Save and restart Windsurf.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/windsurf/step4b-detail.png"
            alt="The mcp_config.json with VEILGUARD_KEY field showing PASTE YOUR KEY HERE highlighted with an arrow"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/windsurf/step5-pro-key.png"
            alt="The mcp_config.json with VEILGUARD_KEY field showing PASTE YOUR KEY HERE highlighted with an arrow"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
        <p className="text-text-muted text-sm ml-11 mt-4">
          Get a Pro key at <a href="https://veilguard.dev/pro" className="text-accent hover:underline">veilguard.dev/pro</a>.
        </p>
      </div>

      {/* Notes */}
      <div className="not-prose border-t border-border pt-8 mt-8">
        <h3 className="text-base font-medium text-text-heading mb-3">Notes</h3>
        <ul className="space-y-2 text-sm text-text-body">
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span><code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">~/.windsurf/mcp_config.json</code> is <strong>global</strong> — applies to every project you open in Windsurf.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>A full IDE restart is required after any config change — a window reload is not enough.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">.windsurfrules</code> file (Step 5) is what makes scans fire automatically — add it to every project you want continuously protected.</span></li>
        </ul>
      </div>

      <div className="not-prose mt-10 flex items-center gap-4 text-sm">
        <Link href="/docs/install/cursor" className="text-text-muted hover:text-text-heading transition-colors">← Cursor</Link>
        <Link href="/docs/install/vscode" className="text-accent hover:underline">VS Code →</Link>
      </div>
    </>
  );
}
