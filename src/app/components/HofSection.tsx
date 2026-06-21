import { motion, AnimatePresence } from "motion/react";
import { Crown } from "lucide-react";
import AgentAvatar from "./AgentAvatar";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";

const HOF_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

const TIER = {
  1: { color: "#f3dca0", glow: "rgba(232,194,103,0.55)", border: "rgba(243,220,160,0.45)", bg: "rgba(202,165,76,0.15)" },
  2: { color: "#eef1f5", glow: "rgba(199,206,219,0.45)", border: "rgba(238,241,245,0.35)", bg: "rgba(157,163,173,0.12)" },
  3: { color: "#e6b487", glow: "rgba(207,142,87,0.45)",  border: "rgba(230,180,135,0.35)", bg: "rgba(163,103,60,0.12)"  },
};

function RankBadge({ rank }: { rank: number }) {
  const t = TIER[rank as 1 | 2 | 3] ?? TIER[3];
  return (
    <div
      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
        fontSize: 11,
        letterSpacing: "0.08em",
      }}
    >
      #{rank}
    </div>
  );
}

/** Top-3 podium: order 2 – 1 – 3 */
function PodiumTop3({ agents, isMobile }: { agents: any[]; isMobile: boolean }) {
  const order: [number, number][] = [[1, 0], [0, 1], [2, 2]]; // [displayOrder, agentIdx]

  const sizes = {
    avatar: { 1: isMobile ? 60 : 72, 2: isMobile ? 48 : 56, 3: isMobile ? 44 : 52 } as Record<number, number>,
    nameSize: { 1: "13px", 2: "11px", 3: "11px" } as Record<number, string>,
    valueSize: { 1: "11px", 2: "10px", 3: "10px" } as Record<number, string>,
  };

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 pt-2 pb-1">
      {order.map(([dispOrd, agIdx]) => {
        const rank = dispOrd + 1;
        const agent = agents[agIdx];
        if (!agent) return <div key={dispOrd} className="flex-1 max-w-[90px]" />;
        const t = TIER[rank as 1 | 2 | 3];
        const sz = sizes.avatar[rank];

        return (
          <div
            key={dispOrd}
            className="flex flex-col items-center flex-1 gap-2"
            style={{ maxWidth: rank === 1 ? 100 : 82, paddingBottom: rank === 1 ? 0 : 10 }}
          >
            {/* Crown for #1 */}
            {rank === 1 && (
              <Crown size={14} style={{ color: "#f3dca0", filter: "drop-shadow(0 0 6px rgba(232,194,103,0.8))" }} />
            )}
            {/* Avatar + rank badge */}
            <div className="relative flex-shrink-0">
              <div
                className="rounded-full"
                style={{
                  padding: 2,
                  background: `linear-gradient(135deg, ${t.color}, transparent)`,
                  boxShadow: `0 0 ${rank === 1 ? 20 : 12}px ${t.glow}`,
                }}
              >
                <AgentAvatar initials={agent.initials} photo={agent.photo} size={sz} />
              </div>
              <RankBadge rank={rank} />
            </div>

            {/* Name + value */}
            <div className="text-center w-full px-0.5 mt-1.5">
              <p
                className="font-bold leading-tight line-clamp-1"
                style={{ color: rank === 1 ? t.color : "rgba(255,255,255,0.88)", fontSize: sizes.nameSize[rank], fontFamily: "'Rajdhani', sans-serif" }}
              >
                {agent.name.split(" ")[0]}
              </p>
              <p
                className="mt-0.5 truncate"
                style={{ color: "rgba(255,255,255,0.45)", fontSize: sizes.valueSize[rank], fontFamily: "'Inter', sans-serif" }}
              >
                {agent.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Rank 4 & 5 as compact strip */
function RankStrip({ agents }: { agents: any[] }) {
  const rest = agents.slice(3, 5);
  if (!rest.length) return null;
  return (
    <div
      className="mt-3 mx-2 flex gap-2 rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {rest.map((agent, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 px-3 py-2">
          <span
            className="text-[11px] font-black flex-shrink-0 w-5 text-right"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rajdhani', sans-serif" }}
          >
            #{i + 4}
          </span>
          <AgentAvatar initials={agent.initials} photo={agent.photo} size={28} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "'Rajdhani', sans-serif" }}>
              {agent.name.split(" ")[0]}
            </p>
            <p className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "'Inter', sans-serif" }}>
              {agent.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HofSection({
  hofCat, hofAgents, hofTab, hofIdx, slideDir, isMobile, isDark,
  onSwitchCat, onGoTab, onPrev, onNext,
}: {
  hofCat: string; hofAgents: any[]; hofTab: string; hofIdx: number;
  slideDir: number; isMobile: boolean; isDark: boolean;
  onSwitchCat: (cat: string) => void; onGoTab: (cat: string) => void;
  onPrev: () => void; onNext: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #0e0c10 0%, #100e14 60%, #0a0810 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Gold radial glow top-center */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 100% at 50% -10%, rgba(202,165,76,0.18) 0%, transparent 70%)" }}
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      {/* ── Header ── */}
      <div className="relative z-[1] px-4 pt-4 pb-0 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] tracking-[0.38em] uppercase font-semibold mb-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
            Official Selection
          </p>
          <motion.h2
            className="font-normal uppercase tracking-[0.06em] leading-none"
            style={{ fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif", fontSize: isMobile ? 26 : 32, color: "#f3f2ee" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            Hall of Fame
          </motion.h2>
          <p className="text-[10px] mt-0.5 tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
            July 2026
          </p>
        </div>
        {/* Dot nav indicator */}
        <div className="flex gap-1 flex-wrap justify-end max-w-[120px] mt-1">
          {HOF_TABS.map((_, i) => (
            <button
              key={i}
              onClick={() => onGoTab(HOF_TABS[i])}
              className="rounded-full transition-all"
              style={{
                width: hofIdx === i ? 12 : 4,
                height: 4,
                background: hofIdx === i ? "rgba(243,220,160,0.8)" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="relative z-[1] flex gap-1.5 overflow-x-auto px-4 pt-3 pb-0" style={{ scrollbarWidth: "none" }}>
        {HOF_TABS.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => onSwitchCat(cat)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
            animate={{
              backgroundColor: hofTab === cat ? "rgba(202,165,76,0.18)" : "rgba(255,255,255,0.04)",
              color: hofTab === cat ? "#f3dca0" : "rgba(255,255,255,0.38)",
              borderColor: hofTab === cat ? "rgba(202,165,76,0.4)" : "rgba(255,255,255,0.07)",
            }}
            style={{ border: "1px solid", fontFamily: "'Inter', sans-serif" }}
            transition={{ duration: 0.18 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* ── Agents (slide) ── */}
      <div className="relative z-[1] pb-4">
        <SwipeCarouselZone
          onPrev={hofIdx > 0 ? onPrev : undefined}
          onNext={hofIdx < HOF_TABS.length - 1 ? onNext : undefined}
        >
          <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
            <motion.div
              key={hofCat}
              custom={slideDir}
              variants={HOF_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="px-4 pt-4"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={hofCat}
                  className="text-center text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
                  style={{ color: "rgba(243,220,160,0.6)", fontFamily: "'Inter', sans-serif" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {hofCat}
                </motion.p>
              </AnimatePresence>

              <PodiumTop3 agents={hofAgents} isMobile={isMobile} />
              <RankStrip agents={hofAgents} />
            </motion.div>
          </AnimatePresence>
        </SwipeCarouselZone>
      </div>
    </div>
  );
}
