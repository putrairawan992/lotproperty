import { useState, useContext, useEffect, useRef } from "react";
import { Calendar, DollarSign, Target, Check, ChevronRight, X, Camera, Send, QrCode } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import * as THREE from "three";
import Card from "../components/Card";
import LevelBadge from "../components/LevelBadge";
import XPBar from "../components/XPBar";
import { QuestPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T, Page, ThemeCtx } from "../types";
import { BADGE_ASSETS, RARITY_CFG } from "../badgeAssets";
import { useLocation } from "../routes";
import petiHartaKarun from "../../imports/peti-harta-karun.png";

const TreasureChestIcon = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 10s3-3 10-3 10 3 10 3" />
    <path d="M2 10h20" />
    <path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
    <rect x="10.5" y="10" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

function Quest3DCoins({ isDark }: { isDark: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 150;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xffaa00, 1.5);
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.09, 24);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.12,
    });

    // Detailed open chest texture plane geometry
    const textureLoader = new THREE.TextureLoader();
    const chestTex = textureLoader.load(petiHartaKarun);
    const chestGeo = new THREE.PlaneGeometry(2.0, 2.0);
    const chestMat = new THREE.MeshBasicMaterial({
      map: chestTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const items: THREE.Object3D[] = [];

    // Item 1: Large Chest (Right)
    const chest1 = new THREE.Mesh(chestGeo, chestMat);
    chest1.position.set(2.3, 0.15, 0);
    chest1.scale.set(1.9, 1.9, 1.9);
    chest1.rotation.y = -Math.PI / 12;
    scene.add(chest1);
    items.push(chest1);

    // Item 2: Medium Chest (Left)
    const chest2 = new THREE.Mesh(chestGeo, chestMat);
    chest2.position.set(-2.4, -0.2, -0.4);
    chest2.scale.set(1.4, 1.4, 1.4);
    chest2.rotation.y = Math.PI / 12;
    scene.add(chest2);
    items.push(chest2);

    // Item 3: Golden Coin (Center Right Bottom)
    const coin1 = new THREE.Mesh(coinGeo, goldMat);
    coin1.position.set(1.4, -0.4, -0.6);
    coin1.rotation.x = Math.PI / 4;
    coin1.rotation.y = Math.PI / 6;
    scene.add(coin1);
    items.push(coin1);

    const particleCount = 25;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      velocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() * 0.012) + 0.006,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      items.forEach((item, idx) => {
        if (idx === 2) {
          // Coin: rotate dynamically on multiple axes
          item.rotation.x += 0.015;
          item.rotation.y += 0.025;
          item.position.y = -0.4 + Math.sin(Date.now() * 0.002) * 0.06;
        } else {
          // Chest plane: larger swaying, tilting and floating bobbing
          const time = Date.now() * 0.0016 + idx * 1.5;
          
          // Swaying rotation on Y-axis (left-right)
          item.rotation.y = (idx === 0 ? -Math.PI / 12 : Math.PI / 12) + Math.sin(time) * 0.28;
          // Side-to-side tilt on Z-axis
          item.rotation.z = Math.cos(time * 0.8) * 0.12;
          // Forward-backward tilt on X-axis
          item.rotation.x = Math.sin(time * 0.5) * 0.15;
          
          // Organic bobbing up and down
          const baseHeight = idx === 0 ? 0.15 : -0.2;
          item.position.y = baseHeight + Math.sin(time * 0.7) * 0.24;
        }
      });

      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let px = posAttr.getX(i) + velocities[i].x;
        let py = posAttr.getY(i) + velocities[i].y;
        let pz = posAttr.getZ(i) + velocities[i].z;

        if (py > 2) {
          py = -2;
          px = (Math.random() - 0.5) * 8;
        }

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = container.clientWidth || 400;
      height = container.clientHeight || 150;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      coinGeo.dispose();
      chestGeo.dispose();
      chestMat.dispose();
      chestTex.dispose();
      goldMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90" />
  );
}


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

  // 3D Card Tilt Motion Values and Springs
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-80, 80], [10, -10]), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [-250, 250], [-10, 10]), { damping: 20, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoUrl, setPromoUrl] = useState("");

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
      setShowPromoModal(true);
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

  const handlePromoSubmit = () => {
    if (!promoUrl.trim()) return;
    setDailyQuests(prev => prev.map(q => {
      if (q.id === "listing_promo") {
        const nextProgress = Math.min(q.progress + 1, q.total);
        return { ...q, progress: nextProgress, done: nextProgress >= q.total };
      }
      return q;
    }));
    setShowPromoModal(false);
    setPromoUrl("");
    triggerToast("Link promosi listing berhasil disubmit! +100 XP ditambahkan.");
  };

  function QuestRow({ q, accent }: { q: any; accent: string }) {
    const isPending = q.id === "new_recruit" && q.status === "pending";
    const isDone = q.done || q.progress >= q.total;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b last:border-0" style={{ borderColor: T.border }}>
        {/* Top/Left Row: Icon + Title & XP */}
        <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
            <Target size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight text-foreground" style={{ color: isDone ? T.text3 : T.text1 }}>{q.name}</p>
            {q.note && <p className="text-[11px] mt-0.5 sm:hidden" style={{ color: T.text3 }}>{q.note}</p>}
          </div>
          <span className="text-xs font-bold sm:hidden flex-shrink-0 text-right" style={{ color: "#C8922A" }}>+{q.xp.toLocaleString()} XP</span>
        </div>

        {/* Middle/Bottom Row: Progress Bar & desktop Note */}
        <div className="w-full sm:flex-1 min-w-0 pl-11 pr-2 sm:pl-0 sm:pr-0">
          <div className="flex items-center gap-2">
            <div className="flex-1"><XPBar value={q.progress} max={q.total} height={4} /></div>
            <span className="text-xs whitespace-nowrap" style={{ color: T.text3 }}>{q.progress}/{q.total}</span>
          </div>
          {q.note && <p className="text-xs mt-0.5 hidden sm:block" style={{ color: T.text3 }}>{q.note}</p>}
        </div>

        {/* Right/Bottom Action: XP & Go Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed pl-11 sm:pl-0" style={{ borderColor: T.border }}>
          <span className="text-xs font-bold hidden sm:inline flex-shrink-0" style={{ color: "#C8922A" }}>+{q.xp.toLocaleString()} XP</span>
          <span className="text-xs font-semibold sm:hidden flex-shrink-0" style={{ color: T.text3 }}>Reward: <strong style={{ color: "#C8922A" }}>+{q.xp.toLocaleString()} XP</strong></span>
          
          {isDone ? (
            <div className="w-16 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "#DCFCE7", borderColor: "rgba(34,197,94,0.2)" }}>
              <Check size={14} style={{ color: "#16A34A" }} />
            </div>
          ) : isPending ? (
            <span className="w-16 h-8 rounded-xl text-xs font-bold flex items-center justify-center flex-shrink-0 border text-center" style={{ backgroundColor: isDark ? "rgba(217,119,6,0.1)" : "#FEF3C7", color: "#D97706", borderColor: "rgba(217,119,6,0.2)", fontFamily: "'Rajdhani',sans-serif" }}>
              Pending
            </span>
          ) : (
            <button onClick={() => handleGo(q)} className="w-16 h-8 rounded-xl text-xs font-bold flex-shrink-0 transition-all flex items-center justify-center border"
              style={{
                backgroundColor: isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)",
                borderColor: "rgba(232, 165, 0, 0.35)",
                color: isDark ? "#FFD666" : "#A66D00",
                fontFamily: "'Rajdhani', sans-serif"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(232, 165, 0, 0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)";
              }}
            >
              Go
            </button>
          )}
        </div>
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
      <motion.div
        className="relative overflow-hidden p-5 rounded-2xl border"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
          background: isDark
            ? "linear-gradient(135deg, rgba(30, 16, 4, 0.95) 0%, rgba(15, 8, 2, 0.98) 100%)"
            : "linear-gradient(135deg, #FFFDF5 0%, #FFF9E6 100%)",
          borderColor: "rgba(232, 165, 0, 0.35)",
          boxShadow: isDark
            ? "0 8px 32px rgba(232, 165, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "0 8px 32px rgba(232, 165, 0, 0.06)",
        }}
      >
        {/* 3D WebGL Coins Background */}
        <Quest3DCoins isDark={isDark} />

        {/* Decorative glowing orbs */}
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-[#E8A500]/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-[#E8A500]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-between" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
          <div className="flex items-center gap-4" style={{ transformStyle: "preserve-3d" }}>
            <div className="text-left" style={{ transform: "translateZ(25px)" }}>
              <h3 className="font-bold text-base leading-tight uppercase tracking-wider text-gradient-gold"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Claim Commission
              </h3>
              <p className="text-xs mt-1" style={{ color: T.text3 }}>
                Submit bukti transaksi closing untuk verifikasi komisi & bonus XP
              </p>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: "#D97706" }}>
                Terakhir disetujui: Rp 12.500.000 · 14 Jun 2025
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              window.open("https://docs.google.com/forms/d/e/1FAIpQLSfDCE255_yY7oQ4uO2X3jW9h38bH5jY8KjYtL7_Zg/viewform", "_blank");
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-all text-xs tracking-wider uppercase whitespace-nowrap border"
            style={{
              backgroundColor: isDark ? "rgba(232, 165, 0, 0.12)" : "rgba(232, 165, 0, 0.08)",
              borderColor: "rgba(232, 165, 0, 0.45)",
              color: isDark ? "#FFD666" : "#A66D00",
              boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.2)" : "0 4px 12px rgba(232, 165, 0, 0.05)",
              backdropFilter: "blur(4px)",
              fontFamily: "'Rajdhani', sans-serif",
              transform: "translateZ(30px)"
            }}
          >
            CLAIM COMMISSION
          </motion.button>
        </div>
      </motion.div>

      {/* Daily Quest */}
      <Card style={{ borderLeft: "4px solid #16A34A" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b flex-wrap sm:flex-nowrap gap-2" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(22,163,74,0.1)" : "#DCFCE715" }}>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base" style={{ fontFamily: "'Rajdhani',sans-serif", color: "#16A34A" }}>Daily Quest</h3>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: T.text3 }}>Direset setiap hari pukul 00:00 WIB</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-bold flex items-center gap-1"
              style={{
                backgroundColor: isDark ? "rgba(22,163,74,0.2)" : "#DCFCE7",
                color: "#16A34A",
                border: "1px solid rgba(22,163,74,0.3)"
              }}>
              🔥 14 Hari
            </span>
            {BADGE_ASSETS["Dedicated Agent"] && <img src={BADGE_ASSETS["Dedicated Agent"]} alt="Dedicated Agent" className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0" />}
          </div>
        </div>
        {dailyQuests.map((q, i) => <QuestRow key={i} q={q} accent="#16A34A" />)}
      </Card>

      {/* Weekly Quest */}
      <Card style={{ borderLeft: "4px solid #7B2FBE" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b flex-wrap sm:flex-nowrap gap-2" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(123,47,190,0.1)" : "#F3EAFD15" }}>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base" style={{ fontFamily: "'Rajdhani',sans-serif", color: "#7B2FBE" }}>Weekly Quest</h3>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: T.text3 }}>Pembaruan mingguan untuk target listing & prospek</p>
          </div>
          <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap font-bold flex-shrink-0"
            style={{
              backgroundColor: isDark ? "rgba(123,47,190,0.2)" : "#F3EAFD",
              color: "#7B2FBE",
              border: "1px solid rgba(123,47,190,0.3)"
            }}>
            Reset Senin
          </span>
        </div>
        {weeklyQuests.map((q, i) => <QuestRow key={i} q={q} accent="#7B2FBE" />)}
      </Card>

      {/* Skill Quest */}
      <Card style={{ borderLeft: "4px solid #1A6FC4" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b flex-wrap sm:flex-nowrap gap-2" style={{ borderColor: T.border, backgroundColor: isDark ? "rgba(26,111,196,0.1)" : "#DBEAFE15" }}>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base" style={{ fontFamily: "'Rajdhani',sans-serif", color: "#1A6FC4" }}>Skill Quest</h3>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: T.text3 }}>Meningkatkan keahlian berkarir dan rekrutmen aktif</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {["The Leader", "The Professor"].map(n => BADGE_ASSETS[n] && (
              <img key={n} src={BADGE_ASSETS[n]} alt={n} className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 object-contain flex-shrink-0" />
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

      {/* ── MODAL: LISTING PROMOTION LINK ── */}
      <AnimatePresence>
        {showPromoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPromoModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Listing Promotion</h3>
                <button onClick={() => setShowPromoModal(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs" style={{ color: T.text3 }}>
                  Pilih portal properti atau media sosial di bawah ini untuk mempromosikan listing Anda, kemudian submit link postingan promosi Anda untuk klaim <strong style={{ color: "#E8A500" }}>+100 XP</strong>.
                </p>

                {/* Platforms Grid list */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "Rumah123", url: "https://www.rumah123.com", color: "#0A2540", bg: "#EEF2F6" },
                    { name: "OLX Indonesia", url: "https://www.olx.co.id", color: "#002F34", bg: "#E6F7F8" },
                    { name: "Lamudi", url: "https://www.lamudi.co.id", color: "#006C35", bg: "#EBF6F0" },
                    { name: "Threads", url: "https://www.threads.net", color: "#000000", bg: "#F3F4F6" },
                    { name: "Facebook", url: "https://www.facebook.com", color: "#1877F2", bg: "#E7F3FF" },
                    { name: "Instagram", url: "https://www.instagram.com", color: "#E1306C", bg: "#FFF0F5" }
                  ].map(platform => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] hover:shadow-sm"
                      style={{
                        borderColor: T.border,
                        color: isDark ? "#ffffff" : platform.color,
                        backgroundColor: isDark ? "rgba(255,255,255,0.03)" : platform.bg,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platform.color }} />
                      {platform.name}
                      <ChevronRight size={12} className="ml-auto opacity-45" />
                    </a>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>URL Postingan Promosi</label>
                  <input type="url" placeholder="https://www.olx.co.id/item/..." value={promoUrl} onChange={e => setPromoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none" style={{ borderColor: T.border, color: T.text1, backgroundColor: T.card }} />
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-2 justify-end bg-muted/10" style={{ borderColor: T.border }}>
                <button onClick={() => setShowPromoModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ color: T.text3 }}>Batal</button>
                <button onClick={handlePromoSubmit} disabled={!promoUrl.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all text-white"
                  style={{ backgroundColor: promoUrl.trim() ? "#E8A500" : "var(--border)", cursor: promoUrl.trim() ? "pointer" : "not-allowed" }}>
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
