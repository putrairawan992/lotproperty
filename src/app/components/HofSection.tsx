import { useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AgentAvatar from "./AgentAvatar";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";

/* ─── Tier palette ──────────────────────────────────────────────── */
const TIER_COLORS = {
  gold:    { base: "#caa54c", light: "#f3dca0", glow: "#e8c267" },
  silver:  { base: "#9da3ad", light: "#eef1f5", glow: "#c7cedb" },
  bronze:  { base: "#a3673c", light: "#e6b487", glow: "#cf8e57" },
  neutral: { base: "#4a4950", light: "#8a8890", glow: "transparent" },
} as const;
type Tier = keyof typeof TIER_COLORS;

const RANK_LABELS: Record<number, string> = { 1: "WINNER", 2: "RUNNER-UP", 3: "TOP 3", 4: "#4", 5: "#5" };
const rankToTier = (r: number): Tier => r === 1 ? "gold" : r === 2 ? "silver" : r === 3 ? "bronze" : "neutral";

/* ─── Slide variants ────────────────────────────────────────────── */
const VARIANTS = {
  enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit:  (d: number) => ({ opacity: 0, x: d >= 0 ? -36 : 36 }),
};

/* ─── Wing laurel SVG (same geometry as HofAwardLaurel) ─────────── */
function leafPath(len: number, w: number) {
  return `M0,0 C${(len*0.18).toFixed(2)},${(-w*0.55).toFixed(2)} ${(len*0.86).toFixed(2)},${(-w*0.5).toFixed(2)} ${len.toFixed(2)},0 C${(len*0.86).toFixed(2)},${(w*0.5).toFixed(2)} ${(len*0.18).toFixed(2)},${(w*0.55).toFixed(2)} 0,0 Z`;
}

function WingLeaves({ gradId, count }: { gradId: string; count: number }) {
  const cx = 100, cy = 100, R = 74;
  const startDeg = 55, endDeg = -55;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t     = i / (count - 1);
        const deg   = startDeg + (endDeg - startDeg) * t;
        const rad   = (deg * Math.PI) / 180;
        const x     = cx + R * Math.cos(rad);
        const y     = cy + R * Math.sin(rad);
        const taper = 0.55 + 0.55 * Math.sin(t * Math.PI);
        const len   = 27 * taper;
        const w     = 11.5 * taper;
        const tilt  = deg - 90 + 25;
        const op    = 0.72 + 0.28 * Math.sin(t * Math.PI);
        return (
          <path key={i} d={leafPath(len, w)}
            transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${tilt.toFixed(2)})`}
            fill={`url(#${gradId})`} opacity={op} />
        );
      })}
    </>
  );
}

