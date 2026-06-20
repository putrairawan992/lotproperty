import { LEVEL_ASSETS } from "../badgeAssets";

export default function LevelBadge({ title, size = 64 }: { title: string; size?: number }) {
  const asset = LEVEL_ASSETS[title];
  if (!asset) return null;
  return (
    <img src={asset} alt={title}
      style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }} />
  );
}
