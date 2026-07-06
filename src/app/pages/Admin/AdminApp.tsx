import { useEffect, useState } from "react";
import { Home, Users, DollarSign, Trophy, GraduationCap, Zap, TrendingUp, BookOpen, X, Menu, LifeBuoy } from "lucide-react";
import Logo from "../../components/Logo";
import { T, useTheme, AdminRole, AdminPage, ROLE_COLOR } from "../../types";
import { useLocation } from "../../routes";
import { api } from "../../services/api";

import AdminDashboard from "./AdminDashboard";
import AdminAgentsPage from "./AdminAgentsPage";
import AdminCommissionPage from "./AdminCommissionPage";
import AdminHoFPage from "./AdminHoFPage";
import AdminXPPage from "./AdminXPPage";
import AdminLogPage from "./AdminLogPage";
import AdminEventsPage from "./AdminEventsPage";
import AdminAcademyPage from "./AdminAcademyPage";

const ADMIN_NAV: { id: AdminPage; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard",  label: "Dashboard",         icon: Home },
  { id: "agents",     label: "Agent Management",  icon: Users,        badge: 3 },
  { id: "commission", label: "Agent Submissions", icon: DollarSign,   badge: 7 },
  { id: "hof",        label: "Hall of Fame",       icon: Trophy },
  { id: "academy",    label: "Academy",            icon: GraduationCap },
  { id: "events",     label: "Events",             icon: Zap },
  { id: "xp",         label: "XP Adjustment",      icon: TrendingUp },
  { id: "log",        label: "System Log",         icon: BookOpen },
];

export default function AdminApp({ role, onLogout }: { role: AdminRole; onLogout: () => void }) {
  const { isDark, toggle } = useTheme();
  const { path, navigate } = useLocation();
  const rawPage = path.replace(/^\/admin\//, "");
  const page: AdminPage = ["dashboard", "agents", "commission", "hof", "academy", "events", "xp", "log"].includes(rawPage)
    ? (rawPage as AdminPage)
    : "dashboard";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [agentPendingCount, setAgentPendingCount] = useState(0);
  const [commissionPendingCount, setCommissionPendingCount] = useState(0);
  const [helpPendingCount, setHelpPendingCount] = useState(0);
  const rc = ROLE_COLOR[role];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const canSeeAgents = role === "Super Admin" || role === "Office Manager";
        const [agents, commissions, helpSubmissions] = await Promise.all([
          canSeeAgents ? api.admin.getAgents() : Promise.resolve([]),
          api.admin.getCommissions(),
          api.admin.getHelpSubmissions(),
        ]);
        if (!cancelled) {
          if (canSeeAgents && Array.isArray(agents)) {
            setAgentPendingCount(agents.filter((a: any) => String(a.status || "") === "Pending").length);
          }
          if (Array.isArray(commissions)) {
            setCommissionPendingCount(commissions.filter((c: any) => String(c.status || "") === "Pending").length);
          }
          if (Array.isArray(helpSubmissions)) {
            setHelpPendingCount(helpSubmissions.filter((h: any) => String(h.status || "") === "Menunggu Verifikasi" || String(h.status || "") === "Terkirim").length);
          }
        }
      } catch {
        // Keep default badges when API fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <AdminDashboard />;
      case "agents":     return <AdminAgentsPage />;
      case "commission": return <AdminCommissionPage role={role} />;
      case "hof":        return <AdminHoFPage />;
      case "academy":    return <AdminAcademyPage />;
      case "events":     return <AdminEventsPage />;
      case "xp":         return <AdminXPPage />;
      case "log":        return <AdminLogPage />;
      default:           return <AdminDashboard />;
    }
  };

  const AdminSidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-card border-r" style={{ width: 240, borderColor: T.border }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
        <div>
          <Logo />
          <div className="mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ backgroundColor: rc.bg, color: rc.color }}>{role}</span>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden" style={{ color: T.text3 }}><X size={20} /></button>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {ADMIN_NAV.map(({ id, label, icon: Icon, badge }) => {
          const resolvedBadge = id === "agents" ? agentPendingCount : id === "commission" ? (commissionPendingCount + helpPendingCount) : badge;
          const canSee = role === "Super Admin" ? true
            : role === "Office Manager" ? ["dashboard","agents","commission","hof","events","academy","log"].includes(id)
            : role === "Finance" ? ["dashboard","commission","log"].includes(id)
            : false;
          if (!canSee) return null;
          const active = page === id;
          return (
            <button key={id} onClick={() => { navigate("/admin/" + id); onClose?.(); }}
              className="w-full flex items-center gap-3 px-3 rounded-xl transition-all text-left"
              style={{
                height: 44,
                backgroundColor: active ? "#FFFAED" : "transparent",
                color: active ? "#E8A500" : "#4B5563",
                fontFamily: "'Inter', sans-serif",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                borderLeft: `3px solid ${active ? "#E8A500" : "transparent"}`,
              }}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {resolvedBadge ? (
                <span className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                  style={{ backgroundColor: "#E8A500", color: "white", fontSize: 10 }}>{resolvedBadge}</span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: T.border }}>
        <p className="text-center font-semibold italic tracking-widest"
          style={{ color: "#C8922A", fontSize: 10, fontFamily: "'Rajdhani', sans-serif" }}>
          FOCUS · GROW · BE LEGENDARY
        </p>
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors"
          style={{ borderColor: T.border, color: T.text3 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  const pageTitles: Record<AdminPage, string> = {
    dashboard: "Dashboard", agents: "Agent Management", commission: "Commission",
    hof: "Hall of Fame", academy: "Academy", events: "Events", xp: "XP Adjustment", log: "System Log",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: T.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: 240 }}>
        <div className="h-full"><AdminSidebar /></div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.25)" }} onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10"><AdminSidebar onClose={() => setDrawerOpen(false)} /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 bg-card border-b" style={{ height: 56, borderColor: T.border }}>
          <button onClick={() => setDrawerOpen(true)} className="p-2" style={{ color: T.text2 }}><Menu size={22} /></button>
          <Logo />
          {/* Dark/light toggle */}
          <button onClick={toggle}
            className="p-2 rounded-xl transition-all"
            style={{ color: T.text3, fontSize: 18 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between px-6 bg-card border-b flex-shrink-0" style={{ height: 56, borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}>
              {pageTitles[page]}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark/light toggle */}
            <button onClick={toggle}
              className="p-2 rounded-xl transition-all"
              style={{ color: T.text3, fontSize: 18 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <button onClick={onLogout} className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors"
              style={{ borderColor: T.border, color: T.text3 }}
              onMouseEnter={e => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "#DC262640"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
