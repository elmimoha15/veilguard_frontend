import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'FAQ — Scans, Fixes & Privacy',
  description: 'Answers on how Veilguard scans your live app, what the free scan can see, unlocking fixes, false positives, and how your code and data stay private.',
  keywords: ['veilguard faq', 'app security scan questions', 'is the free scan safe', 'security scanner false positives', 'veilguard privacy'],
  alternates: { canonical: '/docs/faq' },
  openGraph: { url: 'https://veilguard.dev/docs/faq' },
};

const faqs: { section: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'Do I need to have a project open for Veilguard to work?',
        a: (
          <>
            <p className="mb-3">
              Yes — <strong className="text-text-heading">you must have a project folder open in your IDE before Veilguard will work.</strong> MCP servers run in the context of the active project directory. Without an open project there are no files to scan, and your IDE has no working directory to attach the MCP server to.
            </p>
            <p>
              If Veilguard appears unresponsive or your AI agent doesn&apos;t recognise the scanner tools, the most common cause is opening your IDE without a project folder. Close and reopen your IDE with the project folder — not just a single file.
            </p>
          </>
        ),
      },
      {
        q: 'Does Veilguard scan automatically, or do I have to ask?',
        a: (
          <p>
            You have to ask. Veilguard does not automatically scan on every file save or code change — that behaviour depends on how each AI agent interprets its rules file, and it is not reliable across all IDEs. To run a scan, tell your AI agent directly: <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">&quot;scan this file for secrets&quot;</span>, <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">&quot;check my API routes for injection vulnerabilities&quot;</span>, or <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">&quot;audit my Supabase RLS policies&quot;</span>. The agent will invoke the correct Veilguard scanner tool.
          </p>
        ),
      },
      {
        q: 'How do I know Veilguard is connected and running?',
        a: (
          <>
            <p className="mb-3">Check your IDE&apos;s MCP panel:</p>
            <ul className="list-disc list-inside space-y-1 text-text-body text-sm mb-3">
              <li><strong className="text-text-heading">Cursor:</strong> Settings → Tools &amp; MCPs — Veilguard should appear in the tool list with a green status.</li>
              <li><strong className="text-text-heading">VS Code:</strong> Open the MCP Servers view in the sidebar — Veilguard should show as running.</li>
              <li><strong className="text-text-heading">Windsurf:</strong> Click the MCP icon in the bottom status bar — Veilguard should be listed.</li>
              <li><strong className="text-text-heading">Claude Code:</strong> Run <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">claude mcp list</span> in your terminal — veilguard should appear.</li>
            </ul>
            <p>If it&apos;s not listed, check that your MCP config file has no JSON syntax errors and that you restarted your IDE after adding the config.</p>
          </>
        ),
      },
      {
        q: 'My AI agent doesn\'t seem to know about Veilguard tools.',
        a: (
          <p>
            The MCP server must be both installed and running before your AI agent can call any Veilguard tools. Confirm the server appears in your IDE&apos;s MCP panel (see above). If it&apos;s listed but the agent still doesn&apos;t use it, try explicitly naming the tool: <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">&quot;use scan_secrets to check this file&quot;</span>. If it&apos;s not listed at all, the MCP config JSON is likely malformed or in the wrong location — recheck the installation guide for your IDE.
          </p>
        ),
      },
      {
        q: 'Can I use Veilguard on an existing project that\'s already in production?',
        a: (
          <p>
            Yes. Open the project in your IDE, confirm Veilguard is connected, then ask your agent to scan the areas you&apos;re concerned about. A good starting point is to ask for a <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">scan_secrets</span> across the whole codebase, then <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">check_git</span> for anything that leaked into your git history. Pro users can run <span className="font-mono text-accent bg-accent-muted px-1.5 py-0.5 rounded text-xs">full_audit</span> to get a graded report across all 14 scanners at once.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Running Scans',
    items: [
      {
        q: 'Which files does Veilguard scan?',
        a: (
          <p>
            Veilguard scans whatever you direct your AI agent to look at. You can ask it to scan a specific file, a directory, a category of files (e.g. &quot;all API routes&quot;), or your entire project. There is no background watcher — scans are always initiated through a conversation with your AI agent.
          </p>
        ),
      },
      {
        q: 'What does "all clear" mean?',
        a: (
          <p>
            It means the files and scanners you triggered found no issues. It does <strong className="text-text-heading">not</strong> mean your entire codebase is secure — only the specific files and checks that were run are covered. For broader confidence, ask your agent to scan different areas of the project or run a full audit (Pro).
          </p>
        ),
      },
      {
        q: 'Does Veilguard modify or fix my code automatically?',
        a: (
          <p>
            No. Veilguard only reads files and reports findings — it never writes to your code. Fixes are always suggestions. You can ask your AI agent to apply a suggested fix, but the agent does that, not Veilguard itself. This keeps Veilguard&apos;s role clear: detect only, never change.
          </p>
        ),
      },
      {
        q: 'Does it work with languages other than JavaScript/TypeScript?',
        a: (
          <p>
            Secret detection (<span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">scan_secrets</span>) and git history scanning (<span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">check_git</span>) work on any file type — API keys look the same in Python, Go, or Ruby. The injection and webhook scanners are currently optimised for JavaScript/TypeScript codebases (Node.js, Next.js, Express). Supabase RLS and Firebase audits target their respective config formats and work regardless of your frontend language.
          </p>
        ),
      },
      {
        q: 'Does Veilguard work offline?',
        a: (
          <p>
            Most scanners are fully offline — they read files locally and match patterns locally. Two exceptions: the dependency CVE checker (<span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">scan_dependencies</span>) sends package names (never code) to Google&apos;s OSV.dev API, and Pro license validation checks in with veilguard.dev once per 24 hours. After a successful validation, Pro features work offline for the remainder of that 24-hour window.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Troubleshooting Setup',
    items: [
      {
        q: 'Scanners are not triggering when I ask my agent to scan.',
        a: (
          <p>
            Check three things in order: (1) A project folder is open — not just a file. (2) The MCP config JSON has no syntax errors — paste it into a JSON validator to check. (3) You restarted your IDE after adding the config. If all three are confirmed, check your IDE&apos;s MCP panel to see if the Veilguard server shows as running or errored.
          </p>
        ),
      },
      {
        q: '"Command not found" error when the MCP server tries to start.',
        a: (
          <p>
            Veilguard requires <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">Node.js 18 or later</span>. The error usually means your IDE is spawning the MCP process from a shell environment where Node is not in the PATH — common when using nvm or fnm. Run <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">node --version</span> in your IDE&apos;s integrated terminal. If it fails there but works in a regular terminal, you need to configure your shell to load nvm/fnm before your IDE starts.
          </p>
        ),
      },
      {
        q: 'My Pro key is not being recognised.',
        a: (
          <p>
            Confirm the key starts with <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">vg_live_</span>, has no leading or trailing spaces, and is placed in the <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">VEILGUARD_KEY</span> field of your MCP config&apos;s <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">env</span> block — not in the args array. Restart your IDE fully after adding it. If it still fails, your network may be blocking the one-time validation call to veilguard.dev.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Scanners & Audits',
    items: [
      {
        q: 'How do I ignore false positives?',
        a: (
          <>
            <p className="mb-3">
              Create a <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">.veilguardignore</span> file in the root of your project:
            </p>
            <pre className="text-sm font-mono text-text-body bg-background-code border border-border rounded-xl p-4 overflow-x-auto">
{`# .veilguardignore
# Ignore a specific file entirely
src/tests/mocks.ts

# Ignore a specific scanner rule across everything
- scan_secrets: stripe_test_key`}
            </pre>
          </>
        ),
      },
      {
        q: 'Is there a limit on how many full audits I can run?',
        a: (
          <p>
            No. The <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">full_audit</span> tool runs unlimited on Pro, and all 14 individual scanners run without any limit on any tier — you can run them as often as you like.
          </p>
        ),
      },
      {
        q: 'Can I run Veilguard on multiple projects with one Pro license?',
        a: (
          <p>
            The Pro license is per user, not per project. One key covers all your personal projects running on a single machine. Add the same <span className="font-mono text-accent bg-accent-muted px-1 rounded text-xs">VEILGUARD_KEY</span> to the MCP config in each project&apos;s IDE setup.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Privacy & Security',
    items: [
      {
        q: 'Does Veilguard send my code to any server?',
        a: (
          <p>
            No. All scanning happens locally on your machine. The only outbound network calls are: (1) <strong className="text-text-heading">OSV.dev</strong> — receives only package names and versions, never source code, to check for known CVEs. (2) <strong className="text-text-heading">veilguard.dev</strong> — receives only your license key for Pro validation, once per 24 hours. Your source code never leaves your machine.
          </p>
        ),
      },
      {
        q: 'Is Veilguard open source?',
        a: (
          <p>
            The Veilguard CLI and core scanners are source-available — you can read exactly what runs on your machine on{' '}
            <a href="https://github.com/elmimoha15/veilguard" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              GitHub
            </a>
            . The backend grading engine and Pro license validation are proprietary.
          </p>
        ),
      },
    ],
  },
];

export default function DocsFaqPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'FAQ & Troubleshooting', url: '/docs/faq' }]} />
      <h1 className="text-2xl font-semibold mb-3">FAQ &amp; Troubleshooting</h1>
      <p className="text-sm text-text-body mb-10">
        Common questions about setup, running scans, and how Veilguard works.
      </p>

      <div className="space-y-12 not-prose">
        {faqs.map((section) => (
          <div key={section.section}>
            <h2 className="text-base font-semibold text-text-heading border-b border-border pb-2 mb-6">
              {section.section}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.q}
                  className="group bg-background-card border border-border rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="px-6 py-4 font-medium text-text-heading cursor-pointer flex justify-between items-center outline-none text-sm">
                    {item.q}
                    <span className="transition-transform group-open:rotate-180 shrink-0 ml-4">
                      <svg fill="none" height="20" viewBox="0 0 24 24" width="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5 pt-2 text-text-body text-sm leading-relaxed border-t border-border/50">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
