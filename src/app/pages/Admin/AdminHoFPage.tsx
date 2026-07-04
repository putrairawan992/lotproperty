import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, ShieldAlert, Check, Save, ToggleLeft, ToggleRight } from "lucide-react";
import Card from "../../components/Card";
import { T, useTheme } from "../../types";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { AGENT_DATA_LIST } from "../../appData";
import { api } from "../../services/api";
import { normalizeHofCategory } from "../../utils/hofCategory";

export default function AdminHoFPage() {
  const [period, setPeriod] = useState("Juni 2025");
  const [toastMsg, setToastMsg] = useState("");
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [serverAgents, setServerAgents] = useState<Array<{ id: number; name: string; status: string }>>([]);
  const [hofRecords, setHofRecords] = useState<Array<{ category: string; rank: number; agent?: { name?: string }; period: string }>>([]);
  
  const [entries, setEntries] = useState([
    { cat: "Top 5 Commission",     type: "auto",   overridden: false, autoList: ["Rizki Pratama", "Siti Fatimah", "Budi Santoso"], overrideList: ["Rizki Pratama", "Siti Fatimah", "Budi Santoso"] },
    { cat: "Top 5 By Unit",        type: "auto",   overridden: false, autoList: ["Siti Fatimah", "Rizki Pratama", "Ahmad Fadhil"], overrideList: ["Siti Fatimah", "Rizki Pratama", "Ahmad Fadhil"] },
    { cat: "Listing Hunter",       type: "auto",   overridden: false, autoList: ["Budi Santoso", "Dewi Rahma", "Rizki Pratama"], overrideList: ["Budi Santoso", "Dewi Rahma", "Rizki Pratama"] },
    { cat: "Prospecting Master",   type: "auto",   overridden: false, autoList: ["Siti Fatimah", "Rizki Pratama", "Eko Purnomo"], overrideList: ["Siti Fatimah", "Rizki Pratama", "Eko Purnomo"] },
    { cat: "Content Creator",      type: "auto",   overridden: false, autoList: ["Siti Fatimah", "Rizki Pratama", "Ahmad Fadhil"], overrideList: ["Siti Fatimah", "Rizki Pratama", "Ahmad Fadhil"] },
    { cat: "Top 5 Primary",        type: "manual", overridden: true,  autoList: [],                                             overrideList: ["Rizki Pratama", "Siti Fatimah", "Budi Santoso"] },
    { cat: "Rising Star",          type: "manual", overridden: true,  autoList: [],                                             overrideList: ["Linda Kusuma", "Rendi Setiawan", "Maya Putri"] },
    { cat: "Top Recruiter",        type: "manual", overridden: true,  autoList: [],                                             overrideList: ["Rizki Pratama", "Budi Santoso", "Siti Fatimah"] },
  ]);

  const AGENT_DATA = AGENT_DATA_LIST;

  const activeAgents = (serverAgents.length > 0
    ? serverAgents.filter(a => a.status === "Active")
    : AGENT_DATA.filter(a => a.status === "Active").map(a => ({
        id: Number(String(a.id).replace(/[^0-9]/g, "") || "0"),
        name: a.name,
        status: a.status,
      })));

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const rows = await api.admin.getAgents();
        if (Array.isArray(rows)) {
          setServerAgents(rows.map((r: any) => ({
            id: Number(r.id),
            name: String(r.name || ""),
            status: String(r.status || ""),
          })));
        }
      } catch {
        // Keep fallback static agents when API is unavailable.
      }
    };

    loadAgents();
  }, []);

  useEffect(() => {
    const loadHof = async () => {
      try {
        const rows = await api.admin.getHof(period);
        if (Array.isArray(rows)) {
          setHofRecords(rows.map((r: any) => ({
            category: String(r.category || ""),
            rank: Number(r.rank || 0),
            agent: r.agent ? { name: String(r.agent.name || "") } : undefined,
            period: String(r.period || ""),
          })));
        }
      } catch {
        // Keep static entries as fallback.
      }
    };

    loadHof();
  }, [period]);

  const entriesFromApi = (cat: string): string[] => {
    return hofRecords
      .filter((r) => normalizeHofCategory(r.category, [
        "Top 5 Commission",
        "Top 5 By Unit",
        "Top 5 Primary",
        "Rising Star",
        "Content Creator",
        "Listing Hunter",
        "Prospecting Master",
        "Top Recruiter",
      ]) === cat)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3)
      .map((r) => r.agent?.name || "—");
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleBypass = (index: number) => {
    setEntries(prev => prev.map((item, idx) => {
      if (idx === index && item.type === "auto") {
        return { ...item, overridden: !item.overridden };
      }
      return item;
    }));
  };

  const handleAgentChange = (sectionIdx: number, rankIdx: number, newAgentName: string) => {
    setEntries(prev => prev.map((item, idx) => {
      if (idx === sectionIdx) {
        const newList = [...item.overrideList];
        newList[rankIdx] = newAgentName;
        return { ...item, overrideList: newList };
      }
      return item;
    }));
  };

  const resolveAgentIdByName = (name: string) => {
    const fromServer = serverAgents.find(a => a.name === name);
    if (fromServer?.id) return fromServer.id;

    const fromFallback = AGENT_DATA.find(a => a.name === name);
    if (fromFallback) {
      const parsed = Number(String(fromFallback.id).replace(/[^0-9]/g, "") || "0");
      if (parsed > 0) return parsed;
    }

    return null;
  };

  const handleSaveCategory = async (section: any) => {
    const listUsed = (section.overridden ? section.overrideList : section.autoList).slice(0, 3);
    const canonicalCategory = normalizeHofCategory(section.cat, [
      "Top 5 Commission",
      "Top 5 By Unit",
      "Top 5 Primary",
      "Rising Star",
      "Content Creator",
      "Listing Hunter",
      "Prospecting Master",
      "Top Recruiter",
    ]);

    if (!canonicalCategory) {
      triggerToast("Kategori HoF tidak valid.");
      return;
    }

    if (!listUsed.length) {
      triggerToast("Tidak ada agent untuk disimpan.");
      return;
    }

    setSavingCategory(section.cat);
    try {
      for (let i = 0; i < listUsed.length; i++) {
        const agentName = listUsed[i];
        const agentID = resolveAgentIdByName(agentName);
        if (!agentID) {
          throw new Error(`Agent '${agentName}' belum terdaftar di database server`);
        }

        await api.admin.addHof({
          agent_id: agentID,
          category: canonicalCategory,
          rank: i + 1,
          period,
          notes: section.overridden ? "Manual override from admin panel" : "Auto calculated from admin panel",
        });
      }

      triggerToast(`Peringkat ${canonicalCategory} untuk ${period} berhasil disimpan ke server.`);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Gagal menyimpan data Hall of Fame");
    } finally {
      // Refresh records from server
      try {
        const rows = await api.admin.getHof(period);
        if (Array.isArray(rows)) {
          setHofRecords(rows.map((r: any) => ({
            category: String(r.category || ""),
            rank: Number(r.rank || 0),
            agent: r.agent ? { name: String(r.agent.name || "") } : undefined,
            period: String(r.period || ""),
          })));
        }
      } catch {}
      setSavingCategory(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 relative">
      
      {/* Toast Notif */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-16 left-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }} className="animate-fade-in">
            Hall of Fame Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola data pemenang Hall of Fame bulanan dengan opsi override sistem</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-xl border outline-none bg-card text-sm cursor-pointer"
          style={{ borderColor: T.border }}>
          {[
            "Desember 2026", "November 2026", "Oktober 2026", "September 2026", "Agustus 2026", "Juli 2026", "Juni 2026", "Mei 2026", "April 2026", "Maret 2026", "Februari 2026", "Januari 2026",
            "Desember 2025", "November 2025", "Oktober 2025", "September 2025", "Agustus 2025", "Juli 2025", "Juni 2025", "Mei 2025", "April 2025", "Maret 2025", "Februari 2025", "Januari 2025"
          ].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Grid of all categories (8 total) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((section, si) => {
          return (
            <Card key={section.cat} className="p-5 flex flex-col justify-between" style={{ borderColor: section.overridden && section.type === "auto" ? "rgba(232, 165, 0, 0.4)" : "var(--border)" }}>
              <div>
                <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: T.border }}>
                  <div className="min-w-0">
                    <EllipsisTooltip 
                      text={section.cat} 
                      className="font-bold text-sm tracking-wide text-foreground uppercase truncate block" 
                      style={{ fontFamily: "'Rajdhani', sans-serif" }} 
                    />
                  </div>
                  
                  {/* Category Type Badge */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {section.type === "auto" ? (
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#16A34A" }}>Sistem</span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "rgba(112,64,208,0.1)", color: "#7040D0" }}>Manual</span>
                    )}
                  </div>
                </div>

                {/* Overwrite Bypass controls for Auto Category */}
                {section.type === "auto" && (
                  <div className="flex items-center justify-between p-2 rounded-xl mb-3 text-xs" style={{ backgroundColor: T.muted }}>
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                      <ShieldAlert size={13} className={section.overridden ? "text-[#E8A500]" : "text-muted-foreground"} />
                      <span>Bypass Kalkulasi Otomatis</span>
                    </div>
                    <button onClick={() => handleToggleBypass(si)} className="focus:outline-none">
                      {section.overridden ? (
                        <ToggleRight size={26} className="text-[#E8A500]" />
                      ) : (
                        <ToggleLeft size={26} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )}

                {/* Rank lists */}
                <div className="space-y-2 mb-4">
                  {[0, 1, 2].map((rankIdx) => {
                    const rankNum = rankIdx + 1;
                    const selectedAgent = section.overrideList[rankIdx] || "";
                    
                    return (
                      <div key={rankIdx} className="flex items-center gap-2.5 p-2 rounded-xl" style={{ backgroundColor: T.muted }}>
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                          style={{ background: rankIdx === 0 ? "linear-gradient(135deg,#E8A500,#C8922A)" : rankIdx === 1 ? "#9CA3AF" : "#B87333" }}>
                          #{rankNum}
                        </span>

                        {section.overridden ? (
                          <select value={selectedAgent}
                            onChange={ev => handleAgentChange(si, rankIdx, ev.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none bg-card cursor-pointer font-medium"
                            style={{ borderColor: T.border }}>
                            {activeAgents.map(a => (
                              <option key={`${a.id}-${a.name}`} value={a.name}>{a.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex-1 text-left px-2 py-1 text-xs font-semibold text-muted-foreground bg-card/40 rounded-lg border border-dashed" style={{ borderColor: T.border }}>
                            {entriesFromApi(section.cat)[rankIdx] || "—"} <span className="text-[10px] font-normal text-muted-foreground/60">(System)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={() => handleSaveCategory(section)}
                disabled={savingCategory === section.cat}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-sm"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                <Save size={13} /> {savingCategory === section.cat ? "Menyimpan..." : `Simpan ${section.cat}`}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
