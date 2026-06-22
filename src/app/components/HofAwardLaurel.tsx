import { rankLaurelLabel } from "./HofLaurelWreath";
import HofMedalWreath, {
  HofMedalOrnament,
  HOF_MEDAL_TIER_COLORS,
  rankToMedalTier,
  type HofMedalTier,
} from "./HofMedalWreath";

const GLOW_COLORS: Record<HofMedalTier, string> = {
  gold: "#e8c267",
  silver: "#c7cedb",
  bronze: "#cf8e57",
  neutral: "#6b6970",
};

export default function HofAwardLaurel({
  category,
  rank,
  period,
}: {
  category: string;
  rank: string;
  period: string;
}) {
  const year = period.split(" ").pop() ?? period;
  const rankNum = parseInt(rank.replace("#", ""), 10);
  const tier = Number.isNaN(rankNum) ? "gold" : rankToMedalTier(rankNum);
  const label = Number.isNaN(rankNum) ? rank : rankLaurelLabel(rankNum);
  const tierColors = HOF_MEDAL_TIER_COLORS[tier];

  return (
    <div className="group flex flex-col items-center text-center w-full max-w-[76px] sm:max-w-[160px] sm:flex-1 sm:min-w-[150px] mx-auto">
      <div
        className="relative w-[58px] h-[58px] sm:w-[148px] sm:h-[148px] flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-1"
        data-tier={tier}
      >
        <div
          className="absolute -inset-[30%] rounded-full opacity-45 sm:opacity-55 mix-blend-screen blur-[10px] sm:blur-[22px] transition-opacity duration-300 group-hover:opacity-85 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${GLOW_COLORS[tier]}, transparent 70%)`,
          }}
        />

        <HofMedalWreath tier={tier} />

        <div className="absolute top-1 sm:top-3.5 left-1/2 -translate-x-1/2 z-10 scale-[0.52] sm:scale-100 origin-top">
          <HofMedalOrnament tier={tier} />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.2 sm:gap-1 pointer-events-none z-10 pt-1 sm:pt-0">
          <span
            className="text-[6.5px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.22em] font-semibold"
            style={{ color: "rgba(243,242,238,0.45)", fontFamily: "'Inter', sans-serif" }}
          >
            {year}
          </span>
          <span
            className="text-[9px] sm:text-[17px] tracking-[0.05em] sm:tracking-[0.12em] uppercase leading-none"
            style={{
              fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
              color: tierColors.light,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="mt-1.5 sm:mt-[18px] px-0.5 sm:px-1 w-full">
        <p
          className="text-[9px] sm:text-sm font-semibold mb-0.5 sm:mb-1 leading-tight line-clamp-2"
          style={{ color: "#f3f2ee", fontFamily: "'Inter', sans-serif", letterSpacing: "0.2px" }}
        >
          {category}
        </p>
        <p
          className="text-[8px] sm:text-[11px] tracking-[0.10em] sm:tracking-[0.14em] uppercase font-medium"
          style={{ color: "#5c5a61", fontFamily: "'Inter', sans-serif" }}
        >
          {period}
        </p>
      </div>
    </div>
  );
}
