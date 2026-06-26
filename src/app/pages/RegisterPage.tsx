import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Building2, ImagePlus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { T, useTheme } from "../types";
import { api } from "../services/api";

export default function RegisterPage({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", office: "", password: "", confirm: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.email && form.phone && form.office && form.password && form.password === form.confirm;

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handlePhotoPick = (file?: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("File foto harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5MB.");
      return;
    }
    setToastMsg("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRegister = async () => {
    if (!valid) return;
    setLoading(true);
    setToastMsg("");
    try {
      let photoUrl = "";
      if (photoFile) {
        const uploaded = await api.auth.uploadProfilePhoto(photoFile);
        photoUrl = uploaded.photo_url;
      }

      await api.auth.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        office: form.office,
        password: form.password,
        photo_url: photoUrl,
      });
      sessionStorage.setItem("lotproperty-pending-email", form.email);
      showToast("Pendaftaran berhasil! Menunggu persetujuan admin.", "success");
      setTimeout(() => onSubmit(), 800);
    } catch (e: any) {
      showToast(e.message || "Pendaftaran gagal. Silakan coba lagi.");
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
            className={`fixed top-20 left-1/2 z-[90] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-semibold border max-w-sm w-[90vw] ${toastType === "success" ? "bg-[#16A34A] border-green-500/30 text-white" : "bg-[#DC2626] border-red-500/30 text-white"}`}
          >
            {toastType === "success" ? <Check size={16} /> : <span className="text-base">⚠️</span>}
            <span className="flex-1 text-xs sm:text-sm">{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="p-0.5 rounded hover:bg-white/10">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div>
              <p className="mb-2" style={{ color: T.text3, fontSize: 13 }}>Foto Profil (Opsional)</p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border" style={{ borderColor: T.border, backgroundColor: T.muted }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: T.text3 }}>
                      <User size={18} />
                    </div>
                  )}
                </div>
                <label
                  className="px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  style={{ borderColor: T.border, color: T.text2 }}
                >
                  <ImagePlus size={14} /> Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoPick(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

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
            <AuthInput label="Office" type="text" placeholder="Contoh: BSD"
              icon={<Building2 size={17} />} value={form.office} onChange={set("office")} />

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
          <button onClick={handleRegister} disabled={!valid || loading}
            className="w-full rounded-xl font-bold transition-all flex items-center justify-center"
            style={{
              height: 48, fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.06em",
              backgroundColor: (valid && !loading) ? "#E8A500" : "var(--border)",
              color: (valid && !loading) ? "white" : "#9CA3AF",
              cursor: (valid && !loading) ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => { if (valid && !loading) e.currentTarget.style.backgroundColor = "#CC9200"; }}
            onMouseLeave={e => { if (valid && !loading) e.currentTarget.style.backgroundColor = "#E8A500"; }}>
            {loading ? "MENDAFTARKAN..." : "DAFTAR"}
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
