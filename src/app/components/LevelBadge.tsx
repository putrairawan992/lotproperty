<<<<<<< HEAD
import { LEVEL_ASSETS, getLevelTierColor } from "../badgeAssets";
import { useTheme } from "../types";

function levelColor(title: string): string {
  return getLevelTierColor(title);
=======
import { LEVEL_ASSETS, LEVEL_TIERS } from "../badgeAssets";
import { useTheme } from "../types";

function levelColor(title: string): string {
  return LEVEL_TIERS.find((t) => t.title === title)?.color ?? "#E8A500";
>>>>>>> c6e417e229740cd9fe94a5b1167ea713707fbd62
}

export default function LevelBadge({
  title,
  size = 64,
  showPlate = size >= 60,
}: {
  title: string;
  size?: number;
  showPlate?: boolean;
}) {
  const { isDark } = useTheme();
  const asset = LEVEL_ASSETS[title];
  if (!asset) return null;

  const color = levelColor(title);
  // Increase image size slightly for better visibility
  const imgSize = Math.round(size * (showPlate ? 0.90 : 0.98));
  const isCircle = size < 44;
  
  // Calculate relative sizes for shadows and borders to prevent wash-out on small elements
  const shadowBlur = Math.max(3, Math.round(size * 0.12));
  const borderThickness = size < 40 ? 1 : 1.5;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: showPlate ? (isCircle ? "50%" : Math.max(10, Math.round(size * 0.22))) : 0,
        background: showPlate
          ? isDark
            ? `radial-gradient(circle at 50% 30%, ${color}35 0%, rgba(255,255,255,0.06) 60%, rgba(0,0,0,0.2) 100%)`
            : `radial-gradient(circle at 50% 30%, ${color}20 0%, #FFFFFF 65%, #FFFDF5 100%)`
          : "transparent",
        border: showPlate ? `${borderThickness}px solid ${isDark ? `${color}80` : `${color}60`}` : "none",
        boxShadow: showPlate
          ? isDark
            ? `0 0 ${shadowBlur}px ${color}45, 0 1px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 1px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)`
          : "none",
      }}
      title={title}
    >
      <img
        src={asset}
        alt={title}
        width={imgSize}
        height={imgSize}
        decoding="async"
        draggable={false}
        style={{
          width: imgSize,
          height: imgSize,
          objectFit: "contain",
          imageRendering: "auto",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
          // Replaced blurry colored drop shadow with high-contrast shadow for sharp 3D depth
          filter: isDark
            ? "drop-shadow(0 1.5px 3px rgba(0,0,0,0.65)) contrast(1.12) brightness(1.2)"
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.16)) contrast(1.04) brightness(1.02)",
        }}
      />
    </div>
  );
}
