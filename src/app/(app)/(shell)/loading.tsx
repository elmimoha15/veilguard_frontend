export default function ShellLoading() {
  return (
    <div className="vg-fade">
      <div className="vg-skel w-[240px] h-[34px] mb-5" />
      <div className="grid grid-cols-1 min-[720px]:grid-cols-[minmax(280px,1.1fr)_2fr] gap-4">
        <div className="vg-skel h-[172px]" />
        <div className="vg-skel h-[172px]" />
      </div>
      <div className="grid grid-cols-2 min-[720px]:grid-cols-4 gap-[14px] mt-4">
        <div className="vg-skel h-24" />
        <div className="vg-skel h-24" />
        <div className="vg-skel h-24" />
        <div className="vg-skel h-24" />
      </div>
      <div className="vg-skel h-[180px] mt-4" />
    </div>
  );
}
