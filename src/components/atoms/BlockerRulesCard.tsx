// @ts-nocheck
import React from "react";

type Rule = { id: string; enabled?: boolean; blockerText: string; trigger: string };

type Props = {
  rules: Rule[];
  setRules: (updater: (prev: Rule[]) => Rule[]) => void;
};

// BlockerRulesCard — Settings → Auto-Blocker Rules panel. Read-only-shaped
// list of rules with one per-row toggle (Enabled / Disabled). Rule
// definitions themselves are config-driven; this card just lets users mute
// individual rules without removing them from the system.
export const BlockerRulesCard = ({ rules, setRules }: Props) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
      <span className="text-sm font-bold text-slate-700">Auto-Blocker Rules</span>
    </div>
    <div className="divide-y divide-slate-100">
      {rules.map((rule, idx) => (
        <div key={rule.id} className="flex items-center gap-3 px-4 py-2">
          <button
            onClick={() => setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: !r.enabled } : r)))}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${rule.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-400"}`}
          >{rule.enabled ? "Enabled" : "Disabled"}</button>
          <span className="text-xs font-semibold text-slate-700">{rule.blockerText}</span>
          <span className="text-[10px] text-slate-400 flex-1">{rule.trigger}</span>
        </div>
      ))}
    </div>
  </div>
);
