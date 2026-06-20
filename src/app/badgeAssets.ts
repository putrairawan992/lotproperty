import lotLogoLightImg from "@/imports/PHOTO-2021-03-09-22-22-41.png";
import lotLogoDarkImg from "@/imports/LOT_PROPERTY_logo_white_text.png";

// Backward-compatible aliases
const lotLogoImg = lotLogoLightImg;
const lotLogoWhiteImg = lotLogoDarkImg;

// MYTHIC
import badge01 from "@/imports/01-billionaire-club.png";
import badge02 from "@/imports/02-perfectionist-agent.png";

// LEGENDARY
import badge03 from "@/imports/03-listing-factory.png";
import badge04 from "@/imports/04-the-consultant.png";
import badge05 from "@/imports/05-the-leader.png";
import badge06 from "@/imports/06-the-professor.png";
import badge07 from "@/imports/07-deal-maker.png";
import badge08 from "@/imports/08-500-million-club.png";
import badge09 from "@/imports/09-100-million-club.png";
import badge10 from "@/imports/10-the-influencer.png";
import badge11 from "@/imports/11-exceptional-agent.png";

// EPIC
import badge12 from "@/imports/12-listing-distributor.png";
import badge13 from "@/imports/13-prospect-tycoon.png";
import badge14 from "@/imports/14-team-builder.png";
import badge15 from "@/imports/15-content-creator.png";
import badge16 from "@/imports/16-dedicated-agent.png";
import badge17 from "@/imports/17-certified-agent.png";

// RARE
import badge18 from "@/imports/18-listing-supplier.png";
import badge19 from "@/imports/19-prospect-hunter.png";
import badge20 from "@/imports/20-talent-scout.png";
import badge21 from "@/imports/21-the-loyalist.png";

// COMMON
import badge22 from "@/imports/22-first-listing.png";
import badge23 from "@/imports/23-first-prospect.png";
import badge24 from "@/imports/24-first-recruit.png";
import badge25 from "@/imports/25-first-deal.png";

// Level medallion assets
import pngRookie   from "@/imports/rookie-agent.png";
import pngJunior   from "@/imports/junior-agent.png";
import pngSenior   from "@/imports/senior-agent.png";
import pngElite      from "@/imports/elite-agent.png";
import pngSuperElite from "@/imports/super-elite-agent.png";
import pngLegendary  from "@/imports/lot-legendary.png";

// XP cards
import xpLogin from "@/imports/xp_login_harian.svg";
import xpListing from "@/imports/xp_listing_property.svg";
import xpKonten from "@/imports/xp_konten_berkualitas.svg";
import xpProspect from "@/imports/xp_prospect_berkualitas.svg";
import xpRekrut from "@/imports/xp_rekrut_agent.svg";
import xpUnit from "@/imports/xp_unit_tersewa_terjual.svg";

export { lotLogoImg, lotLogoWhiteImg, lotLogoLightImg, lotLogoDarkImg };

export const BADGE_ASSETS: Record<string, string> = {
  "Billionaire Club":    badge01,
  "Perfectionist Agent": badge02,
  "Listing Factory":     badge03,
  "The Consultant":      badge04,
  "The Leader":          badge05,
  "The Professor":       badge06,
  "Deal Maker":          badge07,
  "500 Million Club":    badge08,
  "500M Club":           badge08,
  "100 Million Club":    badge09,
  "100M Club":           badge09,
  "The Influencer":      badge10,
  "Exceptional Agent":   badge11,
  "Listing Distributor": badge12,
  "Prospect Tycoon":     badge13,
  "Team Builder":        badge14,
  "Content Creator":     badge15,
  "Dedicated Agent":     badge16,
  "Certified Agent":     badge17,
  "Listing Supplier":    badge18,
  "Prospect Hunter":     badge19,
  "Talent Scout":        badge20,
  "The Loyalist":        badge21,
  "First Listing":       badge22,
  "First Prospect":      badge23,
  "First Recruit":       badge24,
  "First Deal":          badge25,
};

