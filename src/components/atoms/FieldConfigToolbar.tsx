// @ts-nocheck
import React from "react";

type FieldCfg = { requiredInAudit?: boolean; visible?: boolean; [k: string]: any };

type Props = {
  fieldConfig: Record<string, FieldCfg>;
  setFieldConfig: (updater: (prev: Record<string, FieldCfg>) => Record<string, FieldCfg>) => void;
  selectedKeys: Set<string>;
  setSelectedKeys: (updater: (prev: Set<string>) => Set<string>) => void;
  search: string;
  setSearch: (v: string) => void;
  onResetDefaults: () => void;
  onClose: () => void;
};

// FieldConfigToolbar — sticky header for the Field Configuration page.
// Hosts: title + total-field count, search input, bulk-action chips (only
// visible when one or more fields are selected — Required On/Off, Show/Hide,
// Clear), and the Reset Defaults + Close buttons on the right.
//
// Bulk-action writers patch every selected key with the same field delta,
// so the four chip handlers each call a tiny `patchSelected` closure.
export const FieldConfigToolbar = ({
  fieldConfig, setFieldConfig, selectedKeys, setSelectedKeys,
  search, setSearch, onResetDefaults, onClose,
}: Props) => {
  const patchSelected = (delta: Partial<FieldCfg>) =>
    setFieldConfig((prev) => {
      const next = { ...prev };
      selectedKeys.forEach((k) => { if (next[k]) next[k] = { ...next[k], ...delta }; });
      return next;
    });

  return (
    <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 shadow-sm z-10">
      <span className="text-sm font-bold text-slate-700">Field Configuration</span>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search fields..."
        className="ml-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400 w-48"
      />
      <span className="text-xs text-slate-400">{Object.keys(fieldConfig).length} fields</span>
      <div className="flex-1" />
      {selectedKeys.size > 0 && (
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5">
          <span className="text-xs font-bold text-sky-700">{selectedKeys.size} selected</span>
          <button onClick={() => patchSelected({ requiredInAudit: true })} className="rounded-full border border-sky-300 bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-50">Required: On</button>
          <button onClick={() => patchSelected({ requiredInAudit: false })} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50">Required: Off</button>
          <button onClick={() => patchSelected({ visible: true })} className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">Show</button>
          <button onClick={() => patchSelected({ visible: false })} className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50">Hide</button>
          <button onClick={() => setSelectedKeys(() => new Set())} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
        </div>
      )}
      <button onClick={onResetDefaults} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200">Reset Defaults</button>
      <button onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">Close</button>
    </div>
  );
};
