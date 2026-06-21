import { useId } from "react";

export type HofMedalTier = "gold" | "silver" | "bronze" | "neutral";

export const HOF_MEDAL_TIER_COLORS: Record<
  HofMedalTier,
  { base: string; light: string; glow: string }
> = {
  gold:   { base: "#caa54c", light: "#f3dca0", glow: "rgba(232,194,103,0.45)" },
  silver: { base: "#9da3ad", light: "#eef1f5", glow: "rgba(199,206,219,0.4)"  },
  bronze: { base: "#a3673c", light: "#e6b487", glow: "rgba(207,142,87,0.4)"   },
  neutral:{ base: "#5c5a61", light: "#87858d", glow: "rgba(135,133,141,0.28)" },
};

export function rankToMedalTier(rank: number): HofMedalTier {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "neutral";
}

function leafPath(len: number, w: number): string {
  return `M0,0 C${(len*0.18).toFixed(2)},${(-w*0.55).toFixed(2)} ${(len*0.86).toFixed(2)},${(-w*0.5).toFixed(2)} ${len.toFixed(2)},0 C${(len*0.86).toFixed(2)},${(w*0.5).toFixed(2)} ${(len*0.18).toFixed(2)},${(w*0.55).toFixed(2)} 0,0 Z`;
}

/**
 * One wing of leaves — arc from startDeg to endDeg on the right side.
 * Reference arc: startDeg=55 → endDeg=-55 (110° wing, open top & bottom).
 */
function WingLeaves({ gradId, count }: { gradId: string; count: number }) {
  const cx = 100, cy = 100, R = 74;
  const startDeg = 55, endDeg = -55;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t    = i / (count - 1);
        const deg  = startDeg + (endDeg - startDeg) * t;
        const rad  = (deg * Math.PI) / 180;
        const x    = cx + R * Math.cos(rad);
        const y    = cy + R * Math.sin(rad);
        const taper = 0.55 + 0.55 * Math.sin(t * Math.PI);
        const len  = 27 * taper;
        const w    = 11.5 * taper;
        const tilt = deg - 90 + 25;
        const op   = (0.72 + 0.28 * Math.sin(t * Math.PI));
        return (
          <path
            key={i}
            d={leafPath(len, w)}
            transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${tilt.toFixed(2)})`}
            fill={`url(#${gradId})`}
            opacity={op}
          />
        );
      })}
    </>
  );
}

export function HofMedalOrnament({ tier }: { tier: HofMedalTier }) {
  const c = HOF_MEDAL_TIER_COLORS[tier];
  if (tier === "gold") {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
        <path d="M12 1l2.6 7.6H22l-6.2 4.5 2.4 7.6L12 16.2 5.8 20.7l2.4-7.6L2 8.6h7.4L12 1z" fill={c.light} />
      </svg>
    );
  }
  if (tier === "silver") {
    return (
      <svg width={13} height={13} viewBox="0 0 24 24" aria-hidden>
        <circle cx={12} cy={12} r={9} fill="none" stroke={c.light} strokeWidth={2.4} />
      </svg>
    );
  }
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden>
      <rect x={4} y={4} width={16} height={16} rx={3} fill={c.light} />
    </svg>
  );
}

export default function HofMedalWreath({ tier }: { tier: HofMedalTier }) {
  const uid    = useId().replace(/:/g, "");
  const gradId = `hof-wing-${tier}-${uid}`;
  const colors = HOF_MEDAL_TIER_COLORS[tier];

  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-visible"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="100%" stopColor={colors.base} />
        </linearGradient>
      </defs>
      {/* Right wing */}
      <g>
        <WingLeaves gradId={gradId} count={9} />
      </g>
      {/* Left wing — mirror of right wing */}
      <g transform="translate(200,0) scale(-1,1)">
        <WingLeaves gradId={gradId} count={9} />
      </g>
    </svg>
  );
}
