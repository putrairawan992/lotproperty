import { motion, AnimatePresence } from "motion/react";
import AgentAvatar from "./AgentAvatar";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";

const HOF_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

const TIER = {
  1: { color: "#f3dca0", glow: "rgba(232,194,103,0.55)", border: "#caa54c", badgeBg: "#caa54c", badgeText: "#1a1208" },
  2: { color: "#eef1f5", glow: "rgba(199,206,219,0.45)", border: "#9da3ad", badgeBg: "#d4dae3", badgeText: "#1a1a1e" },
  3: { color: "#e6b487", glow: "rgba(207,142,87,0.45)",  border: "#a3673c", badgeBg: "#cf8e57", badgeText: "#1a0e06" },
};

function RankBadge({ rank }: { rank: number }) {
  const t = TIER[rank as 1 | 2 | 3] ?? TIER[3];
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-full font-black"
      style={{
        bottom: -6,
        minWidth: 26,
        height: 22,
        padding: "0 7px",
        background: t.badgeBg,
        border: `2px solid ${t.border}`,
        color: t.badgeText,
        fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
        fontSize: 12,
        letterSpacing: "0.06em",
        boxShadow: "0 2px 10px rgba(0,0,0,0.55), 0 0 0 2px rgba(13,13,16,0.95)",
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
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 16 }}
                style={{ filter: "drop-shadow(0 0 10px rgba(243,220,160,0.9))" }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M2 18h20v2H2v-2Z" fill="#f3dca0" />
                  <path d="M3 17l2.5-9L9 13l3-8 3 8 3.5-5L21 17H3Z" fill="#f3dca0" />
                  <circle cx="3" cy="8" r="1.5" fill="#f3dca0" />
                  <circle cx="21" cy="8" r="1.5" fill="#f3dca0" />
                  <circle cx="12" cy="5" r="1.5" fill="#f3dca0" />
                </svg>
              </motion.div>
            )}
            {/* Avatar + rank badge */}
            <div className="relative flex-shrink-0 pb-2">
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
      <div className="relative z-[1] px-4 pt-5 pb-0 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.32)", fontFamily: "'Inter', sans-serif" }}>
            Official Selection · July 2026
          </p>
          <motion.h2
            className="font-normal uppercase leading-none m-0"
            style={{
              fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
              fontSize: isMobile ? 32 : 40,
              letterSpacing: "0.05em",
              background: "linear-gradient(135deg, #f3dca0 0%, #e8c267 40%, #caa54c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 14px rgba(232,194,103,0.35))",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Hall of Fame
          </motion.h2>
        </div>
        {/* Dot nav indicator */}
        <div className="flex gap-1 flex-wrap justify-end max-w-[120px] mt-1">
          {HOF_TABS.map((_, i) => (
            <button
              key={i}
              onClick={() => onGoTab(HOF_TABS[i])}
              className="rounded-full transition-all"
              style={{
                width: hofIdx === i ? 14 : 4,
                height: 4,
                background: hofIdx === i ? "#f3dca0" : "rgba(255,255,255,0.18)",
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
                <motion.div
                  key={hofCat}
                  className="flex items-center justify-center gap-3 mb-4 px-4"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(243,220,160,0.55))" }} />
                  <p
                    className="text-center font-normal uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
                      fontSize: 16,
                      letterSpacing: "0.24em",
                      background: "linear-gradient(135deg, #fff8e7 0%, #f3dca0 35%, #e8c267 70%, #caa54c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 10px rgba(243,220,160,0.45))",
                    }}
                  >
                    {hofCat}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(243,220,160,0.55), transparent)" }} />
                </motion.div>
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
