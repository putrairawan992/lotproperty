import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import { T } from "../types";
import Logo from "../components/Logo";

export default function LoginPage({ onLogin, onRegister, onForgotPassword, onAdminLogin }: {
  onLogin: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onAdminLogin: () => void;
}) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
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

          <button onClick={onLogin}
            className="w-full rounded-xl font-bold transition-all"
            style={{ height: 48, backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.06em" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#CC9200")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E8A500")}>
            LOGIN
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

          <p className="text-center mt-4" style={{ color: T.text3, fontSize: 12 }}>
            © {new Date().getFullYear()} LOT Property Group. All rights reserved.
          </p>
        </Card>
      </div>
    </div>
  );
}
