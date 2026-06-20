import { T } from "../types";

export default function XPBar({ value, max, height = 10, showLabel = false }: {
  value: number; max: number; height?: number; showLabel?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1" style={{ color: T.text3 }}>
          <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 600 }}>{value.toLocaleString()} XP</span>
          <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 600 }}>{max.toLocaleString()} XP</span>
        </div>
      )}
      <div className="xp-bar-track" style={{ height }}>
        <div
          className="xp-bar-fill h-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
