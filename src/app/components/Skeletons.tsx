import { T } from "../types";

export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skShimmer {
        0%   { background-position: -600px 0; }
        100% { background-position:  600px 0; }
      }
      .sk {
        background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-shine) 50%, var(--skeleton-base) 75%);
        background-size: 1200px 100%;
        animation: skShimmer 1.6s infinite linear;
        border-radius: 8px;
        flex-shrink: 0;
      }
    `}</style>
  );
}

/** Single skeleton block — width/height/radius configurable */
export function Sk({ h, w, r = 8, className = "" }: { h: number; w?: number | string; r?: number; className?: string }) {
  return <div className={`sk ${className}`} style={{ height: h, width: w, borderRadius: r }} />;
}

export function HomePageSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      <SkeletonStyles />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border p-5 space-y-3" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <Sk h={56} w={56} r={28} />
            <div className="flex-1 space-y-2">
              <Sk h={16} w="70%" />
              <Sk h={12} w="50%" />
            </div>
            <Sk h={40} w={40} r={10} />
          </div>
          <Sk h={8} w="100%" r={4} />
          <Sk h={12} w="60%" />
        </div>
        <div className="bg-card rounded-2xl border p-5 lg:col-span-2 space-y-3" style={{ borderColor: T.border }}>
          <Sk h={20} w={100} r={20} />
          <Sk h={28} w="55%" />
          <Sk h={36} w="40%" />
          <Sk h={14} w="70%" />
          <Sk h={40} w={140} r={12} />
        </div>
      </div>
      <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
        <div className="flex items-center justify-between mb-4">
          <Sk h={20} w={120} />
          <div className="flex gap-1.5">{[80,80,80,80,80,80,80,80].map((w,i) => <Sk key={i} h={26} w={w} r={20} />)}</div>
        </div>
        <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: T.muted }}>
          <div className="flex items-end justify-center gap-4">
            {[48,64,44].map((sz, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <Sk h={sz} w={sz} r={sz/2} />
                <Sk h={13} w={60} />
                <Sk h={12} w={70} />
                <Sk h={i===0?36:i===1?48:24} w="100%" r="8px 8px 0 0" />
              </div>
            ))}
          </div>
        </div>
        {[1,2].map(i => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl" style={{ backgroundColor: T.muted }}>
            <Sk h={14} w={14} r={4} />
            <Sk h={36} w={36} r={18} />
            <Sk h={14} w="55%" />
            <div className="ml-auto flex gap-1"><Sk h={30} w={44} r={6} /><Sk h={30} w={44} r={6} /></div>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border p-5 space-y-2" style={{ borderColor: T.border }}>
        <Sk h={20} w={160} className="mb-3" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border" style={{ borderColor: T.border }}>
            <Sk h={32} w={32} r={10} />
            <Sk h={36} w={36} r={18} />
            <div className="flex-1 space-y-1.5"><Sk h={13} w="60%" /><Sk h={10} w="40%" /></div>
            <div className="flex gap-1 hidden sm:flex"><Sk h={30} w={52} r={6} /><Sk h={30} w={52} r={6} /></div>
            <div className="text-right space-y-1"><Sk h={14} w={56} /><Sk h={10} w={28} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuestPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <SkeletonStyles />
      <div className="bg-card rounded-2xl border p-5 space-y-3" style={{ borderColor: T.border }}>
        <div className="flex justify-between">
          <div className="space-y-2"><Sk h={14} w={100} /><Sk h={40} w={180} /></div>
          <div className="space-y-1 text-right"><Sk h={12} w={60} /><Sk h={28} w={40} /></div>
        </div>
        <Sk h={10} w="100%" r={5} />
        <Sk h={12} w="55%" />
      </div>
      <div className="bg-card rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: T.border }}>
        <Sk h={40} w={40} r={10} />
        <div className="flex-1 space-y-2"><Sk h={14} w="50%" /><Sk h={11} w="70%" /></div>
        <Sk h={14} w={40} />
      </div>
      <div className="rounded-2xl border p-4 flex items-center gap-3 justify-between" style={{ borderColor: T.border, backgroundColor: "var(--accent)" }}>
        <div className="flex gap-3 items-center"><Sk h={44} w={44} r={10} /><div className="space-y-2"><Sk h={14} w={140} /><Sk h={11} w={180} /></div></div>
        <Sk h={40} w={160} r={12} />
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
          <div className="flex justify-between px-5 py-3 border-b" style={{ borderColor: T.border, backgroundColor: T.muted }}>
            <Sk h={16} w={120} /><Sk h={14} w={60} />
          </div>
          {[1,2,3].map(j => (
            <div key={j} className="flex items-center gap-4 px-5 py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <Sk h={32} w={32} r={8} />
              <div className="flex-1 space-y-2"><Sk h={13} w="65%" /><Sk h={5} w="100%" r={3} /></div>
              <Sk h={13} w={55} /><Sk h={32} w={52} r={8} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListingPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      <SkeletonStyles />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-card rounded-2xl border p-4 text-center space-y-2" style={{ borderColor: T.border }}>
            <Sk h={28} w={40} className="mx-auto" /><Sk h={12} w={70} className="mx-auto" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
        <div className="flex gap-3 p-4 border-b" style={{ borderColor: T.border }}>
          <Sk h={38} w="100%" r={12} className="flex-1" /><Sk h={38} w={120} r={12} /><Sk h={38} w={100} r={12} />
        </div>
        <div className="flex border-b" style={{ borderColor: T.border }}>
          {[1,2,3,4].map(i => <Sk key={i} h={44} w={80} r={0} className="mx-4 my-2" />)}
        </div>
        <div className="p-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex-1 space-y-1.5"><Sk h={14} w="70%" /><Sk h={11} w="45%" /></div>
              <Sk h={13} w={60} /><Sk h={13} w={80} /><Sk h={24} w={65} r={20} /><Sk h={13} w={80} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProspectPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <SkeletonStyles />
      <div className="flex justify-between mb-5"><Sk h={28} w={120} /><Sk h={38} w={160} r={12} /></div>
      <div className="flex gap-2 flex-wrap mb-5">
        {[60,100,90,70,55,65,55].map((w,i) => <Sk key={i} h={32} w={w} r={20} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-card rounded-2xl border p-4 space-y-3" style={{ borderColor: T.border }}>
            <div className="flex items-start gap-3">
              <Sk h={40} w={40} r={20} />
              <div className="flex-1 space-y-2"><Sk h={14} w="70%" /><Sk h={11} w="50%" /></div>
              <Sk h={22} w={70} r={20} />
            </div>
            <Sk h={11} w="90%" /><Sk h={11} w="60%" />
            <Sk h={12} w="45%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <SkeletonStyles />
      <Sk h={48} w="100%" r={16} />
      <div className="flex justify-between items-center"><Sk h={24} w={200} /><Sk h={24} w={140} r={20} /></div>
      <div className="flex gap-2 overflow-x-hidden">
        {[1,2,3,4,5,6].map(i => <Sk key={i} h={34} w={110} r={20} className="flex-shrink-0" />)}
      </div>
      <div className="rounded-2xl p-5" style={{ backgroundColor: T.muted }}>
        <div className="flex items-end justify-center gap-4">
          {[{sz:52,h:36},{sz:64,h:48},{sz:48,h:24}].map(({sz,h},i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Sk h={sz} w={sz} r={sz/2} /><Sk h={13} w={60} /><Sk h={12} w={70} />
              <div className="w-full rounded-t-xl" style={{ height: h, backgroundColor: "var(--border)" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border" style={{ borderColor: T.border }}>
            <Sk h={32} w={32} r={10} /><Sk h={40} w={40} r={20} />
            <div className="flex-1 space-y-2"><Sk h={13} w="60%" /><Sk h={11} w="40%" /></div>
            <Sk h={30} w={52} r={8} /><div className="space-y-1"><Sk h={14} w={56} /><Sk h={10} w={28} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  // @container: matches ProfilePage's real layout — sized off the actual rendered
  // width (narrow when embedded in AgentProfileSheet) instead of the viewport, so the
  // loading skeleton doesn't render a squished desktop grid inside the sheet modal.
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto @container">
      <SkeletonStyles />
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <Sk h={280} w="100%" r={0} />
            <Sk h={46} w="100%" r={0} />
          </div>
          <div className="bg-card rounded-2xl border p-5 space-y-3" style={{ borderColor: T.border }}>
            <Sk h={16} w={140} className="mb-1" />
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: T.muted }}>
                <Sk h={16} w={16} r={8} /><div className="flex-1 space-y-1.5"><Sk h={13} w="65%" /><Sk h={10} w="40%" /></div><Sk h={18} w={28} />
              </div>
            ))}
          </div>
        </div>
        <div className="@lg:col-span-2 space-y-5">
          <div className="bg-card rounded-2xl border p-5 space-y-4" style={{ borderColor: T.border }}>
            <div className="flex justify-between"><div className="space-y-2"><Sk h={26} w={180} /><Sk h={14} w={220} /></div><div className="flex gap-2"><Sk h={36} w={110} r={12} /><Sk h={36} w={36} r={18} /></div></div>
            <div className="grid grid-cols-3 gap-4 py-4 border-y" style={{ borderColor: T.border }}>
              {[1,2,3].map(i => <div key={i} className="text-center space-y-2"><Sk h={26} w={50} className="mx-auto" /><Sk h={11} w={60} className="mx-auto" /></div>)}
            </div>
            <Sk h={10} w="100%" r={5} />
            <div className="flex gap-3">{[1,2,3,4].map(i => <Sk key={i} h={80} w={80} r={14} />)}</div>
          </div>
          <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
            <Sk h={16} w={140} className="mb-4" />
            <div className="grid grid-cols-2 @sm:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="p-3 rounded-xl space-y-2" style={{ backgroundColor: T.muted }}><Sk h={24} w={60} /><Sk h={11} w={80} /></div>)}
            </div>
          </div>
          <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
            <div className="flex justify-between mb-4"><Sk h={16} w={140} /><div className="flex gap-1">{[1,2,3,4,5,6].map(i=><Sk key={i} h={26} w={60} r={8} />)}</div></div>
            <div className="grid grid-cols-3 @sm:grid-cols-4 @lg:grid-cols-5 gap-3">
              {[...Array(15)].map((_, i) => <Sk key={i} h={96} w="100%" r={14} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      <SkeletonStyles />
      <Sk h={28} w={160} />
      <div className="flex gap-1 overflow-x-hidden">{[1,2,3,4,5,6].map(i=><Sk key={i} h={44} w={90} r={0} />)}</div>
      <div className="space-y-2">
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className="flex items-start gap-3 p-4 bg-card rounded-2xl border" style={{ borderColor: T.border }}>
            <Sk h={36} w={36} r={10} />
            <div className="flex-1 space-y-2"><Sk h={14} w="70%" /><Sk h={11} w="85%" /><Sk h={10} w="35%" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AcademyPageSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <SkeletonStyles />
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="space-y-2">
          <Sk h={28} w={120} />
          <Sk h={12} w={240} />
        </div>
        <Sk h={34} w={200} r={20} />
      </div>
      <div className="flex gap-2 overflow-x-hidden mb-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Sk key={i} h={34} w={110} r={20} className="flex-shrink-0" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-card rounded-2xl border p-5 space-y-4" style={{ borderColor: T.border }}>
            <div className="flex justify-between"><Sk h={18} w={80} /><Sk h={18} w={18} r={9} /></div>
            <Sk h={24} w="85%" />
            <div className="space-y-2">
              <div className="flex justify-between"><Sk h={12} w={60} /><Sk h={12} w={40} /></div>
              <Sk h={5} w="100%" r={2.5} />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed" style={{ borderColor: T.border }}>
              <Sk h={14} w={60} />
              <Sk h={28} w={65} r={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

