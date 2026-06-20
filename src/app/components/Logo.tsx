import { useTheme } from "../types";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

/** Light: PHOTO (teks PROPERTY gelap). Dark: logo putih. */
export default function Logo({ compact = false }: { compact?: boolean }) {
  const { isDark } = useTheme();
  const logoSrc = isDark ? lotLogoWhiteImg : lotLogoImg;
  const height = compact ? 28 : 32;

  return (
    <div style={{ height }} className="flex items-center">
      <ImageWithFallback
        key={logoSrc}
        src={logoSrc}
        alt="LOT Property"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
