import { useEffect, useState } from "react";
import { Search, Mail, Phone, Users2 } from "lucide-react";
import Card from "../components/Card";
import AdminPagination from "../components/AdminPagination";
import AgentAvatar from "../components/AgentAvatar";
import AgentProfileSheet from "../components/AgentProfileSheet";
import EmptyState from "../components/EmptyState";
import { T } from "../types";
import { api } from "../services/api";

interface DirectoryAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo_url: string;
  title: string;
}

function initialsOf(name: string) {
  return (name || "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<DirectoryAgent[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [sheetAgentId, setSheetAgentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.agents.getDirectory({ search, page, pageSize });
        if (cancelled) return;
        setAgents(Array.isArray(res?.data) ? res.data : []);
        setTotalItems(res?.total || 0);
      } catch {
        if (!cancelled) { setAgents([]); setTotalItems(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300); // debounce search typing

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [search, page, pageSize]);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>Explore</h1>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email agent..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-sm outline-none"
          style={{ borderColor: T.border, color: T.text1 }} />
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {loading && (
            <div className="px-5 py-8 text-sm text-center" style={{ color: T.text3 }}>Memuat agent...</div>
          )}
          {!loading && agents.length === 0 && (
            <EmptyState icon={Users2} title="Tidak ada agent ditemukan" description="Coba kata kunci pencarian lain." />
          )}
          {!loading && agents.map(a => (
            <button key={a.id} onClick={() => setSheetAgentId(String(a.id))}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/5 transition-colors">
              <AgentAvatar initials={initialsOf(a.name)} photo={a.photo_url} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: T.text1 }}>{a.name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: T.text3 }}>{a.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {a.email && (
                    <span className="flex items-center gap-1 text-xs truncate" style={{ color: T.text3 }}>
                      <Mail size={11} /> {a.email}
                    </span>
                  )}
                  {a.phone && (
                    <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: T.text3 }}>
                      <Phone size={11} /> {a.phone}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {!loading && totalItems > 0 && (
        <AdminPagination page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} onPageSizeChange={setPageSize} />
      )}

      <AgentProfileSheet agentId={sheetAgentId} onClose={() => setSheetAgentId(null)} />
    </div>
  );
}
