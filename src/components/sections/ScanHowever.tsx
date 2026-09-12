const MONO = "ui-monospace,'SF Mono',Menlo,monospace";
const BORDER = '#E6E5E0';
const BARS = [8, 13, 20, 11, 26, 16, 9, 22, 14, 30, 12, 18, 24, 10, 17, 28, 13, 21, 9, 25, 15, 11, 19, 23, 12, 16];

/** "Three ways to scan" — ported from the Claude Design export, with the URL
 *  typewriter + scanning bars + stamped grade, the repo scan-line timeline, and
 *  the upload file list, all animated (reduced-motion respected globally). */
export default function ScanHowever() {
  return (
    <section id="how" className="el-x el-divide mx-auto max-w-[1160px]" style={{ paddingTop: 56, paddingBottom: 84 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.13em', color: '#F3C500' }}>THREE WAYS TO SCAN</div>
      <div data-2up style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 48, alignItems: 'start', marginTop: 12 }}>
        <h2 data-h2 style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-.045em', lineHeight: 1.06, maxWidth: '16ch' }} className="text-balance">Scan however you build</h2>
        <p style={{ fontSize: 18, lineHeight: 1.5, color: '#3A3A34', maxWidth: '40ch', marginTop: 8 }} className="text-pretty">
          From a 60-second check of a live URL to a deep read of your actual source, pick the scan that fits where your app lives.
        </p>
      </div>

      <div data-3up style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', borderTop: `1px solid ${BORDER}`, marginTop: 40 }}>

        {/* visual 1 — live URL */}
        <div style={{ padding: '34px 26px 0 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1.5px solid #0A0A0A', padding: '0 2px 12px' }}>
              <span style={{ fontFamily: MONO, flex: '0 0 auto', fontSize: 13, color: '#C4C3BC' }}>https://</span>
              <span style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <span style={{ fontFamily: MONO, display: 'inline-block', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', width: 0, animation: 'vg-type 5.2s steps(16,end) infinite' }}>invoicekit.app</span>
                <span style={{ flex: '0 0 auto', width: 2, height: 16, background: '#0A0A0A', marginLeft: 2, animation: 'vg-caret .8s steps(1,end) infinite' }} />
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 34, marginTop: 34 }}>
              {BARS.map((h, i) => (
                <span key={i} style={{ flex: 1, height: h, borderRadius: 1, background: '#0A0A0A', opacity: 0.12, animation: `vg-tick 2.6s ease-in-out ${(i * 0.075).toFixed(3)}s infinite` }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', color: '#B4B3AC' }}>OUTSIDE IN</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', color: '#B4B3AC' }}>34 CHECKS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
              <span style={{ flex: '0 0 auto', fontSize: 44, fontWeight: 800, letterSpacing: '-.05em', lineHeight: 1, animation: 'vg-stamp 2.6s cubic-bezier(.3,1.6,.4,1) infinite' }}>F</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>9 findings, 3 critical</span>
                <span style={{ display: 'block', fontFamily: MONO, fontSize: 11.5, color: '#A8A8A2', marginTop: 3 }}>58 seconds, no signup</span>
              </span>
            </div>
          </div>
        </div>

        {/* visual 2 — connect repo */}
        <div style={{ borderLeft: `1px solid ${BORDER}`, padding: '34px 26px 0' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 300 }}>
            <div style={{ position: 'relative', paddingLeft: 26 }}>
              <span style={{ position: 'absolute', left: 5, top: 9, bottom: 22, width: 1.5, background: '#E4E3DE' }} />
              {[
                { file: 'main', note: 'nova-labs/storefront', red: false, delay: 0.1 },
                { file: 'supabase/policies.sql', note: 'row level security off', red: true, delay: 0.5 },
                { file: '.env', note: '2 live keys committed', red: true, delay: 0.9 },
              ].map((n, i, arr) => (
                <div key={n.file} style={{ position: 'relative', paddingBottom: i < arr.length - 1 ? 30 : 0 }}>
                  <span style={{ position: 'absolute', left: -26, top: 3, width: 12, height: 12, borderRadius: '50%', background: '#0A0A0A', animation: `vg-node 4s ease-in-out ${n.delay}s infinite` }} />
                  <div style={{ fontFamily: MONO, fontSize: 12.5 }}>{n.file}</div>
                  <div style={{ fontSize: 12, color: n.red ? '#DC2626' : '#A8A8A2', marginTop: 4 }}>{n.note}</div>
                </div>
              ))}
              <span style={{ position: 'absolute', left: -8, right: -8, height: 2, background: '#F3C500', boxShadow: '0 0 24px 8px rgba(255,212,61,.55)', animation: 'vg-read 4s cubic-bezier(.4,0,.6,1) infinite' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 34 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" /><rect x="5.2" y="10.5" width="13.6" height="9" rx="2.2" stroke="#0A0A0A" strokeWidth="1.8" /></svg>
              <span style={{ fontSize: 13, color: '#3A3A34' }}>Read-only. We never write to your code.</span>
            </div>
          </div>
        </div>

        {/* visual 3 — upload */}
        <div style={{ borderLeft: `1px solid ${BORDER}`, padding: '34px 0 0 26px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 300 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', color: '#B4B3AC' }}>DROPPED FOLDER</span>
                <span style={{ fontFamily: MONO, marginLeft: 'auto', fontSize: 10.5, letterSpacing: '.09em', color: '#B4B3AC' }}>214 FILES</span>
              </div>
              {[
                { name: 'src/', size: '148 files', delay: 0.25 },
                { name: 'supabase/', size: '12 files', delay: 0.47 },
                { name: '.env.example', size: '1 KB', delay: 0.69 },
                { name: 'package.json', size: '2 KB', delay: 0.91 },
              ].map((f) => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #EDECE7', padding: '13px 0', opacity: 0, animation: `vg-in 3.4s ease-out ${f.delay}s infinite` }}>
                  <span style={{ fontFamily: MONO, flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.name}</span>
                  <span style={{ fontFamily: MONO, flex: '0 0 auto', fontSize: 11.5, color: '#A8A8A2' }}>{f.size}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ flex: '0 0 auto' }} aria-hidden><path d="M3.6 7.4a2 2 0 012-2h3l1.8 2.2h6.9a2 2 0 012 2v8a2 2 0 01-2 2H5.6a2 2 0 01-2-2v-10z" stroke="#0A0A0A" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: MONO, fontSize: 13 }}>invoicekit/</span>
                <span style={{ display: 'block', fontSize: 12, color: '#A8A8A2', marginTop: 3 }}>214 files, scanned then deleted</span>
              </span>
            </div>
          </div>
        </div>

        {/* text 1 */}
        <TextCell title="Paste a live URL" desc="No access to your code. We probe your deployed app the way a stranger on the internet would." cta="Free, no signup" href="/onboarding" first />
        {/* text 2 */}
        <TextCell title="Connect your repo" desc="A deeper read of your actual source, config and database rules, the issues that never show from the outside." cta="On the Guard plan" href="/#pricing" />
        {/* text 3 */}
        <TextCell title="Upload a folder or ZIP" desc="No Git needed. Drag in your project and we scan the code directly. Same grade, same exact fixes." cta="On the Guard plan" href="/#pricing" last />
      </div>
    </section>
  );
}

function TextCell({ title, desc, cta, href, first, last }: { title: string; desc: string; cta: string; href: string; first?: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderLeft: first ? undefined : `1px solid ${BORDER}`, padding: first ? '26px 26px 4px 0' : last ? '26px 0 4px 26px' : '26px 26px 4px' }}>
      <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.03em', marginTop: 26 }}>{title}</h3>
      <p style={{ fontSize: 15.5, lineHeight: 1.5, color: '#4A4A43', marginTop: 8, maxWidth: '30ch' }} className="text-pretty">{desc}</p>
      <a href={href} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 600, marginTop: 'auto', paddingTop: 20 }}>
        {cta}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h13M13 6.5l5.5 5.5L13 17.5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </div>
  );
}
