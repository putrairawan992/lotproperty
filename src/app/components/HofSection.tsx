import { motion, AnimatePresence } from "motion/react";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";
import borderAsset from "@/imports/border_asset.png";

const HOF_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

const ACCENT = "#f3dca0";
const GLOW: Record<number, string> = {
  1: "rgba(232,194,103,0.6)",
  2: "rgba(232,194,103,0.4)",
  3: "rgba(232,194,103,0.4)",
  4: "transparent",
  5: "transparent",
};

// Border asset aspect ratio ≈ 2:3 (683×1024) — heights keep that ratio so the frame doesn't distort.
// Equal-size lineup (gambar 2 style): all cards same width.
const CARD_W = { desktop: 170, mobile: 138 } as const;

function PortraitCard({
  agent,
  rank,
  isMobile,
}: {
  agent: any;
  rank: number;
  isMobile: boolean;
}) {
  const w = isMobile ? CARD_W.mobile : rank === 1 ? 190 : rank <= 3 ? 170 : 150;
  const h = Math.round(w * 1.5);
  const isWinner = rank === 1;

  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: w }}>
      {/* Portrait card */}
      <div className="relative" style={{ width: w, height: h }}>
        {/* Glow behind card */}
        <div
          className="absolute -inset-2 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, ${GLOW[rank] !== "transparent" ? GLOW[rank] : "rgba(232,194,103,0.22)"}, transparent 70%)`,
            opacity: isWinner ? 0.85 : 0.45,
          }}
        />

        {/* Photo — inset to sit inside the frame window */}
        <div
          className="absolute overflow-hidden"
          style={{ top: "4%", bottom: "4.5%", left: "7%", right: "7%", borderRadius: 4, background: "#15110c" }}
        >
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold"
              style={{
                background: "linear-gradient(160deg, #2a2520, #1a1612)",
                color: ACCENT,
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: w * 0.3,
              }}
            >
              {agent.initials}
            </div>
          )}
        </div>

        {/* Border frame asset overlay */}
        <img
          src={borderAsset}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
        />

        {/* Rank pill — top center, inside frame */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center font-black"
          style={{
            top: "1.5%",
            minWidth: 24,
            height: 19,
            padding: "0 6px",
            background: "rgba(20,16,10,0.88)",
            color: ACCENT,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 12,
            borderRadius: 3,
            border: "1px solid rgba(202,165,76,0.5)",
          }}
        >
          #{rank}
        </div>

        {agent.isMe && (
          <div
            className="absolute z-20 px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-wider"
            style={{ bottom: "7%", left: "50%", transform: "translateX(-50%)", background: "#caa54c", color: "#1a1208", fontFamily: "'Inter', sans-serif" }}
          >
            YOU
          </div>
        )}
      </div>

      {/* Name + value below card (lineup style) */}
      <p
        className="mt-2.5 text-center uppercase leading-none truncate w-full px-0.5"
        style={{
          fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
          fontSize: isWinner ? 17 : 15,
          letterSpacing: "0.06em",
          background: "linear-gradient(135deg, #fff8e7 0%, #f3dca0 40%, #e8c267 75%, #caa54c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))",
        }}
      >
        {agent.name.split(" ")[0]}
      </p>
      <p
        className="mt-1 text-center leading-tight line-clamp-1 w-full px-0.5"
        style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Inter', sans-serif" }}
      >
        {agent.value}
      </p>
    </div>
  );
}

/** All 5 agents in an equal-size row (gambar 2 lineup). Mobile: horizontal scroll. */
function PortraitPodium({ agents, isMobile }: { agents: any[]; isMobile: boolean }) {
  const lineup = agents.slice(0, 5); // already rank 1..5 in order

  if (isMobile) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 pt-2 pb-3 snap-x" style={{ scrollbarWidth: "none" }}>
        {lineup.map((agent, i) => (
          <div key={i} className="snap-center">
            <PortraitCard agent={agent} rank={i + 1} isMobile />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-4 px-2 pt-3 pb-2">
      {lineup.map((agent, i) => (
        <PortraitCard key={i} agent={agent} rank={i + 1} isMobile={false} />
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
