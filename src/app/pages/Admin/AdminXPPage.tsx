import { useState } from "react";
import Card from "../../components/Card";
import { T } from "../../types";
import { AGENT_DATA_LIST } from "../../appData";

export default function AdminXPPage() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add"|"deduct">("add");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([
    { agent:"Ahmad Fadhil", type:"add", amount:500, reason:"Bonus event kehadiran", by:"Super Admin", time:"18 Jun · 16:40" },
    { agent:"Rizki Pratama", type:"add", amount:1000, reason:"Kompensasi event technical issue", by:"Super Admin", time:"15 Jun · 11:20" },
    { agent:"Eko Purnomo", type:"deduct", amount:200, reason:"Data listing duplikasi", by:"Super Admin", time:"10 Jun · 09:15" },
  ]);

  const AGENT_DATA = AGENT_DATA_LIST;

  const handleSubmit = () => {
    if (!selectedAgent || !amount || !reason) return;
    setHistory(prev => [{ agent: selectedAgent, type, amount: Number(amount), reason, by: "Super Admin", time: "Baru saja" }, ...prev]);
    setSelectedAgent(""); setAmount(""); setReason("");
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>XP Adjustment</h1>

      <Card className="p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>Tambah / Kurangi XP</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Agent</label>
            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}
              className="w-full px-3.5 rounded-xl border outline-none bg-card"
              style={{ height: 48, borderColor: T.border, fontSize: 14 }}>
              <option value="">Pilih agent...</option>
              {AGENT_DATA.filter(a => a.status === "Active").map(a => (
                <option key={a.id} value={a.name}>{a.name} — {a.level}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Tipe</label>
              <div className="flex gap-2">
                {(["add","deduct"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    type="button"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                    style={{
                      backgroundColor: type === t ? (t === "add" ? "#16A34A" : "#DC2626") : "transparent",
                      color: type === t ? "white" : T.text3,
                      borderColor: type === t ? (t === "add" ? "#16A34A" : "#DC2626") : T.border,
                    }}>
                    {t === "add" ? "+ Tambah" : "− Kurangi"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Jumlah XP</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 rounded-xl border outline-none bg-card"
                style={{ height: 48, borderColor: T.border, fontSize: 14, color: T.text1 }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Alasan</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Bonus event, kompensasi error..."
              className="w-full px-3.5 rounded-xl border outline-none bg-card"
              style={{ height: 48, borderColor: T.border, fontSize: 14 }} />
          </div>

          <button onClick={handleSubmit} disabled={!selectedAgent || !amount || !reason}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              backgroundColor: selectedAgent && amount && reason ? "#E8A500" : "var(--border)",
              color: selectedAgent && amount && reason ? "white" : "#9CA3AF",
              fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.05em",
            }}>
            TERAPKAN XP ADJUSTMENT
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>Riwayat Adjustment</h3>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: T.muted }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: h.type === "add" ? "#DCFCE7" : "#FEE2E2", color: h.type === "add" ? "#16A34A" : "#DC2626" }}>
                {h.type === "add" ? "+" : "−"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: T.text1 }}>{h.agent}</p>
                <p className="text-xs" style={{ color: T.text3 }}>{h.reason} · {h.by}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm" style={{ color: h.type === "add" ? "#16A34A" : "#DC2626", fontFamily: "'Rajdhani', sans-serif" }}>
                  {h.type === "add" ? "+" : "−"}{h.amount.toLocaleString()} XP
                </p>
                <p className="text-xs" style={{ color: T.text3 }}>{h.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
