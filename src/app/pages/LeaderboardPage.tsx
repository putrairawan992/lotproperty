import { useState, useEffect } from "react";
import { ChevronRight, Crown, Target, Users, Trophy, Calendar, Building2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AgentAvatar from "../components/AgentAvatar";
import LevelBadge from "../components/LevelBadge";
import BadgeShield from "../components/BadgeShield";
import { LeaderboardPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import HofSection from "../components/HofSection";
import { T, Rarity, useTheme } from "../types";
import { useTabQuery } from "../routes";
import { HOF_CAT_DATA, WEEKLY_LB_DATA, HOF_TABS } from "../appData";

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

            <HofSection
              hofCat={hofCat}
              hofAgents={hofAgents}
              hofTab={hofCat}
              hofIdx={hofIdx}
              slideDir={slideDir}
              isMobile={isMobile}
              isDark={isDark}
              onSwitchCat={switchCat}
              onGoTab={goHofCat}
              onPrev={hofPrev}
              onNext={hofNext}
            />

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
