// @ts-nocheck
import React from "react";
import { Input } from "./Input";
import { SearchSelect } from "./SearchSelect";
import { COMPANY_TYPES } from "../../config";
import { normalizeCompany } from "../../utils/strings";
import { formatPhoneNumber } from "../../utils/format";
import { inferCompanyTypeFromName } from "../../utils/companyProfiles";
import { safeUid } from "../../utils/uid";

type ModalState = {
  companyName?: string;
  isNewCompany?: boolean;
  companyType?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyAddress?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  email?: string;
};

type Props = {
  state: ModalState;
  setState: (updater: (prev: ModalState) => ModalState) => void;
  companies: string[];
  vendors: any[];
  update: (key: string, value: any) => void;
  setToast: (msg: string) => void;
  onClose: () => void;
};

// AddNewSystemModal — Settings/search affordance for adding a contact +
// company that don't exist in the system yet. Looks up the company against
// the registry; if it's new, surfaces type / phone / website / address fields
// plus a Google search shortcut. Saves as a vendor row on the current order
// (and the company/contact registries via the existing update flow).
export const AddNewSystemModal = ({
  state, setState, companies, vendors, update, setToast, onClose,
}: Props) => {
  const companyKnown = !!state.companyName && companies.some((c) => normalizeCompany(c) === normalizeCompany(state.companyName!));
  const saveDisabled = !state.firstName && !state.companyName;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-8 sm:pt-16 overflow-auto"
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
        tabIndex={-1}
        ref={(el) => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}
      >
        <div className="bg-sky-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Add New Contact / Company</h3>
          <p className="text-sm text-sky-100">This will add them to the system for future orders.</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</div>
            <SearchSelect
              value={state.companyName}
              onChange={(v: string) => setState((p) => ({ ...p, companyName: v, isNewCompany: !companies.some((c) => normalizeCompany(c) === normalizeCompany(v)) }))}
              onQueryChange={() => {}}
              options={companies.map((c) => ({ label: c, value: c, type: "company" }))}
              placeholder="Search existing or type new company..."
              onAddNew={(v: string) => setState((p) => ({ ...p, companyName: v, isNewCompany: true }))}
            />
            {state.companyName && (
              <div className={`text-[11px] font-semibold ${state.isNewCompany ? "text-amber-600" : "text-emerald-600"}`}>
                {state.isNewCompany ? `"${state.companyName}" is new — will be created` : `"${state.companyName}" found`}
              </div>
            )}
            {state.isNewCompany && state.companyName && (
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">New Company Details</div>
                  <button type="button" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(state.companyName!)}`, "_blank")} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Search Google</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setState((p) => ({ ...p, companyType: type }))}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${state.companyType === type ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}
                    >{type}</button>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={state.companyPhone || ""} onChange={(e) => setState((p) => ({ ...p, companyPhone: formatPhoneNumber(e.target.value) }))} placeholder="Company phone" />
                  <Input value={state.companyWebsite || ""} onChange={(e) => setState((p) => ({ ...p, companyWebsite: e.target.value }))} placeholder="Website" />
                </div>
                <Input value={state.companyAddress || ""} onChange={(e) => setState((p) => ({ ...p, companyAddress: e.target.value }))} placeholder="Company address" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact{state.companyName ? ` at ${state.companyName}` : ""}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={state.firstName || ""} onChange={(e) => setState((p) => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
              <Input value={state.lastName || ""} onChange={(e) => setState((p) => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
            </div>
            <Input value={state.title || ""} onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))} placeholder="Title (e.g. Adjuster, Project Manager, Owner)" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={state.phone || ""} onChange={(e) => setState((p) => ({ ...p, phone: formatPhoneNumber(e.target.value) }))} placeholder="Phone" />
              <Input value={state.email || ""} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-between border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
          <button
            onClick={() => {
              const fullName = [state.firstName, state.lastName].filter(Boolean).join(" ");
              const companyName = state.companyName || "";
              if (!fullName && !companyName) return;
              const inferredType = state.isNewCompany ? (state.companyType || "Other") : inferCompanyTypeFromName(companyName);
              const entry = { company: companyName, contact: fullName, type: inferredType, title: state.title || "", id: safeUid() };
              update("vendors", [...(vendors || []), entry]);
              setToast(`Added ${fullName ? fullName + (companyName ? " at " + companyName : "") : companyName} to the system`);
              onClose();
            }}
            disabled={saveDisabled}
            className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to System & Order
          </button>
        </div>
      </div>
    </div>
  );
};
