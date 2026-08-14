'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { SUPPORT_EMAIL } from '@/content/site';

/**
 * The one feedback/help form — shared by the full /feedback page and the docked
 * widget so copy, validation, and submit behaviour never drift. Matches the app's
 * form styling (bg-bg-soft fields, yellow focus ring, ink primary button).
 *
 * Context (page / scanId / userAgent) is captured silently at submit time — the
 * user never fills it — because "this is confusing" is far more actionable paired
 * with where they were and what plan they're on.
 */

type FeedbackType = 'bug' | 'idea' | 'help' | 'other';
const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'idea', label: 'Feedback / idea' },
  { value: 'help', label: 'Need help' },
  { value: 'other', label: 'Other' },
];

/** Pull the scan id out of the current URL, if the user is on a scan-ish page. */
function currentScanId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const p = new URLSearchParams(window.location.search);
  return p.get('scan') || p.get('scanId') || undefined;
}

export default function FeedbackForm({
  variant = 'page',
  onSubmitted,
}: {
  variant?: 'page' | 'panel';
  onSubmitted?: () => void;
}) {
  const { user } = useAuth();
  const [type, setType] = useState<FeedbackType>('idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const compact = variant === 'panel';
  const needsEmail = !user; // anonymous must leave a reply address

  const submit = async () => {
    if (status === 'sending') return;
    if (!message.trim()) { setStatus('error'); return; }
    if (needsEmail && !email.trim()) { setStatus('error'); return; }
    setStatus('sending');
    const res = await api.submitFeedback({
      type,
      message: message.trim(),
      email: email.trim() || undefined,
      page: typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined,
      scanId: currentScanId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
    if (res.ok) {
      setStatus('sent');
      setMessage('');
      onSubmitted?.();
    } else {
      if (res.data?.error) console.error('[feedback] submit failed:', res.data.error);
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className={compact ? 'text-center py-6' : 'text-center py-10'}>
        <span className="inline-flex w-11 h-11 rounded-full items-center justify-center mb-3" style={{ background: '#EAF6EF' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div className="font-semibold text-[17px] text-ink">Thanks — we’ve got it.</div>
        <p className="text-[14.5px] text-muted mt-1 leading-[1.5]">We read every message and we’ll get back to you{email ? ` at ${email}` : ''}.</p>
        <button onClick={() => setStatus('idle')} className="vg-press cursor-pointer mt-5 text-[14px] font-semibold text-muted hover:text-ink underline">Send another</button>
      </div>
    );
  }

  const showError = status === 'error';
  const missingMessage = showError && !message.trim();
  const missingEmail = showError && needsEmail && !email.trim();

  return (
    <div className="flex flex-col gap-4">
      {/* Type selector */}
      <div>
        <label className="kicker block mb-2">What’s this about?</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const on = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={on}
                className="vg-press cursor-pointer rounded-full px-[14px] py-[7px] text-[13.5px] font-medium border transition-colors"
                style={on
                  ? { background: '#0A0A0A', color: '#fff', borderColor: '#0A0A0A' }
                  : { background: 'transparent', color: '#5b5a56', borderColor: 'var(--color-border)' }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="fb-message" className="kicker block mb-2">Your message</label>
        <textarea
          id="fb-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); if (showError) setStatus('idle'); }}
          rows={compact ? 4 : 6}
          placeholder={type === 'bug' ? 'What happened, and what did you expect?' : type === 'help' ? 'What are you stuck on?' : 'Tell us what’s on your mind…'}
          className="w-full bg-bg-soft border rounded-[10px] px-[13px] py-[11px] text-[15px] text-ink resize-y outline-none transition-shadow focus:shadow-[0_0_0_2px_#F3C500]"
          style={{ borderColor: missingMessage ? '#C23B3F' : 'var(--color-border)' }}
        />
        {missingMessage && <div className="text-[13px] text-red mt-1">Please add a message.</div>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="fb-email" className="kicker block mb-2">Your email {needsEmail && <span className="text-red">*</span>}</label>
        <input
          id="fb-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (showError) setStatus('idle'); }}
          placeholder="you@example.com"
          className="w-full bg-bg-soft border rounded-[10px] px-[13px] py-[11px] text-[15px] text-ink outline-none transition-shadow focus:shadow-[0_0_0_2px_#F3C500]"
          style={{ borderColor: missingEmail ? '#C23B3F' : 'var(--color-border)' }}
        />
        {missingEmail
          ? <div className="text-[13px] text-red mt-1">Please add your email so we can reply.</div>
          : <div className="text-[12.5px] text-faint mt-1">{user ? 'We’ll reply here — edit if you’d like a reply elsewhere.' : 'So we can get back to you.'}</div>}
      </div>

      {showError && !missingMessage && !missingEmail && (
        <div className="text-[13.5px] text-red">Couldn’t send that just now. Please try again — or email <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>.</div>
      )}

      <button
        onClick={submit}
        disabled={status === 'sending'}
        className="vg-press cursor-pointer bg-ink text-white rounded-[10px] py-[13px] font-medium text-[15px] disabled:opacity-70"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </div>
  );
}
