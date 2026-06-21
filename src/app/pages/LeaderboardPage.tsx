import { useState, useEffect } from "react";
import { ChevronRight, Crown, Target, Users, Trophy, Calendar, Building2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AgentAvatar from "../components/AgentAvatar";
import LevelBadge from "../components/LevelBadge";
import BadgeShield from "../components/BadgeShield";
import { LeaderboardPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import HofFallingStars from "../components/HofFallingStars";
import { T, Rarity, useTheme } from "../types";
import { useTabQuery } from "../routes";
import { HOF_CAT_DATA, WEEKLY_LB_DATA, HOF_TABS } from "../appData";
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

export default function LeaderboardPage() {
  const loading = useLoading(1300);
  const [mode, setMode] = useTabQuery("mode", "hof");
  const [hofCat, setHofCat] = useTabQuery("hofCat", "Top 5 Commission");
  const [slideDir, setSlideDir] = useState(0);
  const { isDark } = useTheme();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  if (loading) return <LeaderboardPageSkeleton />;

  const hofAgents = HOF_CAT_DATA[hofCat] || [];
  const rest = hofAgents.slice(5);

  const hofIdx = HOF_TABS.indexOf(hofCat as any);

  const goHofCat = (cat: string) => {
    const nextIdx = HOF_TABS.indexOf(cat as typeof HOF_TABS[number]);
    if (nextIdx === -1) return;
    setSlideDir(nextIdx === hofIdx ? 0 : nextIdx > hofIdx ? 1 : -1);
    setHofCat(cat);
  };
  const switchCat = (cat: string) => { goHofCat(cat); };
  const hofPrev = () => { if (hofIdx > 0) { setSlideDir(-1); setHofCat(HOF_TABS[hofIdx - 1]); } };
  const hofNext = () => { if (hofIdx < HOF_TABS.length - 1) { setSlideDir(1); setHofCat(HOF_TABS[hofIdx + 1]); } };

  const hofPodiumOrder = [3, 1, 0, 2, 4] as const;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: T.muted }}>
        {([["hof", "🏆 Hall of Fame"], ["weekly", "📊 Weekly Leaderboard"]] as const).map(([m, label]) => (
          <motion.button key={m} onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            animate={{
              backgroundColor: mode === m ? "#ffffff" : "rgba(0,0,0,0)",
              color: mode === m ? "#E8A500" : "#6B7280",
              boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.10)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: "0.02em" }}>
            {label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "hof" && (
          <motion.div key="hof"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4">

            {/* Cinematic Hall of Fame card */}
            <div className="overflow-hidden rounded-3xl border shadow-sm relative"
              style={{ borderColor: T.border, backgroundColor: T.card }}>
              <HofFallingStars isDark={isDark} />

              {/* Header */}
              <div className="relative flex flex-col items-center pt-6 pb-4 px-4 z-[1]"
                style={{ background: isDark ? "linear-gradient(135deg, rgba(10,10,10,0.72), rgba(21,18,13,0.55))" : "rgba(255,255,255,0.82)" }}>

                <div className="flex flex-col items-center relative py-1 px-4">
                  <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                    <img src={padiLeft} alt="" className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0" style={{ imageRendering: "auto" }} />
                    <div className="text-center min-w-0">
                      <h2
                        className={isDark ? "text-gradient-gold whitespace-nowrap" : "whitespace-nowrap"}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: isMobile ? 28 : 36,
                          letterSpacing: "0.05em",
                          lineHeight: 1.15,
                          transform: "none",
                          color: isDark ? undefined : T.text1,
                        }}
                      >
                        HALL OF FAME
                      </h2>
                      <p style={{ color: "#E8A500", fontSize: isMobile ? 11 : 13, fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600, marginTop: 2 }}>{hofCat}</p>
                      <p style={{ color: T.text3, fontSize: 11, letterSpacing: "0.12em", marginTop: 2 }}>JULY 2026</p>
                    </div>
                    <img src={padiRight} alt="" className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0" style={{ imageRendering: "auto" }} />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 mt-4 w-full justify-start sm:justify-center" style={{ scrollbarWidth: "none" }}>
                  {HOF_TABS.map(cat => (
                    <motion.button key={cat} onClick={() => switchCat(cat)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                      animate={{
                        backgroundColor: hofCat === cat ? (isDark ? "#E8A500" : "#FFF7E6") : "rgba(0,0,0,0)",
                        color: hofCat === cat ? (isDark ? "#ffffff" : "#B8860B") : T.text3,
                        borderColor: hofCat === cat ? "#E8A500" : T.border,
                      }}
                      style={{ border: "1px solid" }} transition={{ duration: 0.18 }} whileTap={{ scale: 0.95 }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Podium */}
              <div className="relative px-3 sm:px-8 pt-2 pb-6 z-[1] overflow-hidden"
                style={{ background: isDark ? "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(26,20,16,0.72) 100%)" : "linear-gradient(180deg, rgba(255,253,247,0.75) 0%, rgba(255,246,232,0.88) 100%)" }}>

                <button onClick={hofPrev} disabled={hofIdx === 0}
                  className="absolute left-1 sm:left-2 top-1/4 -translate-y-1/2 z-10 w-9 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: T.card, color: hofIdx === 0 ? T.text3 : "#E8A500", border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", opacity: hofIdx === 0 ? 0.4 : 1 }}>
                  <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button onClick={hofNext} disabled={hofIdx === HOF_TABS.length - 1}
                  className="absolute right-1 sm:right-2 top-1/4 -translate-y-1/2 z-10 w-9 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: T.card, color: hofIdx === HOF_TABS.length - 1 ? T.text3 : "#E8A500", border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", opacity: hofIdx === HOF_TABS.length - 1 ? 0.4 : 1 }}>
                  <ChevronRight size={18} />
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
                    <div className="flex items-end justify-center gap-1 sm:gap-3 px-1 sm:px-12">
                      {hofPodiumOrder.map((aIdx, colI) => {
                        const agent = hofAgents[aIdx];
                        if (!agent) return <div key={colI} className="flex-1" style={{ maxWidth: isMobile ? 68 : 120 }} />;
                        const rank = aIdx + 1;
                        const isFirst = rank === 1;
                        const isTop3 = rank <= 3;
                        const avatarSz = isMobile
                          ? (isFirst ? 68 : isTop3 ? 50 : 40)
                          : (isFirst ? 104 : isTop3 ? 76 : 60);
                        const ringColor = rank === 1 ? "#E8A500" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#B8B8B8";
                        const ringGlow = rank === 1 ? "0 0 22px rgba(232,165,0,0.55), 0 0 40px rgba(200,146,42,0.3)" : "0 4px 12px rgba(0,0,0,0.10)";
                        const pedH = isMobile
                          ? (isFirst ? 60 : rank === 2 ? 46 : rank === 3 ? 34 : 24)
                          : (isFirst ? 86 : rank === 2 ? 64 : rank === 3 ? 50 : 38);
                        const pedTop = isDark
                          ? (rank === 1 ? "radial-gradient(ellipse at center,#FFE9A8 0%,#E8A500 55%,#B8860B 100%)" : rank === 2 ? "radial-gradient(ellipse at center,#F0F0F0 0%,#C0C0C0 55%,#909090 100%)" : rank === 3 ? "radial-gradient(ellipse at center,#E8B88A 0%,#CD7F32 55%,#8B5E20 100%)" : "radial-gradient(ellipse at center,#9AA0A8 0%,#6B7280 60%,#454B54 100%)")
                          : "radial-gradient(ellipse at center,#FFFFFF 0%,#EFEFF2 70%,#DEDEE3 100%)";
                        const pedBody = isDark ? "linear-gradient(180deg,#211B12 0%,#0C0A07 100%)" : "linear-gradient(180deg,#FFFFFF 0%,#EEEFF3 100%)";
                        const pedPill = rank === 1 ? "linear-gradient(135deg,#FFE08A,#E8A500)" : rank === 2 ? "linear-gradient(135deg,#EDEDED,#B8B8B8)" : rank === 3 ? "linear-gradient(135deg,#E8B88A,#CD7F32)" : "linear-gradient(135deg,#E4E4E8,#BFC2CA)";
                        const pedBorder = isDark ? `${ringColor}55` : "#E2E2E8";
                        const delay = colI * 0.08;
                        return (
                          <motion.div key={rank} className="flex flex-col items-center flex-1 min-w-0 overflow-hidden"
                            style={{ maxWidth: isMobile ? (isFirst ? 104 : isTop3 ? 86 : 68) : (isFirst ? 180 : isTop3 ? 132 : 104) }}
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
                              {/* Crown */}
                              <div style={{ height: isFirst ? (isMobile ? 22 : 34) : 0, overflow: "hidden" }} className="flex items-end justify-center w-full">
                                {isFirst && (
                                  <motion.span style={{ fontSize: isMobile ? 20 : 30, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(200,146,42,0.7))" }}>👑</motion.span>
                                )}
                              </div>

                              {/* Avatar + ring */}
                              <motion.div className="relative flex-shrink-0" initial={false}>
                                <PodiumAvatarGlow
                                  color={ringColor}
                                  width={avatarSz + (isMobile ? 28 : 40)}
                                  height={Math.round(avatarSz * (isMobile ? 0.42 : 0.48))}
                                  intensity={isFirst ? 1.15 : isTop3 ? 0.9 : 0.65}
                                />
                                {isFirst && (
                                  <svg className="absolute" style={{ width: avatarSz + 36, height: avatarSz + 36, top: -18, left: -18, zIndex: 0, pointerEvents: "none" }} viewBox="0 0 120 120">
                                    <g opacity="0.85">
                                      <path d="M10 80 Q5 65 12 52 Q15 62 14 72Z" fill="#C8922A" />
                                      <path d="M14 72 Q8 58 16 46 Q19 56 17 68Z" fill="#C8922A" opacity="0.8" />
                                      <path d="M18 65 Q12 50 22 40 Q24 50 21 62Z" fill="#E8A500" opacity="0.7" />
                                      <path d="M23 58 Q18 44 30 36 Q31 46 26 57Z" fill="#E8A500" opacity="0.6" />
                                    </g>
                                    <g opacity="0.85">
                                      <path d="M110 80 Q115 65 108 52 Q105 62 106 72Z" fill="#C8922A" />
                                      <path d="M106 72 Q112 58 104 46 Q101 56 103 68Z" fill="#C8922A" opacity="0.8" />
                                      <path d="M102 65 Q108 50 98 40 Q96 50 99 62Z" fill="#E8A500" opacity="0.7" />
                                      <path d="M97 58 Q102 44 90 36 Q89 46 94 57Z" fill="#E8A500" opacity="0.6" />
                                    </g>
                                  </svg>
                                )}
                                <div style={{
                                  width: avatarSz + 6, height: avatarSz + 6, borderRadius: "50%",
                                  background: isTop3 ? `conic-gradient(${ringColor} 0%, #FFF8E7 25%, ${ringColor} 50%, #FFF8E7 75%, ${ringColor} 100%)` : ringColor,
                                  padding: 3, boxShadow: ringGlow, position: "relative", zIndex: 1
                                }}>
                                  <div style={{ width: avatarSz, height: avatarSz, borderRadius: "50%", overflow: "hidden", border: "3px solid #FFFFFF" }}>
                                    <AgentAvatar initials={agent.initials} photo={agent.photo} size={avatarSz} />
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>

                            {/* Pedestal with rank pill */}
                            <div className="relative flex-shrink-0" style={{ width: isMobile ? (isFirst ? 86 : isTop3 ? 68 : 54) : (isFirst ? 132 : isTop3 ? 104 : 84), marginTop: 10 }}>
                              <div style={{ height: 14, borderRadius: "50%", background: pedTop, boxShadow: `0 0 16px ${ringColor}55`, position: "relative", zIndex: 2 }} />
                              <div className="flex items-start justify-center"
                                style={{ marginTop: -7, height: pedH, background: pedBody, borderLeft: `1px solid ${pedBorder}`, borderRight: `1px solid ${pedBorder}`, borderRadius: "0 0 12px 12px", boxShadow: isFirst ? `0 12px 32px ${ringColor}33` : "0 6px 18px rgba(0,0,0,0.08)" }}>
                                <span className="rounded-md font-bold text-center" style={{ marginTop: 8, background: pedPill, color: "#3A2800", fontSize: isMobile ? (isFirst ? 13 : 11) : (isFirst ? 18 : 14), minWidth: isMobile ? (isFirst ? 32 : 26) : (isFirst ? 46 : 36), padding: "3px 10px", fontFamily: "'Rajdhani',sans-serif", border: `1.5px solid ${ringColor}`, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                                  #{rank}
                                </span>
                              </div>
                            </div>

                            {/* Name */}
                            <div style={{ minHeight: 22, marginTop: 10 }} className="flex items-center justify-center w-full overflow-hidden px-0.5">
                              <p className="font-bold truncate text-center" style={{ color: T.text1, fontSize: isMobile ? (isFirst ? 12 : isTop3 ? 10 : 8) : (isFirst ? 17 : isTop3 ? 14 : 12), fontFamily: "'Rajdhani',sans-serif" }}>
                                {agent.name.split(" ").slice(0, 2).join(" ")}
                              </p>
                            </div>

                            {/* Value */}
                            <div style={{ minHeight: 18 }} className="flex items-center justify-center w-full overflow-hidden px-0.5">
                              <p className="font-bold truncate text-center" style={{ color: isDark ? "#E8A500" : T.text1, fontSize: isMobile ? (isFirst ? 11 : 9) : (isFirst ? 14 : 12), fontFamily: "'Rajdhani',sans-serif" }}>
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
                  </motion.div>
                </AnimatePresence>
                </SwipeCarouselZone>
              </div>
            </div>

            {/* Remaining list + tips */}
            <AnimatePresence mode="wait">
              <motion.div key={hofCat}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>

                {/* Peringkat Lainnya */}
                {rest.length > 0 && (
                  <>
                    <p className="text-xs font-bold tracking-widest mb-3 px-1"
                      style={{ color: T.text3, letterSpacing: "0.12em" }}>
                      PERINGKAT LAINNYA
                    </p>
                    <div className="space-y-2.5">
                      {rest.map((agent, i) => (
                        <motion.div key={agent.rank}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 + 0.2, duration: 0.3 }}
                          className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border transition-shadow"
                          style={{
                            borderColor: agent.isMe ? "#E8A500" : "var(--border)",
                            backgroundColor: agent.isMe ? "var(--accent)" : "var(--card)",
                            boxShadow: agent.isMe ? "0 0 0 1.5px #E8A50040" : "0 1px 3px rgba(0,0,0,0.05)",
                          }}>
                          {/* Rank */}
                          <span className="w-6 text-center font-bold flex-shrink-0"
                            style={{ color: T.text3, fontFamily: "'Rajdhani', sans-serif", fontSize: 16 }}>
                            {agent.rank}
                          </span>

                          {/* Level badge */}
                          <LevelBadge title={agent.level || "Senior Agent"} size={40} />

                          {/* Name + subtitle */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-sm" style={{ color: T.text1 }}>
                                {agent.isMe ? "Anda" : agent.name}
                              </span>
                              {agent.isMe && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{ backgroundColor: "#E8A500", color: "white", fontSize: 10 }}>
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: T.text3 }}>{agent.subtitle}</p>
                          </div>

                          {/* Value */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold" style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}>
                              {agent.value}
                            </p>
                            {agent.isMe && agent.xpLabel && (
                              <span className="text-xs px-2 py-0.5 rounded-full border"
                                style={{ borderColor: "#E8A500", color: "#E8A500", fontSize: 10 }}>
                                {agent.xpLabel}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* Tips section */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.35 }}
                  className="mt-4 rounded-2xl p-5 border"
                  style={{ backgroundColor: "var(--accent)", borderColor: "#E8A50025" }}>
                  <p className="flex items-center gap-2 font-semibold mb-4"
                    style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}>
                    <Rocket size={16} /> Cara naik peringkat lebih cepat
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Building2, label: "Tambah Listing", desc: "+100 XP per listing baru yang disetujui" },
                      { icon: Users, label: "Rekrut Agent", desc: "+200 XP setiap rekrut baru aktif" },
                      { icon: Trophy, label: "Closing Unit", desc: "+300 XP per unit tersewa/terjual" },
                      { icon: Calendar, label: "Login Harian", desc: "+100 XP tiap hari — jangan skip!" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#FFFAED" }}>
                          <Icon size={15} style={{ color: "#E8A500" }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: T.text1 }}>{label}</p>
                          <p className="text-xs" style={{ color: T.text3 }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── WEEKLY LEADERBOARD ── */}
        {mode === "weekly" && (
          <motion.div key="weekly"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: T.text1 }}>
                  Weekly Leaderboard
                </h2>
                <p className="text-xs mt-0.5" style={{ color: T.text3 }}>16 – 22 Juni 2025 · Reset Senin 00:00 WIB</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                🟢 Live
              </span>
            </div>

            <div className="space-y-2.5">
              {WEEKLY_LB_DATA.map((agent, i) => {
                const isTop3 = agent.rank <= 3;
                const medalBg = agent.rank === 1 ? "linear-gradient(135deg,#E8A500,#C8922A)"
                  : agent.rank === 2 ? "#9CA3AF"
                    : agent.rank === 3 ? "#B87333" : "#F3F4F6";
                const medalColor = agent.rank <= 3 ? "white" : "#6B7280";

                return (
                  <motion.div key={agent.rank}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border"
                    style={{
                      borderColor: agent.isMe ? "#E8A500" : "var(--border)",
                      backgroundColor: agent.isMe ? "var(--accent)" : "var(--card)",
                      boxShadow: agent.isMe ? "0 0 0 1.5px #E8A50040" : "0 1px 3px rgba(0,0,0,0.05)",
                    }}>

                    {/* Rank badge */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: medalBg, color: medalColor, fontFamily: "'Rajdhani', sans-serif" }}>
                      {isTop3 ? (agent.rank === 1 ? "🥇" : agent.rank === 2 ? "🥈" : "🥉") : agent.rank}
                    </div>

                    {/* Avatar */}
                    <div style={{ borderRadius: "50%", padding: agent.isMe ? 2 : 0, background: agent.isMe ? "linear-gradient(135deg,#E8A500,#C8922A)" : "transparent", overflow: "hidden" }}>
                      <AgentAvatar initials={agent.initials} photo={agent.photo} size={40} isMe={agent.isMe} />
                    </div>

                    {/* Name + subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: T.text1 }}>
                          {agent.isMe ? "Anda" : agent.name}
                        </span>
                        {agent.isMe && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: "#E8A500", color: "white", fontSize: 10 }}>
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: T.text3 }}>{agent.subtitle}</p>
                    </div>

                    {/* Badges */}
                    {agent.badges && (
                      <div className="hidden sm:flex gap-1 flex-shrink-0">
                        {agent.badges.slice(0, 2).map(([r, n], j) => (
                          <BadgeShield key={j} rarity={r as Rarity} name={n} size="sm" />
                        ))}
                      </div>
                    )}

                    {/* Value */}
                    <div className="text-right flex-shrink-0 ml-1">
                      <p className="font-bold" style={{ color: "#C8922A", fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}>
                        {agent.value}
                      </p>
                      {agent.isMe && agent.xpLabel && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full border whitespace-nowrap"
                          style={{ borderColor: "#E8A500", color: "#E8A500", fontSize: 10 }}>
                          {agent.xpLabel}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.35 }}
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: "var(--accent)", borderColor: "#E8A50025" }}>
              <p className="flex items-center gap-2 font-semibold mb-4"
                style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}>
                <Rocket size={16} /> Cara naik peringkat lebih cepat
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "Tambah Listing", desc: "+100 XP per listing baru yang disetujui" },
                  { icon: Users, label: "Rekrut Agent", desc: "+200 XP setiap rekrut baru aktif" },
                  { icon: Trophy, label: "Closing Unit", desc: "+300 XP per unit tersewa/terjual" },
                  { icon: Calendar, label: "Login Harian", desc: "+100 XP tiap hari — jangan skip!" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFFAED" }}>
                      <Icon size={15} style={{ color: "#E8A500" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: T.text1 }}>{label}</p>
                      <p className="text-xs" style={{ color: T.text3 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
