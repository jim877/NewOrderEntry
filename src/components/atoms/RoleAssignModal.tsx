// @ts-nocheck
import React from "react";
import { RoleIcon } from "./RoleIcon";

type RoleOption = { id: string; title: string; [k: string]: any };

type RoleAssignState = {
  isOpen: boolean;
  source?: string;
  company?: string;
  contact?: string;
  options: RoleOption[];
  selected: string[];
};

type Props = {
  state: RoleAssignState;
  // Display-time lookup so the modal can show the company's type without
  // pulling the full company registry into props.
  getCompanyTypeForRoles: (company: string) => string;
  toggleSelection: (roleId: string) => void;
  onApply: () => void;
  onSkip: () => void;
  onGoBack: () => void;
  // Used by the Escape key handler — parent owns the state so it can close
  // without losing the selection if the user re-opens.
  onClose: () => void;
};

// RoleAssignModal — fires after adding a company/contact via Quick Entry's
// add-from-search / add-from-company flows. Lets the user opt the new entity
// into one or more Available Badges (referrer/insurance/billto/poc). Enter
// applies, Escape closes; bottom row has Go Back / Skip / Apply Roles.
export const RoleAssignModal = ({
  state,
  getCompanyTypeForRoles,
  toggleSelection,
  onApply,
  onSkip,
  onGoBack,
  onClose,
}: Props) => (
  <div
    data-suggested-roles-modal="true"
    className="fixed inset-0 z-[131] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-12 sm:pt-20"
    onKeyDown={(e) => {
      if (e.key === "Enter") { e.preventDefault(); onApply(); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    }}
  >
    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden" tabIndex={-1} ref={(el) => el?.focus()}>
      <div className="bg-sky-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Assign Company/Contact Roles</h3>
        <div className="mt-1 text-base text-sky-100">Apply badges for this company/contact now.</div>
      </div>
      <div className="p-6 space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="space-y-2 text-base leading-7 text-slate-700">
            {state.company ? (
              <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                <span className="font-semibold text-slate-900">Company</span>
                <span>{state.company}</span>
              </div>
            ) : null}
            {state.company ? (
              <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                <span className="font-semibold text-slate-900">Company Type</span>
                <span>{getCompanyTypeForRoles(state.company) || "Unknown"}</span>
              </div>
            ) : null}
            {state.contact ? (
              <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                <span className="font-semibold text-slate-900">Contact</span>
                <span>{state.contact}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Available Badges</div>
          <div className="flex flex-wrap gap-2">
            {state.options.map((role) => {
              const active = state.selected.includes(role.id);
              return (
                <button
                  key={`role-assign-${role.id}`}
                  type="button"
                  onClick={() => toggleSelection(role.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700"}`}
                >
                  <span className="mr-1 inline-flex"><RoleIcon role={role} className="h-4 w-4" /></span>
                  {role.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onGoBack}>Go Back</button>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onSkip}>Skip</button>
          <button
            className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
            onClick={onApply}
            disabled={!state.selected.length}
          >
            Apply Roles
          </button>
        </div>
      </div>
    </div>
  </div>
);
