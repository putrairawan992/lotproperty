import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Plus, Calendar, AlertCircle, Check, Trash2, ShieldAlert } from "lucide-react";
import Card from "../components/Card";
import AgentAvatar from "../components/AgentAvatar";
import { T, useTheme } from "../types";
import EllipsisTooltip from "../components/EllipsisTooltip";
import { api } from "../services/api";

interface Post {
  id: string | number;
  name: string;
  photo?: string;
  initials: string;
  tier: string;
  category: "WTB" | "WTR" | "INFO";
  content: string;
  createdAt: number; // timestamp
  isMe?: boolean;
}

const mapApiPost = (item: any): Post => ({
  id: item.id,
  name: item.name || "Unknown Agent",
  photo: item.photo || undefined,
  initials: item.initials || "AG",
  tier: item.tier || "Agent",
  category: item.category,
  content: item.content,
  createdAt: new Date(item.created_at).getTime(),
  isMe: !!item.is_me,
});


export default function BoardPage() {
  const { isDark, isGuest, user, onLoginRequest } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"WTB" | "WTR" | "INFO">("WTB");
  const [toast, setToast] = useState("");
  const [postsTodayCount, setPostsTodayCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "A";
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  // Load board posts from API.
  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      try {
        const data = isGuest ? await api.public.getBoardPosts() : await api.board.getPosts();
        if (cancelled) return;

        const loaded = data.map(mapApiPost).sort((a, b) => b.createdAt - a.createdAt);
        setPosts(loaded);

        if (!isGuest) {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          setPostsTodayCount(loaded.filter(p => p.isMe && p.createdAt >= startOfToday).length);
        }
      } catch {
        setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => { cancelled = true; };
  }, [isGuest]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || posting) return;

    if (postsTodayCount >= 3) {
      triggerToast("Batas harian tercapai! Maksimal 3 postingan per hari.");
      return;
    }

    setPosting(true);
    try {
      const res = await api.board.createPost({
        category,
        content: content.trim(),
      });

      const created = mapApiPost(res.post);
      setPosts(prev => [created, ...prev]);
      setContent("");
      setPostsTodayCount(prev => prev + 1);
      triggerToast("Postingan berhasil dikirim!");
    } catch (err: any) {
      triggerToast(err?.message || "Gagal mengirim postingan");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (id: string | number) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await api.board.deletePost(id);
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);

      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const myTodayPosts = updated.filter(p => p.isMe && p.createdAt >= startOfToday);
      setPostsTodayCount(myTodayPosts.length);
      triggerToast("Postingan dihapus!");
    } catch (err: any) {
      triggerToast(err?.message || "Gagal menghapus postingan");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryStyles = (cat: "WTB" | "WTR" | "INFO") => {
    switch (cat) {
      case "WTB":
        return {
          bg: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
          border: isDark ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE",
          text: "#3B82F6",
          label: "CARI BELI (WTB)"
        };
      case "WTR":
        return {
          bg: isDark ? "rgba(168, 85, 247, 0.15)" : "#F5F3FF",
          border: isDark ? "rgba(168, 85, 247, 0.3)" : "#E9D5FF",
          text: "#A855F7",
          label: "CARI SEWA (WTR)"
        };
      case "INFO":
        return {
          bg: isDark ? "rgba(232, 165, 0, 0.15)" : "#FFFBEB",
          border: isDark ? "rgba(232, 165, 0, 0.3)" : "#FEF3C7",
          text: "#D97706",
          label: "INFO AGEN"
        };
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <div className="p-4 lg:p-6 transition-colors duration-300 relative max-w-2xl mx-auto">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-green-500/20"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="font-extrabold text-2xl sm:text-3xl text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.02em" }}
          >
            <MessageSquare className="text-[#E8A500]" /> LOT FJB
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Media Jual-Beli (FJB) & Info Agen. Postingan otomatis terhapus setelah 7 hari.
          </p>
        </div>
      </div>

      {/* Write Post Box - Threads style (Compact & Borderless border-b) */}
      {isGuest ? (
        <button
          onClick={onLoginRequest}
          className="w-full mb-5 p-4 border-b text-left transition-colors duration-300 flex items-center gap-3"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
            <Plus size={16} style={{ color: T.text3 }} />
          </div>
          <span style={{ color: T.text3, fontSize: 14 }}>Login untuk posting di LOT FJB...</span>
        </button>
      ) : (
      <div
        className="p-4 mb-5 border-b transition-colors duration-300 relative"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
      >
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex gap-3">
            {/* My User Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold animate-fade-in"
                style={{
                  background: "linear-gradient(135deg, #E8A500, #C8922A)",
                  fontSize: 11,
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                {getInitials(user?.name)}
              </div>
            </div>

            {/* Input field */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: T.text1 }}>
                {user?.name || "Agent"} <span className="text-[9px] text-muted-foreground font-normal">· {user?.title || "Rookie Agent"}</span>
              </p>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={() => setIsActive(true)}
                onBlur={() => {
                  setTimeout(() => {
                    if (!content.trim()) setIsActive(false);
                  }, 200);
                }}
                placeholder="Ada kebutuhan WTB, WTR, atau INFO? Tulis disini..."
                className="w-full mt-1.5 bg-transparent text-sm resize-none focus:outline-none placeholder-muted-foreground/50 min-h-[40px] transition-all"
                maxLength={300}
                style={{ color: T.text1 }}
              />
            </div>
          </div>

          {/* Action Row - expands dynamically */}
          <AnimatePresence>
            {(isActive || content.trim()) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between pt-2.5 border-t border-border/10 flex-wrap gap-2">
                  {/* Category Select Tabs */}
                  <div className="flex gap-1 p-0.5 bg-muted/40 rounded-xl" style={{ backgroundColor: T.muted }}>
                    {(["WTB", "WTR", "INFO"] as const).map(cat => {
                      const styles = getCategoryStyles(cat);
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold tracking-wider transition-all cursor-pointer"
                          style={{
                            backgroundColor: active ? styles.text : "transparent",
                            color: active ? "white" : T.text3
                          }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    {/* Post Limit stats */}
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground font-semibold">
                        Post: <span className={postsTodayCount >= 3 ? "text-red-500 font-bold" : "text-[#E8A500] font-bold"}>{postsTodayCount}/3</span>
                      </p>
                    </div>

                    {/* Submit btn */}
                    <motion.button
                      type="submit"
                      disabled={!content.trim() || postsTodayCount >= 3 || posting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl flex items-center gap-1 text-white transition-all shadow-sm"
                      style={{
                        background: content.trim() && postsTodayCount < 3 && !posting
                          ? "linear-gradient(135deg, #E8A500, #C8922A)"
                          : "rgba(100,100,100,0.12)",
                        color: content.trim() && postsTodayCount < 3 && !posting ? "white" : "var(--muted-foreground)",
                        cursor: content.trim() && postsTodayCount < 3 && !posting ? "pointer" : "not-allowed",
                        fontFamily: "'Rajdhani', sans-serif"
                      }}
                    >
                      {posting ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Plus size={11} strokeWidth={2.5} />
                      )}
                      {posting ? "Mengirim..." : "Posting"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      )}

      {/* Posts Feed Stream */}
      <div className="space-y-4 relative">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl">
            <p className="text-sm font-semibold">Memuat postingan board...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-35" />
            <p className="text-sm font-semibold">Belum ada postingan aktif</p>
            <p className="text-xs mt-1">Jadilah yang pertama menyiarkan info WTB/WTR Anda!</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const styles = getCategoryStyles(post.category);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                className="relative"
              >
                {/* Visual Threads Line connecting items */}
                {i < posts.length - 1 && (
                  <div
                    className="absolute left-5 top-12 bottom-0 w-0.5 pointer-events-none"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
                  />
                )}

                <Card className="p-4 border border-border/40 shadow-sm relative group overflow-hidden">
                  {/* Subtle hover background highlight */}
                  <div
                    className="absolute inset-0 bg-muted/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ backgroundColor: T.muted }}
                  />

                  <div className="flex gap-3 relative z-10">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <AgentAvatar initials={post.initials} photo={post.photo} size={40} isMe={post.isMe} />
                    </div>

                    {/* Post content and details */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Tier header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <EllipsisTooltip 
                            text={post.name} 
                            className="font-extrabold text-sm truncate block" 
                            style={{ color: T.text1, fontFamily: "'Rajdhani', sans-serif" }} 
                          />
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider flex-shrink-0"
                            style={{
                              borderColor: styles.border,
                              backgroundColor: styles.bg,
                              color: styles.text,
                              fontFamily: "'Rajdhani', sans-serif"
                            }}
                          >
                            {styles.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                          {post.isMe && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingId === post.id}
                              className="text-red-500/60 hover:text-red-500 p-1 rounded transition-colors disabled:opacity-50"
                              title="Hapus Postingan"
                            >
                              {deletingId === post.id ? (
                                <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Role subtitle */}
                      <p className="text-[9px] text-muted-foreground leading-none mt-0.5 uppercase tracking-wide">
                        {post.tier}
                      </p>

                      {/* Post body */}
                      <p className="text-sm mt-2.5 leading-relaxed break-words font-medium whitespace-pre-line" style={{ color: T.text1 }}>
                        {post.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
