// @ts-nocheck
import React from "react";

type SmartConfirmState = {
  isOpen: boolean;
  title?: string;
  message?: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
};

type Props = {
  state: SmartConfirmState;
  onResolve: (accepted: boolean) => void;
};

// SmartConfirmModal — confirm sheet driven by createSmartConfirmState (see
// src/utils/modalState). Used by the smart-update flow (e.g. "we'd like to
// remove these items because a condition flag turned off; keep them?").
// Title + optional message + bullet details + Keep/Remove footer. Parent
// owns resolveSmartConfirm, which queues the appropriate side effect from
// the modal state.
export const SmartConfirmModal = ({ state, onResolve }: Props) => (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="bg-sky-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white">{state.title || "Confirm Smart Update"}</h3>
      </div>
      <div className="p-6 space-y-3">
        {state.message && <p className="text-sm text-slate-700">{state.message}</p>}
        {state.details?.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <ul className="space-y-1 text-sm text-slate-700">
              {state.details.map((detail, index) => (
                <li key={`${detail}-${index}`}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
        <button
          className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          onClick={() => onResolve(false)}
        >
          {state.cancelLabel || "Keep"}
        </button>
        <button
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-orange-600"
          onClick={() => onResolve(true)}
        >
          {state.confirmLabel || "Remove"}
        </button>
      </div>
    </div>
  </div>
);
