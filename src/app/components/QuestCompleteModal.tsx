import { motion, AnimatePresence } from "motion/react";
import { T } from "../types";

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

// Global "Quest Selesai!" popup — any page can trigger it via useTheme().showQuestComplete(...).
// Animation kept to a single fade+scale (no staggered springs/rotations) since the
// previous per-element bounce/rotate sequence was overkill for a routine popup.
export default function QuestCompleteModal({ quest, onClose }: {
  quest: { name: string; xp: number } | null;
  onClose: () => void;
}) {
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
          >
            <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #E8A500 100%)", boxShadow: "0 10px 25px -5px rgba(232, 165, 0, 0.5)" }}>
              <TreasureChestIcon size={48} className="text-white" />
            </div>

            <h3 className="text-2xl font-black mb-2 tracking-tight" style={{ color: T.text1 }}>
              Quest Selesai!
            </h3>

            <p className="text-sm mb-6 font-medium" style={{ color: T.text2 }}>
              Anda berhasil menyelesaikan <br />
              <strong style={{ color: T.text1 }}>{quest.name}</strong>
            </p>

            <div className="px-6 py-3 rounded-2xl flex items-center gap-2 mb-8"
              style={{ backgroundColor: "rgba(232, 165, 0, 0.1)", border: "1px solid rgba(232, 165, 0, 0.3)" }}>
              <span className="text-xl font-black text-[#E8A500]">+{quest.xp.toLocaleString("id-ID")} XP</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#E8A500" }}
            >
              Lanjutkan
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
