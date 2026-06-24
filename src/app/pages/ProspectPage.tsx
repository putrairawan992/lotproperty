import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, User, Phone, X, AlertCircle, Calendar, ChevronRight,
  MoreHorizontal, Eye, Trash2, Check, Home, FileText, Trophy, XCircle, Clock,
} from "lucide-react";
import Card from "../components/Card";
import { DateInput, TimeInput } from "../components/DateTimeInput";
import { ProspectPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T } from "../types";
import { useTabQuery, useLocation } from "../routes";
import EllipsisTooltip from "../components/EllipsisTooltip";

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  "New Lead":  { color: "#1A6FC4", bg: "#EEF5FC" },
  "Follow Up": { color: "#D97706", bg: "#FEF3C7" },
  "Showing":   { color: "#16A34A", bg: "#DCFCE7" },
  "Akad":      { color: "#7B2FBE", bg: "#F5F0FD" },
  "Deal":      { color: "#E8A500", bg: "#FFFAED" },
  "Lost":      { color: "#DC2626", bg: "#FEE2E2" },
};

const PIPELINE = [
  { status: "New Lead",  icon: User,     color: "#D97706", desc: "Lead baru masuk" },
  { status: "Follow Up", icon: Phone,    color: "#E8A500", desc: "Sudah dihubungi" },
  { status: "Showing",   icon: Home,     color: "#16A34A", desc: "Sudah showing" },
  { status: "Akad",      icon: FileText, color: "#7B2FBE", desc: "Proses akad" },
  { status: "Deal",      icon: Trophy,   color: "#1A6FC4", desc: "Transaksi berhasil" },
  { status: "Lost",      icon: XCircle,  color: "#DC2626", desc: "Tidak jadi / batal" },
];

const NEXT_ACTIONS = [
  { id: "Follow Up", icon: Phone,    color: "#D97706", activeBorder: "#D97706" },
  { id: "Showing",   icon: Home,     color: "#16A34A", activeBorder: "#16A34A" },
  { id: "Akad",      icon: FileText, color: "#7B2FBE", activeBorder: "#7B2FBE" },
  { id: "Deal",      icon: Trophy,   color: "#1A6FC4", activeBorder: "#1A6FC4" },
  { id: "Lost",      icon: XCircle,  color: "#DC2626", activeBorder: "#DC2626" },
];

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

interface ActivityEntry {
  text: string;
  datetime: string;
}

interface Prospect {
  id: number;
  name: string;
  phone: string;
  status: string;
  date: string;
  note: string;
  initials: string;
  nextAction: string;
  reminderDate: string;
  reminderTime: string;
  followUpDate: string;
  showingDate: string;
  akadDate: string;
  activityLog: ActivityEntry[];
}

