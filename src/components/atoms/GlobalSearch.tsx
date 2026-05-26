// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { GLOBAL_SEARCH_ITEMS } from "../../config";

// GlobalSearch — keyboard-driven command palette. Filters GLOBAL_SEARCH_ITEMS by label/keywords.
// Items with `actionHit` fire `onSearchHit(actionHit)` before navigation.
export const GlobalSearch = ({ show, onClose, onNavigate, onSearchHit }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const resultRefs = useRef([]);

  useEffect(() => {
    if (show) {
      setQuery("");
      setActiveIndex(0);
      resultRefs.current = [];
      if (inputRef.current) inputRef.current.focus();
    }
  }, [show]);

  const filtered = GLOBAL_SEARCH_ITEMS.filter(
    (s) => s.label.toLowerCase().includes(query.toLowerCase()) || s.keywords.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!filtered.length) { setActiveIndex(-1); return; }
    setActiveIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filtered.length) return filtered.length - 1;
      return prev;
    });
  }, [filtered.length, query]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const item = resultRefs.current[activeIndex];
    if (item instanceof HTMLElement) item.scrollIntoView({ block: "nearest", inline: "nearest" });
    else if (listRef.current instanceof HTMLElement) listRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex, filtered.length]);

  if (!show) return null;

  const handleClose = () => { setQuery(""); setActiveIndex(0); onClose(); };

  const commitItem = (item) => {
    if (!item) return;
    if (item.actionHit && onSearchHit) onSearchHit(item.actionHit);
    onNavigate(item);
    handleClose();
  };

  const moveActive = (direction) => {
    if (!filtered.length) return;
    setActiveIndex((prev) => {
      const base = prev < 0 ? 0 : prev;
      return (base + direction + filtered.length) % filtered.length;
    });
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); moveActive(-1); return; }
    if (e.key === "Tab") {
      if (filtered.length > 0) { e.preventDefault(); moveActive(e.shiftKey ? -1 : 1); }
      return;
    }
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      commitItem(filtered[activeIndex >= 0 ? activeIndex : 0]);
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); handleClose(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-24 fade-in" onClick={handleClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white/80 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-black/5 border border-white/40" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 mb-3">
          <span className="text-slate-500 text-xl">🔍</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-slate-400 text-slate-800"
            placeholder="Search fields, sections..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKey}
            aria-activedescendant={activeIndex >= 0 ? `global-search-item-${activeIndex}` : undefined}
          />
          <span className="text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50">ESC</span>
        </div>
        <div ref={listRef} className="space-y-1 max-h-[400px] overflow-y-auto custom-scroll">
          {filtered.map((s, idx) => (
            <button
              key={idx}
              id={`global-search-item-${idx}`}
              ref={(el) => { resultRefs.current[idx] = el; }}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              onClick={() => commitItem(s)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${idx === activeIndex ? "bg-gradient-to-r from-sky-50 to-sky-50 border border-sky-100" : "hover:bg-white/50 hover:shadow-sm"}`}
            >
              <span className={`font-semibold ${idx === activeIndex ? "text-sky-700" : "text-slate-700"}`}>{s.label}</span>
              {idx === activeIndex && <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider group-hover:text-sky-600">Hit Enter</span>}
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-4 text-slate-500 text-sm">No results found.</div>}
        </div>
      </div>
    </div>
  );
};
