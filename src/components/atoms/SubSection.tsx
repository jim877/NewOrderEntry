// @ts-nocheck
import React from "react";

// SubSection — collapsible card with a title row and optional action button.
// Click the title to toggle; the `action` slot doesn't propagate clicks to the toggle.
export const SubSection = ({ id, title, open, onToggle, children, compact, className, action }) => {
  const handleToggle = () => onToggle?.(!open);
  return (
    <div
      id={id}
      data-noe-subsection={id || undefined}
      data-noe-open={open}
      className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-5"} shadow-sm scroll-mt-28 ${className || ""}`}
    >
      <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={handleToggle}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="flex flex-1 items-center justify-between text-left"
          aria-expanded={open}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">{title}</span>
          <span className="text-slate-400 text-lg">{open ? "▾" : "›"}</span>
        </button>
        {action && (
          <div data-subsection-action="true" onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}
      </div>
      {open && <div className={`mt-4 ${compact ? "space-y-3" : "space-y-4"} fade-in`}>{children}</div>}
    </div>
  );
};
