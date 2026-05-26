// @ts-nocheck
import React from "react";
import { LOADING_CATEGORIES } from "../../config";
import { TRIGGER_TYPES, matchLoadTargets } from "../../utils/loadTargets";
import type { LoadTarget } from "../../config";

type Props = {
  targets: LoadTarget[];
  saveTargets: (next: LoadTarget[]) => void;
  // For the per-row "Auto-matched" pill — caller passes the full order data
  // so we can resolve each target's triggers against the current state.
  data: any;
  onAddTarget: () => void;
  onResetAll: () => void;
};

// LoadingListConfigCard — Settings → Loading List (What to Bring) panel.
// Lists each target grouped by category (Equipment / Packing / PPE / ...),
// per-row label + category + triggers editor + delete. Each trigger is a
// (type, value) pair drawn from TRIGGER_TYPES. The Auto-matched pill fires
// when the target's triggers resolve against the current order data.
export const LoadingListConfigCard = ({ targets, saveTargets, data, onAddTarget, onResetAll }: Props) => {
  const updateTarget = (id: string, patch: Partial<LoadTarget>) =>
    saveTargets(targets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTarget = (id: string) => saveTargets(targets.filter((t) => t.id !== id));
  const categories = Array.from(new Set(targets.map((t) => t.category)));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-amber-800">Loading List (What to Bring)</span>
          <span className="text-xs text-amber-500 ml-2">{targets.length} targets</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onAddTarget} className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-bold text-amber-600 hover:bg-amber-50">+ Add Target</button>
          <button onClick={onResetAll} className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-bold text-amber-600 hover:bg-amber-50">Reset</button>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {categories.map((cat) => (
          <details key={cat} open>
            <summary className="px-4 py-2 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none">
              {cat} ({targets.filter((t) => t.category === cat).length})
            </summary>
            <div className="divide-y divide-slate-50">
              {targets.filter((t) => t.category === cat).map((t) => {
                const auto = matchLoadTargets(data, [t]).length > 0;
                return (
                  <div key={t.id} className="px-4 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input value={t.label} onChange={(e) => updateTarget(t.id, { label: e.target.value })} className="flex-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-amber-400" />
                      <select value={t.category} onChange={(e) => updateTarget(t.id, { category: e.target.value })} className="rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-600 bg-white">
                        {LOADING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {auto && <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-bold">Auto-matched</span>}
                      <button onClick={() => removeTarget(t.id)} className="text-[10px] font-bold text-rose-400 hover:text-rose-600 px-1">×</button>
                    </div>
                    <div className="pl-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Triggers ({(t.triggers || []).length})</div>
                      <div className="space-y-1">
                        {(t.triggers || []).map((tr: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <select value={tr.type} onChange={(e) => { const next = [...(t.triggers || [])]; next[idx] = { ...tr, type: e.target.value as any }; updateTarget(t.id, { triggers: next }); }} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 bg-white">
                              {TRIGGER_TYPES.map((tt) => <option key={tt.type} value={tt.type}>{tt.label}</option>)}
                            </select>
                            <input value={tr.value} onChange={(e) => { const next = [...(t.triggers || [])]; next[idx] = { ...tr, value: e.target.value }; updateTarget(t.id, { triggers: next }); }} placeholder="value" className="flex-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 outline-none focus:border-amber-400" />
                            <button onClick={() => { const next = (t.triggers || []).filter((_: any, i: number) => i !== idx); updateTarget(t.id, { triggers: next }); }} className="text-[10px] text-rose-400 hover:text-rose-600 px-1">×</button>
                          </div>
                        ))}
                        <button onClick={() => updateTarget(t.id, { triggers: [...(t.triggers || []), { type: "packout", value: "" }] })} className="text-[10px] font-bold text-amber-600 hover:text-amber-800">+ Add trigger</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
