import { useState } from "react";
import { Check } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { useTabQuery } from "../../routes";
import { COMMISSION_DATA_LIST } from "../../appData";

export default function AdminCommissionPage() {
  const [claims, setClaims] = useState(COMMISSION_DATA_LIST);
  const [tab, setTab] = useTabQuery("tab", "Pending");
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const shown = claims.filter(c => c.status === tab);
  const pendingCount = claims.filter(c => c.status === "Pending").length;

  const approve = (id: string) => setClaims(p => p.map(c => c.id === id ? { ...c, status: "Approved" } : c));
  const reject  = (id: string, reason: string) => { setClaims(p => p.map(c => c.id === id ? { ...c, status: "Rejected" } : c)); setRejectId(null); setRejectReason(""); };
  const approveAll = () => setClaims(p => p.map(c => c.status === "Pending" ? { ...c, status: "Approved" } : c));

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

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {shown.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: T.text1 }}>{c.agent}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: typeBg[c.type] || "#F3F4F6", color: typeColor[c.type] || "#6B7280" }}>
                    {c.type}
                  </span>
                </div>
                <p className="text-xs" style={{ color: T.text3 }}>{c.property}</p>
                <p className="text-xs" style={{ color: T.text3 }}>{c.submitted}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>{c.amount}</p>
                <p className="text-xs font-semibold" style={{ color: "#C8922A" }}>{c.xp}</p>
              </div>
              {tab === "Pending" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approve(c.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ backgroundColor: "#16A34A", color: "white" }}>Approve</button>
                  <button onClick={() => setRejectId(c.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>Tolak</button>
                </div>
              )}
              {tab !== "Pending" && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                  style={{ backgroundColor: tab === "Approved" ? "#DCFCE7" : "#FEE2E2", color: tab === "Approved" ? "#16A34A" : "#DC2626" }}>
                  {tab}
                </span>
              )}
            </div>
          ))}
          {shown.length === 0 && (
            <div className="py-10 text-center" style={{ color: T.text3 }}>
              Tidak ada klaim {tab.toLowerCase()}
            </div>
          )}
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
