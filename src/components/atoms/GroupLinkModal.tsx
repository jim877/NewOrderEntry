// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Select } from "./Select";
import { Input } from "./Input";
import { summarizeAddress } from "../../utils/order";

type Address = { id: string; isPrimary?: boolean; type?: string; [k: string]: any };
type AddressDraft = { type: string; street?: string; city?: string; state?: string; zip?: string };
type AddressMode = "select" | "placeholder" | "full";

type GroupLink = { addressId?: string; date?: string };

type Props = {
  group: string;
  addresses: Address[];
  // group-link state accessors
  getGroupLink: (group: string) => GroupLink;
  setGroupLink: (group: string, patch: Partial<GroupLink>) => void;
  clearGroupLink: (group: string) => void;
  // mode + draft for the add-address sub-flow
  mode: AddressMode;
  setMode: (m: AddressMode) => void;
  draft: AddressDraft;
  setDraft: (updater: (prev: AddressDraft) => AddressDraft) => void;
  addPlaceholderAddress: () => void;
  addFullAddress: () => void;
  // close
  onClose: () => void;
};

// GroupLinkModal — "Link Group to Address" sheet used by the Delivery
// Planner to tie a suggested group (RD/RFD/STD/...) to an order address +
// target date. Three sub-modes for sourcing an address: pick an existing
// one, add a labeled placeholder, or add a full street/city/state/zip.
export const GroupLinkModal = ({
  group, addresses,
  getGroupLink, setGroupLink, clearGroupLink,
  mode, setMode, draft, setDraft,
  addPlaceholderAddress, addFullAddress,
  onClose,
}: Props) => {
  const link = getGroupLink(group);
  const primary = (addresses || []).find((a) => a.isPrimary) || addresses?.[0];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Link Group to Address</h3>
        <div className="text-sm text-slate-500 mb-4">{group}</div>
        <div className="grid gap-4">
          <Field label="Address">
            <Select value={link.addressId || ""} onChange={(e) => setGroupLink(group, { addressId: e.target.value })}>
              <option value="">Select address...</option>
              {(addresses || []).map((a) => {
                const label = a.id === primary?.id ? `Primary — ${a.type || "Address"}` : `${a.type || "Address"}`;
                return (
                  <option key={a.id} value={a.id}>
                    {label} — {summarizeAddress(a)}
                  </option>
                );
              })}
            </Select>
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Address Actions</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setMode("select")} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${mode === "select" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}>Use Existing</button>
              <button type="button" onClick={() => setMode("placeholder")} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${mode === "placeholder" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}>Add Placeholder</button>
              <button type="button" onClick={() => setMode("full")} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${mode === "full" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}>Add Full Address</button>
            </div>
            {mode === "placeholder" && (
              <div className="mt-3 space-y-2">
                <Input value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))} placeholder="Label (e.g., RD Drop, Hotel, Neighbor)" />
                <button type="button" onClick={addPlaceholderAddress} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600">Add Placeholder Address</button>
              </div>
            )}
            {mode === "full" && (
              <div className="mt-3 grid gap-2">
                <Input value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))} placeholder="Address Type (optional)" />
                <Input value={draft.street || ""} onChange={(e) => setDraft((p) => ({ ...p, street: e.target.value }))} placeholder="Street" />
                <div className="grid grid-cols-3 gap-2">
                  <Input value={draft.city || ""} onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                  <Input value={draft.state || ""} onChange={(e) => setDraft((p) => ({ ...p, state: e.target.value }))} placeholder="State" />
                  <Input value={draft.zip || ""} onChange={(e) => setDraft((p) => ({ ...p, zip: e.target.value }))} placeholder="Zip" />
                </div>
                <button type="button" onClick={addFullAddress} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600">Add Full Address</button>
              </div>
            )}
          </div>
          <Field label="Target Date">
            <Input type="date" value={link.date || ""} onChange={(e) => setGroupLink(group, { date: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-between items-center mt-6">
          <button onClick={() => { clearGroupLink(group); onClose(); }} className="text-xs font-bold text-slate-400 hover:text-slate-600">Clear</button>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-600">Done</button>
        </div>
      </div>
    </div>
  );
};
