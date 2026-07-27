import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-center px-6 vg-fade">
      <div className="font-extrabold text-[120px] leading-none text-yellow">404</div>
      <p className="text-[18px] text-white/70 mt-3 mb-6">
        This page slipped through a door we haven’t scanned yet.
      </p>
      <Link href="/" className="vg-press bg-yellow text-ink font-bold text-[15px] rounded-[11px] px-[26px] py-[14px]">
        Back to home
      </Link>
    </div>
  );
}
