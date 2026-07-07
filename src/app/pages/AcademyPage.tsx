import { useState, useEffect, useContext, useRef } from "react";
import { 
  Award, Play, CheckCircle, ArrowLeft, ChevronRight, Check,
  BookOpen, Video, Info, Loader2, Maximize, Minimize
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

// Pull a single video ID (any URL form) or a playlist ID from a YouTube URL.
function parseYouTube(url: string): { videoId?: string; list?: string } {
  if (!url) return {};
  const id = url.match(/(?:\/embed\/|[?&]v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (id) return { videoId: id[1] };
  const l = url.match(/[?&]list=([^#&?]+)/);
  return l ? { list: l[1] } : {};
}

// Load the YouTube IFrame Player API once; resolves with window.YT.
let ytApiPromise: Promise<any> | null = null;
function loadYouTubeAPI(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(w.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
  return ytApiPromise;
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
  const [finishing, setFinishing] = useState(false);
  const [activated, setActivated] = useState(false); // false = show thumbnail poster
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const firstVideoIdRef = useRef<string | null>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Overlay click toggles play/pause — blocks native prev/next/logo clicks
  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo(); else p.playVideo();
  };

  // Fullscreen the whole video box (our own button — keeps YT controls/next hidden)
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else videoBoxRef.current?.requestFullscreen?.();
  };
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Feedback alerts
  const [toastMessage, setToastMessage] = useState("");

  // Start course player
  const handleStartModule = (m: any) => {
    if (isGuest) { onLoginRequest(); return; }
    setActiveModule(m);
    setVideoWatched(false);
    setIsPlaying(false);
    setActivated(false); // show thumbnail first; player builds on click
    triggerToast(`Membuka modul: ${m.title}`);
  };

  // Build the player via the official IFrame API — only after the user clicks the
  // thumbnail (so a single click starts playback). Reliable end-detection, and
  // stopVideo() on end prevents the playlist from auto-advancing.
  useEffect(() => {
    const url = activeModule?.video_url;
    if (!url || !activated) return;
    let cancelled = false;
    firstVideoIdRef.current = null;

    loadYouTubeAPI().then((YT: any) => {
      if (cancelled || !playerHostRef.current) return;
      const { videoId, list } = parseYouTube(url);
      const host = document.createElement("div");
      host.className = "w-full h-full";
      playerHostRef.current.appendChild(host);

      // autoplay:1 — the click that activated the player is the required user gesture
      const playerVars: any = { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, fs: 0, disablekb: 1, playsinline: 1 };
      if (!videoId && list) { playerVars.list = list; playerVars.listType = "playlist"; }

      const config: any = {
        width: "100%",
        height: "100%",
        playerVars,
        events: {
          onStateChange: (e: any) => {
            const PS = YT.PlayerState;
            setIsPlaying(e.data === PS.PLAYING);
            const curId = e.target.getVideoData?.().video_id;
            if (!firstVideoIdRef.current && e.data === PS.PLAYING && curId) {
              firstVideoIdRef.current = curId; // remember the intended (first) video
            }
            // Ended, or the playlist silently jumped to a different video → stop + unlock
            const advanced = firstVideoIdRef.current && curId && curId !== firstVideoIdRef.current;
            if (e.data === PS.ENDED || advanced) {
              setVideoWatched(true);
              e.target.stopVideo(); // never play beyond the intended video
            }
          },
        },
      };
      if (videoId) config.videoId = videoId; // omit entirely for playlists — undefined = "Invalid video id"

      playerRef.current = new YT.Player(host, config);
    });

    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
      if (playerHostRef.current) playerHostRef.current.innerHTML = "";
    };
  }, [activeModule?.video_url, activated]);

  if (loading) return <AcademyPageSkeleton />;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Finish whole module, add XP — one successful submit locks it as done
  const handleFinishModule = async () => {
    if (!activeModule || finishing || activeModule.status === "done") return;
    setFinishing(true);
    const moduleId = remoteIdMap[activeModule.title] || activeModule.id;
    let xpEarned = 200;
    try {
      const res = await api.academy.completeModule(moduleId);
      xpEarned = Number(res?.xp_earned || 200);
    } catch {
      setFinishing(false);
      triggerToast("Gagal menyimpan. Coba lagi.");
      return; // keep button clickable so the user can retry
    }

    setModules(prev => prev.map(m =>
      m.title === activeModule.title ? { ...m, prog: 100, status: "done" } : m
    ));
    // Update the open view too, so it flips to "MODUL SELESAI" without leaving the page
    setActiveModule((prev: any) => prev ? { ...prev, prog: 100, status: "done" } : prev);
    setFinishing(false);
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
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-2xl whitespace-nowrap" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>Academy</h1>
                <p className="text-xs text-muted-foreground truncate" style={{ color: T.text3 }}>Kembangkan karir Anda bersama LOT Property Academy</p>
              </div>
              <div className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-full border shrink-0 whitespace-nowrap" 
                style={{ 
                  backgroundColor: isDark ? "rgba(200,146,42,0.12)" : "#FFFDF5", 
                  borderColor: "rgba(200,146,42,0.3)",
                  color: isDark ? "#FFD666" : "#A66D00",
                  fontWeight: 700 
                }}>
                <Award size={14} className="animate-bounce shrink-0" /> {completedCount} Modul Selesai — +{totalXPEarned.toLocaleString()} XP
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
                  const thumbVideoId = m.video_url ? parseYouTube(m.video_url).videoId : undefined;
                  return (
                    <Card key={i} className="p-5 flex flex-col transition-all hover:scale-[1.01] hover:shadow-md">
                      <div className="-mx-5 -mt-5 mb-3.5 aspect-video bg-muted/40 overflow-hidden relative flex items-center justify-center" style={{ borderTop: `3px solid ${m.color}` }}>
                        {thumbVideoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${thumbVideoId}/hqdefault.jpg`}
                            alt={m.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5" style={{ color: T.text3 }}>
                            <Video size={28} />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Tidak ada thumbnail</span>
                          </div>
                        )}
                      </div>

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
                <div ref={videoBoxRef} className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 md:w-[65%] md:mx-auto">
                  {activated ? (
                    <>
                      <div ref={playerHostRef} className="w-full h-full" />
                      {/* Click-catcher: blocks native prev/next/logo, toggles play/pause */}
                      <div
                        className="absolute inset-0 cursor-pointer"
                        onClick={togglePlay}
                        role="button"
                        aria-label={isPlaying ? "Jeda video" : "Putar video"}
                      />
                      {/* Our own fullscreen toggle — keeps native controls/next hidden */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="absolute bottom-2 right-2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                        aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                      >
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                      </button>
                    </>
                  ) : (
                    // Thumbnail poster — one click builds the player and autoplays
                    <button
                      type="button"
                      onClick={() => setActivated(true)}
                      className="absolute inset-0 w-full h-full group"
                      aria-label="Putar video"
                    >
                      {(() => {
                        const { videoId } = parseYouTube(activeModule.video_url);
                        return videoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : null;
                      })()}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
                        <span className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                          <Play size={26} className="text-white ml-1" fill="white" />
                        </span>
                      </span>
                    </button>
                  )}
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
                      disabled={!videoWatched || finishing}
                      className="w-full py-3 rounded-xl text-sm font-bold border transition-all text-center flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: videoWatched ? (isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)") : T.muted,
                        borderColor: videoWatched ? "rgba(34,197,94,0.45)" : T.border,
                        color: videoWatched ? "#16A34A" : T.text3,
                        fontFamily: "'Rajdhani', sans-serif"
                      }}
                    >
                      {finishing ? (
                        <><Loader2 size={16} className="animate-spin" /> MENYIMPAN...</>
                      ) : (
                        <><Award size={16} /> SELESAIKAN MODUL (+{activeModule.xp} XP)</>
                      )}
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
