import { useState } from "react";
import { Search, ChevronDown, BookOpen, ChevronRight, MessageSquare, ArrowLeftRight, Check, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/Card";
import BadgeShield from "../components/BadgeShield";
import LevelBadge from "../components/LevelBadge";
import { T, Page, useTheme } from "../types";
import { useTabQuery } from "../routes";
import { FAQ_DATA, TERMS_SECTIONS } from "../appData";
import { LEVEL_TIERS, RARITY_CFG } from "../badgeAssets";
import { ALL_BADGES } from "./ProfilePage";

export default function HelpPage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab]         = useTabQuery("tab", "guide");
  const [guideTab, setGuideTab] = useTabQuery("sub", "level");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch]   = useState("");
  const { isDark } = useTheme();

  // Interactive Form States
  const [formType, setFormType] = useState<"feedback" | "pindah_dp">("feedback");
  const [toastMsg, setToastMsg] = useState("");
  
  // Feedback Form Input States
  const [fbType, setFbType] = useState("Saran");
  const [fbSubject, setFbSubject] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbError, setFbError] = useState("");
  const [fbHistory, setFbHistory] = useState<any[]>([
    { type: "Saran", subject: "Aplikasi Terlalu Bagus", message: "Animasi Hall of Fame keren banget, kalau bisa dikasih sound effect seru.", date: "Kemarin", status: "Diterima" }
  ]);

  // Form Pindah DP Input States
  const [dpClient, setDpClient] = useState("");
  const [dpUnitAwal, setDpUnitAwal] = useState("");
  const [dpUnitBaru, setDpUnitBaru] = useState("");
  const [dpAmount, setDpAmount] = useState("");
  const [dpReason, setDpReason] = useState("");
  const [dpError, setDpError] = useState("");
  const [dpHistory, setDpHistory] = useState<any[]>([
    { client: "Budi Santoso", unitAwal: "Rumah Bintaro Block A", unitBaru: "Apartemen Serpong Tower B", amount: "Rp 50.000.000", reason: "Client ingin ganti ke tipe unit yang lebih tinggi.", date: "19 Jun 2026", status: "Sedang Diproses" }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleFbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSubject.trim() || !fbMessage.trim()) {
      setFbError("Subjek dan isi pesan kritik/saran wajib diisi!");
      return;
    }
    setFbError("");
    const newFb = {
      type: fbType,
      subject: fbSubject,
      message: fbMessage,
      date: "Hari Ini",
      status: "Terkirim"
    };
    setFbHistory(prev => [newFb, ...prev]);
    setFbSubject("");
    setFbMessage("");
    showToast("Feedback kritik & saran berhasil dikirim ke Management!");
  };

  const handleDpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpClient.trim() || !dpUnitAwal.trim() || !dpUnitBaru.trim() || !dpAmount.trim() || !dpReason.trim()) {
      setDpError("Semua field pada formulir Pindah DP wajib diisi!");
      return;
    }
    setDpError("");
    
    // Format currency mock if needed
    const formattedAmount = dpAmount.startsWith("Rp") ? dpAmount : `Rp ${parseInt(dpAmount).toLocaleString("id-ID")}`;
    
    const newDp = {
      client: dpClient,
      unitAwal: dpUnitAwal,
      unitBaru: dpUnitBaru,
      amount: formattedAmount,
      reason: dpReason,
      date: "Hari Ini",
      status: "Menunggu Verifikasi"
    };
    setDpHistory(prev => [newDp, ...prev]);
    setDpClient("");
    setDpUnitAwal("");
    setDpUnitBaru("");
    setDpAmount("");
    setDpReason("");
    showToast("Formulir Pindah DP berhasil diajukan ke Office Manager!");
  };

  const filteredFaq = FAQ_DATA.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "guide", label: "Panduan",  icon: "📖" },
    { id: "faq",   label: "FAQ",      icon: "❓" },
    { id: "terms", label: "SOP",      icon: "📄" },
    { id: "forms", label: "Formulir", icon: "📝" },
    { id: "cs",    label: "Bantuan",  icon: "💬" },
  ] as const;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-16 left-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
          Bantuan & Informasi
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.text3 }}>Pusat panduan SOP, formulir mandiri, dan bantuan agen LOT Property</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setTab("faq"); }}
          placeholder="Cari panduan SOP, FAQ..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none bg-card"
          style={{ borderColor: T.border, fontSize: 14 }}
          onFocus={e => (e.target.style.borderColor = "#E8A500")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")} />
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto" style={{ backgroundColor: T.muted, scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <motion.button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }}
            className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap min-w-[70px] sm:min-w-0"
            animate={{
              backgroundColor: tab === t.id ? (isDark ? "#2A241C" : "#ffffff") : "rgba(0,0,0,0)",
              color: tab === t.id ? "#E8A500" : "#6B7280",
              boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.18 }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <span>{t.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="h-px" style={{ backgroundColor: T.border }} />

      <AnimatePresence mode="wait">

        {/* ── PANDUAN ── */}
        {tab === "guide" && (
          <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {([["level","🏅 Level Guide"],["badge","⭐ Badge Guide"],["xp","⚡ XP Guide"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setGuideTab(id)}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: guideTab === id ? "#E8A500" : (isDark ? "rgba(255,255,255,0.05)" : "white"),
                    color: guideTab === id ? "white" : "var(--foreground)",
                    border: `1px solid ${guideTab === id ? "#E8A500" : "var(--border)"}`,
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* LEVEL GUIDE */}
            {guideTab === "level" && (
              <div className="space-y-3">
                <Card className="p-4">
                  <p className="text-xs font-semibold mb-3" style={{ color: T.text3 }}>SISTEM LEVEL</p>
                  <p className="text-sm mb-4" style={{ color: T.text2 }}>
                    Level bertambah seiring akumulasi total XP. Level bersifat permanen dan tidak pernah reset.
                  </p>
                  <div className="space-y-3">
                    {LEVEL_TIERS.map((tier, i) => (
                      <motion.div key={i}
                        className="flex items-center gap-4 p-3 rounded-2xl border"
                        style={{ borderColor: T.border }}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ borderColor: tier.color, backgroundColor: tier.color + "08" }}>
                        <LevelBadge title={tier.title} size={56} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                            <span className="font-bold text-[15px] sm:text-[16px] leading-none" style={{ fontFamily: "'Rajdhani', sans-serif", color: tier.color }}>
                              {tier.title}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded font-semibold leading-none whitespace-nowrap flex items-center justify-center font-sans"
                               style={{ backgroundColor: tier.color + "20", color: tier.color, height: "18px" }}>
                              Level {tier.range}
                            </span>
                          </div>
                          <p className="text-xs leading-normal" style={{ color: T.text3 }}>Mulai dari {tier.xp} XP</p>
                        </div>
                        {i < LEVEL_TIERS.length - 1 && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs" style={{ color: T.text3 }}>Naik ke</p>
                            <p className="text-sm font-semibold" style={{ color: LEVEL_TIERS[i+1].color }}>
                              {LEVEL_TIERS[i+1].title}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* BADGE GUIDE */}
            {guideTab === "badge" && (
              <div className="space-y-5">
                {(["mythic","legendary","epic","rare","common"] as const).map(rarity => {
                  const badges = ALL_BADGES.filter(b => b.rarity === rarity);
                  const c = RARITY_CFG[rarity];
                  const activeColor = isDark ? c.darkColor : c.color;
                  return (
                    <Card key={rarity} className="overflow-hidden border border-border/50 shadow-md">
                      {/* Dark Glossy Prominent Header with dynamic gradient */}
                      <div className="flex items-center gap-2 px-5 py-3.5 rounded-t-[19px]"
                        style={{
                          borderLeft: `4px solid ${activeColor}`,
                          borderBottom: `1px solid ${T.border}`,
                          background: isDark
                            ? `linear-gradient(110deg, #111015 0%, ${c.darkBg} 100%)`
                            : `linear-gradient(110deg, #ffffff 0%, ${c.bg} 100%)`,
                          boxShadow: isDark
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        }}>
                        <span className="font-extrabold tracking-widest text-sm sm:text-base uppercase"
                          style={{ fontFamily: "'Rajdhani', sans-serif", color: activeColor }}>
                          {c.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: activeColor, opacity: 0.85 }}>
                          ({badges.length} badge)
                        </span>
                      </div>
                      
                      {/* Badge list: upsized icons and text */}
                      <div className="divide-y" style={{ borderColor: T.border }}>
                        {badges.map((b, i) => (
                          <div key={i} className="grid grid-cols-[108px_minmax(0,1fr)_auto] sm:grid-cols-[124px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 select-none">
                            <div className="w-[108px] sm:w-[124px] flex justify-center">
                              <BadgeShield rarity={b.rarity} name={b.name} size="md" />
                            </div>
                            <div className="min-w-0 pr-2">
                              <p className="font-extrabold text-base sm:text-lg leading-snug" style={{ color: T.text1 }}>
                                {b.name}
                              </p>
                              <p className="text-xs sm:text-sm mt-1 leading-relaxed text-muted-foreground" style={{ color: T.text3 }}>
                                {b.req}
                              </p>
                            </div>
                            <div className="justify-self-end self-center">
                              {b.locked ? (
                                <span className="inline-flex h-8 items-center text-xs px-3 rounded-xl font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/50" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                                  Locked
                                </span>
                              ) : (
                                <span className="inline-flex h-8 items-center text-xs px-3.5 rounded-xl font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                                  ✓ Dimiliki
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* XP GUIDE */}
            {guideTab === "xp" && (
              <div className="space-y-4">
                <Card className="p-5">
                  <p className="text-xs font-semibold mb-4" style={{ color: T.text3 }}>CARA MENDAPAT XP</p>
                  
                  {/* Grid Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-2" style={{ borderColor: T.border }}>
                    <div className="col-span-6">Aktivitas</div>
                    <div className="col-span-3 text-right">XP Reward</div>
                    <div className="col-span-3 text-right">Limit Harian / Mingguan</div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "Daily Login",          xp: "+100 XP",    cap: "—",             icon: "📅", color: "#1A6FC4" },
                      { label: "New Listing",          xp: "+100 XP",    cap: "300 XP/hari",   icon: "🏢", color: "#E8A500" },
                      { label: "New Content",          xp: "+300 XP",    cap: "1×/hari",       icon: "📱", color: "#7B2FBE" },
                      { label: "Listing Promotion",    xp: "+100 XP",    cap: "300 XP/hari",   icon: "📣", color: "#16A34A" },
                      { label: "New Prospect",         xp: "+100 XP",    cap: "1.000 XP/minggu",icon:"👥", color: "#C8922A" },
                      { label: "Prospect Clearance",   xp: "+1.000 XP",  cap: "1×/minggu",     icon: "✅", color: "#16A34A" },
                      { label: "New Recruit",          xp: "+5.000 XP",  cap: "—",             icon: "🤝", color: "#DC2626" },
                      { label: "Complete Module",      xp: "+200 XP",    cap: "Tidak ada batas",icon:"🎓", color: "#1A6FC4" },
                      { label: "Event Attendance",     xp: "+1.000 XP",  cap: "Sesuai event",  icon: "🎪", color: "#7B2FBE" },
                    ].map((s, i) => (
                      <motion.div key={i} className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border text-sm font-medium"
                        style={{ borderColor: T.border }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ borderColor: s.color, backgroundColor: s.color + "06" }}>
                        
                        {/* Col 1: Icon + Activity Name (col-span-6) */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: s.color + "18" }}>
                            <span style={{ fontSize: 14 }}>{s.icon}</span>
                          </div>
                          <span className="truncate" style={{ color: T.text1 }}>{s.label}</span>
                        </div>

                        {/* Col 2: XP Reward (col-span-3) */}
                        <div className="col-span-3 text-right font-bold" style={{ color: s.color, fontFamily: "'Rajdhani', sans-serif" }}>
                          {s.xp}
                        </div>

                        {/* Col 3: Limit Cap (col-span-3) */}
                        <div className="col-span-3 text-right text-xs" style={{ color: T.text3 }}>
                          {s.cap}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-dashed" style={{ borderColor: T.border }} />

                  {/* Commission XP matrix */}
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: T.text3 }}>COMMISSION XP MATRIX</p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: T.border }}>
                          {["Tipe Properti","RENT","SALE"].map(h => (
                            <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: T.text3 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Apartemen",  "+2.000 XP", "+5.000 XP"],
                          ["Rumah",      "+3.000 XP", "+7.500 XP"],
                          ["Ruko",       "+5.000 XP", "+10.000 XP"],
                          ["Office",     "+5.000 XP", "+10.000 XP"],
                          ["Gudang",     "+5.000 XP", "+10.000 XP"],
                          ["Tanah",      "+5.000 XP", "+10.000 XP"],
                          ["Primary",    "—",          "+10.000 XP"],
                        ].map(([type, rent, sale], i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: "var(--border)" }}>
                            <td className="py-2.5 px-3 text-sm font-medium" style={{ color: T.text1 }}>{type}</td>
                            <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: "#16A34A" }}>{rent}</td>
                            <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: "#1A6FC4" }}>{sale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* ── FAQ ── */}
        {tab === "faq" && (
          <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            {search && (
              <p className="text-sm" style={{ color: T.text3 }}>
                {filteredFaq.length} hasil untuk "{search}"
              </p>
            )}
            {filteredFaq.map((f, i) => (
              <motion.div key={i} className="bg-card rounded-2xl border overflow-hidden"
                style={{ borderColor: openFaq === i ? "#E8A500" : "var(--border)" }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <button className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left font-sans"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-sm" style={{ color: T.text1 }}>{f.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={16} style={{ color: T.text3 }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: T.text2 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {filteredFaq.length === 0 && (
              <div className="py-12 text-center" style={{ color: T.text3 }}>
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Tidak ditemukan</p>
                <p className="text-sm mt-1">Coba kata kunci lain atau hubungi CS</p>
                <button onClick={() => setTab("cs")}
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#E8A500", color: "white" }}>
                  Hubungi CS
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TERMS & CONDITIONS ── */}
        {tab === "terms" && (
          <motion.div key="terms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#EEF5FC] dark:bg-sky-950/30">
                  <BookOpen size={16} style={{ color: "#1A6FC4" }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>
                    Standard Operating Procedure (SOP) Agen
                  </h3>
                  <p className="text-xs" style={{ color: T.text3 }}>Versi 1.0 · Berlaku resmi sejak 1 Januari 2025</p>
                </div>
              </div>
              <div className="space-y-5">
                {TERMS_SECTIONS.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <p className="font-semibold mb-1.5" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: T.text1 }}>
                      {s.title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: T.text2 }}>{s.content}</p>
                    {i < TERMS_SECTIONS.length - 1 && (
                      <div className="mt-4 h-px" style={{ backgroundColor: T.border }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
            <div className="text-center py-2">
              <p className="text-xs" style={{ color: T.text3 }}>
                Sebagai Agen Profesional LOT Property, Anda diwajibkan memahami dan mematuhi seluruh butir SOP di atas.
              </p>
              <p className="text-xs mt-1" style={{ color: T.text3 }}>
                © {new Date().getFullYear()} LOT Property Group. All rights reserved.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── INTERACTIVE FORMULIR ── */}
        {tab === "forms" && (
          <motion.div key="forms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Form Selection Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setFormType("feedback")}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-bold transition-all"
                style={{ 
                  borderColor: formType === "feedback" ? "#E8A500" : "var(--border)",
                  backgroundColor: formType === "feedback" ? (isDark ? "rgba(232,165,0,0.1)" : "#FFFAED") : T.card,
                  color: formType === "feedback" ? "#E8A500" : "var(--foreground)"
                }}>
                <MessageSquare size={16} /> kritik & saran
              </button>
              <button onClick={() => setFormType("pindah_dp")}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-bold transition-all"
                style={{ 
                  borderColor: formType === "pindah_dp" ? "#E8A500" : "var(--border)",
                  backgroundColor: formType === "pindah_dp" ? (isDark ? "rgba(232,165,0,0.1)" : "#FFFAED") : T.card,
                  color: formType === "pindah_dp" ? "#E8A500" : "var(--foreground)"
                }}>
                <ArrowLeftRight size={16} /> Form Pindah DP
              </button>
            </div>

            {/* FEEDBACK FORM */}
            {formType === "feedback" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="p-5">
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
                    <MessageSquare className="text-[#E8A500]" size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Feedback & Saran Management</h3>
                  </div>

                  <form onSubmit={handleFbSubmit} className="space-y-4 text-left">
                    {fbError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} /> {fbError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Nama Pengirim</label>
                      <input type="text" value="Ronald Richy" disabled className="w-full px-3.5 py-2.5 rounded-xl border bg-muted/20 text-muted-foreground text-sm cursor-not-allowed outline-none" style={{ borderColor: T.border }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Kategori</label>
                        <select value={fbType} onChange={e => setFbType(e.target.value)} 
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none cursor-pointer"
                          style={{ borderColor: T.border }}>
                          <option value="Kritik">Kritik</option>
                          <option value="Saran">Saran</option>
                          <option value="Pertanyaan">Pertanyaan</option>
                          <option value="Aplikasi">Bug / Aplikasi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Subjek</label>
                        <input type="text" value={fbSubject} onChange={e => setFbSubject(e.target.value)}
                          placeholder="Contoh: Fitur Baru"
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Pesan / Detail Kritik & Saran</label>
                      <textarea rows={4} value={fbMessage} onChange={e => setFbMessage(e.target.value)}
                        placeholder="Tuliskan masukan berharga Anda di sini..."
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                        style={{ borderColor: T.border }} />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md">
                      Kirim Feedback
                    </button>
                  </form>
                </Card>

                {/* Feedback History Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">Riwayat Masukan Anda</h4>
                  {fbHistory.map((fb, idx) => (
                    <div key={idx} className="p-4 bg-card rounded-2xl border text-left flex justify-between items-start gap-4" style={{ borderColor: T.border }}>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" 
                            style={{ 
                              backgroundColor: fb.type === "Kritik" ? "rgba(220,38,38,0.12)" : "rgba(232,165,0,0.12)", 
                              color: fb.type === "Kritik" ? "#DC2626" : "#E8A500"
                            }}>
                            {fb.type}
                          </span>
                          <h5 className="font-semibold text-sm truncate text-foreground">{fb.subject}</h5>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{fb.message}</p>
                        <span className="text-[10px] text-muted-foreground block">{fb.date}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20 text-green-500 bg-green-500/5">{fb.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* FORM PINDAH DP */}
            {formType === "pindah_dp" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="p-5">
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
                    <ArrowLeftRight className="text-[#16A34A]" size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Formulir Pengajuan Pindah DP Client</h3>
                  </div>

                  <form onSubmit={handleDpSubmit} className="space-y-4 text-left">
                    {dpError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} /> {dpError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Nama Client</label>
                        <input type="text" value={dpClient} onChange={e => setDpClient(e.target.value)}
                          placeholder="Nama lengkap client"
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border }} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Jumlah DP (Nominal)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
                          <input type="text" value={dpAmount} onChange={e => setDpAmount(e.target.value)}
                            placeholder="Contoh: 50000000"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                            style={{ borderColor: T.border }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Properti Awal</label>
                        <input type="text" value={dpUnitAwal} onChange={e => setDpUnitAwal(e.target.value)}
                          placeholder="Contoh: BSD Cluster Foresta C7"
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border }} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Properti Baru</label>
                        <input type="text" value={dpUnitBaru} onChange={e => setDpUnitBaru(e.target.value)}
                          placeholder="Contoh: BSD Cluster Lavon B12"
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Alasan Pemindahan Unit & DP</label>
                      <textarea rows={3} value={dpReason} onChange={e => setDpReason(e.target.value)}
                        placeholder="Uraikan secara detail alasan client memindahkan DP ke unit baru..."
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                        style={{ borderColor: T.border }} />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md">
                      Kirim Pengajuan Pindah DP
                    </button>
                  </form>
                </Card>

                {/* DP History Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">Riwayat Pengajuan Pindah DP</h4>
                  {dpHistory.map((dp, idx) => (
                    <div key={idx} className="p-4 bg-card rounded-2xl border text-left flex justify-between items-start gap-4" style={{ borderColor: T.border }}>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="text-[#16A34A]" size={14} />
                          <h5 className="font-bold text-sm text-foreground">{dp.client}</h5>
                        </div>
                        <div className="text-xs space-y-0.5 text-muted-foreground">
                          <p>Awal: <span className="font-medium text-foreground">{dp.unitAwal}</span></p>
                          <p>Baru: <span className="font-medium text-foreground">{dp.unitBaru}</span></p>
                          <p>Nominal DP: <span className="font-semibold text-[#16A34A]">{dp.amount}</span></p>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic">" {dp.reason} "</p>
                        <span className="text-[10px] text-muted-foreground block">{dp.date}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C8922A]/20 text-[#C8922A] bg-[#C8922A]/5">{dp.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── BANTUAN CS ── */}
        {tab === "cs" && (
          <motion.div key="cs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Contact cards */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "CS Marketing Support", sub: "Pertanyaan listing, event & quest XP",  icon: "💬", color: "#E8A500", bg: isDark ? "rgba(232,165,0,0.1)" : "#FFFAED", href: "https://wa.me/6281234567890", cta: "Chat WhatsApp" },
                { label: "CS Finance Support",    sub: "Pemberkasan & verifikasi klaim komisi",  icon: "💰", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.1)" : "#F0FDF4", href: "https://wa.me/6281298765432", cta: "Chat WhatsApp" },
                { label: "Email Support",      sub: "cs@lotproperty.id",     icon: "📧", color: "#1A6FC4", bg: isDark ? "rgba(26,111,196,0.1)" : "#EEF5FC", href: "mailto:cs@lotproperty.id",   cta: "Kirim Email" },
                { label: "Telepon Kantor",     sub: "(021) 1234-5678",       icon: "📞", color: "#7B2FBE", bg: isDark ? "rgba(123,47,190,0.1)" : "#F5F0FD", href: "tel:02112345678",             cta: "Telepon" },
              ].map((c, i) => (
                <motion.a key={i} href={c.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border no-underline"
                  style={{ borderColor: T.border, backgroundColor: T.card }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ borderColor: c.color, backgroundColor: c.bg, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: c.bg }}>
                    <span style={{ fontSize: 22 }}>{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-left text-foreground truncate" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16 }}>{c.label}</p>
                    <p className="text-sm text-left text-muted-foreground truncate">{c.sub}</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm flex-shrink-0"
                    style={{ color: c.color }}>
                    {c.cta} <ChevronRight size={14} />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Jam operasional */}
            <Card className="p-5">
              <p className="text-xs font-semibold mb-3 text-left" style={{ color: T.text3 }}>JAM OPERASIONAL CS</p>
              <div className="space-y-2">
                {[
                  { day: "Senin – Jumat",   hours: "08:00 – 17:00 WIB", active: true },
                  { day: "Sabtu",           hours: "09:00 – 13:00 WIB", active: true },
                  { day: "Minggu & Libur",  hours: "Tutup",              active: false },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.border }}>
                    <span className="text-sm" style={{ color: T.text2 }}>{h.day}</span>
                    <span className="text-sm font-semibold" style={{ color: h.active ? "#16A34A" : "#DC2626" }}>{h.hours}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
