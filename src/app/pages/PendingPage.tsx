import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Card from "../components/Card";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { lotLogoImg, lotLogoWhiteImg } from "../badgeAssets";
import { T, useTheme } from "../types";
import { api } from "../services/api";

export default function PendingPage({ onBack }: { onBack: () => void }) {
  const { isDark } = useTheme();
  const [status, setStatus] = useState<"Pending" | "Active" | "Suspended" | "Unknown">("Pending");

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("lotproperty-pending-email");
    if (!pendingEmail) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await api.auth.getRegistrationStatus(pendingEmail);
        if (!cancelled) {
          setStatus(data.status || "Unknown");
        }
      } catch {
        if (!cancelled) {
          setStatus("Pending");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusMessage =
    status === "Active"
      ? "Akunmu sudah disetujui. Silakan login untuk mulai menggunakan aplikasi."
      : status === "Suspended"
        ? "Akunmu saat ini disuspend. Hubungi Office Manager untuk informasi lebih lanjut."
        : "Akunmu sedang dalam proses verifikasi oleh Office Manager. Kamu akan mendapat notifikasi email setelah akun disetujui.";

  const waitingLabel =
    status === "Active"
      ? "Disetujui Office Manager"
      : status === "Suspended"
        ? "Status akun: Suspended"
        : "Menunggu persetujuan Office Manager";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: T.bg }}>
      <div className="w-full" style={{ maxWidth: 440 }}>
        <Card className="p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div style={{ height: 40 }}>
              <ImageWithFallback src={isDark ? lotLogoWhiteImg : lotLogoImg} alt="LOT Property" className="h-full w-auto object-contain" />
            </div>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#FEF3C7" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h1 className="mb-2" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
            Pendaftaran Terkirim!
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: T.text3, fontSize: 14 }}>
            {statusMessage}
          </p>

          {/* Status steps */}
          <div className="text-left space-y-3 mb-7 p-4 rounded-xl" style={{ backgroundColor: T.muted }}>
            {[
              { label: "Pendaftaran dikirim", done: true },
              { label: waitingLabel, done: status === "Active", active: status === "Pending" },
              { label: "Akun aktif & siap digunakan", done: status === "Active", active: status === "Active" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: step.done ? "#DCFCE7" : step.active ? "#FEF3C7" : "#F3F4F6",
                    border: step.active ? "2px solid #D97706" : "none",
                  }}>
                  {step.done
                    ? <Check size={13} style={{ color: "#16A34A" }} />
                    : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: step.active ? "#D97706" : "#D1D5DB" }} />
                  }
                </div>
                <span className="text-sm" style={{ color: step.done ? "#16A34A" : step.active ? "#D97706" : "#9CA3AF", fontWeight: step.active ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

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
