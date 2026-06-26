import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

// Types & Context
import { Page, AdminRole, T, ThemeCtx } from "./types";

// Routes & Navigation
import { useLocation, getPageFromUrl } from "./routes";

// Components
import TopHeader from "./components/TopHeader";
import BottomTabs from "./components/BottomTabs";
import LevelUpModal from "./components/LevelUpModal";

// Pages (Agent)
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PendingPage from "./pages/PendingPage";
import HomePage from "./pages/HomePage";
import QuestPage from "./pages/QuestPage";
import ListingPage from "./pages/ListingPage";
import ProspectPage from "./pages/ProspectPage";
import AcademyPage from "./pages/AcademyPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AttendancePage, { ThreeJsCheckmark } from "./pages/AttendancePage";
import HelpPage from "./pages/HelpPage";
import BoardPage from "./pages/BoardPage";

// Pages (Admin)
import AdminLoginPage from "./pages/Admin/AdminLoginPage";
import AdminApp from "./pages/Admin/AdminApp";

import { api } from "./services/api";
import GuestLoginPrompt from "./components/GuestLoginPrompt";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register" | "pending" | "forgot" | "admin">("login");
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const mainRef = useRef<HTMLDivElement>(null);

  const refreshUser = async () => {
    if (localStorage.getItem("lotproperty-auth-token")) {
      try {
        const profile = await api.auth.getMe();
        setUser(profile);
      } catch (e) {
        console.error("Failed to refresh user profile", e);
      }
    }
  };

  // Check stored auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("lotproperty-auth-token");
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
          setLoggedIn(true);
          
          // Check role and redirect if not regular Agent
          if (profile.role && profile.role !== "Agent") {
            setAdminRole(profile.role);
          }
        } catch (e) {
          api.auth.logout();
        }
      }
      setAppLoading(false);
    };
    checkAuth();
  }, []);

  // Trigger auto-attendance popup immediately on dashboard enter after login
  useEffect(() => {
    if (loggedIn) {
      const showPopup = localStorage.getItem("lotproperty-show-attendance-popup") === "true";
      if (showPopup) {
        setShowAttendancePopup(true);
        localStorage.setItem("lotproperty-show-attendance-popup", "false");
      }
    }
  }, [loggedIn]);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lotquest-theme');
      if (saved) return saved === 'dark';
      return true;
    }
    return true;
  });

  const { path, navigate } = useLocation();
  const page = getPageFromUrl();

  const toggleDark = () => setIsDark(d => {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 350);
    return !d;
  });

  // Apply / remove .dark class on the HTML root for CSS variable switching + persist
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem('lotquest-theme', !isDark ? 'light' : 'dark');
  }, [isDark]);

  // Sync URL with Auth View for Admin
  useEffect(() => {
    if (!loggedIn && adminRole === null) {
      if (path.startsWith("/admin")) {
        setAuthView("admin");
      } else if (authView === "admin") {
        setAuthView("login");
      }
    }
  }, [path, loggedIn, adminRole, authView]);

  // Auto scroll back to top of the menu/page on tab transitions
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [page, path]);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setLoggedIn(false);
    setIsGuest(false);
    setAdminRole(null);
    setAuthView("login");
    navigate("/");
  };

  const handleLoginRequest = () => {
    setIsGuest(false);
    navigate("/");
  };

  const handlePageChange = (newPage: Page) => {
    if (newPage === "home") {
      navigate("/");
    } else {
      navigate("/" + newPage);
    }
  };

  if (appLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: T.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8A500]/20 border-t-[#E8A500]" />
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: "#E8A500", fontFamily: "'Rajdhani', sans-serif" }}>
            LOT PROPERTY CRM
          </p>
        </div>
      </div>
    );
  }

  // Admin flow
  if (adminRole) {
    return (
      <ThemeCtx.Provider value={{ isDark, toggle: toggleDark, isGuest: false, onLoginRequest: handleLoginRequest, user, refreshUser }}>
        <AdminApp role={adminRole} onLogout={handleLogout} />
      </ThemeCtx.Provider>
    );
  }

  if (!loggedIn && !isGuest) {
    const renderAuth = () => {
      if (authView === "admin") return <AdminLoginPage onBack={() => { setAuthView("login"); navigate("/"); }} onLogin={r => setAdminRole(r)} />;
      if (authView === "register") return <RegisterPage onBack={() => setAuthView("login")} onSubmit={() => setAuthView("pending")} />;
      if (authView === "forgot") return <ForgotPasswordPage onBack={() => setAuthView("login")} />;
      if (authView === "pending") return <PendingPage onBack={() => setAuthView("login")} />;
      return <LoginPage onLogin={() => {
        const todayStr = new Date().toDateString();
        if (localStorage.getItem("lotproperty-attendance-date") !== todayStr) {
          localStorage.setItem("lotproperty-attendance-date", todayStr);
          localStorage.setItem("lotproperty-show-attendance-popup", "true");
        }
        setLoggedIn(true);
      }} onRegister={() => setAuthView("register")} onForgotPassword={() => setAuthView("forgot")} onAdminLogin={() => { setAuthView("admin"); navigate("/admin"); }} onGuest={() => setIsGuest(true)} />;
    };
    return (
      <ThemeCtx.Provider value={{ isDark, toggle: toggleDark, isGuest: false, onLoginRequest: handleLoginRequest, user, refreshUser }}>
        {renderAuth()}
      </ThemeCtx.Provider>
    );
  }

  const guestBlock = (el: React.ReactNode) =>
    isGuest ? <GuestLoginPrompt onLogin={handleLoginRequest} /> : el;

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage onNav={handlePageChange} onShowLevelUp={() => setShowLevelUp(true)} />;
      case "quest": return guestBlock(<QuestPage onNav={handlePageChange} />);
      case "listing": return guestBlock(<ListingPage />);
      case "prospect": return guestBlock(<ProspectPage />);
      case "academy": return <AcademyPage />;
      case "leaderboard": return <LeaderboardPage />;
      case "profile": return guestBlock(<ProfilePage />);
      case "notifications": return guestBlock(<NotificationsPage />);
      case "board": return <BoardPage />;
      case "event": return <EventDetailPage onBack={() => handlePageChange("home")} />;
      case "attendance": return guestBlock(<AttendancePage />);
      case "help": return <HelpPage onNav={handlePageChange} />;
      default: return <HomePage onNav={handlePageChange} onShowLevelUp={() => setShowLevelUp(true)} />;
    }
  };

  return (
    <ThemeCtx.Provider value={{ isDark, toggle: toggleDark, isGuest, onLoginRequest: handleLoginRequest, user, refreshUser }}>
      <div className="flex flex-col h-screen overflow-hidden animate-fade-in" style={{ backgroundColor: T.bg, fontFamily: "'Inter', sans-serif" }}>
        {/* Top Header */}
        <TopHeader page={page} onNav={handlePageChange} onLogout={handleLogout} />

        <div className="flex flex-1 overflow-hidden h-full">

          {/* Main content */}
          <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ paddingTop: 60, paddingBottom: 72 }}>
            {renderPage()}
          </main>
        </div>

        {/* Bottom Navigation — mobile only */}
        <div>
          <BottomTabs current={page} onNav={handlePageChange} />
        </div>

        {/* Floating Level Up demo trigger */}
        <motion.button
          onClick={() => setShowLevelUp(true)}
          className="fixed z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg text-xs font-bold border"
          style={{
            bottom: 80,
            right: 16,
            backgroundColor: isDark ? "rgba(232, 165, 0, 0.15)" : "rgba(232, 165, 0, 0.1)",
            borderColor: "rgba(232, 165, 0, 0.45)",
            color: isDark ? "#FFD666" : "#A66D00",
            boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(232, 165, 0, 0.08)",
            backdropFilter: "blur(6px)",
            fontFamily: "'Rajdhani', sans-serif"
          }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          ⭐ Level Up!
        </motion.button>

        {/* Level Up Modal */}
        {showLevelUp && (
          <LevelUpModal
            newLevel={46}
            newTier="Senior Agent"
            xpTotal="200,000 XP"
            onClose={() => setShowLevelUp(false)}
          />
        )}

        {/* 3D Celebration Popup Modal */}
        <AnimatePresence>
          {showAttendancePopup && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center relative overflow-hidden flex flex-col items-center"
                style={{
                  borderColor: "rgba(232, 165, 0, 0.3)",
                  background: isDark
                    ? "linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 249, 249, 0.95))",
                }}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 15, stiffness: 120 }}
              >
                {/* Gold light burst background effect */}
                <div className="absolute w-48 h-48 rounded-full bg-[#E8A500]/10 blur-3xl -top-12 -left-12 pointer-events-none" />
                <div className="absolute w-48 h-48 rounded-full bg-[#E8A500]/10 blur-3xl -bottom-12 -right-12 pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={() => setShowAttendancePopup(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-text3 transition-colors z-10"
                  style={{ backgroundColor: T.muted }}
                >
                  <X size={18} />
                </button>

                {/* 3D Canvas */}
                <div className="w-full relative mb-4">
                  <ThreeJsCheckmark />
                  {/* Overlay Badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-[#E8A500] border border-[#E8A500]/40 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                    SUCCESSFULLY PRESENT
                  </div>
                </div>

                {/* Title & Description */}
                <h2
                  className="font-bold text-2xl mb-1.5"
                  style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}
                >
                  Absensi Tercatat!
                </h2>
                <p className="text-sm mb-5 px-2" style={{ color: T.text3 }}>
                  Terima kasih telah hadir hari ini. Konsistensi adalah kunci kesuksesan Anda!
                </p>

                {/* XP Reward card */}
                <div
                  className="w-full p-4 rounded-2xl flex items-center justify-between border mb-6"
                  style={{
                    backgroundColor: isDark ? "rgba(232, 165, 0, 0.05)" : "#FFFAED",
                    borderColor: "rgba(232, 165, 0, 0.2)",
                  }}
                >
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: T.text3 }}>
                      REWARD HARIAN
                    </p>
                    <p className="text-sm font-semibold" style={{ color: T.text1 }}>
                      Quest Kehadiran Selesai
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold text-2xl flex items-center gap-1"
                      style={{ fontFamily: "'Rajdhani', sans-serif", color: "#C8922A" }}
                    >
                      ⚡ <span className="text-[#E8A500]">+100</span> <span className="text-xs font-semibold text-text3">XP</span>
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  onClick={() => setShowAttendancePopup(false)}
                  className="w-full py-3 rounded-xl font-bold transition-all text-white shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #E8A500, #C8922A)",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 16,
                    letterSpacing: "0.04em",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Lanjutkan Aktivitas
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeCtx.Provider>
  );
}
