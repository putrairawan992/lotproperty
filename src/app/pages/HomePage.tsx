import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Flame, Trophy, Crown, Target, Users, Star, BookOpen, TrendingUp, Building2, Check } from "lucide-react";
import Card from "../components/Card";
import LevelBadge from "../components/LevelBadge";
import XPBar from "../components/XPBar";
import AgentAvatar from "../components/AgentAvatar";
import { HomePageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import HofSection from "../components/HofSection";
import HofFallingStars from "../components/HofFallingStars";
import EventBannerSlider from "../components/EventBannerSlider";
import { T, Page, useTheme } from "../types";
import { useTabQuery, useLocation } from "../routes";
import { HOF_TABS, type EventItem } from "../appData";
import { getLevelTierColor, LEVEL_TIERS } from "../badgeAssets";
import EllipsisTooltip from "../components/EllipsisTooltip";
import { api } from "../services/api";
import { normalizeHofCategory } from "../utils/hofCategory";

type SummaryResponse = {
  agent?: {
    id: number;
    name: string;
    level: string;
    title: string;
    total_xp: number;
    weekly_xp: number;
    photo_url?: string;
    daily_streak?: number;
  };
  daily_quest?: {
    login_completed?: boolean;
    listings_count?: number;
    contents_count?: number;
    promotions_count?: number;
  };
};

type WeeklyAgentResponse = {
  rank: number;
  id: number;
  name: string;
  xp: number;
  initials?: string;
  photo?: string;
  level?: string;
};

type HofRecordResponse = {
  category: string;
  rank: number;
  notes?: string;
  agent?: {
    name?: string;
    photo_url?: string;
    level?: string;
    title?: string;
  };
};

type EventResponse = {
  id: number;
  title: string;
  desc?: string;
  start_date: string;
  end_date: string;
  xp_pool: number;
  status: "Active" | "Upcoming";
  subtitle?: string;
  heading?: string;
  tagline?: string;
  banner?: string;
  tagline_highlight?: string;
  accent_color?: string;
  badge?: { name?: string };
};


function getWeeklyRangeString(): string {
  const now = new Date();
  const currentDay = now.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const startMonth = months[monday.getMonth()];
  const endMonth = months[sunday.getMonth()];
  const startYear = monday.getFullYear();
  const endYear = sunday.getFullYear();

  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  } else if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
  } else {
    return `${startDay} – ${endDay} ${startMonth} ${endYear}`;
  }
}

function mapWeeklyAgent(item: WeeklyAgentResponse, currentUser?: any) {
  const initials = (item.initials || item.name || "A").slice(0, 2).toUpperCase();
  const isMe = currentUser && Number(item.id) === Number(currentUser.id);
  return {
    rank: item.rank,
    id: item.id,
    name: item.name,
    initials,
    photo: item.photo,
    level: item.level || "Agent",
    value: `${Number(item.xp || 0).toLocaleString("id-ID")} XP`,
    isMe,
  };
}

function mapEvent(item: EventResponse): EventItem {
  return {
    id: `EV-${item.id}`,
    title: item.title,
    desc: item.desc || "",
    start: item.start_date,
    end: item.end_date,
    xpPool: Number(item.xp_pool || 0),
    badge: item.badge?.name || "No Event",
    status: item.status || "Upcoming",
    subtitle: item.subtitle || "",
    heading: item.heading || item.title.toUpperCase(),
    tagline: item.tagline || "",
    taglineHighlight: item.tagline_highlight || "",
    accentColor: item.accent_color || "#E53E3E",
    banner: item.banner || "",
  };
}

