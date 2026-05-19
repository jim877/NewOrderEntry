// @ts-nocheck
import React from "react";

// AssignmentCueStrip — horizontal row of muted pill chips used to show context cues
// (e.g. assigned-from labels) without competing visually with primary controls.
export const AssignmentCueStrip = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={`assignment-cue-${item}`}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
        >
          {item}
        </span>
      ))}
    </div>
  );
};
