import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { useTabQuery } from "../../routes";
import { AGENT_PHOTOS } from "../../appData";
import { api } from "../../services/api";

interface CommissionItem {
  id: string;
  agent: string;
  type: string;
  property: string;
  amount: string;
  xp: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount || 0);

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminCommissionPage() {
  const [claims, setClaims] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useTabQuery("tab", "Pending");
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadClaims = async () => {
    setLoading(true);
    try {
      const rows = await api.admin.getCommissions();
      if (Array.isArray(rows)) {
        setClaims(rows.map((c: any) => ({
          id: String(c.id),
          agent: String(c.agent?.name || "Unknown Agent"),
          type: String(c.type || "SALE"),
          property: String(c.property || "-"),
          amount: formatIDR(Number(c.amount || 0)),
          xp: `+${Number(c.xp_earned || 0)} XP`,
          submitted: formatDate(String(c.submitted_at || c.created_at || "")),
          status: String(c.status || "Pending") as "Pending" | "Approved" | "Rejected",
        })));
      }
    } catch {
      // Keep empty state when API fails.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const shown = claims.filter(c => c.status === tab);
  const pendingCount = claims.filter(c => c.status === "Pending").length;

  const approve = async (id: string) => {
    try {
      await api.admin.reviewCommission(id, "Approved");
      setClaims(p => p.map(c => c.id === id ? { ...c, status: "Approved" } : c));
    } catch {}
  };

  const reject  = async (id: string, reason: string) => {
    try {
      await api.admin.reviewCommission(id, "Rejected", reason);
      setClaims(p => p.map(c => c.id === id ? { ...c, status: "Rejected" } : c));
    } catch {}
    setRejectId(null);
    setRejectReason("");
  };

  const approveAll = async () => {
    const pending = claims.filter(c => c.status === "Pending");
    for (const row of pending) {
      try {
        await api.admin.reviewCommission(row.id, "Approved");
      } catch {}
    }
    await loadClaims();
  };

  const typeBg: Record<string, string> = { SALE: "#EEF5FC", RENT: "#DCFCE7", PRIMARY: "#F5F0FD" };
  const typeColor: Record<string, string> = { SALE: "#1A6FC4", RENT: "#16A34A", PRIMARY: "#7B2FBE" };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>Commission Verification</h1>
        {tab === "Pending" && pendingCount > 0 && (
          <button onClick={approveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ backgroundColor: "#16A34A", color: "white", fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#15803D")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#16A34A")}>
            <Check size={15} /> Approve All ({pendingCount})
          </button>
        )}
      </div>

      <Card>
        <div className="flex border-b" style={{ borderColor: T.border }}>
          {(["Pending","Approved","Rejected"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-medium transition-all"
              style={{ color: tab === t ? "#E8A500" : "#6B7280", borderBottom: tab === t ? "2px solid #E8A500" : "2px solid transparent" }}>
              {t} ({claims.filter(c => c.status === t).length})
            </button>
          ))}
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
          {loading && (
            <div className="py-10 text-center text-sm" style={{ color: T.text3 }}>
              Memuat data komisi...
            </div>
          )}
          {shown.map(c => {
            const initials = c.agent.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
            const avatar = AGENT_PHOTOS[initials];
            return (
              <div key={c.id} className="p-4 space-y-3 relative">
                {/* Top: Agent Info */}
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt={c.agent} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--muted)", color: T.text1 }}>
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: T.text1 }}>{c.agent}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                        style={{ backgroundColor: typeBg[c.type] || "var(--muted)", color: typeColor[c.type] || T.text3 }}>
                        {c.type}
                      </span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: T.text3 }}>Diajukan: {c.submitted}</p>
                  </div>
                </div>

                {/* Middle: Property & Amount info */}
                <div className="p-3 rounded-xl border space-y-1.5" style={{ borderColor: T.border, backgroundColor: T.muted }}>
                  <p className="text-xs" style={{ color: T.text2 }}>{c.property}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: T.border }}>
                    <p className="text-xs" style={{ color: T.text3 }}>Jumlah Komisi</p>
                    <p className="font-bold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>{c.amount}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: T.text3 }}>Reward XP</p>
                    <p className="text-xs font-bold" style={{ color: "#C8922A" }}>{c.xp}</p>
                  </div>
                </div>

                {/* Bottom: Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {tab === "Pending" ? (
                    <>
                      <button onClick={() => setRejectId(c.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all text-center"
                        style={{ borderColor: "#DC2626", color: "#DC2626", backgroundColor: "transparent" }}>
                        Tolak
                      </button>
                      <button onClick={() => approve(c.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center"
                        style={{ backgroundColor: "#16A34A" }}>
                        Approve
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex justify-end">
                      <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: tab === "Approved" ? "#DCFCE7" : "#FEE2E2",
                          color: tab === "Approved" ? "#16A34A" : "#DC2626"
                        }}>
                        {tab}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <div className="py-10 text-center text-sm" style={{ color: T.text3 }}>
              Tidak ada klaim {tab.toLowerCase()}
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs font-semibold" style={{ borderColor: T.border, color: T.text3 }}>
                <th className="text-left px-5 py-3.5">AGENT</th>
                <th className="text-left px-5 py-3.5">PROPERTI</th>
                <th className="text-left px-5 py-3.5">JUMLAH KOMISI</th>
                <th className="text-left px-5 py-3.5">XP REWARD</th>
                <th className="text-left px-5 py-3.5">DIAJUKAN</th>
                <th className="text-right px-5 py-3.5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: T.border }}>
              {shown.map(c => {
                const initials = c.agent.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                const avatar = AGENT_PHOTOS[initials];
                return (
                  <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={c.agent} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: "var(--muted)", color: T.text1 }}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm" style={{ color: T.text1 }}>{c.agent}</p>
                          <span className="inline-block text-[10px] px-2 py-0.5 mt-0.5 rounded font-bold uppercase tracking-wider"
                            style={{ backgroundColor: typeBg[c.type] || "var(--muted)", color: typeColor[c.type] || T.text3 }}>
                            {c.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.text2 }}>{c.property}</td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>{c.amount}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: "#C8922A" }}>{c.xp}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: T.text3 }}>{c.submitted}</td>
                    <td className="px-5 py-4 text-right">
                      {tab === "Pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setRejectId(c.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border"
                            style={{ borderColor: "#DC2626", color: "#DC2626", backgroundColor: "transparent" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FEE2E2")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            Tolak
                          </button>
                          <button onClick={() => approve(c.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                            style={{ backgroundColor: "#16A34A" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#15803D")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#16A34A")}>
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: tab === "Approved" ? "#DCFCE7" : "#FEE2E2",
                            color: tab === "Approved" ? "#16A34A" : "#DC2626"
                          }}>
                          {tab}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm" style={{ color: T.text3 }}>
                    Tidak ada klaim {tab.toLowerCase()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <Card className="p-6 w-full" style={{ maxWidth: 400 }}>
            <h3 className="font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1 }}>Alasan Penolakan</h3>
            <p className="text-sm mb-4" style={{ color: T.text3 }}>Wajib diisi — akan dikirim ke agent via notifikasi.</p>
            <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border outline-none mb-4 bg-card text-sm"
              style={{ borderColor: T.border }}>
              <option value="">Pilih alasan...</option>
              {["Komisi belum cair","Data tidak lengkap","Salah input","Duplikasi claim"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
                      <button onClick={() => reject(rejectId, rejectReason)} disabled={!rejectReason}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: rejectReason ? "#DC2626" : "var(--border)", color: rejectReason ? "white" : "#9CA3AF" }}>
                Tolak Klaim
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