export default function HomePage({ onNav, onShowLevelUp }: { onNav: (p: Page) => void; onShowLevelUp?: () => void }) {
  const loadingTime = useLoading(1400);
  const { isDark, isGuest, onLoginRequest, user } = useTheme();
  const { navigate } = useLocation();
  const [dataLoading, setDataLoading] = useState(true);
  const [slideDir, setSlideDir] = useState(0);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [hofData, setHofData] = useState<Record<string, any[]>>({});
  const [eventData, setEventData] = useState<EventItem[]>([]);
  const [hofRawData, setHofRawData] = useState<any[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [completedModulesCount, setCompletedModulesCount] = useState(0);

  useEffect(() => {
    if (hofRawData.length > 0) {
      const periods = Array.from(new Set(hofRawData.map(r => r.period).filter(Boolean)));
      setAvailablePeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriod((prev) => prev || periods[0]);
      }
    } else {
      setAvailablePeriods([]);
      setSelectedPeriod("");
    }
  }, [hofRawData]);

  useEffect(() => {
    const grouped: Record<string, any[]> = Object.fromEntries(HOF_TABS.map((tab) => [tab, []])) as Record<string, any[]>;
    const filtered = selectedPeriod
      ? hofRawData.filter(r => String(r.period).toLowerCase() === selectedPeriod.toLowerCase())
      : hofRawData;

    for (const rec of filtered) {
      const mappedCat = normalizeHofCategory(rec.category || "", HOF_TABS);
      if (!HOF_TABS.includes(mappedCat as (typeof HOF_TABS)[number])) continue;

      grouped[mappedCat].push({
        rank: rec.rank,
        name: rec.agent?.name || "Unknown Agent",
        initials: (rec.agent?.name || "A")
          .split(" ")
          .map((word: unknown) => (word as string)[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        photo: rec.agent?.photo_url,
        level: rec.agent?.level || "Agent",
        subtitle: rec.agent?.title || "",
        value: rec.notes || "HOF",
      });
    }

    const merged: Record<string, any[]> = Object.fromEntries(HOF_TABS.map(tab => [tab, []])) as Record<string, any[]>;
    HOF_TABS.forEach((tab) => {
      if (grouped[tab]?.length) {
        merged[tab] = [...grouped[tab]].sort((a, b) => a.rank - b.rank).slice(0, 8);
      }
    });
    setHofData(merged);
  }, [selectedPeriod, hofRawData]);

  const loading = loadingTime || (isGuest ? false : dataLoading);

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
  const hofAgents = (hofData[hofCat] || []) as any[];

  const activeAgent = user || summary?.agent || null;

  const currentTier = LEVEL_TIERS.find(t => t.title === activeAgent?.title) || LEVEL_TIERS[0];
  const nextTierIdx = LEVEL_TIERS.findIndex(t => t.title === activeAgent?.title) + 1;
  const nextTier = nextTierIdx < LEVEL_TIERS.length ? LEVEL_TIERS[nextTierIdx] : null;

  const parseXp = (xpStr: string) => {
    return Number(xpStr.replace(/\./g, "").replace("+", ""));
  };

  const currentTierXp = parseXp(currentTier.xp);
  const nextTierXp = nextTier ? parseXp(nextTier.xp) : 5000000;
  const totalXp = Number(activeAgent?.total_xp || 0);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setDataLoading(true);

        if (isGuest) {
          try {
            const [weeklyRes, hofRes, eventsRes] = await Promise.all([
              api.public.getWeeklyLeaderboard().catch(() => []),
              api.public.getHof().catch(() => []),
              api.public.getEvents().catch(() => []),
            ]);

            if (Array.isArray(weeklyRes) && weeklyRes.length > 0) {
              setWeeklyData(weeklyRes.map(a => mapWeeklyAgent(a)));
            }

            const hofPayload = Array.isArray(hofRes) ? hofRes : [];
            setHofRawData(hofPayload);

            if (Array.isArray(eventsRes) && eventsRes.length > 0) {
              setEventData(eventsRes.map(mapEvent));
            }
          } catch {
            // Keep empty state on error — no dummy data
          }
          setDataLoading(false);
          return;
        }

        const [summaryRes, weeklyRes, hofRes, eventsRes, academyRes] = await Promise.all([
          api.dashboard.getSummary(),
          api.dashboard.getWeeklyLeaderboard(),
          api.dashboard.getHof(),
          api.events.getList(),
          api.academy.getModules().catch(() => []),
        ]);

        const summaryPayload = (summaryRes || {}) as SummaryResponse;
        setSummary(summaryPayload);

        const weeklyPayload = Array.isArray(weeklyRes) ? (weeklyRes as WeeklyAgentResponse[]) : [];
        if (weeklyPayload.length > 0) {
          setWeeklyData(weeklyPayload.map(a => mapWeeklyAgent(a, user)));
        }

        const hofPayload = Array.isArray(hofRes) ? (hofRes as HofRecordResponse[]) : [];
        setHofRawData(hofPayload);

        const eventsPayload = Array.isArray(eventsRes) ? (eventsRes as EventResponse[]) : [];
        if (eventsPayload.length > 0) {
          setEventData(eventsPayload.map(mapEvent));
        }

        const completedCount = Array.isArray(academyRes) ? academyRes.filter((m: any) => m.status === "Completed").length : 0;
        setCompletedModulesCount(completedCount);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadHomeData();
  }, [isGuest]);

  const goHofTab = (cat: string) => {
    const nextIdx = HOF_TABS.indexOf(cat as typeof HOF_TABS[number]);
    if (nextIdx === -1) return;
    setSlideDir(nextIdx === hofIdx ? 0 : nextIdx > hofIdx ? 1 : -1);
    setHofTab(cat);
  };
  const switchHofCat = (cat: string) => { goHofTab(cat); };
  const hofPrev = () => { const ni = Math.max(0, hofIdx - 1); setSlideDir(-1); setHofTab(HOF_TABS[ni]); };
  const hofNext = () => { const ni = Math.min(HOF_TABS.length - 1, hofIdx + 1); setSlideDir(1); setHofTab(HOF_TABS[ni]); };

  const qLogin = isGuest ? 1 : (summary?.daily_quest?.login_completed ? 1 : 0);
  const qListings = isGuest ? 2 : Math.min(summary?.daily_quest?.listings_count || 0, 3);
  const qProspects = isGuest ? 6 : Math.min(activeAgent?.total_prospects || 0, 10);
  const qContent = isGuest ? 1 : Math.min(summary?.daily_quest?.contents_count || 0, 1);
  const qAcademy = isGuest ? 2 : Math.min(completedModulesCount || 0, 5);

  if (loading) return <HomePageSkeleton />;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Guest welcome banner */}
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border"
          style={{ backgroundColor: isDark ? "rgba(232,165,0,0.07)" : "#FFFAED", borderColor: "rgba(232,165,0,0.3)" }}
        >
          <div>
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: "#E8A500" }}>
              Anda sedang browsing sebagai Guest
            </p>
            <p className="text-xs mt-0.5" style={{ color: T.text3 }}>
              Daftar untuk unlock quest, listing, profil, dan lebih banyak fitur.
            </p>
          </div>
          <button
            onClick={onLoginRequest}
            className="flex-shrink-0 px-5 py-2 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #E8A500, #C8922A)", fontFamily: "'Rajdhani', sans-serif" }}
          >
            Login / Daftar
          </button>
        </motion.div>
      )}

      {/* Full-width Profile Widget (Hidden on mobile, hidden for guest) */}
      <Card
        className={`${isGuest ? "hidden" : "hidden sm:block"} relative overflow-hidden shadow-sm transition-all duration-300`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(20,16,12,0.78), rgba(28,22,14,0.62))"
            : "linear-gradient(135deg, rgba(255,252,248,0.9), rgba(255,246,235,0.78))",
          borderColor: isDark ? "rgba(200,146,42,0.22)" : T.border,
        }}
      >
        <HofFallingStars isDark={isDark} />
        <div className="relative z-[1] p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Left: User Avatar + Name */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C8922A] p-0.5" style={{ boxShadow: "0 0 10px rgba(200,146,42,0.2)" }}>
                <img
                  src={activeAgent?.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                  alt={activeAgent?.name || "Agent"}
                  className="w-full h-full object-contain object-center rounded-full"
                />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: T.text1 }}>{activeAgent?.name || "Ronald Richy"}</h2>
              <p className="text-[11px]" style={{ color: T.text3 }}>{activeAgent?.title || "Top Producer"}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold mt-0.5"
                style={{ backgroundColor: isDark ? "rgba(232,165,0,0.15)" : "#FEF3C7", color: "#D97706", fontFamily: "var(--font-display)" }}>
                Lv. {activeAgent?.level || 23}
              </span>
            </div>
          </div>

          {/* Middle: Medallion & XP Progress */}
          <div className="flex flex-1 items-center gap-3 min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <LevelBadge title={activeAgent?.title || "Rookie Agent"} size={40} />
              <div>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: T.text3, letterSpacing: "0.06em" }}>Current Rank</p>
                <p className="font-bold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: getLevelTierColor(activeAgent?.title || "Rookie Agent") }}>{activeAgent?.title || "Rookie Agent"}</p>
              </div>
            </div>
            {/* XP progress */}
            <div className="flex-1 min-w-0">
              <XPBar value={totalXp - currentTierXp} max={nextTierXp - currentTierXp} height={8} />
              <p className="text-center text-[11px] mt-0.5 font-bold" style={{ fontFamily: "var(--font-numeric)", color: T.text2 }}>
                {Number(totalXp).toLocaleString("id-ID")} <span style={{ color: T.text3, fontWeight: 400 }}>/ {Number(nextTierXp).toLocaleString("id-ID")} XP</span>
              </p>
            </div>
          </div>

          {/* Right: Next Rank info */}
          <button
            type="button"
            onClick={() => onNav("profile")}
            className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 w-full md:w-auto text-left md:text-right transition-opacity hover:opacity-85 active:opacity-75 cursor-pointer"
            style={{ borderColor: T.border }}
            aria-label="Lihat detail profil dan progress rank"
          >
            <div>
              <p style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Rank</p>
              <p className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>{nextTier ? nextTier.title : "LOT Legendary"}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <LevelBadge title={nextTier ? nextTier.title : "LOT Legendary"} size={38} />
              <ChevronRight size={14} style={{ color: "#E8A500" }} />
            </div>
          </button>
        </div>
      </Card>

      <HofSection
        hofCat={hofCat}
        hofAgents={hofAgents}
        hofTab={hofTab}
        hofIdx={hofIdx}
        slideDir={slideDir}
        isMobile={isMobile}
        isDark={isDark}
        onSwitchCat={switchHofCat}
        onGoTab={goHofTab}
        onPrev={hofPrev}
        onNext={hofNext}
        selectedPeriod={selectedPeriod}
        availablePeriods={availablePeriods}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Event Banner Slider placed below Hall of Fame and above Weekly Leaderboard */}
      <div className="my-2">
        <EventBannerSlider isDark={isDark} onNav={onNav} events={eventData} onEventDetail={(id) => navigate(`/event?id=${id}`)} />
      </div>


      {/* Weekly LB + Progress + Quest */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly LB */}
        <Card className={`p-4 ${isGuest ? "lg:col-span-5" : "lg:col-span-2"}`}>
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
                Minggu ini · {getWeeklyRangeString()}
              </motion.p>
            </div>
          </div>
          <div className="space-y-1">
            {weeklyData.map((agent, i) => (
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
                <div
                  className="flex-shrink-0"
                  style={{
                    borderRadius: "50%",
                    padding: agent.isMe ? 2 : 0,
                    background: agent.isMe ? "linear-gradient(135deg,#E8A500,#C8922A)" : "transparent",
                  }}
                >
                  <AgentAvatar initials={agent.initials} photo={agent.photo} size={44} isMe={agent.isMe} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <EllipsisTooltip
                      text={agent.isMe ? "Anda" : agent.name}
                      className="text-sm font-medium truncate block"
                      style={{ color: T.text1 }}
                    />
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

        {/* Progress + Quest — hidden for guest */}
        <div className={`${isGuest ? "hidden" : ""} lg:col-span-3 space-y-4`}>
          <Card className="p-4">
            <h3 className="font-bold mb-3" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: T.text3, letterSpacing: "0.08em" }}>YOUR PROGRESS</h3>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 pulse-glow-gold" style={{ background: "linear-gradient(135deg,#E8A500,#C8922A)" }}>
                  <span style={{ fontSize: 22 }}>⭐</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: T.text3 }}>Total XP</p>
                  <p className="text-xp-hero">{Number(totalXp).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: T.text3 }}>This Week</p>
                <p className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-numeric)", fontSize: 18 }}>{Number(activeAgent?.weekly_xp || 0).toLocaleString("id-ID")} XP</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: T.border }}>
              <div>
                <p className="text-xs" style={{ color: T.text3 }}>Current Rank</p>
                <p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: getLevelTierColor(activeAgent?.title || "Rookie Agent") }}>{activeAgent?.title || "Rookie Agent"}</p>
              </div>
              <LevelBadge title={activeAgent?.title || "Rookie Agent"} size={56} />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <div><p className="text-xs" style={{ color: T.text3 }}>Next Rank</p><p className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 15, color: getLevelTierColor(nextTier ? nextTier.title : "LOT Legendary") }}>{nextTier ? nextTier.title : "LOT Legendary"}</p></div>
              <LevelBadge title={nextTier ? nextTier.title : "LOT Legendary"} size={56} />
            </div>
            <XPBar value={totalXp - currentTierXp} max={nextTierXp - currentTierXp} height={10} />
            <p className="text-xs mt-1 text-gradient-gold font-bold" style={{ fontFamily: "var(--font-numeric)" }}>{Number(totalXp).toLocaleString("id-ID")} / {Number(nextTierXp).toLocaleString("id-ID")} XP</p>
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
                { name: "Daily Login", icon: "📅", p: qLogin, t: 1, xp: 100, done: qLogin >= 1 },
                { name: "New Listing", icon: "🏢", p: qListings, t: 3, xp: 100, done: qListings >= 3 },
                { name: "New Prospect", icon: "👥", p: qProspects, t: 10, xp: 100, done: qProspects >= 10 },
                { name: "New Content", icon: "📱", p: qContent, t: 1, xp: 300, done: qContent >= 1 },
                { name: "Complete Module", icon: "🎓", p: qAcademy, t: 5, xp: 200, done: qAcademy >= 5 },
              ].map((q, i) => (
                <div key={i} onClick={() => onNav("quest")} className="flex flex-col items-center flex-shrink-0 rounded-2xl border p-2.5 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-amber-500/50 hover:shadow-md"
                  style={{ minWidth: 80, borderColor: q.done ? "#86EFAC50" : T.border, backgroundColor: q.done ? (isDark ? "#0A2010" : "#F0FDF4") : T.card }}>
                  <span style={{ fontSize: 20 }}>{q.icon}</span>
                  <p className="text-center font-medium mt-1" style={{ fontSize: 9, color: T.text2, lineHeight: 1.2, maxWidth: 72 }}>{q.name}</p>
                  <p className="font-bold mt-0.5" style={{ fontSize: 10, color: "#C8922A", fontFamily: "'Rajdhani',sans-serif" }}>+{q.xp} XP</p>
                  <div className="w-full my-1"><XPBar value={q.p} max={q.t} height={3} /></div>
                  <p style={{ fontSize: 9, color: T.text3 }}>{q.p}/{q.t}</p>
                  {q.done ? (
                    <div className="mt-1.5 w-full py-1 rounded-lg text-[9px] font-bold flex items-center justify-center gap-0.5 border"
                      style={{ backgroundColor: isDark ? "rgba(34,197,94,0.12)" : "#DCFCE7", borderColor: isDark ? "rgba(34,197,94,0.3)" : "#BBF7D0", color: "#16A34A", fontFamily: "'Rajdhani',sans-serif" }}>
                      <Check size={9} strokeWidth={3.5} /> Selesai
                    </div>
                  ) : (
                    <div className="mt-1.5 w-full py-1 rounded-lg text-[9px] font-bold text-center"
                      style={{ backgroundColor: T.muted, color: T.text2, fontFamily: "'Rajdhani',sans-serif" }}>
                      Go
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
