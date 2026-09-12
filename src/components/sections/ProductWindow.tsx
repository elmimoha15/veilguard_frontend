/**
 * The product window — a full-width browser card holding the real Veilguard
 * overview dashboard, rounded at the top and open at the bottom so it reads as
 * rising into the page (matches the Claude Design export).
 */
export default function ProductWindow() {
  return (
    <section className="el-x pt-[clamp(36px,5vw,48px)]">
      <div className="bg-white border border-[#E6E5E0] border-b-0 rounded-t-[16px] shadow-[0_-1px_40px_rgba(10,10,10,0.06)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/veilguard-overview.png"
          alt="Veilguard overview dashboard showing scan progress, issues resolved over time, and open risks"
          className="block w-full h-auto"
        />
      </div>
    </section>
  );
}
