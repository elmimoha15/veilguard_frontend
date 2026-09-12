'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './state';
import { GradeRing, GradeLetter } from './ui';
import { PillButton } from './primitives';

export default function EmptyScreen() {
  const router = useRouter();
  const { celebrateNow } = useApp();

  useEffect(() => { celebrateNow(); }, [celebrateNow]);

  return (
    <div className="vg-fade text-center py-10">
      <div className="mx-auto w-[200px] h-[200px]">
        <GradeRing size={200} pct={100} color="#1F9D57" track="#EAF6EF" strokeWidth={9}>
          <GradeLetter letter="A" color="#1F9D57" size={76} halftone={false} className="vg-pop" />
        </GradeRing>
      </div>
      <h1 className="font-semibold text-[28px] tracking-[-0.025em] mt-[24px] mb-[7px]">You’re in the clear</h1>
      <p className="text-[15px] text-muted max-w-[46ch] mx-auto leading-[1.55]">
        Every issue is fixed and nothing new has surfaced. We’ll keep watching on every deploy, you’ll
        hear from us only if something changes.
      </p>
      <div className="mt-6">
        <PillButton onClick={() => router.push('/apps')}>Review fixed findings</PillButton>
      </div>
    </div>
  );
}
