import React, { createContext, useContext } from "react";

// ─── Theme Context ─────────────────────────────────────────────
export const ThemeCtx = createContext({ isDark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

// CSS-variable token shortcuts — these respond to .dark class automatically
export const T = {
  bg:     "var(--background)",
  card:   "var(--card)",
  cardFg: "var(--card-foreground)",
  border: "var(--border)",
  borderGold: "var(--border-gold)",
  text1:  "var(--foreground)",
  text2:  "var(--text-secondary)",
  text3:  "var(--muted-foreground)",
  muted:  "var(--muted)",
  input:  "var(--input-background)",
  sidebar:"var(--sidebar)",
  sidebarFg: "var(--sidebar-foreground)",
  sidebarBorder: "var(--sidebar-border)",
  surface2: "var(--bg-surface-2)",
  podiumArea: "var(--bg-podium-area)",
} as const;

export type Page = "home" | "quest" | "listing" | "prospect" | "academy" | "leaderboard" | "profile" | "notifications" | "event" | "attendance" | "help" | "board";

export type Rarity = "mythic" | "legendary" | "epic" | "rare" | "common";

export type AdminPage = "dashboard" | "agents" | "commission" | "hof" | "academy" | "events" | "xp" | "log";

export const ADMIN_ROLES = ["Super Admin", "Office Manager", "Finance"] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

export const ROLE_COLOR: Record<AdminRole, { bg: string; color: string }> = {
  "Super Admin":    { bg: "#FEF2F1", color: "#C0392B" },
  "Office Manager": { bg: "#EEF5FC", color: "#1A6FC4" },
  "Finance":        { bg: "#F0FDF4", color: "#16A34A" },
};

export type LBAgent = {
  rank: number;
  name: string;
  xp: string;
  avatarBg: string;
  initials: string;
  badges: string[];
  photo?: string;
};
