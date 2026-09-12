'use client';

import { useEffect, useRef } from 'react';
import { CenterHead } from '@/components/sections/annot/kit';
import { ActionInner } from '@/components/ui/ActionButton';
import { BrandLogo } from '@/components/ui/BrandLogo';

/* ---- helpers ---- */
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const CYCLE = 4200;
const usesReduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function Cursor() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.32))' }} aria-hidden>
      <path d="M5.6 3.2 L5.6 20.4 L10 16.1 L13.1 22.6 L15.7 21.3 L12.6 15 L18.6 14.9 Z" fill="#0A0A0A" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Fade = () => <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />;

/* Ship the demo's button CSS with the component (reliable regardless of global-CSS chunking). */
const SM_CSS = `
.vg-abtn.is-on .vg-abtn__label{transform:translateY(-140%);opacity:0}
.vg-abtn.is-on .vg-abtn__icon{transform:translateY(0)}
.vg-abtn--primary.is-on{background:#FFE24D;color:#0A0A0A}
.vg-abtn--green{background:#16A34A;color:#fff}
.vg-abtn--green:not(:disabled):hover{background:#15803D;color:#fff}
.vg-abtn--green.is-on{background:#F0FDF4;color:#15803D}
`;

/* ============================= URL demo ============================= */
function UrlDemo() {
  const txt = useRef<HTMLSpanElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const URL = 'invoicekit.lovable.app';

  useEffect(() => {
    const paint = (t: number) => {
      if (txt.current) txt.current.textContent = URL.slice(0, Math.round(clamp(t / 0.36) * URL.length));
      const A = { x: 214, y: 44 };
      const B = { x: 198, y: 100 }; // right side of the Scan button, clear of the text
      let cx = A.x;
      let cy = A.y;
      let cs = 1;
      let cop = 0;
      if (t >= 0.42 && t < 0.6) {
        const p = easeInOut((t - 0.42) / 0.18);
        cx = lerp(A.x, B.x, p);
        cy = lerp(A.y, B.y, p);
        cop = 1;
      } else if (t >= 0.6) {
        cx = B.x;
        cy = B.y;
        cop = t < 0.94 ? 1 : clamp(1 - (t - 0.94) / 0.06);
        cs = t >= 0.6 && t < 0.68 ? 0.82 : 1;
      }
      if (cur.current) {
        cur.current.style.transform = `translate(${cx}px,${cy}px) scale(${cs})`;
        cur.current.style.opacity = String(cop);
      }
      const on = t >= 0.6 && t < 0.92;
      const pressed = t >= 0.6 && t < 0.68;
      if (btn.current) {
        btn.current.classList.toggle('is-on', on);
        btn.current.style.transform = pressed ? 'scale(.97)' : 'scale(1)';
      }
    };
    if (usesReduce()) {
      paint(0.5);
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
    <div className="relative mx-auto flex h-[180px] w-full max-w-[260px] items-center overflow-hidden">
      <div className="w-full">
        <div className="flex items-center gap-1.5 border-b border-border pb-2 text-[13.5px]">
          <span className="text-faint">https://</span>
          <span ref={txt} className="text-ink" />
          <span className="sm-caret" />
        </div>
        <button ref={btn} type="button" className="vg-abtn vg-abtn--primary mt-4 h-11 w-full text-[14px] transition-transform">
          <ActionInner>Scan my app</ActionInner>
        </button>
      </div>
      <div ref={cur} className="absolute left-0 top-0 pointer-events-none" style={{ opacity: 0 }}><Cursor /></div>
      <Fade />
    </div>
  );
}

/* ============================ Repo demo ============================ */
function RepoDemo() {
  const cur = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const paint = (t: number) => {
      const A = { x: 208, y: 34 };
      const B = { x: 176, y: 84 }; // right side of the Connect button
      let cx = A.x;
      let cy = A.y;
      let cs = 1;
      let cop = 0;
      if (t >= 0.16 && t < 0.36) {
        const p = easeInOut((t - 0.16) / 0.2);
        cx = lerp(A.x, B.x, p);
        cy = lerp(A.y, B.y, p);
        cop = 1;
      } else if (t >= 0.36) {
        cx = B.x;
        cy = B.y;
        cop = t < 0.94 ? 1 : clamp(1 - (t - 0.94) / 0.06);
        cs = t >= 0.36 && t < 0.44 ? 0.82 : 1;
      }
      if (cur.current) {
        cur.current.style.transform = `translate(${cx}px,${cy}px) scale(${cs})`;
        cur.current.style.opacity = String(cop);
      }
      const on = t >= 0.38 && t < 0.92;
      const pressed = t >= 0.38 && t < 0.46;
      if (btn.current) {
        btn.current.classList.toggle('is-on', on);
        btn.current.style.transform = pressed ? 'scale(.97)' : 'scale(1)';
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
    <div className="relative mx-auto flex h-[180px] w-full max-w-[260px] items-center justify-center overflow-hidden">
      <button ref={btn} type="button" className="vg-abtn vg-abtn--green h-11 px-6 text-[14px] transition-transform">
        <ActionInner icon={<Check />}>
          <span className="inline-flex items-center gap-2"><BrandLogo name="github" size={16} invert /> Connect GitHub</span>
        </ActionInner>
      </button>
      <div ref={cur} className="absolute left-0 top-0 pointer-events-none" style={{ opacity: 0 }}><Cursor /></div>
      <Fade />
    </div>
  );
}

/* =========================== Upload demo =========================== */
function UploadDemo() {
  const zone = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const folder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paint = (t: number) => {
      const A = { x: 190, y: 2 };
      const B = { x: 66, y: 62 };
      let fx = A.x;
      let fy = A.y;
      let fop = 0;
      if (t < 0.08) fop = clamp(t / 0.08);
      else if (t >= 0.08 && t < 0.46) {
        const p = easeInOut((t - 0.08) / 0.38);
        fx = lerp(A.x, B.x, p);
        fy = lerp(A.y, B.y, p);
        fop = 1;
      } else if (t >= 0.46 && t < 0.54) {
        fx = B.x;
        fy = B.y;
        fop = clamp(1 - (t - 0.46) / 0.08);
      }
      if (folder.current) {
        folder.current.style.transform = `translate(${fx}px,${fy}px)`;
        folder.current.style.opacity = String(fop);
      }
      const hovering = t >= 0.34 && t < 0.5; // dragging over
      const dropped = t >= 0.5 && t < 0.94; // success
      if (zone.current) {
        if (dropped) {
          zone.current.style.borderColor = '#16A34A';
          zone.current.style.background = '#F0FDF4';
          zone.current.style.color = '#15803D';
        } else if (hovering) {
          zone.current.style.borderColor = '#F3C500';
          zone.current.style.background = 'rgba(243,197,0,0.07)';
          zone.current.style.color = 'var(--color-muted)';
        } else {
          zone.current.style.borderColor = 'var(--color-border)';
          zone.current.style.background = 'transparent';
          zone.current.style.color = 'var(--color-muted)';
        }
      }
      if (label.current) label.current.textContent = dropped ? '✓ invoicekit/ · 214 files' : 'Drop your folder or .zip';
    };
    if (usesReduce()) {
      paint(0.7);
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
    <div className="relative mx-auto flex h-[180px] w-full max-w-[260px] items-center justify-center overflow-hidden">
      <div ref={zone} className="flex h-[110px] w-full items-center justify-center rounded-xl border-2 border-dashed text-[13px] text-muted transition-colors" style={{ borderColor: 'var(--color-border)' }}>
        <span ref={label}>Drop your folder or .zip</span>
      </div>
      <div ref={folder} className="absolute left-0 top-0 flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-[0_10px_26px_-10px_rgba(0,0,0,0.4)] pointer-events-none" style={{ opacity: 0 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="#F3C500" stroke="#C79A00" strokeWidth="1.2" strokeLinejoin="round" /></svg>
        <span className="text-[12px] text-ink">invoicekit/</span>
      </div>
      <Fade />
    </div>
  );
}

/* ============================= Section ============================= */
const COLS = [
  { demo: <UrlDemo />, title: 'Paste a live URL', desc: 'No access to your code. We probe your deployed app the way a stranger on the internet would.' },
  { demo: <RepoDemo />, title: 'Connect your repo', desc: 'A deeper read of your actual source, config and database rules, the issues that never show from the outside.' },
  { demo: <UploadDemo />, title: 'Upload a folder or ZIP', desc: 'No Git needed. Drag in your project and we scan the code directly. Same grade, same exact fixes.' },
];

export default function ScanTypes() {
  return (
    <section id="scan-types" className="an-x an-sec scroll-mt-20">
      <style dangerouslySetInnerHTML={{ __html: SM_CSS }} />
      <div className="an-max">
        <CenterHead
          eyebrow="How it works"
          title="Three ways to scan your app."
          sub="From a 60-second check of a live URL to a deep read of your actual code, pick the scan that fits where your app lives."
        />

        <div className="mt-14 grid gap-y-14 md:grid-cols-3 md:gap-y-0 md:divide-x md:divide-border">
          {COLS.map((c) => (
            <div key={c.title} className="flex flex-col px-0 md:px-8 first:md:pl-0 last:md:pr-0">
              {c.demo}
              <div className="mt-8 text-center">
                <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">{c.title}</h3>
                <p className="mt-2.5 mx-auto text-[14.5px] leading-[1.55] text-muted max-w-[32ch]">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-[12.5px] text-muted">
          Read-only and non-destructive. We never write to your code, and nothing is stored after the scan.
        </div>
      </div>
    </section>
  );
}
