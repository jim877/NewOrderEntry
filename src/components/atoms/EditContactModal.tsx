// @ts-nocheck
import React from "react";

type ContactState = {
  isOpen: boolean;
  contactName?: string;
  companyName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
};

type Props = {
  state: ContactState;
  setState: (updater: (prev: ContactState | null) => ContactState | null) => void;
  // Lightweight role-active probe — caller computes from the current data
  // shape (so the atom stays unaware of NOE's referrer/billing/insurance
  // field layout). null means "no opinion" (button stays inactive).
  isRoleActive: (role: string, contact: string, company: string) => boolean;
  onAssignRole: (role: string, contact: string, company: string) => void;
  onSave: () => void;
  onClose: () => void;
};

const ROLE_OPTIONS = ["Referrer", "Bill-To", "Adjuster", "Public Adjuster", "Contractor", "Building Mgmt"];

// EditContactModal — quick-edit sheet for a vendor row (name + company +
// title + email + phone) plus role badge toggles. Click outside closes;
// Save persists via the parent's onSave callback. Used by the Companies
// table "edit" affordance.
export const EditContactModal = ({ state, setState, isRoleActive, onAssignRole, onSave, onClose }: Props) => (
  <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Edit Contact</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase">Name</label>
          <input value={state.contactName || ""} onChange={(e) => setState((p) => (p ? { ...p, contactName: e.target.value } : p))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 mt-1" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase">Company</label>
          <input value={state.companyName || ""} onChange={(e) => setState((p) => (p ? { ...p, companyName: e.target.value } : p))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 mt-1" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase">Title</label>
          <input value={state.contactTitle || ""} onChange={(e) => setState((p) => (p ? { ...p, contactTitle: e.target.value } : p))} placeholder="e.g. Senior Adjuster" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Email</label>
            <input value={state.contactEmail || ""} onChange={(e) => setState((p) => (p ? { ...p, contactEmail: e.target.value } : p))} placeholder="email@company.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 mt-1" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Phone</label>
            <input value={state.contactPhone || ""} onChange={(e) => setState((p) => (p ? { ...p, contactPhone: e.target.value } : p))} placeholder="(555) 123-4567" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 mt-1" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase">Roles</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {ROLE_OPTIONS.map((role) => {
              const active = isRoleActive(role, state.contactName || "", state.companyName || "");
              return (
                <button
                  key={role}
                  onClick={() => onAssignRole(role, state.contactName || "", state.companyName || "")}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-all ${active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >{role}{active ? " ✓" : ""}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={onSave} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Save</button>
      </div>
    </div>
  </div>
);
