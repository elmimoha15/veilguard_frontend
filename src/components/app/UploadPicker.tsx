'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { zip } from 'fflate';
import ignore from 'ignore';
import ActionButton from '@/components/ui/ActionButton';

const FolderGlyph = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
const ScanGlyph = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 12l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /></svg>;

/**
 * Folder / .zip upload chooser for a Pro white-box scan. Supports a folder picker,
 * a drag-and-drop zone (folders or a .zip), and a .zip file picker. Everything is
 * zipped CLIENT-SIDE with junk filtered out, so only source bytes leave the
 * browser. `onScan(zip, name)` returns false to keep the modal open on failure.
 */

// Dirs the scanner never reads, filtered client-side so uploads stay small.
const IGNORE = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', 'out',
  'venv', '.venv', '__pycache__', 'vendor', '.tox', '.mypy_cache', '.pytest_cache', '.gradle',
  // Test/fixture artifacts, not deployed, so scanning them is false-positive noise.
  'test-fixtures', 'fixtures', '__tests__', '__mocks__', '.storybook', 'cypress', 'e2e',
]);
const MAX_FILE_BYTES = 2_000_000; // engine skips bigger files anyway
// No hard cap, uploads stream browser→cloud so any size is accepted. Above this
// we just warn the user the scan may take a while.
const WARN_ZIP_BYTES = 75 * 1024 * 1024;

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
          readBatch(); // readEntries returns in chunks, keep going until empty
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
 * what git would keep, a picked folder has no git context, so this is what keeps
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
  onScan: (zip: Blob, name: string, onProgress?: (frac: number) => void) => Promise<boolean>;
}) {
  const router = useRouter();
  const folderRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // upload progress 0→1 while 'starting'
  const [summary, setSummary] = useState<{ name: string; count: number; bytes: number; gitignore: boolean } | null>(null);
  // The zipped upload is held here after a successful drop/pick so the user can
  // review it and press Scan, we no longer auto-start the scan on drop.
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
    // Skip exactly what the repo's .gitignore would, secrets/.env/local dirs
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
      // Strip a common single top-level dir? No, the engine scans nested trees fine.
      files[p.path] = buf;
      bytes += buf.length;
    }
    const zipped = await new Promise<Uint8Array>((res, rej) => zip(files, { level: 6 }, (e, d) => (e ? rej(e) : res(d))));
    return { blob: new Blob([zipped as BlobPart], { type: 'application/zip' }), name: topLevelName(kept), count: kept.length, bytes, gitignore: !!gi };
  }

  async function handlePicked(picked: Picked[]) {
    setError(null);
    setWarn(null);
    if (!picked.length) { setError('Nothing selected.'); return; }
    // A single loose file that isn't a .zip (e.g. a PDF or one source file dropped
    // by mistake), a folder always arrives as many entries with nested paths.
    if (picked.length === 1 && !/\.zip$/i.test(picked[0]!.file.name) && !picked[0]!.path.includes('/')) {
      setError('Please upload a .zip of your project folder, or drop the whole folder.');
      return;
    }
    setStatus('preparing');
    setSummary(null);
    try {
      const prepped = await prepare(picked);
      if (!prepped) { setStatus('idle'); return; }
      // No size limit, big uploads are fine, they just take longer. Warn (don't
      // block) so the user knows a large folder will be slower to scan.
      if (prepped.blob.size > WARN_ZIP_BYTES) {
        setWarn(`That’s a big upload (${humanSize(prepped.blob.size)}), it’ll upload and scan fine, it just may take a few minutes.`);
      }
      // Two-step: hold the zip and show an "upload ready" summary, the user must
      // press Scan to actually start (no surprise auto-scan on drop).
      setSummary({ name: prepped.name, count: prepped.count, bytes: prepped.bytes, gitignore: prepped.gitignore });
      setPrepared({ blob: prepped.blob, name: prepped.name });
      setStatus('ready');
    } catch {
      setError('Could not read that folder, try again, or upload a .zip instead.');
      setStatus('idle');
    }
  }

  const runScan = async () => {
    if (!prepared) return;
    setProgress(0);
    setStatus('starting');
    const ok = await onScan(prepared.blob, prepared.name, (frac) => setProgress(frac));
    if (!ok) setStatus('ready'); // stay open on failure so the user can retry
  };

  /** Choose a folder via the standard webkitdirectory input, no File System
   *  Access API, so no "allow this site to view and copy files" permission grant. */
  const chooseFolder = () => { if (!busy) folderRef.current?.click(); };

  // Let the user drop a folder ANYWHERE on the screen (not just the dashed box).
  // preventDefault on dragover is required or the browser just opens the file.
  useEffect(() => {
    const over = (e: DragEvent) => {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types).includes('Files')) return;
      e.preventDefault();
      if (!busy) setDragging(true);
    };
    const leave = (e: DragEvent) => { if (e.relatedTarget === null) setDragging(false); };
    const drop = async (e: DragEvent) => {
      if (!e.dataTransfer) return;
      e.preventDefault();
      setDragging(false);
      if (busy) return;
      await handlePicked(await fromDataTransfer(e.dataTransfer));
    };
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      {/* Full-screen drop target, a folder can be dropped ANYWHERE on the page. */}
      {dragging && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center pointer-events-none" style={{ background: 'rgba(10,10,10,.06)' }}>
          <div className="rounded-[18px] border-2 border-dashed px-9 py-7 text-center vg-pop" style={{ borderColor: '#0A0A0A', background: 'var(--color-bg-soft)' }}>
            <div className="font-semibold text-[19px]">Drop your folder to scan it</div>
            <div className="text-[14px] text-muted mt-1">Release anywhere on the screen</div>
          </div>
        </div>
      )}
      <div onClick={busy ? undefined : onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(10,10,10,.28)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[520px] bg-card border border-border rounded-[16px] p-7 vg-pop shadow-[var(--shadow-pop)]">
        <h2 className="font-semibold text-[20px] tracking-[-0.02em] mb-[6px]">Upload a folder</h2>
        <p className="text-[15px] text-muted mb-[18px]">Zipped in your browser, scanned, then deleted, never stored. Or <button onClick={() => router.push('/settings')} className="text-ink font-semibold underline">connect GitHub</button> to scan what’s live.</p>

        {/* Drop zone */}
        <div
          onClick={() => { if (!busy) void chooseFolder(); }}
          className="cursor-pointer rounded-[16px] border-2 border-dashed p-8 text-center transition-colors"
          style={{ borderColor: dragging ? '#0A0A0A' : '#DCDCD8', background: dragging ? 'var(--color-bg-soft)' : '#FBFBFA' }}
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
            <>
              <div className="font-semibold text-[16px]">{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Starting your scan…'}</div>
              <div className="mt-3 h-[6px] rounded-full bg-bg-soft overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${Math.max(4, Math.round(progress * 100))}%`, background: '#0A0A0A' }} />
              </div>
            </>
          ) : status === 'ready' ? (
            <>
              <div className="font-semibold text-[16px]">Upload ready</div>
              <div className="text-[14px] text-muted mt-1">Click to choose a different folder</div>
            </>
          ) : (
            <>
              <div className="font-semibold text-[16px]">Drag a folder here, or click to choose</div>
              <div className="text-[14px] text-muted mt-1">Whole project folder, or a <code className="font-mono">.zip</code>, any size</div>
            </>
          )}
        </div>

        {summary && !error && (
          <div className="mt-3 flex items-center gap-2 text-[14px] text-muted">
            {status === 'ready' && <span className="shrink-0 w-[7px] h-[7px] rounded-full bg-green" />}
            <span><span className="font-semibold text-ink">{summary.name}</span> · {summary.count} files · {humanSize(summary.bytes)}{summary.gitignore ? ' · respected .gitignore' : ''}</span>
          </div>
        )}
        {warn && !error && <div className="mt-3 text-[13.5px]" style={{ color: '#9A6412' }}>{warn}</div>}
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

        <div className="flex gap-[10px] mt-5">
          <ActionButton variant="cancel" onClick={onClose} disabled={busy} className="flex-1 h-[46px]">Cancel</ActionButton>
          {status === 'ready' || status === 'starting' ? (
            <>
              <ActionButton variant="outline" onClick={chooseFolder} disabled={busy} icon={<FolderGlyph />} className="flex-1 h-[46px]">Choose different</ActionButton>
              <ActionButton onClick={runScan} disabled={busy} icon={<ScanGlyph />} tooltip="Scan your code" className="flex-1 h-[46px]">{status === 'starting' ? 'Scanning…' : 'Scan'}</ActionButton>
            </>
          ) : (
            <ActionButton onClick={chooseFolder} disabled={busy} icon={<FolderGlyph />} tooltip="Whole project folder" className="flex-1 h-[46px]">{status === 'preparing' ? 'Working…' : 'Choose folder'}</ActionButton>
          )}
        </div>
      </div>
      </div>
    </>,
    document.body,
  );
}
