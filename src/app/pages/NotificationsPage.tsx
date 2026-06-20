import React from "react";
import { Award, Target, AlertCircle, Trophy, DollarSign, Pin } from "lucide-react";
import { NotificationsPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { useTabQuery } from "../routes";
import { T, Rarity, useTheme } from "../types";
import { BADGE_ASSETS, RARITY_CFG } from "../badgeAssets";
import { ALL_BADGES } from "./ProfilePage";

export default function NotificationsPage() {
  const loading = useLoading(900);
  const { isDark } = useTheme();
  const [tab, setTab] = useTabQuery("tab", "All");

  if (loading) return <NotificationsPageSkeleton />;

  // Filtered out ordinary quest completion notifications.
  // Pinned Listing and Prospect reminders with "pinned: true".
  const notifs = [
    { 
      type: "achievement", 
      title: "Badge Unlocked: Dedicated Agent", 
      body: "Selamat! Kamu berhasil menyelesaikan Daily Quest 7 hari berturut-turut.", 
      time: "2 jam lalu", 
      unread: true 
    },
    { 
      type: "system",      
      title: "Listing Hampir Kadaluarsa", 
      body: "The Spring Studio akan kadaluarsa dalam 14 hari. Perbarui sekarang.", 
      time: "5 jam lalu", 
      unread: true, 
      pinned: true 
    },
    { 
      type: "leaderboard", 
      title: "Kamu Naik ke Ranking #7!", 
      body: "Ahmad Fadhil sekarang di posisi #7 Weekly Leaderboard. Terus semangat!", 
      time: "1 hari lalu", 
      unread: false 
    },
    { 
      type: "commission",  
      title: "Commission Claim Disetujui", 
      body: "Komisi Rumah 3BR Bintaro disetujui. +7.500 XP ditambahkan.", 
      time: "2 hari lalu", 
      unread: false 
    },
    { 
      type: "achievement", 
      title: "Level Up! Level 12 — Senior Agent", 
      body: "Selamat! Kamu mencapai Level 12. Lanjutkan perjalananmu menuju Elite!", 
      time: "3 hari lalu", 
      unread: false 
    },
    { 
      type: "system",      
      title: "Prospect Reminder", 
      body: "Follow Up Budi Hartono dijadwalkan hari ini. Jangan lupa!", 
      time: "3 hari lalu", 
      unread: false, 
      pinned: true 
    },
  ];

  const TYPE_CFG: Record<string, { icon: React.ReactNode; bg: string; color: string; label: string }> = {
    achievement: { icon: <Award size={16} />,        bg: isDark ? "rgba(200,146,42,0.12)" : "#FDF6E3", color: "#C8922A", label: "Achievement" },
    system:      { icon: <AlertCircle size={16} />,  bg: isDark ? "rgba(220,38,38,0.12)" : "#FEE2E2", color: "#DC2626", label: "System" },
    leaderboard: { icon: <Trophy size={16} />,       bg: isDark ? "rgba(112,64,208,0.12)" : "#F5F0FD", color: "#7B2FBE", label: "Leaderboard" },
    commission:  { icon: <DollarSign size={16} />,   bg: isDark ? "rgba(22,163,74,0.12)" : "#DCFCE7", color: "#16A34A", label: "Commission" },
  };

  const tabs = ["All", "Achievement", "System", "Leaderboard", "Commission"];

  // Sort notifications to put pinned ones at the top of the feed permanently
  const sortedNotifs = [...notifs].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const shown = tab === "All" ? sortedNotifs : sortedNotifs.filter(n => TYPE_CFG[n.type]?.label === tab);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-bold animate-fade-in" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: T.text1 }}>Notifications</h1>
          <button className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: "#E8A500" }}>Tandai Semua Dibaca</button>
        </div>

        <div className="flex overflow-x-auto border-b mb-5 gap-0" style={{ borderColor: T.border }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all hover:text-[#E8A500]"
              style={{ 
                color: tab === t ? "#E8A500" : "var(--muted-foreground)", 
                borderBottom: tab === t ? "2px solid #E8A500" : "2px solid transparent",
                fontWeight: tab === t ? 600 : 500
              }}>
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {shown.map((n, i) => {
            const tc = TYPE_CFG[n.type];
            if (!tc) return null;

            const badgeName = n.type === "achievement" && n.title.includes("Badge Unlocked:")
              ? n.title.replace("Badge Unlocked: ", "")
              : null;
            const badgeAsset = badgeName ? BADGE_ASSETS[badgeName] : null;
            const badgeRarity = badgeName
              ? (ALL_BADGES.find(b => b.name === badgeName)?.rarity || "epic")
              : "epic";

            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
                style={{ 
                  borderColor: n.pinned 
                    ? "rgba(232, 165, 0, 0.45)" 
                    : (n.unread ? `${tc.color}35` : T.border), 
                  backgroundColor: n.pinned 
                    ? (isDark ? "rgba(232, 165, 0, 0.04)" : "#FFFDF9") 
                    : T.card,
                  borderLeft: n.pinned ? "4px solid #E8A500" : undefined,
                  boxShadow: n.pinned ? "0 2px 8px rgba(232, 165, 0, 0.05)" : "none"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = n.pinned 
                    ? (isDark ? "rgba(232, 165, 0, 0.08)" : "#FFF9EC") 
                    : T.muted;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = n.pinned 
                    ? (isDark ? "rgba(232, 165, 0, 0.04)" : "#FFFDF9") 
                    : T.card;
                  e.currentTarget.style.transform = "none";
                }}>
                
                {/* Pinned Icon Indicator */}
                {n.pinned && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-extrabold uppercase text-[#E8A500] tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <Pin size={10} className="fill-current rotate-45" /> Pinned Reminder
                  </div>
                )}

                {badgeAsset ? (
                  <img src={badgeAsset} alt={badgeName || ""} style={{
                    width: 48, height: 48, objectFit: "contain", flexShrink: 0,
                    filter: `drop-shadow(0 0 6px ${RARITY_CFG[badgeRarity as Rarity].glow})`,
                  }} />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tc.bg, color: tc.color }}>{tc.icon}</div>
                )}
                
                <div className="flex-1 min-w-0 pr-20">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-sm leading-snug" style={{ color: T.text1 }}>{n.title}</p>
                    {n.unread && !n.pinned && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "#E8A500" }} />}
                  </div>
                  <p className="text-xs mb-1.5 leading-relaxed" style={{ color: T.text2 }}>{n.body}</p>
                  <p className="text-[10px]" style={{ color: T.text3 }}>{n.time}</p>
                </div>
              </div>
            );
          })}

          {shown.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Tidak ada notifikasi dalam kategori ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
