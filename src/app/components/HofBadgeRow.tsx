import HofBadgeCoin, { hofBadgeSize } from "./HofBadgeCoin";

export function computeHofBadgeLayout(
  isMobile: boolean,
  isFirst: boolean,
  count: number,
): { size: number; overlap: number } {
  let size = hofBadgeSize(isMobile, isFirst);
  if (count >= 3) size = Math.round(size * (isMobile ? 0.68 : 0.78));
  else if (count >= 2) size = Math.round(size * (isMobile ? 0.82 : 0.9));
  const overlap = count > 1 ? Math.round(size * 0.3) : 0;
  return { size, overlap };
}

export default function HofBadgeRow({
  badges,
  isMobile,
  isFirst,
  isDark,
  delay = 0,
}: {
  badges: [string, string][];
  isMobile: boolean;
  isFirst: boolean;
  isDark: boolean;
  delay?: number;
}) {
  if (!badges.length) return null;

  const { size, overlap } = computeHofBadgeLayout(isMobile, isFirst, badges.length);

  return (
    <div
      className="flex items-center justify-center w-full mt-3 overflow-hidden px-0.5"
      style={{ minHeight: size + 6, maxWidth: "100%" }}
    >
      {badges.map((b, ci) => (
        <div
          key={`${b[1]}-${ci}`}
          style={{
            marginLeft: ci > 0 ? -overlap : 0,
            zIndex: ci + 1,
            position: "relative",
          }}
        >
          <HofBadgeCoin
            rarity={b[0]}
            badgeName={b[1]}
            size={size}
            isDark={isDark}
            delay={delay + 0.3}
            index={ci}
          />
        </div>
      ))}
    </div>
  );
}
