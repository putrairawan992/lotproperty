import React, { useState, useEffect } from "react";
import { Zap, Calendar, Award, Check, AlertCircle, Plus, Trash2, Upload, FileImage, X, Pencil, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import { DateInput } from "../../components/DateTimeInput";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { T } from "../../types";
import { api } from "../../services/api";
import { ALL_BADGES } from "../ProfilePage";
export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  const [toastMsg, setToastMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await api.events.getList();
        if (Array.isArray(data)) {
          setEvents(data.map((ev: any) => ({
            id: `EV-${ev.id}`,
            title: ev.title || "",
            desc: ev.desc || "",
            start: ev.start_date ? ev.start_date.slice(0, 10) : "",
            end: ev.end_date ? ev.end_date.slice(0, 10) : "",
            xpPool: Number(ev.xp_pool || 0),
            badge: ev.badge?.name || "Event Badge",
            banner: ev.banner || "",
            prizes: ev.prizes || "",
            status: ev.status || "Upcoming",
          })));
        } else {
          setEvents([]);
        }
      } catch {
        setEvents([]);
      }
    };
    loadEvents();
  }, []);

  // Form Inputs
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [xpPool, setXpPool] = useState("");
  const [badge, setBadge] = useState("Merdeka Creator");
  const [prizeItems, setPrizeItems] = useState<{rank: string; prize: string}[]>([]);
  
  // Prize helpers
  const addPrizeItem = () => setPrizeItems(prev => [...prev, {rank: "", prize: ""}]);
  const removePrizeItem = (i: number) => setPrizeItems(prev => prev.filter((_, idx) => idx !== i));
  const updatePrizeItem = (i: number, field: "rank" | "prize", value: string) => {
    setPrizeItems(prev => prev.map((item, idx) => idx === i ? {...item, [field]: value} : item));
  };
  const serializePrizes = () => {
    const valid = prizeItems.filter(p => p.rank.trim() || p.prize.trim());
    return valid.length > 0 ? JSON.stringify(valid) : "";
  };
  const parsePrizes = (json: string) => {
    if (!json) { setPrizeItems([]); return; }
    try {
      const arr = JSON.parse(json);
      if (Array.isArray(arr)) setPrizeItems(arr);
      else setPrizeItems([]);
    } catch { setPrizeItems([]); }
  };
  
  // Banner Upload States
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerUrl, setBannerUrl] = useState(""); // uploaded URL from API
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleToggleForm = () => {
    if (showAddForm) {
      setTitle("");
      setDesc("");
      setStart("");
      setEnd("");
      setXpPool("");
      setBadge("Merdeka Creator");
      setPrizeItems([]);
      setBannerFile(null);
      setBannerPreview("");
      setBannerUrl("");
      setBannerError("");
      setEditId(null);
      setShowAddForm(false);
    } else {
      setShowAddForm(true);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setBannerFile(file);
    setBannerError("");
    setUploadingBanner(true);
    try {
      const result = await api.admin.uploadEventBanner(file);
      if (result?.banner_url) {
        setBannerUrl(result.banner_url);
      }
    } catch (err) {
      setBannerError("Gagal upload banner. Coba lagi.");
      console.error("Banner upload failed:", err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !start || !end || !xpPool) {
      setToastMsg("Semua field formulir event wajib diisi!");
      return;
    }

    // Use uploaded banner URL; fallback to existing bannerPreview for editing
    const finalBanner = bannerUrl || bannerPreview;

    setToastMsg("");
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        desc: desc.trim(),
        start_date: new Date(start).toISOString(),
        end_date: new Date(end).toISOString(),
        xp_pool: parseInt(xpPool) || 0,
        subtitle: title.trim().toUpperCase(),
        heading: title.trim().toUpperCase(),
        tagline: "Ikuti event dan raih",
        tagline_highlight: "hadiah eksklusif!",
        accent_color: "#E53E3E",
        banner: finalBanner,
        prizes: serializePrizes(),
      };

      if (editId) {
        const rawId = editId.replace("EV-", "");
        await api.admin.updateEvent(rawId, payload);
        setToastMsg("Event Berhasil Diperbarui!");
      } else {
        await api.admin.createEvent(payload);
        setToastMsg("Event Baru Berhasil Dibuat dan Dipublikasikan!");
      }

      setTitle("");
      setDesc("");
      setStart("");
      setEnd("");
      setXpPool("");
      setBadge("Merdeka Creator");
      setPrizeItems([]);
      setBannerFile(null);
      setBannerPreview("");
      setBannerUrl("");
      setBannerError("");
      setEditId(null);
      setShowAddForm(false);

      const data = await api.events.getList();
      if (Array.isArray(data)) {
        setEvents(data.map((ev: any) => ({
          id: `EV-${ev.id}`,
          title: ev.title || "",
          desc: ev.desc || "",
          start: ev.start_date ? ev.start_date.slice(0, 10) : "",
          end: ev.end_date ? ev.end_date.slice(0, 10) : "",
          xpPool: Number(ev.xp_pool || 0),
          badge: ev.badge?.name || "Event Badge",
          banner: ev.banner || "",
          prizes: ev.prizes || "",
          status: ev.status || "Upcoming",
        })));
      }
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Gagal menyimpan event");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (ev: any) => {
    setTitle(ev.title);
    setDesc(ev.desc);
    setStart(ev.start);
    setEnd(ev.end);
    setXpPool(String(ev.xpPool));
    setBadge(ev.badge);
    parsePrizes(ev.prizes || "");
    setBannerPreview(ev.banner || "");
    setBannerUrl(ev.banner || "");
    setEditId(ev.id);
    setShowAddForm(true);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const rawId = id.replace("EV-", "");
      await api.admin.deleteEvent(rawId);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      setToastMsg("Event Berhasil Dihapus.");
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Gagal menghapus event");
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-16 left-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive stack header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: T.border }}>
        <div className="text-left">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
            Event Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola event khusus agen, tetapkan reward XP, dan atur banner promosi</p>
        </div>
        <button onClick={handleToggleForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md w-full sm:w-auto self-start sm:self-auto cursor-pointer">
          {showAddForm ? "Batal" : <><Plus size={14} /> Buat Event</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ADD EVENT FORM */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b" style={{ borderColor: T.border }}>
                <Zap className="text-[#E8A500]" size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {editId ? "Form Edit Event" : "Form Pembuatan Event Baru"}
                </h3>
              </div>

              <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4 text-left">

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Judul Event</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Mid-Year Listing Bonanza"
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                    style={{ borderColor: T.border }} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Deskripsi Event</label>
                  <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Uraikan detail event, kriteria penilaian, dan benefit bagi agen..."
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                    style={{ borderColor: T.border }} />
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Tanggal Mulai</label>
                    <DateInput value={start} onChange={e => setStart(e.target.value)}
                      className="cursor-pointer"
                      style={{ borderColor: T.border }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
                    <DateInput value={end} onChange={e => setEnd(e.target.value)}
                      className="cursor-pointer"
                      style={{ borderColor: T.border }} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Total XP Pool</label>
                    <input type="number" value={xpPool} onChange={e => setXpPool(e.target.value)}
                      placeholder="Contoh: 100000"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                      style={{ borderColor: T.border }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Badge Reward Utama</label>
                    <select value={badge} onChange={e => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none cursor-pointer animate-fade-in"
                      style={{ borderColor: T.border }}>
                      {ALL_BADGES.map(b => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Upload Banner Event (1200 x 500 px)</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-dashed rounded-xl cursor-pointer text-xs font-bold hover:border-[#E8A500] hover:text-[#E8A500] transition-colors bg-card/50" style={{ borderColor: T.border }}>
                        {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadingBanner ? "Uploading..." : "Upload Banner"}
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                      </label>
                      {bannerFile && !bannerError && (
                        <div className="flex items-center gap-1 text-xs text-green-500 font-semibold">
                          <Check size={14} /> {bannerUrl ? "Tersimpan di server" : bannerFile.name}
                        </div>
                      )}
                      {bannerError && (
                        <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                          <AlertCircle size={14} /> {bannerError}
                        </div>
                      )}
                      {bannerPreview && !bannerUrl && !bannerFile && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileImage size={14} /> Banner tersimpan
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hadiah / Prizes</label>
                      <button
                        type="button"
                        onClick={addPrizeItem}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E8A500]/10 text-[#E8A500] border border-[#E8A500]/20 hover:bg-[#E8A500]/20 transition-colors"
                      >
                        <Plus size={12} /> Tambah
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prizeItems.length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic py-1">Belum ada hadiah. Klik "Tambah" untuk menambahkan.</p>
                      )}
                      {prizeItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.rank}
                            onChange={e => updatePrizeItem(i, "rank", e.target.value)}
                            placeholder="🥇 Juara 1"
                            className="flex-1 px-3 py-2 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, minWidth: 0 }}
                          />
                          <input
                            type="text"
                            value={item.prize}
                            onChange={e => updatePrizeItem(i, "prize", e.target.value)}
                            placeholder="Rp 80.000.000"
                            className="flex-1 px-3 py-2 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, minWidth: 0 }}
                          />
                          <button
                            type="button"
                            onClick={() => removePrizeItem(i)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner preview */}
                {bannerPreview && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Banner Preview (1200 x 500 px)</p>
                    <div className="relative aspect-[1200/500] w-full max-w-lg overflow-hidden rounded-xl border" style={{ borderColor: T.border }}>
                      <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50">
                  {saving ? "Menyimpan..." : (editId ? "Simpan Perubahan Event" : "Publikasikan Event Baru")}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EVENT LISTINGS */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider text-left">Daftar Event</h3>
        
        {events.map((ev, idx) => {
          const statusColor = ev.status === "Active" ? "#E8A500" : "#2563EB";
          
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-5 flex flex-col justify-between overflow-hidden relative hover:shadow-md transition-shadow duration-200" style={{ borderLeft: `4px solid ${statusColor}` }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  
                  {/* Banner / Graphic placeholder */}
                  <div className="w-full sm:w-48 aspect-[1200/500] sm:aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border" style={{ borderColor: T.border }}>
                    {ev.banner ? (
                      <img src={ev.banner} alt={ev.title} className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                      <FileImage size={32} className="text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 space-y-2.5 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h4 className="font-bold text-base text-foreground leading-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{ev.title}</h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border" style={{ borderColor: T.border }}>{ev.id}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex-shrink-0 tracking-wider ${ev.status === "Active" ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                        {ev.status}
                      </span>
                    </div>
                    
                    <EllipsisTooltip text={ev.desc} className="text-xs text-muted-foreground leading-relaxed line-clamp-3 text-left w-full" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2.5 gap-x-4 pt-3 text-xs border-t" style={{ borderColor: T.border }}>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2 lg:col-span-1">
                        <Calendar size={13} className="text-[#E8A500] flex-shrink-0" />
                        <span className="truncate">Periode: <strong className="text-foreground">{ev.start}</strong> s/d <strong className="text-foreground">{ev.end}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                        <span className="w-4 h-4 rounded bg-[#E8A500]/10 border border-[#E8A500]/20 text-[#E8A500] text-[8px] flex items-center justify-center font-bold flex-shrink-0">XP</span>
                        <span>Pool: <strong className="text-[#E8A500]">{ev.xpPool.toLocaleString("id-ID")} XP</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Award size={13} className="text-[#7040D0] flex-shrink-0" />
                        <span className="truncate">Reward: <strong className="text-foreground">{ev.badge}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-2 border-t mt-4 pt-3" style={{ borderColor: T.border }}>
                  <button onClick={() => handleEditClick(ev)}
                    className="p-2 text-[#1A6FC4] hover:bg-[#1A6FC4]/10 rounded-xl transition-all border border-transparent hover:border-[#1A6FC4]/20 cursor-pointer"
                    title="Edit Event">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                    title="Hapus Event">
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl" style={{ borderColor: T.border }}>
            Tidak ada event yang terdaftar. Klik "Buat Event" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
