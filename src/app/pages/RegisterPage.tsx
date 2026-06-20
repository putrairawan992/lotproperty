import { useState } from "react";
import { User, Mail, Phone, Building2, Lock, Eye, EyeOff, ChevronDown, AlertCircle } from "lucide-react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { T, useTheme } from "../types";

const OFFICES = [
  "LOT Property Jakarta Selatan",
  "LOT Property Jakarta Barat",
  "LOT Property Tangerang Selatan",
  "LOT Property Tangerang Kota",
  "LOT Property Bekasi",
  "LOT Property Depok",
  "LOT Property BSD",
  "LOT Property Serpong",
];

export default function RegisterPage({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", office: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.email && form.phone && form.office && form.password && form.password === form.confirm;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
      <div className="w-full" style={{ maxWidth: 440 }}>
        <Card className="p-8 shadow-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div style={{ height: 40 }}>
              <ImageWithFallback src={isDark ? lotLogoWhiteImg : lotLogoImg} alt="LOT Property" className="h-full w-auto object-contain" />
            </div>
          </div>

          <h1 className="text-center mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, color: T.text1 }}>
            Daftar Akun Agent
          </h1>
          <p className="text-center mb-6" style={{ color: T.text3, fontSize: 14 }}>
            Isi data diri kamu untuk mendaftar
          </p>

          <div className="space-y-4 mb-6">
            {/* Full Name */}
            <AuthInput label="Nama Lengkap" placeholder="Nama sesuai KTP"
              icon={<User size={17} />} value={form.name} onChange={set("name")} />

            {/* Email */}
            <AuthInput label="Email" type="email" placeholder="email@contoh.com"
              icon={<Mail size={17} />} value={form.email} onChange={set("email")} />

            {/* Phone */}
            <AuthInput label="Nomor HP" type="tel" placeholder="08xx-xxxx-xxxx"
              icon={<Phone size={17} />} value={form.phone} onChange={set("phone")} />

            {/* Office */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Kantor</label>
              <div className="relative">
                <Building2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
                <select value={form.office} onChange={e => set("office")(e.target.value)}
                  className="w-full pl-10 pr-4 rounded-xl border outline-none bg-card appearance-none"
                  style={{ height: 48, borderColor: T.border, fontSize: 14, fontFamily: "'Inter', sans-serif", color: form.office ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  <option value="">Pilih kantor...</option>
                  {OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
              </div>
            </div>

            {/* Password */}
            <AuthInput label="Password" type={showPass ? "text" : "password"} placeholder="Min. 8 karakter"
              icon={<Lock size={17} />} value={form.password} onChange={set("password")}
              action={
                <button onClick={() => setShowPass(p => !p)} style={{ color: T.text3 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              } />

            {/* Confirm Password */}
            <AuthInput label="Konfirmasi Password" type={showConfirm ? "text" : "password"} placeholder="Ulangi password"
              icon={<Lock size={17} />} value={form.confirm} onChange={set("confirm")}
              action={
                <button onClick={() => setShowConfirm(p => !p)} style={{ color: T.text3 }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              } />

            {/* Password mismatch warning */}
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "#DC2626" }}>
                <AlertCircle size={13} /> Password tidak cocok
              </p>
            )}
          </div>

          {/* Submit */}
          <button onClick={onSubmit} disabled={!valid}
            className="w-full rounded-xl font-bold transition-all"
            style={{
              height: 48, fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.06em",
              backgroundColor: valid ? "#E8A500" : "var(--border)",
              color: valid ? "white" : "#9CA3AF",
              cursor: valid ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => { if (valid) e.currentTarget.style.backgroundColor = "#CC9200"; }}
            onMouseLeave={e => { if (valid) e.currentTarget.style.backgroundColor = "#E8A500"; }}>
            DAFTAR
          </button>

          <p className="text-center mt-5" style={{ fontSize: 14, color: T.text3 }}>
            Sudah punya akun?{" "}
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
