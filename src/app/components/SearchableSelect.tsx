import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { T } from "../types";

export interface SelectOption {
  value: string;
  label: string;
  sub?: string; // secondary text (e.g. level)
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Cari...",
  emptyLabel = "Tidak ada pilihan",
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const DROPDOWN_MAX_HEIGHT = 260;

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

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sub || "").toLowerCase().includes(q)
    );
  }, [options, search]);

  const selected = options.find((o) => o.value === value);

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
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs" style={{ color: T.text3 }}>
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    o.value === value
                      ? "bg-[#E8A500]/10 font-semibold"
                      : "hover:bg-muted/30"
                  }`}
                  style={{
                    color: o.value === value ? "#E8A500" : "var(--text-primary)",
                  }}
                >
                  <span className="truncate flex-1 min-w-0">{o.label}</span>
                  {o.sub && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-muted/50 flex-shrink-0"
                      style={{ color: T.text3 }}
                    >
                      {o.sub}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
