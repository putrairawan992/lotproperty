import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";

const HOF_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

const CARD_W = { desktop: 170, mobile: 138 } as const;

const RANK_THEMES: Record<number, {
  borderColor: string;
  glowColor: string;
  boxShadow: string;
  hoverBoxShadow: string;
  badgeBg: string;
  badgeTextColor: string;
  accentColor: string;
}> = {
  1: {
    borderColor: "#ffd700", // Bright gold
    glowColor: "rgba(250, 204, 21, 0.45)",
    boxShadow: "0 0 20px rgba(250, 204, 21, 0.65), 0 0 40px rgba(250, 204, 21, 0.25), inset 0 1px 2px rgba(255,255,255,0.2)",
    hoverBoxShadow: "0 0 35px rgba(250, 204, 21, 0.95), 0 0 70px rgba(250, 204, 21, 0.45), inset 0 1px 2px rgba(255,255,255,0.35)",
    badgeBg: "linear-gradient(135deg, #E8A500, #C8922A)",
    badgeTextColor: "#ffffff",
    accentColor: "#f3dca0",
  },
  2: {
    borderColor: "#e5e7eb", // Bright silver
    glowColor: "rgba(229, 231, 235, 0.35)",
    boxShadow: "0 0 18px rgba(229, 231, 235, 0.5), 0 0 36px rgba(229, 231, 235, 0.2), inset 0 1px 2px rgba(255,255,255,0.2)",
    hoverBoxShadow: "0 0 32px rgba(229, 231, 235, 0.8), 0 0 64px rgba(229, 231, 235, 0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
    badgeBg: "linear-gradient(135deg, #9CA3AF, #4B5563)",
    badgeTextColor: "#ffffff",
    accentColor: "#d1d5db",
  },
  3: {
    borderColor: "#fb923c", // Bright bronze
    glowColor: "rgba(251, 146, 60, 0.35)",
    boxShadow: "0 0 18px rgba(251, 146, 60, 0.5), 0 0 36px rgba(251, 146, 60, 0.2), inset 0 1px 2px rgba(255,255,255,0.2)",
    hoverBoxShadow: "0 0 32px rgba(251, 146, 60, 0.8), 0 0 64px rgba(251, 146, 60, 0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
    badgeBg: "linear-gradient(135deg, #B87333, #78350F)",
    badgeTextColor: "#ffffff",
    accentColor: "#fdba74",
  },
  4: {
    borderColor: "rgba(99, 102, 241, 0.45)", // Neon Indigo
    glowColor: "rgba(99, 102, 241, 0.2)",
    boxShadow: "0 0 12px rgba(99, 102, 241, 0.35), 0 0 24px rgba(99, 102, 241, 0.15), inset 0 1px 2px rgba(255,255,255,0.1)",
    hoverBoxShadow: "0 0 25px rgba(99, 102, 241, 0.7), 0 0 50px rgba(99, 102, 241, 0.35), inset 0 1px 2px rgba(255,255,255,0.2)",
    badgeBg: "rgba(30, 30, 35, 0.8)",
    badgeTextColor: "rgba(255, 255, 255, 0.7)",
    accentColor: "rgba(255, 255, 255, 0.7)",
  },
  5: {
    borderColor: "rgba(99, 102, 241, 0.45)", // Neon Indigo
    glowColor: "rgba(99, 102, 241, 0.2)",
    boxShadow: "0 0 12px rgba(99, 102, 241, 0.35), 0 0 24px rgba(99, 102, 241, 0.15), inset 0 1px 2px rgba(255,255,255,0.1)",
    hoverBoxShadow: "0 0 25px rgba(99, 102, 241, 0.7), 0 0 50px rgba(99, 102, 241, 0.35), inset 0 1px 2px rgba(255,255,255,0.2)",
    badgeBg: "rgba(30, 30, 35, 0.8)",
    badgeTextColor: "rgba(255, 255, 255, 0.7)",
    accentColor: "rgba(255, 255, 255, 0.7)",
  },
};

function reorderToPodium(arr: any[]): any[] {
  const n = arr.length;
  if (n <= 1) return [...arr];
  if (n === 2) return [arr[1], arr[0]];
  if (n === 3) return [arr[1], arr[0], arr[2]];
  if (n === 4) return [arr[3], arr[1], arr[0], arr[2]];
  if (n === 5) return [arr[4], arr[2], arr[0], arr[1], arr[3]];
  return [...arr];
}

