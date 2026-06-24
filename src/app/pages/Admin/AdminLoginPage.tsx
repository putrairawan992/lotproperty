import { useState } from "react";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import Card from "../../components/Card";
import AuthInput from "../../components/AuthInput";
import { ImageWithFallback } from "../../../app/components/figma/ImageWithFallback";
import { lotLogoImg, lotLogoWhiteImg } from "../../badgeAssets";
import { T, useTheme, AdminRole, ADMIN_ROLES, ROLE_COLOR } from "../../types";

export default function AdminLoginPage({ onBack, onLogin }: { onBack: () => void; onLogin: (role: AdminRole) => void }) {
  const { isDark } = useTheme();
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole]     = useState<AdminRole>("Super Admin");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
      <div className="w-full" style={{ maxWidth: 440 }}>
        <Card className="p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div style={{ height: 40 }}>
              <ImageWithFallback src={isDark ? lotLogoWhiteImg : lotLogoImg} alt="LOT Property" className="h-full w-auto object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? "rgba(26, 111, 196, 0.15)" : "#EEF5FC" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#60A5FA" : "#1A6FC4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: T.text1 }}>
              Admin Panel
            </h1>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2" style={{ color: T.text2 }}>Login sebagai</label>
            <div className="grid grid-cols-3 gap-2">
              {ADMIN_ROLES.map(r => {
                const isSelected = role === r;
                
                // Dark mode compliant styles for roles selector
                let btnStyle = {
                  borderColor: "var(--border)",
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                };

                if (isSelected) {
                  if (r === "Super Admin") {
                    btnStyle = {
                      borderColor: isDark ? "#F87171" : "#C0392B",
                      backgroundColor: isDark ? "rgba(248, 113, 113, 0.15)" : "#FEF2F1",
                      color: isDark ? "#F87171" : "#C0392B",
                    };
                  } else if (r === "Office Manager") {
                    btnStyle = {
                      borderColor: isDark ? "#60A5FA" : "#1A6FC4",
                      backgroundColor: isDark ? "rgba(96, 165, 250, 0.15)" : "#EEF5FC",
                      color: isDark ? "#60A5FA" : "#1A6FC4",
                    };
                  } else { // Finance
                    btnStyle = {
                      borderColor: isDark ? "#4ADE80" : "#16A34A",
                      backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "#F0FDF4",
                      color: isDark ? "#4ADE80" : "#16A34A",
                    };
                  }
                }

                return (
                  <button key={r} onClick={() => setRole(r)}
                    className="py-2.5 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all"
                    style={btnStyle}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <AuthInput label="Email" type="email" placeholder="admin@lotproperty.id"
              icon={<Mail size={17} />} value={email} onChange={setEmail} />
            <AuthInput label="Password" type={showPass ? "text" : "password"} placeholder="••••••••"
              icon={<Lock size={17} />} value={password} onChange={setPassword}
              action={
                <button onClick={() => setShowPass(p => !p)} style={{ color: T.text3 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              } />
          </div>

          <button onClick={() => onLogin(role)}
            className="w-full rounded-xl font-bold transition-all mb-4"
            style={{ height: 48, backgroundColor: "#1A6FC4", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.06em" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1558A0")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1A6FC4")}>
            MASUK KE ADMIN PANEL
          </button>

          <button onClick={onBack} className="w-full text-sm text-center" style={{ color: T.text3 }}>
            ← Kembali ke Login Agent
          </button>
        </Card>
      </div>
    </div>
  );
}
