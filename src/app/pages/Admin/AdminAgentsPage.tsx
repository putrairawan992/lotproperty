import { useEffect, useState, useRef } from "react";
import { Search, Users, Network, X, ChevronRight, ChevronDown, MapPin, Calendar, Award, Check, ShieldAlert, AlertTriangle, Phone, Mail, MoreVertical, Trash2, Edit3, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../components/Card";
import LevelBadge from "../../components/LevelBadge";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { T, useTheme } from "../../types";
import { AGENT_PHOTOS } from "../../appData";
import { api } from "../../services/api";

interface AgentItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  office: string;
  level: string;
  status: string;
  joined: string;
  mentor_id?: number | null;
  role?: string;
  photo_url?: string;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface TreeNodeData {
  name: string;
  level: string;
  initials: string;
  photo?: string;
  recruitsCount: number;
  children: TreeNodeData[];
}

// Recursive TreeNode data structure based on recruitment relationships

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
function getTreeStats(node: TreeNodeData | null): { total: number; byLevel: Record<string, number> } {
  if (!node) return { total: 0, byLevel: {} };
  let total = 1;
  const byLevel: Record<string, number> = { [node.level]: 1 };

  function recurse(n: TreeNodeData) {
    const children = n.children || [];
    children.forEach(child => {
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
        className={`p-4 rounded-2xl border text-center transition-all duration-300 w-[168px] flex-shrink-0 flex flex-col items-center gap-2 shadow-md relative ${isMatch
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
        <EllipsisTooltip
          text={node.name}
          className="font-bold text-xs text-foreground truncate w-full px-0.5 leading-snug"
        />
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
        className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all border ${isMatch
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
          <EllipsisTooltip
            text={node.name}
            className="text-xs font-bold text-foreground truncate leading-tight"
          />
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
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [recruitsModal, setRecruitsModal] = useState<TreeNodeData | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");
  const [editModal, setEditModal] = useState<AgentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editMentorId, setEditMentorId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Create Agent modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Agent");
  const [newMentorId, setNewMentorId] = useState<number | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  // Photo for Create
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState("");
  // Photo for Edit
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastError, setToastError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeStatusSelectAgentId, setActiveStatusSelectAgentId] = useState<number | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [treeRoot, setTreeRoot] = useState<TreeNodeData | null>(null);
  const stats = getTreeStats(treeRoot);

  const formatJoined = (createdAt?: string) => {
    if (!createdAt) return "-";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rows = await api.admin.getAgents();
        if (cancelled || !Array.isArray(rows)) return;
        setAgents(rows.map((r: any) => ({
          id: Number(r.id),
          name: String(r.name || ""),
          email: String(r.email || ""),
          phone: String(r.phone || ""),
          office: String(r.office || "-"),
          level: String(r.title || "Rookie Agent"),
          status: String(r.status || "Pending"),
          joined: formatJoined(r.created_at),
          mentor_id: r.mentor_id ? Number(r.mentor_id) : null,
          role: String(r.role || "Agent"),
          photo_url: String(r.photo_url || ""),
        })));
      } catch {
        // Keep empty list when API fails.
      } finally {
        if (!cancelled) setLoadingAgents(false);
      }
    })();

    (async () => {
      try {
        const treeData = await api.admin.getAgentsTree();
        if (cancelled) return;
        if (treeData && treeData?.name) {
          setTreeRoot(treeData);
        }
      } catch {
        // Fallback is maintained
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = agents.filter(a =>
    (statusFilter === "All" || a.status === statusFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || (a.email || "").toLowerCase().includes(search.toLowerCase()))
  );

  const triggerToast = (msg: string, isErr = false) => {
    setToastMsg(msg);
    setToastError(isErr);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateStatus = async (id: number, status: string) => {
    const action = status === "Active" ? "reactivate" : status === "Suspended" ? "suspend" : "approve";
    try {
      await api.admin.updateAgentStatus(id, action as "approve" | "suspend" | "reactivate");
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      triggerToast(`Status agent berhasil diubah menjadi ${status}`);
    } catch {
      triggerToast("Gagal mengubah status agent", true);
    }
    setOpenDropdownId(null);
  };

  const handleDeleteAgent = async (id: number) => {
    if (!confirm("Yakin hapus agent ini? Data terkait (HOF, submission, badge, dll) juga akan dihapus.")) return;
    setDeletingId(id);
    try {
      await api.admin.deleteAgent(id);
      setAgents(prev => prev.filter(a => a.id !== id));
      triggerToast("Agent berhasil dihapus");
    } catch {
      triggerToast("Gagal menghapus agent", true);
    } finally {
      setDeletingId(null);
      setOpenDropdownId(null);
    }
  };

  const openEditModal = (a: AgentItem) => {
    setEditModal(a);
    setEditName(a.name);
    setEditEmail(a.email);
    setEditPassword("");
    setEditRole(a.role || "");
    setEditMentorId(a.mentor_id || 0);
    setEditPhotoFile(null);
    setEditPhotoPreview(a.photo_url || "");
    setOpenDropdownId(null);
  };

  const handlePhotoPick = (file: File | null, setFile: (f: File | null) => void, setPreview: (p: string) => void) => {
    if (!file) {
      setFile(null);
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      triggerToast("File harus berupa gambar", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Ukuran foto maksimal 5MB", true);
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSavingEdit(true);
    try {
      const payload: any = {};
      if (editName !== editModal.name) payload.name = editName;
      if (editEmail !== editModal.email) payload.email = editEmail;
      if (editPassword) payload.password = editPassword;
      if (editRole) payload.role = editRole;

      // Upload photo if changed
      if (editPhotoFile) {
        const uploaded = await api.auth.uploadProfilePhoto(editPhotoFile);
        payload.photo_url = uploaded.photo_url;
      } else if (editPhotoPreview === "" && editModal.photo_url) {
        // Photo was explicitly removed
        payload.photo_url = "";
      }

      const prevMentorId = editModal.mentor_id || 0;
      const nextMentorId = editMentorId || 0;
      if (nextMentorId !== prevMentorId) {
        payload.mentor_id = nextMentorId; // Will send 0 to clear, or standard ID to set
      }

      await api.admin.updateAgent(editModal.id, payload);
      setAgents(prev => prev.map(a => a.id === editModal.id ? {
        ...a,
        name: editName || a.name,
        email: editEmail || a.email,
        mentor_id: nextMentorId > 0 ? nextMentorId : null,
        role: editRole || a.role,
        photo_url: payload.photo_url !== undefined ? payload.photo_url : a.photo_url,
      } : a));

      // Rebuild tree root representation immediately
      try {
        const treeData = await api.admin.getAgentsTree();
        if (treeData && treeData?.name) {
          setTreeRoot(treeData);
        }
      } catch (e) {
        console.error("Failed to reload tree after edit", e);
      }

      setEditModal(null);
      triggerToast("Agent berhasil diperbarui");
    } catch (err: any) {
      triggerToast(err?.message || "Gagal memperbarui agent", true);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newName || !newEmail || !newPassword) {
      triggerToast("Nama, email, dan password wajib diisi", true);
      return;
    }
    setSavingCreate(true);
    try {
      let photoUrl = "";
      if (newPhotoFile) {
        const uploaded = await api.auth.uploadProfilePhoto(newPhotoFile);
        photoUrl = uploaded.photo_url;
      }
      await api.admin.createAgent({
        name: newName,
        email: newEmail,
        phone: newPhone || undefined,
        password: newPassword,
        role: newRole,
        photo_url: photoUrl || undefined,
        mentor_id: newMentorId && newMentorId > 0 ? newMentorId : null,
      });
      // Reset form
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewPassword("");
      setNewRole("Agent");
      setNewMentorId(null);
      setNewPhotoFile(null);
      setNewPhotoPreview("");
      setShowCreateModal(false);
      triggerToast("Agent berhasil ditambahkan!");
      // Reload agent list
      const rows = await api.admin.getAgents();
      if (Array.isArray(rows)) {
        setAgents(rows.map((r: any) => ({
          id: Number(r.id),
          name: String(r.name || ""),
          email: String(r.email || ""),
          phone: String(r.phone || ""),
          office: String(r.office || "-"),
          level: String(r.title || "Rookie Agent"),
          status: String(r.status || "Pending"),
          joined: formatJoined(r.created_at),
          mentor_id: r.mentor_id ? Number(r.mentor_id) : null,
          role: String(r.role || "Agent"),
          photo_url: String(r.photo_url || ""),
        })));
      }
      // Reload tree
      try {
        const treeData = await api.admin.getAgentsTree();
        if (treeData && treeData?.name) setTreeRoot(treeData);
      } catch {}
    } catch (err: any) {
      triggerToast(err?.message || "Gagal menambahkan agent", true);
    } finally {
      setSavingCreate(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setActiveStatusSelectAgentId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const StatusChip = ({ s, onClick }: { s: string; onClick?: (e: React.MouseEvent) => void }) => {
    const cfg = s === "Active" ? { bg: isDark ? "rgba(22, 163, 74, 0.15)" : "#DCFCE7", c: isDark ? "#34D399" : "#16A34A" }
      : s === "Pending" ? { bg: isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7", c: isDark ? "#F59E0B" : "#D97706" }
        : { bg: isDark ? "rgba(220, 38, 38, 0.15)" : "#FEE2E2", c: isDark ? "#F87171" : "#DC2626" };
    return (
      <button
        onClick={onClick}
        type="button"
        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all select-none border border-transparent ${
          onClick 
            ? "hover:opacity-85 hover:border-current active:scale-95 cursor-pointer shadow-sm hover:shadow" 
            : "cursor-default"
        }`}
        style={{ backgroundColor: cfg.bg, color: cfg.c }}
      >
        <span>{s}</span>
        {onClick && (
          <ChevronDown size={11} className="opacity-70" />
        )}
      </button>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border flex items-center gap-2"
            style={{
              backgroundColor: toastError ? "#DC2626" : "#16A34A",
              color: "white",
              borderColor: toastError ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)",
            }}>
            {toastError ? <AlertTriangle size={16} /> : <Check size={16} />}
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Add Agent Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16A34A] text-white transition-all hover:bg-[#15803D] cursor-pointer"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Agent
        </button>
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
                  {["All", "Active", "Pending", "Suspended"].map(s => (
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
              <div className="overflow-x-visible hidden sm:block" style={{ overflowX: "visible" }}>
                <table className="w-full">
                  <thead><tr className="border-b" style={{ borderColor: T.border }}>
                    {["AGENT", "LEVEL", "STATUS", "BERGABUNG", "AKSI"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: T.text3 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {loadingAgents && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: T.text3 }}>
                          Memuat data agent...
                        </td>
                      </tr>
                    )}
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b transition-colors" style={{ borderColor: "var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.muted)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 flex items-center justify-center bg-muted text-xs font-bold" style={{ borderColor: T.border }}>
                              {a.photo_url ? (
                                <img src={a.photo_url} alt={a.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-muted-foreground">{getInitials(a.name)}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold" style={{ color: T.text1 }}>{a.name}</p>
                              <p className="text-xs" style={{ color: T.text3 }}>{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-left" style={{ color: T.text2 }}>{a.level}</td>
                        <td className="px-4 py-3 text-left relative">
                          <StatusChip 
                            s={a.status} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusSelectAgentId(activeStatusSelectAgentId === a.id ? null : a.id);
                            }}
                          />
                          {activeStatusSelectAgentId === a.id && (
                            <div 
                              ref={statusDropdownRef} 
                              className="absolute left-4 z-50 w-32 rounded-xl border shadow-xl py-1 mt-1 bg-card"
                              style={{ backgroundColor: "var(--card)", borderColor: T.border }}
                            >
                              {["Active", "Pending", "Suspended"].map(statusOption => (
                                <button 
                                  key={statusOption} 
                                  onClick={() => { 
                                    updateStatus(a.id, statusOption); 
                                    setActiveStatusSelectAgentId(null); 
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-between"
                                  style={{ color: statusOption === "Active" ? "#16A34A" : statusOption === "Pending" ? "#D97706" : "#DC2626" }}
                                >
                                  <span>{statusOption}</span>
                                  {a.status === statusOption && <Check size={11} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-left" style={{ color: T.text3 }}>{a.joined}</td>
                        <td className="px-4 py-3 text-left relative">
                          <button
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const rect = btn.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              setDropdownDir(spaceBelow < 260 ? "up" : "down");
                              setOpenDropdownId(openDropdownId === a.id ? null : a.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <MoreVertical size={16} style={{ color: T.text3 }} />
                          </button>
                          {openDropdownId === a.id && (
                            <div ref={dropdownRef}
                              className={`absolute right-2 z-50 w-44 rounded-xl border shadow-xl py-1 ${dropdownDir === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
                              style={{ backgroundColor: "var(--card)", borderColor: T.border }}
                            >
                              <button onClick={() => openEditModal(a)}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-muted flex items-center gap-2 transition-colors"
                                style={{ color: T.text1 }}>
                                <Edit3 size={13} /> Edit Agent
                              </button>
                              {a.status === "Pending" && (
                                <button onClick={() => updateStatus(a.id, "Active")}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-muted flex items-center gap-2 transition-colors"
                                  style={{ color: "#16A34A" }}>
                                  <Check size={13} /> Approve
                                </button>
                              )}
                              {a.status === "Active" && (
                                <button onClick={() => updateStatus(a.id, "Suspended")}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-muted flex items-center gap-2 transition-colors"
                                  style={{ color: "#DC2626" }}>
                                  <ShieldAlert size={13} /> Suspend
                                </button>
                              )}
                              {a.status === "Suspended" && (
                                <button onClick={() => updateStatus(a.id, "Active")}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-muted flex items-center gap-2 transition-colors"
                                  style={{ color: "#1A6FC4" }}>
                                  <Check size={13} /> Aktifkan
                                </button>
                              )}
                              <div className="border-t my-1" style={{ borderColor: T.border }} />
                              <button onClick={() => handleDeleteAgent(a.id)}
                                disabled={deletingId === a.id}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                style={{ color: "#DC2626" }}>
                                {deletingId === a.id ? (
                                  <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                                Hapus Agent
                              </button>
                            </div>
                          )}
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
                        className={`rounded-2xl border shadow-sm overflow-hidden transition-all bg-card flex flex-col ${isCardMatch
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
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-border flex-shrink-0 flex items-center justify-center bg-muted text-xs font-bold" style={{ borderColor: T.border }}>
                              {a.photo_url ? (
                                <img src={a.photo_url} alt={a.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-muted-foreground">{getInitials(a.name)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <EllipsisTooltip
                                text={a.name}
                                className="text-sm font-bold truncate text-foreground block"
                                style={{ color: T.text1 }}
                              />
                              <EllipsisTooltip
                                text={a.email}
                                className="text-xs truncate text-muted-foreground block"
                                style={{ color: T.text3 }}
                              />
                              <span
                                className="inline-block text-[8px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: lvlColor + "12", color: lvlColor }}
                              >
                                {a.level}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 self-start relative">
                              <StatusChip 
                                s={a.status} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveStatusSelectAgentId(activeStatusSelectAgentId === a.id ? null : a.id);
                                }}
                              />
                              {activeStatusSelectAgentId === a.id && (
                                <div 
                                  ref={statusDropdownRef} 
                                  className="absolute right-0 top-full z-50 w-32 rounded-xl border shadow-xl py-1 mt-1 bg-card"
                                  style={{ backgroundColor: "var(--card)", borderColor: T.border }}
                                >
                                  {["Active", "Pending", "Suspended"].map(statusOption => (
                                    <button 
                                      key={statusOption} 
                                      onClick={() => { 
                                        updateStatus(a.id, statusOption); 
                                        setActiveStatusSelectAgentId(null); 
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-between"
                                      style={{ color: statusOption === "Active" ? "#16A34A" : statusOption === "Pending" ? "#D97706" : "#DC2626" }}
                                    >
                                      <span>{statusOption}</span>
                                      {a.status === statusOption && <Check size={11} />}
                                    </button>
                                  ))}
                                </div>
                              )}
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

                          {/* Joined metadata */}
                          <div className="pt-3 text-xs border-t" style={{ borderColor: T.border }}>
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
                          <button onClick={() => openEditModal(a)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer border transition-colors"
                            style={{ borderColor: T.border, color: T.text2 }}>
                            <Edit3 size={13} /> Edit
                          </button>
                          <button onClick={() => handleDeleteAgent(a.id)}
                            disabled={deletingId === a.id}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]/80 disabled:opacity-50 transition-all">
                            <Trash2 size={13} /> Hapus
                          </button>
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

              {!treeRoot ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8A500]"></div>
                  <p className="text-xs font-semibold">Memuat Jaringan Rekrutmen...</p>
                </div>
              ) : (
                <>
                  {/* Mobile View: Vertical Folder Tree (visible on mobile) */}
                  <div className="block lg:hidden w-full border rounded-2xl p-2.5 bg-card/20" style={{ borderColor: T.border }}>
                    <VerticalTreeNode node={treeRoot} search={search} isDark={isDark} onShowRecruits={setRecruitsModal} />
                  </div>

                  {/* Desktop View: Horizontal Tree Scroll (visible on desktop) */}
                  <div
                    className="hidden lg:block w-full overflow-x-auto overscroll-x-contain py-8 bg-card/40 rounded-2xl border min-h-[500px]"
                    style={{ borderColor: T.border, WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="w-max min-w-full mx-auto px-8 sm:px-12">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <TreeNode node={treeRoot} search={search} isDark={isDark} onShowRecruits={setRecruitsModal} />
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                {(recruitsModal.children || []).map((recruit, i) => (
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
                      <EllipsisTooltip
                        text={recruit.name}
                        className="text-sm font-semibold truncate block"
                        style={{ color: T.text1 }}
                      />
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

      {/* EDIT AGENT MODAL */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10" style={{ borderColor: T.border }}>
              
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: T.border }}>
                <h3 className="font-bold font-display text-lg" style={{ color: T.text1 }}>Edit Agent</h3>
                <button onClick={() => setEditModal(null)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4">
                {/* Foto Profil (Opsional) */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Foto Profil (Opsional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 bg-muted flex items-center justify-center" style={{ borderColor: T.border }}>
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: T.text3 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      )}
                    </div>
                    <label className="px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all hover:bg-muted/30" style={{ borderColor: T.border, color: T.text2 }}>
                      <ImagePlus size={14} /> Pilih Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoPick(e.target.files?.[0] || null, setEditPhotoFile, setEditPhotoPreview)} />
                    </label>
                    {editPhotoPreview && (
                      <button onClick={() => { setEditPhotoFile(null); setEditPhotoPreview(""); }} className="text-xs underline" style={{ color: T.text3 }}>Hapus</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Nama</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Email</label>
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Password (kosongkan jika tidak diubah)</label>
                  <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Role (kosongkan jika tidak diubah)</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card font-medium" style={{ borderColor: T.border, color: T.text1 }}>
                    <option value="">-- Tidak diubah --</option>
                    <option value="Agent">Agent</option>
                    <option value="Office Manager">Office Manager</option>
                    <option value="Finance">Finance</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Mentor / Upline</label>
                  <select value={editMentorId || 0} onChange={e => setEditMentorId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card font-medium" style={{ borderColor: T.border, color: T.text1 }}>
                    <option value={0}>— Tidak ada (Mandiri / No Mentor) —</option>
                    {agents
                      .filter(a => a.id !== editModal.id && a.role === "Agent")
                      .map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-muted/10" style={{ borderColor: T.border }}>
                <button onClick={() => setEditModal(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
                <button onClick={handleSaveEdit} disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8A500] text-white transition-all hover:bg-[#CC9200] disabled:opacity-60 disabled:cursor-not-allowed">
                  {savingEdit ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE AGENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative z-10 max-h-[90vh] overflow-y-auto" style={{ borderColor: T.border }}>
              
              <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-card z-10" style={{ borderColor: T.border }}>
                <h3 className="font-bold font-display text-lg" style={{ color: T.text1 }}>Tambah Agent Baru</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: T.text3 }}><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4">
                {/* Foto Profil (Opsional) */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Foto Profil (Opsional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 bg-muted flex items-center justify-center" style={{ borderColor: T.border }}>
                      {newPhotoPreview ? (
                        <img src={newPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: T.text3 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      )}
                    </div>
                    <label className="px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all hover:bg-muted/30" style={{ borderColor: T.border, color: T.text2 }}>
                      <ImagePlus size={14} /> Pilih Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoPick(e.target.files?.[0] || null, setNewPhotoFile, setNewPhotoPreview)} />
                    </label>
                    {newPhotoPreview && (
                      <button onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(""); }} className="text-xs underline" style={{ color: T.text3 }}>Hapus</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Nama Lengkap *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama sesuai KTP" autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Email *</label>
                  <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@contoh.com" autoComplete="off" type="email"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Nomor HP</label>
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" autoComplete="off" type="tel"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Password *</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 karakter" autoComplete="new-password"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card" style={{ borderColor: T.border, color: T.text1 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Role *</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card font-medium" style={{ borderColor: T.border, color: T.text1 }}>
                    <option value="Agent">Agent</option>
                    <option value="Office Manager">Office Manager</option>
                    <option value="Finance">Finance</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>Mentor / Upline</label>
                  <select value={newMentorId || 0} onChange={e => setNewMentorId(Number(e.target.value) || null)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-card font-medium" style={{ borderColor: T.border, color: T.text1 }}>
                    <option value={0}>— Tidak ada (Mandiri / No Mentor) —</option>
                    {agents
                      .filter(a => a.role === "Agent" || a.role === "Office Manager")
                      .map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-muted/10 sticky bottom-0 bg-card" style={{ borderColor: T.border }}>
                <button onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: T.border, color: T.text3 }}>Batal</button>
                <button onClick={handleCreateAgent} disabled={savingCreate || !newName || !newEmail || !newPassword}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16A34A] text-white transition-all hover:bg-[#15803D] disabled:opacity-60 disabled:cursor-not-allowed">
                  {savingCreate ? "MENAMBAHKAN..." : "TAMBAH AGENT"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
