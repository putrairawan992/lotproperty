import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import { T } from "../types";
import Logo from "../components/Logo";
import { api } from "../services/api";

export default function LoginPage({ onLogin, onRegister, onForgotPassword, onAdminLogin, onGuest }: {
  onLogin: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onAdminLogin: () => void;
  onGuest?: () => void;
}) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setToastMsg("");
    try {
      await api.auth.login(email, password);
      onLogin();
    } catch (e: any) {
      setToastMsg(e.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h1 className="text-center mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: T.text1 }}>
            Welcome Back
          </h1>
          <p className="text-center mb-7" style={{ color: T.text3, fontSize: 14 }}>
            Login ke dashboard agent LOT Quest
          </p>

          <div className="space-y-4 mb-5">
            <AuthInput label="Email" type="email" placeholder="agent@lotproperty.id"
              icon={<Mail size={17} />} value={email} onChange={setEmail} />
            <AuthInput label="Password" type={showPass ? "text" : "password"} placeholder="••••••••"
              icon={<Lock size={17} />} value={password} onChange={setPassword}
              action={
                <button onClick={() => setShowPass(p => !p)} style={{ color: T.text3 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              } />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "#E8A500" }} />
              <span style={{ color: T.text2, fontSize: 14 }}>Remember me</span>
            </label>
            <button onClick={onForgotPassword} style={{ color: "#E8A500", fontSize: 14, fontWeight: 500 }}>Lupa Password?</button>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full rounded-xl font-bold transition-all flex items-center justify-center"
            style={{
              height: 48,
              backgroundColor: loading ? "var(--border)" : "#E8A500",
              color: loading ? "#9CA3AF" : "white",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              letterSpacing: "0.06em",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#CC9200"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = "#E8A500"; }}>
            {loading ? "MENGHUBUNGKAN..." : "LOGIN"}
          </button>


          <p className="text-center mt-5" style={{ fontSize: 14, color: T.text3 }}>
            Belum punya akun?{" "}
            <button onClick={onRegister} className="font-semibold" style={{ color: "#E8A500" }}>
              Daftar Sekarang
            </button>
          </p>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            <span style={{ color: T.text3, fontSize: 12 }}>atau</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          </div>

          <button onClick={onAdminLogin}
            className="w-full mt-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ height: 44, borderColor: T.border, color: T.text3, fontSize: 13 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--muted)"; e.currentTarget.style.borderColor = "#1A6FC4"; e.currentTarget.style.color = "#1A6FC4"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "#6B7280"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Masuk sebagai Admin / Staff
          </button>

          {onGuest && (
            <button onClick={onGuest}
              className="w-full mt-2 rounded-xl border font-medium flex items-center justify-center gap-2 transition-colors"
              style={{ height: 44, borderColor: T.border, color: T.text3, fontSize: 13, borderStyle: "dashed" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--muted)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Lanjutkan sebagai Guest
            </button>
          )}

          <p className="text-center mt-4" style={{ color: T.text3, fontSize: 12 }}>
            © {new Date().getFullYear()} LOT Property Group. All rights reserved.
          </p>
        </Card>
      </div>
    </div>
  );
}
