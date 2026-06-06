// Single source of truth for the supported IDEs. Used by the /start onboarding
// flow; the docs install index (src/app/docs/install/page.tsx) and the homepage
// IDEInstallTabs hold the same values and can be migrated to import from here.

export type IdeId = 'cursor' | 'claude-code' | 'windsurf' | 'vscode' | 'antigravity';

export interface Ide {
  id: IdeId;
  name: string;
  /** Step-by-step guide with screenshots. */
  guideHref: string;
  /** Where the MCP config lives for this IDE. */
  configPath: string;
  /** One-line description of the install method. */
  method: string;
  /** Optional highlight badge. */
  badge: string | null;
  /** Tailwind classes for the badge (matches docs/install/page.tsx). */
  badgeColor: string;
  /** Claude Code is the only IDE with a single-command install. */
  claudeCommand?: string;
}

export const IDES: Ide[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    guideHref: '/docs/install/cursor',
    configPath: '.cursor/mcp.json',
    method: 'Create one JSON file, restart',
    badge: 'Best experience',
    badgeColor: 'text-accent bg-accent-muted border-accent/20',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    guideHref: '/docs/install/claude-code',
    configPath: '.claude/mcp.json',
    method: 'One terminal command',
    badge: 'Most coverage',
    badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
    claudeCommand: 'claude mcp add veilguard -- npx -y --package=veilguard veilguard-mcp',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    guideHref: '/docs/install/windsurf',
    configPath: '~/.windsurf/mcp_config.json',
    method: 'Edit global config, restart',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    guideHref: '/docs/install/vscode',
    configPath: '~/.config/Code/User/mcp.json',
    method: 'Command Palette wizard — no JSON editing',
    badge: 'Easiest setup',
    badgeColor: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20',
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    guideHref: '/docs/install/antigravity',
    configPath: '~/.gemini/antigravity/mcp_config.json',
    method: 'Edit global config, click Refresh',
    badge: null,
    badgeColor: '',
  },
];

export function getIde(id: string | null | undefined): Ide | undefined {
  return IDES.find((ide) => ide.id === id);
}

// The MCP config block — identical across IDEs except for where the file lives.
// Matches the canonical form used in the install guides and IDEInstallTabs.
export const MCP_CONFIG = `{
  "mcpServers": {
    "veilguard": {
      "command": "npx",
      "args": ["-y", "--package=veilguard", "veilguard-mcp"],
      "env": { "VEILGUARD_KEY": "" }
    }
  }
}`;

// localStorage key remembering the user's editor choice across visits.
export const IDE_STORAGE_KEY = 'veilguard:ide';
