import { useEffect, useState } from "react";
import { Check, Clock, AlertCircle, X, Search, MessageSquare, ArrowRight, User, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { useTabQuery } from "../../routes";
import { AGENT_PHOTOS } from "../../appData";
import { api } from "../../services/api";

interface CommissionItem {
  id: string;
  agent: string;
  agentEmail: string;
  type: string;
  property: string;
  amount: number;
  xp: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
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

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount || 0);

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminCommissionPage() {
  // Main Category Tab: "Komisi" | "Kritik & Saran"
  const [activeMainTab, setActiveMainTab] = useState<"komisi" | "feedback">("komisi");

  // State arrays
  const [claims, setClaims] = useState<CommissionItem[]>([]);
  const [helpSubmissions, setHelpSubmissions] = useState<HelpSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Commission Sub-tab ("Pending" | "Approved" | "Rejected")
  const [commissionSubTab, setCommissionSubTab] = useTabQuery("tab", "Pending");

  // Commission Reject Modal State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingHelpId, setUpdatingHelpId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [commData, helpData] = await Promise.all([
        api.admin.getCommissions(),
        api.admin.getHelpSubmissions(),
      ]);

      if (Array.isArray(commData)) {
        setClaims(commData.map((c: any) => ({
          id: String(c.id),
          agent: String(c.agent?.name || "Unknown Agent"),
          agentEmail: String(c.agent?.email || "-"),
          type: String(c.type || "SALE"),
          property: String(c.property || "-"),
          amount: Number(c.amount || 0),
          xp: `+${Number(c.xp_earned || 0)} XP`,
          submitted: formatDate(String(c.submitted_at || c.created_at || "")),
          status: String(c.status || "Pending") as "Pending" | "Approved" | "Rejected",
        })));
      }

      if (Array.isArray(helpData)) {
        setHelpSubmissions(helpData);
      }
    } catch (err) {
      console.error("Failed to load claims and submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Commission Actions
  const approveCommission = async (id: string) => {
    try {
      await api.admin.reviewCommission(id, "Approved");
      setClaims(p => p.map(c => c.id === id ? { ...c, status: "Approved" } : c));
      triggerToast("Klaim komisi disetujui!");
    } catch {
      triggerToast("Gagal menyetujui klaim");
    }
  };

  const rejectCommission = async (id: string, reason: string) => {
    try {
      await api.admin.reviewCommission(id, "Rejected", reason);
      setClaims(p => p.map(c => c.id === id ? { ...c, status: "Rejected" } : c));
      triggerToast("Klaim komisi ditolak");
    } catch {
      triggerToast("Gagal menolak klaim");
    }
    setRejectId(null);
    setRejectReason("");
  };

  const approveAllCommissions = async () => {
    const pending = claims.filter(c => c.status === "Pending");
    for (const row of pending) {
      try {
        await api.admin.reviewCommission(row.id, "Approved");
      } catch {}
    }
    await loadData();
    triggerToast("Semua klaim pending disetujui!");
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

  // Filters logic
  const searchLower = searchTerm.toLowerCase();

  const filteredClaims = claims.filter(c => {
    const matchesSubTab = c.status === commissionSubTab;
    const matchesSearch =
      c.agent.toLowerCase().includes(searchLower) ||
      c.property.toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower);
    return matchesSubTab && matchesSearch;
  });

  const filteredHelp = helpSubmissions.filter(s => {
    const matchesFormType = s.form_type === activeMainTab;
    const matchesSearch =
      (s.agent?.name || "").toLowerCase().includes(searchLower) ||
      (s.client_name || "").toLowerCase().includes(searchLower) ||
      (s.subject || "").toLowerCase().includes(searchLower) ||
      (s.reason || "").toLowerCase().includes(searchLower) ||
      (s.message || "").toLowerCase().includes(searchLower);
    return matchesFormType && matchesSearch;
  });

  // Badge counts
  const pendingClaimsCount = claims.filter(c => c.status === "Pending").length;
  const pendingFeedbackCount = helpSubmissions.filter(s => s.form_type === "feedback" && (s.status === "Menunggu Verifikasi" || s.status === "Terkirim")).length;

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
        <div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
            Agent Submissions Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Verifikasi klaim komisi, pengajuan pindah DP, dan pantau feedback dari agen</p>
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: "#16A34A", color: "white", fontFamily: "'Rajdhani', sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#15803D")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#16A34A")}
            >
              <Check size={14} /> Approve All ({pendingClaimsCount})
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
                  {t} ({claims.filter(c => c.status === t).length})
                </button>
              ))}
            </div>

            {loading && <div className="py-20 text-center text-sm text-muted-foreground">Memuat data komisi...</div>}

            {!loading && filteredClaims.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">Tidak ada klaim komisi {commissionSubTab.toLowerCase()}</div>
            )}

            {/* Mobile Claims Layout */}
            {!loading && filteredClaims.length > 0 && (
              <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
                {filteredClaims.map(c => {
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

                      {commissionSubTab === "Pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => setRejectId(c.id)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-red-500 text-red-500 cursor-pointer hover:bg-red-500/10 transition-colors">
                            Tolak
                          </button>
                          <button onClick={() => approveCommission(c.id)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] cursor-pointer hover:bg-green-700 transition-colors">
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop Claims Table */}
            {!loading && filteredClaims.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs font-semibold text-muted-foreground" style={{ borderColor: T.border }}>
                      <th className="text-left px-5 py-3.5">AGENT</th>
                      <th className="text-left px-5 py-3.5">PROPERTI</th>
                      <th className="text-left px-5 py-3.5">JUMLAH KOMISI</th>
                      <th className="text-left px-5 py-3.5">XP REWARD</th>
                      <th className="text-left px-5 py-3.5">DIAJUKAN</th>
                      <th className="text-right px-5 py-3.5">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: T.border }}>
                    {filteredClaims.map(c => {
                      const initials = c.agent.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                      const avatar = AGENT_PHOTOS[initials];
                      return (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3 text-left">
                              {avatar ? (
                                <img src={avatar} alt={c.agent} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "var(--muted)", color: T.text1 }}>
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm" style={{ color: T.text1 }}>{c.agent}</p>
                                <span className="inline-block text-[10px] px-2 py-0.5 mt-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: typeBg[c.type] || "var(--muted)", color: typeColor[c.type] || T.text3 }}>
                                  {c.type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-left" style={{ color: T.text2 }}>{c.property}</td>
                          <td className="px-5 py-4 text-sm font-bold text-left text-[#E8A500]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{formatIDR(c.amount)}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-left text-[#C8922A]">{c.xp}</td>
                          <td className="px-5 py-4 text-xs text-left" style={{ color: T.text3 }}>{c.submitted}</td>
                          <td className="px-5 py-4 text-right">
                            {commissionSubTab === "Pending" ? (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setRejectId(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500 text-red-500 cursor-pointer hover:bg-red-500/10">Tolak</button>
                                <button onClick={() => approveCommission(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#16A34A] cursor-pointer hover:bg-green-700">Approve</button>
                              </div>
                            ) : (
                              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide" style={{ backgroundColor: commissionSubTab === "Approved" ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)", color: commissionSubTab === "Approved" ? "#16A34A" : "#DC2626" }}>
                                {commissionSubTab}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* KRITIK & SARAN PANEL */}
        {activeMainTab === "feedback" && (
          <div>
            {loading && <div className="py-20 text-center text-sm text-muted-foreground">Memuat data pengajuan...</div>}

            {!loading && filteredHelp.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan kritik & saran yang cocok.
              </div>
            )}

            {!loading && filteredHelp.length > 0 && (
              <div className="divide-y" style={{ borderColor: T.border }}>
                {filteredHelp.map(item => {
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
          </div>
        )}
      </Card>

      {/* Reject Reason Dialog (Commissions) */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRejectId(null)} className="absolute inset-0 bg-black/60" />
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
              <button onClick={() => setRejectId(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer" style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
              <button onClick={() => rejectCommission(rejectId, rejectReason)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700">Tolak Klaim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
