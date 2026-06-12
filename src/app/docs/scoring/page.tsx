import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Security Scoring — How Veilguard Grades Your Code A+ to F',
  description: 'How Veilguard grades a vibe-coded project from A+ to F. The penalty-based score model, what each grade means, and how the Pre-Deploy security audit report is calculated.',
  keywords: ['security score', 'code security grade', 'security audit score', 'A+ to F security rating', 'vibe coding security audit', 'pre-deploy security check'],
  alternates: { canonical: '/docs/scoring' },
  openGraph: { url: 'https://veilguard.dev/docs/scoring' },
};

export default function DocsScoringPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Docs', url: '/docs' }, { name: 'Security Scoring', url: '/docs/scoring' }]} />
      <h1 className="text-2xl font-semibold mb-3">Security Scoring</h1>
      <p className="text-sm text-text-body mb-8">
        When you run a <code className="text-accent bg-accent-muted px-1.5 py-0.5 rounded ml-1 text-xs font-mono">full_audit</code>, Veilguard scores your codebase with a strict penalty-based model. Every project starts at 100 and loses points per issue. The full audit is Pro-only and unlimited; on free, calling it returns an upgrade prompt — run the individual scanners for free vulnerability alerts.
      </p>

      <h2 className="text-base font-semibold mt-8 mb-3 border-b border-border pb-2">Calculation Model</h2>
      <p className="text-text-body mb-4">
        Every project begins with a perfect score of <strong>100</strong>. Each issue subtracts points based on what it is and how much damage it causes — the most dangerous patterns cost the most:
      </p>

      <div className="overflow-x-auto not-prose mb-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-text-muted bg-background-code">
              <th className="py-3 px-4 font-medium w-24">Penalty</th>
              <th className="py-3 px-4 font-medium">Issue type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="py-3 px-4 font-mono font-bold text-status-critical">−25</td><td className="py-3 px-4 text-text-body">Service-role / admin key exposed in frontend code — instant database takeover</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-critical">−20</td><td className="py-3 px-4 text-text-body">Hardcoded secret · unverified webhook · SQL/NoSQL/command injection · missing Supabase RLS · open Firebase rules · IDOR</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-warning">−15</td><td className="py-3 px-4 text-text-body">Mass assignment · missing rate limiting on auth or payment routes</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-warning">−10</td><td className="py-3 px-4 text-text-body">Wildcard CORS · sensitive data written to logs</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-warning">−8</td><td className="py-3 px-4 text-text-body">Error stack traces exposed to users</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-info">−5</td><td className="py-3 px-4 text-text-body">Missing security headers (CSP, HSTS, X-Frame-Options)</td></tr>
            <tr><td className="py-3 px-4 font-mono font-bold text-status-info">−1</td><td className="py-3 px-4 text-text-body">Informational findings</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-muted mb-12">
        Anything uncategorised falls back to −15 for a critical finding and −5 for a warning. The final score is floored at 0.
      </p>

      <h2 className="text-base font-semibold mt-8 mb-3 border-b border-border pb-2">Grades Overview</h2>
      <div className="overflow-x-auto not-prose">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-text-muted bg-background-code">
              <th className="py-3 px-4 font-medium w-1/4">Score</th>
              <th className="py-3 px-4 font-medium w-1/4">Grade</th>
              <th className="py-3 px-4 font-medium w-1/2">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">95 - 100</td>
              <td className="py-3 px-4 font-bold text-status-secure text-lg">A+</td>
              <td className="py-3 px-4 text-text-muted">Production-ready. Excellent security hygiene.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">90 - 94</td>
              <td className="py-3 px-4 font-bold text-status-secure text-lg">A</td>
              <td className="py-3 px-4 text-text-muted">Production-ready. Excellent security hygiene.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">85 - 89</td>
              <td className="py-3 px-4 font-bold text-accent text-lg">B+</td>
              <td className="py-3 px-4 text-text-muted">Good security. A few improvements before scaling.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">80 - 84</td>
              <td className="py-3 px-4 font-bold text-accent text-lg">B</td>
              <td className="py-3 px-4 text-text-muted">Good security. A few improvements before scaling.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">75 - 79</td>
              <td className="py-3 px-4 font-bold text-status-warning text-lg">C+</td>
              <td className="py-3 px-4 text-text-muted">Moderate risk. Fix warnings before you get real users.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">70 - 74</td>
              <td className="py-3 px-4 font-bold text-status-warning text-lg">C</td>
              <td className="py-3 px-4 text-text-muted">Moderate risk. Fix warnings before you get real users.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">60 - 69</td>
              <td className="py-3 px-4 font-bold text-status-warning text-lg">D</td>
              <td className="py-3 px-4 text-text-muted">High risk. Critical issues present. Fix before deploying.</td>
            </tr>
            <tr className="hover:bg-background-card/50">
              <td className="py-3 px-4 text-text-body">0 - 59</td>
              <td className="py-3 px-4 font-bold text-status-critical text-lg">F</td>
              <td className="py-3 px-4 text-text-muted">Do NOT deploy. Critical vulnerabilities attackers actively exploit.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
