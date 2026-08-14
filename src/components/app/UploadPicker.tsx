'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { zip } from 'fflate';
import ignore from 'ignore';

/**
 * Folder / .zip upload chooser for a Pro white-box scan. Supports a folder picker,
 * a drag-and-drop zone (folders or a .zip), and a .zip file picker. Everything is
 * zipped CLIENT-SIDE with junk filtered out, so only source bytes leave the
 * browser. `onScan(zip, name)` returns false to keep the modal open on failure.
 */

// Dirs the scanner never reads — filtered client-side so uploads stay small.
const IGNORE = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', 'out',
  'venv', '.venv', '__pycache__', 'vendor', '.tox', '.mypy_cache', '.pytest_cache', '.gradle',
  // Test/fixture artifacts — not deployed, so scanning them is false-positive noise.
  'test-fixtures', 'fixtures', '__tests__', '__mocks__', '.storybook', 'cypress', 'e2e',
]);
const MAX_FILE_BYTES = 2_000_000; // engine skips bigger files anyway
const MAX_ZIP_BYTES = 40 * 1024 * 1024; // must match backend config.uploadMaxBytes

interface Picked { path: string; file: File }

function keep(path: string, size: number): boolean {
  if (size >= MAX_FILE_BYTES || size === 0) return false;
  return !path.split('/').some((seg) => IGNORE.has(seg));
}

function fromFileList(files: FileList | File[]): Picked[] {
  return Array.from(files).map((f) => ({ path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name, file: f }));
}

/** Recursively walk a dropped directory entry (webkitGetAsEntry / FileSystemEntry). */
function walkEntry(entry: FileSystemEntry, prefix: string, out: Picked[]): Promise<void> {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file((file) => { out.push({ path: prefix + entry.name, file }); resolve(); }, () => resolve());
    } else if (entry.isDirectory) {
      if (IGNORE.has(entry.name)) return resolve();
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const dir = `${prefix}${entry.name}/`;
      const readBatch = () => {
        reader.readEntries(async (batch) => {
          if (!batch.length) return resolve();
          await Promise.all(batch.map((b) => walkEntry(b, dir, out)));
          readBatch(); // readEntries returns in chunks — keep going until empty
        }, () => resolve());
      };
      readBatch();
    } else resolve();
  });
}

async function fromDataTransfer(dt: DataTransfer): Promise<Picked[]> {
  const entries = Array.from(dt.items)
    .filter((i) => i.kind === 'file')
    .map((i) => i.webkitGetAsEntry())
    .filter((e): e is FileSystemEntry => !!e);
  if (!entries.length) return fromFileList(dt.files);
  const out: Picked[] = [];
  await Promise.all(entries.map((e) => walkEntry(e, '', out)));
  return out;
}

function topLevelName(picked: Picked[]): string {
  const first = picked[0]?.path ?? 'folder';
  return first.split('/')[0] || 'folder';
}

/**
 * Build a matcher from the folder's root-most `.gitignore` so we upload exactly
 * what git would keep — a picked folder has no git context, so this is what keeps
 * gitignored secrets/.env/local dirs OUT of the upload (never leave the browser).
 */
async function buildGitignore(picked: Picked[]): Promise<{ dir: string; ig: ReturnType<typeof ignore> } | null> {
  const gis = picked.filter((p) => /(^|\/)\.gitignore$/.test(p.path));
  if (!gis.length) return null;
  gis.sort((a, b) => a.path.split('/').length - b.path.split('/').length || a.path.length - b.path.length);
  const g = gis[0]!;
  const dir = g.path.includes('/') ? g.path.slice(0, g.path.lastIndexOf('/') + 1) : '';
  try {
    return { dir, ig: ignore().add(await g.file.text()) };
  } catch {
    return null;
  }
}

