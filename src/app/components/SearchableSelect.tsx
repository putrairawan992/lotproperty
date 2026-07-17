import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";
import { T } from "../types";

export interface SelectOption {
  value: string;
  label: string;
  sub?: string; // secondary text shown inline as a badge (e.g. level)
  subLine?: string; // secondary text shown on its own line below the label (e.g. email) — disambiguates duplicate names
}

export interface LoadOptionsResult {
  options: SelectOption[];
  hasMore: boolean;
}

interface SearchableSelectProps {
  /** Static mode: full option list already in memory, filtered client-side. */
  options?: SelectOption[];
  /**
   * Async mode: server does the search + pagination (page is 1-based).
   * When provided, `options` is ignored and the list scrolls to load more.
   */
  loadOptions?: (query: string, page: number) => Promise<LoadOptionsResult>;
  value: string;
  /** Async mode only: label to show for `value` when it isn't in the currently loaded page
   *  (e.g. an existing selection made in a previous session). Falls back to `value` itself. */
  selectedLabel?: string;
  selectedSub?: string;
  onChange: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  loadOptions,
  value,
  selectedLabel,
  selectedSub,
  onChange,
  placeholder = "Cari...",
  emptyLabel = "Tidak ada pilihan",
  className = "",
}: SearchableSelectProps) {
  const isAsync = !!loadOptions;

  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const DROPDOWN_MAX_HEIGHT = 260;

  // Async-mode state
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [asyncPage, setAsyncPage] = useState(1);
  const [asyncHasMore, setAsyncHasMore] = useState(false);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const requestIdRef = useRef(0);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  const runLoad = useCallback((query: string, page: number, append: boolean) => {
    if (!loadOptions) return;
    const requestId = ++requestIdRef.current;
    setAsyncLoading(true);
    loadOptions(query, page)
      .then((res) => {
        if (requestId !== requestIdRef.current) return; // a newer search/page superseded this one
        setAsyncOptions((prev) => (append ? [...prev, ...res.options] : res.options));
        setAsyncHasMore(res.hasMore);
        setAsyncPage(page);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        if (!append) setAsyncOptions([]);
        setAsyncHasMore(false);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setAsyncLoading(false);
      });
  }, [loadOptions]);

  // Debounced (re)load on open + on search text change, async mode only.
  useEffect(() => {
    if (!isAsync || !open) return;
    const t = setTimeout(() => runLoad(search, 1, false), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAsync, open, search]);

  const handleScroll = () => {
    if (!isAsync || asyncLoading || !asyncHasMore) return;
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      runLoad(search, asyncPage + 1, true);
    }
  };

  const staticFiltered = useMemo(() => {
    if (isAsync) return [];
    const list = options || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sub || "").toLowerCase().includes(q) ||
        (o.subLine || "").toLowerCase().includes(q)
    );
  }, [isAsync, options, search]);

  const filtered = isAsync ? asyncOptions : staticFiltered;

  const selected = isAsync
    ? asyncOptions.find((o) => o.value === value) ||
      (value ? { value, label: selectedLabel || value, sub: selectedSub } : undefined)
    : (options || []).find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            const rect = triggerRef.current?.getBoundingClientRect();
            const spaceBelow = rect ? window.innerHeight - rect.bottom : Infinity;
            setOpenUp(spaceBelow < DROPDOWN_MAX_HEIGHT + 48);
          }
          setOpen(!open);
        }}
        className="w-full flex items-center justify-between gap-2 px-3.5 rounded-xl border outline-none bg-card text-left transition-colors hover:border-[#E8A500]/50"
        style={{
          height: 48,
          borderColor: open ? "#E8A500" : "var(--border)",
          fontSize: 14,
          color: selected ? "var(--text-primary)" : "#9CA3AF",
        }}
      >
        <span className="truncate flex-1 min-w-0">
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="truncate">{selected.label}</span>
              {selected.sub && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-muted/50 text-muted-foreground flex-shrink-0">
                  {selected.sub}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#9CA3AF" }}
        />
      </button>

      {/* Dropdown — flips upward when there isn't room below (e.g. near the bottom of a modal) */}
      {open && (
        <div
          className={`absolute z-50 w-full rounded-xl border shadow-xl bg-card overflow-hidden ${openUp ? "bottom-full mb-1.5" : "mt-1.5"}`}
          style={{
            borderColor: "var(--border)",
            maxHeight: DROPDOWN_MAX_HEIGHT,
          }}
        >
          {/* Search input */}
          <div className="relative border-b" style={{ borderColor: "var(--border)" }}>
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#9CA3AF" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari agent..."
              className="w-full pl-9 pr-8 py-2.5 text-sm outline-none bg-transparent"
              style={{ color: "var(--text-primary)" }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setSearch("");
                }
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/30"
                style={{ color: "#9CA3AF" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div ref={listRef} onScroll={handleScroll} className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {filtered.length === 0 && !(isAsync && asyncLoading) ? (
              <div className="px-4 py-6 text-center text-xs" style={{ color: T.text3 }}>
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value, o);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center gap-2 transition-colors ${
                    o.value === value
                      ? "bg-[#E8A500]/10 font-semibold"
                      : "hover:bg-muted/30"
                  }`}
                  style={{
                    color: o.value === value ? "#E8A500" : "var(--text-primary)",
                  }}
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate">{o.label}</span>
                      {o.sub && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-muted/50 flex-shrink-0"
                          style={{ color: T.text3 }}
                        >
                          {o.sub}
                        </span>
                      )}
                    </span>
                    {o.subLine && (
                      <span className="block truncate text-xs font-normal" style={{ color: T.text3 }}>
                        {o.subLine}
                      </span>
                    )}
                  </span>
                </button>
              ))
            )}
            {isAsync && asyncLoading && (
              <div className="flex items-center justify-center gap-1.5 py-2.5 text-xs" style={{ color: T.text3 }}>
                <Loader2 size={12} className="animate-spin" /> Memuat...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