export const LEVEL_ASSETS: Record<string, string> = {
  "Rookie Agent":      pngRookie,
  "Junior Agent":      pngJunior,
  "Senior Agent":      pngSenior,
  "Elite Agent":       pngElite,
  "Super Elite":       pngSuperElite,
  "Super Elite Agent": pngSuperElite,
  "LOT Legendary":     pngLegendary,
};

export const LEVEL_TIERS = [
  { title: "Rookie Agent",  range: "1–19",  xp: "0",          color: "#9CA3AF", asset: pngRookie },
  { title: "Junior Agent",  range: "20–39", xp: "50.000",     color: "#2070C0", asset: pngJunior },
  { title: "Senior Agent",  range: "40–59", xp: "200.000",    color: "#C8922A", asset: pngSenior },
  { title: "Elite Agent",   range: "60–79", xp: "800.000",    color: "#7040D0", asset: pngElite },
  { title: "Super Elite Agent", range: "80–98", xp: "2.000.000",  color: "#E8A500", asset: pngSuperElite },
  { title: "LOT Legendary", range: "99",    xp: "5.000.000+", color: "#C0392B", asset: pngLegendary },
] as const;

export function getLevelTierColor(title: string): string {
  return LEVEL_TIERS.find((t) => t.title === title)?.color ?? "#E8A500";
}

export const XP_CARDS = [
  { label: "Login Harian",          xp: "+100 XP",  asset: xpLogin,   color: "#C07000" },
  { label: "Listing Property",      xp: "+100 XP",  asset: xpListing, color: "#C07000" },
  { label: "Konten Berkualitas",    xp: "+300 XP",  asset: xpKonten,  color: "#C07000" },
  { label: "Prospect Berkualitas",  xp: "+100 XP",  asset: xpProspect,color: "#C07000" },
  { label: "Rekrut Agent",          xp: "+200 XP",  asset: xpRekrut,  color: "#C07000" },
  { label: "Unit Tersewa/Terjual",  xp: "+300 XP",  asset: xpUnit,    color: "#C07000" },
] as const;

export const RARITY_CFG = {
  mythic:    { color: "#C0392B", darkColor: "#E74C3C", bg: "#FDEEEC", darkBg: "rgba(231,76,60,0.12)", label: "MYTHIC",    glow: "rgba(231,76,60,0.7)",   radialGradient: "radial-gradient(circle, #FF6B5B 0%, #8B0000 100%)" },
  legendary: { color: "#C8922A", darkColor: "#FFD700", bg: "#FDF6E3", darkBg: "rgba(255,215,0,0.10)", label: "LEGENDARY", glow: "rgba(255,215,0,0.8)",   radialGradient: "radial-gradient(circle, #FFE066 0%, #B8860B 100%)" },
  epic:      { color: "#7B2FBE", darkColor: "#A855F7", bg: "#F3EAFD", darkBg: "rgba(168,85,247,0.12)", label: "EPIC",      glow: "rgba(168,85,247,0.65)", radialGradient: "radial-gradient(circle, #C99EFF 0%, #4A1580 100%)" },
  rare:      { color: "#1A6FC4", darkColor: "#3B82F6", bg: "#E6F1FB", darkBg: "rgba(59,130,246,0.12)", label: "RARE",      glow: "rgba(59,130,246,0.6)",  radialGradient: "radial-gradient(circle, #93C5FD 0%, #0C3460 100%)" },
  common:    { color: "#6B7280", darkColor: "#9CA3AF", bg: "#F3F4F6", darkBg: "rgba(156,163,175,0.10)", label: "COMMON",    glow: "rgba(107,114,128,0.4)", radialGradient: "radial-gradient(circle, #D1D5DB 0%, #374151 100%)" },
};
