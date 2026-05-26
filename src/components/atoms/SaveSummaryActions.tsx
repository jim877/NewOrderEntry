// @ts-nocheck
import React from "react";

type Props = {
  // The four buttons each compose their text from these helpers; the
  // composition stays at the call site (where buildNarrativeProse +
  // composeEventInstructions + stripEventSystemLines live) so this atom
  // is purely presentational.
  onCopyNlt: () => void;
  onCopyNarrative: () => void;
  onDownloadSummary: () => void;
  onSendToEventInstructions: () => void;
};

// SaveSummaryActions — the row of action chips under the Save Summary
// preview: Copy as NLT (filled sky), Copy Narrative / Download Summary /
// Send to Event Instructions (outline slate). Parent owns each handler so
// the composition logic (NLT prefix, narrative prose, ICS-aware merge with
// existing event instructions) stays at the call site where the
// dependencies are visible.
export const SaveSummaryActions = ({
  onCopyNlt, onCopyNarrative, onDownloadSummary, onSendToEventInstructions,
}: Props) => (
  <div className="flex flex-wrap gap-2">
    <button
      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100"
      onClick={onCopyNlt}
    >Copy as NLT</button>
    <button
      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
      onClick={onCopyNarrative}
    >Copy Narrative</button>
    <button
      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
      onClick={onDownloadSummary}
    >Download Summary</button>
    <button
      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
      onClick={onSendToEventInstructions}
    >Send to Event Instructions</button>
  </div>
);
