// @ts-nocheck
import React, { useState } from "react";
import { Field } from "./Field";
import { SALES_REPS, DEFAULT_COACHING } from "../../config";
import { getRepInitials } from "../../utils/names";

// SalesRepSelector — when no rep is auto-assigned, show an avatar dropdown to pick from
// SALES_REPS. Warns if the referrer has a known rep different from the selection.
export const SalesRepSelector = ({ salesRep, setSalesRep, referrerRep, showInlineHelp }) => {
  const [repMenuOpen, setRepMenuOpen] = useState(false);
  return (
    <>
      <Field label="Sales Rep" className="max-w-[200px]">
        <div className="relative inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRepMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200 hover:bg-sky-50"
            title={salesRep || "Select sales rep"}
          >
            {getRepInitials(salesRep || "?")}
          </button>
          {!salesRep && <span className="text-xs text-slate-400">Select rep</span>}
          {repMenuOpen && (
            <div className="absolute top-12 left-0 z-50 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
              {SALES_REPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    if (referrerRep && r !== referrerRep && !window.confirm(`The assigned rep for this referrer is "${referrerRep}". Switch to "${r}" anyway?`)) return;
                    setSalesRep(r);
                    setRepMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${salesRep === r ? "text-sky-700 font-semibold" : r === referrerRep ? "text-teal-700 font-semibold" : "text-slate-700"}`}
                >
                  {r}
                </button>
              ))}
              <button type="button" onClick={() => { setSalesRep(""); setRepMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50">
                Clear
              </button>
            </div>
          )}
        </div>
      </Field>
      {referrerRep && salesRep && salesRep !== referrerRep && (
        <div className="text-[10px] text-amber-600 font-semibold mt-1">Referrer's rep is {referrerRep}</div>
      )}
      {showInlineHelp && !referrerRep && (
        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
          <span className="flex-1">{DEFAULT_COACHING["field.salesRep"]}</span>
          <button type="button" onClick={(e) => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
        </div>
      )}
    </>
  );
};
