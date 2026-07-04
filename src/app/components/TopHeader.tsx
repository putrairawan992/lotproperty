import { useState } from "react";
import { Page, T, useTheme } from "../types";
import { PAGE_TITLE } from "../routes";
import Logo from "./Logo";
import AgentAvatar from "./AgentAvatar";
import { Bell, ChevronRight, GraduationCap, HelpCircle, MessageSquare, LogIn } from "lucide-react";

export default function TopHeader({ page, onNav, onLogout }: {
  page: Page;
  onNav: (p: Page) => void;
  onLogout?: () => void;
}) {
  const { isDark, toggle, isGuest, user, onLoginRequest } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "A";
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 border-b flex items-center px-4 gap-3"
        style={{ height: 60, backgroundColor: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Logo />
        </div>

        {/* Page title */}
        <div className="flex-1 min-w-0 px-3">
          {/* <p className="font-bold truncate" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: T.text1, letterSpacing: "0.04em" }}>
            {PAGE_TITLE[page]}
          </p> */}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Dark/light toggle */}
          <button onClick={toggle}
            className="p-2 rounded-xl transition-all"
            style={{ color: T.text3, fontSize: 18 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Notification bell */}
          <button onClick={() => onNav("notifications")}
            className="relative p-2 rounded-xl transition-all"
            style={{ color: T.text2 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: "#E8A500" }} />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
              style={{ color: T.text2 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              <AgentAvatar
                initials={isGuest ? "G" : getInitials(user?.name)}
                size={32}
                isMe={true}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none" style={{ color: T.text1 }}>
                  {isGuest ? "Guest" : (user?.name || "Agent")}
                </p>
                <p className="text-xs leading-none mt-0.5" style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
                  {isGuest ? "Belum Login" : `Lv ${user?.level || 1} · ${user?.title || user?.tier || "Rookie Agent"}`}
                </p>
              </div>
              <ChevronRight size={14} style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0)", color: T.text3, transition: "transform 0.2s" }} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 rounded-xl border shadow-xl overflow-hidden"
                style={{ minWidth: 180, backgroundColor: T.card, borderColor: T.border, zIndex: 60 }}>
                {[
                  { label: "LOT FJB", icon: MessageSquare, page: "board" as Page },
                  { label: "Notification", icon: Bell, page: "notifications" as Page },
                  { label: "Help", icon: HelpCircle, page: "help" as Page },
                ].map(({ label, icon: Icon, page: p }) => (
                  <button key={p}
                    onClick={() => { onNav(p); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left`}
                    style={{ color: T.text2 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
                <div className="border-t" style={{ borderColor: T.border }} />
                {isGuest ? (
                  <button
                    onClick={() => { setMenuOpen(false); onLoginRequest(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                    style={{ color: "#E8A500" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <LogIn size={15} />
                    Login
                  </button>
                ) : (
                  onLogout && (
                    <button
                      onClick={() => { setMenuOpen(false); onLogout?.(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                      style={{ color: "#EF4444" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
