import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, Clock, AlertCircle, X, Search, MessageSquare, ArrowRight, User, HelpCircle, CheckCircle2, XCircle, Square, CheckSquare, MinusSquare, MoreVertical } from "lucide-react";
import Card from "../../components/Card";
import AdminPagination from "../../components/AdminPagination";
import { T } from "../../types";
import { useTabQuery } from "../../routes";
import { AGENT_PHOTOS } from "../../appData";
import { api } from "../../services/api";
import { formatIDR } from "../../utils/currency";

interface CommissionItem {
  id: string;
  agent: string;
  agentEmail: string;
  type: string;
  property: string;
  propertyType: string;
  unit: string;
  amount: number;
  xp: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
  details: Record<string, any>;
}

// Cermin persis dari matriks backend (lihat commissionXP di admin.go) — dipakai
// untuk menampilkan estimasi XP pada klaim yang masih Pending.
function estimateCommissionXP(type: string, propertyType: string): number {
  const t = (propertyType || "").trim();
  if (type === "RENT") {
    if (t === "Apartemen") return 2000;
    if (t === "Rumah") return 3000;
    return 5000; // Ruko, Office, Gudang, Tanah, Komersial
  }
  if (t === "Apartemen") return 5000;
  if (t === "Rumah") return 7500;
  return 10000; // Ruko, Office, Gudang, Tanah, Primary, Komersial
}

// Fallback kalau backend belum mengirim property_type (claim lama): ambil
// bagian sebelum " - " dari deskripsi properti, mis. "Apartemen - Budi" → "Apartemen".
function derivePropertyType(propertyType: string, property: string): string {
  if (propertyType) return propertyType;
  const idx = property.indexOf(" - ");
  return idx !== -1 ? property.slice(0, idx).trim() : property.trim();
}