const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 0, name: "Budi Santoso", phone: "0812 3456 7890", status: "Follow Up", date: "18 Jun 2025",
    note: "New lead bapak Budi. Mencari sewa rumah PIK. Budget 100 juta/tahun. Prioritas 3BR, dekat pantai. Sudah kirim 2 opsi listing via WA.",
    initials: "BS", nextAction: "Follow Up", reminderDate: "2026-05-22", reminderTime: "10:00",
    followUpDate: "2026-05-22", showingDate: "", akadDate: "",
    activityLog: [
      { text: "Status diubah ke Follow Up. Reminder: 22 Mei 2026 10:00", datetime: "20 Mei 2026 · 11:30" },
      { text: "Prospect ditambahkan sebagai New Lead", datetime: "18 Jun 2025 · 09:15" },
    ],
  },
  {
    id: 1, name: "Linda Kusuma", phone: "0821-9876-5432", status: "Showing", date: "17 Jun 2025",
    note: "Survey rumah di Serpong jadwal Sabtu jam 10 pagi.", initials: "LK",
    nextAction: "Showing", reminderDate: "2026-06-27", reminderTime: "10:00",
    followUpDate: "", showingDate: "2026-06-27", akadDate: "",
    activityLog: [{ text: "Status diubah ke Showing", datetime: "17 Jun 2025 · 14:00" }],
  },
  {
    id: 2, name: "Rendi Setiawan", phone: "0856-1234-5678", status: "New Lead", date: "19 Jun 2025",
    note: "Referral dari Pak Budi. Cari apartemen studio BSD area.", initials: "RS",
    nextAction: "Follow Up", reminderDate: "2026-06-23", reminderTime: "09:00",
    followUpDate: "2026-06-23", showingDate: "", akadDate: "",
    activityLog: [{ text: "Prospect ditambahkan", datetime: "19 Jun 2025 · 08:30" }],
  },
  {
    id: 3, name: "Maya Putri", phone: "0878-2345-6789", status: "Akad", date: "20 Jun 2025",
    note: "Akad KPR dijadwalkan Kamis jam 09.00 di notaris.", initials: "MP",
    nextAction: "Akad", reminderDate: "2026-06-29", reminderTime: "09:00",
    followUpDate: "", showingDate: "", akadDate: "2026-06-29",
    activityLog: [{ text: "Status diubah ke Akad", datetime: "20 Jun 2025 · 10:00" }],
  },
  {
    id: 4, name: "Doni Saputra", phone: "0819-8765-4321", status: "Deal", date: "15 Jun 2025",
    note: "DP sudah masuk 20%. Tunggu proses KPR dari Bank Mandiri.", initials: "DS",
    nextAction: "Deal", reminderDate: "", reminderTime: "",
    followUpDate: "", showingDate: "", akadDate: "",
    activityLog: [{ text: "Status diubah ke Deal", datetime: "15 Jun 2025 · 16:00" }],
  },
  {
    id: 5, name: "Fitri Handayani", phone: "0831-5678-9012", status: "Lost", date: "10 Jun 2025",
    note: "Memutuskan tidak jadi beli. Anggaran dipotong perusahaan.", initials: "FH",
    nextAction: "Lost", reminderDate: "", reminderTime: "",
    followUpDate: "", showingDate: "", akadDate: "",
    activityLog: [{ text: "Status diubah ke Lost", datetime: "10 Jun 2025 · 11:00" }],
  },
];

function formatDateDisplay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function nowLogTime(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: T.text3 }}>{children}</p>;
}

