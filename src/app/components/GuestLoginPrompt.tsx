import { motion } from "motion/react";
import { Lock, LogIn } from "lucide-react";
import { T } from "../types";

export default function GuestLoginPrompt({ onLogin, title = "Login untuk lanjutkan", desc = "Fitur ini hanya tersedia untuk member LOT Property. Daftar gratis atau login sekarang." }: {
  onLogin: () => void;
  title?: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "rgba(232,165,0,0.1)", border: "1.5px solid rgba(232,165,0,0.25)" }}
      >
        <Lock size={34} style={{ color: "#E8A500" }} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-bold mb-2"
        style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: T.text1 }}
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="mb-8 max-w-xs"
        style={{ fontSize: 14, color: T.text3, lineHeight: 1.6 }}
      >
        {desc}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        onClick={onLogin}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white"
        style={{ background: "linear-gradient(135deg, #E8A500, #C8922A)", fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: "0.04em" }}
      >
        <LogIn size={17} />
        Login Sekarang
      </motion.button>
    </div>
  );
}
