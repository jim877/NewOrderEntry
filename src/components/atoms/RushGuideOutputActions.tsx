// @ts-nocheck
// "Share & Apply" panel at the bottom of the Rush Guide Results.
// Four output actions: Full Guide copy, Rush-only copy, Add to Pickup
// Event Instructions, and Apply & Close. Each action is handled by a
// callback from App.tsx so this atom stays free of order-data
// mutations.

import React from "react";

type Props = {
  onCopyFull: () => void;
  onCopyRushOnly: () => void;
  onAddToPickupEvent: () => void;
  onApplyAndClose: () => void;
};

export const RushGuideOutputActions: React.FC<Props> = ({
  onCopyFull,
  onCopyRushOnly,
  onAddToPickupEvent,
  onApplyAndClose,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Share &amp; Apply</div>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={onCopyFull}
        className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 text-left"
      >
        <div className="text-sm">Full Guide</div>
        <div className="text-[10px] text-slate-400 font-normal">Copy complete guide for email/text to customer</div>
      </button>
      <button
        onClick={onCopyRushOnly}
        className="rounded-xl border border-teal-300 bg-white px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50 text-left"
      >
        <div className="text-sm">Rush Only</div>
        <div className="text-[10px] text-slate-400 font-normal">Copy rush items only — send to customer for review</div>
      </button>
      <button
        onClick={onAddToPickupEvent}
        className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 text-left"
      >
        <div className="text-sm">Add to Pickup Event</div>
        <div className="text-[10px] text-slate-400 font-normal">Add checklists to event instructions for crew review</div>
      </button>
      <button
        onClick={onApplyAndClose}
        className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 text-left"
      >
        <div className="text-sm">Apply &amp; Close</div>
        <div className="text-[10px] text-teal-200 font-normal">Apply suggested groups to order and close</div>
      </button>
    </div>
  </div>
);
