import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Clock, Award, Plus, Trash2, CheckCircle, AlertCircle, Play, Users, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { T } from "../../types";
import { api } from "../../services/api";

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
  const [modules, setModules] = useState<any[]>([]);

  const [toastMsg, setToastMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Sales Training");
  const [dur, setDur] = useState("");
  const [xp, setXp] = useState("200");
  const [videoUrl, setVideoUrl] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await api.academy.getModules();
        if (Array.isArray(data)) {
          setModules(data.map((m: any) => ({
            id: String(m.id),
            title: m.title || "",
            cat: m.category || "",
            dur: "—",
            xp: 200,
            color: CAT_COLORS[m.category] || "#E8A500",
            videoUrl: m.video_url || "",
            completers: 0,
            inProgress: 0,
          })));
        } else {
          setModules([]);
        }
      } catch {
        setModules([]);
      }
    };
    loadModules();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleToggleForm = () => {
    if (showAddForm) {
      setTitle("");
      setCat("Sales Training");
      setDur("");
      setXp("200");
      setVideoUrl("");
      setEditId(null);
      setShowAddForm(false);
    } else {
      setShowAddForm(true);
    }
  };

  const handleCreateOrUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dur.trim() || !xp || !videoUrl.trim()) {
      setToastMsg("Semua kolom formulir wajib diisi!");
      return;
    }

    setToastMsg("");
    setSaving(true);
    try {
      if (editId) {
        await api.admin.updateAcademyModule(editId, {
          category: cat,
          title: title.trim(),
          description: title.trim(),
          video_url: videoUrl.trim(),
        });
        setToastMsg("Modul Akademi Berhasil Diperbarui!");
      } else {
        await api.admin.createAcademyModule({
          category: cat,
          title: title.trim(),
          description: title.trim(),
          video_url: videoUrl.trim(),
        });
        setToastMsg("Modul Akademi Baru Berhasil Dibuat!");
      }

      setTitle("");
      setCat("Sales Training");
      setDur("");
      setXp("200");
      setVideoUrl("");
      setEditId(null);
      setShowAddForm(false);

      // Reload
      const data = await api.academy.getModules();
      if (Array.isArray(data)) {
        setModules(data.map((m: any) => ({
          id: String(m.id),
          title: m.title || "",
          cat: m.category || "",
          dur: "—",
          xp: 200,
          color: CAT_COLORS[m.category] || "#E8A500",
          videoUrl: m.video_url || "",
          completers: 0,
          inProgress: 0,
        })));
      }
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Gagal menyimpan modul");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (m: any) => {
    setTitle(m.title);
    setCat(m.cat);
    setDur(m.dur);
    setXp(String(m.xp));
    setVideoUrl(m.videoUrl);
    setEditId(m.id);
    setShowAddForm(true);
  };

  const handleDeleteModule = async (id: string) => {
    try {
      await api.admin.deleteAcademyModule(id);
      setModules(prev => prev.filter(m => m.id !== id));
      setToastMsg("Modul Akademi Berhasil Dihapus.");
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Gagal menghapus modul");
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: T.border }}>
        <div className="text-left">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
            Academy Course Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola modul pembelajaran, unggah materi edukasi, dan atur reward XP agen</p>
        </div>
        <button onClick={handleToggleForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md w-full sm:w-auto self-start sm:self-auto cursor-pointer">
          {showAddForm ? "Batal" : <><Plus size={14} /> Tambah Modul</>}
        </button>
      </div>

      {/* ADD/EDIT MODULE MODAL POP-UP */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleToggleForm} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="text-[#E8A500]" size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
                    {editId ? "Edit Modul Akademi" : "Tambah Modul Baru"}
                  </h3>
                </div>
                <button onClick={handleToggleForm} style={{ color: T.text3 }} className="cursor-pointer hover:opacity-80 transition-opacity"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateOrUpdateModule}>
                <div className="p-6 space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Judul Modul</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Contoh: Kunci Keberhasilan Closing Cepat"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                      style={{ borderColor: T.border, color: T.text1 }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Kategori</label>
                      <select value={cat} onChange={e => setCat(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none cursor-pointer"
                        style={{ borderColor: T.border, color: T.text1 }}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Durasi</label>
                      <input type="text" value={dur} onChange={e => setDur(e.target.value)}
                        placeholder="Contoh: 2 jam / 45 min"
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                        style={{ borderColor: T.border, color: T.text1 }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Reward XP</label>
                      <input type="number" value={xp} onChange={e => setXp(e.target.value)}
                        placeholder="Contoh: 200"
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                        style={{ borderColor: T.border, color: T.text1 }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">URL Video Pembelajaran</label>
                    <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      placeholder="Contoh: https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                      style={{ borderColor: T.border, color: T.text1 }} />
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-muted/10" style={{ borderColor: T.border }}>
                  <button type="button" onClick={handleToggleForm}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                    style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8A500] text-white transition-all hover:bg-[#CC9200] disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Simpan & Rilis")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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
                      <EllipsisTooltip 
                        text={m.videoUrl} 
                        className="font-mono text-muted-foreground/80 truncate block" 
                        containerClassName="flex-1 min-w-0"
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-2 border-t mt-4 pt-3" style={{ borderColor: T.border }}>
                <button onClick={() => handleEditClick(m)}
                  className="p-2 text-[#1A6FC4] hover:bg-[#1A6FC4]/10 rounded-xl transition-all border border-transparent hover:border-[#1A6FC4]/20 cursor-pointer"
                  title="Edit Modul">
                  <Pencil size={15} />
                </button>
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
