import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Install Veilguard on Antigravity — Step-by-Step Guide',
  description: 'Step-by-step guide to install the Veilguard MCP security server on Antigravity. Open MCP Config, paste the config, and get 14 security tools running in under a minute.',
  openGraph: { url: 'https://veilguard.dev/docs/install/antigravity' },
};

export default function AntigravityInstallPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Install on Antigravity</h1>
      <p className="text-sm text-text-body mb-8">
        Antigravity uses a global MCP config file. Open it from Settings → Customizations, paste the config, and restart.
      </p>

      <div className="not-prose mb-6 flex items-center gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold">Prerequisite</span>
        <span>Node.js 18 or later — verify with <code className="bg-background-code px-2 py-0.5 rounded font-mono text-xs">node --version</code></span>
      </div>

      {/* Step 1 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">1</span>
          <h2 className="text-base font-semibold text-text-heading">Open Settings → Customizations → Open MCP Config</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Open Antigravity Settings and navigate to <strong className="text-text-heading">Customizations</strong>. Under <strong className="text-text-heading">Installed MCP Servers</strong>, click <strong className="text-text-heading">Open MCP Config</strong> to open the global config file.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/antigravity/step1-open-config.png"
            alt="Antigravity Settings Customizations panel showing No MCP Servers with arrow pointing to Open MCP Config button"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">2</span>
          <h2 className="text-base font-semibold text-text-heading">Paste the Veilguard config into <code className="text-sm">mcp_config.json</code></h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          The <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">mcp_config.json</code> file will open. Paste the following config (or add the <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">veilguard</code> block into an existing <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">mcpServers</code> object):
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
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/antigravity/step2-mcp-json.png"
            alt="The mcp_config.json file open in Antigravity with the veilguard config pasted in"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">3</span>
          <h2 className="text-base font-semibold text-text-heading">Save, then click Refresh in Customizations</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Save the config file. Go back to <strong className="text-text-heading">Settings → Customizations</strong> and click <strong className="text-text-heading">Refresh</strong>. You should see <strong className="text-text-heading">veilguard</strong> listed under Installed MCP Servers with a green dot and <strong className="text-text-heading">14 tools enabled</strong>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border mb-5">
          <Image
            src="/docs/antigravity/step3-installed.png"
            alt="Antigravity Settings Customizations showing veilguard installed with green dot and 14 tools enabled"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/antigravity/step4-installed-arrow.png"
            alt="Antigravity Customizations with veilguard installed and arrow pointing to Open MCP Config button"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 4 - Verify */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">4</span>
          <h2 className="text-base font-semibold text-text-heading">Verify it&apos;s working</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Open a new Antigravity agent chat and ask: <em className="text-text-heading">&quot;Run a full audit for this project&quot;</em>. Veilguard will run all 14 security scanners and return a detailed report with findings.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/antigravity/step6-verify.png"
            alt="Antigravity agent chat showing Veilguard full audit results with 37 issues found including critical vulnerabilities"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
      </div>

      {/* Pro key */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-background-card border border-accent/50 text-accent font-bold flex items-center justify-center text-xs shrink-0">Pro</span>
          <h2 className="text-base font-semibold text-text-heading">Add your Pro key (optional)</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Go back to <strong className="text-text-heading">Settings → Customizations</strong> and click <strong className="text-text-heading">Open MCP Config</strong> again. Replace the empty string on <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">VEILGUARD_KEY</code> with your license key, save, and click Refresh.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/antigravity/step5-pro-key.png"
            alt="The mcp_config.json with VEILGUARD_KEY showing PASTE YOUR VEILGUARD KEY HERE highlighted with an arrow"
            width={1024}
            height={616}
            className="w-full"
          />
        </div>
        <p className="text-text-muted text-sm ml-11 mt-4">
          Get a Pro key at <a href="https://veilguard.dev/pro" className="text-accent hover:underline">veilguard.dev/pro</a>. Keys look like <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">vg_live_xxxxxxxxxxxxxxxxxxxx</code>.
        </p>
      </div>

      {/* Notes */}
      <div className="not-prose border-t border-border pt-8 mt-8">
        <h3 className="text-base font-medium text-text-heading mb-3">Notes</h3>
        <ul className="space-y-2 text-sm text-text-body">
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The MCP config is stored at <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">~/.gemini/antigravity/mcp_config.json</code> — it applies globally to all Antigravity projects.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>Click <strong>Refresh</strong> in Customizations after any config change — no full restart required.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>For auto-scanning, download the <a href="https://raw.githubusercontent.com/elmimoha15/veilguard/main/templates/cursorrules.txt" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">rules template</a> to your project root.</span></li>
        </ul>
      </div>

      <div className="not-prose mt-10 flex items-center gap-4 text-sm">
        <Link href="/docs/install" className="text-text-muted hover:text-text-heading transition-colors">← All IDEs</Link>
        <Link href="/docs/install/cursor" className="text-accent hover:underline">Cursor →</Link>
      </div>
    </>
  );
}
