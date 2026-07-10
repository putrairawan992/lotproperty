import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Pencil, Trash2, QrCode, Download, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import Card from "../../components/Card";
import AdminPagination from "../../components/AdminPagination";
import { T } from "../../types";
import { api } from "../../services/api";

interface QuestCode {
  id: number;
  code: string;
  label: string;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminQuestParticipationTab() {
  const [codes, setCodes] = useState<QuestCode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [xpReward, setXpReward] = useState("1000");
  const [isActive, setIsActive] = useState(true);

  const [barcodeFor, setBarcodeFor] = useState<QuestCode | null>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("");

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getQuestParticipationCodes({
        search,
        status: statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
        page,
        pageSize,
      });
      setCodes(res?.data || []);
      setTotal(res?.total || 0);
    } catch {
      setCodes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(loadCodes, 300);
    return () => clearTimeout(t);
  }, [loadCodes]);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setToastType(type);
    setToastMsg(msg);
  };

  const resetForm = () => {
    setCode("");
    setLabel("");
    setXpReward("1000");
    setIsActive(true);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (c: QuestCode) => {
    setCode(c.code);
    setLabel(c.label || "");
    setXpReward(String(c.xp_reward || 1000));
    setIsActive(c.is_active);
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      notify("Kode event wajib diisi!", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { code: code.trim(), label: label.trim(), xp_reward: parseInt(xpReward) || 1000, is_active: isActive };
      if (editId) {
        await api.admin.updateQuestParticipationCode(editId, payload);
        notify("Kode Quest Participation berhasil diperbarui!", "success");
      } else {
        await api.admin.createQuestParticipationCode(payload);
        notify("Kode Quest Participation berhasil dibuat!", "success");
      }
      resetForm();
      setPage(1);
      loadCodes();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Gagal menyimpan kode", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: QuestCode) => {
    try {
      await api.admin.deleteQuestParticipationCode(c.id);
      notify("Kode berhasil dihapus.", "success");
      loadCodes();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Gagal menghapus kode", "error");
    }
  };

  const openBarcode = async (c: QuestCode) => {
    setBarcodeFor(c);
    const dataUrl = await QRCode.toDataURL(c.code, { width: 320, margin: 2 });
    setBarcodeDataUrl(dataUrl);
  };

  const downloadBarcode = () => {
    if (!barcodeDataUrl || !barcodeFor) return;
    const a = document.createElement("a");
    a.href = barcodeDataUrl;
    a.download = `quest-code-${barcodeFor.code}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-16 left-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold text-white ${
              toastType === "error" ? "bg-[#DC2626] border border-red-500/30" : "bg-[#16A34A] border border-green-500/20"
            }`}>
            {toastType === "error" ? <span className="text-base leading-none">⚠️</span> : <Check size={16} />}
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <div className="p-4 border-b space-y-3" style={{ borderColor: T.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold" style={{ color: T.text1 }}>Kode Quest Participation</h3>
              <p className="text-xs mt-0.5" style={{ color: T.text3 }}>Dipakai agent untuk klaim XP di Quest page (scan QR / input manual).</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer">
              <Plus size={14} /> Buat Kode
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
              <input type="text" value={search} onChange={e => { setPage(1); setSearch(e.target.value); }}
                placeholder="Cari kode atau label..."
                className="w-full pl-9 pr-9 py-2 rounded-xl border text-sm outline-none bg-card"
                style={{ borderColor: T.border }} />
              {search && (
                <button onClick={() => { setPage(1); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>
            <select value={statusFilter} onChange={e => { setPage(1); setStatusFilter(e.target.value); }}
              className="px-3 py-2 rounded-xl border text-sm outline-none bg-card font-medium cursor-pointer" style={{ borderColor: T.border, color: T.text1 }}>
              <option value="All">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8A500]"></div>
            <p className="text-xs font-semibold">Memuat kode...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: T.text3 }}>
            <QrCode size={28} className="opacity-40" />
            <p className="text-xs font-semibold">Belum ada kode Quest Participation.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {codes.map(c => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-4 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-mono font-bold" style={{ color: T.text1 }}>{c.code}</p>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${c.is_active ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20" : "bg-muted text-muted-foreground border"}`}>
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: T.text3 }}>{c.label || "Tanpa label"} · <strong className="text-[#E8A500]">{c.xp_reward.toLocaleString("id-ID")} XP</strong></p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openBarcode(c)} title="Generate Barcode"
                    className="p-2 text-[#7040D0] hover:bg-[#7040D0]/10 rounded-xl transition-all border border-transparent hover:border-[#7040D0]/20 cursor-pointer">
                    <QrCode size={15} />
                  </button>
                  <button onClick={() => handleEditClick(c)} title="Edit Kode"
                    className="p-2 text-[#1A6FC4] hover:bg-[#1A6FC4]/10 rounded-xl transition-all border border-transparent hover:border-[#1A6FC4]/20 cursor-pointer">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(c)} title="Hapus Kode"
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <AdminPagination page={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </Card>

      {/* Create/Edit modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={resetForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-background shadow-2xl relative" style={{ borderColor: T.border, borderWidth: 1 }} onClick={e => e.stopPropagation()}>
              <button onClick={resetForm} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground z-10 transition-colors cursor-pointer">
                <X size={20} />
              </button>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-6 pb-3 border-b" style={{ borderColor: T.border }}>
                  <QrCode className="text-[#E8A500]" size={22} />
                  <h3 className="font-bold text-lg uppercase tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {editId ? "Edit Kode" : "Buat Kode Quest Participation"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Kode Event</label>
                    <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: LOT-EVENT-2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                      style={{ borderColor: T.border }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Label (opsional)</label>
                    <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                      placeholder="Contoh: Mid-Year Gathering"
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                      style={{ borderColor: T.border }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Reward XP</label>
                    <input type="number" value={xpReward} onChange={e => setXpReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none font-semibold"
                      style={{ borderColor: T.border }} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider" style={{ color: T.text2 }}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="cursor-pointer" />
                    Kode Aktif
                  </label>

                  <div className="flex gap-3 pt-4 border-t mt-2" style={{ borderColor: T.border }}>
                    <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer" style={{ borderColor: T.border }}>
                      Batal
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50">
                      {saving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Buat Kode")}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode modal */}
      <AnimatePresence>
        {barcodeFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBarcodeFor(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-2xl bg-background shadow-2xl relative p-6 text-center" style={{ borderColor: T.border, borderWidth: 1 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setBarcodeFor(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
              <h3 className="font-bold text-base uppercase tracking-wide mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Barcode Kode Event</h3>
              <p className="text-xs font-mono mb-4" style={{ color: T.text3 }}>{barcodeFor.code}</p>
              {barcodeDataUrl ? (
                <img src={barcodeDataUrl} alt={barcodeFor.code} className="mx-auto rounded-xl border" style={{ borderColor: T.border }} />
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E8A500]"></div>
                </div>
              )}
              <button onClick={downloadBarcode} disabled={!barcodeDataUrl}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E8A500] hover:bg-[#CC9200] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50">
                <Download size={14} /> Download Barcode
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
