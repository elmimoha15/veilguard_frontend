'use client';

import ProductFrame from '@/components/ui/ProductFrame';
import { GradeRing } from '@/components/app/ui';

type TabId = 'url' | 'repo' | 'upload';

const CHECKS: { label: string; state: 'done' | 'active' | 'todo' }[] = [
  { label: 'Fetching your app', state: 'done' },
  { label: 'Checking database rules', state: 'done' },
  { label: 'Inspecting the bundle', state: 'active' },
  { label: 'Testing access control', state: 'todo' },
];

function Dot({ state }: { state: 'done' | 'active' | 'todo' }) {
  if (state === 'done') return (
    <span className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: '#EAF6EF' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  if (state === 'active') return <span className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center"><span className="w-[8px] h-[8px] rounded-full bg-ink" style={{ animation: 'vgPulse 1.4s ease-in-out infinite' }} /></span>;
  return <span className="shrink-0 w-[18px] h-[18px] rounded-full border-2 border-[#E3E2DE]" />;
}

const GithubMark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden><path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 4-2.4 4.8-4.7 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.1 10.1 0 0 0 22 12.3C22 6.6 17.5 2 12 2Z" /></svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
);

/** Per-tab real product shots for the "three ways to scan" section. */
export default function ScanFlowShot({ id }: { id: TabId }) {
  if (id === 'url') {
    return (
      <ProductFrame url="app.veilguard.dev/scanning" bodyClassName="p-5 sm:p-6">
        <div className="flex items-center gap-5">
          <GradeRing size={104} pct={62} color="#0A0A0A" strokeWidth={9}>
            <span className="tnum text-[23px] font-semibold leading-none">62%</span>
          </GradeRing>
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            {CHECKS.map((c) => (
              <div key={c.label} className="flex items-center gap-2.5">
                <Dot state={c.state} />
                <span className={`text-[13.5px] ${c.state === 'todo' ? 'text-[#A3A3A3]' : 'text-ink'}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 font-mono text-[11px] text-[#A3A29D]">scanning store.myapp.com · exposed keys · open databases · CORS</div>
      </ProductFrame>
    );
  }
  if (id === 'repo') {
    return (
      <ProductFrame url="app.veilguard.dev/apps" bodyClassName="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <GithubMark />
          <span className="font-semibold text-[15px] text-ink">GitHub</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-[#157A43]"><span className="w-[6px] h-[6px] rounded-full bg-[#1F9D57]" /> Connected</span>
        </div>
        <div className="mt-4 space-y-2">
          {['store-frontend', 'api-backend'].map((repo) => (
            <div key={repo} className="flex items-center gap-2.5 rounded-[10px] border border-[#F0EFEB] bg-[#FAFAF9] px-3 h-11">
              <span className="font-mono text-[12.5px] text-ink truncate">elmi/{repo}</span>
              <span className="ml-auto inline-flex items-center justify-center h-7 px-3 rounded-[8px] bg-ink text-white text-[11.5px] font-semibold">Deep scan</span>
            </div>
          ))}
        </div>
        <div className="mt-3 font-mono text-[11px] text-[#A3A29D]">read-only · encrypted · we never write to your code</div>
      </ProductFrame>
    );
  }
  return (
    <ProductFrame url="app.veilguard.dev/upload" bodyClassName="p-5 sm:p-6">
      <div className="rounded-[12px] border-2 border-dashed border-[#E3E2DE] bg-[#FAFAF9] flex flex-col items-center justify-center text-center py-7 px-6">
        <span className="flex items-center justify-center w-11 h-11 rounded-[12px] mb-3" style={{ background: 'rgba(243,197,0,0.16)', color: '#F3C500' }}><UploadIcon /></span>
        <div className="font-semibold text-[14px] text-ink">Drop your folder or .zip</div>
        <div className="text-[12.5px] mt-1" style={{ color: '#737373' }}>skips node_modules · honors .gitignore</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {['src/', 'supabase/', '.env.example', 'package.json'].map((f) => (
          <span key={f} className="font-mono text-[11px] rounded-full bg-[#F1F0EC] px-2.5 py-1" style={{ color: '#6E6E6A' }}>{f}</span>
        ))}
      </div>
    </ProductFrame>
  );
}
