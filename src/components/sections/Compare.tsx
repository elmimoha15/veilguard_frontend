import { CenterHead } from '@/components/sections/annot/kit';

const COLS = ['Veilguard', 'Snyk', 'SonarQube', 'Manual audit'];
const ROWS: { label: string; cells: boolean[] }[] = [
  { label: 'Plain-English fixes, not just CVE IDs', cells: [true, false, false, true] },
  { label: 'Built for apps made with Lovable, Bolt, Cursor', cells: [true, false, false, false] },
  { label: 'Supabase RLS + Firebase rules checks', cells: [true, false, false, true] },
  { label: 'Live URL scan, no code access needed', cells: [true, false, false, true] },
  { label: 'Re-scan + alerts on every deploy', cells: [true, true, true, false] },
  { label: 'Free grade, no signup', cells: [true, false, false, false] },
];

function Yes() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: '#1F9D57' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
function No() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#DCDBD6]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7l10 10M17 7L7 17" stroke="#B4B3AC" strokeWidth="2" strokeLinecap="round" /></svg>
    </span>
  );
}

export default function Compare() {
  return (
    <section id="compare" className="an-x an-sec">
      <div className="an-max">
        <CenterHead eyebrow="Compare" title="How does Veilguard compare?" />
        <div className="an-card mt-12 p-4 sm:p-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="text-left" />
                {COLS.map((c, i) => (
                  <th key={c} className="px-3 pb-6 text-center align-bottom">
                    <span className={`inline-block text-[15px] font-semibold ${i === 0 ? 'text-ink' : 'text-muted'}`}>{c}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-t border-[#F0EFEB]">
                  <td className="py-4 pr-4 text-[14.5px] text-ink">{r.label}</td>
                  {r.cells.map((v, i) => (
                    <td key={i} className={`py-4 text-center ${i === 0 ? 'bg-[#FDFBF2]' : ''}`}>
                      <span className="inline-flex justify-center">{v ? <Yes /> : <No />}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
