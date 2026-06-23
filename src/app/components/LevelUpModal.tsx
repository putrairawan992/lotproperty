import { motion, AnimatePresence } from "motion/react";
import { T } from "../types";
import { LEVEL_ASSETS } from "../badgeAssets";
import LevelBadge from "./LevelBadge";

const CONFETTI_COLORS = ["#E8A500", "#C8922A", "#16A34A", "#7B2FBE", "#1A6FC4", "#DC2626", "#FFD700"];

export default function LevelUpModal({ newLevel, newTier, xpTotal, onClose }: {
  newLevel: number; newTier: string; xpTotal: string; onClose: () => void;
}) {
  const tierAsset = LEVEL_ASSETS[newTier];

  // 20 confetti particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: (Math.random() - 0.5) * 340,
    y: -(80 + Math.random() * 200),
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.4,
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: "rgba(0,0,0,0)" }}
        initial={{ backgroundColor: "rgba(0,0,0,0)" }}
        animate={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        exit={{ backgroundColor: "rgba(0,0,0,0)" }}
        transition={{ duration: 0.3 }}
        onClick={onClose}>

        {/* Card */}
        <motion.div
          className="relative bg-card rounded-3xl overflow-hidden text-center"
          style={{ maxWidth: 360, width: "100%", padding: "40px 32px 32px" }}
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          onClick={e => e.stopPropagation()}>

          {/* Confetti burst */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 24 }}>
            {particles.map(p => (
              <motion.div key={p.id}
                className="absolute rounded-sm"
                style={{ width: p.size, height: p.size * 0.5, backgroundColor: p.color, left: "50%", top: "40%" }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
                animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
                transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }} />
            ))}
          </div>

          {/* Stars shimmer */}
          {[...Array(6)].map((_, i) => (
            <motion.div key={i}
              className="absolute text-2xl pointer-events-none"
              style={{ left: `${15 + i * 14}%`, top: i % 2 === 0 ? "10%" : "15%" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1, repeat: 2, repeatDelay: 1 }}>
              ✨
            </motion.div>
          ))}

          {/* Level badge */}
          <motion.div className="flex justify-center mb-4"
            initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}>
            <LevelBadge title={newTier} size={120} />
          </motion.div>

          {/* "LEVEL UP!" */}
          <motion.p
            className="font-bold mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: T.text3, letterSpacing: "0.15em" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            SELAMAT!
          </motion.p>
          <motion.h2
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 36, color: T.text1, lineHeight: 1 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}>
            LEVEL UP!
          </motion.h2>

          {/* New level */}
          <motion.div className="flex items-center justify-center gap-2 mt-3 mb-2"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}>
            <span className="font-bold px-3 py-1 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#E8A500,#C8922A)", fontFamily: "'Rajdhani', sans-serif", fontSize: 22 }}>
              Level {newLevel}
            </span>
          </motion.div>

          <motion.p
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: "#308030" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {newTier}
          </motion.p>

          {/* XP total */}
          <motion.div
            className="mt-4 mb-6 py-3 rounded-2xl"
            style={{ backgroundColor: "var(--accent)" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <p className="text-xs" style={{ color: T.text3 }}>Total XP kamu</p>
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, color: "#C8922A" }}>
              {xpTotal}
            </p>
          </motion.div>

          {/* CTA */}
          <motion.button onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold transition-all"
            style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.05em" }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            whileHover={{ backgroundColor: "#CC9200" }}
            whileTap={{ scale: 0.97 }}>
            LANJUTKAN 🚀
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
