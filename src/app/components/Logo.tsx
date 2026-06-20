import { useTheme } from "../types";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export default function Logo({ compact = false }: { compact?: boolean }) {
  const { isDark } = useTheme();
  const logoSrc = isDark ? lotLogoWhiteImg : lotLogoImg;
  if (compact) {
    return (
      <div style={{ height: 32 }} className="flex items-center">
        <ImageWithFallback src={logoSrc} alt="LOT Property" className="h-full w-auto object-contain" />
      </div>
    );
  }
  return (
    <div style={{ height: 32 }} className="flex items-center">
      <ImageWithFallback src={logoSrc} alt="LOT Property" className="h-full w-auto object-contain" />
    </div>
  );
}
