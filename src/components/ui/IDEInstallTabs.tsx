import CommandBox from '@/components/ui/CommandBox';

const INIT_COMMAND = 'npx -y --package=veilguard veilguard-cli init';
const CLAUDE_COMMAND = 'claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp';

const STEPS = [
  { n: 1, title: 'Run the command', desc: 'Paste it in your terminal and pick your editor when asked.' },
  { n: 2, title: 'Restart your editor', desc: 'Veilguard connects automatically — no config files to touch.' },
  { n: 3, title: 'Ask it to scan', desc: '“Scan my project for security issues.” Findings appear in chat.' },
];

export default function IDEInstallTabs() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <CommandBox command={INIT_COMMAND} />
      <p className="text-center text-sm text-text-body mt-5">
        One command sets up Cursor, Windsurf, VS Code &amp; Antigravity. No config files, no keys to start —
        it&apos;s <span className="text-text-heading">free forever</span>.
      </p>
      <p className="text-center text-xs text-text-muted mt-3">
        Run it from inside your project folder — Veilguard installs the rules into the project you&apos;re in.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-background-card border border-border rounded-xl p-5 text-left">
            <div className="w-7 h-7 rounded-full bg-accent-muted border border-accent/30 grid place-items-center text-accent font-semibold text-sm mb-3">
              {s.n}
            </div>
            <div className="text-sm font-medium text-text-heading mb-1">{s.title}</div>
            <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-background-card border border-border rounded-xl px-5 py-5">
        <CommandBox command={CLAUDE_COMMAND} label="Claude Code" />
      </div>
    </div>
  );
}
