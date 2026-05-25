// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { CONTACT_METHODS } from "../../config";

type CrmModalState = {
  isOpen: boolean;
  method?: string;
  owner?: string;
  subject?: string;
  orderLink?: string;
  notes?: string;
  followUpEnabled?: boolean;
  followUpDate?: string;
  followUpTime?: string;
  notifySalesRep?: boolean;
  notifyOrderLead?: boolean;
  notifyOthers?: string;
};

type Props = {
  state: CrmModalState;
  setState: (updater: (prev: CrmModalState) => CrmModalState) => void;
  techs: string[]; // TECHS minus "Unassigned" — caller filters
  onSubmit: () => void;
  onClose: () => void;
};

// CrmLogModal — Add CRM Log sheet (Type / Owner / Subject / Order Link /
// Notes plus a follow-up reminder block and a Notify Team picker with chip
// shortcuts + free-text overflow). Parent owns onSubmit (which inserts
// the log + toasts + closes) so the persistence flow stays in App.
export const CrmLogModal = ({ state, setState, techs, onSubmit, onClose }: Props) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col">
      <div className="bg-sky-500 px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-white">Add CRM Log</h3>
          <div className="text-xs text-sky-100">Capture outreach and follow-up actions.</div>
        </div>
        <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto custom-scroll flex-1">
        <Field label="Type">
          <Select value={state.method || ""} onChange={(e) => setState((m) => ({ ...m, method: e.target.value }))}>
            {CONTACT_METHODS.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Owner">
          <Input value={state.owner || ""} onChange={(e) => setState((m) => ({ ...m, owner: e.target.value }))} placeholder="Sales Rep" />
        </Field>
        <Field label="Subject">
          <Input value={state.subject || ""} onChange={(e) => setState((m) => ({ ...m, subject: e.target.value }))} placeholder="New Lead/Order" />
        </Field>
        <Field label="Order Link">
          <Input value={state.orderLink || ""} onChange={(e) => setState((m) => ({ ...m, orderLink: e.target.value }))} placeholder="Order link" />
        </Field>
        <Field label="Notes">
          <Textarea value={state.notes || ""} onChange={(e) => setState((m) => ({ ...m, notes: e.target.value }))} placeholder="Additional notes..." />
        </Field>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="text-sm font-semibold text-slate-700">Follow-up Reminder</div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" checked={!!state.followUpEnabled} onChange={(e) => setState((m) => ({ ...m, followUpEnabled: e.target.checked }))} />
            Create follow-up reminder for referrer
          </label>
          {state.followUpEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div><div className="text-[11px] font-bold text-slate-500 mb-1">Date</div><Input type="date" value={state.followUpDate || ""} onChange={(e) => setState((m) => ({ ...m, followUpDate: e.target.value }))} /></div>
              <div><div className="text-[11px] font-bold text-slate-500 mb-1">Time</div><Input type="time" value={state.followUpTime || ""} onChange={(e) => setState((m) => ({ ...m, followUpTime: e.target.value }))} /></div>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="text-sm font-semibold text-slate-700">Notify Team</div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!state.notifySalesRep} onChange={(e) => setState((m) => ({ ...m, notifySalesRep: e.target.checked }))} />
              Sales Rep
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!state.notifyOrderLead} onChange={(e) => setState((m) => ({ ...m, notifyOrderLead: e.target.checked }))} />
              Order Lead (Assignee)
            </label>
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {techs.map((name) => {
                const isOn = (state.notifyOthers || "").includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setState((m) => ({
                      ...m,
                      notifyOthers: isOn
                        ? (m.notifyOthers || "").replace(name, "").replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "").trim()
                        : (m.notifyOthers ? `${m.notifyOthers}, ${name}` : name),
                    }))}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${isOn ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}
                  >{name}</button>
                );
              })}
            </div>
            <Input value={state.notifyOthers || ""} onChange={(e) => setState((m) => ({ ...m, notifyOthers: e.target.value }))} placeholder="Or type names (comma separated)" />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-3 flex justify-end gap-3 border-t border-slate-200 shrink-0">
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Cancel</button>
        <button className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600" onClick={onSubmit}>Submit</button>
      </div>
    </div>
  </div>
);