export default function ProspectPage() {
  const loading = useLoading(1100);
  const [filter, setFilter] = useTabQuery("filter", "All");
  const { getQueryParam, navigate, search } = useLocation();
  const detailId = getQueryParam("detail");
  const editMode = getQueryParam("edit") === "1";

  const [showAdd, setShowAdd] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [editForm, setEditForm] = useState<Prospect | null>(null);

  const [newForm, setNewForm] = useState({
    name: "", phone: "", note: "",
    nextAction: "Follow Up",
    reminderDate: "", reminderTime: "",
  });

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (detailId !== null) {
      const p = prospects.find(x => x.id === Number(detailId));
      if (p) setEditForm({ ...p });
    } else {
      setEditForm(null);
    }
  }, [detailId, prospects]);

  useEffect(() => {
    if (getQueryParam("create") === "1") {
      setShowAdd(true);
      navigate("/prospect");
    }
  }, [search]);

  if (loading) return <ProspectPageSkeleton />;

  const detailProspect = detailId !== null ? prospects.find(p => p.id === Number(detailId)) : null;
  const needsReminder = editForm && ["Follow Up", "Showing", "Akad"].includes(editForm.nextAction);
  const newNeedsReminder = ["Follow Up", "Showing", "Akad"].includes(newForm.nextAction);
  const canSaveNew =
    Boolean(newForm.name.trim() && newForm.phone.trim()) &&
    (!newNeedsReminder || Boolean(newForm.reminderDate && newForm.reminderTime));

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const openDetail = (id: number, edit = false) => {
    const prospect = prospects.find(p => p.id === id);
    if (prospect) setEditForm({ ...prospect });
    setOpenMenuId(null);
    const params = new URLSearchParams(window.location.search);
    params.set("detail", String(id));
    if (edit) params.set("edit", "1");
    else params.delete("edit");
    navigate(`/prospect?${params.toString()}`);
  };

  const closeDetail = () => navigate("/prospect");

  const deleteProspect = (id: number) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    setOpenMenuId(null);
    if (detailId === String(id)) closeDetail();
    triggerToast("Prospect berhasil dihapus");
  };

  const handleSave = () => {
    if (!newForm.name.trim() || !newForm.phone.trim()) return;
    if (newNeedsReminder && (!newForm.reminderDate || !newForm.reminderTime)) {
      triggerToast("Tanggal dan jam reminder wajib diisi!");
      return;
    }

    const initials = newForm.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const today = new Date();
    const dateStr = `${today.getDate()} ${MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getFullYear()}`;
    const reminderStr = newForm.reminderDate
      ? ` Reminder: ${formatDateDisplay(newForm.reminderDate)} ${newForm.reminderTime}`
      : "";
    const logTime = nowLogTime();

    setProspects(prev => [...prev, {
      id: prev.length,
      name: newForm.name.trim(),
      phone: newForm.phone.trim(),
      status: newForm.nextAction,
      date: dateStr,
      note: newForm.note.trim() || "—",
      initials,
      nextAction: newForm.nextAction,
      reminderDate: newForm.reminderDate,
      reminderTime: newForm.reminderTime,
      followUpDate: newForm.nextAction === "Follow Up" ? newForm.reminderDate : "",
      showingDate: newForm.nextAction === "Showing" ? newForm.reminderDate : "",
      akadDate: newForm.nextAction === "Akad" ? newForm.reminderDate : "",
      activityLog: [
        { text: "New Lead dibuat", datetime: logTime },
        { text: `Status diubah ke ${newForm.nextAction}.${reminderStr}`, datetime: logTime },
      ],
    }]);

    setNewForm({ name: "", phone: "", note: "", nextAction: "Follow Up", reminderDate: "", reminderTime: "" });
    setShowAdd(false);
    triggerToast("Prospect baru berhasil ditambahkan!");
  };

  const handleSaveDetail = () => {
    if (!editForm) return;
    if (needsReminder && (!editForm.reminderDate || !editForm.reminderTime)) {
      triggerToast("Tanggal dan jam reminder wajib diisi!");
      return;
    }

    const reminderStr = editForm.reminderDate
      ? ` Reminder: ${formatDateDisplay(editForm.reminderDate)} ${editForm.reminderTime}`
      : "";

    const updated: Prospect = {
      ...editForm,
      status: editForm.nextAction,
      followUpDate: editForm.nextAction === "Follow Up" ? editForm.reminderDate : editForm.followUpDate,
      showingDate: editForm.nextAction === "Showing" ? editForm.reminderDate : editForm.showingDate,
      akadDate: editForm.nextAction === "Akad" ? editForm.reminderDate : editForm.akadDate,
      activityLog: [
        { text: `Status diubah ke ${editForm.nextAction}.${reminderStr}`, datetime: nowLogTime() },
        ...editForm.activityLog,
      ],
    };

    setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
    triggerToast("Perubahan berhasil disimpan!");
    navigate(`/prospect?detail=${updated.id}`);
  };

  const filters = ["All", "New Lead", "Follow Up", "Showing", "Akad", "Deal", "Lost"];
  const filtered = filter === "All" ? prospects : prospects.filter(p => p.status === filter);

  const Toast = () => (
    <AnimatePresence>
      {successToast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-green-500/20">
          <Check size={16} /> {successToast}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ActionMenu = ({ prospect, alignUp }: { prospect: Prospect; alignUp?: boolean }) => (
    <div className="relative" ref={openMenuId === prospect.id ? menuRef : undefined}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === prospect.id ? null : prospect.id); }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        style={{ color: T.text3 }}
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {openMenuId === prospect.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: alignUp ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: alignUp ? 4 : -4 }}
            className={`absolute right-0 w-40 rounded-xl border shadow-xl z-50 overflow-hidden ${
              alignUp ? "bottom-full mb-1" : "top-full mt-1"
            }`}
            style={{ backgroundColor: T.card, borderColor: T.border }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: "Lihat Detail", icon: Eye, action: () => openDetail(prospect.id) },
              { label: "Edit", icon: User, action: () => openDetail(prospect.id, true) },
              { label: "Hapus", icon: Trash2, action: () => deleteProspect(prospect.id), danger: true },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium hover:bg-muted transition-colors text-left"
                style={{ color: item.danger ? "#DC2626" : T.text1 }}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const detailFormData = detailProspect ? (editForm ?? detailProspect) : null;
  const detailSc = detailFormData ? (STATUS_CFG[detailFormData.status] || STATUS_CFG["New Lead"]) : null;
  const isDetailReadOnly = !editMode;

  /* ── List View ── */
  return (
    <div className="p-4 lg:p-6 relative">
      <Toast />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: T.text1 }}>Prospect</h1>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif" }}>
            <Plus size={15} /> Tambah Prospect
          </button>
        </div>

        {/* Add panel */}
        <AnimatePresence>
          {showAdd && (
            <div className="fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/45" onClick={() => { setShowAdd(false); setNewForm({ name: "", phone: "", note: "", nextAction: "Follow Up", reminderDate: "", reminderTime: "" }); }} aria-hidden />
              <motion.div className="relative z-10 w-full h-full bg-card shadow-2xl flex flex-col" style={{ maxWidth: 420 }}
                initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: T.border }}>
                  <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Tambah Prospect Baru</h3>
                  <button onClick={() => { setShowAdd(false); setNewForm({ name: "", phone: "", note: "", nextAction: "Follow Up", reminderDate: "", reminderTime: "" }); }} style={{ color: T.text3 }}><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Nama Lengkap <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
                      <input type="text" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nama prospect..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none bg-card text-sm"
                        style={{ borderColor: T.border, color: T.text1 }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Nomor HP <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
                      <input type="tel" value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="08xx-xxxx-xxxx" className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none bg-card text-sm"
                        style={{ borderColor: T.border, color: T.text1 }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: T.text3 }}>Catatan</label>
                    <textarea value={newForm.note} onChange={e => setNewForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Info kebutuhan, budget, preferensi properti..."
                      className="w-full px-4 py-3 rounded-xl border outline-none bg-card resize-none text-sm"
                      style={{ borderColor: T.border, minHeight: 96, color: T.text1 }} />
                  </div>

                  <div>
                    <SectionLabel>Next Action (Wajib)</SectionLabel>
                    <div className="grid grid-cols-5 gap-2">
                      {NEXT_ACTIONS.map(action => {
                        const active = newForm.nextAction === action.id;
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => setNewForm(f => ({ ...f, nextAction: action.id }))}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all"
                            style={{
                              borderColor: active ? action.activeBorder : T.border,
                              backgroundColor: active ? `${action.color}15` : "transparent",
                            }}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: active ? `${action.color}25` : "var(--muted)", color: active ? action.color : T.text3 }}>
                              <Icon size={18} />
                            </div>
                            <span className="text-[9px] font-semibold text-center leading-tight"
                              style={{ color: active ? action.color : T.text3 }}>
                              {action.id}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {newNeedsReminder && (
                    <div>
                      <SectionLabel>Reminder (Wajib untuk Follow Up / Showing / Akad)</SectionLabel>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Tanggal</p>
                          <DateInput
                            value={newForm.reminderDate}
                            onChange={e => setNewForm(f => ({ ...f, reminderDate: e.target.value }))}
                            style={{ borderColor: T.border, color: T.text1 }}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Jam</p>
                          <TimeInput
                            value={newForm.reminderTime}
                            onChange={e => setNewForm(f => ({ ...f, reminderTime: e.target.value }))}
                            style={{ borderColor: T.border, color: T.text1 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(!newForm.name.trim() || !newForm.phone.trim()) && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: T.text3 }}>
                      <AlertCircle size={12} /> Nama dan Nomor HP wajib diisi
                    </p>
                  )}
                  {newNeedsReminder && (!newForm.reminderDate || !newForm.reminderTime) && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: T.text3 }}>
                      <AlertCircle size={12} /> Tanggal dan jam reminder wajib diisi
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 p-5 border-t" style={{ borderColor: T.border }}>
                  <button onClick={handleSave} disabled={!canSaveNew}
                    className="w-full py-3 rounded-xl font-bold transition-all text-center text-white"
                    style={{
                      backgroundColor: canSaveNew ? "#E8A500" : "var(--border)",
                      fontFamily: "'Rajdhani', sans-serif", fontSize: 16,
                      cursor: canSaveNew ? "pointer" : "not-allowed",
                    }}>
                    Simpan Prospect
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Tab / Table Wrapper Card */}
        <Card className="overflow-hidden border border-border/40 mb-6" style={{ backgroundColor: T.card }}>
          
          {/* Tab Filter Button Row */}
          <div className="flex border-b overflow-x-auto" style={{ borderColor: T.border }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-all"
                style={{ color: filter === f ? "#E8A500" : T.text3, borderBottom: filter === f ? "2px solid #E8A500" : "2px solid transparent" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Mobile: card layout */}
          <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
            {filtered.map((p, index) => {
              const sc = STATUS_CFG[p.status];
              return (
                <div key={p.id} className="p-4 cursor-pointer transition-all hover:bg-muted/10 relative" onClick={() => openDetail(p.id)}>
                  <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                    <ActionMenu prospect={p} alignUp={index === filtered.length - 1} />
                  </div>
                  <div className="flex items-start gap-3 mb-3 pr-8">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>{p.initials}</div>
                    <div className="flex-1 min-w-0">
                      <EllipsisTooltip 
                        text={p.name} 
                        className="font-semibold text-sm truncate block" 
                        style={{ color: T.text1 }} 
                      />
                      <div className="mt-1">
                        <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap uppercase tracking-wider"
                          style={{ backgroundColor: sc.bg, color: sc.color }}>{p.status}</span>
                      </div>
                      <p className="text-xs flex items-center gap-1 mt-1.5" style={{ color: T.text3 }}>
                        <Phone size={10} />{p.phone}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: T.text3 }}>{p.note}</p>
                  {p.reminderDate && (
                    <p className="text-[10px] flex items-center gap-1 font-semibold" style={{ color: "#D97706" }}>
                      <Calendar size={10} /> Reminder: {formatDateDisplay(p.reminderDate)} {p.reminderTime}
                    </p>
                  )}
                  <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: T.text3 }}>
                    <Calendar size={10} /> Dibuat: {p.date}
                  </p>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-4 py-10 text-center text-sm" style={{ color: T.text3 }}>
                Tidak ada prospect ditemukan.
              </p>
            )}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: T.border }}>
                  {["PROSPECT", "STATUS", "NEXT ACTION", "REMINDER", "DIBUAT", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: T.text3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, index) => {
                  const sc = STATUS_CFG[p.status];
                  const actionCfg = NEXT_ACTIONS.find(a => a.id === p.nextAction) || NEXT_ACTIONS[0];
                  const ActionIcon = actionCfg.icon;
                  return (
                    <tr
                      key={p.id}
                      className="border-b transition-colors cursor-pointer"
                      style={{ borderColor: T.border }}
                      onClick={() => openDetail(p.id)}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-4 py-3 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: sc.bg, color: sc.color }}>{p.initials}</div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: T.text1 }}>{p.name}</p>
                            <p className="text-xs flex items-center gap-1" style={{ color: T.text3 }}>
                              <Phone size={10} />{p.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{ backgroundColor: sc.bg, color: sc.color }}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: actionCfg.color }}>
                          <ActionIcon size={14} />
                          <span>{p.nextAction}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: T.text2 }}>
                        {p.reminderDate ? (
                          <div className="flex items-center gap-1 text-[#D97706] font-semibold">
                             <Calendar size={12} />
                             <span>{formatDateDisplay(p.reminderDate)} {p.reminderTime}</span>
                          </div>
                        ) : (
                          <span style={{ color: T.text3 }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: T.text3 }}>{p.date}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <ActionMenu prospect={p} alignUp={index === filtered.length - 1} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: T.text3 }}>
                      Tidak ada prospect ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pipeline */}
        <Card className="p-4 mt-5 overflow-x-auto">
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: T.text3 }}>Prospect Pipeline</p>
          <div className="flex items-center gap-1 min-w-max">
            {PIPELINE.map((step, i) => {
              const Icon = step.icon;
              const count = prospects.filter(p => p.status === step.status).length;
              return (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center" style={{ width: 72 }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1"
                      style={{ borderColor: step.color, backgroundColor: `${step.color}15`, color: step.color }}>
                      <Icon size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-center leading-tight" style={{ color: step.color }}>{step.status}</p>
                    <p className="text-[8px] text-center leading-tight mt-0.5" style={{ color: T.text3 }}>{count}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="w-6 h-0.5 mx-0.5 flex-shrink-0" style={{ backgroundColor: T.border }} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Detail / Edit modal */}
      <AnimatePresence>
        {detailProspect && detailFormData && detailSc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDetail}
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card rounded-t-2xl sm:rounded-2xl border shadow-2xl"
              style={{ borderColor: T.border }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b bg-card" style={{ borderColor: T.border }}>
                <h2 className="font-bold text-base" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
                  {editMode ? "Edit Prospect" : "Detail Prospect"}
                </h2>
                <div className="flex items-center gap-1">
                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => openDetail(detailFormData.id, true)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    style={{ color: T.text3 }}
                    aria-label="Tutup"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: detailSc.bg, color: detailSc.color }}>
                    {detailFormData.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <EllipsisTooltip 
                      text={detailFormData.name} 
                      className="font-bold text-base truncate block" 
                      style={{ color: T.text1 }} 
                    />
                    <p className="text-sm flex items-center gap-1" style={{ color: T.text3 }}>
                      <Phone size={12} /> {detailFormData.phone}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                    style={{ backgroundColor: detailSc.bg, color: detailSc.color }}>
                    {detailFormData.status}
                  </span>
                </div>

                <div>
                  <SectionLabel>Catatan</SectionLabel>
                  {isDetailReadOnly ? (
                    <p className="text-sm p-3 rounded-xl border leading-relaxed" style={{ borderColor: T.border, color: T.text2, backgroundColor: "var(--muted)" }}>
                      {detailFormData.note}
                    </p>
                  ) : (
                    <textarea
                      value={detailFormData.note}
                      onChange={e => setEditForm(f => f ? { ...f, note: e.target.value } : f)}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                      style={{ borderColor: T.border, color: T.text1 }}
                    />
                  )}
                </div>

                <div>
                  <SectionLabel>Next Action (Wajib)</SectionLabel>
                  <div className="grid grid-cols-5 gap-2">
                    {NEXT_ACTIONS.map(action => {
                      const active = detailFormData.nextAction === action.id;
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          type="button"
                          disabled={isDetailReadOnly}
                          onClick={() => setEditForm(f => f ? { ...f, nextAction: action.id } : f)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: active ? action.activeBorder : T.border,
                            backgroundColor: active ? `${action.color}15` : "transparent",
                            opacity: isDetailReadOnly && !active ? 0.4 : 1,
                            cursor: isDetailReadOnly ? "default" : "pointer",
                          }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: active ? `${action.color}25` : "var(--muted)", color: active ? action.color : T.text3 }}>
                            <Icon size={18} />
                          </div>
                          <span className="text-[9px] font-semibold text-center leading-tight"
                            style={{ color: active ? action.color : T.text3 }}>
                            {action.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {["Follow Up", "Showing", "Akad"].includes(detailFormData.nextAction) && (
                  <div>
                    <SectionLabel>Reminder (Wajib untuk Follow Up / Showing / Akad)</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Tanggal</p>
                        {isDetailReadOnly ? (
                          <p className="text-sm font-medium px-3 py-2.5 rounded-xl border" style={{ borderColor: T.border, color: T.text1 }}>
                            {formatDateDisplay(detailFormData.reminderDate) || "—"}
                          </p>
                        ) : (
                          <DateInput value={detailFormData.reminderDate}
                            onChange={e => setEditForm(f => f ? { ...f, reminderDate: e.target.value } : f)}
                            style={{ borderColor: T.border, color: T.text1 }} />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Jam</p>
                        {isDetailReadOnly ? (
                          <p className="text-sm font-medium px-3 py-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: T.border, color: T.text1 }}>
                            <Clock size={14} style={{ color: T.text3 }} /> {detailFormData.reminderTime || "—"}
                          </p>
                        ) : (
                          <TimeInput value={detailFormData.reminderTime}
                            onChange={e => setEditForm(f => f ? { ...f, reminderTime: e.target.value } : f)}
                            style={{ borderColor: T.border, color: T.text1 }} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <SectionLabel>Activity Log</SectionLabel>
                  <div className="space-y-3">
                    {detailFormData.activityLog.map((log, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: T.text3 }} />
                        <div>
                          <p className="text-xs leading-relaxed" style={{ color: T.text2 }}>{log.text}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: T.text3 }}>{log.datetime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={handleSaveDetail}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all"
                    style={{ backgroundColor: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.04em" }}
                  >
                    Simpan Perubahan
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