function PortraitCard({
  agent,
  rank,
  isMobile,
}: {
  agent: any;
  rank: number;
  isMobile: boolean;
}) {
  const w = isMobile ? 200 : rank === 1 ? 190 : rank <= 3 ? 170 : 150;
  const h = Math.round(w * 1.5);
  const isWinner = rank === 1;
  const theme = RANK_THEMES[rank] || RANK_THEMES[5];

  return (
    <motion.div
      className="flex flex-col items-center flex-shrink-0"
      style={{ width: w }}
      whileHover={isMobile ? {} : { y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Portrait card wrapper */}
      <motion.div
        className="relative overflow-hidden w-full"
        style={{
          height: h,
          borderRadius: 20,
          border: `2px solid ${theme.borderColor}`,
          boxShadow: theme.boxShadow,
          background: "linear-gradient(180deg, #1f1d24 0%, #0f0e12 100%)",
        }}
        whileHover={isMobile ? {} : {
          boxShadow: theme.hoverBoxShadow,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow behind photo */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme.glowColor}, transparent 80%)`,
          }}
        />

        {/* Photo */}
        <div className="absolute inset-0 w-full h-full">
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold"
              style={{
                background: "linear-gradient(160deg, #2a2520, #1a1612)",
                color: theme.accentColor,
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: w * 0.3,
              }}
            >
              {agent.initials}
            </div>
          )}
        </div>

        {/* Bottom subtle gradient shadow overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Rank pill */}
        <div
          className="absolute top-3 left-3 z-20 flex items-center justify-center font-bold px-2.5 py-1 rounded-xl text-[11px]"
          style={{
            background: theme.badgeBg,
            color: theme.badgeTextColor,
            fontFamily: "'Rajdhani', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : rank === 3 ? "🥉 #3" : `#${rank}`}
        </div>

        {/* YOU label */}
        {agent.isMe && (
          <div
            className="absolute top-3 right-3 z-20 px-2 py-1 rounded-xl text-[9px] font-black tracking-wider"
            style={{
              background: "#caa54c",
              color: "#1a1208",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            YOU
          </div>
        )}
      </motion.div>

      {/* Name + value below card */}
      <p
        className="mt-3 text-center uppercase leading-none truncate w-full px-0.5 font-bold"
        style={{
          fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
          fontSize: isWinner ? 18 : 16,
          letterSpacing: "0.06em",
          background: rank === 1
            ? "linear-gradient(135deg, #fff8e7 0%, #f3dca0 40%, #e8c267 75%, #caa54c 100%)"
            : rank === 2
              ? "linear-gradient(135deg, #ffffff 0%, #e5e7eb 50%, #9ca3af 100%)"
              : rank === 3
                ? "linear-gradient(135deg, #ffedd5 0%, #fdba74 50%, #c2410c 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))",
        }}
      >
        {agent.name.split(" ")[0]}
      </p>
      <p
        className="mt-1 text-center leading-tight line-clamp-1 w-full px-0.5 font-medium"
        style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "'Inter', sans-serif" }}
      >
        {agent.value}
      </p>
    </motion.div>
  );
}

/** All 5 agents in a podium layout (Desktop) or auto-sliding slideshow (Mobile) */
function PortraitPodium({ agents, isMobile }: { agents: any[]; isMobile: boolean }) {
  const lineup = agents.slice(0, 5);
  const [activeIdx, setActiveIdx] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  // Reset active index if agents change
  useEffect(() => {
    setActiveIdx(0);
  }, [agents]);

  // Autoplay every 5 seconds on mobile
  useEffect(() => {
    if (!isMobile || lineup.length <= 1) return;
    const interval = setInterval(() => {
      setSlideDir(1);
      setActiveIdx((prev) => (prev + 1) % lineup.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile, lineup.length, activeIdx]);

  if (isMobile) {
    if (lineup.length === 0) return null;
    const activeAgent = lineup[activeIdx];

    const handlePrev = () => {
      setSlideDir(-1);
      setActiveIdx((prev) => (prev - 1 + lineup.length) % lineup.length);
    };

    const handleNext = () => {
      setSlideDir(1);
      setActiveIdx((prev) => (prev + 1) % lineup.length);
    };

    return (
      <div className="flex flex-col items-center w-full px-4">
        {/* Swipe zone for single card */}
        <SwipeCarouselZone
          onPrev={handlePrev}
          onNext={handleNext}
          className="relative w-full flex justify-center overflow-hidden min-h-[340px] items-center"
        >
          <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
            <motion.div
              key={activeIdx}
              custom={slideDir}
              variants={HOF_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex justify-center w-full"
            >
              <PortraitCard agent={activeAgent} rank={activeAgent.rank} isMobile={true} />
            </motion.div>
          </AnimatePresence>
        </SwipeCarouselZone>

        {/* Custom dot indicators for agents on mobile */}
        <div className="flex gap-2 justify-center mt-3 mb-1">
          {lineup.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSlideDir(idx > activeIdx ? 1 : -1);
                setActiveIdx(idx);
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === idx ? 18 : 6,
                height: 6,
                background: activeIdx === idx ? "#f3dca0" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const orderedLineup = reorderToPodium(lineup);

  return (
    <div className="flex items-end justify-center gap-4 px-2 pt-3 pb-2">
      {orderedLineup.map((agent) => (
        <PortraitCard key={agent.rank} agent={agent} rank={agent.rank} isMobile={false} />
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
      className="relative overflow-hidden rounded-[30px]"
      style={{
        background: "radial-gradient(ellipse 900px 280px at 50% -20%, rgba(255,255,255,0.08), transparent 70%), linear-gradient(180deg, #111216 0%, #09090d 45%, #080707 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 30px 90px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 100% at 50% -5%, rgba(202,165,76,0.16), transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* Header */}
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
      </div>

      {/* Tabs */}
      <div className="relative z-[1] mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none z-10" style={{ background: "linear-gradient(90deg, #0d0d10, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none z-10" style={{ background: "linear-gradient(270deg, #0d0d10, transparent)" }} />
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-0.5" style={{ scrollbarWidth: "none" }}>
          {HOF_TABS.map((cat) => {
            const active = hofTab === cat;
            return (
              <motion.button key={cat} onClick={() => onSwitchCat(cat)}
                className="flex-shrink-0 whitespace-nowrap text-[13px] font-semibold rounded-full"
                style={{ padding: "8px 16px", border: `1px solid ${active ? "#f3f2ee" : "rgba(255,255,255,0.07)"}`, fontFamily: "'Inter', sans-serif" }}
                animate={{ background: active ? "#f3f2ee" : "rgba(0,0,0,0)", color: active ? "#0c0c0e" : "#87858d" }}
                transition={{ duration: 0.18 }} whileTap={{ scale: 0.96 }}>
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      <div className="relative z-[1] mt-2 pb-4">
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 280, height: 70, background: "radial-gradient(ellipse, rgba(202,165,76,0.12), transparent 70%)" }} />

        <SwipeCarouselZone onPrev={hofIdx > 0 ? onPrev : undefined} onNext={hofIdx < HOF_TABS.length - 1 ? onNext : undefined} className="relative overflow-hidden">
          <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
            <motion.div key={hofCat} custom={slideDir} variants={HOF_SLIDE_VARIANTS}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="px-3 pt-4">

              <AnimatePresence mode="wait">
                <motion.div key={hofCat} className="flex items-center justify-center gap-3 mb-4 px-2"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(243,220,160,0.55))" }} />
                  <p className="text-center font-normal uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.24em",
                      background: "linear-gradient(135deg, #fff8e7 0%, #f3dca0 35%, #e8c267 70%, #caa54c 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 10px rgba(243,220,160,0.45))",
                    }}>
                    {hofCat}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(243,220,160,0.55), transparent)" }} />
                </motion.div>
              </AnimatePresence>

              <PortraitPodium agents={hofAgents} isMobile={isMobile} />
            </motion.div>
          </AnimatePresence>
        </SwipeCarouselZone>
      </div>

      {/* Pagination */}
      <div className="relative z-[1] text-center px-4 pt-1 pb-5">
        <p className="text-[11px] mb-2.5" style={{ color: "#57555c", fontFamily: "'Inter', sans-serif" }}>
          Menampilkan peringkat 1–{Math.min(hofAgents.length, 5)} dari {hofAgents.length} agen
        </p>
        <div className="flex gap-1.5 justify-center">
          {HOF_TABS.map((_, i) => (
            <button key={i} onClick={() => onGoTab(HOF_TABS[i])} className="rounded-full transition-all"
              style={{ width: hofIdx === i ? 16 : 5, height: 5, background: hofIdx === i ? "#f3dca0" : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
