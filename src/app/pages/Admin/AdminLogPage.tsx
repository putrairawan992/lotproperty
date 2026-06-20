import Card from "../../components/Card";
import { T } from "../../types";
import { LOG_DATA_LIST } from "../../appData";

export default function AdminLogPage() {
  const typeConfig: Record<string, { bg: string; color: string; label: string }> = {
    commission: { bg: "#FFFAED", color: "#E8A500",  label: "Commission" },
    agent:      { bg: "#EEF5FC", color: "#1A6FC4",  label: "Agent" },
    xp:         { bg: "#F5F0FD", color: "#7B2FBE",  label: "XP" },
    recruit:    { bg: "#DCFCE7", color: "#16A34A",  label: "Recruit" },
    hof:        { bg: "#FEF3C7", color: "#C8922A",  label: "HoF" },
    event:      { bg: "#FEE2E2", color: "#DC2626",  label: "Event" },
  };

  const LOG_DATA = LOG_DATA_LIST;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>System Log</h1>
      <Card className="overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {LOG_DATA.map((l, i) => {
            const c = typeConfig[l.type] || { bg: "#F3F4F6", color: T.text3, label: l.type };
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <span className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: c.bg, color: c.color }}>{c.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: T.text1 }}>{l.action}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.text3 }}>{l.actor}</p>
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
