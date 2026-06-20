import { Rarity, T, useTheme } from "../types";
import { RARITY_CFG, BADGE_ASSETS } from "../badgeAssets";

export default function PremiumBadge({ name, rarity, locked = false, size = 96 }: {
  name: string; rarity: Rarity; locked?: boolean; size?: number;
}) {
  const c     = RARITY_CFG[rarity];
  const asset = BADGE_ASSETS[name];
  const { isDark } = useTheme();
  const badgeColor = isDark ? c.darkColor : c.color;
  const badgeBg = isDark ? c.darkBg : c.bg;

  const glow = locked ? "none" : `0 0 24px ${c.glow}, 0 0 48px ${c.glow.replace("0.7","0.3").replace("0.8","0.3").replace("0.65","0.25").replace("0.6","0.2").replace("0.4","0.15")}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center rounded-2xl p-3"
        style={{
          background: locked
            ? T.muted
            : `radial-gradient(ellipse at 50% 30%, ${c.glow.replace("0.7","0.2").replace("0.8","0.2").replace("0.65","0.15").replace("0.6","0.12").replace("0.4","0.08")}, ${badgeBg} 70%)`,
          border: `2px solid ${locked ? T.border : badgeColor + "60"}`,
          boxShadow: glow,
        }}>
        {asset ? (
          <img src={asset} alt={name}
            style={{
              width: size, height: size, objectFit: "contain",
              opacity: locked ? 0.3 : 1,
              filter: locked ? "grayscale(1)" : `drop-shadow(0 0 12px ${c.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.6))`,
            }} />
        ) : (
          <div className="flex items-center justify-center"
            style={{ width: size, height: size, fontSize: size * 0.5, opacity: locked ? 0.3 : 1 }}>
            {locked ? "🔒" : "⭐"}
          </div>
        )}
        {/* Rarity corner tag */}
        <span className="absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md"
          style={{ backgroundColor: badgeColor, color: "white", fontSize: 8, fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.05em" }}>
          {c.label}
        </span>
      </div>
      <p className="font-bold text-center leading-tight"
        style={{ color: locked ? T.text3 : badgeColor, fontFamily: "'Rajdhani',sans-serif", fontSize: 12, maxWidth: size + 24 }}>
        {name}
      </p>
    </div>
  );
}
