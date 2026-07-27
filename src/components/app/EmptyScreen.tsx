'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { GradeRing, GradeLetter } from './ui';

export default function EmptyScreen() {
  const router = useRouter();
  const { celebrateNow } = useApp();

  useEffect(() => { celebrateNow(); }, [celebrateNow]);

  return (
    <div className="vg-fade text-center py-10">
      <div className="mx-auto w-[200px] h-[200px]">
        <GradeRing size={200} pct={100} color="#1FB86B" track="rgba(31,184,107,.2)" strokeWidth={9}>
          <GradeLetter letter="A" color="#1FB86B" size={76} halftone={false} className="vg-pop" />
        </GradeRing>
      </div>
      <h1 className="font-extrabold text-[34px] tracking-[-0.02em] mt-[22px] mb-[6px]">You’re in the clear ✨</h1>
      <p className="text-[16px] text-muted max-w-[44ch] mx-auto">
        Every issue is fixed and nothing new has surfaced. We’ll keep watching on every deploy — you’ll
        hear from us only if something changes.
      </p>
      <button onClick={() => router.push('/findings')} className="vg-press mt-6 bg-ink text-white rounded-[11px] px-6 py-[14px] font-bold text-[15px]">
        Review fixed findings
      </button>
    </div>
  );
}
