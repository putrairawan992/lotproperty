import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import SwipeCarouselZone from "./SwipeCarouselZone";
import { HOF_TABS } from "../appData";
import HofFallingStars from "./HofFallingStars";

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

export function getCategoryTheme(category: string): {
  color: string;
  label: string;
  glowColor: string;
  boxShadow: string;
  hoverBoxShadow: string;
  icon: React.ReactNode;
} {
  const norm = (category || "").toLowerCase();
  if (norm.includes("commission") || norm.includes("com")) {
    return {
      color: "#EF4444", // Red
      label: "COMMISSION MASTER",
      glowColor: "rgba(239, 68, 68, 0.35)",
      boxShadow: "0 0 14px rgba(239, 68, 68, 0.45), 0 0 28px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(239, 68, 68, 0.85), 0 0 56px rgba(239, 68, 68, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    };
  }
  if (norm.includes("unit")) {
    return {
      color: "#F97316", // Orange
      label: "UNIT CHAMPION",
      glowColor: "rgba(249, 115, 22, 0.35)",
      boxShadow: "0 0 14px rgba(249, 115, 22, 0.45), 0 0 28px rgba(249, 115, 22, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(249, 115, 22, 0.85), 0 0 56px rgba(249, 115, 22, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="22" x2="9" y2="16"></line>
          <line x1="15" y1="22" x2="15" y2="16"></line>
          <line x1="9" y1="16" x2="15" y2="16"></line>
          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 4h2v2H8v-2zm6 0h2v2h-2v-2z"></path>
        </svg>
      )
    };
  }
  if (norm.includes("primary")) {
    return {
      color: "#10B981", // Emerald green
      label: "PRIMARY ELITE",
      glowColor: "rgba(16, 185, 129, 0.35)",
      boxShadow: "0 0 14px rgba(16, 185, 129, 0.45), 0 0 28px rgba(16, 185, 129, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(16, 185, 129, 0.85), 0 0 56px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    };
  }
  if (norm.includes("rising")) {
    return {
      color: "#C084FC", // Purple
      label: "RISING STAR",
      glowColor: "rgba(192, 132, 252, 0.35)",
      boxShadow: "0 0 14px rgba(192, 132, 252, 0.45), 0 0 28px rgba(192, 132, 252, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(192, 132, 252, 0.85), 0 0 56px rgba(192, 132, 252, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    };
  }
  if (norm.includes("content")) {
    return {
      color: "#38BDF8", // Blue
      label: "CONTENT CREATOR",
      glowColor: "rgba(56, 189, 248, 0.35)",
      boxShadow: "0 0 14px rgba(56, 189, 248, 0.45), 0 0 28px rgba(56, 189, 248, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(56, 189, 248, 0.85), 0 0 56px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      )
    };
  }
  if (norm.includes("hunter") || norm.includes("listing")) {
    return {
      color: "#F59E0B", // Amber yellow
      label: "LISTING HUNTER",
      glowColor: "rgba(245, 158, 11, 0.35)",
      boxShadow: "0 0 14px rgba(245, 158, 11, 0.45), 0 0 28px rgba(245, 158, 11, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(245, 158, 11, 0.85), 0 0 56px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      )
    };
  }
  if (norm.includes("prospect") || norm.includes("master")) {
    return {
      color: "#FF4081", // Pink
      label: "PROSPECT MASTER",
      glowColor: "rgba(255, 64, 129, 0.35)",
      boxShadow: "0 0 14px rgba(255, 64, 129, 0.45), 0 0 28px rgba(255, 64, 129, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
      hoverBoxShadow: "0 0 28px rgba(255, 64, 129, 0.85), 0 0 56px rgba(255, 64, 129, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    };
  }
  // Default/Recruiter
  return {
    color: "#A78BFA", // Violet
    label: "TOP RECRUITER",
    glowColor: "rgba(167, 139, 250, 0.35)",
    boxShadow: "0 0 14px rgba(167, 139, 250, 0.45), 0 0 28px rgba(167, 139, 250, 0.15), inset 0 1px 1px rgba(255,255,255,0.15)",
    hoverBoxShadow: "0 0 28px rgba(167, 139, 250, 0.85), 0 0 56px rgba(167, 139, 250, 0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
        <path d="M3 20h18"></path>
      </svg>
    )
  };
}

function PortraitCard({
  agent,
  rank,
  isMobile,
  category = "Top 5 Commission",
}: {
  agent: any;
  rank: number;
  isMobile: boolean;
  category?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const w = isMobile ? 200 : rank === 1 ? 190 : rank <= 3 ? 170 : 150;
  const h = Math.round(w * 1.5);
  const isWinner = rank === 1;
  const theme = RANK_THEMES[rank] || RANK_THEMES[5];
  const categoryTheme = getCategoryTheme(category);

  return (
    <motion.div
      className="flex flex-col items-center flex-shrink-0"
      style={{ width: w }}
      whileHover={isMobile ? {} : { y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait card wrapper */}
      <motion.div
        className="relative overflow-hidden w-full animate-fadeIn"
        style={{
          height: h,
          borderRadius: 20,
          border: `1.2px solid ${categoryTheme.color}55`,
          boxShadow: categoryTheme.boxShadow,
          background: "linear-gradient(180deg, #1f1d24 0%, #0f0e12 100%)",
        }}
        whileHover={isMobile ? {} : {
          boxShadow: categoryTheme.hoverBoxShadow,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow behind photo */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60 z-10"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${categoryTheme.glowColor}, transparent 80%)`,
          }}
        />

        {/* Photo with neutral backdrop */}
        <div className="absolute inset-0 w-full h-full bg-[#121115]">
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
              style={{
                filter: "brightness(1.05) contrast(1.02)",
              }}
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

        {/* Category watermark overlay on top of photo (low opacity screen blend) */}
        <div
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.06] transition-transform duration-700"
          style={{
            color: categoryTheme.color,
            mixBlendMode: "screen",
            transform: hovered ? "scale(1.2)" : "scale(1)",
          }}
        >
          <div className="scale-[3.5] filter drop-shadow(0 0 10px currentColor)">
            {categoryTheme.icon}
          </div>
        </div>

        {/* Cinematic Vignette Overlay to merge and matching background */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(circle at 50% 35%, transparent 30%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Metallic inner frame line */}
        <div
          className="absolute inset-2 pointer-events-none z-10 rounded-xl"
          style={{
            border: `1px solid ${rank === 1 ? "rgba(255, 215, 0, 0.25)" : rank === 2 ? "rgba(229, 231, 235, 0.2)" : rank === 3 ? "rgba(251, 146, 60, 0.2)" : "rgba(255, 255, 255, 0.05)"}`,
          }}
        />

        {/* Dynamic Diagonal Shimmer Sweep on Hover */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-transform duration-1000 ease-out"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0) 100%)",
            transform: hovered ? "translateX(120%)" : "translateX(-120%)",
          }}
        />

        {/* Corner brackets frame overlay for Top 3 */}
        {rank <= 3 && (
          <div className="absolute inset-3.5 pointer-events-none z-20">
            {/* Top-Left */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l" style={{ borderColor: theme.borderColor, opacity: 0.75 }} />
            {/* Top-Right */}
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r" style={{ borderColor: theme.borderColor, opacity: 0.75 }} />
            {/* Bottom-Left */}
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l" style={{ borderColor: theme.borderColor, opacity: 0.75 }} />
            {/* Bottom-Right */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r" style={{ borderColor: theme.borderColor, opacity: 0.75 }} />
          </div>
        )}

        {/* Floating Congratulations text overlay on hover */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center justify-center transition-all duration-500 ease-out px-2"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(-50%) scale(1)" : "translateY(-40%) scale(0.85)",
          }}
        >
          <p
            className="text-[9px] tracking-[0.24em] font-black uppercase text-center text-white/50 mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            CONGRATULATIONS
          </p>
          <p
            className="text-[14px] tracking-[0.12em] font-bold uppercase text-center leading-tight"
            style={{
              fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
              color: categoryTheme.color,
              textShadow: `0 0 12px ${categoryTheme.color}a0, 0 1px 4px rgba(0,0,0,0.8)`,
            }}
          >
            {categoryTheme.label}
          </p>
        </div>

        {/* Bottom subtle gradient shadow overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent pointer-events-none z-10" />

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

        {/* Category emblem stamp at bottom-right */}
        <div
          className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 pointer-events-none"
          style={{
            borderColor: `${categoryTheme.color}40`,
            background: `radial-gradient(circle, ${categoryTheme.color}25 0%, rgba(10,8,12,0.92) 100%)`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
            color: categoryTheme.color,
          }}
        >
          {categoryTheme.icon}
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
        {category === "Top 5 Commission" ? agent.level : agent.value}
      </p>
    </motion.div>
  );
}

function EmptyPodiumState({ category, color }: { category: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto animate-fadeIn">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border"
        style={{ 
          borderColor: `${color}40`, 
          background: `radial-gradient(circle, ${color}15 0%, rgba(10,8,12,0.9) 100%)`,
          boxShadow: `0 0 15px ${color}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
          color: color
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
          <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path>
        </svg>
      </div>
      <h3 
        className="font-bold text-lg mb-2 uppercase tracking-wider"
        style={{ 
          fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
          color: "#fff8e7",
          textShadow: `0 0 10px ${color}60`
        }}
      >
        Be The First Champion
      </h3>
      <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
        Belum ada agen yang menempati peringkat **{category}** bulan ini. Jadilah yang pertama dengan melakukan aktivitas agen sekarang!
      </p>
    </div>
  );
}

/** All 5 agents in a single podium row layout (Desktop: [Rank 5, Rank 3, Rank 1, Rank 2, Rank 4]) or auto-sliding slideshow (Mobile) */
function PortraitPodium({ agents, isMobile, category }: { agents: any[]; isMobile: boolean; category: string }) {
  const lineup = agents.slice(0, 5); // Slice up to 5 slots
  const categoryTheme = getCategoryTheme(category);

  if (lineup.length === 0) {
    return <EmptyPodiumState category={category} color={categoryTheme.color} />;
  }

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
              <PortraitCard agent={activeAgent} rank={activeAgent.rank} isMobile={true} category={category} />
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
    <div className="flex items-end justify-center gap-4 px-2 pt-3 pb-2 w-full">
      {orderedLineup.map((agent) => (
        <PortraitCard key={agent.rank} agent={agent} rank={agent.rank} isMobile={false} category={category} />
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
  const catTheme = getCategoryTheme(hofCat);

  return (
    <div
      className="relative overflow-hidden rounded-[30px]"
      style={{
        background: "linear-gradient(180deg, #090303 0%, #150505 35%, #0d0404 70%, #000000 100%)",
        border: `1px solid ${catTheme.color}25`,
        boxShadow: `0 30px 90px rgba(0,0,0,0.65), inset 0 1px 0 ${catTheme.color}15`,
      }}
    >
      {/* 3D Ember Sparks Rising Background (Three.js canvas) */}
      <HofFallingStars isDark={true} mode="embers" color={catTheme.color} />

      {/* Cinematic Crystal Shards Background Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Category dynamic radial ambient glow at top */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] rounded-full filter blur-[80px] opacity-[0.24]"
          style={{ background: `radial-gradient(circle, ${catTheme.color} 0%, transparent 70%)` }}
        />
        
        {/* Geometric shard shapes SVG for cracked glass look */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.08]" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="shardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff3333" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon points="0,0 220,0 130,220" fill="url(#shardGrad)" />
          <polygon points="190,0 410,0 320,290" fill="url(#shardGrad)" />
          <polygon points="380,0 580,0 500,340" fill="url(#shardGrad)" />
          <polygon points="530,0 750,0 640,310" fill="url(#shardGrad)" />
          <polygon points="700,0 900,0 810,230" fill="url(#shardGrad)" />
          <polygon points="870,0 1000,0 960,180" fill="url(#shardGrad)" />
          
          <polygon points="90,0 270,0 190,120" fill="url(#shardGrad)" />
          <polygon points="450,0 650,0 530,200" fill="url(#shardGrad)" />
          <polygon points="780,0 940,0 860,130" fill="url(#shardGrad)" />
        </svg>

        {/* Ambient shadow gradient */}
        <div 
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)" }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
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

              <PortraitPodium agents={hofAgents} isMobile={isMobile} category={hofCat} />
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
