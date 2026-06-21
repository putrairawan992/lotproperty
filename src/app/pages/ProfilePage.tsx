import { useState, useContext, useEffect, useMemo } from "react";
import { Trophy, DollarSign, TrendingUp, Building2, Users, Star, BookOpen, Award, Share2, MoreVertical, X, Check, Download, AlertCircle, Globe, Link2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import BadgeShield from "../components/BadgeShield";
import LevelBadge from "../components/LevelBadge";
import XPBar from "../components/XPBar";
import { ProfilePageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T, Rarity, ThemeCtx } from "../types";
import { BADGE_ASSETS, RARITY_CFG } from "../badgeAssets";
import { useLocation } from "../routes";
import HofAwardLaurel from "../components/HofAwardLaurel";

export const ALL_BADGES: { name: string; rarity: Rarity; locked: boolean; req: string }[] = [
  // MYTHIC (2 total, 2 unlocked)
  { name: "Billionaire Club",    rarity: "mythic",    locked: false, req: "Komisi ≥ Rp 1 Miliar" },
  { name: "Perfectionist Agent", rarity: "mythic",    locked: false, req: "Daily Quest 100 hari berturut" },
  // LEGENDARY (9 total, 6 unlocked)
  { name: "Listing Factory",     rarity: "legendary", locked: false, req: "100 Listing" },
  { name: "The Consultant",      rarity: "legendary", locked: true,  req: "100 Prospect" },
  { name: "The Leader",          rarity: "legendary", locked: false, req: "10 Recruit" },
  { name: "The Professor",       rarity: "legendary", locked: false, req: "50 Module Selesai" },
  { name: "Deal Maker",          rarity: "legendary", locked: false, req: "100 Transaksi" },
  { name: "500 Million Club",    rarity: "legendary", locked: true,  req: "Komisi ≥ Rp 500 Juta" },
  { name: "100 Million Club",    rarity: "legendary", locked: false, req: "Komisi ≥ Rp 100 Juta" },
  { name: "The Influencer",      rarity: "legendary", locked: true,  req: "100 Konten" },
  { name: "Exceptional Agent",   rarity: "legendary", locked: false, req: "Daily Quest 30 hari berturut" },
  // EPIC (6 total, 5 unlocked)
  { name: "Listing Distributor", rarity: "epic",      locked: false, req: "50 Listing" },
  { name: "Prospect Tycoon",     rarity: "epic",      locked: true,  req: "50 Prospect" },
  { name: "Team Builder",        rarity: "epic",      locked: false, req: "5 Recruit" },
  { name: "Content Creator",     rarity: "epic",      locked: false, req: "25 Konten" },
  { name: "Dedicated Agent",     rarity: "epic",      locked: false, req: "Daily Quest 7 hari berturut" },
  { name: "Certified Agent",     rarity: "epic",      locked: false, req: "10 Module Selesai" },
  // RARE (4 total, 3 unlocked)
  { name: "Listing Supplier",    rarity: "rare",      locked: false, req: "25 Listing" },
  { name: "Prospect Hunter",     rarity: "rare",      locked: false, req: "25 Prospect" },
  { name: "Talent Scout",        rarity: "rare",      locked: true,  req: "3 Recruit" },
  { name: "The Loyalist",        rarity: "rare",      locked: false, req: "Login 30 hari berturut" },
  // COMMON (4 total, 2 unlocked)
  { name: "First Listing",       rarity: "common",    locked: false, req: "1 Listing" },
  { name: "First Prospect",      rarity: "common",    locked: true,  req: "1 Prospect" },
  { name: "First Recruit",       rarity: "common",    locked: true,  req: "1 Recruit" },
  { name: "First Deal",          rarity: "common",    locked: false, req: "1 Transaksi" },
];

const HOF_ACHIEVEMENTS = [
  { cat: "Top Commission", rank: "#1", period: "Jul 2026" },
  { cat: "Top Recruit", rank: "#1", period: "Aug 2026" },
  { cat: "Rising Star", rank: "#1", period: "Oct 2026" },
  { cat: "Listing Hunter", rank: "#2", period: "Sep 2026" },
  { cat: "Content Creator", rank: "#3", period: "Nov 2026" },
  { cat: "Top Unit", rank: "#2", period: "Dec 2026" },
  { cat: "Prospecting Master", rank: "#3", period: "Jan 2027" },
  { cat: "Top 5 By Unit", rank: "#4", period: "Feb 2027" },
  { cat: "Top Primary", rank: "#5", period: "Mar 2027" },
  { cat: "Top Secondary", rank: "#3", period: "Apr 2027" },
  { cat: "Rising Star", rank: "#2", period: "May 2027" },
  { cat: "Top Commission", rank: "#2", period: "Jun 2027" },
  { cat: "Content Creator", rank: "#2", period: "Jul 2027" },
  { cat: "Top Recruit", rank: "#3", period: "Aug 2027" },
  { cat: "Listing Hunter", rank: "#4", period: "Sep 2027" },
  { cat: "Top Unit", rank: "#3", period: "Oct 2027" },
  { cat: "Top 5 By Unit", rank: "#5", period: "Nov 2027" },
  { cat: "Top Primary", rank: "#4", period: "Dec 2027" },
];

// Profile Share Language Data
const SHARE_LANG: Record<string, {
  title: string;
  rank: string;
  commission: string;
  listings: string;
  prospects: string;
  featuredBadges: string;
  hofTitle: string;
  levelLabel: string;
  closeBtn: string;
  downloadBtn: string;
  shareLinkBtn: string;
  desc: string;
}> = {
  ID: {
    title: "KARTU RINGKASAN AGEN",
    rank: "Rank Karir",
    commission: "Komisi Karir",
    listings: "Total Listing",
    prospects: "Total Prospek",
    featuredBadges: "Lencana Utama",
    hofTitle: "Prestasi HOF Teratas",
    levelLabel: "Level Agen",
    closeBtn: "Tutup",
    downloadBtn: "Unduh Kartu",
    shareLinkBtn: "Bagikan Link",
    desc: "Kartu ringkasan performa dan pencapaian resmi agen LOT Property.",
  },
  EN: {
    title: "AGENT PROFILE SUMMARY",
    rank: "Career Rank",
    commission: "Total Commission",
    listings: "Total Listings",
    prospects: "Total Prospects",
    featuredBadges: "Featured Badges",
    hofTitle: "Top HOF Achievements",
    levelLabel: "Agent Level",
    closeBtn: "Close",
    downloadBtn: "Download Card",
    shareLinkBtn: "Share Link",
    desc: "Official performance summary card for LOT Property agent.",
  },
  CN: {
    title: "LOT PROPERTY 精英经纪人档案",
    rank: "职业生涯排名",
    commission: "累计佣金总额",
    listings: "累计房源总数",
    prospects: "累计客户总数",
    featuredBadges: "核心荣誉徽章",
    hofTitle: "名人堂杰出成就",
    levelLabel: "经纪人等级",
    closeBtn: "关闭",
    downloadBtn: "下载名片",
    shareLinkBtn: "分享链接",
    desc: "LOT Property 官方认证经纪人成就与表现摘要名片。",
  }
};

const AGENT_PROFILE = {
  name: "RONALD RICHY",
  slug: "ronald-richy",
  title: "Top Producer · LotProperty",
  level: 23,
  tier: "Elite Agent",
  careerRank: "#7",
  totalListings: "892",
  totalProspects: "532",
  commission: "Rp 4.250.000.000",
  photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
};

function buildShareText(lang: "ID" | "EN" | "CN", featured: string[]) {
  const L = SHARE_LANG[lang];
  const hofLines = HOF_ACHIEVEMENTS.slice(0, 4).map(h => `• ${h.cat}: ${h.rank}`).join("\n");
  const badgeLines = featured.slice(0, 3).map(b => `• ${b}`).join("\n");

  if (lang === "EN") {
    return [
      `🏆 ${AGENT_PROFILE.name} — LOT Property Official Agent`,
      `${L.title}`,
      ``,
      `${L.levelLabel}: ${AGENT_PROFILE.level} · ${AGENT_PROFILE.tier}`,
      `${L.rank}: ${AGENT_PROFILE.careerRank}`,
      `${L.listings}: ${AGENT_PROFILE.totalListings}`,
      `${L.prospects}: ${AGENT_PROFILE.totalProspects}`,
      `${L.commission}: ${AGENT_PROFILE.commission}`,
      ``,
      `${L.hofTitle}:`,
      hofLines,
      ``,
      `${L.featuredBadges}:`,
      badgeLines,
      ``,
      `LOT PROPERTY OFFICIAL CERTIFIED AGENT`,
    ].join("\n");
  }

  if (lang === "CN") {
    return [
      `🏆 ${AGENT_PROFILE.name} — LOT Property 官方认证经纪人`,
      `${L.title}`,
      ``,
      `${L.levelLabel}: ${AGENT_PROFILE.level} · ${AGENT_PROFILE.tier}`,
      `${L.rank}: ${AGENT_PROFILE.careerRank}`,
      `${L.listings}: ${AGENT_PROFILE.totalListings}`,
      `${L.prospects}: ${AGENT_PROFILE.totalProspects}`,
      `${L.commission}: ${AGENT_PROFILE.commission}`,
      ``,
      `${L.hofTitle}:`,
      hofLines,
      ``,
      `${L.featuredBadges}:`,
      badgeLines,
    ].join("\n");
  }

  return [
    `🏆 ${AGENT_PROFILE.name} — Agen Resmi LOT Property`,
    `${L.title}`,
    ``,
    `${L.levelLabel}: ${AGENT_PROFILE.level} · ${AGENT_PROFILE.tier}`,
    `${L.rank}: ${AGENT_PROFILE.careerRank}`,
    `${L.listings}: ${AGENT_PROFILE.totalListings}`,
    `${L.prospects}: ${AGENT_PROFILE.totalProspects}`,
    `${L.commission}: ${AGENT_PROFILE.commission}`,
    ``,
    `${L.hofTitle}:`,
    hofLines,
    ``,
    `${L.featuredBadges}:`,
    badgeLines,
    ``,
    `LOT PROPERTY OFFICIAL CERTIFIED AGENT`,
  ].join("\n");
}

export default function ProfilePage({ onLogout }: { onLogout?: () => void }) {
  const loading = useLoading(1200);
  const { isDark } = useTheme();
  const { getQueryParam, navigate, search } = useLocation();
  
  const [showAllHof, setShowAllHof] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Featured badges states (limited to 3)
  const [featured, setFeatured] = useState<string[]>([
    "Billionaire Club",
    "Perfectionist Agent",
    "The Leader",
  ]);

  const [showManageBadges, setShowManageBadges] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeLang, setActiveLang] = useState<"ID" | "EN" | "CN">("ID");
  
  const [successToast, setSuccessToast] = useState("");
  const [errorAlert, setErrorAlert] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const shareCard = params.get("shareCard");
    const lang = params.get("lang") as "ID" | "EN" | "CN" | null;
    if (shareCard === "1") {
      setShowShareModal(true);
      if (lang && ["ID", "EN", "CN"].includes(lang)) setActiveLang(lang);
    }
  }, [search]);

  const shareUrl = useMemo(
    () => `${typeof window !== "undefined" ? window.location.origin : ""}/profile?shareCard=1&lang=${activeLang}`,
    [activeLang]
  );

  if (loading) return <ProfilePageSkeleton />;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const triggerError = (msg: string) => {
    setErrorAlert(msg);
    setTimeout(() => setErrorAlert(""), 4000);
  };

  const visibleHof = showAllHof ? HOF_ACHIEVEMENTS : HOF_ACHIEVEMENTS.slice(0, 5);

  const totalBadges = ALL_BADGES.length;
  const unlockedBadges = ALL_BADGES.filter(b => !b.locked).length;
  const progressPercent = Math.round((unlockedBadges / totalBadges) * 100);

  const getRarityCount = (r: Rarity) => {
    return ALL_BADGES.filter(b => b.rarity === r && !b.locked).length;
  };

  const repBadges: Record<Rarity, string> = {
    mythic: "Billionaire Club",
    legendary: "The Leader",
    epic: "Listing Distributor",
    rare: "Listing Supplier",
    common: "First Listing",
  };

  const handleToggleBadge = (badgeName: string) => {
    if (featured.includes(badgeName)) {
      setFeatured(prev => prev.filter(name => name !== badgeName));
    } else {
      if (featured.length >= 3) {
        triggerError("Batas maksimum Featured Badge adalah 3! Hapus badge aktif terlebih dahulu.");
        return;
      }
      setFeatured(prev => [...prev, badgeName]);
    }
  };

  const handleDownloadCard = () => {
    triggerToast("Menyiapkan unduhan kartu profil...");
    const text = buildShareText(activeLang, featured);
    setTimeout(() => {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LOT-Profile-${AGENT_PROFILE.slug}-${activeLang}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(`Kartu profil (${activeLang}) berhasil diunduh!`);
    }, 800);
  };

  const handleShareLink = async () => {
    const text = buildShareText(activeLang, featured);
    const payload = `${text}\n\n🔗 ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${AGENT_PROFILE.name} — LOT Property`,
          text: payload,
          url: shareUrl,
        });
        triggerToast("Link profil berhasil dibagikan!");
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(payload);
      triggerToast("Link profil berhasil disalin ke clipboard!");
    } catch {
      triggerError("Gagal menyalin link. Silakan coba lagi.");
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    if (getQueryParam("shareCard")) navigate("/profile");
  };

  const L = SHARE_LANG[activeLang];

  return (
    <div className="p-4 lg:p-6 transition-colors duration-300 relative">
      {/* Toast Notif */}
      <AnimatePresence>
        {successToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {errorAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#DC2626] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-red-500/20">
            <AlertCircle size={16} /> {errorAlert}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="space-y-6">
          {/* Portrait Photo Card */}
          <Card className="overflow-hidden border border-border/60 relative group shadow-lg">
            <div className="w-full aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-[#1C1812] to-[#0A0A0A]">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"
                alt="Ronald Richy"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
              />
              {/* Premium Inner Gold Border */}
              <div className="absolute inset-0 border-[3px] border-[#C8922A]/70 pointer-events-none rounded-inherit" />
              {/* Subtle Gradient Shadow */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              
              {/* Mobile-only Name Overlay on the image */}
              <div className="absolute bottom-4 left-4 right-4 block lg:hidden z-10 text-center">
                <h2 className="font-bold text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  RONALD RICHY
                </h2>
                <div className="flex justify-center mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-bold text-[10px] text-white bg-[#7040D0] border border-[#7040D0]/30 shadow-md uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    ⭐ Elite Agent
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only Stats Block */}
            <div className="block lg:hidden p-5 border-t border-border/40 bg-card/60 backdrop-blur-md">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border"
                  style={{ borderColor: "#E8A50030", backgroundColor: isDark ? "rgba(232,165,0,0.06)" : "#FFFAED" }}>
                  <LevelBadge title="Elite Agent" size={40} />
                  <p className="font-bold text-lg mt-1 text-[#E8A500]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>23</p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">LEVEL</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border"
                  style={{ borderColor: "#C8922A30", backgroundColor: isDark ? "rgba(200,146,42,0.06)" : "#FDF6E3" }}>
                  <Trophy size={20} className="text-[#C8922A]" />
                  <p className="font-bold text-lg mt-2 text-[#C8922A]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>18</p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">HOF HITS</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border"
                  style={{ borderColor: "#7040D030", backgroundColor: isDark ? "rgba(112,64,208,0.06)" : "#F5F0FD" }}>
                  <Award size={20} className="text-[#7040D0]" />
                  <p className="font-bold text-lg mt-2 text-[#7040D0]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>18/25</p>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">BADGES</p>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground tracking-wider uppercase text-[10px]">XP PROGRESS</span>
                  <span className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-numeric)" }}>24.680 / 30.000 XP</span>
                </div>
                <XPBar value={24680} max={30000} height={8} />
                <p className="text-[10px] text-muted-foreground text-center pt-1">82.26% menuju Level 24 (Elite Agent)</p>
              </div>
            </div>

            <div className="p-4 bg-muted/10 border-t border-border/40 space-y-2">
              <button onClick={() => setShowShareModal(true)} className="w-full flex lg:hidden items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border border-[#C8922A]/40 text-[#C8922A] bg-[#C8922A]/5 hover:bg-[#C8922A]/10 transition-all uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                <Share2 size={13} /> Share Profile
              </button>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Header (Desktop Only) */}
          <Card className="hidden lg:block p-6 shadow-lg border border-border/50 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="font-extrabold text-3xl tracking-wide text-gradient-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    RONALD RICHY
                  </h1>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#E8A500] text-white" title="Verified Producer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold text-xs text-white bg-[#7040D0] border border-[#7040D0]/20 shadow-md uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ELITE AGENT
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#C8922A]/40 text-[#C8922A] hover:bg-[#C8922A]/10 text-xs font-bold transition-all uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <Share2 size={13} />
                  Share Profile
                </button>
              </div>
            </div>

            {/* Grid of 3 stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border"
                style={{ borderColor: "#E8A50030", backgroundColor: isDark ? "rgba(232,165,0,0.06)" : "#FFFAED" }}>
                <LevelBadge title="Elite Agent" size={48} />
                <div>
                  <p className="font-bold text-2xl text-[#E8A500]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.1 }}>23</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Level 23</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">LEVEL</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border"
                style={{ borderColor: "#C8922A30", backgroundColor: isDark ? "rgba(200,146,42,0.06)" : "#FDF6E3" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#C8922A]/10 text-[#C8922A]">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="font-bold text-2xl text-[#C8922A]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.1 }}>18</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">HOF Hits</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">HALL OF FAME</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border"
                style={{ borderColor: "#7040D030", backgroundColor: isDark ? "rgba(112,64,208,0.06)" : "#F5F0FD" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#7040D0]/10 text-[#7040D0]">
                  <Award size={24} />
                </div>
                <div>
                  <p className="font-bold text-2xl text-[#7040D0]" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1.1 }}>
                    18 <span className="text-sm font-normal text-muted-foreground">/ 25</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Unlocked</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">BADGE</p>
                </div>
              </div>
            </div>

            {/* XP PROGRESS BAR */}
            <div className="border-t border-border/40 pt-4">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-muted-foreground tracking-wider uppercase text-[10px]">XP PROGRESS</span>
                </div>
                <span className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-numeric)" }}>24.680 / 30.000 XP</span>
              </div>
              <XPBar value={24680} max={30000} height={10} />
              <p className="text-[11px] text-muted-foreground text-left mt-1.5">
                82.26% menuju Level 24 (Elite Agent)
              </p>
            </div>
          </Card>

          {/* ==================== HALL OF FAME HISTORY ==================== */}
          <div
            className="relative overflow-hidden rounded-[28px] p-4 sm:px-11 sm:pt-11 sm:pb-9"
            style={{
              background: isDark
                ? "radial-gradient(ellipse 1000px 300px at 50% -20%, rgba(255,255,255,0.035), transparent 70%), linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 45%, rgba(0,0,0,0.25) 100%)"
                : "radial-gradient(ellipse 1000px 300px at 50% -20%, rgba(255,255,255,0.035), transparent 70%), linear-gradient(165deg, rgba(14,18,28,0.92) 0%, rgba(18,24,36,0.88) 55%, rgba(10,14,22,0.94) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="relative z-[1] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-5 sm:mb-11">
              <div>
                <p
                  className="text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.45em] uppercase font-semibold mb-2 sm:mb-2.5 m-0"
                  style={{ color: "#87858d", fontFamily: "'Inter', sans-serif" }}
                >
                  Official Selection
                </p>
                <h3
                  className="m-0 font-normal text-[24px] sm:text-[36px] tracking-[0.06em] uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif", color: "#f3f2ee" }}
                >
                  Hall of Fame History
                </h3>
              </div>
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-semibold whitespace-nowrap self-start"
                style={{
                  color: "#f3dca0",
                  border: "1px solid rgba(202,165,76,0.35)",
                  background: "linear-gradient(180deg, rgba(202,165,76,0.10), rgba(202,165,76,0.02))",
                }}
              >
                <Award size={14} className="flex-shrink-0" />
                {HOF_ACHIEVEMENTS.length} Awards
              </div>
            </div>

            <div className="relative z-[1] grid grid-cols-3 gap-x-1.5 gap-y-4 sm:flex sm:flex-wrap sm:justify-between sm:gap-x-3 sm:gap-y-0">
              {visibleHof.map((h, i) => (
                <motion.div
                  key={`${h.cat}-${h.period}-${i}`}
                  className="flex justify-center sm:flex-1 sm:min-w-[150px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
                >
                  <HofAwardLaurel category={h.cat} rank={h.rank} period={h.period} />
                </motion.div>
              ))}
            </div>

            {HOF_ACHIEVEMENTS.length > 5 && (
              <>
                <div
                  className="relative z-[1] h-px my-8 sm:my-10"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)",
                  }}
                />
                <div className="relative z-[1] text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllHof(!showAllHof)}
                    className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.22em] uppercase transition-all hover:gap-3"
                    style={{
                      color: showAllHof ? "#f3dca0" : "#87858d",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {showAllHof ? "Lihat Lebih Sedikit" : "Lihat Semua Hall of Fame"}
                    <ChevronRight
                      size={12}
                      style={{ transform: showAllHof ? "rotate(-90deg)" : "none", transition: "transform 0.2s ease" }}
                    />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Featured Badges */}
          <Card className="p-5 shadow-lg border border-border/50">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#E8A500]" />
                <h3 className="font-bold text-[16px] tracking-wide text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  FEATURED BADGES
                </h3>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">· Maksimal 3 Lencana</span>
              </div>
              <button onClick={() => setShowManageBadges(true)}
                className="text-xs font-bold text-[#E8A500] hover:opacity-80 transition-all uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Kelola Badge
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {featured.length === 0 ? (
                <div className="col-span-3 py-8 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                  <Award size={36} className="mb-2 opacity-45" />
                  <p className="text-xs">Belum ada Featured Badge yang dipilih</p>
                  <button onClick={() => setShowManageBadges(true)} className="text-xs text-[#E8A500] font-bold mt-2 hover:underline">Pilih Sekarang</button>
                </div>
              ) : (
                featured.map((name, i) => {
                  const b = ALL_BADGES.find(item => item.name === name);
                  if (!b) return null;
                  const asset = BADGE_ASSETS[b.name];
                  const c = RARITY_CFG[b.rarity];
                  const rarityGlow = `drop-shadow(0 0 ${b.rarity === "mythic" ? "12px" : "8px"} ${c.glow}) drop-shadow(0 4px 6px rgba(0,0,0,0.3))`;

                  return (
                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-102 hover:shadow-md animate-fade-in"
                      style={{ borderColor: `${c.color}25`, backgroundColor: isDark ? c.darkBg : c.bg }}>
                      {asset && (
                        <img src={asset} alt={b.name} style={{
                          width: 84,
                          height: 84,
                          objectFit: "contain",
                          filter: rarityGlow,
                        }} className="mb-2" />
                      )}
                      <p className="font-bold text-center leading-tight uppercase text-xs"
                        style={{ color: isDark ? c.darkColor : c.color, fontFamily: "'Rajdhani', sans-serif" }}>
                        {b.name}
                      </p>
                      <span className="text-[8px] font-bold px-2 py-0.5 mt-1.5 rounded-full uppercase text-white shadow-sm"
                        style={{ backgroundColor: c.color, fontFamily: "'Rajdhani', sans-serif" }}>
                        {c.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Career Statistics */}
          <Card className="p-5 shadow-lg border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#E8A500]" />
              <h3 className="font-bold text-[16px] tracking-wide text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                CAREER STATISTICS
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { l: "Total Commission",  v: "Rp 4.250.000.000", icon: DollarSign, color: "#E8A500" },
                { l: "Total Transactions", v: "127",              icon: TrendingUp, color: "#16A34A" },
                { l: "Total Listings",    v: "892",               icon: Building2,  color: "#1A6FC4" },
                { l: "Total Prospects",   v: "532",               icon: Users,      color: "#7B2FBE" },
                { l: "Total Recruits",    v: "14",                icon: Star,       color: "#C8922A" },
                { l: "Training Completed",v: "67",                icon: BookOpen,   color: "#308030" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + "15" }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-extrabold leading-tight text-[15px] sm:text-[17px] text-foreground whitespace-nowrap truncate"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      {s.v}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wide whitespace-nowrap truncate">{s.l}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Badge Collection */}
          <Card className="p-5 shadow-lg border border-border/50">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#E8A500]" />
                <h3 className="font-bold text-[16px] tracking-wide text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  BADGE COLLECTION
                </h3>
              </div>
              <button
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="text-xs font-bold text-[#E8A500] hover:opacity-80 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {showAllBadges ? "Tutup Semua Badge" : "Lihat Semua Badge"}
              </button>
            </div>

            {/* circular ring + columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center border border-border/30 rounded-2xl p-5 bg-muted/10">
              
              {/* Progress Circle (Span 5) */}
              <div className="md:col-span-5 flex items-center gap-4 border-r border-border/30 pr-0 md:pr-4 justify-center md:justify-start">
                <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke={isDark ? "#2A2218" : "#E5E0D5"}
                      strokeWidth="5"
                      fill="transparent"
                      className="opacity-40"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#E8A500"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-numeric)" }}>
                      {unlockedBadges} <span className="text-[10px] text-muted-foreground">/ {totalBadges}</span>
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Unlocked</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-2xl text-gradient-gold leading-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {progressPercent}%
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-1 tracking-wide">Collection Progress</p>
                </div>
              </div>

              {/* Rarity Tabs (Span 7) */}
              <div className="md:col-span-7 grid grid-cols-5 gap-1.5 text-center">
                {(["mythic", "legendary", "epic", "rare", "common"] as const).map(r => {
                  const c = RARITY_CFG[r];
                  const repBadgeName = repBadges[r];
                  const repBadgeImg = BADGE_ASSETS[repBadgeName];
                  const count = getRarityCount(r);
                  const total = ALL_BADGES.filter(b => b.rarity === r).length;

                  return (
                    <div key={r} className="flex flex-col items-center p-1.5 rounded-xl border border-border/30 bg-card/40 transition-transform hover:scale-103"
                      style={{ borderColor: `${c.color}20` }}>
                      <span className="text-[9px] font-bold capitalize mb-1" style={{ color: isDark ? c.darkColor : c.color, fontFamily: "'Rajdhani', sans-serif" }}>
                        {r}
                      </span>
                      {repBadgeImg ? (
                        <img
                          src={repBadgeImg}
                          alt={r}
                          className="w-8 h-8 object-contain my-1"
                          style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-muted">⭐</div>
                      )}
                      <span className="text-xs font-bold text-foreground mt-1" style={{ fontFamily: "var(--font-numeric)" }}>
                        {count}
                      </span>
                      <span className="text-[8px] text-muted-foreground">/ {total}</span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Expandable all badges view */}
            {showAllBadges && (
              <div className="mt-5 pt-5 border-t border-border/30 animate-fade-in">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {ALL_BADGES.map((b, i) => (
                    <BadgeShield key={i} rarity={b.rarity} name={b.name} locked={b.locked} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </Card>

        </div>

      </div>

      {/* ── MODAL: MANAGE BADGES (MAX 3) ── */}
      <AnimatePresence>
        {showManageBadges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowManageBadges(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <div>
                  <h3 className="font-bold font-display text-lg" style={{ color: T.text1 }}>Featured Badges Showcase</h3>
                  <p className="text-xs" style={{ color: T.text3 }}>Pilih maksimal 3 lencana unlocked untuk ditampilkan di profil Anda ({featured.length}/3)</p>
                </div>
                <button onClick={() => setShowManageBadges(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[380px] space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALL_BADGES.map((b, i) => {
                    const isFeatured = featured.includes(b.name);
                    const asset = BADGE_ASSETS[b.name];
                    const c = RARITY_CFG[b.rarity];
                    
                    if (b.locked) return null;

                    return (
                      <button key={i} onClick={() => handleToggleBadge(b.name)}
                        className="p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center relative text-center"
                        style={{ 
                          borderColor: isFeatured ? "#E8A500" : T.border, 
                          backgroundColor: isFeatured ? (isDark ? "rgba(232, 165, 0, 0.08)" : "#FFFAED") : T.card,
                          boxShadow: isFeatured ? "0 0 10px rgba(232, 165, 0, 0.15)" : "none"
                        }}>
                        {isFeatured && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E8A500] text-white flex items-center justify-center font-bold text-[10px]">✓</div>
                        )}
                        {asset && (
                          <img src={asset} alt={b.name} className="w-14 h-14 object-contain mb-2" style={{ filter: isFeatured ? `drop-shadow(0 0 6px ${c.glow})` : "none" }} />
                        )}
                        <p className="text-xs font-bold leading-tight uppercase font-display" style={{ color: isFeatured ? "#E8A500" : T.text1 }}>{b.name}</p>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 mt-1 rounded-full uppercase" style={{ backgroundColor: c.color, color: "white" }}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end bg-muted/10" style={{ borderColor: T.border }}>
                <button onClick={() => setShowManageBadges(false)} className="px-6 py-2.5 rounded-xl font-bold bg-[#E8A500] text-white font-display text-sm transition-all hover:bg-[#CC9200]">
                  SIMPAN SHOWCASE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SHARE PROFILE CARD (MULTI-LANGUAGE ID, EN, CN) ── */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeShareModal} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[calc(100dvh-5.5rem)] sm:max-h-[90vh]"
              style={{ borderColor: T.border }}>
              
              {/* Header with Language Tabs */}
              <div className="px-5 sm:px-6 py-4 border-b flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/10 flex-shrink-0" style={{ borderColor: T.border }}>
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <h3 className="font-bold font-display text-lg flex items-center gap-1.5" style={{ color: T.text1 }}>
                    <Globe size={18} className="text-[#E8A500]" /> Share Profile Card
                  </h3>
                  <button onClick={closeShareModal} className="p-1.5 rounded-lg hover:bg-muted sm:hidden" style={{ color: T.text3 }} aria-label="Tutup">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex gap-1 bg-muted/40 p-1 rounded-xl" style={{ backgroundColor: T.muted }}>
                  {(["ID", "EN", "CN"] as const).map(l => (
                    <button key={l} onClick={() => setActiveLang(l)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ 
                        backgroundColor: activeLang === l ? "#E8A500" : "transparent",
                        color: activeLang === l ? "white" : T.text3 
                      }}>
                      {l === "ID" ? "🇮🇩 ID" : l === "EN" ? "🇬🇧 EN" : "🇨🇳 中文"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shareable Plaque Card Display Area */}
              <div className="p-4 sm:p-6 flex flex-col items-center bg-zinc-950/20 flex-1 overflow-y-auto min-h-0">
                <div className="w-full rounded-2xl p-5 border relative overflow-hidden flex flex-col"
                  style={{
                    background: isDark ? "linear-gradient(135deg, #1C1812 0%, #0A0A0A 100%)" : "linear-gradient(135deg, #FFFFFF 0%, #FFFDF5 100%)",
                    borderColor: "#C8922A60",
                    borderWidth: "2px"
                  }}>
                  {/* Decorative corner borders */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#C8922A]" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#C8922A]" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#C8922A]" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#C8922A]" />
                  
                  {/* Plaque title */}
                  <div className="text-center mb-4">
                    <p className="text-[10px] font-black tracking-widest text-[#C8922A]" style={{ fontFamily: "var(--font-display)" }}>{L.title}</p>
                    <div className="w-12 h-0.5 bg-[#C8922A]/40 mx-auto mt-1" />
                  </div>

                  {/* Agent Info Row */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/20" style={{ borderColor: T.border }}>
                    <img src={AGENT_PROFILE.photo} alt="Ronald Richy" 
                      className="w-14 h-14 rounded-full object-cover object-top border border-[#C8922A] p-0.5 bg-card flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xl leading-none text-gradient-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{AGENT_PROFILE.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider">{AGENT_PROFILE.title}</p>
                      <span className="inline-block text-[9px] px-2 py-0.5 bg-[#7040D0]/10 text-[#7040D0] rounded font-black border border-[#7040D0]/20 uppercase tracking-widest mt-1">
                        {L.levelLabel}: {AGENT_PROFILE.level} · {AGENT_PROFILE.tier}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-xl border border-border/20 bg-muted/10 text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">{L.rank}</p>
                      <p className="font-black text-sm text-[#E8A500] mt-0.5 font-display" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{AGENT_PROFILE.careerRank}</p>
                    </div>
                    <div className="p-2 rounded-xl border border-border/20 bg-muted/10 text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">{L.listings}</p>
                      <p className="font-black text-sm text-[#E8A500] mt-0.5 font-display" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{AGENT_PROFILE.totalListings}</p>
                    </div>
                    <div className="p-2 rounded-xl border border-border/20 bg-muted/10 text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">{L.prospects}</p>
                      <p className="font-black text-sm text-[#E8A500] mt-0.5 font-display" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{AGENT_PROFILE.totalProspects}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1.5 tracking-wider">{L.commission}</p>
                    <p className="font-black text-xl text-gradient-gold font-display leading-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{AGENT_PROFILE.commission}</p>
                  </div>

                  {/* HOF Achievements list summary */}
                  <div className="mb-4 space-y-1.5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{L.hofTitle}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {HOF_ACHIEVEMENTS.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex justify-between items-center p-1.5 rounded bg-muted/20 border border-border/10 text-[9px] font-bold text-foreground">
                          <span className="truncate">{h.cat}</span>
                          <span className="text-[#C8922A] ml-1">{h.rank}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badges Display Row */}
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-2 tracking-wider">{L.featuredBadges}</p>
                    <div className="flex gap-2">
                      {featured.slice(0, 3).map((name, i) => {
                        const b = ALL_BADGES.find(item => item.name === name);
                        if (!b) return null;
                        const asset = BADGE_ASSETS[b.name];
                        const c = RARITY_CFG[b.rarity];
                        return (
                          <div key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-card border text-[9px]" style={{ borderColor: `${c.color}25` }}>
                            {asset && <img src={asset} alt={name} className="w-5 h-5 object-contain" />}
                            <span className="font-bold truncate text-muted-foreground" style={{ maxWidth: 80 }}>{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LotProperty watermark logo */}
                  <div className="flex justify-end mt-4 pt-3 border-t border-border/20 text-[9px] font-black text-muted-foreground/40 italic font-display" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    LOT PROPERTY OFFICIAL CERTIFIED AGENT
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-3">{L.desc}</p>

                {/* Share link preview */}
                <div className="w-full mt-3 p-3 rounded-xl border bg-muted/20" style={{ borderColor: T.border }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Share Link</p>
                  <p className="text-[10px] break-all font-mono" style={{ color: "#E8A500" }}>{shareUrl}</p>
                </div>
              </div>

              {/* Share actions */}
              <div className="px-4 sm:px-6 py-4 border-t bg-card flex-shrink-0 space-y-2" style={{ borderColor: T.border }}>
                <div className="flex gap-2">
                  <button onClick={handleShareLink}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all hover:bg-muted"
                    style={{ borderColor: "#C8922A60", color: "#C8922A", fontFamily: "'Rajdhani', sans-serif" }}>
                    <Link2 size={14} /> {L.shareLinkBtn}
                  </button>
                  <button onClick={handleDownloadCard}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#E8A500] text-white flex items-center justify-center gap-1.5 transition-all hover:bg-[#CC9200]"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <Download size={14} /> {L.downloadBtn}
                  </button>
                </div>
                <button onClick={closeShareModal}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: T.border, color: T.text3 }}>
                  {L.closeBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// useTheme helper
const useTheme = () => useContext(ThemeCtx);
