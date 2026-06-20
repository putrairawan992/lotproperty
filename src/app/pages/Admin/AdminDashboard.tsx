import { Users, AlertCircle, DollarSign, Zap, TrendingUp, CheckCircle } from "lucide-react";
import Card from "../../components/Card";
import { T } from "../../types";
import { AGENT_DATA_LIST, COMMISSION_DATA_LIST, LOG_DATA_LIST } from "../../appData";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Agent Aktif", value: "127",  icon: Users,       color: "#1A6FC4", bg: "#EEF5FC" },
    { label: "Pendaftaran Pending", value: "3",  icon: AlertCircle, color: "#D97706", bg: "#FEF3C7" },
    { label: "Klaim Komisi Pending", value: "7", icon: DollarSign,  color: "#E8A500", bg: "#FFFAED" },
    { label: "Event Aktif",         value: "1",  icon: Zap,         color: "#7B2FBE", bg: "#F5F0FD" },
    { label: "Total XP Bulan Ini",  value: "2.4M",icon: TrendingUp, color: "#16A34A", bg: "#DCFCE7" },
    { label: "Transaksi Disetujui", value: "18", icon: CheckCircle, color: "#C8922A", bg: "#FEF3C7" },
  ];

  const AGENT_DATA = AGENT_DATA_LIST;
  const COMMISSION_DATA = COMMISSION_DATA_LIST;
  const LOG_DATA = LOG_DATA_LIST;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
          Dashboard Admin
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.text3 }}>Senin, 19 Juni 2025 · LOT Property Group</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Pending actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: T.text1 }}>
              Pendaftaran Menunggu
            </h3>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>3 pending</span>
          </div>
          <div className="space-y-2.5">
            {AGENT_DATA.filter(a => a.status === "Pending").map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: T.muted }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#4B5563,#6B7280)" }}>
                  {a.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: T.text1 }}>{a.name}</p>
                  <p className="text-xs" style={{ color: T.text3 }}>{a.office} · {a.joined}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                    Approve
                  </button>
                  <button className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: T.text1 }}>
              Klaim Komisi Terbaru
            </h3>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "#FFFAED", color: "#E8A500" }}>7 pending</span>
          </div>
          <div className="space-y-2.5">
            {COMMISSION_DATA.filter(c => c.status === "Pending").slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: T.muted }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: T.text1 }}>{c.agent}</p>
                  <p className="text-xs truncate" style={{ color: T.text3 }}>{c.property}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}>{c.amount}</p>
                  <p className="text-xs" style={{ color: "#C8922A" }}>{c.xp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System log preview */}
      <Card className="p-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: T.text1 }}>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          {LOG_DATA.slice(0, 5).map((l, i) => {
            const colors: Record<string, { bg: string; color: string }> = {
              commission: { bg: "#FFFAED", color: "#E8A500" },
              agent:      { bg: "#EEF5FC", color: "#1A6FC4" },
              xp:         { bg: "#F5F0FD", color: "#7B2FBE" },
              recruit:    { bg: "#DCFCE7", color: "#16A34A" },
              hof:        { bg: "#FEF3C7", color: "#C8922A" },
              event:      { bg: "#FEE2E2", color: "#DC2626" },
            };
            const c = colors[l.type] || { bg: "#F3F4F6", color: T.text3 };
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: T.text1 }}>{l.action}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{l.actor} · {l.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
