// @ts-nocheck
import React from "react";
import { Input } from "./Input";

// SettingsMenu — gear dropdown panel anchored at the top-right of the Header.
// Toggles coaching/density/toasts, navigation links to Scope/SDS/presets, clear-data, user name.
export const SettingsMenu = ({
  showCoaching, setShowCoaching,
  compactMode, setCompactMode,
  onShowSds, onShowScopeWizard,
  onReset, setShowSampleDataModal, onOpenPresets, presetCount,
  onOpenFieldConfig, currentUser, setCurrentUser, onClose,
}) => {
  const toastsOff = typeof window !== "undefined" && window.localStorage?.getItem("noe-action-toasts") === "off";
  const toggleToasts = () => {
    const current = window.localStorage.getItem("noe-action-toasts") !== "off";
    window.localStorage.setItem("noe-action-toasts", current ? "off" : "on");
    window.dispatchEvent(new Event("storage"));
    setShowCoaching(showCoaching); // force re-render
  };
  return (
    <div className="absolute right-0 top-10 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
      <button
        onClick={() => setShowCoaching(!showCoaching)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${showCoaching ? "bg-violet-50 text-violet-600" : "hover:bg-slate-50 text-slate-600"}`}
      >
        <span>🎓 Coaching</span>
        <span>{showCoaching ? "On" : "Off"}</span>
      </button>
      <button
        onClick={() => setCompactMode(!compactMode)}
        className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${compactMode ? "bg-rose-50 text-rose-600" : "hover:bg-slate-50 text-slate-600"}`}
      >
        <span>Density</span>
        <span>{compactMode ? "Compact" : "Comfortable"}</span>
      </button>
      <button
        onClick={toggleToasts}
        className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${toastsOff ? "hover:bg-slate-50 text-slate-400" : "bg-teal-50 text-teal-600"}`}
      >
        <span>Action Toasts</span>
        <span>{toastsOff ? "Off" : "On"}</span>
      </button>
      <div className="mt-1 pt-1 border-t border-slate-100">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Navigate</div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 mx-2 mb-1">
          <button className="flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold bg-white text-sky-700 shadow-sm text-center">Order</button>
          <button onClick={() => { onShowScopeWizard?.(); onClose?.(); }} className="flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all text-center">Scope</button>
          <button onClick={() => { onShowSds?.(); onClose?.(); }} className="flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all text-center">SDS</button>
        </div>
      </div>
      <button onClick={onReset} className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-rose-50 text-rose-600">
        <span>Clear Data</span><span>↺</span>
      </button>
      <button onClick={() => setShowSampleDataModal?.(true)} className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600">
        <span>Sample Data</span><span>▤</span>
      </button>
      <button onClick={onOpenPresets} className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600">
        <span>Test Data Presets</span><span>{presetCount ? `(${presetCount})` : "▤"}</span>
      </button>
      <button onClick={() => { onShowScopeWizard?.(); onClose?.(); }} className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-blue-50 text-blue-600">
        <span>Scope Wizard</span><span>⬡</span>
      </button>
      <button onClick={onOpenFieldConfig} className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600">
        <span>Field Configuration</span><span>⚙</span>
      </button>
      <div className="mt-2 px-3 py-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Current User</label>
        <Input value={currentUser || ""} onChange={(e) => setCurrentUser(e.target.value)} placeholder="Name" className="mt-1 !py-1.5 !text-xs" />
      </div>
      <button onClick={onClose} className="w-full mt-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">Close</button>
    </div>
  );
};
