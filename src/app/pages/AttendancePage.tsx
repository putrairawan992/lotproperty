import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";
import { T, useTheme } from "../types";
import AgentAvatar from "../components/AgentAvatar";
import EllipsisTooltip from "../components/EllipsisTooltip";
import QrCameraScanner from "../components/QrCameraScanner";
import { api } from "../services/api";

function QRCodeDisplay({ value }: { value: string }) {
  // 21x21 grid — hardcoded realistic QR pattern
  const grid = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,1,0,1,1,1,0,1,1,0,1],
    [0,1,1,0,1,0,0,0,1,0,0,1,1,0,0,1,0,0,1,1,0],
    [1,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1],
    [0,0,1,1,0,0,0,0,1,1,1,0,0,1,1,0,1,0,1,0,0],
    [1,0,0,0,1,1,1,1,0,0,1,1,0,1,0,1,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,0,1,0,0,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,1,0,1,1,0,1,0,1],
  ];
  const cell = 10;
  const size = 21 * cell + 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <rect width={size} height={size} fill="white" rx="12"/>
      {grid.map((row, r) =>
        row.map((v, c) =>
          v ? <rect key={`${r}-${c}`} x={4 + c * cell} y={4 + r * cell} width={cell - 1} height={cell - 1} fill="#1A1A1A" rx="1.5"/> : null
        )
      )}
      <text x={size / 2} y={size - 6} textAnchor="middle" fontSize="6" fill="#6B7280">{value.slice(0, 24)}</text>
    </svg>
  );
}

export function ThreeJsCheckmark() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 256;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffd700, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffa500, 2, 8);
    pointLight.position.set(0, 0, 1.5);
    scene.add(pointLight);

    const shape = new THREE.Shape();
    shape.moveTo(-0.55, -0.05);
    shape.lineTo(-0.2, -0.4);
    shape.lineTo(0.55, 0.35);
    shape.lineTo(0.4, 0.5);
    shape.lineTo(-0.2, -0.1);
    shape.lineTo(-0.4, 0.1);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0xE8A500,
      metalness: 0.95,
      roughness: 0.06,
    });

    const checkmark = new THREE.Mesh(geometry, material);
    scene.add(checkmark);

    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

      velocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: Math.random() * 0.008 + 0.003,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      checkmark.rotation.y = elapsedTime * 1.6;
      checkmark.rotation.x = Math.sin(elapsedTime * 1.2) * 0.12;
      checkmark.position.y = Math.sin(elapsedTime * 2.2) * 0.08;

      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);

        x += velocities[i].x;
        y += velocities[i].y;
        z += velocities[i].z;

        if (y > 1.8) {
          y = -1.8;
          x = (Math.random() - 0.5) * 4;
        }

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;

      particles.rotation.y = elapsedTime * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-56 md:h-64 cursor-pointer" />;
}

