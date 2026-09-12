'use client';

import { useEffect, useRef } from 'react';
import { CenterHead } from '@/components/sections/annot/kit';
import { ActionInner } from '@/components/ui/ActionButton';

/* ---- helpers ---- */
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const CYCLE = 3800;
const usesReduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const MONO = "ui-monospace,'SF Mono',Menlo,monospace";

const FIX_PROMPT =
  'Add file upload validation to the ApiService class in frontend/src/lib/apiService.ts. Create a new uploadFile method that validates file size (max 10MB by default) and restricts file types (only image/jpeg, image/png, application/pdf by default). Throw descriptive errors if validation fails before sending to the server.';

/* The noise a normal scanner dumps on you. */
const NOISE: { id: string; text: string; sev: string }[] = [
  { id: 'CWE-89', text: 'Improper neutralization of special elements', sev: 'HIGH' },
  { id: 'CVE-2024-21538', text: 'cross-spawn ReDoS via crafted argument', sev: 'MEDIUM' },
  { id: 'A05:2021', text: 'Security Misconfiguration (OWASP Top 10)', sev: 'HIGH' },
  { id: 'HDR-004', text: 'Missing header: Content-Security-Policy', sev: 'LOW' },
  { id: 'PG-RLS-11', text: 'No RLS policy on relation public.customers', sev: 'CRITICAL' },
  { id: 'CORS-002', text: 'Access-Control-Allow-Origin set to wildcard', sev: 'MEDIUM' },
  { id: 'SEC-KEY-7', text: 'Entropy match in bundle chunk main.js', sev: 'HIGH' },
  { id: 'TLS-118', text: 'Certificate chain includes SHA-1 intermediate', sev: 'LOW' },
];

/* Ship the button + cursor CSS with the component (reliable regardless of global-CSS chunking). */
const DF_CSS = `
.vg-abtn.is-on .vg-abtn__label{transform:translateY(-140%);opacity:0}
.vg-abtn.is-on .vg-abtn__icon{transform:translateY(0)}
.vg-abtn--primary.is-on{background:#FFE24D;color:#0A0A0A}
.df-copy{position:relative}
.df-done{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px;opacity:0;color:#15803D;font-weight:500;transition:opacity .16s ease}
.df-copy.is-copied{background:#F0FDF4!important;color:#15803D!important}
.df-copy.is-copied .vg-abtn__clip{opacity:0}
.df-copy.is-copied .df-done{opacity:1}
`;

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
function Cursor() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.32))' }} aria-hidden>
      <path d="M5.6 3.2 L5.6 20.4 L10 16.1 L13.1 22.6 L15.7 21.3 L12.6 15 L18.6 14.9 Z" fill="#0A0A0A" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---- the animated Copy prompt button (cursor clicks it, flips to green "Copied") ---- */
function CopyButton() {
  const btn = useRef<HTMLButtonElement>(null);
  const cur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paint = (t: number) => {
      const A = { x: 150, y: 46 };
      const B = { x: 92, y: 14 };
      let cx = A.x;
      let cy = A.y;
      let cs = 1;
      let cop = 0;
      if (t < 0.14) {
        cop = clamp(t / 0.14);
      } else if (t < 0.34) {
        const p = easeInOut((t - 0.14) / 0.2);
        cx = lerp(A.x, B.x, p);
        cy = lerp(A.y, B.y, p);
        cop = 1;
      } else if (t < 0.88) {
        cx = B.x;
        cy = B.y;
        cop = 1;
        cs = t < 0.42 ? 0.82 : 1;
      } else {
        cx = B.x;
        cy = B.y;
        cop = clamp(1 - (t - 0.88) / 0.08);
      }
      if (cur.current) {
        cur.current.style.transform = `translate(${cx}px,${cy}px) scale(${cs})`;
        cur.current.style.opacity = String(cop);
      }
      const on = t >= 0.34 && t < 0.42;
      const copied = t >= 0.42 && t < 0.94;
      if (btn.current) {
        btn.current.classList.toggle('is-on', on);
        btn.current.classList.toggle('is-copied', copied);
        btn.current.style.transform = on ? 'scale(.97)' : 'scale(1)';
      }
    };
    if (usesReduce()) {
      paint(0.6);
      return;
    }
    let raf = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      paint(((now - start) % CYCLE) / CYCLE);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative inline-flex">
      <button ref={btn} type="button" className="vg-abtn vg-abtn--primary df-copy h-9 px-4 text-[13px] transition-transform">
        <ActionInner icon={<CopyIcon />}>Copy prompt</ActionInner>
        <span className="df-done text-[13px]"><CheckIcon /> Copied</span>
      </button>
      <div ref={cur} className="absolute left-0 top-0 z-20 pointer-events-none" style={{ opacity: 0 }}><Cursor /></div>
    </div>
  );
}

