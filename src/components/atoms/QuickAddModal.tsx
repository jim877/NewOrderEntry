// @ts-nocheck
import React from "react";
import { Input } from "./Input";

type Props = {
  type: string;           // e.g. "company" / "contact" — capitalized in the title
  value: string;
  setValue: (v: string) => void;
  onSave: () => void;     // parent handles the save side effects (registry add + modal.onSave)
  onClose: () => void;
};

// QuickAddModal — generic "Add New X" mini modal driven by the App-level
// `modal` state. Single-input form, Cancel/Save footer. Parent owns what
// happens on Save (company-registry append, original onSave callback) so
// the atom stays presentational.
export const QuickAddModal = ({ type, value, setValue, onSave, onClose }: Props) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 fade-in">
      <h3 className="mb-4 text-lg font-bold text-slate-900 capitalize">Add New {type}</h3>
      <Input
        autoFocus
        placeholder={`Enter ${type} name...`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end gap-3 mt-4">
        <button className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50" onClick={onClose}>Cancel</button>
        <button className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-600" onClick={onSave}>Save</button>
      </div>
    </div>
  </div>
);
