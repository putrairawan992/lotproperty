import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ImagePlus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { T, useTheme } from "../types";
import { api } from "../services/api";

export default function RegisterPage({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);


  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.email && form.phone && form.password && form.password === form.confirm;

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);



  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 480 } });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error("Error playing video", err));
        }
      }, 100);
    } catch (err) {
      showToast("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const size = Math.min(video.videoWidth, video.videoHeight) || 400;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `profile-camera-${Date.now()}.jpg`, { type: "image/jpeg" });
            handlePhotoPick(file);
          }
        }, "image/jpeg", 0.9);
      }
      stopCamera();
    }
  };

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
                <div className="w-14 h-14 rounded-full overflow-hidden border flex-shrink-0" style={{ borderColor: T.border, backgroundColor: T.muted }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: T.text3 }}>
                      <User size={18} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label
                    className="px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all hover:bg-muted/30"
                    style={{ borderColor: T.border, color: T.text2 }}
                  >
                    <ImagePlus size={14} /> Pilih Galeri
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoPick(e.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all hover:bg-muted/30"
                    style={{ borderColor: T.border, color: T.text2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Ambil Kamera
                  </button>
                </div>
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



            {/* Office removed as requested by user */}

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

      {/* Modal Kamera */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopCamera}
              className="absolute inset-0 bg-black/80"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden relative z-10 flex flex-col p-6 items-center"
              style={{ borderColor: T.border, backgroundColor: T.card }}
            >
              <h3 className="font-bold text-lg mb-4 text-center" style={{ color: T.text1 }}>
                Ambil Foto Profil
              </h3>
              
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-[#E8A500] bg-black mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>

              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#E8A500] text-white transition-all hover:bg-[#CC9200]"
                >
                  Ambil Foto
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 py-2.5 rounded-xl font-semibold border transition-all hover:bg-muted/10"
                  style={{ borderColor: T.border, color: T.text3 }}
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
