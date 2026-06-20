import { useState } from "react";
import { Mail, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Card from "../components/Card";
import AuthInput from "../components/AuthInput";
import Logo from "../components/Logo";
import { T } from "../types";

export default function ForgotPasswordPage({
  onBack,
}: {
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    if (!isValidEmail) {
      setError("Format email tidak valid");
      return;
    }
    setError("");
    setSubmitted(true);
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
              onChange={v => { setEmail(v); setError(""); }}
            />
            {error && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "#DC2626" }}>
                <AlertCircle size={13} /> {error}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email.trim()}
            className="w-full rounded-xl font-bold transition-all"
            style={{
              height: 48,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              letterSpacing: "0.06em",
              backgroundColor: email.trim() ? "#E8A500" : "var(--border)",
              color: email.trim() ? "white" : "#9CA3AF",
              cursor: email.trim() ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => { if (email.trim()) e.currentTarget.style.backgroundColor = "#CC9200"; }}
            onMouseLeave={e => { if (email.trim()) e.currentTarget.style.backgroundColor = "#E8A500"; }}
          >
            KIRIM LINK RESET
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
