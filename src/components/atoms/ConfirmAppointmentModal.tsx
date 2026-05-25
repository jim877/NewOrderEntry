// @ts-nocheck
import React from "react";

type ConfirmDetails = {
  type?: string;
  date?: string;
  time?: string;
  address?: string;
};

type Customer = { first?: string; last?: string };

type Props = {
  details: ConfirmDetails;
  // App-side data slices needed for the missing-info gate and context.
  pickupDate?: string;
  pickupTime?: string;
  eventVehicle?: string;
  eventAssignee?: string;
  eventFirm?: boolean;
  pickupTimeTentative?: boolean;
  primaryCustomer: Customer;
  referringCompany?: string;
  referrer?: string;
  insuranceCompany?: string;
  insuranceAdjuster?: string;
  additionalCompanies: Record<string, { company?: string; contact?: string }>;
  // Inline checkbox state lives in App so it persists across re-renders.
  contextOpen: boolean;
  setContextOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  missingOk: boolean;
  setMissingOk: (v: boolean) => void;
  tentativeOk: boolean;
  setTentativeOk: (v: boolean) => void;
  // Callbacks
  onAddToCalendar: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

// ConfirmAppointmentModal — review-and-confirm sheet that fires before
// sending an appointment confirmation. Surfaces a missing-info checklist
// (date/time/vehicle/assignee/address) with an explicit override checkbox,
// a collapsible context block (customers/referrer/insurance/adjuster/...),
// and a tentative-appointment override when the event isn't firm. Send is
// disabled until any gates are satisfied.
export const ConfirmAppointmentModal = ({
  details,
  pickupDate, pickupTime, eventVehicle, eventAssignee,
  eventFirm, pickupTimeTentative,
  primaryCustomer, referringCompany, referrer, insuranceCompany, insuranceAdjuster, additionalCompanies,
  contextOpen, setContextOpen, missingOk, setMissingOk, tentativeOk, setTentativeOk,
  onAddToCalendar, onConfirm, onClose,
}: Props) => {
  const missing: string[] = [];
  if (!pickupDate) missing.push("Date");
  if (!pickupTime || pickupTime === "12:00 AM") missing.push("Start Time");
  if (!eventVehicle) missing.push("Vehicle");
  if (!eventAssignee) missing.push("Assignee");
  if (!details.address) missing.push("Address");

  const firmGate = !eventFirm && (!pickupTimeTentative || !tentativeOk);
  const missingGate = !missingOk && ((!eventVehicle) || (!eventAssignee) || (!details.address));
  const disabled = firmGate || missingGate;

  const additionalSummary = Object.entries(additionalCompanies || {})
    .map(([t, v]) => v?.company || v?.contact ? `${t}: ${v.company || "—"} (${v.contact || "—"})` : null)
    .filter(Boolean)
    .join(" • ") || "—";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-xl">📅</span> Confirm Appointment</h3>
            <div className="text-sm text-sky-100 mt-1">Review details before sending confirmation.</div>
          </div>
          <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
        </div>
        <div className="p-6 space-y-5">
          {missing.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              <div className="font-bold mb-1">Missing Information:</div>
              <ul className="space-y-1">
                {missing.map((item) => (
                  <li key={item} className="flex items-center gap-2"><span className="text-orange-600">⚠️</span><span>{item}</span></li>
                ))}
              </ul>
              <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
                <input type="checkbox" checked={missingOk} onChange={(e) => setMissingOk(e.target.checked)} />
                Proceed without this information
              </label>
            </div>
          )}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500">Context</div>
              <button type="button" onClick={() => setContextOpen((v: boolean) => !v)} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">{contextOpen ? "Hide" : "Show"}</button>
            </div>
            {contextOpen && (
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div><span className="font-semibold">Primary Customer:</span> {primaryCustomer.first || ""} {primaryCustomer.last || ""}</div>
                <div><span className="font-semibold">Referring Company:</span> {referringCompany || "—"}</div>
                <div><span className="font-semibold">Referrer:</span> {referrer || "—"}</div>
                <div><span className="font-semibold">Insurance Company:</span> {insuranceCompany || "—"}</div>
                <div><span className="font-semibold">Adjuster:</span> {insuranceAdjuster || "—"}</div>
                <div><span className="font-semibold">Assignee:</span> {eventAssignee || "—"}</div>
                <div><span className="font-semibold">Vehicle:</span> {eventVehicle || "—"}</div>
                <div><span className="font-semibold">Additional Companies:</span> {additionalSummary}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-400 uppercase">Type</label><div className="font-medium">{details.type}</div></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">Date & Time</label><div className="font-medium">{details.date} @ {details.time}</div></div>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase">Address</label><div className="font-medium">{details.address || "No Primary Address Set"}</div></div>
          {!eventFirm && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              This event is not firm. {pickupTimeTentative ? "Confirming will send a tentative appointment." : "Mark as firm or confirm a tentative appointment to proceed."}
              {pickupTimeTentative && (
                <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
                  <input type="checkbox" checked={tentativeOk} onChange={(e) => setTentativeOk(e.target.checked)} />
                  I want to confirm a tentative appointment
                </label>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={onAddToCalendar} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-sky-300 hover:text-sky-700">📅 Add to Calendar</button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Cancel</button>
          <button
            className={`rounded-lg px-6 py-2 text-sm font-bold text-white shadow ${disabled ? "bg-slate-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            disabled={disabled}
            onClick={onConfirm}
          >Send Confirmation</button>
        </div>
      </div>
    </div>
  );
};
