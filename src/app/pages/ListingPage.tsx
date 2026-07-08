import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, MapPin, MoreHorizontal, X, Download, Check,
  ChevronRight, Eye, ToggleLeft, Archive, Trash2, MessageCircle, Home
} from "lucide-react";
import Card from "../components/Card";
import { ListingPageSkeleton } from "../components/Skeletons";
import useLoading from "../hooks/useLoading";
import { T, useTheme } from "../types";
import { useTabQuery, useLocation } from "../routes";
import EllipsisTooltip from "../components/EllipsisTooltip";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

interface Listing {
  id: string;
  title: string;
  type: string;
  listingType: string;
  owner: string;
  phone: string;
  address: string;
  price: string;
  loc: string;
  status: "Active" | "Inactive" | "Closed";
  days: number;
  remind: "safe" | "warn" | "danger";
  landArea: string;
  buildingArea: string;
  floors: string;
  certificate: string;
  commission: string;
  notes: string;
  createdAt: string;
}

const PROPERTY_TYPES = ["Rumah", "Apartemen", "Ruko", "Tanah", "Gudang", "Kavling"];
const CERTIFICATE_TYPES = ["SHM", "SHGB", "HGB", "AJB", "PPJB", "Girik", "Lainnya"];

const EMPTY_FORM = {
  owner: "",
  phone: "",
  address: "",
  price: "",
  type: "",
  listingType: "Dijual",
  landArea: "",
  buildingArea: "",
  floors: "",
  certificate: "",
  commission: "",
  notes: "",
};

const INITIAL_LISTINGS: Listing[] = [
  { id: "L-001", title: "Rumah 3BR Bintaro Jaya Sektor 7", type: "Rumah", owner: "Pak Hendra", phone: "0812-3456-7890", address: "Jl. Bintaro Raya Sektor 7, Tangerang Selatan", price: "Rp 1,2M", loc: "Bintaro", status: "Active", days: 45, remind: "safe", landArea: "120 m²", buildingArea: "90 m²", floors: "2", certificate: "SHM", commission: "2%", notes: "Akses tol dekat, lingkungan tenang.", createdAt: "5 Mei 2026" },
  { id: "L-002", title: "Apartemen Studio The Spring BSD", type: "Apartemen", owner: "Bu Linda", phone: "0821-9876-5432", address: "The Spring Tower A, BSD City", price: "Rp 450Jt", loc: "BSD City", status: "Active", days: 14, remind: "warn", landArea: "—", buildingArea: "32 m²", floors: "1", certificate: "SHGB", commission: "2,5%", notes: "Fully furnished, view kolam renang.", createdAt: "7 Jun 2026" },
  { id: "L-003", title: "Ruko 2 Lantai Grand Serpong", type: "Ruko", owner: "Pak Rudi", phone: "0856-1234-5678", address: "Jl. Raya Serpong KM 7, Tangerang", price: "Rp 2,8M", loc: "Serpong", status: "Inactive", days: 92, remind: "danger", landArea: "80 m²", buildingArea: "160 m²", floors: "2", certificate: "SHM", commission: "3%", notes: "Lokasi ramai, cocok untuk usaha F&B.", createdAt: "20 Mar 2026" },
  { id: "L-004", title: "Kavling 300m² Sawangan Indah", type: "Tanah", owner: "Bu Maya", phone: "0878-2345-6789", address: "Perumahan Sawangan Indah Blok C12", price: "Rp 680Jt", loc: "Sawangan", status: "Active", days: 60, remind: "safe", landArea: "300 m²", buildingArea: "—", floors: "—", certificate: "SHM", commission: "2%", notes: "Tanah siap bangun, sertifikat bersih.", createdAt: "22 Apr 2026" },
  { id: "L-005", title: "Rumah 4BR Alam Sutera Premium", type: "Rumah", owner: "Pak Doni", phone: "0819-8765-4321", address: "Cluster Premium Alam Sutera, Tangerang", price: "Rp 3,5M", loc: "Alam Sutera", status: "Closed", days: 0, remind: "safe", landArea: "240 m²", buildingArea: "200 m²", floors: "2", certificate: "SHM", commission: "2%", notes: "Deal selesai — KPR BCA.", createdAt: "10 Jan 2026" },
];

