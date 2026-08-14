'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import FadeIn from '@/components/ui/FadeIn';

type TabId = 'url' | 'repo' | 'upload';

const GlobeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const RepoIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M6 8.5v7M8.4 7.2C12 8 15.6 8 15.6 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M18 10.4c0 3-2 3.6-5 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const UploadIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const GithubMark = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden>
    <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 4-2.4 4.8-4.7 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.1 10.1 0 0 0 22 12.3C22 6.6 17.5 2 12 2Z" />
  </svg>
);

const TABS: {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  plan: 'Free' | 'Guard';
  title: string;
  desc: string;
  steps: string[];
  bestFor: string;
}[] = [
  {
    id: 'url',
    label: 'Live URL',
    icon: <GlobeIcon />,
    plan: 'Free',
    title: 'Scan a live URL',
    desc: 'See exactly what an attacker sees from the outside, no access to your code required. Just paste the link to your deployed app.',
    steps: [
      'Paste your app’s URL (Lovable, Bolt, Vercel, anywhere it’s live).',
      'We probe it the way an attacker would, from the outside in.',
      'Get an A–F grade and every exposed issue explained in ~60 seconds.',
    ],
    bestFor: 'A fast first check of any app that’s already deployed.',
  },
  {
    id: 'repo',
    label: 'Connect repo',
    icon: <RepoIcon />,
    plan: 'Guard',
    title: 'Connect your GitHub repo',
    desc: 'Link a repo for a deeper, read-only scan of your actual source, config and database rules, the issues that never show from the outside.',
    steps: [
      'Connect GitHub once, read-only and encrypted. We never write to your code.',
      'Pick the repo you want graded.',
      'We scan the source plus your Supabase and Firebase rules, then grade it.',
    ],
    bestFor: 'Catching risks hidden in the code, like open RLS or leaked env vars.',
  },
  {
    id: 'upload',
    label: 'Upload folder',
    icon: <UploadIcon />,
    plan: 'Guard',
    title: 'Upload a folder or ZIP',
    desc: 'No Git? Drag in your project folder or a .zip and we scan the code directly. Nothing leaves encrypted storage.',
    steps: [
      'Drop your project folder or a .zip file.',
      'We read the code, skipping node_modules and honoring your .gitignore.',
      'Same A–F grade and exact fixes, straight from your source.',
    ],
    bestFor: 'Local projects or code that doesn’t live on GitHub.',
  },
];

const SOFT_SHADOW = '0 18px 50px -30px rgba(0,0,0,0.4)';

function TabVisual({ id }: { id: TabId }) {
  if (id === 'url') {
    return (
      <div>
        <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 h-16" style={{ boxShadow: SOFT_SHADOW }}>
          <span className="font-mono text-[14px] text-tertiary select-none">https://</span>
          <span className="text-[16px] text-ink truncate">myapp.lovable.app</span>
          <span className="ml-auto inline-flex items-center justify-center h-10 px-5 rounded-xl bg-ink text-white text-[14px] font-semibold shrink-0">
            Run scan
          </span>
        </div>
        <p className="mt-3 text-center text-[13px] text-faint">Free · A–F grade in ~60s</p>
      </div>
    );
  }
  if (id === 'repo') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-card border border-border px-5 h-[72px]" style={{ boxShadow: SOFT_SHADOW }}>
        <GithubMark />
        <span className="font-semibold text-[16px] text-ink">GitHub</span>
        <span
          className="ml-auto inline-flex items-center justify-center h-10 px-5 rounded-xl text-white text-[14px] font-semibold shadow-[0_10px_24px_-10px_rgba(31,157,87,0.7)]"
          style={{ background: '#1F9D57' }}
        >
          Connect
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center text-center py-10 px-6">
      <span className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{ background: 'rgba(243,197,0,0.16)', color: '#8A6D00' }}>
        <UploadIcon />
      </span>
      <div className="font-semibold text-[15px] text-ink">Drop your folder or .zip</div>
      <div className="text-[13px] text-muted mt-1">skips node_modules · honors .gitignore</div>
    </div>
  );
}

/**
 * ScanTypes — a modern, tabbed explainer of the three ways to scan: a live URL
 * (free), a connected GitHub repo, or a folder/ZIP upload. Clear tab affordances
 * (hover, hint, dot indicators) with simple, on-brand visuals per tab.
 */
export default function ScanTypes() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section id="scan-types" className="bg-bg-soft scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-6 py-[clamp(56px,8vw,96px)]">
        <FadeIn className="max-w-[720px]">
          <Eyebrow className="text-yellow-dark">{'// THREE WAYS TO SCAN'}</Eyebrow>
          <h2 className="el-h mt-4 text-[clamp(26px,3.4vw,42px)]">Scan however you build.</h2>
          <p className="mt-4 text-[16.5px] leading-[1.6] text-muted max-w-[56ch]">
            From a 60-second check of a live URL to a deep read of your actual code, pick the scan that fits
            where your app lives.
          </p>
        </FadeIn>

        {/* segmented tabs */}
        <div className="mt-9 flex justify-start">
          <div className="flex w-full sm:w-auto items-center gap-1 p-1 rounded-full border border-border bg-card">
            {TABS.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-5 h-11 rounded-full text-[13.5px] sm:text-[14px] font-semibold transition-colors ${on ? '' : 'hover:bg-bg-soft'}`}
                  aria-pressed={on}
                >
                  {on && (
                    <motion.span
                      layoutId="scanTabPill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 ${on ? 'text-white' : 'text-muted hover:text-ink'}`}>
                    {t.icon}
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-faint">Tap a tab to see how each one works</p>

        {/* panel */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid gap-8 lg:grid-cols-2 lg:items-center"
            >
              {/* left: explanation */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(243,197,0,0.16)', color: '#8A6D00' }}>
                    {tab.icon}
                  </span>
                  <span className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-faint">
                    {tab.plan === 'Free' ? 'Free · no signup' : 'Guard plan'}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-[24px] tracking-[-0.02em] text-ink">{tab.title}</h3>
                <p className="mt-3 text-[16px] leading-[1.6] text-muted max-w-[52ch]">{tab.desc}</p>

                <div className="mt-6 flex flex-col gap-3.5">
                  {tab.steps.map((s, i) => (
                    <div key={s} className="flex gap-3">
                      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold" style={{ background: 'rgba(243,197,0,0.16)', color: '#8A6D00' }}>
                        {i + 1}
                      </span>
                      <p className="text-[15px] leading-[1.5] text-ink pt-[3px]">{s}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-2.5 text-[14px] text-muted">
                  <svg className="shrink-0 mt-[2px]" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12.5l4 4 10-11" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span><span className="font-semibold text-ink">Best for:</span> {tab.bestFor}</span>
                </div>
              </div>

              {/* right: simple visual */}
              <div>
                <TabVisual id={tab.id} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dot indicators — reinforce that there are switchable tabs */}
        <div className="mt-8 flex justify-start gap-2">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${t.label}`}
              className="h-2 rounded-full transition-all duration-200"
              style={{ width: i === active ? 22 : 8, background: i === active ? '#F3C500' : 'var(--color-border)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
