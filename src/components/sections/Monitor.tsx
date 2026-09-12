import { CenterHead } from '@/components/sections/annot/kit';
import MonitorEmail from '@/components/sections/shots/MonitorEmail';

/** "Always on" monitoring — centered header + a Gmail-style alert email. */
export default function Monitor() {
  return (
    <section className="an-x an-sec">
      <div className="an-max">
        <CenterHead
          eyebrow="Always on"
          title="You'll keep vibe-coding. We'll keep watching."
          sub="Every new feature can open a new hole. Veilguard re-scans your app on every deploy and emails you the moment something breaks, so a shipping streak never turns into a breach."
        />

        <div className="mt-14">
          <MonitorEmail />
        </div>
      </div>
    </section>
  );
}
