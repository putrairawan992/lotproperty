import { motion, AnimatePresence } from "motion/react";
import { T } from "../types";
import bullseyeIcon from "../../imports/strike_shoot.png";
import trophyIcon from "../../imports/trophy.png";
import { TrophyIcon } from "lucide-react";

const TreasureChestIcon = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 10s3-3 10-3 10 3 10 3" />
    <path d="M2 10h20" />
    <path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
    <rect x="10.5" y="10" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// Pulsing ring that expands outward and fades — loops while the modal is open.
function PulseRing({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ border: `2px solid ${color}` }}
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 1.9, opacity: 0 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay }}
    />
  );
}

// Global "Quest Selesai!" / "Quest Overkill" popup — any page can trigger it via
// useTheme().showQuestComplete(...). `overkill: true` swaps the copy/accent to flag a
// Quest Overkill bonus award (earned after a category's quota is already used up).
export default function QuestCompleteModal({ quest, onClose }: {
  quest: { name: string; xp: number; overkill?: boolean; streak?: number } | null;
  onClose: () => void;
}) {
  const accent = quest?.overkill ? "#FF6A00" : "#E8A500";
  const accentGradient = quest?.overkill
    ? "linear-gradient(135deg, #FF8A00 0%, #FF3D00 100%)"
    : "linear-gradient(135deg, #FFD700 0%, #E8A500 100%)";

  return (
    <AnimatePresence>
      {quest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8 text-center"
            style={{
              backgroundColor: T.card,
              border: `1px solid ${accent}66`,
              boxShadow: `0 0 0 1px ${accent}33, 0 25px 60px -15px ${accent}66, 0 0 80px -10px ${accent}40`,
            }}
          >
            {/* Ambient glow wash behind everything */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 20%, ${accent}30, transparent 65%)` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
              <PulseRing color={accent} delay={0} />
              <PulseRing color={accent} delay={0.6} />
              <motion.div
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ background: accentGradient, boxShadow: `0 0 30px 4px ${accent}90` }}
                initial={{ scale: 0.3, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
              >
                {quest.overkill ? <img src={bullseyeIcon} width={155} height={155} alt="Overkill" className="object-cover" /> :
                    <img src={trophyIcon} width={155} height={155} alt="CompleteQuest" className="object-cover" />
  }
              </motion.div>

              {/* Streak counter — pops/bounces in on every consecutive Overkill */}
              {quest.overkill && !!quest.streak && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quest.streak}
                    initial={{ scale: 0, opacity: 0, rotate: -15 }}
                    animate={{ scale: [0, 1.35, 1], opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute -bottom-1 -right-1 min-w-[32px] h-[32px] px-2 rounded-full flex items-center justify-center text-sm font-black text-white border-2"
                    style={{ backgroundColor: accent, borderColor: T.card, boxShadow: `0 0 14px ${accent}90` }}
                  >
                    ×{quest.streak}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {quest.overkill && (
              <motion.span
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="relative mb-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: accent, boxShadow: `0 0 16px ${accent}90` }}
              >
                🔥 Quest Overkill
              </motion.span>
            )}

            <motion.h3
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="relative text-2xl font-black mb-2 tracking-tight"
              style={{ color: T.text1, textShadow: `0 0 20px ${accent}80` }}
            >
              {quest.overkill ? "Bonus Overkill!" : "Quest Selesai!"}
            </motion.h3>

            <p className="relative text-sm mb-6 font-medium" style={{ color: T.text2 }}>
              {quest.overkill ? (
                <>Limit harian sudah tercapai, tapi tetap dapat bonus untuk <br /></>
              ) : (
                <>Anda berhasil menyelesaikan <br /></>
              )}
              <strong style={{ color: T.text1 }}>{quest.name}</strong>
            </p>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260 }}
              className="relative px-6 py-3 rounded-2xl flex items-center gap-2 mb-8 overflow-hidden"
              style={{ backgroundColor: `${accent}1A`, border: `1px solid ${accent}66`, boxShadow: `0 0 20px -4px ${accent}80` }}
            >
              <span className="relative text-xl font-black" style={{ color: accent, textShadow: `0 0 12px ${accent}90` }}>
                +{quest.xp.toLocaleString("id-ID")} XP
              </span>
            </motion.div>

            <button
              onClick={onClose}
              className="relative w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: accent, boxShadow: `0 8px 24px -6px ${accent}90` }}
            >
              Lanjutkan
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
