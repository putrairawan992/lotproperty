import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Flame, Trophy, Crown, Target, Users, Star, BookOpen, TrendingUp, Building2 } from "lucide-react";
import Card from "../components/Card";
import LevelBadge from "../components/LevelBadge";
import XPBar from "../components/XPBar";
import AgentAvatar from "../components/AgentAvatar";
import { HomePageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import HofFallingStars from "../components/HofFallingStars";
import EventBannerSlider from "../components/EventBannerSlider";
import { T, Page } from "../types";
import { useTabQuery } from "../routes";
import { HOF_CAT_DATA, WEEKLY_LB_DATA, HOF_TABS } from "../appData";
import { getLevelTierColor } from "../badgeAssets";
import HofBadgeRow from "../components/HofBadgeRow";
import PodiumAvatarGlow from "../components/PodiumAvatarGlow";
import SwipeCarouselZone from "../components/SwipeCarouselZone";
import padiLeft from "@/imports/icon-padi-left.png";
import padiRight from "@/imports/icon-padi-right.png";

const getAgentPodiumBadges = (agent: any) => {
  if (agent.badges && agent.badges.length > 0) {
    return agent.badges;
  }
  // Dynamic fallback badges based on level/initials
  if (agent.initials === "AF" || agent.name === "Ahmad Fadhil") {
    return [["epic", "Listing Distributor"], ["rare", "Listing Supplier"], ["common", "First Deal"]];
  }
  if (agent.initials === "DR" || agent.name === "Dewi R.") {
    return [["rare", "Listing Supplier"], ["common", "First Listing"]];
  }
  if (agent.initials === "EP" || agent.name === "Eko P.") {
    return [["common", "First Listing"], ["common", "First Prospect"]];
  }
  if (agent.initials === "AW" || agent.name === "Andi W.") {
    return [["rare", "Prospect Hunter"], ["common", "First Prospect"]];
  }
  // General fallback
  return [["common", "First Listing"]];
};

const HOF_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56 }),
};

