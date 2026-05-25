// @ts-nocheck
// "Review & Save" modal — wraps the existing SaveSummaryGates +
// SaveSummaryPreview + SaveSummaryActions + OutboundActionsPanel
// atoms with the dialog chrome (header strip + body scroll + footer
// buttons). Each footer button is a callback so the atom doesn't
// reach into App's setters directly.

import React from "react";
import { SaveSummaryGates } from "./SaveSummaryGates";
import { SaveSummaryPreview } from "./SaveSummaryPreview";
import { SaveSummaryActions } from "./SaveSummaryActions";
import { OutboundActionsPanel } from "./OutboundActionsPanel";

type Props = {
  data: any;
  scopeBridgeState: any;
  orderNarrative: any[];
  saveSummaryMissing: any[];
  saveMissingOpen: boolean;
  setMissingOpen: (open: boolean) => void;
  saveExportLines: string[];
  previewView: string;
  setPreviewView: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  onSaveAndScope: () => void;
  recordWord: string;
  onCopyNlt: () => void;
  onCopyNarrative: () => void;
  onDownloadSummary: () => void;
  onSendToEventInstructions: () => void;
  setQueuedOutbound: (next: any[]) => void;
  setDismissedOutbound: (next: any[]) => void;
};

export const SaveSummaryModal: React.FC<Props> = ({
  data,
  scopeBridgeState,
  orderNarrative,
  saveSummaryMissing,
  saveMissingOpen,
  setMissingOpen,
  saveExportLines,
  previewView,
  setPreviewView,
  onClose,
  onSave,
  onSaveAndScope,
  recordWord,
  onCopyNlt,
  onCopyNarrative,
  onDownloadSummary,
  onSendToEventInstructions,
  setQueuedOutbound,
  setDismissedOutbound,
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col">
      <div className="bg-sky-500 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xl font-bold text-white">Review &amp; Save</h3>
          <div className="text-sky-100 text-xs mt-0.5">
            {orderNarrative.length} details captured
            {data.orderName ? ` — ${data.orderName}` : ""}
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-lg font-bold">
          ✕
        </button>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto custom-scroll flex-1">
        <SaveSummaryGates
          pendingIssues={scopeBridgeState.pendingIssues || []}
          missing={saveSummaryMissing}
          missingOpen={saveMissingOpen}
          setMissingOpen={setMissingOpen}
        />
        <SaveSummaryPreview
          orderNarrative={orderNarrative}
          saveExportLines={saveExportLines}
          data={data}
          previewView={previewView as any}
          setPreviewView={setPreviewView}
        />
        <SaveSummaryActions
          onCopyNlt={onCopyNlt}
          onCopyNarrative={onCopyNarrative}
          onDownloadSummary={onDownloadSummary}
          onSendToEventInstructions={onSendToEventInstructions}
        />
        <OutboundActionsPanel
          customers={data.customers || []}
          eventCustomerContacted={data.eventCustomerContacted}
          pickupDate={data.pickupDate}
          queuedOutbound={data.queuedOutbound || []}
          dismissedOutbound={(data as any).dismissedOutbound || []}
          setQueuedOutbound={setQueuedOutbound}
          setDismissedOutbound={setDismissedOutbound}
        />
      </div>
      <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
        <button
          className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          onClick={onClose}
        >
          Close
        </button>
        <button
          className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
          onClick={onSave}
        >
          Save {recordWord}
        </button>
        <button
          className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-violet-700 flex items-center gap-1.5"
          onClick={onSaveAndScope}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Save &amp; Scope
        </button>
      </div>
    </div>
  </div>
);
