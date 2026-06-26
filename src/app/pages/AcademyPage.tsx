import { useState, useEffect, useContext } from "react";
import { 
  Award, Play, CheckCircle, ArrowLeft, Download, FileText, 
  ChevronRight, Check, Volume2, Maximize, HelpCircle, Pause, 
  BookOpen, Video, Info, Lock
} from "lucide-react";
import Card from "../components/Card";
import XPBar from "../components/XPBar";
import { T, ThemeCtx, useTheme } from "../types";
import { useTabQuery, useLocation } from "../routes";
import { AcademyPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import EllipsisTooltip from "../components/EllipsisTooltip";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../services/api";

// Rich Mock Dataset for Module Details (representing content loaded from Admin panel)
const COURSE_DETAILS: Record<string, {
  description: string;
  chapters: { id: number; title: string; duration: string; completed: boolean }[];
  materials: { title: string; type: string; size: string }[];
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}> = {
  "Teknik Negosiasi Tingkat Lanjut": {
    description: "Modul ini membahas strategi negosiasi tingkat lanjut untuk menghadapi pembeli premium. Anda akan mempelajari taktik negosiasi win-win, menangani keberatan komisi, membaca bahasa tubuh klien, serta teknik penutupan (closing) dengan diskursus psikologi persuasif.",
    chapters: [
      { id: 1, title: "1. Pengenalan Psikologi Negosiasi Properti", duration: "02:00", completed: true },
      { id: 2, title: "2. Menghadapi Tipe Calon Pembeli Skeptis", duration: "02:00", completed: true },
      { id: 3, title: "3. Taktik Mengatasi Keberatan Komisi Agen", duration: "02:00", completed: false },
      { id: 4, title: "4. Simulasi Negosiasi Kasus Nyata di Lapangan", duration: "02:00", completed: false },
    ],
    materials: [
      { title: "Slide Presentasi Negosiasi Properti.pdf", type: "PDF", size: "4.2 MB" },
      { title: "Cheat Sheet Script Negosiasi Menghadapi Keberatan.docx", type: "DOCX", size: "1.8 MB" }
    ],
    quiz: {
      question: "Ketika calon pembeli bersikeras meminta potongan harga komisi agen sebesar 50% sebelum mengajukan penawaran, apa respons terbaik Anda sebagai agen profesional?",
      options: [
        "Langsung setuju demi mempercepat transaksi closing.",
        "Menolak mentah-mentah dan meninggalkan calon pembeli.",
        "Menjelaskan nilai tambah jasa profesional Anda terlebih dahulu, lalu menegaskan kebijakan komisi standard dengan sopan.",
        "Meminta pembeli membayar komisi langsung secara tunai di bawah tangan."
      ],
      answerIndex: 2,
      explanation: "Respons profesional adalah mempertahankan komisi standar dengan mengedukasi pembeli mengenai cakupan layanan, legalitas transaksi, serta jaminan keamanan transaksi yang Anda fasilitasi."
    }
  },
  "KPR & Pembiayaan Properti": {
    description: "Panduan lengkap mengenai skema Kredit Pemilikan Rumah (KPR), kalkulasi suku bunga bank (flat, float, capping), kriteria kelayakan debitur (BI Checking/SLIK), serta dokumen administratif yang wajib dipersiapkan oleh agen untuk diajukan ke perbankan.",
    chapters: [
      { id: 1, title: "1. Pengenalan Produk KPR & Pembiayaan Perbankan", duration: "02:00", completed: true },
      { id: 2, title: "2. Cara Membaca SLIK OJK & BI Checking Klien", duration: "02:00", completed: true },
      { id: 3, title: "3. Perhitungan Bunga Fixed vs Floating Rate", duration: "02:00", completed: true },
      { id: 4, title: "4. Proses Akad Kredit di Hadapan Notaris", duration: "02:00", completed: true },
    ],
    materials: [
      { title: "Kalkulator Simulasi Cicilan KPR.xlsx", type: "XLSX", size: "2.5 MB" },
      { title: "Daftar Persyaratan Dokumen KPR Bank Mitra.pdf", type: "PDF", size: "850 KB" }
    ],
    quiz: {
      question: "Apa singkatan dari SLIK dalam OJK yang menjadi pintu utama penilaian kelayakan calon debitur KPR?",
      options: [
        "Sistem Layanan Informasi Keuangan",
        "Sistem Laporan Informasi Kredit",
        "Standar Layanan Investasi Kapital",
        "Sistem Lembar Informasi Konsumen"
      ],
      answerIndex: 0,
      explanation: "SLIK adalah Sistem Layanan Informasi Keuangan yang dikelola oleh OJK untuk mencatat riwayat kredit debitur."
    }
  },
  "Strategi Konten Instagram Properti": {
    description: "Pelajari cara memproduksi konten Instagram (Reels & Feed) yang estetik dan berkonversi tinggi. Mulai dari pengambilan video properti menggunakan HP, penulisan copy caption (copywriting), riset hashtag lokal, hingga pemanfaatan ads bertarget.",
    chapters: [
      { id: 1, title: "1. Anatomi Konten Properti Viral di Instagram", duration: "02:00", completed: true },
      { id: 2, title: "2. Teknik Pengambilan Video Properti dengan Smartphone", duration: "02:00", completed: false },
      { id: 3, title: "3. Copywriting Caption Penjualan Properti", duration: "02:00", completed: false },
    ],
    materials: [
      { title: "E-Book Ide Konten Properti 30 Hari.pdf", type: "PDF", size: "6.1 MB" },
      { title: "Template Canva Feed Properti Mewah.pdf", type: "Link Canva", size: "Online" }
    ],
    quiz: {
      question: "Manakah jenis hook (detik pertama) konten Reels yang paling tinggi menarik retensi penonton properti mewah?",
      options: [
        "Halo guys, hari ini saya sedang berada di rumah ini...",
        "Rumah seharga Rp 10 Miliar ini punya pintu rahasia di dalam kamarnya!",
        "Dijual rumah murah meriah berkualitas hubungi nomor saya...",
        "Menampilkan logo kantor agen properti selama 5 detik pertama."
      ],
      answerIndex: 1,
      explanation: "Hook yang menawarkan rasa penasaran atau fitur unik (pintu rahasia, harga fantastis) terbukti meningkatkan retensi video secara signifikan."
    }
  }
};

const getModuleDetail = (title: string) => {
  if (COURSE_DETAILS[title]) return COURSE_DETAILS[title];
  return {
    description: `Modul pelatihan resmi dari LOT Property Academy untuk topik "${title}". Pelajari panduan praktis, materi pendukung, dan tips dari para agen top LOT Property.`,
    chapters: [
      { id: 1, title: "1. Pendahuluan & Pengenalan Materi", duration: "02:00", completed: false },
      { id: 2, title: "2. Strategi Implementasi Lapangan", duration: "02:00", completed: false },
      { id: 3, title: "3. Studi Kasus & Diskusi Kelompok", duration: "02:00", completed: false },
    ],
    materials: [
      { title: `Dokumen Panduan ${title}.pdf`, type: "PDF", size: "1.5 MB" }
    ],
    quiz: {
      question: `Manakah langkah utama dalam mempraktekkan materi pelatihan "${title}"?`,
      options: [
        "Mengabaikan pedoman dan langsung ke lapangan tanpa rencana.",
        "Mengikuti SOP resmi dari LOT Property dan mencatat progres hasil evaluasi berkala.",
        "Menunggu instruksi admin terus-menerus tanpa inisiatif.",
        "Mendelegasikan seluruh pekerjaan ke agen pemula."
      ],
      answerIndex: 1,
      explanation: "Pedoman praktis LOT Property disusun untuk mengoptimalkan efisiensi kerja agen di lapangan dengan standard baku."
    }
  };
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};


const CAT_COLORS: Record<string, string> = {
  "SOP Internal": "#16A34A",
  "Sales Training": "#DC2626",
  "Negotiation": "#C8922A",
  "Social Media": "#7B2FBE",
  "Marketing": "#E8A500",
  "Product Knowledge": "#1A6FC4",
};

export default function AcademyPage() {
  const { isDark, isGuest, onLoginRequest } = useTheme();
  const [cat, setCat] = useTabQuery("cat", "Semua");
  const [remoteIdMap, setRemoteIdMap] = useState<Record<string, number>>({});
  
  // List of courses state
  const [modules, setModules] = useState<any[]>([]);
  const loading = useLoading(isGuest ? 0 : 1300);

  useEffect(() => {
    const load = async () => {
      try {
        const data = isGuest ? await api.public.getAcademyModules() : await api.academy.getModules();
        if (Array.isArray(data) && data.length > 0) {
          const idMap: Record<string, number> = {};
          setModules(data.map((m: any) => {
            const title = m.title || "Modul";
            idMap[title] = Number(m.id);
            return {
              id: Number(m.id),
              title,
              cat: m.category || "Lainnya",
              prog: m.status === "Completed" ? 100 : 0,
              dur: "—",
              xp: 200,
              status: m.status === "Completed" ? "done" : "not_started",
              color: CAT_COLORS[m.category] || "#E8A500",
            };
          }));
          setRemoteIdMap(idMap);
        }
      } catch {}
    };
    load();
  }, [isGuest]);

  if (loading) return <AcademyPageSkeleton />;

  const categories = ["Semua", "SOP Internal", "Sales Training", "Negotiation", "Marketing", "Social Media", "Product Knowledge"];

  // Active module detailed state (null if listing view is active)
  const [activeModule, setActiveModule] = useState<any | null>(null);
  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [activeTab, setActiveTab] = useState<"about" | "materials" | "quiz">("about");
  
  // Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(80);

  // Quiz States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  
  // Feedback alerts
  const [toastMessage, setToastMessage] = useState("");
  const [successConfetti, setSuccessConfetti] = useState(false);

  // Start course player
  const handleStartModule = (m: any) => {
    if (isGuest) { onLoginRequest(); return; }
    const detail = getModuleDetail(m.title);
    setActiveModule(m);
    setActiveDetail(JSON.parse(JSON.stringify(detail))); // clone object to allow in-memory updates
    
    // Pick the first uncompleted chapter or default to chapter 1
    const firstUncompleted = detail.chapters.find(ch => !ch.completed);
    setActiveChapterId(firstUncompleted ? firstUncompleted.id : 1);
    
    // Reset player
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveTab("about");
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(false);
    setSuccessConfetti(false);
  };

  // Video simulation tick
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeModule) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const maxSecs = 120; // 2 minutes demo video limit
          if (prev >= maxSecs) {
            setIsPlaying(false);
            // Mark current chapter as completed
            if (activeDetail) {
              const updatedChapters = activeDetail.chapters.map((ch: any) => 
                ch.id === activeChapterId ? { ...ch, completed: true } : ch
              );
              setActiveDetail({ ...activeDetail, chapters: updatedChapters });
            }
            triggerToast(`Selesai menonton Bab ${activeChapterId}!`);
            return maxSecs;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeChapterId, activeModule, playbackSpeed]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleSelectChapter = (chId: number) => {
    setActiveChapterId(chId);
    setCurrentTime(0);
    setIsPlaying(false);
    triggerToast(`Membuka Bab ${chId}...`);
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (selectedOption === null || !activeDetail) return;
    setQuizSubmitted(true);
    if (selectedOption === activeDetail.quiz.answerIndex) {
      setQuizCorrect(true);
      setSuccessConfetti(true);
      triggerToast("Jawaban Benar! Ujian Modul Lulus!");
    } else {
      setQuizCorrect(false);
      triggerToast("Jawaban belum tepat. Silakan coba lagi!");
    }
  };

  // Finish whole module, add XP
  const handleFinishModule = async () => {
    if (!activeModule) return;
    const moduleId = remoteIdMap[activeModule.title] || activeModule.id;
    let xpEarned = 200;
    try {
      const res = await api.academy.completeModule(moduleId);
      xpEarned = Number(res?.xp_earned || 200);
    } catch {}
    
    setModules(prev => prev.map(m => {
      if (m.title === activeModule.title) return { ...m, prog: 100, status: "done" };
      return m;
    }));
    triggerToast(`Selamat! Modul diselesaikan: +${xpEarned} XP ditambahkan!`);
    
    setTimeout(() => { setActiveModule(null); setActiveDetail(null); }, 1500);
  };

  const completedCount = modules.filter(m => m.status === "done").length;
  const totalXPEarned = completedCount * 200;

  const shown = cat === "Semua" ? modules : modules.filter(m => m.cat === cat);

  return (
    <div className="p-4 lg:p-6 transition-colors duration-300">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#E8A500] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border border-[#E8A500]/20 flex items-center gap-2">
            <Info size={16} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        
        {/* ======================================================== */}
        {/* 1. ACADEMY LISTING VIEW (ACTIVE WHEN NO MODULE SELECTED) */}
        {/* ======================================================== */}
        {!activeModule ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="font-bold text-2xl" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>Academy</h1>
                <p className="text-xs text-muted-foreground" style={{ color: T.text3 }}>Kembangkan karir Anda bersama LOT Property Academy</p>
              </div>
              <div className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-full border" 
                style={{ 
                  backgroundColor: isDark ? "rgba(200,146,42,0.12)" : "#FFFDF5", 
                  borderColor: "rgba(200,146,42,0.3)",
                  color: isDark ? "#FFD666" : "#A66D00",
                  fontWeight: 700 
                }}>
                <Award size={14} className="animate-bounce" /> {completedCount} Modul Selesai — +{totalXPEarned.toLocaleString()} XP
              </div>
            </div>

            {/* Horizontal Scroll Categories */}
            <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-none mb-6 -mx-4 px-4 pb-2" 
              style={{ 
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border"
                  style={{ 
                    backgroundColor: cat === c ? "#E8A500" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), 
                    color: cat === c ? "white" : T.text2, 
                    borderColor: cat === c ? "#E8A500" : T.border,
                    fontFamily: "'Rajdhani', sans-serif"
                  }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shown.map((m, i) => {
                const isCompleted = m.status === "done";
                return (
                  <Card key={i} className="p-5 flex flex-col transition-all hover:scale-[1.01] hover:shadow-md" style={{ borderTop: `3px solid ${m.color}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: `${m.color}15`, color: m.color }}>{m.cat}</span>
                      {isCompleted && <CheckCircle size={16} style={{ color: "#16A34A" }} />}
                    </div>
                    
                    <h3 className="font-bold mb-3 flex-1 text-base text-foreground leading-snug" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {m.title}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5 font-semibold" style={{ color: T.text3 }}>
                        <span>{m.prog}% Selesai</span>
                        <span>{m.dur}</span>
                      </div>
                      <XPBar value={m.prog} max={100} height={5} />
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-dashed" style={{ borderColor: T.border }}>
                      <span className="text-xs font-bold" style={{ color: "#C8922A" }}>+{m.xp} XP</span>
                      
                      <button 
                        onClick={() => handleStartModule(m)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border"
                        style={{
                          backgroundColor: isCompleted 
                            ? (isDark ? "rgba(34,197,94,0.12)" : "#DCFCE7") 
                            : (isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)"),
                          borderColor: isCompleted 
                            ? "rgba(34,197,94,0.3)" 
                            : "rgba(232, 165, 0, 0.35)",
                          color: isCompleted 
                            ? "#16A34A" 
                            : (isDark ? "#FFD666" : "#A66D00"),
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                        onMouseEnter={e => {
                          if (!isCompleted) e.currentTarget.style.backgroundColor = "rgba(232, 165, 0, 0.22)";
                        }}
                        onMouseLeave={e => {
                          if (!isCompleted) e.currentTarget.style.backgroundColor = isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)";
                        }}
                      >
                        {isCompleted ? "✓ Selesai" : m.prog > 0 ? <><Play size={11} /> Lanjutkan</> : <><Play size={11} /> Mulai</>}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          
          // ========================================================
          // 2. ACADEMY MODULE DETAIL PLAYER VIEW (LMS STYLE)
          // ========================================================
          <div className="space-y-4">
            {/* Back to list & Breadcrumb */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <button 
                onClick={() => { setActiveModule(null); setActiveDetail(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border mr-2"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  borderColor: T.border,
                  color: T.text2
                }}
              >
                <ArrowLeft size={13} /> KEMBALI
              </button>
              <span className="text-muted-foreground" style={{ color: T.text3 }}>ACADEMY</span>
              <ChevronRight size={12} className="text-muted-foreground" style={{ color: T.text3 }} />
              <span style={{ color: activeModule.color }}>{activeModule.cat}</span>
              <ChevronRight size={12} className="text-muted-foreground" style={{ color: T.text3 }} />
              <span className="text-foreground" style={{ color: T.text1 }}>{activeModule.title}</span>
            </div>

            {/* Title Block */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display" style={{ color: T.text1 }}>
                  {activeModule.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: `${activeModule.color}15`, color: activeModule.color }}>
                    {activeModule.cat}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold" style={{ color: T.text3 }}>
                    Durasi: {activeModule.dur}
                  </span>
                  <span className="text-xs text-[#C8922A] font-bold">
                    Reward: +{activeModule.xp} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Player Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* LEFT COLUMN: PLAYER & TABS CONTENT */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Embedded Video Player Box */}
                <div className="bg-black rounded-3xl border border-zinc-800 shadow-2xl relative aspect-video overflow-hidden group flex flex-col justify-between">
                  
                  {/* Glowing background animation */}
                  <div className="absolute inset-0 bg-radial-gradient from-zinc-900 via-black to-black z-0" />
                  
                  {/* Simulated video playback visuals */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4 text-center">
                    {isPlaying ? (
                      <div className="space-y-4">
                        {/* Interactive dynamic gradient lines inside screen simulating video */}
                        <div className="flex items-center gap-1.5 justify-center h-16">
                          {[1, 2, 3, 4, 5, 6, 7].map(k => (
                            <motion.span 
                              key={k} 
                              className="w-1.5 rounded-full" 
                              style={{ backgroundColor: activeModule.color }}
                              animate={{ height: [12, 48, 12] }}
                              transition={{ duration: 1.2 + k*0.1, repeat: Infinity, ease: "easeInOut" }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                          Memutar Bab {activeChapterId}...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-[#E8A500]/20 border border-white/20 group-hover:border-[#E8A500]/50 transition-all shadow-xl backdrop-blur-sm pointer-events-auto cursor-pointer"
                          onClick={() => setIsPlaying(true)}>
                          <Play size={26} className="text-white fill-white translate-x-0.5" />
                        </div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                          Klik untuk Memutar Video Pembelajaran
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Watermark / Admin embed indicator */}
                  <div className="absolute top-4 left-4 z-20 bg-black/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg pointer-events-none">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      LOT-ACADEMY EMBED v2.0
                    </p>
                  </div>

                  {/* Top overlay screen info */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900/90 text-white font-bold border border-zinc-800">
                      Chapter {activeChapterId}
                    </span>
                  </div>

                  {/* VIDEO PLAYER CUSTOM CONTROLS OVERLAY */}
                  <div className="relative z-20 mt-auto bg-gradient-to-t from-black via-black/85 to-transparent p-4 pt-10 border-t border-white/5 opacity-90 group-hover:opacity-100 transition-opacity">
                    
                    {/* Progress timeline bar */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] text-zinc-400 font-mono">{formatTime(currentTime)}</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="120" 
                        value={currentTime} 
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E8A500] hover:h-1.5 transition-all"
                        style={{ background: `linear-gradient(to right, #E8A500 ${Math.min((currentTime/120)*100, 100)}%, #27272a ${Math.min((currentTime/120)*100, 100)}%)` }}
                      />
                      <span className="text-[10px] text-zinc-400 font-mono">02:00</span>
                    </div>

                    {/* Button Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-all">
                          {isPlaying ? <Pause size={15} className="fill-white" /> : <Play size={15} className="fill-white" />}
                        </button>
                        
                        <div className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer">
                          <Volume2 size={14} />
                          <span className="text-[10px] font-bold font-mono">80%</span>
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-3.5">
                        {/* Playback speed toggle */}
                        <button 
                          onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                          className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-300 font-bold hover:bg-white/5 transition-all font-mono">
                          {playbackSpeed}x Speed
                        </button>
                        
                        <button className="text-zinc-400 hover:text-white transition-all">
                          <Maximize size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Navigation Tabs below the video */}
                <div className="flex border-b" style={{ borderColor: T.border }}>
                  {[
                    { id: "about", label: "Tentang Modul", icon: Info },
                    { id: "materials", label: "Materi & Link", icon: BookOpen },
                    { id: "quiz", label: "Kuis Kelulusan", icon: HelpCircle }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap"
                        style={{
                          borderColor: isActive ? "#E8A500" : "transparent",
                          color: isActive ? "#E8A500" : T.text3,
                          fontFamily: "'Rajdhani', sans-serif"
                        }}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB WINDOW CONTENT */}
                <div className="py-2">
                  
                  {/* TAB 1: ABOUT DETAILS */}
                  {activeTab === "about" && (
                    <Card className="p-5 border border-border/30 bg-muted/5 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: T.text2, fontFamily: "'Rajdhani', sans-serif" }}>
                          Deskripsi Modul
                        </h4>
                        <p className="text-xs leading-relaxed text-muted-foreground" style={{ color: T.text3 }}>
                          {activeDetail?.description}
                        </p>
                      </div>
                      
                      <div className="border-t pt-4 border-dashed grid grid-cols-2 gap-3" style={{ borderColor: T.border }}>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Instruktur Modul</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5" style={{ color: T.text1 }}>
                            Hendra Wijaya (Sales Trainer Head)
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Level & Syarat</p>
                          <p className="text-xs font-semibold text-foreground mt-0.5" style={{ color: T.text1 }}>
                            Semua Jenjang Karir Agen
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* TAB 2: DOWNLOADABLE FILES */}
                  {activeTab === "materials" && (
                    <Card className="p-5 border border-border/30 bg-muted/5 space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: T.text2, fontFamily: "'Rajdhani', sans-serif" }}>
                        Materi & Dokumen Pendukung
                      </h4>
                      {activeDetail?.materials.map((mat: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-500/10 text-[#E8A500] flex-shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <EllipsisTooltip 
                                text={mat.title} 
                                className="text-xs font-bold leading-tight truncate text-foreground block w-full text-left" 
                                style={{ color: T.text1 }} 
                              />
                              <span className="text-[10px] font-semibold opacity-60 text-muted-foreground" style={{ color: T.text3 }}>
                                {mat.type} · {mat.size}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => triggerToast(`Mengunduh berkas: ${mat.title}...`)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition-all"
                            style={{
                              backgroundColor: isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)",
                              borderColor: "rgba(232, 165, 0, 0.35)",
                              color: isDark ? "#FFD666" : "#A66D00",
                              fontFamily: "'Rajdhani', sans-serif"
                            }}
                          >
                            <Download size={11} /> UNDUH
                          </button>
                        </div>
                      ))}
                    </Card>
                  )}

                  {/* TAB 3: MODULE EVALUATION QUIZ */}
                  {activeTab === "quiz" && (
                    <Card className="p-5 border border-border/30 bg-muted/5 space-y-4">
                      
                      {/* Confetti Celebration banner if completed */}
                      {activeModule.prog === 100 ? (
                        <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                            <CheckCircle size={24} />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-foreground" style={{ color: T.text1 }}>Ujian Kelulusan Telah Lulus</h5>
                            <p className="text-xs text-muted-foreground mt-1" style={{ color: T.text3 }}>
                              Anda telah menjawab dengan benar dan berhak atas penambahan XP modul ini.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-[#E8A500]/10 border border-[#E8A500]/30 text-[#E8A500] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              ?
                            </div>
                            <h4 className="text-xs font-bold leading-relaxed text-foreground mt-0.5" style={{ color: T.text1 }}>
                              {activeDetail?.quiz.question}
                            </h4>
                          </div>

                          {/* Quiz Options list */}
                          <div className="space-y-2 pt-1 pl-9">
                            {activeDetail?.quiz.options.map((opt: string, oIdx: number) => {
                              const isSelected = selectedOption === oIdx;
                              
                              return (
                                <button
                                  key={oIdx}
                                  disabled={quizSubmitted && quizCorrect}
                                  onClick={() => setSelectedOption(oIdx)}
                                  className="w-full p-3 text-left text-xs font-semibold rounded-xl border transition-all flex items-start gap-3"
                                  style={{
                                    borderColor: isSelected ? "#E8A500" : T.border,
                                    backgroundColor: isSelected 
                                      ? (isDark ? "rgba(232,165,0,0.1)" : "#FFFDF5") 
                                      : T.card,
                                    color: isSelected ? "#E8A500" : T.text2,
                                    cursor: quizSubmitted && quizCorrect ? "not-allowed" : "pointer"
                                  }}
                                >
                                  <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0"
                                    style={{ borderColor: isSelected ? "#E8A500" : "var(--border)" }}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="leading-snug">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Quiz Actions */}
                          <div className="pl-9 pt-2 flex flex-col gap-3">
                            {/* Quiz incorrect alert warning */}
                            {quizSubmitted && !quizCorrect && (
                              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed">
                                ❌ Jawaban kurang tepat! Silakan tonton kembali materi di atas dan coba lagi.
                              </div>
                            )}

                            {/* Correct Alert */}
                            {quizSubmitted && quizCorrect && (
                              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs leading-relaxed space-y-1.5">
                                <p className="font-bold">✓ Jawaban Benar!</p>
                                <p className="text-[11px] opacity-90">{activeDetail?.quiz.explanation}</p>
                              </div>
                            )}

                            {/* Buttons */}
                            {!(quizSubmitted && quizCorrect) ? (
                              <button
                                onClick={handleSubmitQuiz}
                                disabled={selectedOption === null}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold border transition-all text-center self-start"
                                style={{
                                  backgroundColor: selectedOption !== null
                                    ? (isDark ? "rgba(232,165,0,0.15)" : "rgba(232,165,0,0.1)")
                                    : "transparent",
                                  borderColor: selectedOption !== null ? "rgba(232,165,0,0.45)" : T.border,
                                  color: selectedOption !== null ? "#E8A500" : T.text3,
                                  cursor: selectedOption !== null ? "pointer" : "not-allowed",
                                  fontFamily: "'Rajdhani', sans-serif"
                                }}
                              >
                                VERIFIKASI UJIAN
                              </button>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>

              {/* ============================================== */}
              {/* RIGHT COLUMN: CHAPTER LIST & PROGRESS TRACKER */}
              {/* ============================================== */}
              <div className="space-y-4">
                
                {/* Curriculum/Chapter Checklist */}
                <Card className="p-5">
                  <h3 className="font-bold text-sm font-display mb-3 tracking-wide" style={{ color: T.text2 }}>
                    Daftar Materi Bab
                  </h3>
                  
                  <div className="space-y-2">
                    {activeDetail?.chapters.map((ch: any) => {
                      const isActive = activeChapterId === ch.id;
                      
                      return (
                        <button
                          key={ch.id}
                          onClick={() => handleSelectChapter(ch.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group"
                          style={{
                            borderColor: isActive ? activeModule.color : T.border,
                            backgroundColor: isActive 
                              ? (isDark ? `${activeModule.color}10` : `${activeModule.color}05`) 
                              : "transparent"
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="flex-shrink-0">
                              {ch.completed ? (
                                <CheckCircle size={15} style={{ color: "#16A34A" }} />
                              ) : (
                                <Video size={14} className="text-zinc-500 group-hover:text-foreground" />
                              )}
                            </span>
                            <EllipsisTooltip 
                              text={ch.title} 
                              className="text-xs font-bold leading-tight truncate text-foreground block w-full text-left" 
                              style={{ color: isActive ? activeModule.color : T.text1 }} 
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-500 font-mono flex-shrink-0">
                            {ch.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Progress summary & Finalize button */}
                <Card className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ color: T.text3 }}>
                      Kemajuan Belajar
                    </h4>
                    
                    {/* Chapter progress calculations */}
                    {activeDetail && (
                      <div className="mt-2.5 space-y-2">
                        <div className="flex justify-between text-xs font-bold" style={{ color: T.text1 }}>
                          <span>
                            {activeDetail.chapters.filter((c: any) => c.completed).length} dari {activeDetail.chapters.length} Bab Selesai
                          </span>
                          <span>
                            {Math.round(
                              (activeDetail.chapters.filter((c: any) => c.completed).length / activeDetail.chapters.length) * 100
                            )}%
                          </span>
                        </div>
                        <XPBar 
                          value={activeDetail.chapters.filter((c: any) => c.completed).length} 
                          max={activeDetail.chapters.length} 
                          height={6} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Complete button activation */}
                  <div className="border-t border-dashed pt-4" style={{ borderColor: T.border }}>
                    {activeModule.prog === 100 ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check size={14} /> MODUL SELESAI
                      </div>
                    ) : (
                      <button
                        disabled={
                          !activeDetail?.chapters.every((c: any) => c.completed) || !quizCorrect
                        }
                        onClick={handleFinishModule}
                        className="w-full py-2.5 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5"
                        style={{
                          backgroundColor: (activeDetail?.chapters.every((c: any) => c.completed) && quizCorrect)
                            ? (isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)")
                            : "transparent",
                          borderColor: (activeDetail?.chapters.every((c: any) => c.completed) && quizCorrect)
                            ? "rgba(34,197,94,0.45)"
                            : T.border,
                          color: (activeDetail?.chapters.every((c: any) => c.completed) && quizCorrect)
                            ? "#16A34A"
                            : T.text3,
                          cursor: (activeDetail?.chapters.every((c: any) => c.completed) && quizCorrect)
                            ? "pointer"
                            : "not-allowed",
                          fontFamily: "'Rajdhani', sans-serif"
                        }}
                      >
                        SELESAIKAN MODUL (+200 XP)
                      </button>
                    )}
                  </div>
                </Card>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
