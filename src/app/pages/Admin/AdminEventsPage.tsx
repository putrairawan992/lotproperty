import React, { useState, useEffect } from "react";
import { Zap, Calendar, Award, Check, AlertCircle, Plus, Trash2, Upload, FileImage, X, Pencil, Loader2, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import { DateInput } from "../../components/DateTimeInput";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { T } from "../../types";
import { api } from "../../services/api";
import { ALL_BADGES } from "../ProfilePage";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [dbBadges, setDbBadges] = useState<any[]>([]);

  const [toastMsg, setToastMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventData, badgeData] = await Promise.all([
          api.events.getList().catch(() => []),
          api.admin.getBadges().catch(() => [])
        ]);

        if (Array.isArray(badgeData)) {
          setDbBadges(badgeData);
        }

        if (Array.isArray(eventData)) {
          setEvents(eventData.map((ev: any) => ({
            id: `EV-${ev.id}`,
            title: ev.title || "",
            desc: ev.desc || "",
            start: ev.start_date ? ev.start_date.slice(0, 10) : "",
            end: ev.end_date ? ev.end_date.slice(0, 10) : "",
            xpPool: Number(ev.xp_pool || 0),
            badge_id: ev.badge_id || "",
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
    loadData();
  }, []);

  // Form Inputs
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [xpPool, setXpPool] = useState("");
  const [badgeId, setBadgeId] = useState<string | number>("");
  const [prizeItems, setPrizeItems] = useState<{rank: string; prize: string}[]>([]);
  
  // Custom Badge Upload States
  const [customBadgeFile, setCustomBadgeFile] = useState<File | null>(null);
  const [customBadgePreview, setCustomBadgePreview] = useState("");
  const [customBadgeName, setCustomBadgeName] = useState("");
  const [customBadgeRarity, setCustomBadgeRarity] = useState("rare");
  const [uploadingBadge, setUploadingBadge] = useState(false);
  const [badgeError, setBadgeError] = useState("");

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

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const handleToggleForm = () => {
    if (showAddForm) {
      setTitle("");
      setDesc("");
      setStart("");
      setEnd("");
      setXpPool("");
      setBadgeId("");
      setPrizeItems([]);
      setBannerFile(null);
      setBannerPreview("");
      setBannerUrl("");
      setBannerError("");
      setCustomBadgeFile(null);
      setCustomBadgePreview("");
      setCustomBadgeName("");
      setCustomBadgeRarity("rare");
      setBadgeError("");
      setEditId(null);
      setShowAddForm(false);
    } else {
      setShowAddForm(true);
    }
  };

  const handleCustomBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      setBadgeError("Badge harus berformat PNG");
      setCustomBadgeFile(null);
      setCustomBadgePreview("");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== 1254 || img.height !== 1254) {
        setBadgeError("Ukuran badge harus persis 1254 x 1254 pixel");
        setCustomBadgeFile(null);
        setCustomBadgePreview("");
      } else {
        setBadgeError("");
        setCustomBadgeFile(file);
        setCustomBadgePreview(url);
      }
    };
    img.onerror = () => {
      setBadgeError("File gambar tidak valid");
    };
    img.src = url;
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

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
    
    if (badgeId === "upload" && !customBadgeFile) {
      setToastMsg("Pilih file badge custom yang akan diupload!");
      return;
    }
    
    if (badgeId === "upload" && !customBadgeName.trim()) {
      setToastMsg("Nama badge custom tidak boleh kosong!");
      return;
    }

    setToastMsg("");
    setSaving(true);
    try {
      let finalBadgeId = badgeId;
      
      if (badgeId === "upload" && customBadgeFile) {
        setUploadingBadge(true);
        try {
          const res = await api.admin.uploadEventBadge(customBadgeFile, customBadgeName, customBadgeRarity);
          finalBadgeId = res.badge_id;
        } catch (err) {
          throw new Error("Gagal mengupload custom badge.");
        } finally {
          setUploadingBadge(false);
        }
      }

      const finalBanner = bannerUrl || bannerPreview;

      const isNumeric = !isNaN(Number(finalBadgeId)) && finalBadgeId !== "";
      const payloadId = isNumeric ? parseInt(finalBadgeId as string) : null;
      const payloadName = !isNumeric && finalBadgeId !== "upload" && finalBadgeId ? finalBadgeId as string : "";

      const payload = {
        title: title.trim(),
        desc: desc.trim(),
        start_date: new Date(start).toISOString(),
        end_date: new Date(end).toISOString(),
        xp_pool: parseInt(xpPool) || 0,
        badge_id: payloadId,
        badge_name: payloadName,
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

      const data = await api.events.getList();
      if (Array.isArray(data)) {
        setEvents(data.map((ev: any) => ({
          id: `EV-${ev.id}`,
          title: ev.title || "",
          desc: ev.desc || "",
          start: ev.start_date ? ev.start_date.slice(0, 10) : "",
          end: ev.end_date ? ev.end_date.slice(0, 10) : "",
          xpPool: Number(ev.xp_pool || 0),
          badge_id: ev.badge_id || "",
          badge: ev.badge?.name || "Event Badge",
          banner: ev.banner || "",
          prizes: ev.prizes || "",
          status: ev.status || "Upcoming",
        })));
      }

      const newBadges = await api.admin.getBadges().catch(() => []);
      if (Array.isArray(newBadges)) setDbBadges(newBadges);

      handleToggleForm();
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Gagal menyimpan event");
      setSaving(false);
    }
  };

  const handleEditClick = (ev: any) => {
    setTitle(ev.title);
    setDesc(ev.desc);
    setStart(ev.start);
    setEnd(ev.end);
    setXpPool(String(ev.xpPool));
    setBadgeId(ev.badge_id || ev.badge || ""); // Fallback to badge name if badge_id is null
    parsePrizes(ev.prizes || "");
    setBannerPreview(ev.banner || "");
    setBannerUrl(ev.banner || "");
    
    setCustomBadgeFile(null);
    setCustomBadgePreview("");
    setCustomBadgeName("");
    setCustomBadgeRarity("rare");
    setBadgeError("");
    
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: T.border }}>
        <div className="text-left">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
            Event Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola event khusus agen, tetapkan reward XP, dan atur banner promosi</p>
        </div>
        <button onClick={handleToggleForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md w-full sm:w-auto self-start sm:self-auto cursor-pointer">
          <Plus size={14} /> Buat Event
        </button>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl relative" style={{ borderColor: T.border, borderWidth: 1 }}>
              
              <button onClick={handleToggleForm} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground z-10 transition-colors cursor-pointer">
                <X size={20} />
              </button>
              
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-2.5 mb-6 pb-3 border-b" style={{ borderColor: T.border }}>
                  <Zap className="text-[#E8A500]" size={22} />
                  <h3 className="font-bold text-lg uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {editId ? "Edit Event" : "Pembuatan Event Baru"}
                  </h3>
                </div>

                <form onSubmit={handleCreateOrUpdateEvent} className="space-y-5 text-left">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Badge Reward Utama</label>
                      <select value={badgeId} onChange={e => setBadgeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none cursor-pointer animate-fade-in"
                        style={{ borderColor: T.border }}>
                        <option value="">— Tidak Ada Badge —</option>
                        <option value="upload" className="font-bold text-[#E8A500]">— Upload Badge Baru —</option>
                        
                        {dbBadges.length > 0 ? (
                          dbBadges.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.rarity})</option>
                          ))
                        ) : (
                          // Fallback if DB fetch fails
                          ALL_BADGES.map((b, idx) => (
                            <option key={`fallback-${idx}`} value={b.name}>{b.name} ({b.rarity})</option>
                          ))
                        )}
                      </select>
                      
                      {/* Custom Badge Upload UI */}
                      {badgeId === "upload" && (
                        <div className="p-4 border rounded-xl border-dashed bg-card/30 space-y-3" style={{ borderColor: T.border }}>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Upload Custom Badge</p>
                          <div className="flex items-start gap-4">
                            <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed rounded-xl cursor-pointer text-xs font-bold hover:border-[#E8A500] hover:text-[#E8A500] transition-colors bg-card/50 overflow-hidden relative" style={{ borderColor: T.border }}>
                              {customBadgePreview ? (
                                <img src={customBadgePreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center text-muted-foreground/60">
                                  {uploadingBadge ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} className="mb-1" />}
                                  <span className="text-[9px]">Upload</span>
                                </div>
                              )}
                              <input type="file" accept="image/png" onChange={handleCustomBadgeChange} className="hidden" disabled={uploadingBadge} />
                            </label>
                            
                            <div className="flex-1 text-xs space-y-1">
                              <input 
                                type="text"
                                placeholder="Contoh: Mid-Year Champion"
                                value={customBadgeName}
                                onChange={(e) => setCustomBadgeName(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg border bg-card text-xs outline-none mb-1"
                                style={{ borderColor: T.border }}
                              />
                              <select 
                                value={customBadgeRarity}
                                onChange={(e) => setCustomBadgeRarity(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg border bg-card text-xs outline-none mb-2"
                                style={{ borderColor: T.border }}
                              >
                                <option value="mythic">Mythic</option>
                                <option value="legendary">Legendary</option>
                                <option value="epic">Epic</option>
                                <option value="rare">Rare</option>
                                <option value="common">Common</option>
                              </select>

                              <p className="text-muted-foreground">Format wajib: <strong className="text-foreground">PNG</strong></p>
                              <p className="text-muted-foreground">Ukuran wajib: <strong className="text-foreground">1254 x 1254 pixel</strong></p>
                              {badgeError && (
                                <p className="text-red-500 font-bold flex items-center gap-1 mt-2">
                                  <AlertCircle size={12} /> {badgeError}
                                </p>
                              )}
                              {customBadgeFile && !badgeError && (
                                <p className="text-green-500 font-bold flex items-center gap-1 mt-2">
                                  <Check size={12} /> File sesuai standard
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Upload Banner Event (1200x500px)</label>
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
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hadiah / Prizes</label>
                      <button
                        type="button"
                        onClick={addPrizeItem}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E8A500]/10 text-[#E8A500] border border-[#E8A500]/20 hover:bg-[#E8A500]/20 transition-colors"
                      >
                        <Plus size={12} /> Tambah Hadiah
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prizeItems.length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic py-1 bg-card/30 rounded-xl p-3 text-center border border-dashed" style={{ borderColor: T.border }}>Belum ada hadiah terdaftar. Klik "Tambah Hadiah" untuk membuat list.</p>
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

                  {/* Banner preview */}
                  {bannerPreview && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Banner Preview</p>
                      <div className="relative aspect-[1200/500] w-full max-w-lg overflow-hidden rounded-xl border" style={{ borderColor: T.border }}>
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t mt-6" style={{ borderColor: T.border }}>
                    <button type="button" onClick={handleToggleForm} className="px-5 py-3 rounded-xl border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer" style={{ borderColor: T.border }}>
                      Batal
                    </button>
                    <button type="submit" disabled={saving || uploadingBadge || uploadingBanner || (badgeId === "upload" && !customBadgeFile)} className="flex-1 py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50">
                      {saving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Publikasikan Event")}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
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
                        <span className="truncate">Reward: <strong className="text-foreground">{ev.badge || "Tidak Ada"}</strong></span>
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
