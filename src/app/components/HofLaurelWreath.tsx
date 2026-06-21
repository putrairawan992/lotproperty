export function rankLaurelLabel(rank: number): string {
  if (rank === 1) return "WINNER";
  if (rank === 2) return "RUNNER-UP";
  if (rank === 3) return "TOP 3";
  return `#${rank}`;
}

/**
 * Emblem-style laurel: two wings on left & right only.
 * Arc 55° → -55° on right, mirrored to left — same geometry as the reference HTML.
 * viewBox="0 0 140 100", leaves scaled proportionally from 200×200 space.
 */
export default function HofLaurelWreath({ className = "" }: { className?: string }) {
  const cx = 70, cy = 50, R = 37;
  const startDeg = 55, endDeg = -55;
  const count = 8;

  const rightLeaves = Array.from({ length: count }, (_, i) => {
    const t    = i / (count - 1);
    const deg  = startDeg + (endDeg - startDeg) * t;
    const rad  = (deg * Math.PI) / 180;
    const x    = cx + R * Math.cos(rad);
    const y    = cy + R * Math.sin(rad);
    const taper = 0.55 + 0.55 * Math.sin(t * Math.PI);
    const rx   = 3.0 * taper;
    const ry   = 6.5 * taper;
    const tilt = deg - 90 + 25;
    const op   = 0.72 + 0.28 * Math.sin(t * Math.PI);
    return { x, y, rx, ry, tilt, op };
  });

  return (
    <svg viewBox="0 0 140 100" className={`w-full h-full ${className}`} aria-hidden>
      <g fill="currentColor">
        {/* Right wing */}
        {rightLeaves.map(({ x, y, rx, ry, tilt, op }, i) => (
          <ellipse
            key={`r-${i}`}
            cx={x} cy={y} rx={rx} ry={ry}
            opacity={op}
            transform={`rotate(${tilt.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`}
          />
        ))}
        {/* Left wing — mirror around cx=70 */}
        {rightLeaves.map(({ x, y, rx, ry, tilt, op }, i) => (
          <ellipse
            key={`l-${i}`}
            cx={2 * cx - x} cy={y} rx={rx} ry={ry}
            opacity={op}
            transform={`rotate(${(-tilt).toFixed(2)} ${(2 * cx - x).toFixed(2)} ${y.toFixed(2)})`}
          />
        ))}
      </g>
    </svg>
  );
}
