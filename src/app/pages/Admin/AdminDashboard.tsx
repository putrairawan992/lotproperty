import { useEffect, useMemo, useState } from "react";
import { Users, AlertCircle, DollarSign, Zap, TrendingUp, CheckCircle } from "lucide-react";
import Card from "../../components/Card";
import { T, useTheme } from "../../types";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { api } from "../../services/api";

interface AgentDataItem {
  id: number;
  name: string;
  office: string;
  status: string;
  joined: string;
}

interface CommissionDataItem {
  id: number;
  agent: string;
  property: string;
  amount: number;
  xpEarned: number;
  status: string;
}

interface LogDataItem {
  action: string;
  actor: string;
  time: string;
  type: string;
}

export default function AdminDashboard() {
  const { isDark } = useTheme();

  const [agents, setAgents] = useState<AgentDataItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionDataItem[]>([]);
  const [logs, setLogs] = useState<LogDataItem[]>([]);
  const [eventsCount, setEventsCount] = useState(0);

  const loadDashboard = async () => {
    try {
      const [agentsRows, commissionRows, logRows, eventRows] = await Promise.all([
        api.admin.getAgents(),
        api.admin.getCommissions(),
        api.admin.getLogs(),
        api.events.getList(),
      ]);

      if (Array.isArray(agentsRows)) {
        setAgents(agentsRows.map((a: any) => ({
          id: Number(a.id),
          name: String(a.name || ""),
          office: String(a.office || "-"),
          status: String(a.status || "Pending"),
          joined: a.created_at
            ? new Date(a.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
            : "-",
        })));
      }

      if (Array.isArray(commissionRows)) {
        setCommissions(commissionRows.map((c: any) => ({
          id: Number(c.id),
          agent: String(c.agent?.name || "Unknown Agent"),
          property: String(c.property || "-"),
          amount: Number(c.amount || 0),
          xpEarned: Number(c.xp_earned || 0),
          status: String(c.status || "Pending"),
        })));
      }

      if (Array.isArray(logRows)) {
        setLogs(logRows.map((l: any) => ({
          action: String(l.action || "-"),
          actor: String(l.actor_name || "System"),
          time: l.created_at
            ? new Date(l.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
            : "-",
          type: String(l.type || "other"),
        })));
      }

      if (Array.isArray(eventRows)) {
        setEventsCount(eventRows.filter((e: any) => String(e.status || "").toLowerCase() === "active").length);
      }
    } catch {
      // Keep dashboard empty when API fails.
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const monthlyXP = useMemo(() => {
    const total = commissions
      .filter(c => c.status === "Approved")
      .reduce((sum, c) => sum + c.xpEarned, 0);
    return `${(total / 1_000_000).toFixed(1)}M`;
  }, [commissions]);

  const approvedTransactions = commissions.filter(c => c.status === "Approved").length;
  const activeAgentsCount = agents.filter(a => a.status === "Active").length;
  const pendingAgents = agents.filter(a => a.status === "Pending");
  const pendingCommissions = commissions.filter(c => c.status === "Pending");

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount || 0);

  const handleApproveAgent = async (id: number) => {
    try {
      await api.admin.updateAgentStatus(id, "approve");
      await loadDashboard();
    } catch {}
  };

  const handleSuspendAgent = async (id: number) => {
    try {
      await api.admin.updateAgentStatus(id, "suspend");
      await loadDashboard();
    } catch {}
  };

  const stats = [
    { label: "Total Agent Aktif", value: String(activeAgentsCount),  icon: Users,       color: isDark ? "#60A5FA" : "#1A6FC4", bg: isDark ? "rgba(96, 165, 250, 0.15)" : "#EEF5FC" },
    { label: "Pendaftaran Pending", value: String(pendingAgents.length),  icon: AlertCircle, color: isDark ? "#F59E0B" : "#D97706", bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" },
    { label: "Klaim Komisi Pending", value: String(pendingCommissions.length), icon: DollarSign,  color: isDark ? "#FBBF24" : "#E8A500", bg: isDark ? "rgba(251, 191, 36, 0.15)" : "#FFFAED" },
    { label: "Event Aktif",         value: String(eventsCount),  icon: Zap,         color: isDark ? "#A78BFA" : "#7B2FBE", bg: isDark ? "rgba(167, 139, 250, 0.15)" : "#F5F0FD" },
    { label: "Total XP Bulan Ini",  value: monthlyXP,icon: TrendingUp, color: isDark ? "#34D399" : "#16A34A", bg: isDark ? "rgba(52, 211, 153, 0.15)" : "#DCFCE7" },
    { label: "Transaksi Disetujui", value: String(approvedTransactions), icon: CheckCircle, color: isDark ? "#FBBF24" : "#C8922A", bg: isDark ? "rgba(251, 191, 36, 0.15)" : "#FEF3C7" },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
          Dashboard Admin
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.text3 }}>Senin, 19 Juni 2025 · LOT Property Group</p>
      </div>

      {/* Stat cards - Compact flex layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        {stats.map(s => (
          <Card key={s.label} className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold leading-none" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, color: s.color }}>{s.value}</p>
              <EllipsisTooltip 
                text={s.label} 
                className="text-[10px] mt-1.5 uppercase tracking-wider font-semibold truncate block" 
                style={{ color: T.text3 }} 
              />
            </div>
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
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" 
              style={{ 
                backgroundColor: isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7", 
                color: isDark ? "#F59E0B" : "#D97706" 
              }}>
              {pendingAgents.length} pending
            </span>
          </div>
          <div className="space-y-2.5">
            {pendingAgents.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: T.muted }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#4B5563,#6B7280)" }}>
                  {a.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <EllipsisTooltip 
                    text={a.name} 
                    className="text-sm font-semibold truncate block" 
                    style={{ color: T.text1 }} 
                  />
                  <p className="text-xs" style={{ color: T.text3 }}>{a.office} · {a.joined}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleApproveAgent(a.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                    style={{ 
                      backgroundColor: isDark ? "rgba(52, 211, 153, 0.15)" : "#DCFCE7", 
                      color: isDark ? "#34D399" : "#16A34A" 
                    }}>
                    Approve
                  </button>
                  <button onClick={() => handleSuspendAgent(a.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                    style={{ 
                      backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2", 
                      color: isDark ? "#F87171" : "#DC2626" 
                    }}>
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
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" 
              style={{ 
                backgroundColor: isDark ? "rgba(251, 191, 36, 0.15)" : "#FFFAED", 
                color: isDark ? "#FBBF24" : "#E8A500" 
              }}>
              {pendingCommissions.length} pending
            </span>
          </div>
          <div className="space-y-2.5">
            {pendingCommissions.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: T.muted }}>
                <div className="flex-1 min-w-0">
                  <EllipsisTooltip 
                    text={c.agent} 
                    className="text-sm font-semibold truncate block" 
                    style={{ color: T.text1 }} 
                  />
                  <EllipsisTooltip 
                    text={c.property} 
                    className="text-xs truncate block" 
                    style={{ color: T.text3 }} 
                  />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}>{formatIDR(c.amount)}</p>
                  <p className="text-xs font-bold" style={{ color: isDark ? "#FBBF24" : "#C8922A" }}>{`+${c.xpEarned} XP`}</p>
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
          {logs.slice(0, 5).map((l, i) => {
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
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: isDark ? c.color : c.color }} />
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