export function UploadPicker({
  onClose,
  onScan,
}: {
  onClose: () => void;
  onScan: (zip: Blob, name: string) => Promise<boolean>;
}) {
  const router = useRouter();
  const folderRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ name: string; count: number; bytes: number; gitignore: boolean } | null>(null);
  // The zipped upload is held here after a successful drop/pick so the user can
  // review it and press Scan — we no longer auto-start the scan on drop.
  const [prepared, setPrepared] = useState<{ blob: Blob; name: string } | null>(null);

  // 'ready' still lets the user interact (press Scan / re-choose / cancel).
  const busy = status === 'preparing' || status === 'starting';

  const humanSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

  /** Build a zip Blob from picked entries (or pass a dropped .zip straight through). */
  async function prepare(picked: Picked[]): Promise<{ blob: Blob; name: string; count: number; bytes: number; gitignore: boolean } | null> {
    // A single .zip → send as-is (user already packaged it). The backend applies
    // the same .gitignore + ignore rules on extract, so it's still filtered.
    if (picked.length === 1 && /\.zip$/i.test(picked[0]!.file.name)) {
      const f = picked[0]!.file;
      return { blob: f, name: f.name.replace(/\.zip$/i, '') || 'upload', count: 1, bytes: f.size, gitignore: false };
    }
    // Skip exactly what the repo's .gitignore would — secrets/.env/local dirs
    // never leave the browser, so the scan matches what you'd actually deploy.
    const gi = await buildGitignore(picked);
    const gitignored = (path: string): boolean => {
      if (!gi || !path.startsWith(gi.dir)) return false;
      const rel = path.slice(gi.dir.length);
      if (!rel) return false;
      try { return gi.ig.ignores(rel); } catch { return false; }
    };
    const kept = picked.filter((p) => keep(p.path, p.file.size) && !gitignored(p.path));
    if (!kept.length) { setError('No scannable source files found in that folder.'); return null; }

    const files: Record<string, Uint8Array> = {};
    let bytes = 0;
    for (const p of kept) {
      const buf = new Uint8Array(await p.file.arrayBuffer());
      // Strip a common single top-level dir? No — the engine scans nested trees fine.
      files[p.path] = buf;
      bytes += buf.length;
    }
    const zipped = await new Promise<Uint8Array>((res, rej) => zip(files, { level: 6 }, (e, d) => (e ? rej(e) : res(d))));
    return { blob: new Blob([zipped as BlobPart], { type: 'application/zip' }), name: topLevelName(kept), count: kept.length, bytes, gitignore: !!gi };
  }

  async function handlePicked(picked: Picked[]) {
    setError(null);
    if (!picked.length) { setError('Nothing selected.'); return; }
    // A single loose file that isn't a .zip (e.g. a PDF or one source file dropped
    // by mistake) — a folder always arrives as many entries with nested paths.
    if (picked.length === 1 && !/\.zip$/i.test(picked[0]!.file.name) && !picked[0]!.path.includes('/')) {
      setError('Please upload a .zip of your project folder, or drop the whole folder.');
      return;
    }
    setStatus('preparing');
    setSummary(null);
    try {
      const prepped = await prepare(picked);
      if (!prepped) { setStatus('idle'); return; }
      if (prepped.blob.size > MAX_ZIP_BYTES) {
        // The single biggest cause of a too-big upload is a self-zipped project
        // that still has node_modules/build output in it (our folder picker skips
        // those automatically, but a hand-made .zip won't). Lead with that fix.
        setError(`This upload is ${humanSize(prepped.blob.size)} — over the ${MAX_ZIP_BYTES / 1024 / 1024}MB limit. Try uploading just your source code: skip node_modules and build folders (that’s usually what makes it too big). Dropping the folder instead of a .zip does this for you.`);
        setStatus('idle');
        return;
      }
      // Two-step: hold the zip and show an "upload ready" summary — the user must
      // press Scan to actually start (no surprise auto-scan on drop).
      setSummary({ name: prepped.name, count: prepped.count, bytes: prepped.bytes, gitignore: prepped.gitignore });
      setPrepared({ blob: prepped.blob, name: prepped.name });
      setStatus('ready');
    } catch {
      setError('Could not read that folder — try again, or upload a .zip instead.');
      setStatus('idle');
    }
  }

  const runScan = async () => {
    if (!prepared) return;
    setStatus('starting');
    const ok = await onScan(prepared.blob, prepared.name);
    if (!ok) setStatus('ready'); // stay open on failure so the user can retry
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    await handlePicked(await fromDataTransfer(e.dataTransfer));
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div onClick={busy ? undefined : onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(10,10,10,.28)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[520px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
        <h2 className="font-semibold text-[20px] tracking-[-0.02em] mb-[6px]">Upload a folder</h2>
        <p className="text-[15px] text-muted mb-[12px]">Scan code straight from your computer — no GitHub needed. We zip it in your browser (respecting your <code className="font-mono">.gitignore</code> and skipping <code className="font-mono">node_modules</code>, tests, and build output), scan it, and delete it. Your code is never stored.</p>
        <p className="text-[13.5px] text-muted mb-[18px]" style={{ opacity: 0.85 }}>Tip: for an exact scan of what’s actually live, <button onClick={() => router.push('/settings')} className="text-yellow-dark font-semibold underline">connect GitHub</button> — it scans exactly what you’ve pushed.</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !busy && folderRef.current?.click()}
          className="cursor-pointer rounded-[16px] border-2 border-dashed p-8 text-center transition-colors"
          style={{ borderColor: dragging ? '#F3C500' : '#DCDCD8', background: dragging ? '#FFFBEB' : '#FBFBFA' }}
        >
          <div className="flex justify-center mb-2 text-tertiary">
            {status === 'preparing' ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            ) : status === 'ready' ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="#1F9D57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            )}
          </div>
          {status === 'preparing' ? (
            <div className="font-semibold text-[16px]">Packaging your folder…</div>
          ) : status === 'starting' ? (
            <div className="font-semibold text-[16px]">Uploading &amp; starting scan…</div>
          ) : status === 'ready' ? (
            <>
              <div className="font-semibold text-[16px]">Upload ready</div>
              <div className="text-[14px] text-muted mt-1">Click to choose a different folder</div>
            </>
          ) : (
            <>
              <div className="font-semibold text-[16px]">Drag a folder here, or click to choose</div>
              <div className="text-[14px] text-muted mt-1">Whole project folder, or a <code className="font-mono">.zip</code> — up to {MAX_ZIP_BYTES / 1024 / 1024}MB</div>
            </>
          )}
        </div>

        {summary && !error && (
          <div className="mt-3 flex items-center gap-2 text-[14px] text-muted">
            {status === 'ready' && <span className="shrink-0 w-[7px] h-[7px] rounded-full bg-green" />}
            <span><span className="font-semibold text-ink">{summary.name}</span> · {summary.count} files · {humanSize(summary.bytes)}{summary.gitignore ? ' · respected .gitignore' : ''}</span>
          </div>
        )}
        {error && <div className="mt-3 text-[14px] text-red">{error}</div>}

        {/* Hidden inputs: folder picker (webkitdirectory) + .zip picker. */}
        <input
          ref={folderRef}
          type="file"
          multiple
          className="hidden"
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          onChange={(e) => { if (e.target.files) void handlePicked(fromFileList(e.target.files)); }}
        />
        <input
          ref={zipRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => { if (e.target.files) void handlePicked(fromFileList(e.target.files)); }}
        />

        <div className="flex gap-[10px] mt-5">
          <button onClick={onClose} disabled={busy} className="vg-press flex-1 bg-card border border-border rounded-[10px] py-[13px] font-semibold text-[15.5px] text-muted disabled:opacity-60">Cancel</button>
          {status === 'ready' ? (
            <>
              <button onClick={() => !busy && folderRef.current?.click()} disabled={busy} className="vg-press flex-1 bg-bg-soft border border-border rounded-[10px] py-[13px] font-semibold text-[15.5px] disabled:opacity-60">Choose different</button>
              <button onClick={runScan} disabled={busy} className="vg-press flex-1 bg-ink text-white rounded-[10px] py-[13px] font-semibold text-[15.5px] disabled:opacity-70">Scan</button>
            </>
          ) : (
            <>
              <button onClick={() => !busy && zipRef.current?.click()} disabled={busy} className="vg-press flex-1 bg-bg-soft border border-border rounded-[10px] py-[13px] font-semibold text-[15.5px] disabled:opacity-60">Choose a .zip</button>
              <button onClick={() => !busy && folderRef.current?.click()} disabled={busy} className="vg-press flex-1 bg-ink text-white rounded-[10px] py-[13px] font-semibold text-[15.5px] disabled:opacity-70">{status === 'preparing' ? 'Working…' : 'Choose folder'}</button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
