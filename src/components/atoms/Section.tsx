// @ts-nocheck
import React from "react";
import { Chevron } from "./Chevron";

// Section — collapsible top-level section card with title, helpText, badges, and a caret.
// `onHeaderClick`/`onCaretClick` allow overriding the toggle behavior (e.g. scroll-to-section vs collapse).
export const Section = ({ id, title, helpText, isOpen, onToggle, onHeaderClick, onCaretClick, children, badges, className, compact, noeSection }) => {
  const handleHeaderClick = () => {
    if (onHeaderClick) { onHeaderClick(); return; }
    onToggle?.();
  };
  const handleCaretClick = () => {
    if (onCaretClick) { onCaretClick(); return; }
    onToggle?.();
  };
  return (
    <div
      id={id}
      data-noe-section={noeSection || id || undefined}
      data-noe-open={isOpen}
      className={`mb-0 overflow-hidden rounded-none border-y border-slate-200 bg-white shadow-sm transition-shadow duration-300 scroll-mt-28 sm:mb-4 sm:rounded-xl sm:border ${isOpen ? "ring-1 ring-sky-500/20 shadow-md" : ""} ${className || ""}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 text-left font-semibold text-slate-800 transition-colors cursor-pointer ${compact ? "section-header-tight" : ""} ${isOpen ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50"}`}
        onClick={handleHeaderClick}
      >
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center text-left"
          onClick={(e) => { e.stopPropagation(); handleHeaderClick(); }}
          aria-expanded={isOpen}
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${isOpen ? "text-slate-900" : "text-slate-700"}`}>{title}</span>
              {badges}
            </div>
            {helpText && <div className="mt-1 text-[11px] text-slate-500">{helpText}</div>}
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleCaretClick(); }}
          className="ml-2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
          aria-label={isOpen ? "Collapse section" : "Expand section"}
        >
          <Chevron open={isOpen} />
        </button>
      </div>
      {isOpen && <div className={`border-t border-slate-100 ${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"} fade-in`}>{children}</div>}
    </div>
  );
};
