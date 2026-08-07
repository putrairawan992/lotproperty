import { useEffect, useState } from "react";
import { CalendarClock, Search, Clock, History } from "lucide-react";
import Card from "../../components/Card";
import AdminPagination from "../../components/AdminPagination";
import { T, useTheme } from "../../types";
import { api } from "../../services/api";

type CheckoutListFn = (opts: { search?: string; page?: number; pageSize?: number }) => Promise<any>;

const URGENCY_STYLE: Record<string, { bg: string; color: string }> = {
  past:     { bg: "rgba(107,114,128,0.16)", color: "#6B7280" },
  urgent:   { bg: "rgba(220,38,38,0.12)",   color: "#DC2626" },
  upcoming: { bg: "rgba(232,165,0,0.12)",   color: "#C8922A" },
  future:   { bg: "rgba(107,114,128,0.10)", color: "#6B7280" },
};

function CheckoutTabPanel({
  fetchList, searchPlaceholder, emptyMessage, showFullStats,
}: {
  fetchList: CheckoutListFn;
  searchPlaceholder: string;
  emptyMessage: string;
  showFullStats: boolean; // true = past/urgent/upcoming/future 4-card row; false = urgent/upcoming only
}) {
  // Current page's data only — search/pagination/split counts all computed
  // server-side (this table can hold thousands of historical rows).
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [futureCount, setFutureCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, pageSize]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetchList({ search: debouncedSearch, page, pageSize });
        setCheckouts(res?.data || []);
        setTotal(res?.total || 0);
        setPastCount(res?.past_count || 0);
        setUrgentCount(res?.urgent_count || 0);
        setUpcomingCount(res?.upcoming_count || 0);
        setFutureCount(res?.future_count || 0);
      } catch {
        // Keep empty list
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, page, pageSize]);

  return (
    <div className="space-y-5">
      <div className={showFullStats ? "grid grid-cols-2 sm:grid-cols-4 gap-3.5" : "grid grid-cols-2 gap-3.5"}>
        {showFullStats && (
          <Card className="p-4">
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#6B7280" }}>{pastCount}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>Sudah Lewat</p>
          </Card>
        )}
        <Card className="p-4">
          <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#DC2626" }}>{urgentCount}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>Urgent (≤30 hari)</p>
        </Card>
        <Card className="p-4">
          <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#C8922A" }}>{upcomingCount}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>Upcoming (31–45 hari)</p>
        </Card>
        {showFullStats && (
          <Card className="p-4">
            <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#6B7280" }}>{futureCount}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>{">"}45 Hari</p>
          </Card>
        )}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl border bg-card text-sm outline-none"
              style={{ borderColor: T.border, color: T.text1 }}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: T.text3 }}>Memuat data...</p>
        ) : checkouts.length === 0 ? (
          <div className="text-center py-14 flex flex-col items-center gap-2">
            <CalendarClock size={32} style={{ color: T.text3, opacity: 0.5 }} />
            <p className="text-sm" style={{ color: T.text3 }}>
              {total === 0 ? emptyMessage : "Tidak ada hasil yang cocok."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider" style={{ color: T.text3 }}>
                  <th className="text-left font-semibold px-2 py-2">Nama Customer</th>
                  <th className="text-left font-semibold px-2 py-2">Properti</th>
                  <th className="text-left font-semibold px-2 py-2">Unit</th>
                  <th className="text-left font-semibold px-2 py-2">Marketing</th>
                  <th className="text-left font-semibold px-2 py-2">Tanggal Checkout</th>
                  <th className="text-right font-semibold px-2 py-2">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: T.border }}>
                {checkouts.map((co, i) => {
                  const style = URGENCY_STYLE[co.urgency] || URGENCY_STYLE.upcoming;
                  const d = new Date(co.checkout_date);
                  const dateStr = Number.isNaN(d.getTime()) ? co.checkout_date : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                  const badgeText = co.days_remaining < 0
                    ? `Lewat ${Math.abs(co.days_remaining)} hari`
                    : co.days_remaining === 0
                      ? "Hari ini"
                      : `${co.days_remaining} hari`;
                  return (
                    <tr key={i}>
                      <td className="px-2 py-2.5 font-semibold" style={{ color: T.text1 }}>{co.customer_name || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.property || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.unit || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.agent_name || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{dateStr}</td>
                      <td className="px-2 py-2.5 text-right whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap" style={{ backgroundColor: style.bg, color: style.color }}>
                          {badgeText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && checkouts.length > 0 && (
          <div className="-mx-5 -mb-5 mt-4">
            <AdminPagination page={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AdminCheckoutPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"reminder" | "all">("reminder");

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col gap-3.5 items-start border-b pb-4" style={{ borderColor: T.border }}>
        <div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
            Reminder Checkout Sewa
          </h1>
          <p className="text-sm mt-0.5" style={{ color: T.text3 }}>
            Follow up client untuk perpanjangan sewa.
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto" style={{ backgroundColor: T.muted }}>
          <button onClick={() => setActiveTab("reminder")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === "reminder" ? (isDark ? "#2A241C" : "white") : "transparent",
              color: activeTab === "reminder" ? "#E8A500" : (isDark ? "#9CA3AF" : "#6B7280"),
              boxShadow: activeTab === "reminder" && !isDark ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}>
            <Clock size={13} /> Reminder (45 Hari)
          </button>
          <button onClick={() => setActiveTab("all")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === "all" ? (isDark ? "#2A241C" : "white") : "transparent",
              color: activeTab === "all" ? "#E8A500" : (isDark ? "#9CA3AF" : "#6B7280"),
              boxShadow: activeTab === "all" && !isDark ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}>
            <History size={13} /> Semua Data Checkout
          </button>
        </div>
      </div>

      {activeTab === "reminder" && (
        <CheckoutTabPanel
          fetchList={api.checkouts.getList}
          searchPlaceholder="Cari customer, unit, atau marketing..."
          emptyMessage="Tidak ada sewa yang akan checkout dalam 45 hari ke depan."
          showFullStats={false}
        />
      )}
      {activeTab === "all" && (
        <CheckoutTabPanel
          fetchList={api.checkouts.getAllList}
          searchPlaceholder="Cari customer, unit, atau marketing di seluruh data..."
          emptyMessage="Belum ada data checkout."
          showFullStats={true}
        />
      )}
    </div>
  );
}
