// @ts-nocheck
import React from "react";
import { Lock, LockOpen } from "lucide-react";
import { AssignmentCueStrip } from "./AssignmentCueStrip";

// LinkedAssignmentPanel — read-mostly card showing values pulled from a linked source.
// Toggles between locked (sourced from elsewhere) and unlocked (overridden for this order).
export const LinkedAssignmentPanel = ({
  title = "Linked Assignment",
  helperText = "",
  values = [],
  cues = [],
  headerBadge = "",
  locked = true,
  onToggleLock,
}) => {
  const Icon = locked ? Lock : LockOpen;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {locked ? title : `${title} Unlocked`}
          </div>
          {locked && headerBadge ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {headerBadge}
              </span>
            </div>
          ) : null}
          <div className="mt-1 text-[11px] text-slate-500">
            {locked ? helperText : "Unlocked for this order. Change these fields only if this section should be different."}
          </div>
        </div>
        {onToggleLock ? (
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
          >
            {locked ? "Unlock" : "Lock"}
          </button>
        ) : null}
      </div>
      {cues.length ? (
        <div className="mt-3">
          <AssignmentCueStrip items={cues} />
        </div>
      ) : null}
      {values.length ? (
        <div className={`mt-3 grid gap-3 ${values.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {values.map((item) => (
            <div key={`linked-assignment-${title}-${item.label}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{item.value || "Not assigned"}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
