import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, Easing } from 'remotion';
import { GradeRing, GradeLetter } from '@/components/app/ui';
import { SEV_COLOR, SEV_TINT } from '@/components/app/data';

/**
 * Live product demo — reproduces the REAL Veilguard content screens
 * (scan entry → ScanningScreen → ScanResultScreen → FindingDetailScreen) as a
 * clean, minimal, cinematic flow. No sidebar/logo/window chrome: just the app's
 * main content panel.
 *
 * Remotion technique: each interactive target is anchored at a fixed composition
 * coordinate. A `Camera` zooms toward that exact point (scale around a fixed
 * transform-origin, so the point stays put), the follow-along `Cursor` moves to
 * the SAME point, and the button/card is absolutely positioned centered on it —
 * so cursor, zoom and target align by construction. GradeRing/GradeLetter and the
 * SEV colour maps are the real app components/data; wrapped in `.app-theme`.
 */
const W = 1280;
const H = 800;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.inOut(Easing.cubic);
const S = { scan: 84, scanning: 78, results: 108, fix: 120 };
const OVERLAP = 10;
export const DEMO_DURATION = S.scan + S.scanning + S.results + S.fix - OVERLAP * 3;

function fade(frame: number, dur: number) {
  return Math.min(interpolate(frame, [0, 10], [0, 1], clamp), interpolate(frame, [dur - 10, dur], [1, 0], clamp));
}

/* camera: scale around a fixed focus point (that point stays put while zooming) */
function Camera({ fx, fy, zoom, children }: { fx: number; fy: number; zoom: number; children: React.ReactNode }) {
  return <AbsoluteFill style={{ transformOrigin: `${fx}px ${fy}px`, transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
}

/* follow-along cursor (overlay, NOT inside the camera, so it stays crisp + aligned) */
function Cursor({ x, y, press }: { x: number; y: number; press: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 60, pointerEvents: 'none', transform: `scale(${1 - press * 0.14})`, transformOrigin: '5px 3px' }}>
      {press > 0.01 && <span style={{ position: 'absolute', left: -12, top: -10, width: 34, height: 34, borderRadius: 999, background: 'rgba(236,78,107,0.28)', transform: `scale(${0.3 + press})`, opacity: 1 - press }} />}
      <svg width="27" height="27" viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.30))' }}>
        {/* white outline */}
        <path d="M5 2.5 L5 20.5 L9.2 16.7 L11.8 22.6 L14.6 21.3 L12.0 15.5 L17.7 15.5 Z" fill="#ffffff" />
        {/* black fill */}
        <path d="M6.4 5.1 L6.4 17.4 L9.4 14.7 L11.9 20.2 L13.1 19.6 L10.6 14.2 L14.9 14.2 Z" fill="#0A0A0A" />
      </svg>
    </div>
  );
}
function moveTo(frame: number, from: [number, number], to: [number, number], a: number, b: number): [number, number] {
  return [interpolate(frame, [a, b], [from[0], to[0]], { easing: ease, ...clamp }), interpolate(frame, [a, b], [from[1], to[1]], { easing: ease, ...clamp })];
}
function clickAt(frame: number, at: number) {
  return interpolate(frame, [at - 5, at, at + 8], [0, 1, 0], clamp);
}

