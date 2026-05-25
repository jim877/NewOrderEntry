// @ts-nocheck
import React from "react";
import { AUDIT_STATUS_GATES } from "../../config";

type Section = { id: string; label: string };

type FieldCfg = {
  label: string;
  category: string;
  visible?: boolean;
  requiredInAudit?: boolean;
  requiredAtStatus?: string;
  selectType?: "multi" | "single";
  coaching?: string;
  condition?: any;
  _coachingOpen?: boolean;
};

type Props = {
  sections: Section[];
  fieldConfig: Record<string, FieldCfg>;
  setFieldConfig: (updater: (prev: Record<string, FieldCfg>) => Record<string, FieldCfg>) => void;
  selectedKeys: Set<string>;
  setSelectedKeys: (updater: (prev: Set<string>) => Set<string>) => void;
  search: string;
};

// FieldConfigGrid — Settings → Field Configuration main grid. Iterates over
// FIELD_CONFIG_SECTIONS and renders a card per section with one row per
// field. Each row has a per-field selection checkbox, Visible/Hidden toggle,
// Required/Optional toggle, requiredAtStatus picker (AUDIT_STATUS_GATES),
// optional Multi/Single selectType toggle, an inline coaching editor (opens
// via the 🎓 icon), and the field key shown as monospace for reference.
// Section header has an "all in this section" checkbox.
export const FieldConfigGrid = ({ sections, fieldConfig, setFieldConfig, selectedKeys, setSelectedKeys, search }: Props) => {
  const searchLower = (search || "").toLowerCase().trim();

  // Atom-local writer used by every field-row mutation.
  const patchField = (key: string, patch: Partial<FieldCfg>) =>
    setFieldConfig((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  return (
    <>
      {sections.map((section) => {
        const keys = Object.keys(fieldConfig).filter((k) => {
          if (fieldConfig[k].category !== section.id) return false;
          if (!searchLower) return true;
          return (
            fieldConfig[k].label.toLowerCase().includes(searchLower) ||
            k.toLowerCase().includes(searchLower) ||
            (fieldConfig[k].coaching || "").toLowerCase().includes(searchLower)
          );
        });
        if (!keys.length) return null;
        const allSelected = keys.every((k) => selectedKeys.has(k));

        return (
          <div key={section.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => {
                  setSelectedKeys((prev) => {
                    const next = new Set(prev);
                    if (allSelected) keys.forEach((k) => next.delete(k));
                    else keys.forEach((k) => next.add(k));
                    return next;
                  });
                }}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-bold text-slate-700">{section.label}</span>
              <span className="text-xs text-slate-400">{keys.length} fields</span>
            </div>
            <div className="divide-y divide-slate-100">
              {keys.map((key) => {
                const cfg = fieldConfig[key];
                const selected = selectedKeys.has(key);
                return (
                  <React.Fragment key={key}>
                    <div className={`flex items-center gap-3 px-4 py-2 text-sm ${!cfg.visible ? "bg-slate-50/50 opacity-60" : ""}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          setSelectedKeys((prev) => {
                            const next = new Set(prev);
                            next.has(key) ? next.delete(key) : next.add(key);
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-700 w-44 truncate" title={key}>{cfg.label}</span>
                      <button
                        onClick={() => patchField(key, { visible: !cfg.visible })}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.visible ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"}`}
                      >{cfg.visible ? "Visible" : "Hidden"}</button>
                      <button
                        onClick={() => patchField(key, { requiredInAudit: !cfg.requiredInAudit })}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.requiredInAudit ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-400"}`}
                      >{cfg.requiredInAudit ? "Required" : "Optional"}</button>
                      <select
                        value={cfg.requiredAtStatus || "always"}
                        onChange={(e) => patchField(key, { requiredAtStatus: e.target.value })}
                        className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 bg-white"
                      >
                        {AUDIT_STATUS_GATES.map((g) => (
                          <option key={g} value={g}>{g === "always" ? "Always" : g === "never" ? "Never" : g}</option>
                        ))}
                      </select>
                      {cfg.selectType && (
                        <button
                          onClick={() => patchField(key, { selectType: cfg.selectType === "multi" ? "single" : "multi" })}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.selectType === "multi" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-400"}`}
                        >{cfg.selectType === "multi" ? "Multi" : "Single"}</button>
                      )}
                      {cfg.condition && (
                        <span className="text-[9px] text-slate-400 truncate" title={JSON.stringify(cfg.condition)}>Conditional</span>
                      )}
                      <button
                        onClick={() => patchField(key, { _coachingOpen: !cfg._coachingOpen })}
                        className={`text-[10px] ${cfg.coaching ? "text-violet-500" : "text-slate-300"} hover:text-violet-600`}
                        title={cfg.coaching || "Add coaching text"}
                      >🎓</button>
                      <div className="flex-1" />
                      <span className="text-[9px] text-slate-300 font-mono">{key}</span>
                    </div>
                    {cfg._coachingOpen && (
                      <div className="px-4 pb-2 flex items-start gap-2">
                        <span className="text-[10px] text-violet-500 shrink-0 pt-1">🎓</span>
                        <input
                          value={cfg.coaching || ""}
                          onChange={(e) => patchField(key, { coaching: e.target.value })}
                          placeholder="Enter coaching guidance for this field..."
                          className="flex-1 rounded border border-violet-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-violet-400 bg-violet-50/30"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
