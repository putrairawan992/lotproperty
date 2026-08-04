import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { T } from "../../types";
import { api } from "../../services/api";

interface LogItem {
  time: string;
  actor: string;
  action: string;
  type: string;
  ip_address?: string;
  user_agent?: string;
}

function parseBrowser(ua: string): string {
  if (!ua) return "-";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return "Browser";
}

export default function AdminLogPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rows = await api.admin.getLogs();
        if (cancelled || !Array.isArray(rows)) return;
        setLogs(rows.map((l: any) => ({
          time: l.created_at
            ? new Date(l.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
            : "-",
          actor: String(l.actor_name || "System"),
          action: String(l.action || "-"),
          type: String(l.type || "other"),
          ip_address: l.ip_address || "",
          user_agent: l.user_agent || "",
        })));
      } catch {
        // Keep empty logs when API fails.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const typeConfig: Record<string, { bg: string; color: string; label: string }> = {
    commission: { bg: "#FFFAED", color: "#E8A500",  label: "Commission" },
    agent:      { bg: "#EEF5FC", color: "#1A6FC4",  label: "Agent" },
    xp:         { bg: "#F5F0FD", color: "#7B2FBE",  label: "XP" },
    recruit:    { bg: "#DCFCE7", color: "#16A34A",  label: "Recruit" },
    hof:        { bg: "#FEF3C7", color: "#C8922A",  label: "HoF" },
    event:      { bg: "#FEE2E2", color: "#DC2626",  label: "Event" },
    academy:    { bg: "#E0F2FE", color: "#0284C7",  label: "Academy" },
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>System Log</h1>
      <Card className="overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {loading && (
            <div className="px-5 py-6 text-sm" style={{ color: T.text3 }}>
              Memuat system log...
            </div>
          )}
          {!loading && logs.length === 0 && (
            <div className="px-5 py-6 text-sm" style={{ color: T.text3 }}>
              Belum ada log aktivitas.
            </div>
          )}
          {logs.map((l, i) => {
            const c = typeConfig[l.type] || { bg: "#F3F4F6", color: T.text3, label: l.type };
            const browser = parseBrowser(l.user_agent || "");
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <span className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: c.bg, color: c.color }}>{c.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: T.text1 }}>{l.action}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{l.actor}</p>
                  {(l.ip_address || l.user_agent) && (
                    <p className="text-xs mt-0.5" style={{ color: T.text3, opacity: 0.7 }}>
                      {l.ip_address && <span>IP: {l.ip_address}</span>}
                      {l.ip_address && browser !== "-" && <span> · </span>}
                      {browser !== "-" && <span>{browser}</span>}
                    </p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: T.text3 }}>{l.time}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
