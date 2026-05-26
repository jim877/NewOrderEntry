// @ts-nocheck
import React from "react";
import { Textarea } from "./Textarea";
import { ToggleMulti } from "./ToggleMulti";
import { CUSTOMER_QUICK_NOTES } from "../../config";
import { normalizeStringList, mergeUniqueStrings } from "../../utils/strings";
import { escapeRegExp } from "../../utils/strings";

type Customer = {
  id?: string;
  phone?: string;
  sendBrochure?: boolean;
  sendRushGuide?: boolean;
  sendAuthLink?: boolean;
  sendCosLink?: boolean;
  sendGoogleReviewLink?: boolean;
};

type WelcomeModalState = {
  isOpen: boolean;
  customerId?: string | null;
  note?: string;
  selectedSpecialDocs?: string[];
};

type Props = {
  state: WelcomeModalState;
  setState: (updater: (prev: WelcomeModalState) => WelcomeModalState) => void;
  // Customer used for attachments / mobile-number gate. Caller resolves by id.
  customer: Customer;
  currentOrderCustomerForms: string[];
  showQuickNotes: boolean;
  setShowQuickNotes: (v: boolean | ((prev: boolean) => boolean)) => void;
  onClose: () => void;
  onSend: () => void;
};

// WelcomeMessageModal — "Send Welcome Message" sheet. Shows the active set
// of attachments (from the customer's send-* flags + any selected special
// customer forms), a quick-note picker + free-text Textarea, and Cancel /
// Send footer. Send is disabled until the customer has a mobile number.
export const WelcomeMessageModal = ({
  state, setState, customer, currentOrderCustomerForms,
  showQuickNotes, setShowQuickNotes, onClose, onSend,
}: Props) => {
  const selectedSpecialDocs = normalizeStringList(state.selectedSpecialDocs || []);
  const attachments = [
    customer.sendBrochure && "Brochure",
    customer.sendRushGuide && "Rush Guide",
    customer.sendAuthLink && "Authorization Form",
    customer.sendCosLink && "COS Link",
    customer.sendGoogleReviewLink && "Google Review Link",
    ...selectedSpecialDocs,
  ].filter(Boolean);
  const hasMobile = (customer.phone || "").replace(/[^\d]/g, "").length >= 10;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="bg-sky-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Send Welcome Message</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-sm font-semibold text-slate-700">Attachments</div>
          {attachments.length ? (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => <span key={a} className="rounded-full bg-sky-50 text-sky-700 px-2 py-0.5 text-xs font-bold">{a}</span>)}
            </div>
          ) : (
            <div className="text-xs text-slate-500">No attachments selected.</div>
          )}
          {currentOrderCustomerForms.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Special Customer Forms</div>
              <div className="mt-2 grid gap-2 text-xs font-semibold text-amber-900">
                {currentOrderCustomerForms.map((form) => {
                  const checked = selectedSpecialDocs.includes(form);
                  return (
                    <label key={`welcome-special-doc-${form}`} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-amber-300"
                        checked={checked}
                        onChange={(e) => {
                          setState((modalState) => {
                            const current = normalizeStringList(modalState.selectedSpecialDocs || []);
                            const next = e.target.checked
                              ? mergeUniqueStrings(current, [form])
                              : current.filter((item) => item !== form);
                            return { ...modalState, selectedSpecialDocs: next };
                          });
                        }}
                      />
                      {form}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {!hasMobile && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Add a mobile phone number to send texts.
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Custom Note</label>
            <div className="mt-2">
              <button
                onClick={() => setShowQuickNotes((v: boolean) => !v)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${showQuickNotes ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
              >
                📝 Add Quick Note
              </button>
            </div>
            {showQuickNotes && (
              <div className="mt-2 flex flex-wrap gap-2">
                {CUSTOMER_QUICK_NOTES.map((n: string) => (
                  <ToggleMulti
                    key={`welcome-${n}`}
                    label={n}
                    checked={(state.note || "").includes(n)}
                    onChange={() => {
                      const base = (state.note || "").trim();
                      const has = base.includes(n);
                      const next = has
                        ? base.replace(new RegExp(`\\s*${escapeRegExp(n)}\\s*`, "g"), " ").replace(/\s{2,}/g, " ").trim()
                        : [base, n].filter(Boolean).join(" • ");
                      setState((m) => ({ ...m, note: next }));
                    }}
                  />
                ))}
              </div>
            )}
            <Textarea value={state.note || ""} onChange={(e) => setState((m) => ({ ...m, note: e.target.value }))} placeholder="Add a note to include with the message..." />
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Cancel</button>
          <button
            disabled={!hasMobile}
            className={`rounded-lg px-6 py-2 text-sm font-bold text-white shadow ${hasMobile ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"}`}
            onClick={() => { if (hasMobile) onSend(); }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
