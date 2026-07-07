import { useEffect, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import Card from "../../components/Card";
import AdminPagination from "../../components/AdminPagination";
import { T } from "../../types";
import { api } from "../../services/api";

export default function AdminCheckoutPage() {
  // Current page's data only — search/pagination/urgent-upcoming split all
  // computed server-side (this table can hold thousands of historical rows).
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
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
        const res = await api.checkouts.getList({ search: debouncedSearch, page, pageSize });
        setCheckouts(res?.data || []);
        setTotal(res?.total || 0);
        setUrgentCount(res?.urgent_count || 0);
        setUpcomingCount(res?.upcoming_count || 0);
      } catch {
        // Keep empty list
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, page, pageSize]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, color: T.text1 }}>
          Reminder Checkout Sewa
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.text3 }}>
          Sewa yang akan checkout dalam 45 hari ke depan — follow up client untuk perpanjangan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card className="p-4">
          <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#DC2626" }}>{urgentCount}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>Urgent (≤30 hari)</p>
        </Card>
        <Card className="p-4">
          <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, color: "#C8922A" }}>{upcomingCount}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: T.text3 }}>Upcoming (31–45 hari)</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari customer, unit, atau marketing..."
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
              {total === 0 ? "Tidak ada sewa yang akan checkout dalam 45 hari ke depan." : "Tidak ada hasil yang cocok."}
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
                  const urgent = co.urgency === "urgent";
                  const d = new Date(co.checkout_date);
                  const dateStr = Number.isNaN(d.getTime()) ? co.checkout_date : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <tr key={i}>
                      <td className="px-2 py-2.5 font-semibold" style={{ color: T.text1 }}>{co.customer_name || "—"}</td>
                                            <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.property || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.unit || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{co.agent_name || "—"}</td>
                      <td className="px-2 py-2.5" style={{ color: T.text2 }}>{dateStr}</td>
                      <td className="px-2 py-2.5 text-right whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap" style={{ backgroundColor: urgent ? "rgba(220,38,38,0.12)" : "rgba(232,165,0,0.12)", color: urgent ? "#DC2626" : "#C8922A" }}>
                          {co.days_remaining <= 0 ? "Hari ini" : `${co.days_remaining} hari`}
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