/* ============ Scene 1: scan entry ============ */
const BTN1: [number, number] = [838, 388];
function SceneScan() {
  const frame = useCurrentFrame();
  const url = 'myapp.lovable.app';
  const typed = url.slice(0, Math.floor(interpolate(frame, [6, 34], [0, url.length], clamp)));
  const [cx, cy] = moveTo(frame, [700, 545], BTN1, 26, 44);
  const zoom = interpolate(frame, [44, 62], [1, 1.28], { easing: ease, ...clamp }); // zoom first
  const press = clickAt(frame, 70); // then click
  return (
    <AbsoluteFill style={{ background: '#F4F4F3' }}>
      <Camera fx={BTN1[0]} fy={BTN1[1]} zoom={zoom}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 232, textAlign: 'center' }}>
          <h2 className="font-semibold text-[27px] tracking-[-0.02em]">Scan a live URL</h2>
          <p className="text-[15.5px] text-muted mt-1">See what an attacker sees from outside, no access needed.</p>
        </div>
        {/* input field (anchored) */}
        <label style={{ position: 'absolute', left: 320, top: 360, width: 420, height: 56 }} className="flex items-center gap-[9px] bg-white rounded-[12px] px-[16px]" >
          <span className="font-mono text-tertiary text-[15px]" style={{ boxShadow: 'none' }}>https://</span>
          <span className="flex-1 text-[16px] text-ink">{typed}{frame < 38 && <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}</span>
        </label>
        <div style={{ position: 'absolute', left: 320, top: 360, width: 420, height: 56, borderRadius: 12, boxShadow: '0 0 0 2px #F3C500' }} />
        {/* Run button anchored centered on BTN1 */}
        <div style={{ position: 'absolute', left: BTN1[0] - 85, top: BTN1[1] - 28, width: 170, height: 56, transform: `scale(${1 - press * 0.05})` }} className="flex items-center justify-center bg-ink text-white rounded-[12px] text-[15.5px] font-medium">Run free scan</div>
      </Camera>
      <Cursor x={cx} y={cy} press={press} />
    </AbsoluteFill>
  );
}

