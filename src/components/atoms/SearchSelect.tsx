// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "./Input";

// SearchSelect — text input with a filtered dropdown of options.
// Supports starts-with + includes matching, keyboard nav, "Add new" affordance.

type Opt = { label: string; value: string; type?: string };

const normalizeOption = (opt: any): Opt => {
  if (typeof opt === "string") return { label: opt, value: opt, type: "generic" };
  const label = String(opt?.label ?? opt?.value ?? "");
  const value = String(opt?.value ?? opt?.label ?? "");
  return { label, value, type: opt?.type || "generic" };
};

export const SearchSelect = ({
  value, onChange, onQueryChange, options, placeholder, className, onKeyDown, onBlur,
  clearOnCommit, inputRef, onEmptyEnter, onAddNew, maxResults = 8, uppercase = false,
  menuClassName = "", ...props
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState(value || "");
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => { setQuery(value || ""); }, [value]);

  const normalizedOptions = useMemo(() => (options || []).map(normalizeOption), [options]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return normalizedOptions.slice(0, maxResults);
    const starts = normalizedOptions.filter((o) => o.label.toLowerCase().startsWith(q) || o.value.toLowerCase().startsWith(q));
    const includes = normalizedOptions.filter((o) => !starts.includes(o) && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)));
    return [...starts, ...includes].slice(0, maxResults);
  }, [query, normalizedOptions, maxResults]);

  useEffect(() => { if (highlight >= filtered.length) setHighlight(0); }, [filtered.length, highlight]);
  useEffect(() => { setHighlight(0); }, [query]);
  useEffect(() => { if (open) setHighlight(0); }, [open]);
  useEffect(() => {
    const el = itemRefs.current[highlight];
    if (el && listRef.current) el.scrollIntoView({ block: "nearest" });
  }, [highlight, filtered.length]);

  const commit = (val) => {
    const nextVal = uppercase ? String(val || "").toUpperCase() : val;
    onChange(nextVal);
    if (clearOnCommit) { setQuery(""); onQueryChange?.(""); }
    else { setQuery(nextVal); onQueryChange?.(nextVal); }
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && onEmptyEnter && !query.trim()) {
      e.preventDefault(); onEmptyEnter(); setOpen(false); return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) commit(filtered[highlight].value);
      else if (query.trim()) commit(query.trim());
    }
    if (e.key === "Tab") {
      if (filtered[highlight]) commit(filtered[highlight].value);
      else if (query.trim()) commit(query.trim());
    }
    if (e.key === "Escape") setOpen(false);
    onKeyDown?.(e);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          const next = uppercase ? e.target.value.toUpperCase() : e.target.value;
          setQuery(next); setOpen(true); onQueryChange?.(next);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type to search..."}
        className={`pr-10 ${className || ""}`}
        onKeyDown={handleKey}
        onBlur={(e) => { setOpen(false); onBlur?.(e); }}
        {...props}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">▾</span>
      {open && (filtered.length > 0 || (query.trim() && onAddNew)) && (
        <div ref={listRef} className={`absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-auto ${menuClassName || "max-h-60"}`}>
          {filtered.map((opt, idx) => (
            <button
              type="button"
              key={`${opt.type}-${opt.value}-${idx}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(opt.value)}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                idx === highlight ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {opt.type !== "generic" && <span className="text-[10px] font-bold text-slate-400 uppercase">{opt.type}</span>}
            </button>
          ))}
          {query.trim() && onAddNew && filtered.length === 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onAddNew(query.trim()); setQuery(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 border-t border-slate-100 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add "{query.trim()}" as new</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
