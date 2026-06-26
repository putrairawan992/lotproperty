import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { T, useTheme } from "../types";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border w-full max-w-lg mx-auto my-6"
      style={{
        backgroundColor: isDark ? "rgba(20, 20, 25, 0.3)" : "rgba(255, 255, 255, 0.4)",
        borderColor: isDark ? "rgba(232, 165, 0, 0.15)" : "rgba(232, 165, 0, 0.2)",
        backdropFilter: "blur(12px)",
        boxShadow: isDark
          ? "inset 0 1px 1px rgba(255,255,255,0.03), 0 10px 30px -10px rgba(0,0,0,0.5)"
          : "inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px -10px rgba(232,165,0,0.05)",
      }}
    >
      {/* Icon Container with glowing effect */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Glow */}
        <div
          className="absolute w-16 h-16 rounded-full blur-2xl opacity-20 animate-pulse"
          style={{ backgroundColor: "#E8A500" }}
        />
        {/* Border Ring */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border border-dashed transition-transform duration-500 hover:rotate-12"
          style={{
            borderColor: isDark ? "rgba(232, 165, 0, 0.35)" : "rgba(232, 165, 0, 0.45)",
            backgroundColor: isDark ? "rgba(232, 165, 0, 0.05)" : "rgba(232, 165, 0, 0.03)",
          }}
        >
          <Icon
            size={28}
            style={{
              color: "#E8A500",
              filter: isDark ? "drop-shadow(0 2px 8px rgba(232, 165, 0, 0.4))" : "none",
            }}
          />
        </div>
      </div>

      {/* Heading */}
      <h3
        className="font-bold text-lg sm:text-xl mb-2 tracking-wide"
        style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-xs sm:text-sm leading-relaxed max-w-sm mb-6"
        style={{ color: T.text3 }}
      >
        {description}
      </p>

      {/* Call to Action Button */}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
