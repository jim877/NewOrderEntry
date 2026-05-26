// @ts-nocheck
import React from "react";
import { buildNarrativeProse } from "../../utils/narrativeProse";

type NarrativeLine = { section: string; text: string };
type Props = {
  orderNarrative: NarrativeLine[];
  saveExportLines: string[];
  data: any;
  previewView: "narrative" | "table" | "fields";
  setPreviewView: (v: "narrative" | "table" | "fields") => void;
};

// Narrow tab pill — same styling for all three preview views.
const tabClass = (active: boolean) =>
  `rounded-full px-3 py-1 text-[10px] font-bold border ${
    active ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-400 hover:border-slate-300"
  }`;

// SaveSummaryPreview — the Narrative / Table / All Fields switcher inside the
// Save Summary modal. Pure presentational component with no internal state
// beyond what the parent passes; the parent owns previewView so the choice
// persists across reopens.
export const SaveSummaryPreview = ({
  orderNarrative,
  saveExportLines,
  data,
  previewView,
  setPreviewView,
}: Props) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <button type="button" onClick={() => setPreviewView("narrative")} className={tabClass(previewView === "narrative")}>Narrative</button>
      <button type="button" onClick={() => setPreviewView("table")} className={tabClass(previewView === "table")}>Table</button>
      <button type="button" onClick={() => setPreviewView("fields")} className={tabClass(previewView === "fields")}>All Fields</button>
    </div>
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
      {orderNarrative.length === 0 ? (
        <div className="text-sm text-slate-400 italic">No data entered yet.</div>
      ) : previewView === "narrative" ? (
        <div className="text-sm leading-relaxed text-slate-700 space-y-2">
          {buildNarrativeProse(orderNarrative, data).map((t, i) => <p key={i}>{t}</p>)}
        </div>
      ) : previewView === "table" ? (
        <div className="space-y-1.5">
          {orderNarrative.map((line, idx) => (
            <div key={idx} className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0 text-right">{line.section}</span>
              <span className="text-sm text-slate-700">{line.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-700 space-y-1 max-h-[320px] overflow-y-auto custom-scroll">
          {saveExportLines.length === 0 ? (
            <div className="text-slate-400">No fields entered yet.</div>
          ) : (
            saveExportLines.map((l, idx) => <div key={`${l}-${idx}`}>{l}</div>)
          )}
        </div>
      )}
    </div>
  </div>
);
