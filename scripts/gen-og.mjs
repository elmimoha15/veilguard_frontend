import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const W = 1200, H = 630;

// Keyhole mark (matches public/logos/logo-icon.png): green keyhole on a dark
// disc. Drawn as vector so it stays crisp at any size.
const keyhole = (cx, cy, r) => {
  const headR = r * 0.30;
  const headCy = cy - r * 0.18;
  const stemTopY = headCy + headR * 0.55;
  const stemBotY = cy + r * 0.42;
  const topHalf = headR * 0.62;
  const botHalf = headR * 1.02;
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0D1820" stroke="rgba(52,211,153,0.25)" stroke-width="2"/>
    <circle cx="${cx}" cy="${headCy}" r="${headR}" fill="#34D399"/>
    <path d="M ${cx - topHalf} ${stemTopY}
             L ${cx + topHalf} ${stemTopY}
             L ${cx + botHalf} ${stemBotY}
             Q ${cx + botHalf} ${stemBotY + 8} ${cx + botHalf - 8} ${stemBotY + 8}
             L ${cx - botHalf + 8} ${stemBotY + 8}
             Q ${cx - botHalf} ${stemBotY + 8} ${cx - botHalf} ${stemBotY} Z"
          fill="#34D399"/>`;
};

const chip = (x, y, w, label) => `
  <rect x="${x}" y="${y}" width="${w}" height="48" rx="24"
        fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.22)" stroke-width="1.5"/>
  <text x="${x + w / 2}" y="${y + 31}" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="21" font-weight="600"
        fill="#A7F3D0">${label}</text>`;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#6EE7B7"/>
      <stop offset="60%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="18%" r="65%">
      <stop offset="0%"  stop-color="rgba(52,211,153,0.22)"/>
      <stop offset="55%" stop-color="rgba(52,211,153,0.05)"/>
      <stop offset="100%" stop-color="rgba(52,211,153,0)"/>
    </radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="rgba(148,163,184,0.10)"/>
    </pattern>
  </defs>

  <!-- base -->
  <rect width="${W}" height="${H}" fill="#080E12"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- accent edge -->
  <rect x="0" y="0" width="${W}" height="6" fill="url(#accent)"/>

  <!-- brand lockup -->
  ${keyhole(120, 96, 42)}
  <text x="182" y="112" font-family="Helvetica, Arial, sans-serif"
        font-size="44" font-weight="800" fill="#F1F5F9" letter-spacing="-1">Veilguard</text>

  <!-- headline -->
  <text x="80" y="288" font-family="Helvetica, Arial, sans-serif"
        font-size="76" font-weight="800" fill="#F1F5F9" letter-spacing="-2">Free security scanner</text>
  <text x="80" y="376" font-family="Helvetica, Arial, sans-serif"
        font-size="76" font-weight="800" letter-spacing="-2">
    <tspan fill="#F1F5F9">for</tspan><tspan dx="22" fill="url(#accent)">vibe coders</tspan>
  </text>

  <!-- subhead -->
  <text x="82" y="446" font-family="Helvetica, Arial, sans-serif"
        font-size="29" font-weight="500" fill="#94A3B8">Catch leaked API keys, SQL injection &amp; broken Supabase RLS in AI-generated code.</text>

  <!-- chips -->
  ${chip(80, 512, 188, '14 scanners')}
  ${chip(284, 512, 196, 'Free forever')}
  ${chip(496, 512, 168, 'MCP server')}
  ${chip(680, 512, 360, 'Cursor · Claude Code · Windsurf')}

  <!-- url -->
  <text x="1120" y="112" text-anchor="end" font-family="Helvetica, Arial, sans-serif"
        font-size="26" font-weight="600" fill="#34D399">veilguard.dev</text>
</svg>`;

const out = fileURLToPath(new URL('../public/og-image.png', import.meta.url));
await sharp(Buffer.from(svg)).png().toFile(out);
console.log('Wrote', out);
