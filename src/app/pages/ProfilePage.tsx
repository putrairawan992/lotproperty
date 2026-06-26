import { useState, useContext, useEffect, useMemo } from "react";
import { Trophy, DollarSign, TrendingUp, Building2, Users, Star, BookOpen, Award, Share2, X, Check, Download, AlertCircle, Globe, ChevronRight } from "lucide-react";
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
import { eliteAgentBase64 } from "@/imports/elite-agent-base64";
import HofAwardLaurel from "../components/HofAwardLaurel";
import HofFallingStars from "../components/HofFallingStars";
import EllipsisTooltip from "../components/EllipsisTooltip";
import EmptyState from "../components/EmptyState";

type RarityKey = keyof typeof RARITY_CFG;

interface BadgeItem {
  name: string;
  rarity: RarityKey;
  locked: boolean;
  req: string;
  code: string;
}

export const ALL_BADGES: { name: string; rarity: Rarity; locked: boolean; req: string }[] = [
  // API-first: only used as empty fallback if profile API is unavailable
];

const HOF_ACHIEVEMENTS = [
  // API-first: only used as empty fallback if profile API is unavailable
];

// Profile Share Language Data
const SHARE_LANG: Record<"ID" | "EN" | "CN", {
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
  transactions: string;
  level: string;
  hof: string;
  badges: string;
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
    transactions: "Total Transaksi",
    level: "Level",
    hof: "HOF Hits",
    badges: "Lencana",
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
    transactions: "Total Transactions",
    level: "Level",
    hof: "HOF Hits",
    badges: "Badges",
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
    transactions: "交易总数",
    level: "等级",
    hof: "名人堂",
    badges: "勋章",
  }
};

