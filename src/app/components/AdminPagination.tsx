import { ChevronLeft, ChevronRight } from "lucide-react";
import { T } from "../types";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AdminPagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t text-xs" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-2" style={{ color: T.text3 }}>
        <span>Tampilkan</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg border bg-card text-xs outline-none cursor-pointer font-semibold"
          style={{ borderColor: T.border, color: T.text1 }}
        >
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>per halaman • {from}-{to} dari {totalItems}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 transition-colors cursor-pointer"
          style={{ borderColor: T.border, color: T.text2 }}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="font-semibold px-2" style={{ color: T.text1 }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 transition-colors cursor-pointer"
          style={{ borderColor: T.border, color: T.text2 }}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
