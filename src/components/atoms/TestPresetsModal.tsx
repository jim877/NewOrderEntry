// @ts-nocheck
import React from "react";
import { Input } from "./Input";
import { OLIVO_SAMPLE_PRESET } from "../../data/olivoSamplePreset";

type TestPreset = { id: string; name: string; createdAt: string; data: any; scopePhotos?: any };

type Props = {
  presetName: string;
  setPresetName: (v: string) => void;
  testPresets: TestPreset[];
  saveTestPreset: () => void;
  loadTestPreset: (preset: TestPreset) => void;
  deleteTestPreset: (id: string) => void;
  clearAllPresets: () => void;
  onClose: () => void;
  // For the built-in Full SDS Sample shortcut:
  setData: (updater: (prev: any) => any) => void;
  setToast: (msg: string) => void;
};

// TestPresetsModal — Settings → Test Data Presets modal. Lets the user save
// the current order shape as a named preset, load any saved preset, delete
// individual presets, clear all, or one-click load the seeded Olivo "Full
// SDS Sample". Pure presentational shell over App-level state + helpers.
export const TestPresetsModal = ({
  presetName, setPresetName,
  testPresets,
  saveTestPreset, loadTestPreset, deleteTestPreset, clearAllPresets,
  onClose, setData, setToast,
}: Props) => (
  <div className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">Test Data Presets</div>
          <div className="text-sm text-sky-100">Save, load, or delete preset data for fast testing.</div>
        </div>
        <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Preset Name</label>
            <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="e.g. Fire Claim - Quick Entry" />
          </div>
          <button onClick={saveTestPreset} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
            Save Preset
          </button>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Built-in Samples</div>
          <button
            onClick={() => {
              setData((prev: any) => ({ ...prev, ...OLIVO_SAMPLE_PRESET() }));
              setToast("Full SDS Sample loaded");
              onClose();
            }}
            className="w-full rounded-lg border border-teal-300 bg-teal-50 px-4 py-3 text-left hover:bg-teal-100 transition-colors"
          >
            <div className="text-sm font-bold text-teal-800">Load Full SDS Sample</div>
            <div className="text-[10px] text-teal-600">Water + Mold loss, hotel stay, elderly + kids + pets, full interview, events, all SDS fields</div>
          </button>
        </div>
        <div className="max-h-64 overflow-auto rounded-xl border border-slate-200">
          {testPresets.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No presets yet.</div>
          ) : (
            <div className="divide-y">
              {testPresets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{preset.name}</div>
                    <div className="text-[11px] text-slate-500">{new Date(preset.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadTestPreset(preset)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Load</button>
                    <button onClick={() => deleteTestPreset(preset.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <button onClick={clearAllPresets} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Delete All Presets</button>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Done</button>
        </div>
      </div>
    </div>
  </div>
);
