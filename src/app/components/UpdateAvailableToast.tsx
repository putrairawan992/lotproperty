import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { T } from "../types";

// Deteksi deploy baru tanpa perlu agent me-refresh manual: setiap tab yang
// sedang terbuka membandingkan __APP_BUILD_ID__ (versi yang sedang dijalankan,
// dibekukan saat build — lihat vite.config.ts) dengan /version.json (versi yang
// sedang live di server). Beda berarti sudah ada deploy baru sejak tab ini dibuka.
//
// Sengaja tidak auto-reload: agent yang sedang mengisi form panjang (listing,
// prospect) tidak boleh kehilangan isian karena reload tiba-tiba. Cukup toast
// dengan tombol, dia yang memutuskan kapan.
const CHECK_INTERVAL_MS = 3000; // TEMP FOR TESTING — reverted after verification

export default function UpdateAvailableToast() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        // Query param pembasmi cache: /version.json sendiri tidak punya hash
        // nama file seperti bundle JS, jadi browser bisa saja menyimpannya lama.
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.buildId && data.buildId !== __APP_BUILD_ID__) {
          setUpdateAvailable(true);
        }
      } catch {
        // Tidak ada koneksi atau file belum ada (mis. saat dev pertama kali) — abaikan.
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl animate-fade-in"
      style={{ backgroundColor: T.card, borderColor: T.border, maxWidth: "min(92vw, 420px)" }}
    >
      <p className="text-sm font-medium flex-1" style={{ color: T.text1 }}>
        Versi baru tersedia.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #E8A500, #C8922A)", fontFamily: "'Rajdhani', sans-serif" }}
      >
        <RefreshCw size={13} /> Refresh
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-full hover:bg-muted text-text3 flex-shrink-0"
        style={{ color: T.text3 }}
        aria-label="Tutup"
      >
        <X size={16} />
      </button>
    </div>
  );
}