function WreathRing({ tier, size }: { tier: Tier; size: number }) {
  const uid    = useId().replace(/:/g, "");
  const gradId = `hof-ring-${tier}-${uid}`;
  const c      = TIER_COLORS[tier];
  return (
    <svg
      viewBox="0 0 200 200" width={size} height={size}
      style={{ overflow: "visible", filter: tier !== "neutral" ? `drop-shadow(0 0 7px ${c.glow}55)` : undefined }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="100%" stopColor={c.base} />
        </linearGradient>
      </defs>
      <g><WingLeaves gradId={gradId} count={9} /></g>
      <g transform="translate(200,0) scale(-1,1)"><WingLeaves gradId={gradId} count={9} /></g>
    </svg>
  );
}

/* ─── Crown SVG ─────────────────────────────────────────────────── */
function CrownIcon({ size = 24, color = "#f3dca0" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 17l2-8 4 5 3-9 3 9 4-5 2 8H3Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <rect x="3" y="18" width="18" height="2" rx="1" fill={color} />
    </svg>
  );
}

/* ─── Single agent card ─────────────────────────────────────────── */
function AgentCard({ agent, isMobile }: { agent: any; isMobile: boolean }) {
  const rank = agent.rank as number;
  const tier = rankToTier(rank);
  const c    = TIER_COLORS[tier];

  const ringSz = isMobile
    ? ({ 1: 130, 2: 108, 3: 108, 4: 86, 5: 86 } as Record<number,number>)[rank] ?? 86
    : ({ 1: 160, 2: 132, 3: 132, 4: 104, 5: 104 } as Record<number,number>)[rank] ?? 104;
  const avatarSz = isMobile
    ? ({ 1: 72, 2: 56, 3: 56, 4: 44, 5: 44 } as Record<number,number>)[rank] ?? 44
    : ({ 1: 88, 2: 72, 3: 72, 4: 56, 5: 56 } as Record<number,number>)[rank] ?? 56;
  const showGlow = rank <= 3;

  return (
    <div className="flex flex-col items-center text-center" style={{ opacity: rank >= 4 ? 0.88 : 1 }}>
      <div className="relative flex items-center justify-center" style={{ width: ringSz, height: ringSz }}>
        {showGlow && (
          <div className="absolute rounded-full pointer-events-none mix-blend-screen"
            style={{
              width: ringSz * 0.7, height: ringSz * 0.7,
              background: `radial-gradient(circle, ${c.glow}, transparent 70%)`,
              opacity: rank === 1 ? 0.65 : 0.38,
              filter: "blur(14px)",
            }} />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <WreathRing tier={tier} size={ringSz} />
        </div>
        <div className="relative z-10 rounded-full overflow-hidden"
          style={{
            width: avatarSz, height: avatarSz,
            boxShadow: showGlow
              ? `0 0 ${rank === 1 ? 20 : 10}px ${c.glow}55, 0 2px 8px rgba(0,0,0,0.5)`
              : "0 2px 8px rgba(0,0,0,0.4)",
            border: `2px solid ${showGlow ? c.base + "80" : "rgba(255,255,255,0.1)"}`,
          }}>
          <AgentAvatar initials={agent.initials} photo={agent.photo} size={avatarSz} isMe={agent.isMe} />
        </div>
      </div>

      <p className="font-normal tracking-[0.12em] mt-2 leading-none"
        style={{
          fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
          fontSize: isMobile ? (rank === 1 ? 16 : 13) : (rank === 1 ? 17 : 14),
          color: c.light,
        }}>
        {RANK_LABELS[rank]}
      </p>
      <p className="font-semibold mt-1 leading-tight line-clamp-1"
        style={{ color: "#f3f2ee", fontSize: isMobile ? (rank === 1 ? 14 : 12) : (rank === 1 ? 15 : 13), fontFamily: "'Inter', sans-serif", maxWidth: ringSz }}>
        {agent.name}
      </p>
      <p className="mt-0.5 leading-none line-clamp-1"
        style={{ color: "#57555c", fontSize: isMobile ? 10 : 11, fontFamily: "'Inter', sans-serif", maxWidth: ringSz }}>
        {agent.value}
      </p>
      {agent.isMe && (
        <span className="mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(202,165,76,0.18)", color: "#f3dca0", border: "1px solid rgba(202,165,76,0.3)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>
          YOU
        </span>
      )}
    </div>
  );
}

/* ─── Category label + crown — prominent center piece ───────────── */
function CategoryHero({ hofCat }: { hofCat: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hofCat}
        className="flex flex-col items-center mb-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Crown */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 18 }}
          style={{ filter: "drop-shadow(0 0 12px rgba(243,220,160,0.7))" }}
        >
          <CrownIcon size={32} color="#f3dca0" />
        </motion.div>

        {/* Divider lines flanking the text */}
        <div className="flex items-center gap-3 mt-2 w-full max-w-xs px-2">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(243,220,160,0.3))" }} />
          <motion.p
            className="text-center font-normal tracking-[0.18em] uppercase leading-none whitespace-nowrap"
            style={{
              fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
              fontSize: 15,
              color: "#f3dca0",
              letterSpacing: "0.2em",
            }}
          >
            {hofCat}
          </motion.p>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(243,220,160,0.3), transparent)" }} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Main HofSection export ────────────────────────────────────── */
export default function HofSection({
  hofCat, hofAgents, hofTab, hofIdx, slideDir, isMobile, isDark,
  onSwitchCat, onGoTab, onPrev, onNext,
}: {
  hofCat: string; hofAgents: any[]; hofTab: string; hofIdx: number;
  slideDir: number; isMobile: boolean; isDark: boolean;
  onSwitchCat: (c: string) => void; onGoTab: (c: string) => void;
  onPrev: () => void; onNext: () => void;
}) {
  const PODIUM_VISUAL_ORDER = [3, 1, 0, 2, 4];

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "radial-gradient(ellipse 800px 280px at 50% -10%, rgba(255,255,255,0.03), transparent 70%), #0d0d10",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top gold glow */}
      <div className="absolute inset-x-0 top-0 h-28 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 100% at 50% -5%, rgba(202,165,76,0.16), transparent 70%)" }} />
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* ── Header ── */}
      <div className="relative z-[1] text-center pt-5 px-4 pb-0">
        <p className="text-[11px] font-semibold tracking-[0.38em] uppercase mb-1.5"
          style={{ color: "#87858d", fontFamily: "'Inter', sans-serif" }}>
          Official Selection
          <span className="mx-2 opacity-50">·</span>
          July 2026
        </p>
        <motion.h2
          className="font-normal uppercase leading-none m-0"
          style={{ fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif", fontSize: isMobile ? 28 : 34, color: "#f3f2ee", letterSpacing: "0.06em" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          Hall of Fame
        </motion.h2>
      </div>

      {/* ── Tabs ── */}
      <div className="relative z-[1] mt-4">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none z-10"
          style={{ background: "linear-gradient(90deg, #0d0d10, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-10"
          style={{ background: "linear-gradient(270deg, #0d0d10, transparent)" }} />
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-0.5" style={{ scrollbarWidth: "none" }}>
          {HOF_TABS.map((cat) => {
            const active = hofTab === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => onSwitchCat(cat)}
                className="flex-shrink-0 whitespace-nowrap text-[13px] font-semibold rounded-full"
                style={{
                  padding: "8px 16px",
                  border: `1px solid ${active ? "#f3f2ee" : "rgba(255,255,255,0.07)"}`,
                  fontFamily: "'Inter', sans-serif",
                }}
                animate={{
                  background: active ? "#f3f2ee" : "rgba(0,0,0,0)",
                  color: active ? "#0c0c0e" : "#87858d",
                }}
                transition={{ duration: 0.18 }}
                whileTap={{ scale: 0.96 }}>
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Podium ── */}
      <div className="relative z-[1] mt-2">
        {/* Desktop nav buttons */}
        {!isMobile && hofIdx > 0 && (
          <button onClick={onPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#87858d" }}>
            <ChevronLeft size={16} />
          </button>
        )}
        {!isMobile && hofIdx < HOF_TABS.length - 1 && (
          <button onClick={onNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#87858d" }}>
            <ChevronRight size={16} />
          </button>
        )}

        {/* Stage glow */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 240, height: 64, background: "radial-gradient(ellipse, rgba(202,165,76,0.13), transparent 70%)" }} />

        <SwipeCarouselZone
          onPrev={hofIdx > 0 ? onPrev : undefined}
          onNext={hofIdx < HOF_TABS.length - 1 ? onNext : undefined}>
          <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
            <motion.div
              key={hofCat}
              custom={slideDir}
              variants={VARIANTS}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pt-5 pb-2"
            >
              {/* Category hero label + crown */}
              <CategoryHero hofCat={hofCat} />

              {/* Desktop: single row 4–2–1–3–5 */}
              <div className="hidden sm:flex items-end justify-center gap-5 px-10">
                {PODIUM_VISUAL_ORDER.map((agIdx, col) => {
                  const agent = hofAgents[agIdx];
                  const displayRank = [4, 2, 1, 3, 5][col];
                  if (!agent) return <div key={col} style={{ width: 120 }} />;
                  return (
                    <div key={col} style={{ paddingBottom: displayRank === 1 ? 4 : displayRank <= 3 ? 14 : 26 }}>
                      <AgentCard agent={{ ...agent, rank: displayRank }} isMobile={false} />
                    </div>
                  );
                })}
              </div>

              {/* Mobile: #1 hero row, then 2+3, then 4+5 */}
              <div className="sm:hidden px-4">
                <div className="flex justify-center mb-5">
                  {hofAgents[0] && <AgentCard agent={{ ...hofAgents[0], rank: 1 }} isMobile />}
                </div>
                <div className="flex justify-center gap-6 mb-4">
                  {hofAgents[1] && <AgentCard agent={{ ...hofAgents[1], rank: 2 }} isMobile />}
                  {hofAgents[2] && <AgentCard agent={{ ...hofAgents[2], rank: 3 }} isMobile />}
                </div>
                <div className="flex justify-center gap-6">
                  {hofAgents[3] && <AgentCard agent={{ ...hofAgents[3], rank: 4 }} isMobile />}
                  {hofAgents[4] && <AgentCard agent={{ ...hofAgents[4], rank: 5 }} isMobile />}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </SwipeCarouselZone>
      </div>

      {/* ── Pagination ── */}
      <div className="relative z-[1] text-center px-4 pt-3 pb-5">
        <p className="text-[11px] mb-2.5" style={{ color: "#57555c", fontFamily: "'Inter', sans-serif", letterSpacing: "0.3px" }}>
          Menampilkan peringkat 1–{Math.min(hofAgents.length, 5)} dari {hofAgents.length} agen
        </p>
        <div className="flex gap-1.5 justify-center">
          {HOF_TABS.map((_, i) => (
            <button key={i} onClick={() => onGoTab(HOF_TABS[i])}
              className="rounded-full transition-all"
              style={{
                width: hofIdx === i ? 16 : 5,
                height: 5,
                background: hofIdx === i ? "#f3dca0" : "rgba(255,255,255,0.12)",
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}
