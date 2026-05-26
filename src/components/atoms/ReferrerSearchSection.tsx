// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { SearchSelect } from "./SearchSelect";

// ReferrerSearchSection — referrer combobox + best-match hint, or read-only display when set.
// `applyReferrerValue` is the parent's commit handler; `bestMatch` is precomputed.
export const ReferrerSearchSection = ({
  data, auditOn, referrerDisplayValue, combinedContactOptions, referrerBestMatch,
  applyReferrerValue, setReferrerQuery, ensureReferrerFromQuery,
  updateMany, setToast, onAddNewToSystem,
}) => (
  <Field
    label="Referrer (Contact or Company)"
    action={referrerDisplayValue ? (
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Remove ${referrerDisplayValue} as referrer? This will also clear any linked roles (Bill To, Insurance, Sales Rep).`)) {
            updateMany({ referrer: "", referringCompany: "", salesRep: "" });
            setToast?.("Referrer removed");
          }
        }}
        className="text-[10px] font-bold text-slate-400 hover:text-rose-500"
      >Remove</button>
    ) : null}
  >
    {referrerDisplayValue ? (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <span className="text-sm font-semibold text-slate-700">{referrerDisplayValue}</span>
      </div>
    ) : (
      <div className="max-w-sm">
        <SearchSelect
          data-audit-key="referrer"
          className={auditOn && data.highlightMissing?.referrer ? "audit-missing" : ""}
          value=""
          onChange={(v) => applyReferrerValue(v)}
          onQueryChange={(v) => setReferrerQuery(v)}
          options={combinedContactOptions}
          placeholder="Type contact or company..."
          onBlur={() => ensureReferrerFromQuery()}
          onAddNew={(name) => {
            if (!onAddNewToSystem) return;
            const nameParts = (name || "").trim().split(/\s+/);
            onAddNewToSystem({
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              source: "referrer",
            });
          }}
        />
        {referrerBestMatch && referrerBestMatch !== referrerDisplayValue && (
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
            <span>Top match:</span>
            <button onClick={() => applyReferrerValue(referrerBestMatch)} className="font-semibold text-slate-600 hover:text-sky-700">
              {referrerBestMatch}
            </button>
            <span>(press Enter or Tab)</span>
          </div>
        )}
      </div>
    )}
  </Field>
);