/* ============ Scene 2: scanning ============ */
function SceneScanning() {
  const frame = useCurrentFrame();
  const pct = Math.round(interpolate(frame, [6, 66], [0, 100], clamp));
  const phases = ['Fetching your app', 'Checking database rules', 'Inspecting the bundle', 'Testing access control', 'Grading'];
  return (
    <AbsoluteFill style={{ background: '#F4F4F3' }} className="flex flex-col items-center justify-center">
      <GradeRing size={200} pct={pct} color="#F3C500" strokeWidth={8}>
        <span className="font-semibold text-[46px] text-ink leading-none">{pct}</span>
        <span className="font-mono text-[12px] tracking-[0.1em]" style={{ color: '#8a7400' }}>SCANNING</span>
      </GradeRing>
      <div className="w-[300px] mt-7">
        <div className="font-mono text-[15px] text-label text-center truncate">myapp.lovable.app</div>
        <div className="flex flex-col gap-[9px] mt-[22px] text-left">
          {phases.map((p, i) => {
            const done = pct > (i + 1) * 20;
            const activeP = !done && pct > i * 20;
            const color = done ? '#1F9D57' : activeP ? '#0A0A0A' : '#B0B0AC';
            return (
              <div key={p} className="flex items-center gap-[10px] text-[14.5px]" style={{ color }}>
                <span className="w-[16px] h-[16px] flex items-center justify-center shrink-0">
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-11" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <span className="rounded-full" style={{ width: activeP ? 8 : 6, height: activeP ? 8 : 6, background: activeP ? '#F3C500' : '#D8D8D4' }} />
                  )}
                </span>
                <span>{p}{done ? '' : '…'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ============ Scene 3: results ============ */
const FINDINGS = [
  { sev: 'CRITICAL' as const, title: 'Your orders table is readable by any logged-in user', cat: 'Supabase RLS' },
  { sev: 'CRITICAL' as const, title: 'Stripe secret key exposed in the page bundle', cat: 'Secrets · orders.tsx' },
  { sev: 'WARNING' as const, title: 'CORS allows requests from any origin', cat: 'Config' },
  { sev: 'PASSED' as const, title: 'HTTPS enforced across the app', cat: 'Transport' },
];
const FC: [number, number] = [640, 432]; // first (critical) finding card center
function SceneResults() {
  const frame = useCurrentFrame();
  const pop = interpolate(spring({ frame: frame - 4, fps: 30, config: { damping: 14, stiffness: 120 } }), [0, 1], [0.7, 1]);
  const [cx, cy] = moveTo(frame, [640, 150], FC, 38, 56);
  const zoom = interpolate(frame, [56, 78], [1, 1.22], { easing: ease, ...clamp }); // zoom first
  const press = clickAt(frame, 88); // then click
  return (
    <AbsoluteFill style={{ background: '#F4F4F3' }}>
      <Camera fx={FC[0]} fy={FC[1]} zoom={zoom}>
        {/* header block */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center' }}>
          <div className="flex justify-center" style={{ transform: `scale(${pop})` }}><GradeLetter letter="D" color="#E5484D" size={104} /></div>
          <div className="font-mono text-[13px] tracking-[0.1em] mt-1" style={{ color: '#C23B3F' }}>CRITICAL RISK</div>
          <h1 className="font-semibold text-[23px] tracking-[-0.02em] mt-[8px]">Your app isn&apos;t safe to charge money yet.</h1>
          <div className="text-[14.5px] text-muted mt-[2px] mb-[12px]">Just scanned myapp.lovable.app</div>
          <div className="flex gap-[8px] justify-center">
            {([['CRITICAL', '3 critical'], ['WARNING', '5 warnings'], ['PASSED', '12 passed']] as const).map(([k, t]) => (
              <span key={k} className="inline-flex items-center gap-[7px] rounded-full px-[13px] py-[6px] text-[14px] font-semibold tnum" style={{ background: SEV_TINT[k].bg, color: SEV_TINT[k].fg }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: SEV_COLOR[k] }} />{t}</span>
            ))}
          </div>
        </div>
        <div className="kicker" style={{ position: 'absolute', left: 280, top: 368 }}>Top issues</div>
        {/* finding cards anchored: first card centered on FC, rest stacked below */}
        {FINDINGS.map((f, i) => {
          const c = SEV_COLOR[f.sev];
          const o = interpolate(frame, [12 + i * 9, 26 + i * 9], [0, 1], clamp);
          const top = 399 + i * 76;
          return (
            <div key={f.title} className="vg-surface flex items-center gap-[14px] px-[18px]" style={{ position: 'absolute', left: 280, top, width: 720, height: 66, opacity: o }}>
              <span className="shrink-0 w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{f.title}</div>
                <div className="font-mono text-[12.5px] text-faint mt-[2px]">{f.cat}</div>
              </div>
              <span className="shrink-0 text-[13px] font-semibold px-[11px] py-[5px] rounded-full" style={{ background: `${c}1e`, color: c }}>{f.sev === 'CRITICAL' ? 'Critical' : f.sev === 'WARNING' ? 'Warning' : 'Passed'}</span>
            </div>
          );
        })}
      </Camera>
      <Cursor x={cx} y={cy} press={press} />
    </AbsoluteFill>
  );
}

/* ============ Scene 4: the fix ============ */
const CB: [number, number] = [322, 452]; // "Copy prompt" button center
function SceneFix() {
  const frame = useCurrentFrame();
  const rise = interpolate(spring({ frame: frame - 2, fps: 30, config: { damping: 16, stiffness: 120 } }), [0, 1], [22, 0]);
  const [cx, cy] = moveTo(frame, [560, 300], CB, 40, 56);
  const zoom = interpolate(frame, [56, 78], [1, 1.3], { easing: ease, ...clamp }); // zoom first
  const press = clickAt(frame, 90); // then click
  const copied = frame > 92;
  return (
    <AbsoluteFill style={{ background: '#F4F4F3' }}>
      <Camera fx={CB[0]} fy={CB[1]} zoom={zoom}>
        <div style={{ position: 'absolute', left: 220, top: 40, width: 840, transform: `translateY(${rise}px)` }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px] text-[13.5px] font-semibold" style={{ background: SEV_TINT.CRITICAL.bg, color: SEV_TINT.CRITICAL.fg }}><span className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: SEV_COLOR.CRITICAL }} />Serious problem, fix this first</span>
            <span className="inline-flex items-center rounded-full bg-card border border-border px-[11px] py-[5px] text-[13px] font-semibold text-muted">Supabase RLS</span>
            <span className="inline-flex items-center rounded-full bg-card border border-border px-[11px] py-[5px] text-[12.5px] font-mono font-semibold text-muted">CWE-284</span>
          </div>
          <h1 className="font-semibold text-[23px] tracking-[-0.02em] leading-[1.15] mt-3">Your orders table is readable by any logged-in user</h1>
          <p className="text-[15.5px] text-muted leading-[1.5] mt-2 max-w-[62ch]">Anyone with an account can read every customer&apos;s orders, names, emails and totals. Here&apos;s the exact fix.</p>
        </div>
        {/* dark AI-prompt panel (anchored) */}
        <div style={{ position: 'absolute', left: 220, top: 238, width: 560 }} className="relative overflow-hidden bg-ink rounded-[12px] p-[18px]">
          <div aria-hidden className="absolute inset-0 bg-dots-dark" />
          <div className="relative">
            <div className="inline-flex items-center text-ink font-semibold text-[12px] tracking-[0.04em] px-[11px] py-[5px] rounded-full" style={{ background: '#F3C500' }}>EASIEST, LET YOUR AI DO IT</div>
            <p className="text-white/80 text-[14.5px] leading-[1.5] mt-[11px] mb-[10px]">Paste this into Lovable, Cursor, or whatever you build with.</p>
            <div className="bg-ink-tile border border-white/10 rounded-lg p-3 text-[13.5px] leading-[1.5] text-[#e6e5e2]">Add a Supabase RLS policy on `orders` so each user can only read their own rows.</div>
          </div>
        </div>
        {/* Copy button anchored centered on CB */}
        <div style={{ position: 'absolute', left: CB[0] - 78, top: CB[1] - 24, width: 156, height: 48, transform: `scale(${1 - press * 0.05})` }} className="flex items-center justify-center text-ink rounded-[10px] font-medium text-[15px] z-10" >
          <span style={{ background: '#F3C500', position: 'absolute', inset: 0, borderRadius: 10 }} />
          <span className="relative">{copied ? '✓ Copied' : 'Copy prompt'}</span>
        </div>
        {/* THE FIX code block */}
        <div style={{ position: 'absolute', left: 220, top: 512, width: 560 }} className="vg-surface p-4">
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="px-[12px] py-[7px] font-mono text-[11.5px] tracking-[0.04em]" style={{ background: SEV_TINT.PASSED.bg, color: SEV_TINT.PASSED.fg }}>THE FIX</div>
            <pre className="m-0 p-3 bg-bg-soft font-mono text-[12.5px] leading-[1.6] text-[#333] whitespace-pre-wrap">{`create policy "read orders" on orders
  for select using ( auth.uid() = user_id );`}</pre>
          </div>
        </div>
      </Camera>
      <Cursor x={cx} y={cy} press={press} />
    </AbsoluteFill>
  );
}

/* ============ root ============ */
function Scene({ dur, children }: { dur: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: fade(frame, dur) }}>{children}</AbsoluteFill>;
}
export default function DashboardDemo() {
  const f2 = S.scan - OVERLAP;
  const f3 = f2 + S.scanning - OVERLAP;
  const f4 = f3 + S.results - OVERLAP;
  return (
    <AbsoluteFill className="app-theme" style={{ background: '#F4F4F3', fontFamily: 'var(--font-inter), sans-serif', width: W, height: H }}>
      <Sequence from={0} durationInFrames={S.scan}><Scene dur={S.scan}><SceneScan /></Scene></Sequence>
      <Sequence from={f2} durationInFrames={S.scanning}><Scene dur={S.scanning}><SceneScanning /></Scene></Sequence>
      <Sequence from={f3} durationInFrames={S.results}><Scene dur={S.results}><SceneResults /></Scene></Sequence>
      <Sequence from={f4} durationInFrames={S.fix}><Scene dur={S.fix}><SceneFix /></Scene></Sequence>
    </AbsoluteFill>
  );
}