const DAY_NAMES = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export default function AttendancePage() {
  const now = new Date();
  const today = now.getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const [activeTab, setActiveTab] = useState<"checkin"|"qr"|"scan"|"meeting">("checkin");
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set());
  const [checkedToday, setCheckedToday] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [showThreeJsPopup, setShowThreeJsPopup] = useState(false);
  const [meetingUrl, setMeetingUrl]     = useState("");
  const [scanDone, setScanDone]         = useState(false);
  const [manualCode, setManualCode]     = useState("");
  const [cameraRequested, setCameraRequested] = useState(false);
  const [streak, setStreak] = useState(0);
  const [monthlyPresent, setMonthlyPresent] = useState(0);
  const [qrCode, setQrCode] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [agentTitle, setAgentTitle] = useState("Agent");
  const [agentLevel, setAgentLevel] = useState(1);
  const [agentPhoto, setAgentPhoto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEarnedXP, setLastEarnedXP] = useState(100);
  const [toastMsg, setToastMsg] = useState("");
  const { isDark, isGuest, onLoginRequest } = useTheme();

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  useEffect(() => {
    if (isGuest) {
      setCheckedDays(new Set([1, 2, 4, 5, 8, 9, 12, 13, 14, 15]));
      setCheckedToday(false);
      setStreak(5);
      setMonthlyPresent(10);
      setQrCode("GUEST-QR-1234");
      setAgentName("Guest Agent");
      setAgentTitle("Rookie Agent");
      setAgentLevel(1);
      setAgentPhoto("");
      return;
    }
    const loadStatus = async () => {
      try {
        const res = await api.attendance.getStatus();
        const days = Array.isArray(res?.checked_days) ? res.checked_days : [];
        setCheckedDays(new Set(days.map((d: any) => Number(d)).filter((d: number) => !Number.isNaN(d))));
        setCheckedToday(Boolean(res?.checked_today));
        setStreak(Number(res?.streak || 0));
        setMonthlyPresent(Number(res?.monthly_present || 0));
        setQrCode(String(res?.qr_code || ""));
        setAgentName(String(res?.agent?.name || "Agent"));
        setAgentTitle(String(res?.agent?.title || "Agent"));
        setAgentLevel(Number(res?.agent?.level || 1));
        setAgentPhoto(String(res?.agent?.photo_url || ""));
        setToastMsg("");
      } catch (error) {
        setToastMsg(error instanceof Error ? error.message : "Gagal memuat status attendance");
      }
    };

    loadStatus();
  }, [isGuest]);

  useEffect(() => {
    if (activeTab !== "scan") {
      setCameraRequested(false);
    }
  }, [activeTab]);

  const markSuccess = (xpEarned: number, newStreak?: number) => {
    setCheckedDays(prev => new Set([...prev, today]));
    setCheckedToday(true);
    setLastEarnedXP(xpEarned);
    if (typeof newStreak === "number") {
      setStreak(newStreak);
    }
    setMonthlyPresent(prev => Math.max(prev, checkedToday ? prev : prev + 1));
    setShowThreeJsPopup(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const submitAttendance = async (kind: "checkin" | "qr" | "scan" | "meeting", value?: string) => {
    if (isGuest) {
      onLoginRequest();
      return false;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setToastMsg("");
    try {
      let res: any;
      if (kind === "checkin") {
        res = await api.attendance.checkIn();
      } else if (kind === "qr") {
        res = await api.attendance.submitQr(String(value || ""));
      } else if (kind === "scan") {
        res = await api.attendance.submitScan(String(value || ""));
      } else {
        res = await api.attendance.joinMeeting(String(value || ""));
      }

      const xpEarned = Number(res?.xp_earned || 0);
      const newStreak = Number(res?.streak || streak);
      markSuccess(xpEarned, newStreak);
      return true;
    } catch (error) {
      setToastMsg(error instanceof Error ? error.message : "Gagal mengirim attendance");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    await submitAttendance("checkin");
  };

  const handleQrScan = async (data: string) => {
    if (scanDone) return;
    const ok = await submitAttendance("scan", data || qrCode || "scan-camera");
    if (!ok) return;
    setScanDone(true);
    setCameraRequested(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || scanDone) return;
    const ok = await submitAttendance("scan", manualCode.trim());
    if (!ok) return;
    setScanDone(true);
    setCameraRequested(false);
  };

  const handleScanAgain = () => {
    setScanDone(false);
    setCameraRequested(false);
    setManualCode("");
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getDayStyle = (day: number | null) => {
    if (!day) return {};
    const isChecked = checkedDays.has(day) || (day === today && checkedToday);
    const isToday   = day === today;
    const isMissed  = day < today && !checkedDays.has(day);
    if (isToday && isChecked) return { backgroundColor: "#E8A500",  color: "white", fontWeight: 700 };
    if (isToday)              return { backgroundColor: "#FFFAED",  color: "#E8A500", fontWeight: 700, border: "2px solid #E8A500" };
    if (isChecked)            return { backgroundColor: "#DCFCE7",  color: "#16A34A", fontWeight: 600 };
    if (isMissed)             return { backgroundColor: "#FEE2E2",  color: "#DC2626" };
    return { backgroundColor: T.muted, color: T.text3 };
  };

  const tabs = [
    { id: "checkin", label: "Check-In",    icon: "📍" },
    { id: "qr",      label: "QR Code",     icon: "🔲" },
    { id: "scan",    label: "Scan QR",     icon: "📷" },
    { id: "meeting", label: "Join Meeting",icon: "🎥" },
  ] as const;

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>Absensi & Kehadiran</h1>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            className="fixed top-20 left-1/2 z-[90] px-5 py-3.5 rounded-2xl bg-[#DC2626] text-white shadow-xl flex items-center gap-2.5 text-sm font-semibold border border-red-500/30 max-w-sm w-[90vw]"
          >
            <span className="text-base">⚠️</span>
            <span className="flex-1 text-xs sm:text-sm">{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="p-0.5 rounded hover:bg-white/10">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Streak", value: `${streak} Hari`, icon: "🔥", color: "#E8A500", bg: "#FFFAED" },
          { label: "Hadir",  value: `${monthlyPresent} Hari`, icon: "✅", color: "#16A34A", bg: "#F0FDF4" },
          { label: "XP Login", value: `${monthlyPresent * 100}`, icon: "⚡", color: "#7B2FBE", bg: "#F5F0FD" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border p-3 text-center" style={{ borderColor: T.border }}>
            <div className="text-lg mb-0.5">{s.icon}</div>
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.text3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: T.muted }}>
        {tabs.map(t => (
          <motion.button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            animate={{
              backgroundColor: activeTab === t.id ? "#ffffff" : "rgba(0,0,0,0)",
              color: activeTab === t.id ? "#E8A500" : "#6B7280",
              boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.18 }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span className="hidden sm:block leading-none">{t.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── TAB: CHECK-IN ── */}
        {activeTab === "checkin" && (
          <motion.div key="checkin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <AnimatePresence mode="wait">
              {!checkedToday ? (
                <motion.button key="btn" onClick={handleCheckIn}
                  className="w-full rounded-2xl font-bold relative overflow-hidden"
                  style={{ height: 64, background: "linear-gradient(135deg,#E8A500,#C8922A)", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: "0.05em" }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSubmitting}>
                  {isSubmitting ? "MEMPROSES..." : "📍 ABSENSI SEKARANG"}
                </motion.button>
              ) : (
                <motion.div key="done"
                  className="w-full rounded-2xl flex items-center justify-center gap-3 font-bold"
                  style={{ height: 64, backgroundColor: "#F0FDF4", color: "#16A34A", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, border: "2px solid #86EFAC" }}
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 250 }}>
                  <Check size={24} /> Sudah Absen Hari Ini ✨
				</motion.div>
              )}
            </AnimatePresence>

            {/* Calendar */}
            <div className="bg-card rounded-2xl border p-4" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: T.text1 }}>
                  {now.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-2">
                  {[{ c:"#16A34A", bg:"#DCFCE7", l:"Hadir" }, { c:"#DC2626", bg:"#FEE2E2", l:"Absen" }, { c:"#E8A500", bg:"#FFFAED", l:"Hari ini" }].map(l => (
                    <div key={l.l} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.bg, border: `1px solid ${l.c}40` }} />
                      <span style={{ fontSize: 10, color: T.text3 }}>{l.l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-7 mb-1.5">
                {DAY_NAMES.map(d => <div key={d} className="text-center" style={{ fontSize: 10, fontWeight: 600, color: T.text3, padding: "4px 0" }}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  const style = getDayStyle(day);
                  const isChecked = day ? (checkedDays.has(day) || (day === today && checkedToday)) : false;
                  return (
                    <div key={i} className="aspect-square rounded-xl flex items-center justify-center relative" style={{ fontSize: 12, ...style }}>
                      {day && (
                        <>
                          <span>{day}</span>
                          {isChecked && <div className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: "#16A34A" }} />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent log */}
            <div className="bg-card rounded-2xl border p-4" style={{ borderColor: T.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: T.text3 }}>7 HARI TERAKHIR</p>
              <div className="space-y-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = today - i;
                  const isChecked = day > 0 && (checkedDays.has(day) || (day === today && checkedToday));
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isChecked ? "#DCFCE7" : "#FEE2E2" }}>
                        {isChecked ? <Check size={13} style={{ color: "#16A34A" }} /> : <X size={13} style={{ color: "#DC2626" }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: T.text1 }}>
                          {i === 0 ? "Hari ini" : i === 1 ? "Kemarin" : `${i} hari lalu`} · {day} {now.toLocaleString("id-ID", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {isChecked && <span className="text-xs font-bold" style={{ color: "#C8922A" }}>+100 XP</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: QR CODE ── */}
        {activeTab === "qr" && (
          <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-card rounded-2xl border p-6 flex flex-col items-center gap-4" style={{ borderColor: T.border }}>
              <p className="text-sm font-medium" style={{ color: T.text3 }}>QR Code Absensi Kamu</p>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: T.muted, border: "2px solid #E5E7EB" }}>
                <QRCodeDisplay value={qrCode || `LOT-AGENT-${today}`} />
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <AgentAvatar src={agentPhoto} name={agentName} size={48} />
                </div>
                <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>{agentName}</p>
                <p className="text-xs" style={{ color: T.text3 }}>QR: {qrCode || "-"} · {agentTitle} Lv {agentLevel}</p>
              </div>
              <div className="w-full p-3 rounded-xl text-center text-sm font-semibold" style={{ backgroundColor: "var(--accent)", color: "#E8A500" }}>
                Tunjukkan QR ini ke admin / scanner di lokasi event
              </div>
              <motion.button
                onClick={() => submitAttendance("qr", qrCode || `LOT-AGENT-${today}`)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: T.muted, color: T.text2, fontFamily: "'Rajdhani', sans-serif", fontSize: 15 }}
                whileTap={{ scale: 0.97 }}>
                {isSubmitting ? "Memproses..." : "✅ Klaim Attendance via QR"}
              </motion.button>
            </div>
            <div className="bg-card rounded-2xl border p-4" style={{ borderColor: T.border }}>
              <p className="text-xs font-semibold mb-2" style={{ color: T.text3 }}>CARA PENGGUNAAN</p>
              <div className="space-y-2.5">
                {[
                  { step: "1", text: "Tunjukkan QR code di atas kepada admin atau scanner di lokasi." },
                  { step: "2", text: "Admin scan QR code untuk mencatat kehadiran kamu." },
                  { step: "3", text: "Kehadiran otomatis tercatat dan +100 XP ditambahkan." },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-white"
                      style={{ backgroundColor: "#E8A500", fontSize: 10 }}>{s.step}</div>
                    <p className="text-sm" style={{ color: T.text2 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: SCAN QR ── */}
        {activeTab === "scan" && (
          <motion.div key="scan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {!scanDone ? (
              <div className="bg-card rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                <QrCameraScanner
                  onScan={handleQrScan}
                  active={cameraRequested && !scanDone}
                />
                <div className="p-4 space-y-3">
                  {!cameraRequested && (
                    <motion.button
                      className="w-full py-3 rounded-xl font-bold"
                      style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.04em" }}
                      whileHover={{ backgroundColor: "#CC9200" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCameraRequested(true)}
                    >
                      📷 IZINKAN KAMERA
                    </motion.button>
                  )}
                  <p className="text-center text-xs" style={{ color: T.text3 }}>Atau masukkan kode event secara manual</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode event..."
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm bg-card"
                      style={{ borderColor: T.border, color: T.text1 }}
                    />
                    <motion.button
                      className="px-4 py-2 rounded-xl font-bold text-sm"
                      style={{ backgroundColor: T.muted, color: T.text2, fontFamily: "'Rajdhani', sans-serif" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleManualSubmit}
                      disabled={!manualCode.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Mengirim..." : "Submit"}
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div className="bg-card rounded-2xl border p-8 flex flex-col items-center gap-4" style={{ borderColor: T.border }}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#DCFCE7" }}>
                  <Check size={36} style={{ color: "#16A34A" }} />
                </div>
                <div className="text-center">
                  <p className="font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, color: "#16A34A" }}>QR Berhasil Discan!</p>
                  <p className="text-sm" style={{ color: T.text3 }}>Kehadiran kamu berhasil dicatat.</p>
                </div>
                <div className="w-full p-3 rounded-xl text-center" style={{ backgroundColor: "var(--accent)" }}>
                  <p className="text-xs" style={{ color: T.text3 }}>XP Didapat</p>
                  <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, color: "#C8922A" }}>+{lastEarnedXP} XP</p>
                </div>
                <button onClick={handleScanAgain} className="text-sm" style={{ color: T.text3 }}>
                  Scan QR lain
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── TAB: JOIN MEETING ── */}
        {activeTab === "meeting" && (
          <motion.div key="meeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Scheduled meetings */}
            <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: T.text3 }}>MEETING TERJADWAL</p>
              <div className="space-y-3">
                {[
                  { title: "Weekly Agent Briefing",  time: "Senin, 23 Jun · 09:00 WIB", platform: "Zoom", link: "https://zoom.us/j/123456", color: "#1A6FC4", bg: "#EEF5FC" },
                  { title: "Training: Teknik Closing", time: "Rabu, 25 Jun · 14:00 WIB", platform: "Google Meet", link: "https://meet.google.com/abc-defg", color: "#16A34A", bg: "#F0FDF4" },
                  { title: "Q2 Sales Review",        time: "Jumat, 27 Jun · 15:30 WIB", platform: "Zoom", link: "https://zoom.us/j/789012", color: "#1A6FC4", bg: "#EEF5FC" },
                ].map((m, i) => (
                  <motion.div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: T.border }}
                    whileHover={{ borderColor: m.color, backgroundColor: m.bg }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: m.bg }}>
                      <span style={{ fontSize: 18 }}>🎥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <EllipsisTooltip 
                        text={m.title} 
                        className="font-semibold text-sm truncate block" 
                        style={{ color: T.text1 }} 
                      />
                      <p className="text-xs" style={{ color: T.text3 }}>{m.time}</p>
                    </div>
                    <motion.button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: m.color, color: "white", fontFamily: "'Rajdhani', sans-serif" }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                      onClick={async () => {
                        const ok = await submitAttendance("meeting", m.link);
                        if (ok) {
                          window.open(m.link, "_blank", "noopener,noreferrer");
                        }
                      }}>
                      {isSubmitting ? "..." : "Join"}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Manual link */}
            <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: T.text3 }}>MASUKKAN LINK MEETING</p>
              <div className="flex gap-2 mb-3">
                <input type="url" value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/... atau meet.google.com/..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border outline-none bg-card text-sm"
                  style={{ borderColor: T.border }} />
              </div>
              <motion.button
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm"
                style={{
                  backgroundColor: meetingUrl ? "#E8A500" : "var(--border)",
                  color: meetingUrl ? "white" : "#9CA3AF",
                  fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: "0.04em",
                }}
                whileTap={meetingUrl ? { scale: 0.97 } : {}}
                disabled={!meetingUrl || isSubmitting}
                onClick={async () => {
                  const ok = await submitAttendance("meeting", meetingUrl);
                  if (ok) {
                    window.open(meetingUrl, "_blank", "noopener,noreferrer");
                  }
                }}>
                🎥 JOIN MEETING SEKARANG
              </motion.button>
            </div>

            {/* Platform quick links */}
            <div className="bg-card rounded-2xl border p-5" style={{ borderColor: T.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: T.text3 }}>BUKA PLATFORM</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Zoom", color: "#1A6FC4", bg: "#EEF5FC", icon: "🔵" },
                  { name: "Google Meet", color: "#16A34A", bg: "#F0FDF4", icon: "🟢" },
                  { name: "Teams", color: "#7B2FBE", bg: "#F5F0FD", icon: "🟣" },
                ].map(p => (
                  <motion.button key={p.name}
                    className="py-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border"
                    style={{ borderColor: p.color + "30", backgroundColor: p.bg, color: p.color }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    {p.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3"
            style={{ backgroundColor: "var(--foreground)", color: "white" }}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260 }}>
            <span>✅</span>
            <div>
              <p className="font-semibold text-sm">Absensi berhasil!</p>
              <p style={{ fontSize: 12, color: T.text3 }}>+{lastEarnedXP} XP ditambahkan</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Celebration Popup Modal */}
      <AnimatePresence>
        {showThreeJsPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center relative overflow-hidden flex flex-col items-center"
              style={{
                borderColor: "rgba(232, 165, 0, 0.3)",
                background: isDark
                  ? "linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 249, 249, 0.95))",
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15, stiffness: 120 }}
            >
              {/* Gold light burst background effect */}
              <div className="absolute w-48 h-48 rounded-full bg-[#E8A500]/10 blur-3xl -top-12 -left-12 pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full bg-[#E8A500]/10 blur-3xl -bottom-12 -right-12 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowThreeJsPopup(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-text3 transition-colors z-10"
                style={{ backgroundColor: T.muted }}
              >
                <X size={18} />
              </button>

              {/* 3D Canvas */}
              <div className="w-full relative mb-4">
                <ThreeJsCheckmark />
                {/* Overlay Badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-[#E8A500] border border-[#E8A500]/40 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  SUCCESSFULLY PRESENT
                </div>
              </div>

              {/* Title & Description */}
              <h2
                className="font-bold text-2xl mb-1.5"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}
              >
                Absensi Tercatat!
              </h2>
              <p className="text-sm mb-5 px-2" style={{ color: T.text3 }}>
                Terima kasih telah hadir hari ini. Konsistensi adalah kunci kesuksesan Anda!
              </p>

              {/* XP Reward card */}
              <div
                className="w-full p-4 rounded-2xl flex items-center justify-between border mb-6"
                style={{
                  backgroundColor: isDark ? "rgba(232, 165, 0, 0.05)" : "#FFFAED",
                  borderColor: "rgba(232, 165, 0, 0.2)",
                }}
              >
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: T.text3 }}>
                    REWARD HARIAN
                  </p>
                  <p className="text-sm font-semibold" style={{ color: T.text1 }}>
                    Quest Kehadiran Selesai
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-bold text-2xl flex items-center gap-1"
                    style={{ fontFamily: "'Rajdhani', sans-serif", color: "#C8922A" }}
                  >
                    ⚡ <span className="text-[#E8A500]">+{lastEarnedXP}</span> <span className="text-xs font-semibold text-text3">XP</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                onClick={() => setShowThreeJsPopup(false)}
                className="w-full py-3 rounded-xl font-bold transition-all text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, #E8A500, #C8922A)",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 16,
                  letterSpacing: "0.04em",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Lanjutkan Aktivitas
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
