import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Install Veilguard on Cursor — Step-by-Step Guide',
  description: 'Step-by-step guide to install the Veilguard MCP security server on Cursor. Configure your .cursor/mcp.json and get 14 security tools running in under a minute.',
  openGraph: { url: 'https://veilguard.dev/docs/install/cursor' },
};

export default function CursorInstallPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Install on Cursor</h1>
      <p className="text-sm text-text-body mb-8">
        Get Veilguard running in Cursor in under a minute. You&apos;ll create one config file and restart.
      </p>

      <div className="not-prose mb-6 flex items-center gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold">Prerequisite</span>
        <span>Node.js 18 or later — verify with <code className="bg-background-code px-2 py-0.5 rounded font-mono text-xs">node --version</code></span>
      </div>

      {/* Step 1 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">1</span>
          <h2 className="text-base font-semibold text-text-heading">Open Cursor Settings → Tools &amp; MCPs</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Press <kbd className="bg-background-code border border-border rounded px-2 py-0.5 text-xs font-mono">Cmd/Ctrl + Shift + J</kbd> to open Cursor Settings, then click <strong className="text-text-heading">Tools &amp; MCPs</strong> in the left sidebar under <strong className="text-text-heading">Agents</strong>. You&apos;ll see an empty state — no MCP tools installed yet.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/cursor/step1-tools-empty.png"
            alt="Cursor Settings showing Tools & MCPs panel with No MCP Tools message and arrow pointing to it"
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
          <h2 className="text-base font-semibold text-text-heading">Create <code className="text-sm">.cursor/mcp.json</code> in your project root</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Create the folder <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">.cursor/</code> in your project root, then create <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">mcp.json</code> inside it. Paste this config:
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl p-6 mb-5 font-mono text-sm text-text-body overflow-x-auto">
          <pre>{`{
  "mcpServers": {
    "veilguard": {
      "command": "npx",
      "args": ["-y", "--package=veilguard-cli", "veilguard-mcp"],
      "env": {
        "VEILGUARD_KEY": ""
      }
    }
  }
}`}</pre>
        </div>
        <p className="text-text-muted text-sm ml-11 mb-5">
          Leave <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">VEILGUARD_KEY</code> empty for the free tier. If you already have a Pro key, paste it in now.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/cursor/step2-mcp-json.png"
            alt="The .cursor/mcp.json file open in Cursor with the veilguard MCP server config pasted in"
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
          <h2 className="text-base font-semibold text-text-heading">Restart Cursor</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Close and reopen Cursor completely. Then go back to <strong className="text-text-heading">Settings → Tools &amp; MCPs</strong>. You should see <strong className="text-text-heading">veilguard</strong> listed with a green toggle and <strong className="text-text-heading">14 tools enabled</strong>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/cursor/step3-installed.png"
            alt="Cursor Tools & MCPs showing veilguard installed with 14 tools enabled and green toggle"
            width={1024}
            height={558}
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
          Open a new Cursor Agent chat and ask: <em className="text-text-heading">&quot;What Veilguard tools do you have access to?&quot;</em> — it should list 14 security tools. Or try: <em className="text-text-heading">&quot;Use Veilguard to do a full audit&quot;</em>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/cursor/step4-running.png"
            alt="Cursor agent chat with 'Use veilguard to do a full audit of this project' typed in the input"
            width={1024}
            height={558}
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
          In Settings → Tools &amp; MCPs, hover the veilguard row and click the <strong className="text-text-heading">pencil (edit configuration)</strong> icon. This opens <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">.cursor/mcp.json</code>. Replace the empty string on <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">VEILGUARD_KEY</code> with your license key, save, and restart Cursor.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border mb-5">
          <Image
            src="/docs/cursor/step4-edit-config.png"
            alt="Cursor Tools & MCPs showing veilguard row with edit configuration (pencil) button highlighted by an arrow"
            width={1024}
            height={558}
            className="w-full"
          />
        </div>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/cursor/step5-pro-key.png"
            alt="The mcp.json file with VEILGUARD_KEY field showing PASTE YOUR VEILGUARD KEY HERE with an arrow pointing to it"
            width={1024}
            height={558}
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
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span><code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">.cursor/mcp.json</code> is <strong>project-level</strong> — add it to each project you want protected.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>A full IDE restart is required after any config change — a window reload is not enough.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>For auto-scanning, download the <a href="https://raw.githubusercontent.com/elmimoha15/veilguard/main/templates/cursorrules.txt" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer"><code>.cursorrules</code></a> file to your project root. Without it, the tools still work but won&apos;t fire automatically.</span></li>
        </ul>
      </div>

      <div className="not-prose mt-10 flex items-center gap-4 text-sm">
        <Link href="/docs/install" className="text-text-muted hover:text-text-heading transition-colors">← All IDEs</Link>
        <Link href="/docs/install/windsurf" className="text-accent hover:underline">Windsurf →</Link>
      </div>
    </>
  );
}
