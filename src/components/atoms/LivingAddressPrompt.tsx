// @ts-nocheck
import React from "react";

type Props = {
  type: string; // e.g. "Hotel" / "Rental" / "Temp"
  onClose: () => void;
  onCreatePlaceholder: () => void;
  onEnterAddressNow: () => void;
};

// LivingAddressPrompt — small confirmation modal that fires when the user
// picks a living situation that has no corresponding address on the order
// yet (e.g. selecting Hotel before adding the hotel address). Three exits:
// Not Now (close), Create Placeholder (add a TBD entry), Enter Address Now
// (open the address form).
export const LivingAddressPrompt = ({ type, onClose, onCreatePlaceholder, onEnterAddressNow }: Props) => (
  <div className="fixed inset-0 z-[109] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Add {type} Address?</h3>
      <div className="text-sm text-slate-600 mb-4">
        No <span className="font-semibold">{type}</span> address exists yet.
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Not Now</button>
        <button type="button" onClick={onCreatePlaceholder} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Create Placeholder</button>
        <button type="button" onClick={onEnterAddressNow} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600">Enter Address Now</button>
      </div>
    </div>
  </div>
);
