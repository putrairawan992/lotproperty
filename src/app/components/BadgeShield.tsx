import { Rarity, T, useTheme } from "../types";
import { RARITY_CFG, BADGE_ASSETS } from "../badgeAssets";

export default function BadgeShield({ rarity, name, locked = false, size = "md" }: {
  rarity: Rarity; name: string; locked?: boolean; size?: "sm" | "md" | "lg";
}) {
  const c     = RARITY_CFG[rarity];
  const asset = BADGE_ASSETS[name];
  const { isDark } = useTheme();

  const cfg = {
    sm:  { artH: 54,  cardW: 84,  nameSz: 9,  showRarity: false, pad: "p-1"   },
    md:  { artH: 76,  cardW: 104,  nameSz: 11, showRarity: true,  pad: "p-1.5" },
    lg:  { artH: 96,  cardW: 120, nameSz: 13, showRarity: true,  pad: "p-2"   },
  }[size];

  const badgeColor = isDark ? c.darkColor : c.color;

  const sharedCard = {
    backgroundColor: "transparent",
    minWidth: cfg.cardW,
    maxWidth: cfg.cardW,
  };

  const rarityGlow = locked
    ? "grayscale(1) opacity(0.4)"
    : `drop-shadow(0 0 ${rarity === "mythic" ? "12px" : rarity === "legendary" ? "10px" : rarity === "epic" ? "8px" : rarity === "rare" ? "7px" : "4px"} ${c.glow}) drop-shadow(0 4px 6px rgba(0,0,0,0.5))`;

  if (asset) {
    return (
      <div className={`relative flex flex-col items-center gap-1.5 overflow-hidden transition-all hover:scale-105 ${cfg.pad}`}
        style={sharedCard}>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10"
              style={{ backgroundColor: isDark ? "rgba(10,10,12,0.85)" : "rgba(255,255,255,0.85)" }}>
              <span className="text-[12px]">🔒</span>
            </div>
          </div>
        )}
        <img src={asset} alt={name}
          style={{
            height: cfg.artH,
            width: cfg.artH,
            objectFit: "contain",
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
          <span className="uppercase tracking-wider font-extrabold text-[8px]"
            style={{ color: T.text3 }}>{c.label}</span>
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
  const svgDim = size === "sm" ? 54 : size === "lg" ? 96 : 76;

  const isHex = rarity === "epic" || rarity === "rare";
  const outerPath = isHex
    ? "M30,2 L56,16 L56,44 L30,58 L4,44 L4,16 Z"
    : "M30,2 L54,11 L54,39 C54,53 30,67 30,67 C30,67 6,53 6,39 L6,11 Z";
  const innerPath = isHex
    ? "M30,11 L48,21 L48,39 L30,49 L12,39 L12,21 Z"
    : "M30,13 L46,20 L46,38 C46,49 30,59 30,59 C30,59 14,49 14,38 L14,20 Z";

  return (
    <div className={`relative flex flex-col items-center gap-1.5 overflow-hidden transition-all hover:scale-105 ${cfg.pad}`}
      style={sharedCard}>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10"
            style={{ backgroundColor: isDark ? "rgba(10,10,12,0.85)" : "rgba(255,255,255,0.85)" }}>
            <span className="text-[12px]">🔒</span>
          </div>
        </div>
      )}
      <svg width={svgDim} height={Math.round(svgDim * 1.18)} viewBox="0 0 60 72" fill="none" style={{ filter: locked ? "grayscale(1) opacity(0.4)" : "none" }}>
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
        <span className="uppercase tracking-wider font-extrabold text-[8px]"
          style={{ color: T.text3 }}>{c.label}</span>
      )}
    </div>
  );
}