function buildShareText(
  lang: "ID" | "EN" | "CN",
  featured: string[],
  agentProfile: { name: string; level: number; tier: string; careerRank: string; totalTransactions: string },
  hofItems: Array<{ cat: string; rank: string; period: string }>,
  badgeProgress: { unlocked: number; total: number }
) {
  const L = SHARE_LANG[lang];
  const hofLines = hofItems.slice(0, 4).map(h => `• ${h.cat}: ${h.rank}`).join("\n");
  const badgeLines = featured.slice(0, 3).map(b => `• ${b}`).join("\n");

  if (lang === "EN") {
    return [
      `🏆 ${agentProfile.name} — LOT Property Official Agent`,
      `${L.title}`,
      ``,
      `${L.levelLabel}: ${agentProfile.level} · ${agentProfile.tier}`,
      `${L.rank}: ${agentProfile.careerRank}`,
      `${L.transactions}: ${agentProfile.totalTransactions} Transactions`,
      `${L.level}: ${agentProfile.level}`,
      `${L.hof}: ${hofItems.length}`,
      `${L.badges}: ${badgeProgress.unlocked}/${badgeProgress.total}`,
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
      `🏆 ${agentProfile.name} — LOT Property 官方认证经纪人`,
      `${L.title}`,
      ``,
      `${L.levelLabel}: ${agentProfile.level} · ${agentProfile.tier}`,
      `${L.rank}: ${agentProfile.careerRank}`,
      `${L.transactions}: ${agentProfile.totalTransactions} 笔交易`,
      `${L.level}: ${agentProfile.level}`,
      `${L.hof}: ${hofItems.length}`,
      `${L.badges}: ${badgeProgress.unlocked}/${badgeProgress.total}`,
      ``,
      `${L.hofTitle}:`,
      hofLines,
      ``,
      `${L.featuredBadges}:`,
      badgeLines,
    ].join("\n");
  }

  return [
    `🏆 ${agentProfile.name} — Agen Resmi LOT Property`,
    `${L.title}`,
    ``,
    `${L.levelLabel}: ${agentProfile.level} · ${agentProfile.tier}`,
    `${L.rank}: ${agentProfile.careerRank}`,
    `${L.transactions}: ${agentProfile.totalTransactions} Transaksi`,
    `${L.level}: ${agentProfile.level}`,
    `${L.hof}: ${hofItems.length}`,
    `${L.badges}: ${badgeProgress.unlocked}/${badgeProgress.total}`,
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

import { api } from "../services/api";

export default function ProfilePage({ onLogout }: { onLogout?: () => void }) {
  const loadingTime = useLoading(1200);
  const { isDark, isGuest } = useContext(ThemeCtx);
  const [profileLoading, setProfileLoading] = useState(true);

  const loading = loadingTime || (isGuest ? false : profileLoading);
  const { getQueryParam, navigate, search } = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [hofHistory, setHofHistory] = useState<any[]>([]);
  const [badgeCollection, setBadgeCollection] = useState<any[] | null>(null);
  const [careerRank, setCareerRank] = useState("#-");

  const [showAllHof, setShowAllHof] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Featured badges states (limited to 3)
  const [featured, setFeatured] = useState<string[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (isGuest) {
        setProfile({
          name: "Ronald Richy",
          email: "ronald@lot.id",
          level: 23,
          title: "Senior Agent",
          total_xp: 24680,
          weekly_xp: 1620,
          total_commission: 350000000,
          total_transactions: 12,
          total_listings: 5,
          total_prospects: 6,
          photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
          hof_history: [
            { category: "Top Commission", rank: 1, period: "Mei 2026" },
            { category: "Top Producer", rank: 2, period: "April 2026" },
          ],
          badge_collection: [
            { name: "Billionaire Club", rarity: "mythic", locked: true, req: "Komisi 1 Miliar", is_featured: false, code: "billionaire" },
            { name: "Perfectionist Agent", rarity: "mythic", locked: true, req: "100% CSI", is_featured: false, code: "perfectionist" },
            { name: "Listing Factory", rarity: "legendary", locked: false, req: "50 Listings", is_featured: true, code: "listing_factory" },
            { name: "The Consultant", rarity: "legendary", locked: false, req: "10 deals", is_featured: true, code: "consultant" },
            { name: "First Listing", rarity: "common", locked: false, req: "First Listing", is_featured: false, code: "first_listing" },
          ]
        });
        setCareerRank("#3");
        setHofHistory([
          { cat: "Top Commission", rank: "#1", period: "Mei 2026" },
          { cat: "Top Producer", rank: "#2", period: "April 2026" },
        ]);
        setBadgeCollection([
          { name: "Billionaire Club", rarity: "mythic", locked: true, req: "Komisi 1 Miliar", is_featured: false, code: "billionaire" },
          { name: "Perfectionist Agent", rarity: "mythic", locked: true, req: "100% CSI", is_featured: false, code: "perfectionist" },
          { name: "Listing Factory", rarity: "legendary", locked: false, req: "50 Listings", is_featured: true, code: "listing_factory" },
          { name: "The Consultant", rarity: "legendary", locked: false, req: "10 deals", is_featured: true, code: "consultant" },
          { name: "First Listing", rarity: "common", locked: false, req: "First Listing", is_featured: false, code: "first_listing" },
        ]);
        setFeatured(["Listing Factory", "The Consultant"]);
        setProfileLoading(false);
        return;
      }
      try {
        setProfileLoading(true);
        const slugParam = getQueryParam("id");
        let data: any;
        if (slugParam) {
          data = await api.profile.getProfile(slugParam);
        } else {
          const me = await api.auth.getMe();
          data = await api.profile.getProfile(String(me?.id));
        }
        setProfile(data);
        if (Array.isArray(data?.hof_history)) {
          setHofHistory(data.hof_history.map((h: any) => ({ cat: h.category, rank: `#${h.rank}`, period: h.period })));
        }
        if (Array.isArray(data?.badge_collection)) {
          setBadgeCollection(data.badge_collection);
          const feat = data.badge_collection.filter((b: any) => b.is_featured).map((b: any) => b.name);
          setFeatured(feat.slice(0, 3));
        }

        try {
          const leaderboard = await api.dashboard.getWeeklyLeaderboard();
          if (Array.isArray(leaderboard)) {
            const found = leaderboard.find((row: any) => Number(row?.id) === Number(data?.id));
            if (found && Number(found.rank) > 0) {
              setCareerRank(`#${found.rank}`);
            } else {
              setCareerRank("#-");
            }
          }
        } catch {
          setCareerRank("#-");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [search, isGuest]);

  const [showManageBadges, setShowManageBadges] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeLang, setActiveLang] = useState<"ID" | "EN" | "CN">("ID");

  const [successToast, setSuccessToast] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);

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

  const allBadgesData = useMemo(() => {
    if (!Array.isArray(badgeCollection) || badgeCollection.length === 0) return [];
    return badgeCollection.map((b: any) => ({
      name: String(b.name || "Unknown Badge"),
      rarity: (String(b.rarity || "common").toLowerCase() as Rarity),
      locked: Boolean(b.locked),
      req: String(b.req || ""),
      code: String(b.code || ""),
    }));
  }, [badgeCollection]);

  const profileCard = useMemo(() => {
    const name = String(profile?.name || "").toUpperCase();
    const slug = String(profile?.email || "").split("@")[0];
    const level = Number(profile?.level || 0);
    const tier = String(profile?.title || "");
    const tx = Number(profile?.total_transactions || 0);
    const list = Number(profile?.total_listings || 0);
    const prospect = Number(profile?.total_prospects || 0);
    const commission = Number(profile?.total_commission || 0);
    const fallbackPhoto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%2317111a'/%3E%3Ccircle cx='100' cy='85' r='40' fill='%23332b3d'/%3E%3Ccircle cx='100' cy='85' r='32' fill='%234a3f5c'/%3E%3Cellipse cx='100' cy='190' rx='60' ry='45' fill='%23332b3d'/%3E%3C/svg%3E";

    return {
      name,
      slug,
      title: String(profile?.title || ""),
      level,
      tier,
      careerRank,
      totalListings: String(list),
      totalProspects: String(prospect),
      totalTransactions: String(tx),
      commission: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(commission || 0),
      photo: (() => {
        const raw = profile?.photo_url && String(profile.photo_url).trim();
        if (!raw) return fallbackPhoto;
        try {
          const u = new URL(raw);
          if (u.protocol === "http:" || u.protocol === "https:") {
            // Rewrite to same-origin so Vercel reverse proxy (vercel.json) handles it.
            // Eliminates Mixed Content blocking and canvas cross-origin tainting.
            return `${window.location.origin}${u.pathname}`;
          }
        } catch { /* data URI or relative path – keep as-is */ }
        return raw;
      })(),
    };
  }, [profile, careerRank]);

  const xpProgress = useMemo(() => {
    const totalXP = Number(profile?.total_xp || 0);

    if (totalXP >= 5000000) {
      return {
        currentXP: totalXP,
        nextXP: 5000000,
        percent: 100,
      };
    }

    let currentStart = 0;
    let step = 2500;

    if (totalXP < 50000) {
      currentStart = Math.floor(totalXP / 2500) * 2500;
      step = 2500;
    } else if (totalXP < 200000) {
      currentStart = 50000 + Math.floor((totalXP - 50000) / 7500) * 7500;
      step = 7500;
    } else if (totalXP < 800000) {
      currentStart = 200000 + Math.floor((totalXP - 200000) / 30000) * 30000;
      step = 30000;
    } else if (totalXP < 2000000) {
      currentStart = 800000 + Math.floor((totalXP - 800000) / 60000) * 60000;
      step = 60000;
    } else {
      currentStart = 2000000 + Math.floor((totalXP - 2000000) / 158000) * 158000;
      step = 158000;
    }

    const nextXP = currentStart + step;
    const percent = Math.max(0, Math.min(100, Math.round(((totalXP - currentStart) / step) * 100)));

    return {
      currentXP: totalXP,
      nextXP,
      percent,
    };
  }, [profile]);

  if (loading) return <ProfilePageSkeleton />;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const triggerError = (msg: string) => {
    setErrorAlert(msg);
    setTimeout(() => setErrorAlert(""), 4000);
  };

  const visibleHof = showAllHof ? hofHistory : hofHistory.slice(0, 6);

  const totalBadges = allBadgesData.length;
  const unlockedBadges = allBadgesData.filter((b: any) => !b.locked).length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedBadges / totalBadges) * 100) : 0;

  const getRarityCount = (r: Rarity) => {
    return allBadgesData.filter((b: any) => b.rarity === r && !b.locked).length;
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

  const handleSaveFeaturedBadges = async () => {
    if (!Array.isArray(badgeCollection) || badgeCollection.length === 0) {
      triggerError("Data badge dari server belum siap. Coba refresh halaman.");
      return;
    }

    const codeByName = new Map<string, string>();
    badgeCollection.forEach((b: any) => {
      codeByName.set(String(b.name || ""), String(b.code || ""));
    });

    const selectedCodes = featured
      .map((name) => codeByName.get(name) || "")
      .filter((code) => code.length > 0);

    setSavingFeatured(true);
    try {
      await api.profile.updateFeaturedBadges(selectedCodes);
      triggerToast("Featured badges berhasil disimpan.");
      setShowManageBadges(false);
    } catch (error) {
      triggerError(error instanceof Error ? error.message : "Gagal menyimpan featured badges.");
    } finally {
      setSavingFeatured(false);
    }
  };

  const drawRoundedRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const loadDataImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      // Required to avoid canvas tainting when the image is cross-origin.
      // The backend allows all origins (AllowAllOrigins=true) so this works.
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });

  const buildCompatibilityCardCanvas = async () => {
    const width = 1580;
    const height = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    const Lx = SHARE_LANG[activeLang];
    ctx.save();
    drawRoundedRectPath(ctx, 6, 6, width - 12, height - 12, 44);
    ctx.clip();

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#2D1A05");
    bg.addColorStop(0.5, "#150D02");
    bg.addColorStop(1, "#050301");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.40;

    const glow1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, width * 0.65);
    glow1.addColorStop(0, "rgba(232, 165, 0, 0.45)");
    glow1.addColorStop(1, "rgba(232, 165, 0, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 0, width * 0.2, height * 0.8, width * 0.5);
    glow2.addColorStop(0, "rgba(249, 115, 22, 0.15)");
    glow2.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    ctx.restore();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(200,146,42,0.55)";
    drawRoundedRectPath(ctx, 6, 6, width - 12, height - 12, 44);
    ctx.stroke();

    ctx.fillStyle = "#E8A500";
    ctx.font = "900 36px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(Lx.title, 62, 92);

    ctx.fillStyle = "#8a8a8a";
    ctx.font = "700 22px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText("OFFICIAL AGENT", width - 250, 92);

    ctx.strokeStyle = "rgba(255,255,255,0.11)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(52, 122);
    ctx.lineTo(width - 52, 122);
    ctx.stroke();

    const leftX = 72;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 64px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(profileCard.name, leftX, 310);

    ctx.fillStyle = "#C8922A";
    ctx.font = "900 32px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(profileCard.tier.toUpperCase(), leftX, 370);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "700 24px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(Lx.transactions.toUpperCase(), leftX, 490);

    ctx.fillStyle = "#E8A500";
    ctx.font = "900 76px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${profileCard.totalTransactions} ${activeLang === "ID" ? "Transaksi" : activeLang === "CN" ? "笔交易" : "Transactions"}`, leftX, 585);

    const statYTop = 665;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, statYTop);
    ctx.lineTo(960, statYTop);
    ctx.stroke();

    const statBlockW = 296;
    const stats = [
      { label: Lx.level.toUpperCase(), value: String(profileCard.level) },
      { label: Lx.hof.toUpperCase(), value: String(hofHistory.length) },
      { label: Lx.badges.toUpperCase(), value: `${unlockedBadges}/${totalBadges}` },
    ];

    stats.forEach((s, i) => {
      const x = leftX + i * statBlockW;
      ctx.fillStyle = "#8a8a8a";
      ctx.font = "700 22px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
      ctx.fillText(s.label, x, 735);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 60px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
      ctx.fillText(s.value, x, 815);

      if (i < stats.length - 1) {
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.moveTo(x + statBlockW - 18, 735);
        ctx.lineTo(x + statBlockW - 18, 820);
        ctx.stroke();
      }
    });

    try {
      const photo = await loadDataImage(profileCard.photo);
      const px = 1070;
      const py = 245;
      const pw = 420;
      const ph = 560;

      ctx.save();
      drawRoundedRectPath(ctx, px, py, pw, ph, 28);
      ctx.clip();
      ctx.drawImage(photo, px, py, pw, ph);

      const photoShade = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
      photoShade.addColorStop(0, "rgba(0,0,0,0)");
      photoShade.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = photoShade;
      ctx.fillRect(px, py, pw, ph);
      ctx.restore();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#C8922A";
      drawRoundedRectPath(ctx, px, py, pw, ph, 28);
      ctx.stroke();

      const tierImg = await loadDataImage(eliteAgentBase64);
      const tierSize = 160;
      ctx.drawImage(tierImg, px + pw - tierSize + 24, py + ph - tierSize + 24, tierSize, tierSize);
    } catch {
      ctx.fillStyle = "#171717";
      drawRoundedRectPath(ctx, 1070, 245, 420, 560, 28);
      ctx.fill();
      ctx.fillStyle = "#9ca3af";
      ctx.font = "700 24px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Photo unavailable", 1154, 545);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(52, height - 72);
    ctx.lineTo(width - 52, height - 72);
    ctx.stroke();

    ctx.fillStyle = "#7a7a7a";
    ctx.font = "700 18px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText("LOT PROPERTY", 60, height - 40);
    ctx.fillText("CERTIFIED DIGITAL SCOREBOARD", width - 370, height - 40);

    return canvas;
  };

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    triggerToast("Menyiapkan unduhan gambar kartu profil...");

    try {
      // Small timeout to allow render states to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      const compatibilityCanvas = await buildCompatibilityCardCanvas();
      
      const blob = await new Promise<Blob | null>((resolve) =>
        compatibilityCanvas.toBlob(resolve, "image/png", 1)
      );

      if (!blob) throw new Error("Canvas export returned empty blob");

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `LOT-Scorecard-${profileCard.slug}-${activeLang}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      triggerToast("Gambar kartu profil berhasil diunduh!");
    } catch (err) {
      console.error(err);
      triggerError("Gagal mengunduh gambar kartu profil.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareLink = async () => {
    const text = buildShareText(activeLang, featured, profileCard, hofHistory, { unlocked: unlockedBadges, total: totalBadges });
    const payload = `${text}\n\n🔗 ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileCard.name} — LOT Property`,
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

  const handleSocialShare = async (platform: string) => {
    const text = buildShareText(activeLang, featured, profileCard, hofHistory, { unlocked: unlockedBadges, total: totalBadges });
    const payload = `${text}\n\n🔗 ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(payload);
    } catch (e) {
      // Ignore
    }

    let url = "";
    if (platform === "Instagram Story" || platform === "Instagram Post") {
      url = "https://instagram.com";
    } else if (platform === "Facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "Threads") {
      url = `https://threads.net/intent/post?text=${encodeURIComponent(payload)}`;
    } else if (platform === "WhatsApp") {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(payload)}`;
    }

    if (url) {
      window.open(url, "_blank");
    }

    triggerToast(`Membuka ${platform}... Teks caption berhasil disalin!`);
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
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-center text-center gap-2 text-sm font-semibold border border-green-500/20 w-[80vw] max-w-md">
            <Check size={16} className="flex-shrink-0" /> <span className="text-xs sm:text-sm">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {errorAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-[#DC2626] text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-center text-center gap-2 text-sm font-semibold border border-red-500/20 w-[80vw] max-w-md">
            <AlertCircle size={16} className="flex-shrink-0" /> <span className="text-xs sm:text-sm">{errorAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ==================== LEFT COLUMN ==================== */}
        <div className="space-y-6">
          {/* Profile Card with Lightning Animation */}
          <Card className="p-6 border border-border/60 relative group shadow-lg flex flex-col items-center text-center overflow-hidden">
            {/* dynamic electric lightning animation in the background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-45">
              <HofFallingStars isDark={true} mode="lightning" />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Center-aligned avatar matching Hall of Fame cards */}
              <div className="relative w-36 h-48 rounded-[20px] overflow-hidden border-[1.2px] border-[#C8922A] shadow-[0_8px_32px_rgba(200,146,42,0.25)] transition-transform duration-500 group-hover:scale-105 mb-4 bg-[#121115]">
                {/* Glow behind photo */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-65 z-10"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, rgba(200, 146, 42, 0.45), transparent 80%)`,
                  }}
                />
                <img
                  src={profileCard.photo}
                  alt={profileCard.name}
                  className="w-full h-full object-cover object-top"
                  draggable={false}
                />
                {/* Cinematic Vignette Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: "radial-gradient(circle at 50% 35%, transparent 30%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.65) 100%)",
                  }}
                />
                {/* Metallic inner frame line */}
                <div
                  className="absolute inset-2 pointer-events-none z-10 rounded-[12px] border border-amber-500/20"
                />
                {/* Dynamic Diagonal Shimmer Sweep on Hover */}
                <div
                  className="absolute inset-0 pointer-events-none z-10 transition-transform duration-1000 ease-out group-hover:translate-x-[150%] -translate-x-[150%]"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* Corner brackets frame overlay */}
                <div className="absolute inset-3.5 pointer-events-none z-20">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#C8922A] opacity-75" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#C8922A] opacity-75" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#C8922A] opacity-75" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#C8922A] opacity-75" />
                </div>
              </div>

              {/* Name & Tier */}
              <h2 className="font-extrabold text-2xl tracking-wide text-gradient-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {profileCard.name}
              </h2>
              <div className="flex justify-center mt-1.5 mb-4">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-extrabold text-xs text-white backdrop-blur-md uppercase tracking-wider glossy-glare transition-all"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.25)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                    boxShadow: isDark
                      ? "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
                  }}
                >
                  <LevelBadge title={profileCard.tier} size={34} showPlate={false} />
                  <span
                    className="font-black"
                    style={{
                      color: isDark ? "#FFD700" : "#7040D0",
                      textShadow: isDark
                        ? "0 1.5px 2.5px rgba(0,0,0,0.8)"
                        : "0 1px 1px rgba(255,255,255,0.85)"
                    }}
                  >
                    {profileCard.tier}
                  </span>
                </span>
              </div>

              {/* Mobile & Desktop Stats Block */}
              <div className="w-full border-t border-border/40 pt-4 mb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border glossy-glare"
                    style={{ borderColor: "#E8A50040", backgroundColor: isDark ? "rgba(232,165,0,0.08)" : "#FFFAED" }}>
                    <TrendingUp size={18} className="text-[#E8A500]" />
                    <p className="font-bold text-base mt-1 text-[#E8A500] text-shine-3d" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>{profileCard.level}</p>
                    <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">LEVEL</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border glossy-glare"
                    style={{ borderColor: "#C8922A40", backgroundColor: isDark ? "rgba(200,146,42,0.08)" : "#FDF6E3" }}>
                    <Trophy size={18} className="text-[#C8922A]" />
                    <p className="font-bold text-base mt-1 text-[#C8922A] text-shine-3d" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>{hofHistory.length}</p>
                    <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">HOF HITS</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border glossy-glare"
                    style={{ borderColor: "#7040D040", backgroundColor: isDark ? "rgba(112,64,208,0.08)" : "#F5F0FD" }}>
                    <Award size={18} className="text-[#7040D0]" />
                    <p className="font-bold text-base mt-1 text-[#7040D0] text-shine-3d" style={{ fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>{unlockedBadges}/{totalBadges}</p>
                    <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">BADGES</p>
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground tracking-wider uppercase text-[9px]">XP PROGRESS</span>
                    <span className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-numeric)" }}>
                      {xpProgress.currentXP.toLocaleString("id-ID")} / {xpProgress.nextXP.toLocaleString("id-ID")} XP
                    </span>
                  </div>
                  <XPBar value={xpProgress.currentXP} max={Math.max(xpProgress.nextXP, 1)} height={8} />
                  <p className="text-[9px] text-muted-foreground text-center pt-1">
                    {xpProgress.percent}% menuju level berikutnya
                  </p>
                </div>
              </div>

              <div className="w-full space-y-2 pt-2 border-t border-border/40">
                <button onClick={() => setShowShareModal(true)} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border border-[#C8922A]/40 text-[#C8922A] bg-[#C8922A]/5 hover:bg-[#C8922A]/10 transition-all uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <Share2 size={13} /> Share Profile
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Featured Badges Relocated Here */}
          <Card className="p-5 shadow-lg border border-border/50">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#E8A500]" />
                <h3 className="font-bold text-[16px] tracking-wide text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  FEATURED BADGES
                </h3>
              </div>
              <button onClick={() => setShowManageBadges(true)}
                className="text-xs font-bold text-[#E8A500] hover:opacity-80 transition-all uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Kelola
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 justify-items-center">
              {featured.length === 0 ? (
                <div className="col-span-3 py-6 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground w-full">
                  <Award size={28} className="mb-1 opacity-45" />
                  <p className="text-[10px]">Belum ada Featured Badge</p>
                </div>
              ) : (
                featured.map((name, i) => {
                  const b = allBadgesData.find((item: any) => item.name === name);
                  if (!b) return null;
                  return (
                    <BadgeShield key={i} rarity={b.rarity} name={b.name} locked={b.locked} size="sm" />
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ==================== HALL OF FAME HISTORY ==================== */}
          <div
            className="relative overflow-hidden rounded-[28px] p-6 sm:p-8"
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

            <div className="relative z-[1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <p
                  className="text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.45em] uppercase font-semibold mb-1.5 m-0"
                  style={{ color: "#87858d", fontFamily: "'Inter', sans-serif" }}
                >
                  Official Selection
                </p>
                <h3
                  className="m-0 font-normal text-[22px] sm:text-[30px] tracking-[0.06em] uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif", color: "#f3f2ee" }}
                >
                  Hall of Fame History
                </h3>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap self-start"
                style={{
                  color: "#f3dca0",
                  border: "1px solid rgba(202,165,76,0.35)",
                  background: "linear-gradient(180deg, rgba(202,165,76,0.10), rgba(202,165,76,0.02))",
                }}
              >
                <Award size={14} className="flex-shrink-0" />
                {hofHistory.length} Awards
              </div>
            </div>

            {/* LAUREL GRID LAYOUT */}
            {hofHistory.length === 0 ? (
              <div className="relative z-[1]">
                <EmptyState
                  icon={Award}
                  title="Belum Ada Prestasi Hall of Fame"
                  description="Selesaikan quest, kumpulkan XP, dan raih pencapaian untuk masuk ke Hall of Fame LOT Property."
                />
              </div>
            ) : (
              <>
                <div className="relative z-[1] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 lg:gap-x-8 justify-items-center">
                  {visibleHof.map((h, i) => (
                    <motion.div
                      key={`${h.cat}-${h.period}-${i}`}
                      className="flex justify-center w-full"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
                    >
                      <HofAwardLaurel category={h.cat} rank={h.rank} period={h.period} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {hofHistory.length > 6 && (
              <>
                <div
                  className="relative z-[1] h-px my-6 sm:my-8"
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
                { l: "Total Commission", v: profileCard.commission, icon: DollarSign, color: "#E8A500" },
                { l: "Total Transactions", v: profileCard.totalTransactions, icon: TrendingUp, color: "#16A34A" },
                { l: "Total Listings", v: profileCard.totalListings, icon: Building2, color: "#1A6FC4" },
                { l: "Total Prospects", v: profileCard.totalProspects, icon: Users, color: "#7B2FBE" },
                { l: "Total Recruits", v: String(profile?.total_recruits || 0), icon: Star, color: "#C8922A" },
                { l: "Training Completed", v: String(profile?.training_completed || 0), icon: BookOpen, color: "#308030" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + "15" }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <EllipsisTooltip
                      text={s.v}
                      className="font-extrabold leading-tight text-[15px] sm:text-[17px] text-foreground whitespace-nowrap truncate block w-full text-left"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    />
                    <EllipsisTooltip
                      text={s.l}
                      className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wide whitespace-nowrap truncate block w-full text-left"
                    />
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

            {/* circular ring + progress bars layout */}
            <div className="flex flex-col md:flex-row items-center justify-between border border-border/30 rounded-2xl p-5 bg-muted/10 gap-6 md:gap-12">

              {/* Progress Circle (Left) */}
              <div className="flex items-center gap-5 justify-center flex-shrink-0">
                <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={isDark ? "#2A2218" : "#E5E0D5"}
                      strokeWidth="6"
                      fill="transparent"
                      className="opacity-40"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#E8A500"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <p className="text-base font-extrabold text-foreground" style={{ fontFamily: "var(--font-numeric)" }}>
                      {unlockedBadges} <span className="text-xs text-muted-foreground">/ {totalBadges}</span>
                    </p>
                    <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">Unlocked</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-3xl text-gradient-gold leading-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {progressPercent}%
                  </h4>
                  <p className="text-xs text-muted-foreground font-bold mt-1 tracking-wide">Collection Progress</p>
                </div>
              </div>

              {/* Divider for desktop */}
              <div className="hidden md:block w-px h-24 bg-border/20 self-center" />

              {/* Rarity breakdown bars (Right) */}
              <div className="flex-1 w-full max-w-sm space-y-2.5">
                {(["mythic", "legendary", "epic", "rare", "common"] as const).map(r => {
                  const c = RARITY_CFG[r];
                  const count = getRarityCount(r);
                  const total = allBadgesData.filter((b: any) => b.rarity === r).length;
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                  const activeColor = isDark ? c.darkColor : c.color;

                  return (
                    <div key={r} className="flex items-center gap-3 w-full">
                      <span className="w-20 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-left" style={{ color: activeColor, fontFamily: "'Rajdhani', sans-serif" }}>
                        {c.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full relative bg-zinc-800/40 dark:bg-zinc-900/60 overflow-hidden border border-zinc-700/10">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, ${activeColor}80, ${activeColor})`,
                            boxShadow: `0 0 6px ${activeColor}30`
                          }} />
                      </div>
                      <span className="w-8 text-[11px] font-bold text-right text-foreground font-mono" style={{ fontFamily: "var(--font-numeric)" }}>
                        {count}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Expandable all badges view */}
            {showAllBadges && (
              <div className="mt-5 pt-5 border-t border-border/30 animate-fade-in">
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-3.5 gap-y-5 sm:gap-4 justify-items-center">
                  {allBadgesData.map((b: any, i: number) => (
                    <BadgeShield key={i} rarity={b.rarity} name={b.name} locked={b.locked} size="md" />
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
                  {allBadgesData.map((b: BadgeItem, i: number) => {
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
                <button onClick={handleSaveFeaturedBadges} disabled={savingFeatured} className="px-6 py-2.5 rounded-xl font-bold bg-[#E8A500] text-white font-display text-sm transition-all hover:bg-[#CC9200] disabled:opacity-60 disabled:cursor-not-allowed">
                  {savingFeatured ? "MENYIMPAN..." : "SIMPAN SHOWCASE"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SHARE PROFILE CARD (MULTI-LANGUAGE ID, EN, CN) ── */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 share-modal-backdrop-wrap" style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeShareModal} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[calc(100dvh-5.5rem)] sm:max-h-[90vh] share-modal-container"
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

              <div className="p-4 sm:p-6 flex flex-col items-center bg-zinc-950/20 flex-1 overflow-y-auto min-h-0 share-modal-body">
                <div id="profile-scorecard-card" className="w-full max-w-[440px] rounded-2xl border relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between share-scorecard-card"
                  style={{
                    background: "linear-gradient(135deg, #2D1A05 0%, #150D02 50%, #050301 100%)",
                    borderColor: "#C8922A60",
                    borderWidth: "1.5px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    aspectRatio: "1.58 / 1"
                  }}>
                  {/* Background overlay glimmers */}
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 z-0"
                    style={{ background: "radial-gradient(circle at 80% 20%, rgba(232, 165, 0, 0.45), transparent 65%), radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.15), transparent 50%)" }} />

                  {/* Corner brackets decoration */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C8922A] opacity-60" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C8922A] opacity-60" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C8922A] opacity-60" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C8922A] opacity-60" />

                  {/* Top Bar inside card */}
                  <div className="flex justify-between items-center z-10 border-b border-white/10 pb-2">
                    <div>
                      <p className="text-[7.5px] font-black tracking-widest text-[#E8A500]" style={{ fontFamily: "var(--font-display)" }}>
                        {L.title}
                      </p>
                    </div>
                    <span className="text-[7.5px] font-black text-zinc-400 tracking-wider">
                      OFFICIAL AGENT
                    </span>
                  </div>

                  {/* Body Content: Split Left/Right */}
                  <div className="flex gap-5 items-center z-10 flex-1 py-3">
                    {/* Left: Stats */}
                    <div className="flex-1 space-y-3.5 text-left">
                      <div>
                        <h4 className="font-extrabold text-[17px] leading-tight text-white tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                          {profileCard.name}
                        </h4>
                        <p className="text-[9px] text-[#C8922A] uppercase font-black mt-0.5 tracking-wider">
                          {profileCard.tier}
                        </p>
                      </div>

                      {/* Main Metric: Total Transactions */}
                      <div>
                        <p className="text-[8px] text-zinc-400 font-bold tracking-wider uppercase">{L.transactions}</p>
                        <h2 className="font-black text-xl text-gradient-gold leading-none mt-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                          {profileCard.totalTransactions} {activeLang === "ID" ? "Transaksi" : activeLang === "CN" ? "笔交易" : "Transactions"}
                        </h2>
                      </div>

                      {/* Smaller stats: horizontal clean layout with vertical dividers */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 mt-2">
                        <div className="flex-1 text-center">
                          <p className="text-[8.5px] font-black text-zinc-400 uppercase tracking-wide">{L.level}</p>
                          <p className="font-black text-[13.5px] text-white leading-none mt-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {profileCard.level}
                          </p>
                        </div>
                        <div className="w-[1px] h-5 bg-white/10" />
                        <div className="flex-1 text-center">
                          <p className="text-[8.5px] font-black text-zinc-400 uppercase tracking-wide">{L.hof}</p>
                          <p className="font-black text-[13.5px] text-white leading-none mt-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {hofHistory.length}
                          </p>
                        </div>
                        <div className="w-[1px] h-5 bg-white/10" />
                        <div className="flex-1 text-center">
                          <p className="text-[8.5px] font-black text-zinc-400 uppercase tracking-wide">{L.badges}</p>
                          <p className="font-black text-[13.5px] text-white leading-none mt-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {unlockedBadges}/{totalBadges}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Picture Card */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-[104px] h-[135px] rounded-xl overflow-hidden border border-[#C8922A] shadow-md bg-zinc-950">
                        <img src={profileCard.photo} alt={profileCard.name} className="w-full h-full object-cover object-top" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>
                      {/* Floating level badge graphic */}
                      <div className="absolute -bottom-2 -right-2 z-20">
                        <LevelBadge title={profileCard.tier} size={36} showPlate={false} customAsset={eliteAgentBase64} />
                      </div>
                    </div>
                  </div>

                  {/* Footer watermark */}
                  <div className="flex justify-between items-center z-10 border-t border-white/10 pt-1 text-[6.5px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                    <span>LOT PROPERTY</span>
                    <span>CERTIFIED DIGITAL SCOREBOARD</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center mt-3 share-modal-desc">{L.desc}</p>

                {/* Share Link Preview Row */}
                <div className="w-full mt-3 p-2.5 rounded-xl border bg-muted/20 text-left share-modal-link-box" style={{ borderColor: T.border }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Share Link</p>
                  <p className="text-[10px] break-all font-mono" style={{ color: "#E8A500" }}>{shareUrl}</p>
                </div>

                {/* SHARE TO SECTION */}
                <div className="w-full mt-4 border-t pt-3 share-modal-social-box" style={{ borderColor: T.border }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 text-center">
                    Share to social media
                  </p>

                  {/* Scrollable list of custom social shares */}
                  <div className="flex gap-4 overflow-x-auto justify-center pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                    {[
                      {
                        name: "Share via",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                        ),
                        bg: "linear-gradient(135deg, #4B5563, #374151)",
                        action: handleShareLink
                      },
                      {
                        name: "Story",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        ),
                        bg: "linear-gradient(135deg, #F9CE34 0%, #EE2A7B 50%, #6228D7 100%)",
                        action: () => handleSocialShare("Instagram Story")
                      },
                      {
                        name: "Post",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        ),
                        bg: "linear-gradient(135deg, #FD1D1D, #E1306C)",
                        action: () => handleSocialShare("Instagram Post")
                      },
                      {
                        name: "Facebook",
                        icon: (
                          <span className="font-extrabold text-lg leading-none font-serif select-none lowercase">f</span>
                        ),
                        bg: "linear-gradient(135deg, #1877F2, #0A53BE)",
                        action: () => handleSocialShare("Facebook")
                      },
                      {
                        name: "Threads",
                        icon: (
                          <span className="font-extrabold text-[15px] leading-none select-none font-sans">@</span>
                        ),
                        bg: "linear-gradient(135deg, #101010, #222222)",
                        action: () => handleSocialShare("Threads")
                      },
                      {
                        name: "Messages",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        ),
                        bg: "linear-gradient(135deg, #25D366, #128C7E)",
                        action: () => handleSocialShare("WhatsApp")
                      }
                    ].map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={ch.action}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                          style={{ background: ch.bg }}
                        >
                          {ch.icon}
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">
                          {ch.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share actions */}
              <div className="px-5 sm:px-6 py-4 border-t bg-card flex-shrink-0 flex gap-3" style={{ borderColor: T.border }}>
                <button
                  onClick={handleDownloadCard}
                  disabled={isDownloading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#E8A500] text-white flex items-center justify-center gap-1.5 transition-all hover:bg-[#CC9200] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Download Card
                    </>
                  )}
                </button>
                <button onClick={closeShareModal}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: T.border, color: T.text3 }}>
                  Cancel
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
