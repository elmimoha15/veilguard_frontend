'use client';

import ProductFrame from '@/components/ui/ProductFrame';
import CodePanel from '@/components/ui/CodePanel';
import { SeverityChip } from '@/components/app/primitives';

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-[#F1F0EC] px-2.5 py-1 text-[11px] font-medium text-[#6E6E6A]">{children}</span>;
}

/** A real finding-detail with the exact fix, built from the app's CodePanel. */
export default function FixShot() {
  return (
    <ProductFrame url="app.veilguard.dev/finding" bodyClassName="p-5 sm:p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityChip sev="CRITICAL" />
        <Pill>Supabase RLS</Pill>
        <Pill>CWE-284</Pill>
      </div>
      <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.01em] text-ink">Your orders table is readable by any logged-in user.</h2>
      <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: '#737373' }}>
        In plain English: anyone signed in can read every customer&apos;s orders, names and emails. One policy closes it.
      </p>

      <div className="mt-4">
        <CodePanel
          tone="good"
          label="THE FIX"
          filename="policies.sql"
          action={<span className="inline-flex items-center gap-1.5 text-white/70 text-[11px]">Copy</span>}
        >
{`-- each user can read only their own rows
create policy "read own orders"
  on public.orders for select
  using ( auth.uid() = user_id );`}
        </CodePanel>
      </div>

      <div className="mt-3 rounded-[12px] border border-[#EDECE8] bg-[#FAFAF9] p-3.5">
        <div className="text-[11.5px] font-medium text-[#8B8A86]">Or let your AI do it</div>
        <p className="mt-1 text-[13px] leading-[1.5] text-ink">
          Paste this into Cursor or Lovable: &quot;Add a Supabase RLS policy on orders so each user only reads their own rows.&quot;
        </p>
      </div>
    </ProductFrame>
  );
}
