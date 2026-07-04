import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { 
  Award, Play, CheckCircle, ArrowLeft, ChevronRight, Check, 
  BookOpen, Video, Info
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
import EmptyState from "../components/EmptyState";

// Rich Mock Dataset for Module Details (representing content loaded from Admin panel)

const CAT_COLORS: Record<string, string> = {
  "SOP Internal": "#16A34A",
  "Sales Training": "#DC2626",
  "Negotiation": "#C8922A",
  "Social Media": "#7B2FBE",
  "Marketing": "#E8A500",
  "Product Knowledge": "#1A6FC4",
};

function getEmbedUrl(url: string): string {
  if (!url) return "";

  // Extract the 11-char video ID from any YouTube URL form
  // (/embed/ID, watch?v=ID, youtu.be/ID, ...&v=ID)
  const idMatch = url.match(/(?:\/embed\/|[?&]v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  let embedUrl = "";
  if (idMatch) {
    // Single video, no list param → no prev/next skip buttons
    embedUrl = `https://www.youtube.com/embed/${idMatch[1]}`;
  } else {
    // No single video — fall back to a framable playlist embed
    const listMatch = url.match(/[?&]list=([^#&?]+)/);
    if (listMatch) {
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
    }
  }

  if (!embedUrl) return url;

  // controls=0 disables all player controls (no next/prev/related videos)
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const sep = embedUrl.includes("?") ? "&" : "?";
  return embedUrl + sep + `controls=0&enablejsapi=1&rel=0&autoplay=0&modestbranding=1&showinfo=0&origin=${encodeURIComponent(origin)}`;
}

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
              description: m.description || "",
              video_url: m.video_url || "",
            };
          }));
          setRemoteIdMap(idMap);
        }
      } catch {}
    };
    load();
  }, [isGuest]);

  const categories = ["Semua", "SOP Internal", "Sales Training", "Negotiation", "Marketing", "Social Media", "Product Knowledge"];

  // Active module detailed state (null if listing view is active)
  const [activeModule, setActiveModule] = useState<any | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Register for YouTube player events (required to receive onStateChange)
  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage('{"event":"listening"}', '*');
  };

  // Overlay click toggles play/pause — blocks native prev/next/logo clicks
  const togglePlay = () => {
    const func = isPlaying ? "pauseVideo" : "playVideo";
    iframeRef.current?.contentWindow?.postMessage(`{"event":"command","func":"${func}","args":[]}`, "*");
  };

  // Feedback alerts
  const [toastMessage, setToastMessage] = useState("");

  // Start course player — timer starts immediately as fallback
  const handleStartModule = (m: any) => {
    if (isGuest) { onLoginRequest(); return; }
    setActiveModule(m);
    setVideoWatched(false);
    triggerToast(`Membuka modul: ${m.title}`);
  };

  // Listen for YouTube video end event via postMessage
  const handleVideoMessage = useCallback((e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      // Track play state for the overlay toggle (1 = playing)
      if (data?.event === "onStateChange") {
        setIsPlaying(data.info === 1);
      }
      // YouTube IFrame API: event 0 = ended → unlock + stop video to prevent next/related
      if (data?.event === "onStateChange" && data?.info === 0) {
        setVideoWatched(true);
        // Seek to beginning and pause to prevent related videos / auto-next
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[0]}', '*');
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":[]}', '*');
          }, 200);
        }
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleVideoMessage);
    return () => window.removeEventListener("message", handleVideoMessage);
  }, [handleVideoMessage]);

  if (loading) return <AcademyPageSkeleton />;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
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
            {shown.length > 0 ? (
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
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Tidak Ada Modul Academy"
                description={`Belum ada modul pelatihan yang tersedia untuk kategori "${cat}". Silakan pilih kategori lain atau hubungi Admin.`}
              />
            )}
          </div>
        ) : (
          
          <div className="space-y-4">
            {/* Back to list & Breadcrumb */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <button 
                onClick={() => { setActiveModule(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border mr-2"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderColor: T.border, color: T.text2 }}
              >
                <ArrowLeft size={13} /> KEMBALI
              </button>
              <span className="text-muted-foreground" style={{ color: T.text3 }}>ACADEMY</span>
              <ChevronRight size={12} style={{ color: T.text3 }} />
              <span style={{ color: activeModule.color }}>{activeModule.cat}</span>
              <ChevronRight size={12} style={{ color: T.text3 }} />
              <span style={{ color: T.text1 }}>{activeModule.title}</span>
            </div>

            {/* Module Detail */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold font-display" style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}>
                  {activeModule.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: `${activeModule.color}15`, color: activeModule.color }}>
                    {activeModule.cat}
                  </span>
                  <span className="text-xs font-bold text-[#C8922A]">+{activeModule.xp} XP</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: T.text3 }}>
                {activeModule.description || `Modul pelatihan resmi dari LOT Property Academy. Selesaikan modul ini untuk mendapatkan ${activeModule.xp} XP dan meningkatkan karir Anda sebagai agen profesional.`}
              </p>

              {activeModule.video_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                  <iframe
                    ref={iframeRef}
                    onLoad={handleIframeLoad}
                    src={getEmbedUrl(activeModule.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeModule.title}
                  />
                  {/* Click-catcher: blocks native prev/next/logo, toggles play/pause */}
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={togglePlay}
                    role="button"
                    aria-label={isPlaying ? "Jeda video" : "Putar video"}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Video size={40} className="text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-500 font-semibold">Video belum tersedia</p>
                  </div>
                </div>
              )}

              <div className="border-t border-dashed pt-4" style={{ borderColor: T.border }}>
                {activeModule.status === "done" ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <Check size={14} /> MODUL SELESAI
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleFinishModule}
                      disabled={!videoWatched}
                      className="w-full py-3 rounded-xl text-sm font-bold border transition-all text-center flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: videoWatched ? (isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)") : T.muted,
                        borderColor: videoWatched ? "rgba(34,197,94,0.45)" : T.border,
                        color: videoWatched ? "#16A34A" : T.text3,
                        fontFamily: "'Rajdhani', sans-serif"
                      }}
                    >
                      <Award size={16} /> SELESAIKAN MODUL (+{activeModule.xp} XP)
                    </button>
                    {!videoWatched && (
                      <p className="text-xs" style={{ color: T.text3 }}>
                        ⏳ Tonton video sampai selesai untuk membuka tombol
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
