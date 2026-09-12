'use client';

import { Component, type ReactNode } from 'react';

/**
 * Reusable class error boundary. Catches a render/lifecycle throw in its subtree
 * and shows a calm inline panel instead of letting the whole app white-screen.
 * Wrap individual risky sections (a widget, a page body) so one failing piece
 * doesn't take the rest of the page down. Auto-resets when `resetKey` changes
 * (pass the pathname so navigating away clears a stuck error). The raw error is
 * logged for us, never shown to the user.
 */
interface Props {
  children: ReactNode;
  /** Custom fallback. Receives a `retry` to clear the error in place. Note: a
   *  function prop can't cross a Server→Client boundary, use `silent` from
   *  server components instead. */
  fallback?: (retry: () => void) => ReactNode;
  /** Render nothing on error (for ambient widgets that shouldn't show a panel). */
  silent?: boolean;
  /** When this value changes, the boundary resets (e.g. the current pathname). */
  resetKey?: unknown;
  /** Short label for the log line, to locate which section failed. */
  label?: string;
}
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log for us; the stack never reaches the user.
    console.error(`[error-boundary]${this.props.label ? ` ${this.props.label}` : ''}`, error, info);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.silent) return null;
    if (this.props.fallback) return this.props.fallback(this.retry);
    return (
      <div className="vg-surface p-8 text-center vg-fade" style={{ border: '1px solid var(--color-border)', borderRadius: 14 }}>
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-bg-soft flex items-center justify-center text-tertiary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M12 3l9 16H3z" strokeLinejoin="round" />
            <path d="M12 10v4" strokeLinecap="round" />
            <circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h2 className="font-medium text-[17px] text-ink">This section ran into a problem</h2>
        <p className="text-muted text-[14.5px] mt-1 mb-5">It’s not your fault, we’ve logged it. Try again, and the rest of the page keeps working.</p>
        <button onClick={this.retry} className="vg-press cursor-pointer bg-ink text-white font-medium rounded-[10px] px-5 py-[10px] text-[14px]">Try again</button>
      </div>
    );
  }
}
