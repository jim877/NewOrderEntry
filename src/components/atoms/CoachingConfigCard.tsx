// @ts-nocheck
import React from "react";
import { DEFAULT_COACHING, COACHING_CATEGORIES } from "../../config";

type Props = {
  overrides: Record<string, string>;
  setOverrides: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  search: string;
  setSearch: (v: string) => void;
  // Reset triggers a window.confirm in App so the prompt can pull in the
  // matching toast pipeline; atom just notifies.
  onResetAll: () => void;
  onExportAsCode: () => void;
};

// CoachingConfigCard — Settings → Coaching & Help Text panel. Lists every
// coaching key (from DEFAULT_COACHING) grouped by COACHING_CATEGORIES, with
// a per-key textarea that writes to the data._coachingOverrides map. Each
// row shows a Reset button when the user has customized it. Header has
// Export as Code + Reset All; body has a search filter.
export const CoachingConfigCard = ({ overrides, setOverrides, search, setSearch, onResetAll, onExportAsCode }: Props) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between">
      <div>
        <span className="text-sm font-bold text-teal-800">Coaching & Help Text</span>
        <span className="text-xs text-teal-500 ml-2">{Object.keys(DEFAULT_COACHING).length} entries</span>
      </div>
      <div className="flex gap-2">
        <button onClick={onExportAsCode} className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[10px] font-bold text-teal-600 hover:bg-teal-50">Export as Code</button>
        <button onClick={onResetAll} className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[10px] font-bold text-teal-600 hover:bg-teal-50">Reset All</button>
      </div>
    </div>
    <div className="px-4 py-2 border-b border-slate-100">
      <input
        value={search || ""}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search coaching text..."
        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-teal-300 bg-slate-50/50 placeholder:text-slate-400/70"
      />
    </div>
    <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
      {COACHING_CATEGORIES.map((cat) => {
        const searchQ = (search || "").toLowerCase().trim();
        const entries = Object.keys(DEFAULT_COACHING)
          .filter((k) => k.startsWith(cat.prefix))
          .filter((k) => !searchQ || k.toLowerCase().includes(searchQ) || DEFAULT_COACHING[k].toLowerCase().includes(searchQ));
        if (!entries.length) return null;
        const customCount = entries.filter((k) => overrides[k] !== undefined).length;
        return (
          <details key={cat.key}>
            <summary className="px-4 py-2 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none flex items-center justify-between">
              <span>{cat.label} ({entries.length})</span>
              {customCount > 0 && <span className="rounded-full bg-teal-100 text-teal-700 px-2 py-0.5 text-[9px] font-bold">{customCount} customized</span>}
            </summary>
            <div className="divide-y divide-slate-50">
              {entries.map((key) => {
                const defaultVal = DEFAULT_COACHING[key];
                const currentVal = overrides[key] !== undefined ? overrides[key] : defaultVal;
                const isCustom = overrides[key] !== undefined;
                const shortKey = key.replace(cat.prefix, "");
                return (
                  <div key={key} className={`px-4 py-2 space-y-1 ${isCustom ? "bg-teal-50/30" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700">{shortKey}</span>
                      {isCustom && (
                        <button
                          onClick={() => setOverrides((prev) => { const next = { ...prev }; delete next[key]; return next; })}
                          className="text-[9px] font-bold text-teal-500 hover:text-teal-700"
                        >Reset</button>
                      )}
                    </div>
                    <textarea
                      value={currentVal}
                      onChange={(e) => setOverrides((prev) => ({ ...prev, [key]: e.target.value }))}
                      rows={2}
                      className={`w-full rounded border px-2 py-1 text-[11px] text-slate-700 outline-none resize-none ${isCustom ? "border-teal-300 bg-white" : "border-slate-200 bg-slate-50/50"} focus:border-teal-400`}
                    />
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  </div>
);
