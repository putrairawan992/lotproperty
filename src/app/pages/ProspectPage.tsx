import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, User, Phone, X, AlertCircle, Calendar, ChevronRight,
  MoreHorizontal, Eye, Trash2, Check, Home, FileText, Trophy, XCircle, Clock,
} from "lucide-react";
import Card from "../components/Card";
import { ProspectPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T } from "../types";
import { useTabQuery, useLocation } from "../routes";

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
  const { getQueryParam, navigate } = useLocation();
  const detailId = getQueryParam("detail");
  const editMode = getQueryParam("edit") === "1";

  const [showAdd, setShowAdd] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [editForm, setEditForm] = useState<Prospect | null>(null);

  const [newForm, setNewForm] = useState({
    name: "", phone: "", note: "", status: "New Lead",
    followUpDate: "", showingDate: "", akadDate: "",
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (detailId !== null) {
      const p = prospects.find(x => x.id === Number(detailId));
      if (p) setEditForm({ ...p });
    } else {
      setEditForm(null);
    }
  }, [detailId, prospects]);

  if (loading) return <ProspectPageSkeleton />;

  const detailProspect = detailId !== null ? prospects.find(p => p.id === Number(detailId)) : null;
  const needsReminder = editForm && ["Follow Up", "Showing", "Akad"].includes(editForm.nextAction);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const openDetail = (id: number, edit = false) => {
    setOpenMenuId(null);
    navigate(edit ? `/prospect?detail=${id}&edit=1` : `/prospect?detail=${id}`);
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
    const initials = newForm.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const today = new Date();
    const dateStr = `${today.getDate()} ${MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getFullYear()}`;

    setProspects(prev => [...prev, {
      id: prev.length,
      name: newForm.name.trim(),
      phone: newForm.phone.trim(),
      status: newForm.status,
      date: dateStr,
      note: newForm.note.trim() || "—",
      initials,
      nextAction: newForm.status === "New Lead" ? "Follow Up" : newForm.status,
      reminderDate: newForm.followUpDate || newForm.showingDate || newForm.akadDate || "",
      reminderTime: "09:00",
      followUpDate: newForm.followUpDate,
      showingDate: newForm.showingDate,
      akadDate: newForm.akadDate,
      activityLog: [{ text: "Prospect ditambahkan", datetime: nowLogTime() }],
    }]);

    setNewForm({ name: "", phone: "", note: "", status: "New Lead", followUpDate: "", showingDate: "", akadDate: "" });
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

  const ActionMenu = ({ prospect }: { prospect: Prospect }) => (
    <div className="relative" ref={openMenuId === prospect.id ? menuRef : undefined}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === prospect.id ? null : prospect.id); }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        style={{ color: T.text3 }}
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {openMenuId === prospect.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-xl z-20 overflow-hidden"
            style={{ backgroundColor: T.card, borderColor: T.border }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: "Lihat Detail", icon: Eye, action: () => openDetail(prospect.id) },
              { label: "Edit", icon: User, action: () => openDetail(prospect.id, true) },
              { label: "Hapus", icon: Trash2, action: () => deleteProspect(prospect.id), danger: true },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium hover:bg-muted transition-colors text-left"
                style={{ color: item.danger ? "#DC2626" : T.text1 }}>
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ── Detail / Edit View ── */
  if (detailProspect && editForm) {
    const sc = STATUS_CFG[editForm.status] || STATUS_CFG["New Lead"];
    const isReadOnly = !editMode;

    return (
      <div className="p-4 lg:p-6 relative">
        <Toast />
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={closeDetail} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: T.text3 }}>
              <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
            </button>
            <h1 className="font-bold text-base" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
              {editMode ? "Edit Prospect" : "Detail Prospect"}
            </h1>
            <div className="flex items-center gap-1">
              {!editMode && (
                <button onClick={() => navigate(`/prospect?detail=${editForm.id}&edit=1`)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif" }}>
                  Edit
                </button>
              )}
              <button
                onClick={closeDetail}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                style={{ color: T.text3 }}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <Card className="p-5 space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: sc.bg, color: sc.color }}>
                {editForm.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate" style={{ color: T.text1 }}>{editForm.name}</p>
                <p className="text-sm flex items-center gap-1" style={{ color: T.text3 }}>
                  <Phone size={12} /> {editForm.phone}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                style={{ backgroundColor: sc.bg, color: sc.color }}>
                {editForm.status}
              </span>
            </div>

            {/* Catatan */}
            <div>
              <SectionLabel>Catatan</SectionLabel>
              {isReadOnly ? (
                <p className="text-sm p-3 rounded-xl border leading-relaxed" style={{ borderColor: T.border, color: T.text2, backgroundColor: "var(--muted)" }}>
                  {editForm.note}
                </p>
              ) : (
                <textarea
                  value={editForm.note}
                  onChange={e => setEditForm(f => f ? { ...f, note: e.target.value } : f)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                  style={{ borderColor: T.border, color: T.text1 }}
                />
              )}
            </div>

            {/* Next Action */}
            <div>
              <SectionLabel>Next Action (Wajib)</SectionLabel>
              <div className="grid grid-cols-5 gap-2">
                {NEXT_ACTIONS.map(action => {
                  const active = editForm.nextAction === action.id;
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      disabled={isReadOnly}
                      onClick={() => setEditForm(f => f ? { ...f, nextAction: action.id } : f)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: active ? action.activeBorder : T.border,
                        backgroundColor: active ? `${action.color}15` : "transparent",
                        opacity: isReadOnly && !active ? 0.4 : 1,
                        cursor: isReadOnly ? "default" : "pointer",
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

            {/* Reminder */}
            {["Follow Up", "Showing", "Akad"].includes(editForm.nextAction) && (
              <div>
                <SectionLabel>Reminder (Wajib untuk Follow Up / Showing / Akad)</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Tanggal</p>
                    {isReadOnly ? (
                      <p className="text-sm font-medium px-3 py-2.5 rounded-xl border" style={{ borderColor: T.border, color: T.text1 }}>
                        {formatDateDisplay(editForm.reminderDate) || "—"}
                      </p>
                    ) : (
                      <input type="date" value={editForm.reminderDate}
                        onChange={e => setEditForm(f => f ? { ...f, reminderDate: e.target.value } : f)}
                        className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm outline-none"
                        style={{ borderColor: T.border, color: T.text1 }} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: T.text3 }}>Jam</p>
                    {isReadOnly ? (
                      <p className="text-sm font-medium px-3 py-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: T.border, color: T.text1 }}>
                        <Clock size={14} style={{ color: T.text3 }} /> {editForm.reminderTime || "—"}
                      </p>
                    ) : (
                      <div className="relative">
                        <input type="time" value={editForm.reminderTime}
                          onChange={e => setEditForm(f => f ? { ...f, reminderTime: e.target.value } : f)}
                          className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: T.text1 }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div>
              <SectionLabel>Activity Log</SectionLabel>
              <div className="space-y-3">
                {editForm.activityLog.map((log, i) => (
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

            {/* Save */}
            {editMode && (
              <button onClick={handleSaveDetail}
                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                style={{ backgroundColor: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.04em" }}>
                Simpan Perubahan
              </button>
            )}
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Pipeline */}
        <Card className="p-4 mb-5 overflow-x-auto">
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

        {/* Add panel */}
        <AnimatePresence>
          {showAdd && (
            <div className="fixed inset-0 z-[60] flex">
              <div className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)} />
              <motion.div className="w-full h-full bg-card shadow-2xl flex flex-col" style={{ maxWidth: 420 }}
                initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}>
                <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: T.border }}>
                  <h3 className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Tambah Prospect Baru</h3>
                  <button onClick={() => setShowAdd(false)} style={{ color: T.text3 }}><X size={20} /></button>
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
                  {(!newForm.name.trim() || !newForm.phone.trim()) && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: T.text3 }}>
                      <AlertCircle size={12} /> Nama dan Nomor HP wajib diisi
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 p-5 border-t" style={{ borderColor: T.border }}>
                  <button onClick={handleSave} disabled={!newForm.name.trim() || !newForm.phone.trim()}
                    className="w-full py-3 rounded-xl font-bold transition-all text-center text-white"
                    style={{
                      backgroundColor: newForm.name.trim() && newForm.phone.trim() ? "#E8A500" : "var(--border)",
                      fontFamily: "'Rajdhani', sans-serif", fontSize: 16,
                      cursor: newForm.name.trim() && newForm.phone.trim() ? "pointer" : "not-allowed",
                    }}>
                    Simpan Prospect
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === f ? "#E8A500" : T.card,
                color: filter === f ? "white" : T.text2,
                border: `1px solid ${filter === f ? "#E8A500" : "var(--border)"}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => {
            const sc = STATUS_CFG[p.status];
            return (
              <Card key={p.id}
                className="p-4 cursor-pointer transition-all hover:shadow-md relative"
                style={{ borderColor: "var(--border)", backgroundColor: T.card }}
                onClick={() => openDetail(p.id)}>
                <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                    style={{ backgroundColor: sc.bg, color: sc.color }}>{p.status}</span>
                  <ActionMenu prospect={p} />
                </div>
                <div className="flex items-start gap-3 mb-3 pr-28">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: sc.bg, color: sc.color }}>{p.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: T.text1 }}>{p.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: T.text3 }}>
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
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm" style={{ color: T.text3 }}>
              Tidak ada prospect ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
