import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, ShieldAlert, Check, Save, ToggleLeft, ToggleRight, User } from "lucide-react";
import Card from "../../components/Card";
import SearchableSelect, { type LoadOptionsResult } from "../../components/SearchableSelect";
import AgentProfileSheet from "../../components/AgentProfileSheet";
import { T, useTheme } from "../../types";
import EllipsisTooltip from "../../components/EllipsisTooltip";
import { AGENT_DATA_LIST, DYNAMIC_PERIODS } from "../../appData";
import { api } from "../../services/api";
import { normalizeHofCategory } from "../../utils/hofCategory";

export default function AdminHoFPage() {
  const [period, setPeriod] = useState(DYNAMIC_PERIODS[1] || DYNAMIC_PERIODS[0] || ""); // default bulan sebelumnya
  const [toastMsg, setToastMsg] = useState("");
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [sheetAgentId, setSheetAgentId] = useState<string | null>(null);
  // Grows as searches/selections happen (and is seeded from saved HoF records) — resolves
  // an agent's display name back to its numeric ID at save time, without ever needing to
  // download the full agent roster upfront.
  const [knownAgentIds, setKnownAgentIds] = useState<Record<string, number>>({});
  // `auto: true` = hasil kalkulasi sistem dari server, bukan data yang disimpan admin.
  const [hofRecords, setHofRecords] = useState<Array<{ category: string; rank: number; agent?: { id?: number; name?: string }; period: string; auto?: boolean; score?: string }>>([]);

  const [entries, setEntries] = useState([
    { cat: "Top 5 Commission", type: "auto", overridden: false, visibleCount: 3, autoList: ["", "", "", "", ""], overrideList: ["", "", "", "", ""] },
    { cat: "Top 5 By Unit", type: "auto", overridden: false, visibleCount: 3, autoList: ["", "", "", "", ""], overrideList: ["", "", "", "", ""] },
    { cat: "Listing Hunter", type: "auto", overridden: false, visibleCount: 3, autoList: ["", "", "", "", ""], overrideList: ["", "", "", "", ""] },
    { cat: "Prospecting Master", type: "auto", overridden: false, visibleCount: 3, autoList: ["", "", "", "", ""], overrideList: ["", "", "", "", ""] },
    { cat: "Content Creator", type: "auto", overridden: false, visibleCount: 3, autoList: ["", "", "", "", ""], overrideList: ["", "", "", "", ""] },
    { cat: "Top Primary dan KPR", type: "manual", overridden: true, visibleCount: 3, autoList: Array(8).fill(""), overrideList: ["", "", "", "", ""] },
    { cat: "Rising Star", type: "manual", overridden: true, visibleCount: 3, autoList: Array(8).fill(""), overrideList: ["", "", "", "", ""] },
    { cat: "Top Recruiter", type: "manual", overridden: true, visibleCount: 3, autoList: Array(8).fill(""), overrideList: ["", "", "", "", ""] },
  ]);

  const AGENT_DATA = AGENT_DATA_LIST;

  // Server-side search + pagination for the agent picker — scrolling the dropdown loads
  // more pages instead of downloading the entire (1000+) agent roster upfront.
  const loadHofAgentOptions = useCallback(async (query: string, page: number): Promise<LoadOptionsResult> => {
    const res = await api.admin.getAgents({ search: query, status: "Active", role: "Agent", page, pageSize: 20 });
    const rows = res?.data || [];
    const idMap: Record<string, number> = {};
    const rowOptions = rows.map((r: any) => {
      const name = String(r.name || "");
      idMap[name] = Number(r.id);
      return { value: name, label: name, subLine: String(r.email || "") };
    });
    setKnownAgentIds(prev => ({ ...prev, ...idMap }));
    const options = page === 1 && !query.trim()
      ? [{ value: "", label: "— Kosong / None —" }, ...rowOptions]
      : rowOptions;
    return { options, hasMore: page * 20 < Number(res?.total || 0) };
  }, []);

  useEffect(() => {
    const loadHof = async () => {
      try {
        const rows = await api.admin.getHof(period);
        if (Array.isArray(rows)) {
          setHofRecords(rows.map((r: any) => ({
            category: String(r.category || ""),
            rank: Number(r.rank || 0),
            agent: r.agent ? { id: Number(r.agent.id || r.agent_id || 0), name: String(r.agent.name || "") } : undefined,
            period: String(r.period || ""),
            auto: Boolean(r.auto),
            score: String(r.score || ""),
          })));
          // Seed the name→id cache with every saved record's agent, so re-saving a
          // category whose picker was never opened this session still resolves correctly.
          setKnownAgentIds(prev => {
            const next = { ...prev };
            for (const r of rows) {
              if (r.agent?.name && (r.agent?.id || r.agent_id)) {
                next[String(r.agent.name)] = Number(r.agent.id || r.agent_id);
              }
            }
            return next;
          });
        }
      } catch {
        // Keep static entries as fallback.
      }
    };

    loadHof();
  }, [period]);

  useEffect(() => {
    setEntries(prev => prev.map(section => {
      // Find saved records for this category
      const saved = hofRecords
        .filter(r => normalizeHofCategory(r.category, [
          "Top 5 Commission",
          "Top 5 By Unit",
          "Top Primary dan KPR",
          "Rising Star",
          "Content Creator",
          "Listing Hunter",
          "Prospecting Master",
          "Top Recruiter",
        ]) === section.cat)
        .sort((a, b) => a.rank - b.rank);

      // Record `auto` hanya untuk ditampilkan di baris (System) — bukan data tersimpan,
      // jadi tidak boleh menyalakan mode bypass atau mengisi form override.
      const savedManual = saved.filter(r => !r.auto);
      const hasSavedRecords = savedManual.length > 0;

      // If there are saved records in the DB, we wipe the overrideList and only set what is in the DB
      // Otherwise, we keep the section's overrideList (which defaults to placeholders)
      const currentOverrideList = hasSavedRecords ? Array(8).fill("") : [...section.overrideList];

      savedManual.forEach(r => {
        if (r.rank >= 1 && r.rank <= 8) {
          currentOverrideList[r.rank - 1] = r.agent?.name || "";
        }
      });

      const maxRankSaved = saved.reduce((max, r) => r.rank > max ? r.rank : max, 3);
      const visibleCount = Math.min(Math.max(maxRankSaved, 3), 8);

      const overridden = section.type === "manual" ? true : (hasSavedRecords ? true : section.overridden);

      return {
        ...section,
        overridden,
        visibleCount,
        // Set autoList to match override if overridden and saved records exist, to display nicely
        autoList: section.type === "auto" && !overridden ? currentOverrideList : section.autoList,
        overrideList: currentOverrideList,
      };
    }));
  }, [hofRecords]);

  // Nama + angka dasarnya (mis. "12 listing"), supaya admin bisa mengaudit hasil
  // kalkulasi sistem sebelum memutuskan perlu override manual atau tidak.
  const entriesFromApi = (cat: string): Array<{ name: string; score: string }> => {
    return hofRecords
      .filter((r) => normalizeHofCategory(r.category, [
        "Top 5 Commission",
        "Top 5 By Unit",
        "Top Primary dan KPR",
        "Rising Star",
        "Content Creator",
        "Listing Hunter",
        "Prospecting Master",
        "Top Recruiter",
      ]) === cat)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 8)
      .map((r) => ({ name: r.agent?.name || "—", score: r.score || "" }));
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleBypass = (index: number) => {
    setEntries(prev => prev.map((item, idx) => {
      if (idx !== index || item.type !== "auto") return item;

      const turningOn = !item.overridden;

      // Saat bypass dinyalakan, form diisi dulu dengan hasil kalkulasi sistem supaya
      // admin tinggal mengubah yang perlu saja. Hanya dilakukan kalau form masih
      // kosong — jangan sampai menimpa pilihan yang sudah diisi admin sebelumnya.
      const isEmpty = item.overrideList.every(name => !name);
      if (!turningOn || !isEmpty) {
        return { ...item, overridden: turningOn };
      }

      // Kalau sistem memang belum punya data, hasilnya tetap kosong seperti sebelumnya.
      const systemEntries = entriesFromApi(item.cat);
      const prefilled = Array(8).fill("");
      systemEntries.slice(0, 8).forEach((entry, rankIdx) => {
        if (entry.name && entry.name !== "—") prefilled[rankIdx] = entry.name;
      });

      return {
        ...item,
        overridden: true,
        overrideList: prefilled,
        visibleCount: Math.min(Math.max(systemEntries.length, 3), 8),
      };
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

  const handleAddRank = (sectionIdx: number) => {
    setEntries(prev => prev.map((item, idx) => {
      if (idx === sectionIdx) {
        const nextCount = Math.min((item.visibleCount || 3) + 1, 8);
        return { ...item, visibleCount: nextCount };
      }
      return item;
    }));
  };

  const handleRemoveRank = (sectionIdx: number, rankIdx: number) => {
    setEntries(prev => prev.map((item, idx) => {
      if (idx === sectionIdx) {
        const newList = [...item.overrideList];
        newList.splice(rankIdx, 1);
        newList.push("");

        const nextCount = Math.max((item.visibleCount || 3) - 1, 3);
        return {
          ...item,
          visibleCount: nextCount,
          overrideList: newList
        };
      }
      return item;
    }));
  };

  const resolveAgentIdByName = (name: string) => {
    if (knownAgentIds[name]) return knownAgentIds[name];

    const fromFallback = AGENT_DATA.find(a => a.name === name);
    if (fromFallback) {
      const parsed = Number(String(fromFallback.id).replace(/[^0-9]/g, "") || "0");
      if (parsed > 0) return parsed;
    }

    return null;
  };

  const handleSaveCategory = async (section: any) => {
    const listUsed = (section.overridden ? section.overrideList : section.autoList).slice(0, 8);
    const canonicalCategory = normalizeHofCategory(section.cat, [
      "Top 5 Commission",
      "Top 5 By Unit",
      "Top Primary dan KPR",
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
        let agentName = listUsed[i];

        // If the rank index exceeds current visible count, treat as cleared (empty)
        if (i >= (section.visibleCount || 3)) {
          agentName = "";
        }

        let agentID = 0;
        if (agentName && agentName !== "—") {
          const resolvedID = resolveAgentIdByName(agentName);
          if (!resolvedID) {
            throw new Error(`Agent '${agentName}' belum terdaftar di database server`);
          }
          agentID = resolvedID;
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
            agent: r.agent ? { id: Number(r.agent.id || r.agent_id || 0), name: String(r.agent.name || "") } : undefined,
            period: String(r.period || ""),
            auto: Boolean(r.auto),
            score: String(r.score || ""),
          })));
          // Seed the name→id cache with every saved record's agent, so re-saving a
          // category whose picker was never opened this session still resolves correctly.
          setKnownAgentIds(prev => {
            const next = { ...prev };
            for (const r of rows) {
              if (r.agent?.name && (r.agent?.id || r.agent_id)) {
                next[String(r.agent.name)] = Number(r.agent.id || r.agent_id);
              }
            }
            return next;
          });
        }
      } catch { }
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
          {DYNAMIC_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
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
                  {Array.from({ length: section.visibleCount || 3 }).map((_, rankIdx) => {
                    const rankNum = rankIdx + 1;
                    const selectedAgent = section.overrideList[rankIdx] || "";

                    return (
                      <div key={rankIdx} className="flex items-center gap-2.5 p-2 rounded-xl" style={{ backgroundColor: T.muted }}>
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                          style={{
                            background: rankIdx === 0 ? "linear-gradient(135deg,#E8A500,#C8922A)" : rankIdx === 1 ? "#9CA3AF" : rankIdx === 2 ? "#B87333" : T.muted,
                            color: rankIdx <= 2 ? "white" : T.text3
                          }}>
                          #{rankNum}
                        </span>

                        {section.overridden ? (
                          <div className="flex-1 flex items-center gap-2">
                            <SearchableSelect
                              loadOptions={loadHofAgentOptions}
                              value={selectedAgent}
                              onChange={(v) => handleAgentChange(si, rankIdx, v)}
                              placeholder="— Kosong / None —"
                              emptyLabel="Agent tidak ditemukan"
                              className="flex-1"
                            />
                            {selectedAgent && (
                              <button
                                type="button"
                                onClick={() => {
                                  const id = resolveAgentIdByName(selectedAgent);
                                  if (id) setSheetAgentId(String(id));
                                }}
                                className="p-1.5 rounded-lg hover:bg-[#E8A500]/10 text-[#E8A500] transition-colors border border-transparent hover:border-[#E8A500]/20 flex-shrink-0"
                                title="Lihat profil agent"
                              >
                                <User size={14} />
                              </button>
                            )}
                            {rankIdx >= 3 && (
                              <button
                                onClick={() => handleRemoveRank(si, rankIdx)}
                                type="button"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                title="Hapus peringkat ini"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2 text-left px-2 py-1 text-xs font-semibold text-muted-foreground bg-card/40 rounded-lg border border-dashed" style={{ borderColor: T.border }}>
                            <span className="truncate">{entriesFromApi(section.cat)[rankIdx]?.name || "—"}</span>
                            {entriesFromApi(section.cat)[rankIdx]?.score ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#16A34A" }}>
                                {entriesFromApi(section.cat)[rankIdx].score}
                              </span>
                            ) : null}
                            <span className="text-[10px] font-normal text-muted-foreground/60 ml-auto flex-shrink-0">(System)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tambah Peringkat button */}
                {section.overridden && (section.visibleCount || 3) < 8 && (
                  <button
                    onClick={() => handleAddRank(si)}
                    type="button"
                    className="mt-1 mb-3 text-xs font-semibold flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed hover:bg-card/60 transition-all text-[#E8A500] border-[#E8A500]/40 w-full"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    + Tambah Peringkat (Juara #{(section.visibleCount || 3) + 1})
                  </button>
                )}
              </div>

              {section.type === "auto" && !section.overridden ? (
                // Tanpa bypass tidak ada yang bisa disimpan — tombol Simpan di sini hanya
                // akan mengirim daftar kosong dan justru menghapus data periode ini.
                <p className="text-[11px] text-center text-muted-foreground py-2 px-3">
                  Peringkat dihitung otomatis oleh sistem. Nyalakan bypass untuk menentukan manual.
                </p>
              ) : (
                <button onClick={() => handleSaveCategory(section)}
                  disabled={savingCategory === section.cat}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#E8A500] hover:bg-[#CC9200] text-black transition-all shadow-sm"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <Save size={13} /> {savingCategory === section.cat ? "Menyimpan..." : `Simpan ${section.cat}`}
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <AgentProfileSheet agentId={sheetAgentId} onClose={() => setSheetAgentId(null)} />
    </div>
  );
}
