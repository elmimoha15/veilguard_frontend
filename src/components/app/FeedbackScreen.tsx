'use client';

import Link from 'next/link';
import { Card, PageHeading } from './primitives';
import FeedbackForm from './FeedbackForm';
import { SUPPORT_EMAIL } from '@/content/site';

/**
 * The full Feedback & Help page (/feedback). A warm header, the shared message
 * form, a short "before you write" list of the answers people ask for most, and
 * a plain-email fallback. Rendered inside the app Shell.
 */

// Real, existing destinations — deliberately not placeholder /help URLs.
const HELP_LINKS: { label: string; href: string }[] = [
  { label: 'How we handle your data & code', href: '/privacy' },
  { label: 'Is my Supabase database exposed?', href: '/security/how-do-i-know-if-my-supabase-database-is-exposed' },
  { label: 'Exposed API keys — how to find & fix them', href: '/security/exposed-api-keys' },
  { label: 'The security checklist for AI-built apps', href: '/guides/complete-security-checklist-for-ai-built-apps' },
  { label: 'Billing, plans & receipts', href: '/billing' },
];

export default function FeedbackScreen() {
  return (
    <div className="vg-fade max-w-[720px]">
      <PageHeading
        title="How can we help?"
        subtitle="Found a bug, stuck on something, or have an idea? We read every message."
      />

      <Card className="p-6">
        <FeedbackForm variant="page" />
      </Card>

      {/* Before you write — top answers */}
      <div className="mt-8">
        <div className="kicker mb-3">Before you write — these might help</div>
        <Card className="overflow-hidden">
          {HELP_LINKS.map((l, i) => {
            const internalGuide = l.href.startsWith('/security') || l.href.startsWith('/guides') || l.href === '/privacy';
            const cls = 'vg-row flex items-center gap-3 px-[16px] py-[13px] text-[14.5px] text-ink no-underline';
            const style = { borderTop: i === 0 ? undefined : '1px solid var(--color-hairline)' };
            const chevron = (
              <svg className="text-faint shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            );
            // Marketing/guide pages live outside the app group → real anchor (full nav).
            return internalGuide ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
                <span className="flex-1">{l.label}</span>{chevron}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className={cls} style={style}>
                <span className="flex-1">{l.label}</span>{chevron}
              </Link>
            );
          })}
        </Card>
      </div>

      <p className="text-[14px] text-muted mt-6">
        Prefer email? Reach us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-yellow-dark font-semibold underline">{SUPPORT_EMAIL}</a>.
      </p>
    </div>
  );
}
