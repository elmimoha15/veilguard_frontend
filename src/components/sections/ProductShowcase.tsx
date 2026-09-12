'use client';

import { useState } from 'react';
import { CenterHead } from '@/components/sections/annot/kit';
import Logo from '@/components/ui/Logo';
import { Card, GradeSquare, GradeChip, SeverityChip, SeverityTiles, AreaTrend, Heatmap, ProgressBar, PillButton, SectionLabel, Segmented } from '@/components/app/primitives';
import { SEV_COLOR, SEV_TINT, GRADE_TINT, type Grade, type Sev } from '@/components/app/data';

type Tab = 'overview' | 'findings' | 'fix';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'findings', label: 'Findings' },
  { id: 'fix', label: 'The fix' },
];

/* ---------- shared sidebar (no user footer, generic repo names) ---------- */
const SIDE_APPS: { name: string; grade: Grade; crit: number }[] = [
  { name: 'quik-threads', grade: 'C', crit: 2 },
  { name: 'lently', grade: 'F', crit: 3 },
  { name: 'veilguard.dev', grade: 'B', crit: 0 },
];
const NAV: { id: string; label: string; icon: React.ReactNode; count?: number; forNav: 'overview' | 'apps' | 'alerts' | 'billing' | 'settings' }[] = [
  { id: 'overview', label: 'Overview', icon: <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />, forNav: 'overview' },
  { id: 'apps', label: 'My apps', icon: <><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></>, count: 4, forNav: 'apps' },
  { id: 'alerts', label: 'Alerts', icon: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a1.8 1.8 0 0 0 3 0" />, forNav: 'alerts' },
];
const ACCOUNT: { label: string; icon: React.ReactNode }[] = [
  { label: 'Billing', icon: <><rect x="3" y="6" width="18" height="12" rx="2.4" /><path d="M3 10h18" /></> },
  { label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></> },
];

function Sidebar({ tab }: { tab: Tab }) {
  const active = tab === 'overview' ? 'overview' : 'apps';
  const row = (label: string, icon: React.ReactNode, on: boolean, count?: number) => (
    <div key={label} className="flex items-center gap-3 rounded-[8px] px-[10px] py-[8px] text-[14px]" style={{ background: on ? 'var(--color-bg-soft)' : undefined, color: on ? '#0A0A0A' : '#525252', fontWeight: on ? 600 : 500 }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-[12.5px] tnum" style={{ color: '#A3A3A3' }}>{count}</span>}
    </div>
  );
  return (
    <aside className="hidden min-[900px]:flex w-[228px] shrink-0 flex-col gap-[1px] border-r border-border bg-white px-3 py-4">
      <div className="px-[6px] pt-[2px] pb-4"><Logo size={22} /></div>
      {NAV.map((n) => row(n.label, n.icon, n.forNav === active, n.count))}
      <div className="text-[13px] px-[10px] pt-[22px] pb-2" style={{ color: '#A3A3A3' }}>Your apps</div>
      <div className="flex flex-col gap-[1px]">
        {SIDE_APPS.map((a) => (
          <div key={a.name} className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[7px] text-[14px]" style={{ color: '#525252', fontWeight: 500 }}>
            <GradeChip grade={a.grade} />
            <span className="flex-1 truncate">{a.name}</span>
            {a.crit > 0 && <span className="text-[12.5px] tnum" style={{ color: '#DC2626' }}>{a.crit}</span>}
          </div>
        ))}
        <div className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[7px] text-[13px]" style={{ color: '#A3A3A3', fontWeight: 500 }}><span className="w-[19px] text-center">⋯</span> 1 more</div>
        <div className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[7px] text-[14px]" style={{ color: '#A3A3A3', fontWeight: 500 }}><span className="w-[19px] text-center">＋</span> Add app</div>
      </div>
      <div className="w-full mt-[18px] h-11 rounded-full bg-ink text-white text-[14px] font-normal flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /></svg>
        New scan
      </div>
      <div className="text-[13px] px-[10px] pt-[20px] pb-2" style={{ color: '#A3A3A3' }}>Account</div>
      {ACCOUNT.map((a) => row(a.label, a.icon, false))}

      {/* account footer + log out, pinned to the bottom of the sidebar */}
      <div className="mt-auto flex flex-col gap-[6px] pt-[18px]">
        <div className="flex items-center gap-[10px] px-[6px] py-[6px] min-w-0">
          <span className="w-8 h-8 rounded-full bg-bg-soft border border-border flex items-center justify-center text-[12px] font-semibold shrink-0" style={{ color: '#737373' }}>YO</span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-ink truncate">you@company.com</span>
            <span className="block text-[11.5px] truncate" style={{ color: '#A3A3A3' }}>Signed in</span>
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] px-[10px] py-[8px] text-[14px]" style={{ color: '#737373', fontWeight: 500 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" /></svg>
          Log out
        </div>
      </div>
    </aside>
  );
}

function TopBar({ crumb }: { crumb: string }) {
  return (
    <div className="flex items-center h-[52px] px-[22px] border-b border-border shrink-0">
      <span className="text-[14px]" style={{ color: '#A3A3A3' }}>Veilguard <span className="mx-1">/</span> <span className="text-ink font-normal">{crumb}</span></span>
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-[6px] font-normal text-[13.5px] mb-5" style={{ color: '#737373' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {label}
    </div>
  );
}

/* ============================ Overview view ============================ */
function OverviewView() {
  return (
    <div>
      <h1 className="text-[29px] font-normal tracking-[-0.035em] leading-[1.1]">Overview</h1>
      <p className="text-[14px] mt-[7px]" style={{ color: '#737373' }}>Your progress and what to do next.</p>

      <div className="mt-7 grid min-[1080px]:grid-cols-[minmax(0,1fr)_300px] items-start divide-y min-[1080px]:divide-y-0 min-[1080px]:divide-x divide-border">
        <div className="flex flex-col min-[1080px]:pr-8">
          <Card flat className="py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-normal tracking-[-0.02em]">You&rsquo;ve fixed <span className="tnum">7</span> of <span className="tnum">25</span>, <span className="tnum">18</span> to go</h2>
                <p className="text-[13.5px] mt-[3px]" style={{ color: '#737373' }}>Keep going, you&rsquo;re making real progress.</p>
              </div>
              <GradeSquare grade="F" size={40} className="shrink-0" />
            </div>
            <div className="mt-5"><ProgressBar value={7} total={25} /></div>
            <div className="flex items-center justify-between mt-[8px]">
              <span className="text-[12.5px]" style={{ color: '#A3A3A3' }}>28% resolved</span>
              <span className="text-[12.5px] font-normal" style={{ color: '#15803D' }}>&#9650; 3 fixed since last scan</span>
            </div>
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--color-hairline)' }}>
              <div className="text-[13.5px] font-normal">Issues resolved over time</div>
              <div className="text-[12px] mt-[1px]" style={{ color: '#A3A3A3' }}>Total fixes, up and to the right is good.</div>
              <div className="mt-4"><AreaTrend points={[0, 1, 1, 2, 3, 3, 4, 5, 6, 7]} color="#16A34A" reduce /></div>
            </div>
          </Card>

          {/* fix these first — fills the panel below the chart */}
          <Card flat className="py-7 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-normal">Fix these first</h2>
              <span className="text-[13px]" style={{ color: '#A3A3A3' }}>See all issues</span>
            </div>
            <div className="flex flex-col">
              {([
                ['CRITICAL', 'A database connection string with a password is exposed', 'quik-threads'],
                ['WARNING', 'File uploads aren’t validated', 'quik-threads'],
                ['WARNING', '“VITE_POLAR_ACCESS_TOKEN” is exposed to the browser', 'lently'],
              ] as const).map(([sev, title, app], i) => (
                <div key={title} className="flex items-start gap-3 py-[13px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                  <span className="pt-[1px]"><SeverityChip sev={sev as Sev} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-normal">{title}</div>
                    <div className="text-[12.5px] mt-[2px] truncate" style={{ color: '#A3A3A3' }}>{app}</div>
                  </div>
                  <PillButton className="shrink-0 h-9 px-4" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Fix</PillButton>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col divide-y divide-border border-t border-border pt-7 min-[1080px]:border-t-0 min-[1080px]:pt-0 min-[1080px]:border-l min-[1080px]:pl-8">
          <Card flat className="pb-7">
            <h3 className="text-[15px] font-normal">Scan activity</h3>
            <p className="text-[13px] mt-[1px]" style={{ color: '#A3A3A3' }}>Last 28 days</p>
            <div className="mt-4"><Heatmap data={[0, 1, 0, 1, 0, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3]} /></div>
            <div className="flex items-center justify-between mt-4 font-mono text-[10.5px]" style={{ color: '#A3A3A3' }}>
              <span>28d ago</span>
              <span className="flex items-center gap-[3px]">{['#F2F2F2', '#D7EFDF', '#93D6B0', '#3EAE71', '#15803D'].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: 2, background: c }} />)}</span>
              <span>today</span>
            </div>
          </Card>
          <Card flat className="py-7">
            <h3 className="text-[15px] font-normal">Recent scans</h3>
            <div className="flex flex-col mt-1">
              {([['quik-threads', 'Deep · 2h ago', 'C'], ['lently', 'Deep · 6h ago', 'F'], ['veilguard.dev', 'URL · 1d ago', 'B'], ['checkout-api', 'Deep · 2d ago', 'D']] as const).map(([name, meta, g], i) => (
                <div key={name + meta} className="flex items-center gap-3 py-[11px]" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
                  <GradeSquare grade={g as Grade} size={26} />
                  <span className="flex-1 min-w-0"><span className="block text-[13px] font-normal truncate">{name}</span><span className="block text-[11.5px] mt-[1px]" style={{ color: '#A3A3A3' }}>{meta}</span></span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


/* ============================ Findings view ============================ */
const FINDINGS: { sev: Sev; title: string; what: string; cat: string; where: string }[] = [
  { sev: 'CRITICAL', title: 'A private key (service-account credential) is exposed', what: 'Your .env ships a real Firebase private key; anyone who sees it gets full access to your backend and data.', cat: 'Secrets', where: 'quikthread-backend/.env:10' },
  { sev: 'CRITICAL', title: 'Supabase orders table is world-readable', what: 'Row-level security is off, so anyone with the public key can read every customer order.', cat: 'Database (RLS)', where: 'quikthread-backend/db/policies.sql' },
  { sev: 'WARNING', title: "File uploads aren't validated", what: "This upload handler doesn't restrict file type or file size, so attackers can upload malicious or oversized files.", cat: 'Business logic', where: 'frontend/src/lib/apiService.ts' },
  { sev: 'WARNING', title: '"VITE_POLAR_ACCESS_TOKEN" is a secret exposed to the browser', what: 'Variables with a public prefix are bundled into your client JavaScript, so this "secret" is visible to every visitor.', cat: 'Platform', where: 'frontend/.env.example' },
  { sev: 'WARNING', title: 'A .env file with real values is committed', what: 'Environment files hold secrets; committing one puts them in your git history forever.', cat: 'Secrets', where: 'quikthread-backend/.env' },
];
function FindingsView() {
  return (
    <div>
      <BackLink label="My apps" />
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[29px] font-normal tracking-[-0.035em] leading-[1.1]">quik-threads</h1>
          <p className="text-muted mt-[7px] text-[13px] font-mono">github.com/quik-threads</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <PillButton variant="outline" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Report (PDF)</PillButton>
          <span className="w-[18px] h-[18px] rounded-full border border-border text-[11px] font-bold text-tertiary flex items-center justify-center leading-none">?</span>
          <GradeSquare grade="C" size={42} />
        </div>
      </div>

      <div className="mb-6">
        <Segmented
          options={[{ id: 'overview', label: 'Overview' }, { id: 'findings', label: <span className="inline-flex items-center gap-[7px]">Findings<span className="tnum text-[11px] font-normal px-[7px] py-[1px] rounded-[6px]" style={{ background: '#FEF2F2', color: '#DC2626' }}>2</span></span> }, { id: 'monitoring', label: 'Monitoring' }] as const}
          value="findings"
          onChange={() => {}}
        />
      </div>

      <div className="mb-4 inline-flex items-center gap-[10px] bg-card border border-border rounded-[12px] px-4 py-[9px] min-w-[260px]">
        <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-normal text-[16px] tnum" style={{ background: GRADE_TINT.C.bg, color: GRADE_TINT.C.fg }}>C</span>
        <span className="flex-1 text-left">
          <span className="block text-[14.5px] font-normal">Sep 4, 2026 · 1:40 PM</span>
          <span className="block font-mono text-[11.5px] text-faint">Latest scan · done</span>
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#9B9B96" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      <Card flat className="py-7 border-t border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-[16px] font-normal">Findings summary</h2>
          <PillButton icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.7" /></svg>}>Copy all fixes</PillButton>
        </div>
        <SeverityTiles critical={2} warnings={3} passed={0} />
      </Card>

      <Card flat className="py-7 border-t border-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-normal">Findings</h2>
          <span className="tnum text-[13px]" style={{ color: '#A3A3A3' }}>5</span>
        </div>
        <div className="flex flex-col">
          {FINDINGS.map((f, i) => (
            <div key={f.title} className="flex items-start gap-3 w-full py-[14px] text-left" style={{ borderTop: i === 0 ? undefined : '1px solid #F4F4F4' }}>
              <span className="pt-[1px]"><SeverityChip sev={f.sev} /></span>
              <div className="flex-1 min-w-0">
                <div className="font-normal text-[14.5px]">{f.title}</div>
                <p className="text-[13px] leading-[1.55] mt-[3px]" style={{ color: '#737373' }}>{f.what}</p>
                <div className="font-mono text-[11.5px] mt-[4px] truncate" style={{ color: '#A3A3A3' }}>{f.cat} · {f.where}</div>
              </div>
              <span className="pt-[2px]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#C7C7C2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================== Fix view ============================== */
function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <span className={`inline-flex items-center rounded-full bg-card border border-border px-[11px] py-[5px] text-[13px] font-normal text-muted ${mono ? 'font-mono text-[12.5px]' : ''}`}>{children}</span>;
}
const FIX_PROMPT = 'Remove the FIREBASE_PRIVATE_KEY line from the .env file entirely. Update the code to load Firebase credentials from a secure source: either from a FIREBASE_CREDENTIALS_PATH pointing to a file outside version control, or from environment variables managed by the deployment platform (GitHub Secrets, Vercel, etc.). Add a comment explaining that private keys must never be stored in .env files.';

function FixView() {
  const sev: Sev = 'CRITICAL';
  return (
    <div className="max-w-[900px]">
      <BackLink label="Back to all issues" />
      <div className="flex items-center gap-2 flex-wrap mb-[12px]">
        <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px] text-[13.5px] font-normal" style={{ background: SEV_TINT[sev].bg, color: SEV_TINT[sev].fg }}>
          <span className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR[sev] }} />
          Serious problem, fix this first
        </span>
        <Chip>Secrets</Chip>
        <Chip mono>CWE-798</Chip>
      </div>
      <h1 className="text-[30px] font-medium tracking-[-0.025em] leading-[1.1] max-w-[64ch]">A private key (service-account credential) is exposed</h1>
      <p className="text-[15px] text-muted leading-[1.55] mt-[7px] max-w-[68ch]">Someone could actually get to your customers&rsquo; data right now.</p>

      <div className="grid sm:grid-cols-2 mt-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="py-5 sm:py-0 sm:pr-7">
          <SectionLabel className="mb-3">Why it matters</SectionLabel>
          <p className="m-0 text-[15px] leading-[1.6]" style={{ color: '#3b3a37' }}>Your .env file contains a placeholder for a real Firebase private key, a secret credential that grants full access to your Firebase services. If this file is ever committed to version control or exposed, an attacker can impersonate your application and access all your data. Private keys should never be stored in .env files checked into git; they must be managed through secure secrets management.</p>
        </div>
        <div className="py-5 sm:py-0 sm:pl-7">
          <div className="flex items-start justify-between gap-2">
            <SectionLabel className="mb-3">Where we found it</SectionLabel>
            <span className="shrink-0 -mt-1 -mr-1 p-[6px] rounded-[8px] text-tertiary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
          </div>
          <p className="m-0 text-[14px] leading-[1.6] font-mono break-words" style={{ color: '#3b3a37' }}>quikthread-backend/.env:10</p>
          <pre className="m-0 mt-3 p-3 bg-bg-soft border border-border rounded-lg font-mono text-[13px] leading-[1.6] text-faint overflow-x-auto whitespace-pre-wrap break-words">-----BEGI…****** (redacted)</pre>
        </div>
      </div>

      <div className="mt-9 mb-[6px]"><span className="font-medium text-[18px] tracking-[-0.02em]">How to fix it</span></div>
      <p className="text-[14px] text-muted mb-4">Two ways. Hand it to your AI, or paste the code yourself.</p>

      <div className="overflow-hidden border-y border-border">
        <div className="flex items-center justify-between gap-3 px-4 py-[11px]" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
          <div className="inline-flex items-center gap-1 rounded-[10px] p-1" style={{ background: '#F2F2EF' }}>
            <span className="inline-flex items-center gap-[7px] rounded-[8px] px-[12px] py-[7px] text-[13px] font-normal" style={{ background: '#fff', color: '#0A0A0A', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.6L18 9.4l-4.2 2.9.8 4.7L12 14.8 9.4 17l.8-4.7L6 9.4l4.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              Prompt for your AI
            </span>
            <span className="inline-flex items-center gap-[7px] rounded-[8px] px-[12px] py-[7px] text-[13px] font-normal" style={{ color: '#737373' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              The exact code
            </span>
          </div>
          <PillButton icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}>Copy prompt</PillButton>
        </div>
        <div className="p-5 font-mono text-[13.5px] leading-[1.75] whitespace-pre-wrap" style={{ color: '#2f2f2c' }}>{FIX_PROMPT}</div>
      </div>

      <p className="flex items-center gap-2 text-[13.5px] text-muted mt-4">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        Once it&rsquo;s deployed, re-scan and this issue clears itself.
      </p>
    </div>
  );
}

/* ============================= Section ============================= */
const CRUMB: Record<Tab, string> = { overview: 'Overview', findings: 'quik-threads', fix: 'Finding' };

export default function ProductShowcase() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <section id="product" className="an-sec scroll-mt-20">
      <style dangerouslySetInnerHTML={{ __html: '@keyframes smFade{from{opacity:0}to{opacity:1}}.sm-fade{animation:smFade .12s ease both}.sm-fade h1,.sm-fade h2,.sm-fade h3{font-weight:400!important}@media(prefers-reduced-motion:reduce){.sm-fade{animation:none}}' }} />
      <div className="an-max an-x">
        <CenterHead eyebrow="The product" title="Everything you need to ship safely." sub="Track your security posture, understand every finding in plain English, and get the exact fix, without slowing your team down." />

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white p-1">
            {TABS.map((t) => {
              const on = t.id === tab;
              return (
                <button key={t.id} type="button" onClick={() => setTab(t.id)} className="rounded-full px-4 h-9 text-[13.5px] font-medium transition-colors" style={on ? { background: '#0A0A0A', color: '#fff' } : { color: '#6E6E6A' }}>{t.label}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 mx-auto w-full max-w-[1480px] px-3 sm:px-4">
        <div className="app-theme select-none overflow-hidden rounded-[20px] border border-[#ECEBE7] bg-white shadow-[0_40px_100px_-55px_rgba(0,0,0,0.45)]">
          <div className="flex h-[840px]">
            <Sidebar tab={tab} />
            <div className="relative flex-1 min-w-0 flex flex-col">
              <TopBar crumb={CRUMB[tab]} />
              <div key={tab} className="sm-fade flex-1 overflow-hidden p-5 sm:p-7 pointer-events-none">
                {tab === 'overview' && <OverviewView />}
                {tab === 'findings' && <FindingsView />}
                {tab === 'fix' && <FixView />}
              </div>
              {/* white vintage fade at the bottom of every tab */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