type ListingApiRow = {
  id: number;
  owner_name: string;
  phone: string;
  address: string;
  price: number;
  property_type: string;
  listing_type?: string;
  status: "Active" | "Inactive" | "Closed";
  luas_tanah?: number;
  luas_bangunan?: number;
  jumlah_lantai?: number;
  certificate?: string;
  commission_percent?: string;
  notes?: string;
  created_at: string;
};

function formatIDR(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function listingFromApi(item: ListingApiRow): Listing {
  const created = new Date(item.created_at);
  const createdAt = Number.isNaN(created.getTime())
    ? "-"
    : created.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const loc = item.address.split(" ").slice(0, 2).join(" ") || item.address;
  return {
    id: String(item.id),
    title: `${item.property_type} — ${loc}`,
    type: item.property_type,
    listingType: item.listing_type || "Dijual",
    owner: item.owner_name,
    phone: item.phone,
    address: item.address,
    price: formatIDR(item.price || 0),
    loc,
    status: item.status,
    days: 0,
    remind: "safe",
    landArea: item.luas_tanah ? `${item.luas_tanah} m²` : "—",
    buildingArea: item.luas_bangunan ? `${item.luas_bangunan} m²` : "—",
    floors: item.jumlah_lantai ? String(item.jumlah_lantai) : "—",
    certificate: item.certificate || "—",
    commission: item.commission_percent || "—",
    notes: item.notes || "—",
    createdAt,
  };
}

function parseNumber(input: string) {
  const digits = input.replace(/[^0-9]/g, "");
  return Number(digits || "0");
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: T.text2 }}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-bold text-[#E8A500] mb-3" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.04em" }}>
      {children}
    </p>
  );
}