interface HelpSubmissionItem {
  id: number;
  agent_id: number;
  form_type: "feedback" | "pindah_dp";
  status: string;
  feedback_type?: string;
  subject?: string;
  message?: string;
  client_name?: string;
  unit_awal?: string;
  unit_baru?: string;
  amount?: string;
  reason?: string;
  created_at: string;
  agent?: {
    name: string;
    email: string;
  };
}

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminCommissionPage() {
  // Main Category Tab: "Komisi" | "Kritik & Saran"
  const [activeMainTab, setActiveMainTab] = useState<"komisi" | "feedback">("komisi");

  // Current page's data ONLY — filtering/sorting/paging all happen server-side
  // now (this table can hold thousands of historical rental rows).
  const [claims, setClaims] = useState<CommissionItem[]>([]);
  const [claimsTotal, setClaimsTotal] = useState(0);
  const [helpSubmissions, setHelpSubmissions] = useState<HelpSubmissionItem[]>([]);
  const [helpTotal, setHelpTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Independent of whatever filter/page is active — backs the tab/sub-tab badges.
  const [commissionCounts, setCommissionCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [helpPendingCount, setHelpPendingCount] = useState(0);

  // Commission Sub-tab ("Pending" | "Approved" | "Rejected")
  const [commissionSubTab, setCommissionSubTab] = useTabQuery("tab", "Pending");

  // Pagination (shared between the two list views — only one is visible at a time)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Commission Reject Modal State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Commission Detail Modal State
  const [detailClaim, setDetailClaim] = useState<CommissionItem | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectMode, setBulkRejectMode] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Search & Filter — debounced so every keystroke doesn't fire a request.
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [updatingHelpId, setUpdatingHelpId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Loading guards — prevent spam-click double-submits on approve/reject actions.
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkRejectSubmitting, setBulkRejectSubmitting] = useState(false);

  // Action Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const mapClaim = (c: any): CommissionItem => {
    const status = String(c.status || "Pending") as "Pending" | "Approved" | "Rejected";
    const type = String(c.type || "SALE");
    const property = String(c.property || "-");
    const propertyType = derivePropertyType(String(c.property_type || ""), property);
    // XP baru DIHITUNG oleh backend saat status di-approve (matriks Type × PropertyType).
    // Selagi Pending, xp_earned di database memang 0 — tampilkan estimasi dari matriks
    // yang sama, bukan "+0 XP" yang terkesan agent tidak dapat apa-apa.
    // Untuk Approved juga: klaim lama yang disetujui sebelum matriks XP diterapkan
    // mungkin masih menyimpan xp_earned = 0 — tampilkan estimasi agar tidak "+0 XP".
    const earned = Number(c.xp_earned || 0);
    const xp = (status === "Pending" || (status === "Approved" && earned === 0))
      ? `Estimasi: +${estimateCommissionXP(type, propertyType).toLocaleString("id-ID")} XP`
      : `+${earned.toLocaleString("id-ID")} XP`;
    return {
      id: String(c.id),
      agent: String(c.agent?.name || c.submitter_name || "Tanpa Agent (email belum terdaftar)"),
      agentEmail: String(c.agent?.email || c.submitter_email || "-"),
      type,
      property,
      propertyType,
      unit: String(c.unit || "—"),
      amount: Number(c.amount || 0),
      xp,
      submitted: formatDate(String(c.submitted_at || c.created_at || "")),
      status,
      details: (() => { try { return c.details ? JSON.parse(c.details) : {}; } catch { return {}; } })(),
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [countsRes, helpCountsRes] = await Promise.all([
        api.admin.getCommissionCounts().catch(() => null),
        api.admin.getHelpSubmissionCounts().catch(() => null),
      ]);
      if (countsRes) setCommissionCounts({ pending: countsRes.pending, approved: countsRes.approved, rejected: countsRes.rejected });
      if (helpCountsRes) setHelpPendingCount(helpCountsRes.pending_feedback || 0);

      if (activeMainTab === "komisi") {
        const res = await api.admin.getCommissions({ status: commissionSubTab, search: debouncedSearch, page, pageSize });
        setClaims((res?.data || []).map(mapClaim));
        setClaimsTotal(res?.total || 0);
      } else {
        const res = await api.admin.getHelpSubmissions({ formType: "feedback", search: debouncedSearch, page, pageSize });
        setHelpSubmissions(res?.data || []);
        setHelpTotal(res?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load claims and submissions", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever the active view/filter changes, so the user
  // never lands on a now-empty page — then (re)load from the server.
  useEffect(() => {
    setPage(1);
  }, [activeMainTab, commissionSubTab, debouncedSearch, pageSize]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMainTab, commissionSubTab, debouncedSearch, page, pageSize]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Commission Actions
  const approveCommission = async (id: string) => {
    if (approvingId) return; // guard against spam-click while one is in flight
    setApprovingId(id);
    try {
      await api.admin.reviewCommission(id, "Approved");
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      // Only close the detail modal if it's still showing THIS claim — never
      // close it on failure, so the admin can see the error and retry.
      setDetailClaim(prev => (prev?.id === id ? null : prev));
      triggerToast("Klaim komisi disetujui!");
      await loadData();
    } catch {
      triggerToast("Gagal menyetujui klaim");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectCommission = async (id: string, reason: string) => {
    if (rejectSubmitting) return;
    setRejectSubmitting(true);
    try {
      await api.admin.reviewCommission(id, "Rejected", reason);
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      // Only clear/close on success — a failed reject keeps the modal (and the
      // reason the admin typed) intact so they can see the error and retry.
      setRejectId(null);
      setRejectReason("");
      triggerToast("Klaim komisi ditolak");
      await loadData();
    } catch {
      triggerToast("Gagal menolak klaim");
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Bulk actions — one backend request each (server loops internally), instead
  // of the frontend firing N sequential/chunked HTTP calls.
  const approveAllCommissions = async () => {
    if (approvingAll) return;
    setApprovingAll(true);
    try {
      const res = await api.admin.approveAllPendingCommissions();
      setPage(1);
      await loadData();
      triggerToast(`${res.succeeded} klaim pending disetujui!${res.failed ? ` (${res.failed} gagal)` : ""}`);
    } catch {
      triggerToast("Gagal menyetujui semua klaim");
    } finally {
      setApprovingAll(false);
    }
  };

  // Help Submissions Actions
  const updateHelpStatus = async (id: number, status: string) => {
    setUpdatingHelpId(id);
    try {
      await api.admin.updateHelpSubmissionStatus(id, status);
      setHelpSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      triggerToast("Status bantuan diperbarui ke: " + status);
    } catch {
      triggerToast("Gagal memperbarui status");
    } finally {
      setUpdatingHelpId(null);
    }
  };

  const getHelpStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A", icon: <CheckCircle2 size={13} /> };
      case "Ditolak":
        return { bg: "rgba(220, 38, 38, 0.1)", color: "#DC2626", icon: <XCircle size={13} /> };
      case "Diproses":
        return { bg: "rgba(26, 111, 196, 0.1)", color: "#1A6FC4", icon: <Clock size={13} /> };
      case "Menunggu Verifikasi":
      case "Terkirim":
      default:
        return { bg: "rgba(232, 165, 0, 0.1)", color: "#E8A500", icon: <AlertCircle size={13} /> };
    }
  };

  const totalListItems = activeMainTab === "komisi" ? claimsTotal : helpTotal;

  // Bulk actions (select-all) — scoped to the currently visible page, which is
  // already exactly what the backend returned for the current sub-tab/search.
  const pendingFiltered = useMemo(
    () => (commissionSubTab === "Pending" ? claims : []),
    [claims, commissionSubTab]
  );

  const isAllSelected = pendingFiltered.length > 0 && pendingFiltered.every(c => selectedIds.has(c.id));
  const isPartialSelected = pendingFiltered.some(c => selectedIds.has(c.id)) && !isAllSelected;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingFiltered.map(c => c.id)));
    }
  }, [isAllSelected, pendingFiltered]);

  const approveSelected = async () => {
    if (bulkApproving) return;
    const ids = [...selectedIds];
    setBulkApproving(true);
    try {
      const res = await api.admin.bulkReviewCommissions(ids, "Approved");
      setSelectedIds(new Set());
      await loadData();
      triggerToast(`${res.succeeded} klaim disetujui!${res.failed ? ` (${res.failed} gagal)` : ""}`);
    } catch {
      triggerToast("Gagal menyetujui klaim terpilih");
    } finally {
      setBulkApproving(false);
    }
  };

  const rejectSelected = async (reason: string) => {
    if (bulkRejectSubmitting) return;
    const ids = [...selectedIds];
    setBulkRejectSubmitting(true);
    try {
      const res = await api.admin.bulkReviewCommissions(ids, "Rejected", reason);
      setSelectedIds(new Set());
      setBulkRejectMode(false);
      setBulkRejectReason("");
      await loadData();
      triggerToast(`${res.succeeded} klaim ditolak!${res.failed ? ` (${res.failed} gagal)` : ""}`);
    } catch {
      triggerToast("Gagal menolak klaim terpilih");
    } finally {
      setBulkRejectSubmitting(false);
    }
  };

  // Badge counts — independent of the current sub-tab/page, from the counts endpoint.
  const pendingClaimsCount = commissionCounts.pending;
  const pendingFeedbackCount = helpPendingCount;

  const typeBg: Record<string, string> = { SALE: "#EEF5FC", RENT: "#DCFCE7", PRIMARY: "#F5F0FD" };
  const typeColor: Record<string, string> = { SALE: "#1A6FC4", RENT: "#16A34A", PRIMARY: "#7B2FBE" };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-green-500/20">
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div className="min-w-0 flex-1">
          <h1 className="whitespace-nowrap" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
            Agent Submissions Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">Verifikasi klaim komisi, pengajuan pindah DP, dan pantau feedback dari agen</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari agen, klien, properti..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-xs outline-none focus:border-[#E8A500] transition-colors"
              style={{ borderColor: T.border, color: T.text1 }}
            />
          </div>

          {/* Quick Approve All (Commissions only) */}
          {activeMainTab === "komisi" && commissionSubTab === "Pending" && pendingClaimsCount > 0 && (
            <button
              onClick={approveAllCommissions}
              disabled={approvingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all flex-shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#16A34A", color: "white", fontFamily: "'Rajdhani', sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#15803D")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#16A34A")}
            >
              <Check size={14} /> {approvingAll ? "Memproses..." : `Approve All (${pendingClaimsCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Main Categories Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border" style={{ borderColor: T.border }}>
        <button
          onClick={() => { setActiveMainTab("komisi"); setSearchTerm(""); }}
          className="flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          style={{
            backgroundColor: activeMainTab === "komisi" ? "var(--card)" : "transparent",
            color: activeMainTab === "komisi" ? "#E8A500" : "var(--text-secondary)",
            boxShadow: activeMainTab === "komisi" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
          }}
        >
          <ArrowRight size={13} className="rotate-45" />
          Klaim Komisi
          {pendingClaimsCount > 0 && (
            <span className="bg-[#E8A500] text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">{pendingClaimsCount}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveMainTab("feedback"); setSearchTerm(""); }}
          className="flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          style={{
            backgroundColor: activeMainTab === "feedback" ? "var(--card)" : "transparent",
            color: activeMainTab === "feedback" ? "#E8A500" : "var(--text-secondary)",
            boxShadow: activeMainTab === "feedback" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
          }}
        >
          <MessageSquare size={13} />
          Kritik & Saran
          {pendingFeedbackCount > 0 && (
            <span className="bg-[#E8A500] text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">{pendingFeedbackCount}</span>
          )}
        </button>
      </div>

      <Card>
        {/* TAB 1: KLAIM KOMISI PANEL */}
        {activeMainTab === "komisi" && (
          <div>
            {/* Commission Sub-tabs */}
            <div className="flex border-b text-left" style={{ borderColor: T.border }}>
              {(["Pending", "Approved", "Rejected"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setCommissionSubTab(t)}
                  className="px-5 py-3 text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    color: commissionSubTab === t ? "#E8A500" : "#6B7280",
                    borderBottom: commissionSubTab === t ? "2px solid #E8A500" : "2px solid transparent",
                  }}
                >
                  {t} ({t === "Pending" ? commissionCounts.pending : t === "Approved" ? commissionCounts.approved : commissionCounts.rejected})
                </button>
              ))}
            </div>

            {loading && <div className="py-20 text-center text-sm text-muted-foreground">Memuat data komisi...</div>}

            {!loading && claims.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">Tidak ada klaim komisi {commissionSubTab.toLowerCase()}</div>
            )}

            {/* Mobile Claims Layout */}
            {!loading && claims.length > 0 && (
              <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
                {claims.map(c => {
                  const initials = c.agent.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                  const avatar = AGENT_PHOTOS[initials];
                  return (
                    <div key={c.id} className="p-4 space-y-3 relative text-left">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={c.agent} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--muted)", color: T.text1 }}>
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm" style={{ color: T.text1 }}>{c.agent}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: typeBg[c.type] || "var(--muted)", color: typeColor[c.type] || T.text3 }}>
                              {c.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Email: {c.agentEmail} • Diajukan: {c.submitted}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border space-y-1.5 bg-muted/20" style={{ borderColor: T.border }}>
                        <p className="text-xs" style={{ color: T.text2 }}>Kategori Properti: <span className="font-semibold">{c.property}</span></p>
                        <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: T.border }}>
                          <p className="text-xs text-muted-foreground">Jumlah Komisi</p>
                          <p className="font-bold text-sm text-[#E8A500]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{formatIDR(c.amount)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Reward XP</p>
                          <p className="text-xs font-bold text-[#C8922A]">{c.xp}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setDetailClaim(c)} className="flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-muted/40 transition-colors flex items-center justify-center gap-1" style={{ borderColor: T.border, color: T.text2 }}>
                          <HelpCircle size={13} /> Detail
                        </button>
                        {commissionSubTab === "Pending" && (
                          <>
                            <button onClick={() => setRejectId(c.id)} disabled={approvingId === c.id} className="flex-1 py-2 rounded-xl text-xs font-bold border border-red-500 text-red-500 cursor-pointer hover:bg-red-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                              Tolak
                            </button>
                            <button onClick={() => approveCommission(c.id)} disabled={approvingId === c.id} className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                              {approvingId === c.id ? "Memproses..." : "Approve"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop Claims Table */}
            {!loading && claims.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                {/* Bulk Action Bar — only for Pending tab */}
                {commissionSubTab === "Pending" && selectedIds.size > 0 && (
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b bg-[#E8A500]/5" style={{ borderColor: T.border }}>
                    <span className="text-xs font-semibold" style={{ color: T.text2 }}>
                      {selectedIds.size} item terpilih
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={approveSelected}
                      disabled={bulkApproving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#16A34A] cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      <Check size={14} /> {bulkApproving ? "Memproses..." : "Approve Selected"}
                    </button>
                    <button
                      onClick={() => setBulkRejectMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#DC2626] cursor-pointer hover:bg-red-700 transition-colors"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      <X size={14} /> Reject Selected
                    </button>
                  </div>
                )}
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs font-semibold text-muted-foreground" style={{ borderColor: T.border }}>
                      {commissionSubTab === "Pending" && (
                        <th className="text-center px-3 py-3.5 w-10 sticky left-0 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ backgroundColor: "var(--card)", borderColor: T.border }}>
                          <button onClick={toggleSelectAll} className="cursor-pointer" style={{ color: isAllSelected ? "#E8A500" : T.text3 }}>
                            {isAllSelected ? <CheckSquare size={16} /> : isPartialSelected ? <MinusSquare size={16} /> : <Square size={16} />}
                          </button>
                        </th>
                      )}
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">AGENT</th>
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">PROPERTI</th>
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">UNIT</th>
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">JUMLAH KOMISI</th>
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">XP REWARD</th>
                      <th className="text-left px-5 py-3.5 whitespace-nowrap">DIAJUKAN</th>
                      <th className="text-right px-5 py-3.5 whitespace-nowrap sticky right-0 z-20 border-l shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ backgroundColor: "var(--card)", borderColor: T.border }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: T.border }}>
                    {claims.map(c => {
                      const initials = c.agent.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                      const avatar = AGENT_PHOTOS[initials];
                      const isChecked = selectedIds.has(c.id);
                      return (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors group">
                          {commissionSubTab === "Pending" && (
                            <td className="px-3 py-4 text-center sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ backgroundColor: "var(--card)", borderColor: T.border }}>
                              <button onClick={() => toggleSelect(c.id)} className="cursor-pointer" style={{ color: isChecked ? "#E8A500" : T.text3 }}>
                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                              </button>
                            </td>
                          )}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-left">
                              {avatar ? (
                                <img src={avatar} alt={c.agent} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--muted)", color: T.text1 }}>
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm whitespace-nowrap" style={{ color: T.text1 }}>{c.agent}</p>
                                <span className="inline-block text-[10px] px-2 py-0.5 mt-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: typeBg[c.type] || "var(--muted)", color: typeColor[c.type] || T.text3 }}>
                                  {c.type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-left whitespace-nowrap" style={{ color: T.text2 }}>{c.property}</td>
                          <td className="px-5 py-4 text-sm text-left whitespace-nowrap" style={{ color: T.text2 }}>{c.unit}</td>
                          <td className="px-5 py-4 text-sm font-bold text-left text-[#E8A500] whitespace-nowrap" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{formatIDR(c.amount)}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-left text-[#C8922A] whitespace-nowrap">{c.xp}</td>
                          <td className="px-5 py-4 text-xs text-left whitespace-nowrap" style={{ color: T.text3 }}>{c.submitted}</td>
                          <td className="px-5 py-4 text-right whitespace-nowrap sticky right-0 border-l shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ backgroundColor: "var(--card)", borderColor: T.border, zIndex: openDropdownId === c.id ? 30 : 10 }}>
                            <div className="flex gap-2.5 justify-end items-center">
                              {commissionSubTab !== "Pending" && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide flex-shrink-0" style={{ backgroundColor: commissionSubTab === "Approved" ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)", color: commissionSubTab === "Approved" ? "#16A34A" : "#DC2626" }}>
                                  {commissionSubTab}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  const btn = e.currentTarget;
                                  const rect = btn.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  setDropdownDir(spaceBelow < 200 ? "up" : "down");
                                  setDropdownPos({ top: rect.bottom, right: window.innerWidth - rect.right });
                                  setOpenDropdownId(openDropdownId === c.id ? null : c.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
                              >
                                <MoreVertical size={16} style={{ color: T.text3 }} />
                              </button>
                              {openDropdownId === c.id && dropdownPos && createPortal(
                                <div ref={dropdownRef}
                                  className="fixed z-[100] w-36 rounded-xl border shadow-xl py-1"
                                  style={{
                                    backgroundColor: "var(--card)",
                                    borderColor: T.border,
                                    top: dropdownDir === "up" ? dropdownPos.top - 8 : dropdownPos.top + 4,
                                    right: dropdownPos.right,
                                    transform: dropdownDir === "up" ? "translateY(-100%)" : "none",
                                  }}
                                >
                                  <button onClick={() => { setDetailClaim(c); setOpenDropdownId(null); }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer"
                                    style={{ color: T.text1 }}>
                                    <HelpCircle size={13} /> Detail
                                  </button>
                                  {commissionSubTab === "Pending" && (
                                    <>
                                      <button onClick={() => { approveCommission(c.id); setOpenDropdownId(null); }}
                                        disabled={approvingId === c.id}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{ color: "#16A34A" }}>
                                        <Check size={13} /> Approve
                                      </button>
                                      <button onClick={() => { setRejectId(c.id); setOpenDropdownId(null); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer"
                                        style={{ color: "#DC2626" }}>
                                        <X size={13} /> Tolak
                                      </button>
                                    </>
                                  )}
                                </div>,
                                document.body
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && claims.length > 0 && (
              <AdminPagination page={page} pageSize={pageSize} totalItems={totalListItems} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </div>
        )}

        {/* KRITIK & SARAN PANEL */}
        {activeMainTab === "feedback" && (
          <div>
            {loading && <div className="py-20 text-center text-sm text-muted-foreground">Memuat data pengajuan...</div>}

            {!loading && helpSubmissions.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan kritik & saran yang cocok.
              </div>
            )}

            {!loading && helpSubmissions.length > 0 && (
              <div className="divide-y" style={{ borderColor: T.border }}>
                {helpSubmissions.map(item => {
                  const badge = getHelpStatusBadge(item.status);

                  return (
                    <div key={item.id} className="p-4 lg:p-6 text-left space-y-4 hover:bg-muted/5 transition-colors">
                      {/* Top Bar Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: "#7B2FBE" }}
                          >
                            <MessageSquare size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm" style={{ color: T.text1 }}>
                                Feedback: {item.feedback_type}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-muted/30" style={{ borderColor: T.border, color: T.text3 }}>
                                #{item.id}
                              </span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1" style={{ backgroundColor: badge.bg, color: badge.color }}>
                                {badge.icon} {item.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Dikirim oleh: <span className="font-semibold text-foreground">{item.agent?.name || "Unknown Agent"}</span> ({item.agent?.email || "-"}) • {formatDate(item.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Quick Action Selector */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ubah Status:</span>
                          <select
                            value={item.status}
                            disabled={updatingHelpId === item.id}
                            onChange={e => updateHelpStatus(item.id, e.target.value)}
                            className="px-2 py-1 border rounded-lg text-xs outline-none bg-card font-semibold cursor-pointer disabled:opacity-50"
                            style={{ borderColor: T.border, color: T.text1 }}
                          >
                            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                            <option value="Terkirim">Terkirim</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="p-4 rounded-2xl border space-y-2 bg-muted/20 text-xs" style={{ borderColor: T.border }}>
                        <p className="font-bold" style={{ color: T.text1 }}>Subjek: {item.subject}</p>
                        <div className="border-t pt-2" style={{ borderColor: T.border }}>
                          <p className="text-muted-foreground font-medium mb-1">Pesan / Masukan:</p>
                          <p className="bg-card/40 p-2.5 rounded-xl border border-dashed text-foreground/90 whitespace-pre-wrap" style={{ borderColor: T.border }}>
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && helpSubmissions.length > 0 && (
              <AdminPagination page={page} pageSize={pageSize} totalItems={totalListItems} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </div>
        )}
      </Card>

      {/* Bulk Reject Reason Dialog */}
      {bulkRejectMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setBulkRejectMode(false); setBulkRejectReason(""); }} className="absolute inset-0 bg-black/60" />
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl relative z-10 p-6" style={{ borderColor: T.border }}>
            <h3 className="font-bold text-lg font-display text-left mb-1" style={{ color: T.text1 }}>Tolak {selectedIds.size} Klaim</h3>
            <p className="text-xs text-muted-foreground mb-3">Alasan akan diterapkan ke semua klaim yang dipilih.</p>
            <textarea
              value={bulkRejectReason}
              onChange={e => setBulkRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full h-24 p-3 border rounded-xl bg-card text-sm outline-none resize-none"
              style={{ borderColor: T.border, color: T.text1 }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setBulkRejectMode(false); setBulkRejectReason(""); }} disabled={bulkRejectSubmitting} className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
              <button onClick={() => rejectSelected(bulkRejectReason)} disabled={bulkRejectSubmitting} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {bulkRejectSubmitting ? "Memproses..." : `Tolak ${selectedIds.size} Klaim`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog (Commissions) */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => !rejectSubmitting && setRejectId(null)} className="absolute inset-0 bg-black/60" />
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl relative z-10 p-6" style={{ borderColor: T.border }}>
            <h3 className="font-bold text-lg font-display text-left mb-3" style={{ color: T.text1 }}>Tolak Klaim Komisi</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full h-24 p-3 border rounded-xl bg-card text-sm outline-none resize-none"
              style={{ borderColor: T.border, color: T.text1 }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectId(null)} disabled={rejectSubmitting} className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
              <button onClick={() => rejectCommission(rejectId, rejectReason)} disabled={rejectSubmitting} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {rejectSubmitting ? "Memproses..." : "Tolak Klaim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Detail Modal */}
      {detailClaim && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setDetailClaim(null)} className="absolute inset-0 bg-black/60" />
          <div className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl relative z-10 flex flex-col max-h-[88vh]" style={{ borderColor: T.border }}>
            <div className="px-6 py-4 border-b flex items-start justify-between gap-3 flex-shrink-0" style={{ borderColor: T.border }}>
              <div>
                <h3 className="font-bold text-lg font-display text-left" style={{ color: T.text1 }}>Detail Klaim Komisi</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">#{detailClaim.id} • {detailClaim.submitted}</p>
              </div>
              <button onClick={() => setDetailClaim(null)} style={{ color: T.text3 }}><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-left">
              {/* Ringkasan */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "Agent", v: detailClaim.agent, sub: detailClaim.agentEmail },
                  { l: "Status", v: detailClaim.status },
                  { l: "Properti", v: detailClaim.property },
                  { l: "Unit", v: detailClaim.unit },
                  { l: "Jenis", v: detailClaim.type },
                  { l: "Jumlah Komisi", v: formatIDR(detailClaim.amount), color: "#E8A500" },
                  { l: "Reward XP", v: detailClaim.xp, color: "#C8922A" },
                ].map(f => (
                  <div key={f.l}>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{f.l}</p>
                    <p className="font-semibold text-sm" style={{ color: f.color || T.text1 }}>{f.v}</p>
                    {f.sub && <p className="text-[11px] text-muted-foreground break-all">{f.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Detail lengkap dari form */}
              <div className="border-t pt-3" style={{ borderColor: T.border }}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wide">Detail Formulir</p>
                {Object.keys(detailClaim.details).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Tidak ada detail tambahan (claim lama, atau dikirim tanpa data form).</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(detailClaim.details).map(([k, v]) => {
                      const val = String(v ?? "").trim();
                      if (!val) return null;
                      const isUrl = /^https?:\/\//i.test(val);
                      return (
                        <div key={k} className="flex flex-col sm:flex-row sm:gap-3 text-sm border-b pb-2 last:border-0" style={{ borderColor: T.border }}>
                          <span className="sm:w-2/5 text-xs font-semibold text-muted-foreground">{k}</span>
                          <span className="sm:w-3/5 break-words" style={{ color: T.text1 }}>
                            {isUrl ? <a href={val} target="_blank" rel="noreferrer" className="text-[#E8A500] underline break-all">Lihat file / link</a> : val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {detailClaim.status === "Pending" && (
              <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: T.border }}>
                <button onClick={() => { setRejectId(detailClaim.id); setDetailClaim(null); }} disabled={approvingId === detailClaim.id} className="px-4 py-2 rounded-xl text-xs font-bold border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed">Tolak</button>
                {/* Closing on approve is handled inside approveCommission itself (only on
                    success) — do NOT also close it here, or a failed approval silently
                    closes the modal and hides the error toast from the admin. */}
                <button onClick={() => approveCommission(detailClaim.id)} disabled={approvingId === detailClaim.id} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed">
                  {approvingId === detailClaim.id ? "Memproses..." : "Approve"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
