import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Install Veilguard on Claude Code — Step-by-Step Guide',
  description: 'Step-by-step guide to install the Veilguard MCP security server on Claude Code with one terminal command. Also covers post-save hooks for maximum coverage.',
  openGraph: { url: 'https://veilguard.dev/docs/install/claude-code' },
};

export default function ClaudeCodeInstallPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Install on Claude Code</h1>
      <p className="text-sm text-text-body mb-8">
        Claude Code gets the most complete Veilguard integration — one terminal command adds the MCP server, plus optional post-save hooks that scan every file you save.
      </p>

      <div className="not-prose mb-6 flex items-center gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold">Prerequisite</span>
        <span>Node.js 18 or later — verify with <code className="bg-background-code px-2 py-0.5 rounded font-mono text-xs">node --version</code></span>
      </div>

      {/* Step 1 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">1</span>
          <h2 className="text-base font-semibold text-text-heading">Run one command in your terminal</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Open your terminal (inside Claude Code or externally) and run:
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl px-6 py-4 mb-5 font-mono text-sm overflow-x-auto">
          <span className="text-accent">claude</span> mcp add veilguard -- npx -y --package=veilguard veilguard-mcp
        </div>
        <p className="text-text-body mb-5 ml-11">
          This registers Veilguard as an MCP server in Claude Code. The screenshot below shows the command being typed in the Claude Code terminal.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/claude/step1-command.png"
            alt="Claude Code terminal showing the claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp command being typed"
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
          <h2 className="text-base font-semibold text-text-heading">Verify the server was added</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Run this to confirm Veilguard is registered:
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl px-6 py-4 mb-4 font-mono text-sm overflow-x-auto">
          <span className="text-accent">claude</span> mcp list
        </div>
        <p className="text-text-body ml-11">
          You should see <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">veilguard</code> in the output. Or restart Claude Code and ask Claude: <em className="text-text-heading">&quot;What Veilguard tools do you have access to?&quot;</em> — it should list 14 security tools.
        </p>
      </div>

      {/* Step 3 - Rules file */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">3</span>
          <h2 className="text-base font-semibold text-text-heading">Add the CLAUDE.md rules file (recommended)</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Download the <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">CLAUDE.md</code> template and save it to your project root:
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl px-6 py-4 mb-4 font-mono text-sm overflow-x-auto">
          <pre>{`curl -o CLAUDE.md https://raw.githubusercontent.com/elmimoha15/veilguard/main/templates/claude-md.txt`}</pre>
        </div>
        <p className="text-text-body ml-11">
          This file tells Claude exactly when to call each Veilguard tool. Without it, the tools still work but won&apos;t fire automatically — you&apos;ll need to ask manually. If you already have a <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">CLAUDE.md</code>, append the Veilguard rules to the end.
        </p>
      </div>

      {/* Step 4 - Hooks */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] font-bold flex items-center justify-center text-xs shrink-0">opt</span>
          <h2 className="text-base font-semibold text-text-heading">Add the post-edit hook for deterministic coverage</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Claude Code runs a real <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">PostToolUse</code> hook after the agent edits or writes a file. Add it to <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">.claude/settings.local.json</code> (<code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">veilguard init</code> does this for you):
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl p-6 mb-4 font-mono text-sm text-text-body overflow-x-auto">
          <pre>{`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npx -y --package=veilguard veilguard-cli scan-hook"
          }
        ]
      }
    ]
  }
}`}</pre>
        </div>
        <p className="text-text-body ml-11 text-sm text-text-muted">
          <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">scan-hook</code> scans just the changed file and stays completely silent unless it finds something — then it surfaces the alert in your chat. Claude Code has no <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">.claude/hooks.json</code> or <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">postSave</code> events.
        </p>
      </div>

      {/* Pro key */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-background-card border border-accent/50 text-accent font-bold flex items-center justify-center text-xs shrink-0">Pro</span>
          <h2 className="text-base font-semibold text-text-heading">Add your Pro key (optional)</h2>
        </div>
        <p className="text-text-body mb-4 ml-11">
          Re-register with your Pro key:
        </p>
        <div className="ml-11 bg-background-code border border-border rounded-xl px-6 py-4 mb-4 font-mono text-sm overflow-x-auto">
          <pre>{`claude mcp add veilguard --env VEILGUARD_KEY=vg_live_xxxxxxxxxxxxxxxxxxxx -- npx -y --package=veilguard veilguard-mcp`}</pre>
        </div>
        <p className="text-text-body ml-11">
          Or open <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">.claude/mcp.json</code> and add <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">VEILGUARD_KEY</code> to the <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">env</code> block manually. Get a key at <a href="https://veilguard.dev/pro" className="text-accent hover:underline">veilguard.dev/pro</a>.
        </p>
      </div>

      {/* Notes */}
      <div className="not-prose border-t border-border pt-8 mt-8">
        <h3 className="text-base font-medium text-text-heading mb-3">Notes</h3>
        <ul className="space-y-2 text-sm text-text-body">
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The MCP config is saved to <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">.claude/mcp.json</code> — project-level, add it to each project you want protected.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">quick-scan</code> in hooks uses a lightweight CLI, not the full MCP server — it&apos;s fast and silent.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>Restart Claude Code after any config change to pick up the new server.</span></li>
        </ul>
      </div>

      <div className="not-prose mt-10 flex items-center gap-4 text-sm">
        <Link href="/docs/install/vscode" className="text-text-muted hover:text-text-heading transition-colors">← VS Code</Link>
        <Link href="/docs/install" className="text-accent hover:underline">All IDEs →</Link>
      </div>
    </>
  );
}
