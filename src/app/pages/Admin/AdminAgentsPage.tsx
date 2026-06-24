import { useState } from "react";
import { Search, Users, Network, X, ChevronRight, ChevronDown, MapPin, Calendar, Award, Check, ShieldAlert, AlertTriangle, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import LevelBadge from "../../components/LevelBadge";
import { T, useTheme } from "../../types";
import { AGENT_DATA_LIST, AGENT_PHOTOS } from "../../appData";

interface TreeNodeData {
  name: string;
  level: string;
  initials: string;
  photo?: string;
  recruitsCount: number;
  children: TreeNodeData[];
}

// Recursive TreeNode data structure based on recruitment relationships
const TREE_ROOT: TreeNodeData = {
  name: "Rizki Pratama",
  level: "Elite Agent",
  initials: "RP",
  photo: AGENT_PHOTOS["RP"],
  recruitsCount: 4,
  children: [
    {
      name: "Siti Fatimah",
      level: "Elite Agent",
      initials: "SF",
      photo: AGENT_PHOTOS["SF"],
      recruitsCount: 2,
      children: [
        { name: "Linda Kusuma", level: "Junior Agent", initials: "LK", photo: AGENT_PHOTOS["LK"], recruitsCount: 0, children: [] },
        { name: "Doni Saputra", level: "Rookie Agent", initials: "DS", photo: AGENT_PHOTOS["DS"], recruitsCount: 0, children: [] }
      ]
    },
    {
      name: "Ahmad Fadhil",
      level: "Senior Agent",
      initials: "AF",
      photo: AGENT_PHOTOS["AF"],
      recruitsCount: 1,
      children: [
        { name: "Rendi Setiawan", level: "Junior Agent", initials: "RS", photo: AGENT_PHOTOS["RS"], recruitsCount: 0, children: [] }
      ]
    },
    {
      name: "Eko Purnomo",
      level: "Junior Agent",
      initials: "EP",
      photo: AGENT_PHOTOS["EP"],
      recruitsCount: 1,
      children: [
        { name: "Maya Putri", level: "Rookie Agent", initials: "MP", photo: AGENT_PHOTOS["MP"], recruitsCount: 0, children: [] }
      ]
    },
    {
      name: "Andi Wijaya",
      level: "Senior Agent",
      initials: "AW",
      photo: AGENT_PHOTOS["AW"],
      recruitsCount: 0,
      children: []
    }
  ]
};

// Helper to map agent level to brand colors
function getLevelColor(level: string): string {
  if (level.includes("Legendary")) return "#C0392B";
  if (level.includes("Super Elite")) return "#E8A500";
  if (level.includes("Elite")) return "#7040D0";
  if (level.includes("Senior")) return "#C8922A";
  if (level.includes("Junior")) return "#2070C0";
  return "#9CA3AF"; // Rookie Agent or default
}

// Recursive helper to calculate recruitment tree statistics
function getTreeStats(node: TreeNodeData): { total: number; byLevel: Record<string, number> } {
  let total = 1;
  const byLevel: Record<string, number> = { [node.level]: 1 };

  function recurse(n: TreeNodeData) {
    n.children.forEach(child => {
      total++;
      byLevel[child.level] = (byLevel[child.level] || 0) + 1;
      recurse(child);
    });
  }
  
  recurse(node);
  return { total, byLevel };
}

// 1. Desktop TreeNode component (Horizontal layout chart)
function TreeNode({
  node,
  search,
  isDark,
  onShowRecruits,
}: {
  node: TreeNodeData;
  search: string;
  isDark: boolean;
  onShowRecruits: (node: TreeNodeData) => void;
}) {
  const isMatch = search && node.name.toLowerCase().includes(search.toLowerCase());

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div
        className={`p-4 rounded-2xl border text-center transition-all duration-300 w-[168px] flex-shrink-0 flex flex-col items-center gap-2 shadow-md relative ${
          isMatch
            ? "ring-2 ring-[#E8A500] shadow-[0_0_20px_rgba(232,165,0,0.5)] bg-[#E8A500]/10 scale-105"
            : "bg-card border-border/80 hover:border-[#C8922A]/50"
        }`}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
          {node.photo ? (
            <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-xs font-bold">{node.initials}</div>
          )}
        </div>
        <p className="font-bold text-xs text-foreground truncate w-full px-0.5 leading-snug">{node.name}</p>
        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider leading-snug">{node.level}</p>
        {node.recruitsCount > 0 && (
          <button
            type="button"
            onClick={() => onShowRecruits(node)}
            className="inline-block mt-2 text-[8px] px-2 py-0.5 bg-[#E8A500]/15 text-[#E8A500] font-black rounded-full uppercase tracking-wider hover:bg-[#E8A500]/25 transition-colors cursor-pointer"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {node.recruitsCount} Recruits
          </button>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center w-full mt-6 relative">
          <div className="w-0.5 h-6 bg-border absolute top-0 -translate-y-6" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }} />

          <div className="flex justify-center gap-6 pt-6 relative w-max mx-auto">
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-border"
                style={{
                  left: `${100 / (node.children.length * 2)}%`,
                  right: `${100 / (node.children.length * 2)}%`,
                  backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                }}
              />
            )}

            {node.children.map((child, idx) => (
              <div key={idx} className="relative flex flex-col items-center flex-shrink-0">
                <div className="w-0.5 h-6 bg-border absolute top-0 -translate-y-6" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }} />
                <TreeNode node={child} search={search} isDark={isDark} onShowRecruits={onShowRecruits} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Mobile TreeNode component (Collapsible nested list layout with hierarchy lines)
function VerticalTreeNode({
  node,
  depth = 0,
  search,
  isDark,
  onShowRecruits,
}: {
  node: TreeNodeData;
  depth?: number;
  search: string;
  isDark: boolean;
  onShowRecruits: (node: TreeNodeData) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isMatch = search && node.name.toLowerCase().includes(search.toLowerCase());
  const hasChildren = node.children && node.children.length > 0;
  const lvlColor = getLevelColor(node.level);

  const isAnyMatchActive = search.length > 0;
  const isDimmed = isAnyMatchActive && !isMatch;

  return (
    <div className="w-full relative text-left py-1 select-none">
      {/* Branch Line L-Shape for children (Themed gold threads) */}
      {depth > 0 && (
        <div 
          className="absolute border-l border-b border-dashed transition-colors animate-fade-in"
          style={{
            left: "-14px",
            top: "0px",
            width: "14px",
            height: "22px",
            borderColor: isDark ? "rgba(232, 165, 0, 0.28)" : "rgba(200, 146, 42, 0.25)",
            borderBottomLeftRadius: "6px",
          }}
        />
      )}

      <div 
        className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all border ${
          isMatch 
            ? "bg-[#E8A500]/10 border-[#E8A500] shadow-[0_0_12px_rgba(232,165,0,0.3)] scale-[1.01]" 
            : isDark 
              ? "bg-[#18181A]/80 border-[#2A2A2E] hover:bg-[#202024]/80 hover:border-[#3A3A40]" 
              : "bg-white border-gray-100 hover:bg-gray-50/80 hover:shadow-sm"
        }`}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: lvlColor,
          opacity: isDimmed ? 0.45 : 1.0,
          filter: isDimmed ? "grayscale(0.2)" : "none"
        }}
      >
        {/* Collapse/Expand Toggle */}
        {hasChildren ? (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground flex-shrink-0 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Profile photo */}
        <div className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 shadow-sm" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}>
          {node.photo ? (
            <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center font-bold text-[10px]"
              style={{ 
                backgroundColor: lvlColor + "15", 
                color: lvlColor 
              }}
            >
              {node.initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate leading-tight">{node.name}</p>
          <p 
            className="text-[8px] font-extrabold uppercase tracking-widest leading-none mt-1"
            style={{ color: lvlColor }}
          >
            {node.level}
          </p>
        </div>

        {/* Recruits count badge */}
        {node.recruitsCount > 0 && (
          <button
            onClick={() => onShowRecruits(node)}
            className="px-2 py-0.5 bg-[#E8A500]/10 text-[#E8A500] font-black text-[8px] rounded-full uppercase tracking-wider hover:bg-[#E8A500]/25 transition-colors flex-shrink-0 cursor-pointer"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {node.recruitsCount} Recruits
          </button>
        )}
      </div>

      {/* Children container with animation */}
      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full relative ml-3.5 pl-3.5 border-l border-dashed overflow-hidden"
            style={{ borderColor: isDark ? "rgba(232, 165, 0, 0.2)" : "rgba(200, 146, 42, 0.15)" }}
          >
            {node.children.map((child, idx) => (
              <VerticalTreeNode 
                key={idx} 
                node={child} 
                depth={depth + 1} 
                search={search} 
                isDark={isDark} 
                onShowRecruits={onShowRecruits} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminAgentsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "tree">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [agents, setAgents] = useState(AGENT_DATA_LIST);
  const [recruitsModal, setRecruitsModal] = useState<TreeNodeData | null>(null);
  const { isDark } = useTheme();
  const stats = getTreeStats(TREE_ROOT);

  const filtered = agents.filter(a =>
    (statusFilter === "All" || a.status === statusFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = (id: string, status: string) =>
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const StatusChip = ({ s }: { s: string }) => {
    const cfg = s === "Active" ? { bg: isDark ? "rgba(22, 163, 74, 0.15)" : "#DCFCE7", c: isDark ? "#34D399" : "#16A34A" }
              : s === "Pending"   ? { bg: isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7", c: isDark ? "#F59E0B" : "#D97706" }
              : { bg: isDark ? "rgba(220, 38, 38, 0.15)" : "#FEE2E2", c: isDark ? "#F87171" : "#DC2626" };
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{s}</span>;
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col gap-3.5 items-start border-b pb-4" style={{ borderColor: T.border }}>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>Agent Management</h1>
        
        {/* Tab switch placed below the title */}
        <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto" style={{ backgroundColor: T.muted }}>
          <button onClick={() => { setActiveTab("list"); setSearch(""); }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ 
              backgroundColor: activeTab === "list" ? (isDark ? "#2A241C" : "white") : "transparent", 
              color: activeTab === "list" ? "#E8A500" : (isDark ? "#9CA3AF" : "#6B7280"),
              boxShadow: activeTab === "list" && !isDark ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}>
            <Users size={13} /> Daftar Agen
          </button>
          <button onClick={() => { setActiveTab("tree"); setSearch(""); }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ 
              backgroundColor: activeTab === "tree" ? (isDark ? "#2A241C" : "white") : "transparent", 
              color: activeTab === "tree" ? "#E8A500" : (isDark ? "#9CA3AF" : "#6B7280"),
              boxShadow: activeTab === "tree" && !isDark ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}>
            <Network size={13} /> Pohon Rekrutmen
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: LIST VIEW */}
        {activeTab === "list" && (
          <motion.div key="list" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: T.border }}>
                <div className="relative flex-1" style={{ minWidth: 200 }}>
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl border text-sm outline-none bg-card"
                    style={{ borderColor: T.border }} />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                  {["All","Active","Pending","Suspended"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                      style={{ 
                        backgroundColor: statusFilter === s ? "#E8A500" : (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), 
                        color: statusFilter === s ? "white" : "var(--foreground)" 
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Table View (hidden on mobile) */}
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead><tr className="border-b" style={{ borderColor: T.border }}>
                    {["AGENT","KANTOR","LEVEL","STATUS","BERGABUNG","AKSI"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: T.text3 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b transition-colors" style={{ borderColor: "var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.muted)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <LevelBadge title={a.level} size={30} />
                            <div className="text-left">
                              <p className="text-sm font-semibold" style={{ color: T.text1 }}>{a.name}</p>
                              <p className="text-xs" style={{ color: T.text3 }}>{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-left" style={{ color: T.text2 }}>{a.office}</td>
                        <td className="px-4 py-3 text-sm text-left" style={{ color: T.text2 }}>{a.level}</td>
                        <td className="px-4 py-3 text-left"><StatusChip s={a.status} /></td>
                        <td className="px-4 py-3 text-sm text-left" style={{ color: T.text3 }}>{a.joined}</td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex gap-1.5">
                            {a.status === "Pending" && (
                              <button onClick={() => updateStatus(a.id, "Active")}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7]/80">Approve</button>
                            )}
                            {a.status === "Active" && (
                              <button onClick={() => updateStatus(a.id, "Suspended")}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]/80">Suspend</button>
                            )}
                            {a.status === "Suspended" && (
                              <button onClick={() => updateStatus(a.id, "Active")}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EEF5FC] text-[#1A6FC4] hover:bg-[#EEF5FC]/80">Aktifkan</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (visible only on mobile) */}
              <div className="block sm:hidden p-4 space-y-4 bg-muted/10">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm" style={{ color: T.text3 }}>Tidak ada agen ditemukan</div>
                ) : (
                  filtered.map(a => {
                    const statusBorderColor = a.status === "Active" ? "#10B981" : a.status === "Pending" ? "#F59E0B" : "#EF4444";
                    const lvlColor = getLevelColor(a.level);
                    const isCardMatch = search && (a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));
                    const isAnySearchActive = search.length > 0;
                    const isCardDimmed = isAnySearchActive && !isCardMatch;
                    
                    return (
                      <motion.div 
                        key={a.id} 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border shadow-sm overflow-hidden transition-all bg-card flex flex-col ${
                          isCardMatch 
                            ? "ring-2 ring-[#E8A500] shadow-[0_0_12px_rgba(232,165,0,0.3)] scale-[1.01]" 
                            : "hover:shadow-md hover:scale-[1.005]"
                        }`}
                        style={{ 
                          borderColor: T.border,
                          borderLeft: `4px solid ${statusBorderColor}`,
                          opacity: isCardDimmed ? 0.5 : 1.0,
                          filter: isCardDimmed ? "grayscale(0.1)" : "none"
                        }}
                      >
                        {/* Upper info section */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <LevelBadge title={a.level} size={36} />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-bold truncate text-foreground" style={{ color: T.text1 }}>{a.name}</p>
                              <p className="text-xs truncate text-muted-foreground" style={{ color: T.text3 }}>{a.email}</p>
                              <span 
                                className="inline-block text-[8px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: lvlColor + "12", color: lvlColor }}
                              >
                                {a.level}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 self-start">
                              <StatusChip s={a.status} />
                              <div className="flex items-center gap-1.5">
                                {a.phone && (
                                  <a 
                                    href={`tel:${a.phone}`} 
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-[#1A6FC4]/10 text-[#1A6FC4] dark:bg-[#1A6FC4]/25 dark:text-[#60A5FA] hover:scale-110 active:scale-95 cursor-pointer"
                                    title="Hubungi Telepon"
                                  >
                                    <Phone size={12} />
                                  </a>
                                )}
                                <a 
                                  href={`mailto:${a.email}`} 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-[#E8A500]/10 text-[#E8A500] dark:bg-[#E8A500]/25 dark:text-[#FBBF24] hover:scale-110 active:scale-95 cursor-pointer"
                                  title="Kirim Email"
                                >
                                  <Mail size={12} />
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          {/* Office & Joined metadata with micro-icons */}
                          <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t" style={{ borderColor: T.border }}>
                            <div className="text-left flex items-start gap-1.5">
                              <MapPin size={13} className="mt-0.5 text-muted-foreground flex-shrink-0" style={{ color: T.text3 }} />
                              <div className="min-w-0">
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground" style={{ color: T.text3 }}>KANTOR</p>
                                <p className="font-semibold text-foreground truncate mt-0.5" style={{ color: T.text2 }}>{a.office}</p>
                              </div>
                            </div>
                            <div className="text-left flex items-start gap-1.5">
                              <Calendar size={13} className="mt-0.5 text-muted-foreground flex-shrink-0" style={{ color: T.text3 }} />
                              <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground" style={{ color: T.text3 }}>BERGABUNG</p>
                                <p className="font-semibold text-foreground mt-0.5" style={{ color: T.text2 }}>{a.joined}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons panel */}
                        <div className="px-4 pb-3 flex gap-2">
                          {a.status === "Pending" && (
                            <button 
                              onClick={() => updateStatus(a.id, "Active")}
                              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7]/80 dark:bg-[#16A34A]/15 dark:text-[#34D399] dark:hover:bg-[#16A34A]/25"
                            >
                              <Check size={13} /> Approve
                            </button>
                          )}
                          {a.status === "Active" && (
                            <button 
                              onClick={() => updateStatus(a.id, "Suspended")}
                              className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]/80 dark:bg-[#DC2626]/15 dark:text-[#F87171] dark:hover:bg-[#DC2626]/25"
                            >
                              <ShieldAlert size={13} /> Suspend
                            </button>
                          )}
                          {a.status === "Suspended" && (
                            <button 
                              onClick={() => updateStatus(a.id, "Active")}
                              className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer bg-[#EEF5FC] text-[#1A6FC4] hover:bg-[#EEF5FC]/80 dark:bg-[#1A6FC4]/15 dark:text-[#60A5FA] dark:hover:bg-[#1A6FC4]/25"
                            >
                              <Check size={13} /> Aktifkan
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: RECRUITMENT TREE VIEW */}
        {activeTab === "tree" && (
          <motion.div key="tree" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Tree Summary Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl border text-left bg-card shadow-sm relative overflow-hidden" style={{ borderColor: T.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>Total Jaringan</p>
                <p className="text-lg font-black mt-1" style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }}>{stats.total} Agen</p>
                <div className="absolute right-2.5 bottom-2.5 text-muted-foreground/10"><Users size={20} /></div>
              </div>
              <div className="p-3.5 rounded-2xl border text-left bg-card shadow-sm relative overflow-hidden" style={{ borderColor: T.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>Elite Agent</p>
                <p className="text-lg font-black mt-1" style={{ color: getLevelColor("Elite Agent"), fontFamily: "'Rajdhani', sans-serif" }}>
                  {stats.byLevel["Elite Agent"] || 0}
                </p>
                <div className="absolute right-2.5 bottom-2.5" style={{ color: `${getLevelColor("Elite Agent")}10` }}><Award size={20} /></div>
              </div>
              <div className="p-3.5 rounded-2xl border text-left bg-card shadow-sm relative overflow-hidden" style={{ borderColor: T.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>Senior Agent</p>
                <p className="text-lg font-black mt-1" style={{ color: getLevelColor("Senior Agent"), fontFamily: "'Rajdhani', sans-serif" }}>
                  {stats.byLevel["Senior Agent"] || 0}
                </p>
                <div className="absolute right-2.5 bottom-2.5" style={{ color: `${getLevelColor("Senior Agent")}10` }}><Award size={20} /></div>
              </div>
              <div className="p-3.5 rounded-2xl border text-left bg-card shadow-sm relative overflow-hidden" style={{ borderColor: T.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>Junior & Rookie</p>
                <p className="text-lg font-black mt-1" style={{ color: getLevelColor("Junior Agent"), fontFamily: "'Rajdhani', sans-serif" }}>
                  {(stats.byLevel["Junior Agent"] || 0) + (stats.byLevel["Rookie Agent"] || 0)}
                </p>
                <div className="absolute right-2.5 bottom-2.5" style={{ color: `${getLevelColor("Junior Agent")}10` }}><Users size={20} /></div>
              </div>
            </div>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1" style={{ minWidth: 200 }}>
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari agen dalam jaringan rekrutmen..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl border text-sm outline-none bg-card"
                    style={{ borderColor: T.border }} />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-all cursor-pointer">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile View: Vertical Folder Tree (visible on mobile) */}
              <div className="block lg:hidden w-full border rounded-2xl p-2.5 bg-card/20" style={{ borderColor: T.border }}>
                <VerticalTreeNode node={TREE_ROOT} search={search} isDark={isDark} onShowRecruits={setRecruitsModal} />
              </div>

              {/* Desktop View: Horizontal Tree Scroll (visible on desktop) */}
              <div
                className="hidden lg:block w-full overflow-x-auto overscroll-x-contain py-8 bg-card/40 rounded-2xl border min-h-[500px]"
                style={{ borderColor: T.border, WebkitOverflowScrolling: "touch" }}
              >
                <div className="w-max min-w-full mx-auto px-8 sm:px-12">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <TreeNode node={TREE_ROOT} search={search} isDark={isDark} onShowRecruits={setRecruitsModal} />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modal: Daftar Rekrut */}
      <AnimatePresence>
        {recruitsModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRecruitsModal(null)}
          >
            <motion.div
              className="bg-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
              style={{ borderColor: T.border }}
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.text3 }}>Daftar Rekrut</p>
                  <h3 className="font-bold text-base" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
                    {recruitsModal.name}
                  </h3>
                </div>
                <button onClick={() => setRecruitsModal(null)} className="p-1.5 rounded-lg hover:bg-muted" style={{ color: T.text3 }}>
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                <p className="text-xs mb-3 text-left" style={{ color: T.text3 }}>
                  {recruitsModal.recruitsCount} agen direkrut oleh {recruitsModal.name.split(" ")[0]}:
                </p>
                {recruitsModal.children.map((recruit, i) => (
                  <div
                    key={recruit.name}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-muted/40"
                    style={{ borderColor: T.border }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border flex-shrink-0" style={{ borderColor: T.border }}>
                      {recruit.photo ? (
                        <img src={recruit.photo} alt={recruit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-xs font-bold">{recruit.initials}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate" style={{ color: T.text1 }}>{recruit.name}</p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: T.text3 }}>{recruit.level}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(232, 165, 0, 0.1)", color: "#E8A500" }}>
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t text-center" style={{ borderColor: T.border }}>
                <button
                  onClick={() => setRecruitsModal(null)}
                  className="text-xs font-bold px-4 py-2 rounded-lg border transition-colors hover:bg-muted"
                  style={{ borderColor: T.border, color: T.text2, fontFamily: "'Rajdhani', sans-serif" }}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
