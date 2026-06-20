import { Rarity, T, useTheme } from "../types";
import { RARITY_CFG, BADGE_ASSETS } from "../badgeAssets";

export default function BadgeShield({ rarity, name, locked = false, size = "md" }: {
  rarity: Rarity; name: string; locked?: boolean; size?: "sm" | "md" | "lg";
}) {
  const c     = RARITY_CFG[rarity];
  const asset = BADGE_ASSETS[name];
  const { isDark } = useTheme();

  const cfg = {
    sm:  { artH: 38,  cardW: 72,  nameSz: 8,  showRarity: false, pad: "p-1.5" },
    md:  { artH: 64,  cardW: 96,  nameSz: 11, showRarity: true,  pad: "p-2.5" },
    lg:  { artH: 80,  cardW: 112, nameSz: 13, showRarity: true,  pad: "p-3"   },
  }[size];

  const badgeBg = isDark ? c.darkBg : c.bg;
  const badgeColor = isDark ? c.darkColor : c.color;

  const sharedCard = {
    backgroundColor: badgeBg,
    borderColor: `${badgeColor}35`,
    minWidth: cfg.cardW,
    maxWidth: cfg.cardW,
    borderRadius: 14,
  };

  const rarityGlow = locked
    ? "grayscale(1)"
    : `drop-shadow(0 0 ${rarity === "mythic" ? "10px" : rarity === "legendary" ? "8px" : rarity === "epic" ? "7px" : rarity === "rare" ? "6px" : "3px"} ${c.glow}) drop-shadow(0 2px 5px rgba(0,0,0,0.5))`;

  if (asset) {
    return (
      <div className={`relative flex flex-col items-center gap-1 border overflow-hidden ${cfg.pad}`}
        style={sharedCard}>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)", borderRadius: 14 }}>
            <span style={{ fontSize: size === "sm" ? 16 : 24 }}>🔒</span>
          </div>
        )}
        <img src={asset} alt={name}
          style={{
            height: cfg.artH,
            width: cfg.artH,
            objectFit: "contain",
            opacity: locked ? 0.35 : 1,
            filter: rarityGlow,
          }} />
        {cfg.nameSz > 0 && (
          <span className="text-center font-bold leading-tight w-full"
            style={{
              color: badgeColor,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: cfg.nameSz,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: size === "sm" ? 2 : 3,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}>
            {name}
          </span>
        )}
        {cfg.showRarity && (
          <span className="uppercase tracking-wider"
            style={{ color: T.text3, fontSize: 9 }}>{c.label}</span>
        )}
      </div>
    );
  }

  const BADGE_ICONS: Record<string, string> = {
    "Billionaire Club":    "💎", "Perfectionist Agent": "🎯",
    "Listing Factory":     "🏭", "The Consultant":      "🔭",
    "The Leader":          "👑", "The Professor":       "🎓",
    "Deal Maker":          "🤝", "500M Club":           "💰",
    "100M Club":           "💎", "The Influencer":      "📣",
    "Exceptional Agent":   "⚡",
  };
  const icon = locked ? "🔒" : (BADGE_ICONS[name] || "⭐");
  const darkBg   = rarity === "mythic" ? "#1A0008" : rarity === "legendary" ? "#1A1000"
                 : rarity === "epic"   ? "#0F0A20" : rarity === "rare"       ? "#080F20"
                 : "#101010";
  const svgDim = size === "sm" ? 38 : size === "lg" ? 64 : 52;

  const isHex = rarity === "epic" || rarity === "rare";
  const outerPath = isHex
    ? "M30,2 L56,16 L56,44 L30,58 L4,44 L4,16 Z"
    : "M30,2 L54,11 L54,39 C54,53 30,67 30,67 C30,67 6,53 6,39 L6,11 Z";
  const innerPath = isHex
    ? "M30,11 L48,21 L48,39 L30,49 L12,39 L12,21 Z"
    : "M30,13 L46,20 L46,38 C46,49 30,59 30,59 C30,59 14,49 14,38 L14,20 Z";

  return (
    <div className={`relative flex flex-col items-center gap-1 border overflow-hidden ${cfg.pad}`}
      style={{ ...sharedCard, opacity: locked ? 0.42 : 1 }}>
      <svg width={svgDim} height={Math.round(svgDim * 1.18)} viewBox="0 0 60 72" fill="none">
        <path d={outerPath} fill={darkBg} />
        <path d={outerPath} fill="none" stroke={badgeColor} strokeWidth="3" opacity="0.9" />
        <path d={innerPath} fill={badgeColor} fillOpacity="0.12" stroke={badgeColor} strokeWidth="1.5" opacity="0.6" />
        <path d={outerPath} fill="url(#sheen)" fillOpacity="0.06" />
        <defs>
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <text x="30" y="41" textAnchor="middle" fontSize="20" fill={badgeColor} fontFamily="Arial">{icon}</text>
      </svg>
      {cfg.nameSz > 0 && (
        <span className="text-center leading-tight font-bold w-full"
          style={{
            color: badgeColor,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: cfg.nameSz,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: size === "sm" ? 2 : 3,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}>
          {name}
        </span>
      )}
      {cfg.showRarity && (
        <span className="uppercase tracking-wider"
          style={{ color: T.text3, fontSize: 9 }}>{c.label}</span>
      )}
    </div>
  );
}
