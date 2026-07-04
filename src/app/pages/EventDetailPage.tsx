import { useState, useEffect } from "react";
import { ChevronRight, Flame, Users, Calendar, Trophy, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import XPBar from "../components/XPBar";
import { T, useTheme } from "../types";
import { useLocation } from "../routes";
import { api } from "../services/api";
import { formatEventPeriod } from "../appData";

export default function EventDetailPage({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [url, setUrl] = useState("");
  const [urlFocused, setUrlFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastError, setToastError] = useState(false);
  const { isDark } = useTheme();
  const { getQueryParam } = useLocation();
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadEventDetail = async () => {
    try {
      let eventId = getQueryParam("id");
      // Strip "EV-" prefix if present (from HomePage slider)
      if (eventId && eventId.toUpperCase().startsWith("EV-")) {
        eventId = eventId.replace(/^EV-/i, "");
      }
      if (!eventId) {
        const list = await api.events.getList();
        if (Array.isArray(list)) {
          const activeEvent = list.find((ev: any) => ev.status === "Active") || list[0];
          if (activeEvent) {
            eventId = String(activeEvent.id);
          }
        }
      }
      if (eventId) {
        const detail = await api.events.getDetail(eventId);
        if (detail) {
          setEventDetail(detail);
          setSubmitted(detail.my_submission?.submitted || false);
          if (detail.my_submission?.submission_url) {
            setUrl(detail.my_submission.submission_url);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load event detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetail();
  }, []);

  const ev = eventDetail?.event;
  const myProgress = eventDetail?.my_progress || 0;
  const mySubmission = eventDetail?.my_submission || { submitted: false, submission_url: "", submission_status: "Pending", reject_reason: "" };
  const leaderboard = eventDetail?.leaderboard || [];

  const getDaysRemaining = () => {
    if (!ev.end_date) return "—";
    const end = new Date(ev.end_date);
    const diff = end.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} hari tersisa` : "Event berakhir";
  };

  const hero = {
    bg: isDark
      ? "linear-gradient(135deg, #1C1408 0%, #100E0A 55%, #0A0A0A 100%)"
      : "linear-gradient(135deg, #FFFAED 0%, #FFF6E0 100%)",
    border: isDark ? "1.5px solid rgba(232, 165, 0, 0.35)" : "1.5px solid rgba(232, 165, 0, 0.25)",
    title: isDark ? "#F5F0E8" : "#1A1200",
    subtitle: isDark ? "#C8B89A" : "#6B5A3E",
    badgeBg: isDark ? "rgba(232, 165, 0, 0.15)" : "#FEF3C7",
    badgeColor: isDark ? "#F0C040" : "#B45309",
    trophyBg: isDark ? "rgba(232, 165, 0, 0.12)" : "#FFFAED",
    trophyBorder: isDark ? "rgba(200, 146, 42, 0.4)" : "rgba(232, 165, 0, 0.2)",
  };

  const sectionLabel = isDark ? "#A89B88" : "#6B7280";
  const ruleNumBg = isDark ? "rgba(232, 165, 0, 0.12)" : "#FFFAED";
  const ruleNumColor = isDark ? "#E8A500" : "#B45309";
  const successBg = isDark ? "rgba(22, 163, 74, 0.1)" : "#F0FDF4";
  const successIconBg = isDark ? "rgba(22, 163, 74, 0.2)" : "#DCFCE7";

  const triggerToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastError(isError);
    setTimeout(() => setToastMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: T.text3 }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Kembali
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-2xl" style={{ backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" }} />
          <div className="h-32 rounded-2xl" style={{ backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" }} />
        </div>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: T.text3 }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Kembali
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy size={48} style={{ color: "#C8922A", opacity: 0.5 }} />
          <p className="mt-4 font-semibold" style={{ color: T.text2, fontFamily: "'Rajdhani', sans-serif", fontSize: 18 }}>Event tidak ditemukan</p>
          <p className="mt-2 text-sm" style={{ color: T.text3 }}>Event mungkin telah berakhir atau tidak tersedia saat ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">

      {/* Toast Notif */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 rounded-xl shadow-lg flex items-center justify-center text-center gap-2 text-sm font-semibold border w-[80vw] max-w-md"
            style={{
              backgroundColor: toastError ? "#DC2626" : "#16A34A",
              color: "white",
              borderColor: toastError ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)",
            }}
          >
            {toastError ? <AlertCircle size={16} className="flex-shrink-0" /> : <Check size={16} className="flex-shrink-0" />}
            <span className="text-xs sm:text-sm">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: T.text3 }}
        onMouseEnter={e => (e.currentTarget.style.color = "#E8A500")}
        onMouseLeave={e => (e.currentTarget.style.color = "")}
      >
        <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Kembali
      </button>

      {/* Hero banner */}
      <motion.div
        className="rounded-2xl overflow-hidden relative shadow-md"
        style={{ background: hero.bg, border: hero.border }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isDark && (
          <div className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(232,165,0,0.18) 0%, transparent 60%)" }} />
        )}

        <div className="p-5 sm:p-6 relative z-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 pr-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold mb-3 border"
                style={{ backgroundColor: hero.badgeBg, color: hero.badgeColor, borderColor: isDark ? "rgba(232,165,0,0.25)" : "rgba(217,119,6,0.2)" }}
              >
                <Flame size={12} /> {ev.status === "Active" ? "EVENT AKTIF" : "UPCOMING"} · {ev.start_date && ev.end_date ? formatEventPeriod(ev.start_date, ev.end_date) : ""}
              </span>

              <h1
                className="break-words"
                style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 5vw, 28px)", color: hero.title, lineHeight: 1.2 }}
              >
                {ev.title}
              </h1>
              {ev.xp_pool > 0 && (
                <p className="font-bold mt-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(28px, 7vw, 40px)", color: "#E8A500", lineHeight: 1.1 }}>
                  {ev.xp_pool.toLocaleString("id-ID")} XP Pool
                </p>
              )}
              <p className="text-sm mt-2" style={{ color: hero.subtitle }}>
                {ev.desc}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: hero.subtitle }}>
                  <Users size={13} /> {leaderboard.length} Peserta
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: hero.subtitle }}>
                  <Calendar size={13} /> {getDaysRemaining()}
                </div>
              </div>
            </div>

            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border flex-shrink-0"
              style={{ backgroundColor: hero.trophyBg, borderColor: hero.trophyBorder }}
            >
              <Trophy size={28} className="sm:hidden" style={{ color: "#C8922A" }} />
              <Trophy size={32} className="hidden sm:block" style={{ color: "#C8922A" }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress & Rewards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5" style={{ borderColor: isDark ? "rgba(232,165,0,0.15)" : T.border }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: sectionLabel }}>Progress Kamu</p>
            <div className="flex items-end gap-2 mb-2">
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 36, color: "#E8A500", lineHeight: 1 }}>
                {myProgress}
              </span>
              <span className="text-sm mb-1" style={{ color: T.text3 }}>/ 50 unit</span>
            </div>
            <XPBar value={Number(myProgress)} max={50} height={8} />
            <p className="text-xs mt-1.5" style={{ color: T.text3 }}>
              {myProgress >= 50 ? "Target tercapai!" : `${50 - myProgress} unit lagi untuk menang`}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5" style={{ borderColor: isDark ? "rgba(232,165,0,0.15)" : T.border }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: sectionLabel }}>Reward</p>
            <div className="space-y-2">
              {[
                { rank: "🥇 Juara 1", prize: "Rp 80.000.000" },
                { rank: "🥈 Juara 2", prize: "Rp 40.000.000" },
                { rank: "🥉 Juara 3", prize: "Rp 20.000.000" },
                { rank: "🏅 Top 5", prize: "+10.000 XP" },
              ].map(r => (
                <div
                  key={r.rank}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                >
                  <span className="text-sm font-medium" style={{ color: T.text1 }}>{r.rank}</span>
                  <span className="font-bold text-sm" style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif" }}>{r.prize}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Rules */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-5">
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: sectionLabel }}>Syarat & Ketentuan</p>
          <div className="space-y-2.5">
            {[
              "Closing unit dihitung dari Approved Commission Claim selama periode event.",
              "Semua tipe properti berlaku: Rumah, Apartemen, Ruko, Tanah, Primary.",
              "Periode event: 16 Juni 2025 – 16 September 2025.",
              "Pemenang diumumkan paling lambat 30 September 2025.",
              "Hadiah ditransfer ke rekening agent maksimal 7 hari kerja setelah pengumuman.",
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border"
                  style={{ backgroundColor: ruleNumBg, borderColor: isDark ? "rgba(232,165,0,0.25)" : "rgba(232,165,0,0.15)" }}
                >
                  <span style={{ fontSize: 10, color: ruleNumColor, fontWeight: 700 }}>{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: T.text2 }}>{r}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Submission */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-5">
          <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: sectionLabel }}>Submission Konten</p>
          <p className="text-sm mb-4" style={{ color: T.text3 }}>
            Submit URL konten promosi kamu (Instagram, TikTok, atau YouTube) untuk mendapat +1.000 XP bonus event.
          </p>

          {submitted ? (
            <motion.div
              className="py-6 text-center rounded-2xl border px-4"
              style={{
                backgroundColor: mySubmission.submission_status === "Rejected"
                  ? (isDark ? "rgba(220,38,38,0.1)" : "#FEF2F2")
                  : mySubmission.submission_status === "Approved"
                    ? (isDark ? "rgba(22,163,74,0.1)" : "#F0FDF4")
                    : successBg,
                borderColor: mySubmission.submission_status === "Rejected"
                  ? (isDark ? "rgba(220,38,38,0.3)" : "#FCA5A5")
                  : mySubmission.submission_status === "Approved"
                    ? (isDark ? "rgba(22,163,74,0.3)" : "#86EFAC")
                    : (isDark ? "rgba(22,163,74,0.25)" : "#BBF7D0")
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  backgroundColor: mySubmission.submission_status === "Rejected"
                    ? (isDark ? "rgba(220,38,38,0.2)" : "#FEE2E2")
                    : mySubmission.submission_status === "Approved"
                      ? (isDark ? "rgba(22,163,74,0.2)" : "#DCFCE7")
                      : successIconBg
                }}
              >
                <Check size={28} style={{
                  color: mySubmission.submission_status === "Rejected"
                    ? "#DC2626"
                    : mySubmission.submission_status === "Approved"
                      ? "#16A34A"
                      : "#16A34A"
                }} />
              </div>
              <p className="font-bold mb-1" style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 18,
                color: mySubmission.submission_status === "Rejected"
                  ? "#DC2626"
                  : mySubmission.submission_status === "Approved"
                    ? "#16A34A"
                    : "#16A34A"
              }}>
                {mySubmission.submission_status === "Rejected"
                  ? "Submission Ditolak"
                  : mySubmission.submission_status === "Approved"
                    ? "Submission Disetujui!"
                    : "Submission Terkirim!"}
              </p>
              <p className="text-sm" style={{ color: T.text3 }}>
                {mySubmission.submission_status === "Rejected"
                  ? `Alasan: ${mySubmission.reject_reason || "Tidak ada alasan spesifik."}`
                  : mySubmission.submission_status === "Approved"
                    ? "Selamat! Bonus XP Anda telah ditambahkan."
                    : "Sedang diverifikasi oleh admin. Kamu akan dapat notifikasi hasilnya."}
              </p>
              {mySubmission.submission_status === "Rejected" && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Kirim Ulang Link Konten
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: T.text1 }}>URL Konten</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: urlFocused ? "#E8A500" : T.text3 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full pl-10 pr-4 rounded-xl border outline-none"
                    style={{
                      height: 48,
                      borderColor: urlFocused ? "#E8A500" : T.border,
                      backgroundColor: T.input,
                      color: T.text1,
                      fontSize: 14,
                      boxShadow: urlFocused ? "0 0 0 3px rgba(232,165,0,0.12)" : "none",
                    }}
                    onFocus={() => setUrlFocused(true)}
                    onBlur={() => setUrlFocused(false)}
                  />
                </div>
                <p className="text-xs mt-1.5 flex items-center gap-1 flex-wrap" style={{ color: T.text3 }}>
                  <span>Platform:</span>
                  {["Instagram", "TikTok", "YouTube"].map(p => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-xs border"
                      style={{ backgroundColor: T.muted, color: T.text2, borderColor: T.border }}
                    >
                      {p}
                    </span>
                  ))}
                </p>
              </div>
              <motion.button
                onClick={async () => {
                  if (!url.trim() || !ev.id || submitting) return;
                  setSubmitting(true);
                  try {
                    await api.events.submit(ev.id, url);
                    setSubmitted(true);
                    triggerToast("Link konten berhasil dikirim! Menunggu verifikasi admin.");
                    loadEventDetail();
                  } catch (err: any) {
                    triggerToast(err?.message || "Gagal mengirim submission", true);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={!url.trim() || submitting}
                className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: url.trim() && !submitting ? "#E8A500" : T.muted,
                  color: url.trim() && !submitting ? "white" : T.text3,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 16,
                  letterSpacing: "0.05em",
                  cursor: url.trim() && !submitting ? "pointer" : "not-allowed",
                }}
                whileHover={url.trim() && !submitting ? { backgroundColor: "#CC9200" } : {}}
                whileTap={url.trim() && !submitting ? { scale: 0.98 } : {}}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    MENGIRIM...
                  </>
                ) : (
                  "SUBMIT KONTEN"
                )}
              </motion.button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Leaderboard mini */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: sectionLabel }}>Top Peserta Saat Ini</p>
          <div className="space-y-2.5">
            {leaderboard.map((a: any, i: number) => {
              const rankNum = i + 1;
              return (
                <motion.div
                  key={a.agent_id || i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{
                    backgroundColor: a.is_me
                      ? (isDark ? "rgba(232,165,0,0.08)" : "#FFFAED")
                      : (isDark ? "rgba(255,255,255,0.03)" : T.card),
                    borderColor: a.is_me ? "rgba(232,165,0,0.35)" : T.border,
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background: rankNum === 1
                        ? "linear-gradient(135deg,#E8A500,#C8922A)"
                        : rankNum === 2
                          ? "#9CA3AF"
                          : rankNum === 3
                            ? "#B87333"
                            : (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"),
                      color: rankNum <= 3 ? "white" : (isDark ? "#C8B89A" : "#6B7280"),
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    {rankNum <= 3 ? (rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : "🥉") : rankNum}
                  </div>
                  <span className="flex-1 text-sm font-semibold" style={{ color: T.text1 }}>{a.name}</span>
                  {a.is_me && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#E8A500", color: "white", fontSize: 10 }}>
                      Kamu
                    </span>
                  )}
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif" }}>
                    {a.units} unit
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
