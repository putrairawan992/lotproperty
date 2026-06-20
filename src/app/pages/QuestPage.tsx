import { useState, useContext } from "react";
import { Calendar, DollarSign, Target, Check, ChevronRight, X, Camera, Send, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Card from "../components/Card";
import LevelBadge from "../components/LevelBadge";
import XPBar from "../components/XPBar";
import { QuestPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T, Page, ThemeCtx } from "../types";
import { BADGE_ASSETS } from "../badgeAssets";
import { useLocation } from "../routes";

interface QuestItem {
  name: string;
  progress: number;
  total: number;
  xp: number;
  done?: boolean;
  id: string;
  note?: string;
  status?: string;
}

export default function QuestPage({ onNav }: { onNav?: (p: Page) => void }) {
  const loading = useLoading(1200);
  const { isDark } = useTheme();
  const { navigate } = useLocation();

  // Quest states
  const [dailyQuests, setDailyQuests] = useState<QuestItem[]>([
    { name: "Daily Login", progress: 1, total: 1, xp: 100, done: true, id: "daily_login" },
    { name: "New Listing", progress: 2, total: 3, xp: 100, note: "Max 300 XP/hari", id: "new_listing" },
    { name: "New Content (IG/TikTok/YT)", progress: 0, total: 1, xp: 300, id: "new_content" },
    { name: "Listing Promotion", progress: 1, total: 3, xp: 100, note: "Max 300 XP/hari", id: "listing_promo" },
  ]);

  const [weeklyQuests, setWeeklyQuests] = useState<QuestItem[]>([
    { name: "New Prospect", progress: 4, total: 10, xp: 100, note: "Max 1.000 XP/minggu (100 XP per Prospect)", id: "new_prospect" },
    { name: "Prospect Clearance", progress: 0, total: 1, xp: 1000, note: "Tidak ada reminder overdue", id: "prospect_clearance" },
  ]);

  const [skillQuests, setSkillQuests] = useState<QuestItem[]>([
    { name: "New Recruit", progress: 0, total: 1, xp: 5000, note: "Input nama & nomor KTM untuk verifikasi Admin", id: "new_recruit", status: "not_submitted" },
    { name: "Komplet Modul Akademi", progress: 2, total: 5, xp: 200, note: "Otomatis setelah menyelesaikan video", id: "academy" },
    { name: "Event Participation", progress: 0, total: 1, xp: 1000, note: "Scan barcode event atau input kode manual", id: "event_participation", status: "not_submitted" },
  ]);

  // Modal states
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [recruitForm, setRecruitForm] = useState({ name: "", ktm: "" });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventCode, setEventCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const [showContentModal, setShowContentModal] = useState(false);
  const [contentUrl, setContentUrl] = useState("");

  if (loading) return <QuestPageSkeleton />;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const handleGo = (q: any) => {
    if (q.id === "new_recruit") {
      setShowRecruitModal(true);
    } else if (q.id === "event_participation") {
      setShowEventModal(true);
      setScanning(true);
    } else if (q.id === "new_content") {
      setShowContentModal(true);
    } else if (q.id === "new_prospect") {
      navigate("/prospect?create=1");
    } else if (q.id === "prospect_clearance") {
      navigate("/prospect");
    } else if (q.id === "academy") {
      onNav?.("academy");
    } else if (q.id === "new_listing") {
      navigate("/listing?create=1");
    } else if (q.id === "listing_promo") {
      navigate("/listing");
    }
  };

  const handleRecruitSubmit = () => {
    if (!recruitForm.name.trim() || !recruitForm.ktm.trim()) return;
    setSkillQuests(prev => prev.map(q => q.id === "new_recruit" ? { ...q, status: "pending" } : q));
    setShowRecruitModal(false);
    setRecruitForm({ name: "", ktm: "" });
    triggerToast("Bukti rekrutmen berhasil dikirim! Menunggu approval Admin.");
  };

  const handleEventCodeSubmit = (code: string) => {
    if (!code.trim()) return;
    setSkillQuests(prev => prev.map(q => q.id === "event_participation" ? { ...q, progress: 1, done: true } : q));
    setShowEventModal(false);
    setEventCode("");
    triggerToast("Kode event berhasil diverifikasi! +1.000 XP ditambahkan.");
  };

  const handleContentSubmit = () => {
    if (!contentUrl.trim()) return;
    setDailyQuests(prev => prev.map(q => q.id === "new_content" ? { ...q, progress: 1, done: true } : q));
    setShowContentModal(false);
    setContentUrl("");
    triggerToast("Link konten berhasil disubmit! +300 XP ditambahkan.");
  };

  function QuestRow({ q, accent }: { q: any; accent: string }) {
    const isPending = q.id === "new_recruit" && q.status === "pending";
    const isDone = q.done || q.progress >= q.total;

    return (
      <div className="flex items-center gap-4 px-5 py-3 border-b last:border-0" style={{ borderColor: T.border }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
          <Target size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1" style={{ color: isDone ? T.text3 : T.text1 }}>{q.name}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1"><XPBar value={q.progress} max={q.total} height={4} /></div>
            <span className="text-xs whitespace-nowrap" style={{ color: T.text3 }}>{q.progress}/{q.total}</span>
          </div>
          {q.note && <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{q.note}</p>}
        </div>
        <span className="text-xs font-bold flex-shrink-0" style={{ color: "#C8922A" }}>+{q.xp.toLocaleString()} XP</span>
        {isDone ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#DCFCE7" }}>
            <Check size={14} style={{ color: "#16A34A" }} />
          </div>
        ) : isPending ? (
          <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#FEF3C7", color: "#D97706", fontFamily: "'Rajdhani',sans-serif" }}>
            Pending
          </span>
        ) : (
          <button onClick={() => handleGo(q)} className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all" style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani',sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#CC9200")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E8A500")}>
            Go
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5 relative">
      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Header */}
      <Card className="p-5" style={{ background: isDark ? "var(--gradient-banner)" : "linear-gradient(135deg,#FFFCF0,#FFFAED)", borderColor: isDark ? "#C8922A25" : "#E8A50025" }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-shrink-0"><LevelBadge title="Senior Agent" size={64} /></div>
          <div className="flex-1">
            <p style={{ fontSize: 10, color: T.text3, letterSpacing: "0.08em" }}>RANK SAAT INI</p>
            <p className="font-bold text-gradient-gold" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Senior Agent</p>
            <p style={{ fontSize: 11, color: T.text3 }}>Level 45 · <span className="text-gradient-gold font-bold" style={{ fontFamily: "var(--font-numeric)" }}>648,450 XP</span></p>
          </div>
          <div className="text-right flex-shrink-0">
            <p style={{ fontSize: 10, color: T.text3 }}>Weekly Rank</p>
            <p className="font-bold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, color: "#E8A500" }}>#7</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <XPBar value={648450} max={800000} showLabel />
            <p className="text-xs mt-1.5" style={{ color: T.text3 }}>151,550 XP lagi menuju <span style={{ color: "#7040D0", fontWeight: 600 }}>Elite Agent</span></p>
          </div>
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <LevelBadge title="Elite Agent" size={40} />
            <span style={{ fontSize: 8, color: T.text3 }}>NEXT</span>
          </div>
        </div>
      </Card>

      {/* Claim Commission */}
      <Card className="p-4" style={{ backgroundColor: isDark ? "#1A0A00" : "#FFFCF0", borderColor: "#E8A50025" }}>
        <div className="flex items-center gap-3 justify-between flex-wrap gap-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FEF3C7" }}><DollarSign size={20} style={{ color: "#C8922A" }} /></div>
            <div>
              <p className="font-semibold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: T.text1 }}>Claim Commission</p>
              <p className="text-xs" style={{ color: T.text3 }}>Terakhir: 14 Jun 2025 · Rp 12.500.000</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap"
            style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, letterSpacing: "0.06em" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#CC9200")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E8A500")}>
            CLAIM COMMISSION
          </button>
        </div>
      </Card>

      {/* Daily Quest */}
      <Card style={{ borderLeft: "4px solid #16A34A" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(22,163,74,0.1)" : "#DCFCE715" }}>
          <div>
            <h3 className="font-bold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: "#16A34A" }}>Daily Quest</h3>
            <p style={{ fontSize: 10, color: T.text3 }}>Direset setiap hari pukul 00:00 WIB</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>🔥 14 Hari</span>
            {BADGE_ASSETS["Dedicated Agent"] && <img src={BADGE_ASSETS["Dedicated Agent"]} alt="Dedicated Agent" style={{ width: 30, height: 30, objectFit: "contain" }} />}
          </div>
        </div>
        {dailyQuests.map((q, i) => <QuestRow key={i} q={q} accent="#16A34A" />)}
      </Card>

      {/* Weekly Quest */}
      <Card style={{ borderLeft: "4px solid #7B2FBE" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(123,47,190,0.1)" : "#F3EAFD15" }}>
          <div>
            <h3 className="font-bold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: "#7B2FBE" }}>Weekly Quest</h3>
            <p style={{ fontSize: 10, color: T.text3 }}>Pembaluan mingguan untuk target listing & prospek</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3EAFD", color: "#7B2FBE" }}>Reset Senin</span>
        </div>
        {weeklyQuests.map((q, i) => <QuestRow key={i} q={q} accent="#7B2FBE" />)}
      </Card>

      {/* Skill Quest */}
      <Card style={{ borderLeft: "4px solid #1A6FC4" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(26,111,196,0.1)" : "#DBEAFE15" }}>
          <div>
            <h3 className="font-bold" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: "#1A6FC4" }}>Skill Quest</h3>
            <p style={{ fontSize: 10, color: T.text3 }}>Meningkatkan keahlian berkarir dan rekrutmen aktif</p>
          </div>
          <div className="flex items-center gap-1">
            {["The Leader", "The Professor"].map(n => BADGE_ASSETS[n] && (
              <img key={n} src={BADGE_ASSETS[n]} alt={n} style={{ width: 26, height: 26, objectFit: "contain" }} />
            ))}
          </div>
        </div>
        {skillQuests.map((q, i) => <QuestRow key={i} q={q} accent="#1A6FC4" />)}
      </Card>

      {/* ── MODAL: NEW RECRUIT (PROOF-TOOL) ── */}
      <AnimatePresence>
        {showRecruitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRecruitModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Recruit Proof Submission</h3>
                <button onClick={() => setShowRecruitModal(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs" style={{ color: T.text3 }}>
                  Kirimkan data agen baru yang Anda rekrut. Setelah diverifikasi oleh Admin, Anda akan mendapatkan bonus <strong style={{ color: "#E8A500" }}>+5.000 XP</strong>.
                </p>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Nama Lengkap Agen Baru</label>
                  <input type="text" placeholder="Nama lengkap..." value={recruitForm.name} onChange={e => setRecruitForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none" style={{ borderColor: T.border, color: T.text1, backgroundColor: T.card }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Nomor KTM (Kartu Tanda Mitra)</label>
                  <input type="text" placeholder="KTM-XXXXXX" value={recruitForm.ktm} onChange={e => setRecruitForm(f => ({ ...f, ktm: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none" style={{ borderColor: T.border, color: T.text1, backgroundColor: T.card }} />
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-2 justify-end bg-muted/10" style={{ borderColor: T.border }}>
                <button onClick={() => setShowRecruitModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ color: T.text3 }}>Batal</button>
                <button onClick={handleRecruitSubmit} disabled={!recruitForm.name.trim() || !recruitForm.ktm.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 text-white animate-pulse"
                  style={{ backgroundColor: recruitForm.name.trim() && recruitForm.ktm.trim() ? "#E8A500" : "var(--border)", cursor: recruitForm.name.trim() && recruitForm.ktm.trim() ? "pointer" : "not-allowed" }}>
                  <Send size={14} /> Submit Bukti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: EVENT PARTICIPATION (SCAN BARCODE & MANUAL) ── */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEventModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Barcode Scanner Event</h3>
                <button onClick={() => setShowEventModal(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5 text-center">
                {scanning ? (
                  <div className="space-y-4">
                    {/* Fake Camera View */}
                    <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                      <Camera size={36} className="animate-pulse mb-2 text-[#E8A500]" />
                      <p className="text-[10px] text-zinc-400">Arahkan kamera ke barcode event...</p>

                      {/* Scanning Laser Line */}
                      <div className="absolute inset-x-0 h-0.5 bg-[#E8A500] opacity-80"
                        style={{
                          animation: "scan-laser 2.5s infinite linear",
                          boxShadow: "0 0 10px #E8A500",
                        }}
                      />
                      <style>{`
                        @keyframes scan-laser {
                          0% { top: 10%; }
                          50% { top: 90%; }
                          100% { top: 10%; }
                        }
                      `}</style>

                      {/* Corner overlays */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#E8A500]" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#E8A500]" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#E8A500]" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#E8A500]" />
                    </div>

                    <p className="text-xs" style={{ color: T.text3 }}>Posisikan QR Code event di dalam area kamera</p>

                    <button onClick={() => setScanning(false)} className="text-xs font-semibold underline text-[#E8A500] hover:opacity-80 transition-all">
                      Gagal scan? Input kode event manual
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <p className="text-xs text-center" style={{ color: T.text3 }}>
                      Masukkan kode event resmi dari LOT Property yang Anda ikuti untuk mengklaim <strong style={{ color: "#E8A500" }}>+1.000 XP</strong>.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Kode Event Manual</label>
                      <div className="relative">
                        <QrCode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="LOT-EVENT-2026" value={eventCode} onChange={e => setEventCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-sm outline-none" style={{ borderColor: T.border, color: T.text1, backgroundColor: T.card }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Contoh: LOT-EVENT-2026, LOT-MERDEKA-77</p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setScanning(true)} className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all text-center" style={{ borderColor: T.border, color: T.text2 }}>
                        Kembali ke Scan Kamera
                      </button>
                      <button onClick={() => handleEventCodeSubmit(eventCode)} disabled={!eventCode.trim()}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-white animate-pulse"
                        style={{ backgroundColor: eventCode.trim() ? "#E8A500" : "var(--border)", cursor: eventCode.trim() ? "pointer" : "not-allowed" }}>
                        Verifikasi Kode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: NEW CONTENT LINK ── */}
      <AnimatePresence>
        {showContentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContentModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Submit Link Konten</h3>
                <button onClick={() => setShowContentModal(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs" style={{ color: T.text3 }}>
                  Kirimkan link publik konten promosi properti Anda (Instagram Reels, TikTok, YouTube Shorts, dll) untuk mendapatkan bonus <strong style={{ color: "#E8A500" }}>+300 XP</strong>.
                </p>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>URL Konten Promosi</label>
                  <input type="url" placeholder="https://instagram.com/reels/..." value={contentUrl} onChange={e => setContentUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none" style={{ borderColor: T.border, color: T.text1, backgroundColor: T.card }} />
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-2 justify-end bg-muted/10" style={{ borderColor: T.border }}>
                <button onClick={() => setShowContentModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ color: T.text3 }}>Batal</button>
                <button onClick={handleContentSubmit} disabled={!contentUrl.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all text-white"
                  style={{ backgroundColor: contentUrl.trim() ? "#E8A500" : "var(--border)", cursor: contentUrl.trim() ? "pointer" : "not-allowed" }}>
                  Klaim XP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// useTheme helper
const useTheme = () => useContext(ThemeCtx);
