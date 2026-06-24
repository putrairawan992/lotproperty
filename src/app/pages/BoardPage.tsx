import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Plus, Calendar, AlertCircle, Check, Trash2, ShieldAlert } from "lucide-react";
import Card from "../components/Card";
import AgentAvatar from "../components/AgentAvatar";
import { T, useTheme } from "../types";
import EllipsisTooltip from "../components/EllipsisTooltip";

interface Post {
  id: string;
  name: string;
  photo?: string;
  initials: string;
  tier: string;
  category: "WTB" | "WTR" | "INFO";
  content: string;
  createdAt: number; // timestamp
  isMe?: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: "mock-1",
    name: "Rizki Pratama",
    initials: "RP",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    tier: "Elite Agent",
    category: "WTB",
    content: "Cari cepat (WTB) rumah 2 lantai di Gading Serpong, cluster modern. Budget maksimal Rp 3.8 Miliar. Buyer sudah ready cash keras. Kirim unit via WhatsApp jika ada!",
    createdAt: Date.now() - 2 * 60 * 60 * 1000 // 2 jam lalu
  },
  {
    id: "mock-2",
    name: "Siti Fatimah",
    initials: "SF",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    tier: "Elite Agent",
    category: "WTR",
    content: "Butuh sewa (WTR) Ruko 3 lantai di BSD untuk usaha kuliner. Lokasi harus ramai atau di pinggir jalan raya utama. Budget max Rp 120 Juta/tahun. Urgent!",
    createdAt: Date.now() - 24 * 60 * 60 * 1000 // 1 hari lalu
  },
  {
    id: "mock-3",
    name: "Ronald Richy",
    initials: "RR",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
    tier: "Elite Agent",
    category: "INFO",
    content: "INFO: BSD Grand Open House Project Park Avenue Cluster akhir pekan ini Sabtu & Minggu (Jam 09.00 - 17.00 WIB). Ada tambahan komisi 1.5% + bonus closing fee Rp 5 Juta bagi agen LOT Property!",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 hari lalu
  },
  {
    id: "mock-4",
    name: "Budi Santoso",
    initials: "BS",
    tier: "Senior Agent",
    category: "WTB",
    content: "Cari kavling komersial (WTB) di BSD Boulevard Raya. Luas sekitar 1.200 - 2.000 m2. Buyer korporasi resmi untuk kantor cabang.",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 hari lalu
  },
  {
    id: "mock-5",
    name: "Dewi Lestari",
    initials: "DL",
    tier: "Junior Agent",
    category: "WTR",
    content: "Disewakan apartemen Saveria BSD tipe 1 BR fully furnished. Rp 45 Juta/tahun nego. Kunci ada di saya, bisa survei kapan saja.",
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 // 6 hari lalu
  },
  {
    id: "mock-expired",
    name: "Jenny Kim",
    initials: "JK",
    tier: "Junior Agent",
    category: "INFO",
    content: "Postingan ini harusnya tersembunyi karena sudah lebih dari 7 hari.",
    createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000 // 9 hari lalu (Sudah Expired)
  }
];

export default function BoardPage() {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"WTB" | "WTR" | "INFO">("WTB");
  const [toast, setToast] = useState("");
  const [postsTodayCount, setPostsTodayCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Initialize or fetch posts
  useEffect(() => {
    const saved = localStorage.getItem("lotproperty-board-posts");
    let activePosts: Post[] = [];
    if (saved) {
      activePosts = JSON.parse(saved);
    } else {
      activePosts = MOCK_POSTS;
      localStorage.setItem("lotproperty-board-posts", JSON.stringify(MOCK_POSTS));
    }

    // Filter out posts older than 7 days
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const filtered = activePosts.filter(p => now - p.createdAt <= sevenDaysInMs);

    // Check count posted by me today
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const myTodayPosts = filtered.filter(p => p.isMe && p.createdAt >= startOfToday);
    setPostsTodayCount(myTodayPosts.length);

    // Sort: newest first
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    setPosts(filtered);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (postsTodayCount >= 3) {
      triggerToast("Batas harian tercapai! Maksimal 3 postingan per hari.");
      return;
    }

    const newPost: Post = {
      id: "user-" + Date.now(),
      name: "Ahmad Fadhil",
      initials: "AF",
      tier: "Senior Agent",
      category,
      content: content.trim(),
      createdAt: Date.now(),
      isMe: true
    };

    const updated = [newPost, ...posts];
    localStorage.setItem("lotproperty-board-posts", JSON.stringify(updated));
    setPosts(updated);
    setContent("");
    setPostsTodayCount(prev => prev + 1);
    triggerToast("Postingan berhasil dikirim!");
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem("lotproperty-board-posts", JSON.stringify(updated));
    setPosts(updated);
    
    // Recalculate daily count
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const myTodayPosts = updated.filter(p => p.isMe && p.createdAt >= startOfToday);
    setPostsTodayCount(myTodayPosts.length);
    triggerToast("Postingan dihapus!");
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
      <div 
        className="p-4 mb-5 border-b transition-colors duration-300 relative"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
      >
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex gap-3">
            {/* My User Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  background: "linear-gradient(135deg, #E8A500, #C8922A)",
                  fontSize: 11,
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                AF
              </div>
            </div>

            {/* Input field */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: T.text1 }}>
                Ahmad Fadhil <span className="text-[9px] text-muted-foreground font-normal">· Senior Agent</span>
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
                      disabled={!content.trim() || postsTodayCount >= 3}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl flex items-center gap-1 text-white transition-all shadow-sm cursor-pointer"
                      style={{
                        background: content.trim() && postsTodayCount < 3
                          ? "linear-gradient(135deg, #E8A500, #C8922A)"
                          : "rgba(100,100,100,0.12)",
                        color: content.trim() && postsTodayCount < 3 ? "white" : "var(--muted-foreground)",
                        cursor: content.trim() && postsTodayCount < 3 ? "pointer" : "not-allowed",
                        fontFamily: "'Rajdhani', sans-serif"
                      }}
                    >
                      <Plus size={11} strokeWidth={2.5} /> Posting
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Posts Feed Stream */}
      <div className="space-y-4 relative">
        {posts.length === 0 ? (
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
                              className="text-red-500/60 hover:text-red-500 p-1 rounded transition-colors"
                              title="Hapus Postingan"
                            >
                              <Trash2 size={12} />
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
