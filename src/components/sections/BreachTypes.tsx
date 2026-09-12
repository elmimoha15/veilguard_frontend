import { CenterHead } from '@/components/sections/annot/kit';
import { BREACH_TYPES } from '@/content/landing';

/** "What actually goes wrong" — six failure modes as clean Annot cards. */
export default function BreachTypes() {
  return (
    <section id="risks" className="an-x an-sec scroll-mt-20">
      <div className="an-max">
        <CenterHead
          eyebrow="What actually goes wrong"
          title="Six ways a weekend app quietly hands over the keys."
          sub="None of these show up as a bug. Your app looks like it works, because it does. The doors it left unlocked are simply invisible until someone walks through one."
        />

        <div className="mt-14 grid gap-px bg-[#E8E7E3] sm:grid-cols-2 lg:grid-cols-3">
          {BREACH_TYPES.map((b) => (
            <div key={b.title} className="bg-white px-7 py-8 flex flex-col">
              <h3 className="text-[18px] font-semibold leading-[1.25] text-ink">{b.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted flex-1">{b.means} {b.cost}</p>
              {b.seen && (
                <p className="mt-5 text-[12px] text-faint">Seen in the wild: <span className="text-muted">{b.seen}</span></p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
