import { motion } from "motion/react";
import { BADGE_ASSETS, RARITY_CFG } from "../badgeAssets";
import type { Rarity } from "../types";

export function hofBadgeSize(isMobile: boolean, isFirst: boolean): number {
  if (isMobile) return isFirst ? 44 : 36;
  return isFirst ? 60 : 50;
}

export default function HofBadgeCoin({
  rarity,
  badgeName,
  size,
  isDark,
  delay = 0,
  index = 0,
}: {
  rarity: string;
  badgeName: string;
  size: number;
  isDark: boolean;
  delay?: number;
  index?: number;
}) {
  const asset = BADGE_ASSETS[badgeName];
  if (!asset) return null;

  const c = RARITY_CFG[rarity as Rarity] || RARITY_CFG.common;
  const ring = Math.max(1.5, size * 0.04);
  const imgSize = Math.round(size * 0.94);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: delay + index * 0.06, type: "spring", stiffness: 300 }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: isDark
          ? "linear-gradient(145deg, rgba(42,36,28,0.95) 0%, rgba(18,14,10,0.98) 100%)"
          : "linear-gradient(145deg, #FFFCF5 0%, #FFF6E0 100%)",
        border: `${ring}px solid ${isDark ? "rgba(232, 165, 0, 0.85)" : "rgba(200, 146, 42, 0.9)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isDark
          ? `0 2px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`,
        flexShrink: 0,
      }}
      className="relative transition-transform duration-200 hover:scale-110 cursor-pointer overflow-hidden glossy-glare"
      title={badgeName}
    >
      <img
        src={asset}
        alt={badgeName}
        width={imgSize}
        height={imgSize}
        decoding="sync"
        loading="eager"
        draggable={false}
        style={{
          width: imgSize,
          height: imgSize,
          objectFit: "contain",
          objectPosition: "center",
          imageRendering: "auto",
          filter: "contrast(1.06) saturate(1.12)",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />
      {/* Ring accent — tanpa blur agar tidak terlihat kabur */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `1px solid ${c.glow}`,
          opacity: isDark ? 0.35 : 0.25,
        }}
        aria-hidden
      />
    </motion.div>
  );
}