export default function ListingPage() {
  const loadingTime = useLoading(1100);
  const { isGuest, refreshUser } = useTheme();
  const [apiLoading, setApiLoading] = useState(true);

  const loading = loadingTime || (isGuest ? false : apiLoading);

  const [tab, setTab] = useTabQuery("tab", "All");
  const { getQueryParam, navigate, search: urlSearch } = useLocation();
  const detailId = getQueryParam("detail");

  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ left: number; top?: number; bottom?: number; openUp: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, closed: 0 });
  const PAGE_SIZE = 10;

  const loadListings = async () => {
    if (isGuest) {
      setListings(INITIAL_LISTINGS);
      setStats({
        total: INITIAL_LISTINGS.length,
        active: INITIAL_LISTINGS.filter(l => l.status === "Active").length,
        inactive: INITIAL_LISTINGS.filter(l => l.status === "Inactive").length,
        closed: INITIAL_LISTINGS.filter(l => l.status === "Closed").length,
      });
      setApiLoading(false);
      return;
    }
    try {
      setApiLoading(true);
      const statusFilter = tab === "All" ? undefined : tab;
      const payload = await api.listings.getList({ status: statusFilter, search, property_type: typeFilter || undefined, page, page_size: PAGE_SIZE });
      const rows: ListingApiRow[] = Array.isArray(payload?.listings) ? payload.listings : [];
      setListings(rows.map(listingFromApi));
      setTotalPages(Math.max(1, payload?.pagination?.total_pages || 1));
      if (payload?.stats) setStats(payload.stats);
    } catch (error) {
      setSuccessToast(error instanceof Error ? error.message : "Gagal memuat listing");
      setTimeout(() => setSuccessToast(""), 3000);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    const handleClickOutside = (e: PointerEvent) => {
      const target = e.target as Element;
      // Menu is portaled to body; ignore clicks inside it or on any trigger button.
      if (menuRef.current?.contains(target)) return;
      if (target?.closest?.("[data-action-menu-trigger]")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    // Absolute menu can't follow scroll — close it so it never lingers mispositioned.
    // Capture phase catches scrolling in inner containers too.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  // Close the menu when switching tabs
  useEffect(() => { setOpenMenuId(null); }, [tab]);

  useEffect(() => {
    if (getQueryParam("create") === "1") {
      setShowPanel(true);
      navigate("/listing");
    }
  }, [urlSearch]);

  // Tab/type/search changes jump back to page 1 (they invalidate the current page).
  useEffect(() => { setPage(1); }, [tab, typeFilter, search]);

  // Debounce so typing in search doesn't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(loadListings, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, typeFilter, search, page]);

  if (loading) return <ListingPageSkeleton />;

  const detailListing = detailId ? listings.find(l => l.id === detailId) : null;

  // ponytail: exports only the currently loaded page now that listings are paginated.
  // Full-dataset export would need a dedicated unpaginated endpoint — add if requested.
  const handleExportExcel = () => {
    setSuccessToast("Mengekspor data listing ke Excel...");
    setTimeout(() => {
      setSuccessToast("Data listing berhasil diekspor ke Excel (Backup-Listings.xlsx)");
      const element = document.createElement("a");
      const file = new Blob([
        "ID,Title,Type,Owner,Phone,Price,Location,Status,LandArea,BuildingArea,Floors,Certificate,Commission\n" +
        listings.map(l =>
          `${l.id},"${l.title}",${l.type},"${l.owner}","${l.phone}","${l.price}","${l.loc}",${l.status},"${l.landArea}","${l.buildingArea}",${l.floors},"${l.certificate}","${l.commission}"`
        ).join("\n"),
      ], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = "Backup-Listings.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  const isFormValid =
    form.owner.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.price.trim() &&
    form.type.trim();

  const handleSaveListing = async () => {
    if (!isFormValid) return;

    try {
      await api.listings.create({
        owner_name: form.owner.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        price: parseNumber(form.price),
        property_type: form.type,
        listing_type: form.listingType,
        luas_tanah: form.landArea.trim() ? parseNumber(form.landArea) : 0,
        luas_bangunan: form.buildingArea.trim() ? parseNumber(form.buildingArea) : 0,
        jumlah_lantai: form.floors.trim() ? parseNumber(form.floors) : 0,
        certificate: form.certificate.trim(),
        commission_percent: form.commission.trim(),
        notes: form.notes.trim(),
      });

      setShowPanel(false);
      setForm(EMPTY_FORM);
      setSuccessToast("Listing baru berhasil ditambahkan!");
      await loadListings();
      await refreshUser();
    } catch (error) {
      setSuccessToast(error instanceof Error ? error.message : "Gagal menambahkan listing");
    }

    setTimeout(() => setSuccessToast(""), 3000);
  };

  const openDetail = (id: string) => {
    setOpenMenuId(null);
    const params = new URLSearchParams(window.location.search);
    params.set("detail", id);
    const qs = params.toString();
    navigate(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  };

  const closeDetail = () => {
    navigate("/listing");
  };

  const updateStatus = async (id: string, status: Listing["status"]) => {
    try {
      await api.listings.update(id, status);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      setOpenMenuId(null);
      setSuccessToast(`Status listing diubah menjadi ${status}`);
    } catch (error) {
      setSuccessToast(error instanceof Error ? error.message : "Gagal update status listing");
    }
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const deleteListing = async (id: string) => {
    setOpenMenuId(null);
    try {
      await api.listings.delete(id);
      if (detailId === id) closeDetail();
      setSuccessToast("Listing berhasil dihapus");
      await loadListings();
    } catch (error) {
      setSuccessToast(error instanceof Error ? error.message : "Gagal menghapus listing");
    }
    setTimeout(() => setSuccessToast(""), 3000);
  };

  // Filtering (status/type/search) and pagination now happen server-side in loadListings.
  const filtered = listings;

  const StatusChip = ({ s }: { s: string }) => {
    const cfg = s === "Active" ? { bg: "#DCFCE7", c: "#16A34A" } : s === "Inactive" ? { bg: "#FEF3C7", c: "#D97706" } : { bg: "#FEE2E2", c: "#DC2626" };
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{s}</span>;
  };

  const RemindBadge = ({ r, d }: { r: string; d: number }) => {
    if (r === "safe") return <span className="text-xs" style={{ color: T.text3 }}>✓ Aman</span>;
    if (r === "warn") return <span className="text-xs font-semibold" style={{ color: "#D97706" }}>⚠ {d} hari lagi</span>;
    return <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>⚡ Rekomendasi Inactive</span>;
  };

  const ActionMenu = ({ listing }: { listing: Listing }) => (
    <div className="relative">
      <button
        type="button"
        data-action-menu-trigger
        onClick={(e) => {
          e.stopPropagation();
          if (openMenuId === listing.id) { setOpenMenuId(null); return; }
          const rect = e.currentTarget.getBoundingClientRect();
          const openUp = window.innerHeight - rect.bottom < 260;
          // Fixed-position anchor (viewport coords) so the menu escapes the
          // table's overflow-clipping container. Position via top/left/bottom only —
          // NOT transform, which framer-motion controls for its animation.
          setMenuAnchor({
            left: Math.max(8, rect.right - 176), // w-44, right-aligned to the button
            top: openUp ? undefined : rect.bottom + 4,
            bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
            openUp,
          });
          setOpenMenuId(listing.id);
        }}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        style={{ color: T.text3 }}
      >
        <MoreHorizontal size={16} />
      </button>
      {openMenuId === listing.id && menuAnchor && createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: menuAnchor.openUp ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed w-44 rounded-xl border shadow-xl z-[100] overflow-hidden"
            style={{
              left: menuAnchor.left,
              ...(menuAnchor.top != null ? { top: menuAnchor.top } : { bottom: menuAnchor.bottom }),
              backgroundColor: T.card,
              borderColor: T.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: "Lihat Detail", icon: Eye, action: () => openDetail(listing.id) },
              { label: listing.status === "Active" ? "Set Inactive" : "Set Active", icon: ToggleLeft, action: () => updateStatus(listing.id, listing.status === "Active" ? "Inactive" : "Active") },
              { label: "Tandai Closed", icon: Archive, action: () => updateStatus(listing.id, "Closed"), hide: listing.status === "Closed" },
              { label: "Hapus", icon: Trash2, action: () => deleteListing(listing.id), danger: true },
            ].filter(a => !a.hide).map(item => (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium hover:bg-muted transition-colors text-left"
                style={{ color: item.danger ? "#DC2626" : T.text1 }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </motion.div>,
          document.body
        )}
    </div>
  );

  const formatArea = (l: Listing) => {
    const parts: string[] = [];
    if (l.landArea !== "—") parts.push(`T: ${l.landArea}`);
    if (l.buildingArea !== "—") parts.push(`B: ${l.buildingArea}`);
    if (l.floors !== "—") parts.push(`${l.floors} lantai`);
    return parts.length > 0 ? parts.join(" · ") : "—";
  };


  return (
    <div className="p-4 lg:p-6 relative">
      <AnimatePresence>
        {successToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] bg-[#16A34A] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold border border-green-500/20">
            <Check size={16} /> {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 mb-3 sm:mb-5">
          {[
            { l: "Total Listing", short: "Total", v: stats.total, c: T.text2 },
            { l: "Active", short: "Active", v: stats.active, c: "#16A34A" },
            { l: "Inactive", short: "Inactive", v: stats.inactive, c: "#D97706" },
            { l: "Closed", short: "Closed", v: stats.closed, c: "#DC2626" },
          ].map(s => (
            <Card key={s.l} className="px-2 py-2 sm:p-3 lg:p-4 text-center min-w-0">
              <p
                className="font-bold leading-none"
                style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(18px, 4.5vw, 28px)", color: s.c }}
              >
                {s.v}
              </p>
              <p className="text-[9px] sm:text-xs mt-0.5 sm:mt-1 leading-tight truncate" style={{ color: T.text3 }}>
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.l}</span>
              </p>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b" style={{ borderColor: T.border }}>
            <div className="relative flex-1 min-w-0 w-full sm:w-auto" style={{ minWidth: 0 }}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari listing..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: T.border, backgroundColor: T.card, color: T.text1 }} />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl border text-sm outline-none bg-card min-w-0" style={{ borderColor: T.border, color: T.text2 }}>
                <option value="">Semua Tipe</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all border flex-shrink-0"
                style={{ borderColor: T.border, color: T.text2, backgroundColor: T.card, fontFamily: "'Rajdhani', sans-serif" }}>
                <Download size={15} />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button onClick={() => setShowPanel(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0"
                style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif" }}>
                <Plus size={15} /> Tambah
              </button>
            </div>
          </div>

          <div className="flex border-b overflow-x-auto" style={{ borderColor: T.border }}>
            {(["All", "Active", "Inactive", "Closed"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-all"
                style={{ color: tab === t ? "#E8A500" : T.text3, borderBottom: tab === t ? "2px solid #E8A500" : "2px solid transparent" }}>
                {t}
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <>
              {/* Mobile: card layout */}
              <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
                {filtered.map((l, index) => (
                  <div
                    key={l.id}
                    className="p-4 transition-colors cursor-pointer active:bg-muted/60 relative"
                    onClick={() => openDetail(l.id)}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <StatusChip s={l.status} />
                      <ActionMenu listing={l} />
                    </div>

                    <div className="flex items-start justify-between gap-3 mb-2 pr-24">
                      <div className="flex-1 min-w-0">
                        <EllipsisTooltip 
                          text={l.title} 
                          className="text-sm font-semibold leading-snug line-clamp-2 text-left block w-full" 
                          style={{ color: T.text1 }} 
                        />
                        <div className="text-xs flex items-center gap-1 mt-1 min-w-0" style={{ color: T.text3 }}>
                          <MapPin size={11} className="flex-shrink-0" />
                          <EllipsisTooltip 
                            text={`${l.loc} · ${l.owner}`} 
                            className="truncate text-left block w-full" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: "var(--muted)", color: T.text2 }}>
                        {l.type}
                      </span>
                      <p className="text-sm font-bold flex-shrink-0" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#E8A500" }}>
                        {l.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] leading-snug flex-1 min-w-0" style={{ color: T.text3 }}>
                        {formatArea(l)}
                      </p>
                      <div className="flex-shrink-0">
                        <RemindBadge r={l.remind} d={l.days} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table layout */}
              <div className="hidden md:block overflow-x-auto pb-28 min-h-[300px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: T.border }}>
                      {["LISTING", "TIPE", "LUAS (T / B)", "HARGA", "STATUS", "REMINDER", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: T.text3 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l, index) => (
                      <tr
                        key={l.id}
                        className="border-b transition-colors cursor-pointer"
                        style={{ borderColor: T.border }}
                        onClick={() => openDetail(l.id)}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="px-4 py-3 min-w-[220px]">
                          <p className="text-sm font-medium" style={{ color: T.text1 }}>{l.title}</p>
                          <p className="text-xs flex items-center gap-1" style={{ color: T.text3 }}>
                            <MapPin size={10} />{l.loc} · {l.owner}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: T.text2 }}>{l.type}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: T.text2 }}>
                          {l.landArea !== "—" ? `T: ${l.landArea}` : "—"} / {l.buildingArea !== "—" ? `B: ${l.buildingArea}` : "—"}
                          {l.floors !== "—" && <span className="block text-[10px] text-muted-foreground">{l.floors} Lantai</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: T.text1 }}>{l.price}</td>
                        <td className="px-4 py-3"><StatusChip s={l.status} /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><RemindBadge r={l.remind} d={l.days} /></td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <ActionMenu listing={l} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 px-4 py-3 border-t" style={{ borderColor: T.border }}>
                  <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-40"
                    style={{ borderColor: T.border, color: T.text2 }}>
                    Sebelumnya
                  </button>
                  <span className="text-sm" style={{ color: T.text3 }}>Halaman {page} dari {totalPages}</span>
                  <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-40"
                    style={{ borderColor: T.border, color: T.text2 }}>
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-8">
              <EmptyState
                icon={Home}
                title="Tidak Ada Listing"
                description={
                  search.trim()
                    ? `Tidak ada listing yang cocok dengan pencarian "${search}".`
                    : tab === "All"
                      ? "Belum ada data listing properti. Tambahkan listing properti Anda untuk mulai memasarkannya."
                      : `Tidak ada listing dengan status "${tab}".`
                }
                actionLabel="Tambah Listing"
                onAction={() => setShowPanel(true)}
              />
            </div>
          )}
        </Card>

        {/* Tambah Listing Side Panel */}
        <AnimatePresence>
          {showPanel && (
            <div className="fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/45" onClick={() => setShowPanel(false)} aria-hidden />
              <motion.div
                className="relative z-10 w-full h-full flex flex-col bg-card shadow-2xl"
                style={{ maxWidth: 420 }}
                initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: T.border }}>
                  <h3 className="font-bold font-display text-lg" style={{ color: T.text1 }}>Tambah New Listing</h3>
                  <button onClick={() => setShowPanel(false)} style={{ color: T.text3 }}><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
                  <div>
                    <SectionTitle>Field Wajib</SectionTitle>
                    <div className="space-y-3.5">
                      <div>
                        <FieldLabel required>Nama Pemilik</FieldLabel>
                        <input type="text" placeholder="Masukkan nama pemilik" value={form.owner}
                          onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: T.text1 }} />
                      </div>
                      <div>
                        <FieldLabel required>Nomor HP</FieldLabel>
                        <div className="relative">
                          <input type="tel" placeholder="Masukkan nomor HP" value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, color: T.text1 }} />
                          <MessageCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#25D366]" />
                        </div>
                      </div>
                      <div>
                        <FieldLabel required>Alamat Property</FieldLabel>
                        <input type="text" placeholder="Masukkan alamat lengkap property" value={form.address}
                          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: T.text1 }} />
                      </div>
                      <div>
                        <FieldLabel required>Harga</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: T.text3 }}>Rp</span>
                          <input type="text" placeholder="Masukkan harga" value={form.price}
                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, color: T.text1 }} />
                        </div>
                      </div>
                      <div>
                        <FieldLabel required>Tipe Property</FieldLabel>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: form.type ? T.text1 : T.text3 }}>
                          <option value="">Pilih tipe property</option>
                          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Status Listing</FieldLabel>
                        <select value={form.listingType} onChange={e => setForm(f => ({ ...f, listingType: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: T.text1 }}>
                          <option value="Dijual">Dijual</option>
                          <option value="Disewa">Disewa</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Field Opsional</SectionTitle>
                    <div className="space-y-3.5">
                      <div>
                        <FieldLabel>Luas Tanah</FieldLabel>
                        <div className="relative">
                          <input type="text" placeholder="Contoh: 120" value={form.landArea}
                            onChange={e => setForm(f => ({ ...f, landArea: e.target.value }))}
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, color: T.text1 }} />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: T.text3 }}>m²</span>
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Luas Bangunan</FieldLabel>
                        <div className="relative">
                          <input type="text" placeholder="Contoh: 100" value={form.buildingArea}
                            onChange={e => setForm(f => ({ ...f, buildingArea: e.target.value }))}
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, color: T.text1 }} />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: T.text3 }}>m²</span>
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Jumlah Lantai</FieldLabel>
                        <div className="relative">
                          <input type="text" placeholder="Contoh: 2" value={form.floors}
                            onChange={e => setForm(f => ({ ...f, floors: e.target.value }))}
                            className="w-full pl-3.5 pr-16 py-2.5 rounded-xl border bg-card text-sm outline-none"
                            style={{ borderColor: T.border, color: T.text1 }} />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: T.text3 }}>Lantai</span>
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Sertifikat</FieldLabel>
                        <select value={form.certificate} onChange={e => setForm(f => ({ ...f, certificate: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: form.certificate ? T.text1 : T.text3 }}>
                          <option value="">Pilih sertifikat</option>
                          {CERTIFICATE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Komisi</FieldLabel>
                        <input type="text" placeholder="Contoh: 2,5% atau Nego" value={form.commission}
                          onChange={e => setForm(f => ({ ...f, commission: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none"
                          style={{ borderColor: T.border, color: T.text1 }} />
                      </div>
                      <div>
                        <FieldLabel>Catatan</FieldLabel>
                        <textarea rows={3} placeholder="Tulis catatan (opsional)" value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-card text-sm outline-none resize-none"
                          style={{ borderColor: T.border, color: T.text1 }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 p-5 border-t bg-card" style={{ borderColor: T.border }}>
                  <button
                    onClick={handleSaveListing}
                    disabled={!isFormValid}
                    className="w-full py-3 rounded-xl font-bold transition-all text-white text-center"
                    style={{
                      backgroundColor: isFormValid ? "#E8A500" : "var(--border)",
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 16,
                      letterSpacing: "0.04em",
                      cursor: isFormValid ? "pointer" : "not-allowed",
                    }}
                  >
                    Simpan Listing
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Detail modal */}
        <AnimatePresence>
          {detailListing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
              onClick={closeDetail}
            >
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 28 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-card rounded-t-2xl sm:rounded-2xl border shadow-2xl"
                style={{ borderColor: T.border }}
                onClick={e => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b bg-card" style={{ borderColor: T.border }}>
                  <div className="min-w-0">
                    <p className="text-xs font-mono" style={{ color: T.text3 }}>{detailListing.id}</p>
                    <h2 className="font-bold text-lg truncate" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
                      Detail Listing
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                    style={{ color: T.text3 }}
                    aria-label="Tutup"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl" style={{ fontFamily: "'Rajdhani', sans-serif", color: T.text1 }}>
                        {detailListing.title}
                      </h3>
                      <p className="text-sm flex items-center gap-1 mt-1" style={{ color: T.text3 }}>
                        <MapPin size={13} /> {detailListing.address}
                      </p>
                    </div>
                    <StatusChip s={detailListing.status} />
                  </div>

                  <p className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#E8A500" }}>
                    {detailListing.price}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Tipe Properti", value: detailListing.type },
                      { label: "Nama Pemilik", value: detailListing.owner },
                      { label: "Nomor HP", value: detailListing.phone },
                      { label: "Luas Tanah", value: detailListing.landArea },
                      { label: "Luas Bangunan", value: detailListing.buildingArea },
                      { label: "Jumlah Lantai", value: detailListing.floors },
                      { label: "Sertifikat", value: detailListing.certificate },
                      { label: "Komisi", value: detailListing.commission },
                      { label: "Dibuat", value: detailListing.createdAt },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl border" style={{ borderColor: T.border, backgroundColor: "var(--muted)" }}>
                        <p className="text-[10px] uppercase font-semibold mb-0.5" style={{ color: T.text3 }}>{item.label}</p>
                        <p className="text-sm font-medium" style={{ color: T.text1 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {detailListing.notes !== "—" && (
                    <div className="p-3 rounded-xl border" style={{ borderColor: T.border }}>
                      <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: T.text3 }}>Catatan</p>
                      <p className="text-sm" style={{ color: T.text2 }}>{detailListing.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: T.border }}>
                    <a
                      href={`https://wa.me/${detailListing.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: "#25D366", fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      <MessageCircle size={14} /> WhatsApp Pemilik
                    </a>
                    {detailListing.status !== "Closed" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(detailListing.id, detailListing.status === "Active" ? "Inactive" : "Active")}
                        className="px-4 py-2 rounded-xl text-xs font-bold border"
                        style={{ borderColor: T.border, color: T.text2, fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        {detailListing.status === "Active" ? "Set Inactive" : "Set Active"}
                      </button>
                    )}
                    {detailListing.status !== "Closed" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(detailListing.id, "Closed")}
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: "#E8A500", color: "white", fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        Tandai Closed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
