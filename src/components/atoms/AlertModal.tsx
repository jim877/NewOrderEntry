// @ts-nocheck
import React from "react";

type AlertModalState = {
  isOpen: boolean;
  title?: string;
  message?: any;
  details?: any[];
  confirmLabel?: string;
  dismissLabel?: string;
  onConfirm?: (() => void) | null;
};

type Props = {
  state: AlertModalState;
  onClose: () => void;
  // Parent owns the message/detail renderers so embedded inline-link content
  // (e.g. links to contacts/companies) stays consistent with surrounding UI.
  renderMessage: (message: any, title?: string) => React.ReactNode;
  renderDetail: (detail: any) => React.ReactNode;
};

// AlertModal — generic confirmation/alert sheet driven by createAlertModalState
// (see src/utils/modalState). Renders title + message + optional bullet
// details + a dismiss / confirm footer. The two-button case fires onConfirm
// from the modal state when the primary button is clicked.
export const AlertModal = ({ state, onClose, renderMessage, renderDetail }: Props) => (
  <div className="fixed inset-0 z-[129] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{state.title || "Alert"}</h3>
      </div>
      <div className="p-6 space-y-4">
        {state.message ? (
          <p className="text-sm text-slate-700">{renderMessage(state.message, state.title)}</p>
        ) : null}
        {state.details?.length ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <ul className="space-y-1 text-sm text-slate-700">
              {state.details.map((detail, index) => (
                <li key={`alert-detail-${index}`}>• {renderDetail(detail)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>
          {state.onConfirm ? (state.dismissLabel || "Cancel") : (state.dismissLabel || "Close")}
        </button>
        {state.onConfirm ? (
          <button
            className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
            onClick={() => {
              const action = state.onConfirm;
              onClose();
              action?.();
            }}
          >
            {state.confirmLabel || "Confirm"}
          </button>
        ) : null}
      </div>
    </div>
  </div>
);
