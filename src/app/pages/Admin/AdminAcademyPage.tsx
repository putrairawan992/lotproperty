import { useState } from "react";
import { GraduationCap, BookOpen, Clock, Award, Plus, Trash2, CheckCircle, AlertCircle, Play, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import { T } from "../../types";

const CATEGORIES = ["SOP Internal", "Sales Training", "Negotiation", "Marketing", "Social Media", "Product Knowledge"];

const CAT_COLORS: Record<string, string> = {
  "SOP Internal": "#16A34A",
  "Sales Training": "#DC2626",
  "Negotiation": "#C8922A",
  "Social Media": "#7B2FBE",
  "Marketing": "#E8A500",
  "Product Knowledge": "#1A6FC4",
};

export default function AdminAcademyPage() {
  const [modules, setModules] = useState([
    { 
      id: "AC-001",
      title: "Teknik Negosiasi Tingkat Lanjut", 
      cat: "Negotiation", 
      dur: "2.5 jam", 
      xp: 200, 
      color: "#C8922A", 
      videoUrl: "https://youtube.com/watch?v=123",
      completers: 18,
      inProgress: 24
    },
    { 
      id: "AC-002",
      title: "KPR & Pembiayaan Properti", 
      cat: "Product Knowledge", 
      dur: "1.5 jam", 
      xp: 200, 
      color: "#1A6FC4", 
      videoUrl: "https://youtube.com/watch?v=456",
      completers: 42,
      inProgress: 11
    },
    { 
      id: "AC-003",
      title: "Strategi Konten Instagram Properti", 
      cat: "Social Media", 
      dur: "3 jam", 
      xp: 200, 
      color: "#7B2FBE", 
      videoUrl: "https://youtube.com/watch?v=789",
      completers: 9,
      inProgress: 35
    },
    { 
      id: "AC-004",
      title: "SOP Listing & Update Database", 
      cat: "SOP Internal", 
      dur: "1 jam", 
      xp: 200, 
      color: "#16A34A", 
      videoUrl: "https://youtube.com/watch?v=aaa",
      completers: 56,
      inProgress: 2
    },
  ]);

  const [toastMsg, setToastMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Sales Training");
  const [dur, setDur] = useState("");
  const [xp, setXp] = useState("200");
  const [videoUrl, setVideoUrl] = useState("");
  const [formError, setFormError] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dur.trim() || !xp || !videoUrl.trim()) {
      setFormError("Semua kolom formulir wajib diisi!");
      return;
    }

    setFormError("");
    const newModule = {
      id: `AC-${Math.floor(100 + Math.random() * 900)}`,
      title,
      cat,
      dur,
      xp: parseInt(xp),
      color: CAT_COLORS[cat] || "#E8A500",
      videoUrl,
      completers: 0,
      inProgress: 0,
    };

    setModules(prev => [newModule, ...prev]);
    triggerToast("Modul Akademi Baru Berhasil Dibuat!");

    // Reset Form
    setTitle("");
    setCat("Sales Training");
    setDur("");
    setXp("200");
    setVideoUrl("");
    setShowAddForm(false);
  };

  const handleDeleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    triggerToast("Modul Akademi Berhasil Dihapus.");
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 relative">
      {/* Toast alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-16 left-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-green-500/20"
          >
            <CheckCircle size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive stack header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: T.border }}>
        <div className="text-left">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
            Academy Course Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola modul pembelajaran, unggah materi edukasi, dan atur reward XP agen</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md w-full sm:w-auto self-start sm:self-auto cursor-pointer">
          {showAddForm ? "Batal" : <><Plus size={14} /> Tambah Modul</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ADD MODULE FORM */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
                <GraduationCap className="text-[#E8A500]" size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Form Pembuatan Modul Baru</h3>
              </div>

              <form onSubmit={handleCreateModule} className="space-y-4 text-left">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} /> {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Judul Modul</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Kunci Keberhasilan Closing Cepat"
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                    style={{ borderColor: T.border }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Kategori</label>
                    <select value={cat} onChange={e => setCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none cursor-pointer"
                      style={{ borderColor: T.border }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Durasi</label>
                    <input type="text" value={dur} onChange={e => setDur(e.target.value)}
                      placeholder="Contoh: 2 jam / 45 min"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                      style={{ borderColor: T.border }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Reward XP</label>
                    <input type="number" value={xp} onChange={e => setXp(e.target.value)}
                      placeholder="Contoh: 200"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                      style={{ borderColor: T.border }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">URL Video Pembelajaran</label>
                  <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="Contoh: https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                    style={{ borderColor: T.border }} />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer">
                  Simpan & Rilis Modul
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODULE LIST */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider text-left">Daftar Modul Pembelajaran</h3>

        {modules.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-5 flex flex-col justify-between overflow-hidden relative hover:shadow-md transition-shadow duration-200" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Info detail */}
                <div className="flex-1 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-foreground leading-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{m.title}</h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border" style={{ borderColor: T.border }}>{m.id}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex-shrink-0 tracking-wider" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                      {m.cat}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 pb-1 text-xs border-t border-b border-border/40" style={{ borderColor: T.border }}>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={14} className="text-[#E8A500]" />
                      <span className="font-medium text-foreground">{m.dur}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <span className="w-4 h-4 rounded bg-[#E8A500]/10 border border-[#E8A500]/20 text-[#E8A500] text-[8px] flex items-center justify-center font-bold">XP</span>
                      <span className="text-[#E8A500]">+{m.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-[#16A34A]" />
                      <span className="font-medium text-foreground">{m.completers} Selesai</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={14} className="text-[#1A6FC4]" />
                      <span className="font-medium text-foreground">{m.inProgress} Belajar</span>
                    </div>
                  </div>

                  {m.videoUrl && (
                    <div className="text-[10px] text-muted-foreground bg-muted/20 px-3 py-2 rounded-xl flex items-center gap-2 border w-full sm:w-max min-w-0" style={{ borderColor: T.border }}>
                      <Play size={11} className="text-red-500 fill-red-500 flex-shrink-0" />
                      <span className="truncate font-mono text-muted-foreground/80 flex-1">{m.videoUrl}</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-2 border-t mt-4 pt-3" style={{ borderColor: T.border }}>
                <button onClick={() => handleDeleteModule(m.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                  title="Hapus Modul">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl" style={{ borderColor: T.border }}>
            Tidak ada modul pembelajaran yang terdaftar. Klik "Tambah Modul" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
