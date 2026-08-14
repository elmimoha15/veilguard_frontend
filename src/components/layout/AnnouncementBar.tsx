import Link from 'next/link';

/** Thin dark announcement strip at the very top of the site (Sendr-style). */
export default function AnnouncementBar() {
  return (
    <div className="bg-ink text-white text-center text-[13px] px-4 py-2">
      <span className="text-white/70">New: connected GitHub &amp; Supabase deep scans, read-only.</span>{' '}
      <Link href="/scanners" className="font-semibold text-yellow hover:underline underline-offset-2">
        See what we check →
      </Link>
    </div>
  );
}
