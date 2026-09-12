'use client';

import { useEffect, useRef, useState } from 'react';
import { LogoIcon } from '@/components/ui/Logo';
import { MONITOR_ALERT } from '@/content/landing';

const usesReduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Entrance + accents shipped with the component (reliable regardless of global-CSS chunking). */
const ME_CSS = `
@keyframes meIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.me-in{animation:meIn .5s cubic-bezier(0.23,1,0.32,1) both}
@keyframes mePulse{0%,100%{opacity:1}50%{opacity:.3}}
.me-dot{animation:mePulse 1.9s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.me-in{animation:none}.me-dot{animation:none}}
`;

/* A single Gmail-toolbar-style outline icon. */
function TBIcon({ d, label }: { d: string; label: string }) {
  return (
    <span aria-label={label} className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ color: '#5f6368' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{iconPaths(d)}</svg>
    </span>
  );
}
// tiny registry so each icon can be multi-path
function iconPaths(key: string) {
  switch (key) {
    case 'back': return <path d="M15 6l-6 6 6 6" />;
    case 'archive': return <><rect x="3" y="5" width="18" height="4" rx="1" /><path d="M5 9v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>;
    case 'trash': return <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />;
    case 'unread': return <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>;
    case 'dots': return <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>;
    default: return <path d={key} />;
  }
}

export default function MonitorEmail() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (usesReduce()) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setPlay(true); io.disconnect(); } }),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const a = MONITOR_ALERT;

  return (
    <div className="mx-auto w-full max-w-[620px]">
      <style dangerouslySetInnerHTML={{ __html: ME_CSS }} />
      <div ref={ref} className={`rounded-[16px] border border-[#E8E7E3] bg-white overflow-hidden shadow-[0_30px_70px_-40px_rgba(0,0,0,0.4)] ${play ? 'me-in' : ''}`}>

        {/* Gmail-style toolbar */}
        <div className="flex items-center gap-1 px-3 h-12 border-b border-[#F0EFEB]">
          <TBIcon d="back" label="Back" />
          <span className="w-px h-5 mx-1" style={{ background: '#EAE9E4' }} />
          <TBIcon d="archive" label="Archive" />
          <TBIcon d="trash" label="Delete" />
          <TBIcon d="unread" label="Mark unread" />
          <TBIcon d="dots" label="More" />
          <span className="ml-auto flex items-center gap-1 text-[12.5px]" style={{ color: '#5f6368' }}>
            <span className="tnum">1 of 342</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg></span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></span>
          </span>
        </div>

        {/* Subject + labels */}
        <div className="px-6 pt-5">
          <div className="flex items-start gap-3">
            <h3 className="flex-1 text-[21px] leading-[1.25] tracking-[-0.01em] text-[#202124]">
              {a.title}
            </h3>
            <span className="shrink-0 mt-1" style={{ color: '#C7C6C1' }} aria-label="Star">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.6 1-5.8L3.5 9.7l5.9-.9z" /></svg>
            </span>
          </div>
        </div>

        {/* Sender row */}
        <div className="px-6 pt-4 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: '#F3C500' }}><LogoIcon variant="dark" size={22} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[14px] font-semibold text-[#202124]">Veilguard Security</span>
              <span className="text-[13px]" style={{ color: '#5f6368' }}>&lt;alerts@veilguard.dev&gt;</span>
            </div>
            <div className="flex items-center gap-1 text-[12.5px]" style={{ color: '#5f6368' }}>
              to me
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-[12.5px]" style={{ color: '#5f6368' }}>
            <span className="me-dot inline-block w-[7px] h-[7px] rounded-full" style={{ background: '#1a73e8' }} aria-hidden />
            <span className="tnum">2 min ago</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 17l-5-5 5-5M4 12h11a4 4 0 0 1 4 4v2" /></svg>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="font-mono text-[12px] mb-3" style={{ color: '#A3A3A3' }}>{a.app} · {a.deploy}</div>
          <p className="text-[15px] leading-[1.65] text-[#3c4043]">{a.body} Your security grade dropped from {a.gradeFrom} to {a.gradeTo}, and the exact fix is waiting in your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
