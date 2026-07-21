import { useState, useEffect } from "react";
import { Mail, ArrowLeft, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import Logo from "../components/Logo";
import { T } from "../types";
import { api } from "../services/api";

export default function ForgotPasswordPage({
  onBack,
}: {
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [sending, setSending] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setToastMsg("Email wajib diisi");
      return;
    }
    if (!isValidEmail) {
      setToastMsg("Format email tidak valid");
      return;
    }
    setToastMsg("");
    setSending(true);
    try {
      // Backend always replies 200 regardless of whether the email is
      // registered (anti-enumeration) — a thrown error here means the
      // request itself genuinely failed (network/server error), not that
      // the email doesn't exist. Only show the "sent" screen once we know
      // the request actually went through.
      await api.auth.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (error) {
      setToastMsg(error instanceof Error ? error.message : "Gagal mengirim link reset. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
        <div className="w-full" style={{ maxWidth: 440 }}>
          <Card className="p-8 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>

            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#DCFCE7" }}>
              <Check size={36} style={{ color: "#16A34A" }} />
            </div>

            <h1 className="mb-2" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
              Email Terkirim!
            </h1>
            <p className="mb-2 leading-relaxed" style={{ color: T.text3, fontSize: 14 }}>
              Link reset password telah dikirim ke:
            </p>
            <p className="mb-6 font-semibold" style={{ color: T.text1, fontSize: 14 }}>
              {email.trim()}
            </p>
            <p className="mb-7 leading-relaxed text-left p-4 rounded-xl" style={{ backgroundColor: T.muted, color: T.text3, fontSize: 13 }}>
              Cek inbox atau folder spam. Link berlaku 24 jam. Jika tidak menerima email dalam 5 menit, hubungi Office Manager kantor Anda.
            </p>

            <button onClick={onBack}
              className="w-full rounded-xl font-bold transition-all"
              style={{ height: 48, backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: "0.04em" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#CC9200")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E8A500")}>
              Kembali ke Login
            </button>

            <p className="mt-4 text-xs" style={{ color: T.text3 }}>
              © {new Date().getFullYear()} LOT Property Group. All rights reserved.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            className="fixed top-20 left-1/2 z-[90] px-5 py-3.5 rounded-2xl bg-[#DC2626] text-white shadow-xl flex items-center gap-2.5 text-sm font-semibold border border-red-500/30 max-w-sm w-[90vw]"
          >
            <span className="text-base">⚠️</span>
            <span className="flex-1 text-xs sm:text-sm">{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="p-0.5 rounded hover:bg-white/10">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full" style={{ maxWidth: 440 }}>
        <Card className="p-8 shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors"
            style={{ color: T.text3 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8A500")}
            onMouseLeave={e => (e.currentTarget.style.color = T.text3)}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <h1 className="text-center mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, color: T.text1 }}>
            Lupa Password
          </h1>
          <p className="text-center mb-7 leading-relaxed" style={{ color: T.text3, fontSize: 14 }}>
            Masukkan email terdaftar. Kami akan mengirimkan link untuk mengatur ulang password Anda.
          </p>

          <div className="space-y-4 mb-5">
            <AuthInput
              label="Email"
              type="email"
              placeholder="agent@lotproperty.id"
              icon={<Mail size={17} />}
              value={email}
              onChange={v => { setEmail(v); setToastMsg(""); }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email.trim() || sending}
            className="w-full rounded-xl font-bold transition-all"
            style={{
              height: 48,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              letterSpacing: "0.06em",
              backgroundColor: email.trim() && !sending ? "#E8A500" : "var(--border)",
              color: email.trim() && !sending ? "white" : "#9CA3AF",
              cursor: email.trim() && !sending ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => { if (email.trim() && !sending) e.currentTarget.style.backgroundColor = "#CC9200"; }}
            onMouseLeave={e => { if (email.trim() && !sending) e.currentTarget.style.backgroundColor = "#E8A500"; }}
          >
            {sending ? "MENGIRIM..." : "KIRIM LINK RESET"}
          </button>

          <p className="text-center mt-5" style={{ fontSize: 14, color: T.text3 }}>
            Ingat password?{" "}
            <button onClick={onBack} className="font-semibold" style={{ color: "#E8A500" }}>
              Login
            </button>
          </p>

          <p className="text-center mt-4" style={{ color: T.text3, fontSize: 12 }}>
            © {new Date().getFullYear()} LOT Property Group. All rights reserved.
          </p>
        </Card>
      </div>
    </div>
  );
}