/* ---- a plain heading to differentiate the two sides ---- */
function ColHeading({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <div className="text-[14px] font-semibold" style={{ color: muted ? '#8C8C84' : '#1A1A16' }}>{children}</div>;
}

export default function Difference() {
  return (
    <section id="difference" className="an-x an-sec scroll-mt-20">
      <style dangerouslySetInnerHTML={{ __html: DF_CSS }} />
      <div className="an-max">
        <CenterHead
          eyebrow="The difference"
          title="Other scanners hand you a scary list. We hand you the fix."
          sub="Every issue comes with a plain-English explanation and the exact repair, so you know which one actually matters and exactly what to do about it."
        />

        <div className="mt-12 grid gap-12 lg:gap-0 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.28fr)] items-start">

          {/* LEFT — every other scanner */}
          <div className="lg:pr-14">
            <ColHeading muted>Every other scanner</ColHeading>
            <div className="mt-4">
              <div style={{ display: 'flex', alignItems: 'baseline', paddingBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8C8C84' }}>56 findings</span>
              </div>
              {NOISE.map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #EDECE7', padding: '10px 0' }}>
                  <span style={{ fontFamily: MONO, flex: '0 0 96px', fontSize: 11, color: '#9A9A92', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.id}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#9A9A92', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.text}</span>
                  <span style={{ fontFamily: MONO, flex: '0 0 auto', fontSize: 9, letterSpacing: '.07em', color: '#A8A8A2', background: '#F1F0EC', borderRadius: 4, padding: '3px 6px' }}>{f.sev}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #EDECE7', padding: '12px 0', fontSize: 12, color: '#B4B3AC' }}>+ 48 more findings</div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: '#8C8C84', marginTop: 18, maxWidth: '34ch' }} className="text-pretty">Identifiers, severities and a spreadsheet. Nothing telling you which one is about to cost you customers, or what to type.</p>
          </div>

          {/* RIGHT — Veilguard: the real fix page, separated by the hairline column */}
          <div className="app-theme lg:pl-14 lg:border-l border-border">
            <ColHeading>Veilguard</ColHeading>

            <div className="mt-5">
              <h1 className="text-[27px] font-medium tracking-[-0.025em] leading-[1.1]">File uploads aren&rsquo;t validated</h1>
              <p className="text-[15px] text-muted leading-[1.55] mt-[7px]">Not an emergency, but it makes you an easier target.</p>

              <div className="mt-7 mb-[6px]"><span className="font-medium text-[18px] tracking-[-0.02em]">How to fix it</span></div>
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
                  <CopyButton />
                </div>
                <div className="p-5 font-mono text-[13.5px] leading-[1.75] whitespace-pre-wrap" style={{ color: '#2f2f2c' }}>{FIX_PROMPT}</div>
              </div>

              <p className="flex items-center gap-2 text-[13.5px] text-muted mt-4">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                Once it&rsquo;s deployed, re-scan and this issue clears itself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
