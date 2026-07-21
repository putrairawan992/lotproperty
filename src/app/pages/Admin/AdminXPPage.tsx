import { useEffect, useState, useCallback } from "react";
import Card from "../../components/Card";
import SearchableSelect, { type LoadOptionsResult } from "../../components/SearchableSelect";
import { T } from "../../types";
import { api } from "../../services/api";

interface XPHistoryItem {
  agent: string;
  type: "add" | "deduct";
  amount: number;
  reason: string;
  by: string;
  time: string;
}

export default function AdminXPPage() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedAgentLabel, setSelectedAgentLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add"|"deduct">("add");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState<XPHistoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const triggerToast = (text: string, error?: boolean) => {
    setToastMsg({ text, error });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Server-side search + pagination — scrolling the dropdown loads more pages
  // instead of downloading the entire agent roster upfront.
  const loadXpAgentOptions = useCallback(async (query: string, page: number): Promise<LoadOptionsResult> => {
    const res = await api.admin.getAgents({ search: query, status: "Active", role: "Agent", page, pageSize: 20 });
    const rows = res?.data || [];
    const options = rows.map((a: any) => ({
      value: String(a.id),
      label: String(a.name || ""),
      sub: String(a.title || "Rookie Agent"),
      subLine: String(a.email || ""),
    }));
    return { options, hasMore: page * 20 < Number(res?.total || 0) };
  }, []);

  const loadHistory = async () => {
    try {
      const rows = await api.admin.getLogs();
      if (!Array.isArray(rows)) return;
      setHistory(rows
        .filter((l: any) => String(l.type || "") === "xp")
        .slice(0, 20)
        .map((l: any) => {
          const action = String(l.action || "");
          const match = action.match(/:\s*(-?\d+)\s*XP/i);
          const rawAmount = match ? Number(match[1]) : 0;
          return {
            agent: action.includes(" for ") ? action.split(" for ")[1]?.split(":")[0] || "Agent" : "Agent",
            type: rawAmount >= 0 ? "add" : "deduct",
            amount: Math.abs(rawAmount),
            reason: action.includes("Reason:") ? action.split("Reason:")[1].trim() : action,
            by: String(l.actor_name || "Admin"),
            time: l.created_at
              ? new Date(l.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
              : "-",
          };
        }));
    } catch {
      // Keep empty history on API failure.
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAgent || !amount || !reason) return;

    setSaving(true);
    try {
      const parsed = Number(amount);
      const signedAmount = type === "add" ? parsed : -Math.abs(parsed);
      await api.admin.xpAdjust(selectedAgent, signedAmount, reason);

      setHistory(prev => [{
        agent: selectedAgentLabel || "Agent",
        type,
        amount: Math.abs(parsed),
        reason,
        by: "Admin",
        time: "Baru saja",
      }, ...prev]);

      setSelectedAgent("");
      setSelectedAgentLabel("");
      setAmount("");
      setReason("");
      triggerToast("XP adjustment berhasil diterapkan!");
    } catch (error) {
      // Keep form state when request fails.
      triggerToast(error instanceof Error ? error.message : "Gagal menerapkan XP adjustment", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {toastMsg && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold text-white"
          style={{ backgroundColor: toastMsg.error ? "#DC2626" : "#16A34A" }}
        >
          {toastMsg.text}
        </div>
      )}
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>XP Adjustment</h1>

      <Card className="p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>Tambah / Kurangi XP</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: T.text2 }}>Agent</label>
            <SearchableSelect
              loadOptions={loadXpAgentOptions}
              value={selectedAgent}
              selectedLabel={selectedAgentLabel}
              onChange={(v, opt) => { setSelectedAgent(v); setSelectedAgentLabel(opt?.label || ""); }}
              placeholder="Pilih agent..."
              emptyLabel="Agent tidak ditemukan"
            />
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

          <button onClick={handleSubmit} disabled={!selectedAgent || !amount || !reason || saving}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              backgroundColor: selectedAgent && amount && reason ? "#E8A500" : "var(--border)",
              color: selectedAgent && amount && reason ? "white" : "#9CA3AF",
              fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: "0.05em",
            }}>
            {saving ? "MENYIMPAN..." : "TERAPKAN XP ADJUSTMENT"}
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
