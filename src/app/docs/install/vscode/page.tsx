import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import RulesFileStep from '@/components/ui/RulesFileStep';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Install Veilguard on VS Code — Step-by-Step Guide',
  description: 'Step-by-step guide to install the Veilguard MCP security server on VS Code using the Command Palette MCP: Add Server flow. No JSON editing required.',
  alternates: { canonical: '/docs/install/vscode' },
  openGraph: { url: 'https://veilguard.dev/docs/install/vscode' },
};

export default function VSCodeInstallPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'Install', url: '/docs/install' }, { name: 'VS Code', url: '/docs/install/vscode' }]} />
      <h1 className="text-2xl font-semibold mb-2">Install on VS Code</h1>
      <p className="text-sm text-text-body mb-8">
        VS Code has a built-in MCP wizard — no JSON editing required. Follow the Command Palette prompts and Veilguard installs in under a minute.
      </p>

      <div className="not-prose mb-3 flex items-center gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold">Prerequisite</span>
        <span>Node.js 18 or later — verify with <code className="bg-background-code px-2 py-0.5 rounded font-mono text-xs">node --version</code></span>
      </div>

      <div className="not-prose mb-6 flex items-start gap-3 bg-background-card border border-border rounded-xl px-5 py-3 text-sm text-text-body">
        <span className="text-accent font-mono font-semibold shrink-0">First</span>
        <span>Open the project you want to protect in VS Code before you start. The server is shared across projects, but the security rules (Step 8) are saved <strong className="text-text-heading">inside the open project</strong>, so make sure it&apos;s the right one.</span>
      </div>

      {/* Step 1 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">1</span>
          <h2 className="text-base font-semibold text-text-heading">Open the Command Palette → MCP: Add Server</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Press <kbd className="bg-background-code border border-border rounded px-2 py-0.5 text-xs font-mono">Ctrl + Shift + P</kbd> (or <kbd className="bg-background-code border border-border rounded px-2 py-0.5 text-xs font-mono">Cmd + Shift + P</kbd> on Mac) to open the Command Palette. Type <strong className="text-text-heading">MCP</strong> and select <strong className="text-text-heading">MCP: Add Server...</strong>
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step1-command-palette.png"
            alt="VS Code Command Palette with MCP typed, showing MCP: Add Server... highlighted with an arrow"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">2</span>
          <h2 className="text-base font-semibold text-text-heading">Choose <strong>NPM Package</strong> as the server type</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          VS Code asks you to choose the type of MCP server to add. Select <strong className="text-text-heading">NPM Package</strong> — <em>Install from an NPM package name</em>. This is the Model Assisted option highlighted in blue.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step2-npm-package.png"
            alt="VS Code MCP server type picker with NPM Package option highlighted in blue and arrow pointing to it"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">3</span>
          <h2 className="text-base font-semibold text-text-heading">Enter the package name: <code className="text-lg">veilguard</code></h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          VS Code prompts <strong className="text-text-heading">Enter NPM Package Name</strong>. Type <code className="bg-background-code px-2 py-0.5 rounded text-sm font-mono">veilguard</code> and press <kbd className="bg-background-code border border-border rounded px-2 py-0.5 text-xs font-mono">Enter</kbd>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step3-package-name.png"
            alt="VS Code Enter NPM Package Name prompt with veilguard typed in"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 4 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">4</span>
          <h2 className="text-base font-semibold text-text-heading">Click <strong>Allow</strong> to confirm the install</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          VS Code shows a confirmation prompt: <em>&quot;Install veilguard@x.x.x from elmimoha15?&quot;</em>. Click <strong className="text-text-heading">Allow</strong>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step4-allow.png"
            alt="VS Code dialog asking to install veilguard from veilguard.co with Allow highlighted"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 5 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">5</span>
          <h2 className="text-base font-semibold text-text-heading">Enter the Server ID: <code className="text-lg">veilguard</code></h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          VS Code prompts for a unique identifier for this server. Type <code className="bg-background-code px-2 py-0.5 rounded text-sm font-mono">veilguard</code> and press <kbd className="bg-background-code border border-border rounded px-2 py-0.5 text-xs font-mono">Enter</kbd>.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step5-server-id.png"
            alt="VS Code Enter Server ID prompt with veilguard typed in"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 6 */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">6</span>
          <h2 className="text-base font-semibold text-text-heading">Select <strong>Global</strong> as the configuration target</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          VS Code asks where to save the MCP config. Choose <strong className="text-text-heading">Global</strong> — <em>Available in all workspaces, runs locally</em> — so Veilguard protects every project automatically.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step6-global.png"
            alt="VS Code Add MCP Server scope picker with Global option highlighted in blue"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 7 - Verify */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent text-[#080E12] font-bold flex items-center justify-center text-sm shrink-0">7</span>
          <h2 className="text-base font-semibold text-text-heading">Verify it&apos;s running</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Open your <code className="bg-background-code px-1 rounded text-xs font-mono">mcp.json</code> — you should see the <strong className="text-text-heading">Running | Stop | Restart | 14 tools</strong> status inline above the veilguard block. Then open a GitHub Copilot agent chat and ask it to run a full audit to confirm all tools are working.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border mb-5">
          <Image
            src="/docs/vscode/step8-running.png"
            alt="VS Code mcp.json file open showing veilguard server with Running status and 14 tools inline"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step7b-verify.png"
            alt="VS Code GitHub Copilot agent chat running a Veilguard full audit and showing full_audit tool results"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
      </div>

      {/* Step 8 - Rules file */}
      <RulesFileStep stepNumber={8} agentName="GitHub Copilot">
        <p className="text-text-body mb-2">
          GitHub Copilot reads its project instructions from a file at <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">.github/copilot-instructions.md</code>. In VS Code, create a folder named <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">.github</code> in your project&apos;s top folder, and inside it create a file named <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">copilot-instructions.md</code>. Hit <strong className="text-text-heading">Copy</strong> below, paste it all in, and save.
        </p>
        <p className="text-text-muted text-sm">
          Copilot picks it up automatically on your next agent chat. (If it doesn&apos;t, check that <code className="bg-background-code px-1.5 py-0.5 rounded text-xs font-mono">github.copilot.chat.codeGeneration.useInstructionFiles</code> is enabled in VS Code settings — it&apos;s on by default.)
        </p>
      </RulesFileStep>

      {/* Pro key */}
      <div className="not-prose mb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-background-card border border-accent/50 text-accent font-bold flex items-center justify-center text-xs shrink-0">Pro</span>
          <h2 className="text-base font-semibold text-text-heading">Add your Pro key (optional)</h2>
        </div>
        <p className="text-text-body mb-5 ml-11">
          Open your <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">mcp.json</code> (VS Code opens it automatically after install, or find it at <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">~/.config/Code/User/mcp.json</code>). Replace the empty string on <code className="bg-background-code px-1.5 py-0.5 rounded text-sm font-mono">VEILGUARD_KEY</code> with your license key and save — the server restarts automatically.
        </p>
        <div className="ml-11 rounded-xl overflow-hidden border border-border">
          <Image
            src="/docs/vscode/step8-running.png"
            alt="VS Code mcp.json showing the VEILGUARD_KEY field with Running status and 14 tools indicator"
            width={1024}
            height={575}
            className="w-full"
          />
        </div>
        <p className="text-text-muted text-sm ml-11 mt-4">
          Get a Pro key at <a href="https://veilguard.dev/pro" className="text-accent hover:underline">veilguard.dev/pro</a>. The server restarts automatically when you save.
        </p>
      </div>

      {/* Notes */}
      <div className="not-prose border-t border-border pt-8 mt-8">
        <h3 className="text-base font-medium text-text-heading mb-3">Notes</h3>
        <ul className="space-y-2 text-sm text-text-body">
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>VS Code stores the global MCP config at <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">~/.config/Code/User/mcp.json</code> on Linux, <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">~/Library/Application Support/Code/User/mcp.json</code> on macOS.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The <code className="bg-background-code px-1 py-0.5 rounded text-xs font-mono">.github/copilot-instructions.md</code> file (Step 8) is what makes scans fire automatically in Copilot agent mode — add it to every project you want continuously protected.</span></li>
          <li className="flex items-start gap-2"><span className="text-accent shrink-0">•</span><span>The MCP server requires GitHub Copilot or another MCP-compatible AI extension to call the tools.</span></li>
        </ul>
      </div>

      <div className="not-prose mt-10 flex items-center gap-4 text-sm">
        <Link href="/docs/install/windsurf" className="text-text-muted hover:text-text-heading transition-colors">← Windsurf</Link>
        <Link href="/docs/install/claude-code" className="text-accent hover:underline">Claude Code →</Link>
      </div>
    </>
  );
}