export default function HomePage({ onNav, onShowLevelUp }: { onNav: (p: Page) => void; onShowLevelUp?: () => void }) {
  const loading = useLoading(1400);
  const { isDark } = useTheme();
  const [slideDir, setSlideDir] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Sync HoF tab to URL query parameters '?hof=...'
  const [hofTab, setHofTab] = useTabQuery("hof", HOF_TABS[0]);

  const hofTabIdx = HOF_TABS.indexOf(hofTab as typeof HOF_TABS[number]);
  const hofIdx = hofTabIdx === -1 ? 0 : hofTabIdx;
  const hofCat = HOF_TABS[hofIdx];
  const hofAgents = (HOF_CAT_DATA[hofCat] || []) as any[];

  const goHofTab = (cat: string) => {
    const nextIdx = HOF_TABS.indexOf(cat as typeof HOF_TABS[number]);
    if (nextIdx === -1) return;
    setSlideDir(nextIdx === hofIdx ? 0 : nextIdx > hofIdx ? 1 : -1);
    setHofTab(cat);
  };
  const switchHofCat = (cat: string) => { goHofTab(cat); };
  const hofPrev = () => { const ni = Math.max(0, hofIdx - 1); setSlideDir(-1); setHofTab(HOF_TABS[ni]); };
  const hofNext = () => { const ni = Math.min(HOF_TABS.length - 1, hofIdx + 1); setSlideDir(1); setHofTab(HOF_TABS[ni]); };

  if (loading) return <HomePageSkeleton />;
  const podiumBg = isDark
    ? "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(26,20,16,0.72) 100%)"
    : "linear-gradient(180deg, rgba(255,252,240,0.75) 0%, rgba(255,248,239,0.88) 100%)";

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Full-width Profile Widget */}
      <Card
        className="relative overflow-hidden shadow-md transition-all duration-300"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(20,16,12,0.78), rgba(28,22,14,0.62))"
            : "linear-gradient(135deg, rgba(255,252,248,0.9), rgba(255,246,235,0.78))",
          borderColor: isDark ? "rgba(200,146,42,0.22)" : T.border,
        }}
      >
        <HofFallingStars isDark={isDark} />
        <div className="relative z-[1] p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        {/* Left: User Avatar + Name */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C8922A] p-0.5" style={{ boxShadow: "0 0 10px rgba(200,146,42,0.2)" }}>
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"
                alt="Ronald Richy"
                className="w-full h-full object-cover object-top rounded-full"
              />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg md:text-xl" style={{ fontFamily: "var(--font-display)", color: T.text1 }}>Ronald Richy</h2>
            <p className="text-xs" style={{ color: T.text3 }}>Top Producer</p>
            <span className="inline-block text-xs px-2.5 py-0.5 rounded-md font-bold mt-1"
              style={{ backgroundColor: isDark ? "rgba(232,165,0,0.15)" : "#FEF3C7", color: "#D97706", fontFamily: "var(--font-display)" }}>
              Lv. 23
            </span>
          </div>
        </div>

        {/* Middle: Medallion & XP Progress */}
        <div className="flex flex-1 items-center gap-4 min-w-0 w-full md:w-auto">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <LevelBadge title="Senior Agent" size={52} />
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: T.text3, letterSpacing: "0.06em" }}>Current Rank</p>
              <p className="font-bold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 14, color: getLevelTierColor("Senior Agent") }}>Senior Agent</p>
            </div>
          </div>
          {/* XP progress */}
          <div className="flex-1 min-w-0">
            <XPBar value={24680} max={30000} height={10} />
            <p className="text-center text-xs mt-1 font-bold" style={{ fontFamily: "var(--font-numeric)", color: T.text2 }}>
              24,680 <span style={{ color: T.text3, fontWeight: 400 }}>/ 30,000 XP</span>
            </p>
          </div>
        </div>

        {/* Right: Next Rank info */}
        <button
          type="button"
          onClick={() => onNav("profile")}
          className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto text-left md:text-right transition-opacity hover:opacity-85 active:opacity-75 cursor-pointer"
          style={{ borderColor: T.border }}
          aria-label="Lihat detail profil dan progress rank"
        >
          <div>
            <p style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Rank</p>
            <p className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Senior Elite</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <LevelBadge title="Elite Agent" size={48} />
            <ChevronRight size={16} style={{ color: "#E8A500" }} />
          </div>
        </button>
        </div>
      </Card>

      {/* Event Banner Slider — auto-play setiap 3 detik */}
      <EventBannerSlider isDark={isDark} onNav={onNav} />

      {/* HALL OF FAME — dark cinematic */}
      <div className="overflow-hidden rounded-2xl border relative" style={{ borderColor: T.border, backgroundColor: T.card }}>
        <HofFallingStars isDark={isDark} />
        {/* Header */}
        <div className="flex flex-col items-center py-5 px-4 relative overflow-hidden z-[1]" style={{ background: isDark ? "linear-gradient(135deg, rgba(10,10,10,0.72), rgba(21,18,13,0.55))" : "linear-gradient(135deg, rgba(26,18,0,0.88), rgba(13,21,32,0.75))" }}>
          <div className="flex items-center gap-3 w-full justify-between mb-2 relative z-10">
            <div className="flex-1" />
            <div className="flex flex-col items-center relative py-1 px-4">
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <motion.img
                  src={padiLeft}
                  alt=""
                  className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0 padi-sway-left"
                  style={{ imageRendering: "auto" }}
                  initial={{ opacity: 0, x: -24, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="text-center min-w-0">
                  <motion.h2
                    className="text-gradient-gold whitespace-nowrap title-shimmer-gold title-glow-breathe"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: isMobile ? 28 : 36,
                      letterSpacing: "0.05em",
                      lineHeight: 1.15,
                    }}
                    initial={{ opacity: 0, y: 18, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  >
                    HALL OF FAME
                  </motion.h2>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={hofCat}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28 }}
                      style={{ color: "#E8A500", fontSize: isMobile ? 11 : 13, fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}
                    >
                      {hofCat}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <motion.img
                  src={padiRight}
                  alt=""
                  className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0 padi-sway-right"
                  style={{ imageRendering: "auto" }}
                  initial={{ opacity: 0, x: 24, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <motion.p
                className="relative z-10"
                style={{ color: T.text3, fontSize: 11, letterSpacing: "0.12em" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                JULY 2026
              </motion.p>
            </div>
            <div className="flex-1" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: "none" }}>
            {HOF_TABS.map((cat, i) => (
              <motion.button key={cat} onClick={() => switchHofCat(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                animate={{ backgroundColor: hofTab === cat ? "#E8A500" : "rgba(0,0,0,0)", color: hofTab === cat ? "#ffffff" : "#9CA3AF", borderColor: hofTab === cat ? "#E8A500" : "#374151" }}
                style={{ border: "1px solid" }} transition={{ duration: 0.18 }} whileTap={{ scale: 0.95 }}>
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="relative px-2 pb-3 pt-2 podium-area z-[1] overflow-hidden" style={{ background: podiumBg }}>
          <button onClick={hofPrev} disabled={hofIdx === 0}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: T.card, color: hofIdx === 0 ? T.text3 : "#E8A500", border: `1px solid ${T.border}` }}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button onClick={hofNext} disabled={hofIdx === HOF_TABS.length - 1}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: T.card, color: hofIdx === HOF_TABS.length - 1 ? T.text3 : "#E8A500", border: `1px solid ${T.border}` }}>
            <ChevronRight size={16} />
          </button>

          <SwipeCarouselZone
            className="relative"
            onPrev={hofIdx > 0 ? hofPrev : undefined}
            onNext={hofIdx < HOF_TABS.length - 1 ? hofNext : undefined}
          >
          <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
            <motion.div
              key={hofCat}
              custom={slideDir}
              variants={HOF_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* ── HoF Podium with real photos ── */}
              <div className="flex items-end justify-center gap-1 sm:gap-2 px-1 sm:px-6">
                {([3, 1, 0, 2, 4] as const).map((idx, colI) => {
                  const agent = hofAgents[idx];
                  if (!agent) return <div key={colI} className="flex-1" style={{ maxWidth: isMobile ? 60 : 90 }} />;
                  const rank = idx + 1;
                  const isFirst = rank === 1;
                  const isTop3 = rank <= 3;
                  const avatarSz = isMobile
                    ? (isFirst ? 64 : isTop3 ? 48 : 38)
                    : (isFirst ? 92 : isTop3 ? 68 : 52);
                  const ringColor = rank === 1 ? "#E8A500" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#6B7280";
                  const ringGlow = rank === 1 ? "0 0 18px rgba(232,165,0,0.7), 0 0 32px rgba(200,146,42,0.4)" : rank === 2 ? "0 0 8px rgba(192,192,192,0.4)" : rank === 3 ? "0 0 8px rgba(205,127,50,0.4)" : "none";
                  const pedH = isMobile
                    ? (isFirst ? 50 : rank === 2 ? 38 : rank === 3 ? 28 : 20)
                    : (isFirst ? 72 : rank === 2 ? 54 : rank === 3 ? 42 : 30);
                  const pedTop = rank === 1 ? "radial-gradient(ellipse at center,#FFE9A8 0%,#E8A500 55%,#B8860B 100%)" : rank === 2 ? "radial-gradient(ellipse at center,#F0F0F0 0%,#C0C0C0 55%,#909090 100%)" : rank === 3 ? "radial-gradient(ellipse at center,#E8B88A 0%,#CD7F32 55%,#8B5E20 100%)" : "radial-gradient(ellipse at center,#9AA0A8 0%,#6B7280 60%,#454B54 100%)";
                  const pedBody = "linear-gradient(180deg,#211B12 0%,#0C0A07 100%)";
                  const pedPill = rank === 1 ? "linear-gradient(135deg,#FFE08A,#E8A500)" : rank === 2 ? "linear-gradient(135deg,#EDEDED,#B8B8B8)" : rank === 3 ? "linear-gradient(135deg,#E8B88A,#CD7F32)" : "linear-gradient(135deg,#AEB4BC,#6B7280)";
                  const delay = colI * 0.08;
                  return (
                    <motion.div key={rank} className="flex flex-col items-center flex-1 min-w-0 overflow-hidden"
                      style={{ maxWidth: isMobile ? (isFirst ? 96 : isTop3 ? 80 : 60) : (isFirst ? 150 : isTop3 ? 112 : 90) }}
                      initial={false}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}>

                      {/* Floating Wrapper for Crown & Avatar */}
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: colI * 0.25
                        }}
                        className="flex flex-col items-center w-full select-none"
                      >
                        {/* Crown for #1 */}
                        <div style={{ height: isFirst ? (isMobile ? 20 : 28) : 0, overflow: "hidden" }} className="flex items-end justify-center w-full">
                          {isFirst && (
                            <motion.span className="crown-bounce" style={{ fontSize: isMobile ? 18 : 24, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(200,146,42,0.8))" }}>👑</motion.span>
                          )}
                        </div>

                        {/* Photo frame */}
                        <motion.div
                          className="relative flex-shrink-0"
                          initial={false}>
                          <PodiumAvatarGlow
                            color={ringColor}
                            width={avatarSz + (isMobile ? 24 : 36)}
                            height={Math.round(avatarSz * (isMobile ? 0.4 : 0.46))}
                            intensity={isFirst ? 1.15 : isTop3 ? 0.9 : 0.65}
                          />
                          {isFirst && (
                            <svg className="absolute" style={{ width: avatarSz + 28, height: avatarSz + 28, top: -14, left: -14, zIndex: 0, pointerEvents: "none" }} viewBox="0 0 120 120">
                              <g opacity="0.9">
                                <path d="M10 80 Q5 65 12 52 Q15 62 14 72Z" fill="#C8922A" />
                                <path d="M14 72 Q8 58 16 46 Q19 56 17 68Z" fill="#C8922A" opacity="0.8" />
                                <path d="M18 65 Q12 50 22 40 Q24 50 21 62Z" fill="#C8922A" opacity="0.7" />
                                <path d="M23 58 Q18 44 30 36 Q31 46 26 57Z" fill="#E8A500" opacity="0.6" />
                                <path d="M30 50 Q26 38 38 32 Q39 42 34 50Z" fill="#E8A500" opacity="0.5" />
                              </g>
                              <g opacity="0.9">
                                <path d="M110 80 Q115 65 108 52 Q105 62 106 72Z" fill="#C8922A" />
                                <path d="M106 72 Q112 58 104 46 Q101 56 103 68Z" fill="#C8922A" opacity="0.8" />
                                <path d="M102 65 Q108 50 98 40 Q96 50 99 62Z" fill="#C8922A" opacity="0.7" />
                                <path d="M97 58 Q102 44 90 36 Q89 46 94 57Z" fill="#E8A500" opacity="0.6" />
                                <path d="M90 50 Q94 38 82 32 Q81 42 86 50Z" fill="#E8A500" opacity="0.5" />
                              </g>
                            </svg>
                          )}
                          <div style={{
                            width: avatarSz + 6,
                            height: avatarSz + 6,
                            borderRadius: "50%",
                            background: `conic-gradient(${ringColor} 0%, #FFF8E7 25%, ${ringColor} 50%, #FFF8E7 75%, ${ringColor} 100%)`,
                            padding: 3,
                            boxShadow: ringGlow,
                            position: "relative",
                            zIndex: 1,
                          }}>
                            <div style={{ width: avatarSz, height: avatarSz, borderRadius: "50%", overflow: "hidden", border: "2px solid white" }}>
                              <AgentAvatar initials={agent.initials} photo={agent.photo} size={avatarSz} />
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Pedestal */}
                      <div className="relative flex-shrink-0" style={{ width: isMobile ? (isFirst ? 80 : isTop3 ? 64 : 50) : (isFirst ? 116 : isTop3 ? 92 : 74), marginTop: 8 }}>
                        <div style={{ height: 14, borderRadius: "50%", background: pedTop, boxShadow: `0 0 16px ${ringColor}66`, position: "relative", zIndex: 2 }} />
                        <div
                          className="flex items-center justify-center"
                          style={{ marginTop: -7, height: pedH, background: pedBody, borderLeft: `1px solid ${ringColor}55`, borderRight: `1px solid ${ringColor}55`, borderRadius: "0 0 10px 10px", boxShadow: isFirst ? `0 10px 30px ${ringColor}33, inset 0 0 24px rgba(232,165,0,0.08)` : "inset 0 0 16px rgba(0,0,0,0.5)" }}>
                          <span className="rounded-md font-bold text-center"
                            style={{ background: pedPill, color: "#3A2800", fontSize: isMobile ? (isFirst ? 12 : 10) : (isFirst ? 16 : 13), minWidth: isMobile ? (isFirst ? 30 : 24) : (isFirst ? 40 : 32), padding: "2px 8px", fontFamily: "'Rajdhani',sans-serif", border: `1.5px solid ${ringColor}`, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                            #{rank}
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ minHeight: 20, marginTop: 8 }} className="flex items-center justify-center w-full overflow-hidden px-0.5">
                        <p className="font-bold truncate text-center"
                          style={{ color: T.text1, fontSize: isMobile ? (isFirst ? 11 : isTop3 ? 9 : 8) : (isFirst ? 14 : isTop3 ? 12 : 10), fontFamily: "'Rajdhani',sans-serif" }}>
                          {agent.name.split(" ").slice(0, 2).join(" ")}
                        </p>
                      </div>

                      {/* Value */}
                      <div style={{ minHeight: 16 }} className="flex items-center justify-center w-full overflow-hidden px-0.5">
                        <p className="font-bold truncate text-center"
                          style={{ color: "#E8A500", fontSize: isMobile ? (isFirst ? 10 : 8) : (isFirst ? 12 : 10), fontFamily: "'Rajdhani',sans-serif" }}>
                          {agent.value ?? "—"}
                        </p>
                      </div>

                      {/* Badges */}
                      <HofBadgeRow
                        badges={getAgentPodiumBadges(agent)}
                        isMobile={isMobile}
                        isFirst={isFirst}
                        isDark={isDark}
                        delay={delay}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ height: 12 }} />

              {/* Dot pagination */}
              <div className="flex justify-center gap-1.5 py-3">
                {HOF_TABS.map((_, i) => (
                  <button key={i} onClick={() => goHofTab(HOF_TABS[i])}
                    className="rounded-full transition-all"
                    style={{ width: hofIdx === i ? 16 : 6, height: 6, backgroundColor: hofIdx === i ? "#E8A500" : T.border }} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          </SwipeCarouselZone>
        </div>
      </div>

      {/* Weekly LB + Progress + Quest */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly LB */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
                >
                  <Trophy size={isMobile ? 22 : 26} style={{ color: "#E8A500", filter: "drop-shadow(0 2px 6px rgba(232,165,0,0.35))" }} />
                </motion.div>
                <motion.h3
                  className="font-bold text-gradient-gold title-shimmer-gold"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: isMobile ? 22 : 28,
                    letterSpacing: "0.06em",
                    lineHeight: 1.15,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.45 }}
                >
                  WEEKLY LEADERBOARD
                </motion.h3>
              </motion.div>
              <div
                className="weekly-lb-accent-line h-0.5 rounded-full mt-1.5 mb-1"
                style={{ background: "linear-gradient(90deg, #E8A500, rgba(232,165,0,0.15))", maxWidth: isMobile ? 140 : 180 }}
              />
              <motion.p
                className="text-xs"
                style={{ color: T.text3 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.35 }}
              >
                Minggu ini · 16–22 Jun 2025
              </motion.p>
            </div>
          </div>
          <div className="space-y-1">
            {WEEKLY_LB_DATA.map((agent, i) => (
              <motion.div key={agent.rank} className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl"
                style={{ backgroundColor: agent.isMe ? "rgba(232,165,0,0.1)" : "transparent" }}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{
                    background: agent.rank === 1 ? "linear-gradient(135deg,#E8A500,#C8922A)" : agent.rank === 2 ? "#9CA3AF" : agent.rank === 3 ? "#B87333" : T.muted,
                    color: agent.rank <= 3 ? "white" : T.text3, fontFamily: "'Rajdhani',sans-serif"
                  }}>
                  {agent.rank}
                </div>
                {agent.level && <LevelBadge title={agent.level} size={62} />}
                <div className="flex-1 min-w-0">
                  {agent.level && (
                    <p className="text-xs font-bold mb-0.5 truncate" style={{ color: getLevelTierColor(agent.level), fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.02em" }}>
                      {agent.level}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate" style={{ color: T.text1 }}>{agent.isMe ? "Anda" : agent.name}</span>
                    {agent.isMe && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ backgroundColor: "#E8A500", color: "white", fontSize: 9 }}>You</span>}
                  </div>
                </div>
                <p className="font-bold text-xs flex-shrink-0" style={{ fontFamily: "'Rajdhani',sans-serif", color: "#E8A500" }}>
                  {agent.value}
                </p>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-center mt-3 pt-3 border-t" style={{ color: T.text3, borderColor: T.border }}>Peringkat direset setiap hari Senin</p>
        </Card>

        {/* Progress + Quest */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4">
            <h3 className="font-bold mb-3" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: T.text3, letterSpacing: "0.08em" }}>YOUR PROGRESS</h3>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 pulse-glow-gold" style={{ background: "linear-gradient(135deg,#E8A500,#C8922A)" }}>
                  <span style={{ fontSize: 22 }}>⭐</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: T.text3 }}>Total XP</p>
                  <p className="text-xp-hero">24,680</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: T.text3 }}>This Week</p>
                <p className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-numeric)", fontSize: 18 }}>1,620 XP</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: T.border }}>
              <div>
                <p className="text-xs" style={{ color: T.text3 }}>Current Rank</p>
                <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: getLevelTierColor("Senior Agent") }}>Senior Agent</p>
              </div>
              <LevelBadge title="Senior Agent" size={56} />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <div><p className="text-xs" style={{ color: T.text3 }}>Next Rank</p><p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 15, color: getLevelTierColor("Elite Agent") }}>Elite Agent</p></div>
              <LevelBadge title="Elite Agent" size={56} />
            </div>
            <XPBar value={648450} max={800000} height={10} />
            <p className="text-xs mt-1 text-gradient-gold font-bold" style={{ fontFamily: "var(--font-numeric)" }}>648,450 / 800,000 XP</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, color: T.text3, letterSpacing: "0.08em" }}>ACTIVE QUEST</h3>
              <button onClick={() => onNav("quest")} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "#E8A500" }}>
                Lihat Semua Quest <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {[
                { name: "Daily Login", icon: "📅", p: 1, t: 1, xp: 100, done: true },
                { name: "New Listing", icon: "🏢", p: 2, t: 3, xp: 100, done: false },
                { name: "New Prospect", icon: "👥", p: 6, t: 10, xp: 100, done: false },
                { name: "New Content", icon: "📱", p: 1, t: 1, xp: 300, done: true },
                { name: "Complete Module", icon: "🎓", p: 2, t: 5, xp: 200, done: false },
              ].map((q, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0 rounded-2xl border p-2.5"
                  style={{ minWidth: 80, borderColor: q.done ? "#86EFAC50" : T.border, backgroundColor: q.done ? (isDark ? "#0A2010" : "#F0FDF4") : T.card }}>
                  <span style={{ fontSize: 20 }}>{q.icon}</span>
                  <p className="text-center font-medium mt-1" style={{ fontSize: 9, color: T.text2, lineHeight: 1.2, maxWidth: 72 }}>{q.name}</p>
                  <p className="font-bold mt-0.5" style={{ fontSize: 10, color: "#C8922A", fontFamily: "'Rajdhani',sans-serif" }}>+{q.xp} XP</p>
                  <div className="w-full my-1"><XPBar value={q.p} max={q.t} height={3} /></div>
                  <p style={{ fontSize: 9, color: T.text3 }}>{q.p}/{q.t}</p>
                  <button className="mt-1.5 w-full py-1 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: q.done ? "#E8A500" : T.muted, color: q.done ? "white" : T.text2, fontSize: 9, fontFamily: "'Rajdhani',sans-serif" }}>
                    {q.done ? "Claimed" : "Go"}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple useTheme proxy inside components if types aren't directly using Context
import { ThemeCtx } from "../types";
import { useContext } from "react";
const useTheme = () => useContext(ThemeCtx);
