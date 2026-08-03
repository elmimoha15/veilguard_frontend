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
  const [status, setStatus] = useState<'idle' | 'preparing' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ name: string; count: number; bytes: number; gitignore: boolean } | null>(null);

  const busy = status !== 'idle';

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
    setStatus('preparing');
    setSummary(null);
    try {
      const prepped = await prepare(picked);
      if (!prepped) { setStatus('idle'); return; }
      if (prepped.blob.size > MAX_ZIP_BYTES) {
        setError(`That’s ${humanSize(prepped.blob.size)} zipped — the limit is ${MAX_ZIP_BYTES / 1024 / 1024}MB. Remove large assets and try again.`);
        setStatus('idle');
        return;
      }
      setSummary({ name: prepped.name, count: prepped.count, bytes: prepped.bytes, gitignore: prepped.gitignore });
      setStatus('starting');
      const ok = await onScan(prepped.blob, prepped.name);
      if (!ok) setStatus('idle'); // stay open so the user can retry
    } catch {
      setError('Could not read that folder — try again, or upload a .zip instead.');
      setStatus('idle');
    }
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    await handlePicked(await fromDataTransfer(e.dataTransfer));
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div onClick={busy ? undefined : onClose} className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'rgba(30,29,27,.5)', backdropFilter: 'blur(3px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[520px] bg-card rounded-[20px] p-8 vg-pop shadow-[0_30px_70px_-24px_rgba(0,0,0,.6)]">
        <h2 className="font-extrabold text-[22px] tracking-[-0.02em] mb-[6px]">Upload a folder</h2>
        <p className="text-[14px] text-muted mb-[12px]">Scan code straight from your computer — no GitHub needed. We zip it in your browser (respecting your <code className="font-mono">.gitignore</code> and skipping <code className="font-mono">node_modules</code>, tests, and build output), scan it, and delete it. Your code is never stored.</p>
        <p className="text-[12.5px] text-muted mb-[18px]" style={{ opacity: 0.85 }}>Tip: for an exact scan of what’s actually live, <button onClick={() => router.push('/settings')} className="text-yellow-dark font-semibold underline">connect GitHub</button> — it scans exactly what you’ve pushed.</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !busy && folderRef.current?.click()}
          className="cursor-pointer rounded-[16px] border-2 border-dashed p-8 text-center transition-colors"
          style={{ borderColor: dragging ? '#F3C500' : '#E4E3DE', background: dragging ? '#FFF7D6' : '#FAFAF8' }}
        >
          <div className="text-[34px] mb-1">{status === 'preparing' ? '📦' : '📁'}</div>
          {status === 'preparing' ? (
            <div className="font-bold text-[15px]">Packaging your folder…</div>
          ) : status === 'starting' ? (
            <div className="font-bold text-[15px]">Uploading &amp; starting scan…</div>
          ) : (
            <>
              <div className="font-bold text-[15px]">Drag a folder here, or click to choose</div>
              <div className="text-[13px] text-muted mt-1">Whole project folder, or a <code className="font-mono">.zip</code> — up to {MAX_ZIP_BYTES / 1024 / 1024}MB</div>
            </>
          )}
        </div>

        {summary && !error && (
          <div className="mt-3 text-[13px] text-muted">
            <span className="font-semibold text-fg">{summary.name}</span> · {summary.count} files · {humanSize(summary.bytes)}{summary.gitignore ? ' · respected .gitignore' : ''}
          </div>
        )}
        {error && <div className="mt-3 text-[13px] text-red">{error}</div>}

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
          <button onClick={onClose} disabled={busy} className="vg-press flex-1 bg-card border border-border-2 rounded-[11px] py-[13px] font-bold text-[14.5px] text-muted disabled:opacity-60">Cancel</button>
          <button onClick={() => !busy && zipRef.current?.click()} disabled={busy} className="vg-press flex-1 bg-bg-soft border border-border-2 rounded-[11px] py-[13px] font-bold text-[14.5px] disabled:opacity-60">Choose a .zip</button>
          <button onClick={() => !busy && folderRef.current?.click()} disabled={busy} className="vg-press flex-1 bg-yellow text-ink rounded-[11px] py-[13px] font-bold text-[14.5px] disabled:opacity-70">{busy ? 'Working…' : 'Choose folder'}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
