// @ts-nocheck
import React from "react";

type MissingItem = { key?: string; label?: string; [k: string]: any };

type Props = {
  pendingIssues: string[];
  missing: MissingItem[];
  missingOpen: boolean;
  setMissingOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
};

// SaveSummaryGates — the two warning blocks at the top of the Save Summary
// modal: an always-expanded Open Blockers list (only renders when blockers
// exist) and a collapsible Missing Fields list (only renders when there
// are missing fields). Both are rose-themed because they represent
// preconditions the user may want to address before saving.
export const SaveSummaryGates = ({ pendingIssues, missing, missingOpen, setMissingOpen }: Props) => (
  <>
    {pendingIssues.length > 0 && (
      <div className="rounded-lg border border-rose-200 bg-rose-50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-rose-200/60 text-sm font-bold text-rose-700">
          Open Blockers ({pendingIssues.length})
        </div>
        <ul className="list-disc pl-8 pr-4 py-2 text-sm text-rose-700 space-y-0.5">
          {pendingIssues.map((b, i) => <li key={`blk-${i}`}>{b}</li>)}
        </ul>
      </div>
    )}
    {missing.length > 0 && (
      <div className="rounded-lg border border-rose-200 bg-rose-50 overflow-hidden">
        <button type="button" onClick={() => setMissingOpen((v: boolean) => !v)} className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-rose-100/50">
          <div className="text-sm font-bold text-rose-700">Missing Fields ({missing.length})</div>
          <span className="text-rose-400 text-xs">{missingOpen ? "▾" : "▸"}</span>
        </button>
        {missingOpen && (
          <div className="px-4 pb-3">
            <ul className="list-disc pl-5 text-sm text-rose-700">
              {missing.map((m, idx) => (
                <li key={`${m.key}-${idx}`}>{m.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </>
);
