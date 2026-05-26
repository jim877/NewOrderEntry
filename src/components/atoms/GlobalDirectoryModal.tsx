// @ts-nocheck
import React from "react";
import { Input } from "./Input";
import { Select } from "./Select";
import { SALES_REPS } from "../../config";
import { normalizeCompany } from "../../utils/strings";
import { inferRoleCapabilities } from "../../utils/companyProfiles";
import { normalizeSampleContacts } from "../../utils/normalizeSampleContacts";
import { safeUid } from "../../utils/uid";

type ContactRow = {
  id?: string;
  name?: string;
  company?: string;
  companyType?: string;
  title?: string;
  salesRep?: string;
  isAdjuster?: boolean;
  canRefer?: boolean;
  canBill?: boolean;
  canInsure?: boolean;
};

type Props = {
  rows: ContactRow[];
  setRows: (updater: (prev: ContactRow[]) => ContactRow[]) => void;
  // Per-company capability propagation lives in App because it can hit
  // multiple rows that share a company. Atom delegates.
  updateCompanyCapability: (company: string, idx: number, capabilityKey: "canRefer" | "canBill" | "canInsure", value: boolean) => void;
  // Eligible role badge labels — computed by App because it folds in the
  // contact role badge config.
  getEligibleRoleLabels: (company: string, companyType: string) => string[];
  onClose: () => void;
};

// Column template shared across the header row and each contact row so they
// stay aligned even when the row count is empty.
const COL_TEMPLATE = "grid grid-cols-[2fr_2fr_1.4fr_1.4fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr_2fr_0.5fr] gap-2";

// GlobalDirectoryModal — Sample Data → Global Directory editor. Lets the user
// edit the seeded contacts table (name / company / type / title / sales rep /
// adjuster flag) and per-company refer/bill/insure capability checkboxes.
// Shows the live "Eligible Roles" badges as a read-only column on the right.
export const GlobalDirectoryModal = ({
  rows, setRows, updateCompanyCapability, getEligibleRoleLabels, onClose,
}: Props) => {
  // Per-row patcher used by the simple text fields (no cross-row side effects).
  const patchRow = (idx: number, patch: Partial<ContactRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  // Company rename — when typing a new company name, if any other row already
  // has that company we copy its capability flags (so a fresh row for an
  // existing firm "joins" the group); otherwise we infer from the current type.
  const onCompanyChange = (idx: number, nextCompany: string) => {
    setRows((prev) => {
      const normalized = normalizeSampleContacts(prev);
      const peer = normalized.find((r, i) => i !== idx && normalizeCompany(r.company || "") === normalizeCompany(nextCompany || ""));
      const fallback = inferRoleCapabilities(normalized[idx]?.companyType || "", nextCompany);
      const nextCaps = peer
        ? { canRefer: !!peer.canRefer, canBill: !!peer.canBill, canInsure: !!peer.canInsure }
        : fallback;
      return normalized.map((r, i) => (i === idx ? { ...r, company: nextCompany, ...nextCaps } : r));
    });
  };

  // Company-type rename — peers at the same company keep their capability set;
  // only the lone-row case re-infers caps from the new type.
  const onCompanyTypeChange = (idx: number, nextType: string) => {
    setRows((prev) => {
      const normalized = normalizeSampleContacts(prev);
      const companyName = normalized[idx]?.company || "";
      const peers = normalized.filter((r, i) => i !== idx && normalizeCompany(r.company || "") === normalizeCompany(companyName || ""));
      const inferred = inferRoleCapabilities(nextType, companyName);
      return normalized.map((r, i) => {
        if (i !== idx) return r;
        if (peers.length) return { ...r, companyType: nextType };
        return { ...r, companyType: nextType, canRefer: inferred.canRefer, canBill: inferred.canBill, canInsure: inferred.canInsure };
      });
    });
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-slate-800">Global Directory</div>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700">Close</button>
        </div>
        <div className={`${COL_TEMPLATE} text-[10px] font-bold text-slate-400 uppercase`}>
          <div>Contact</div><div>Company</div><div>Company Type</div><div>Title</div><div>Rep</div>
          <div>Adj</div><div>Refer</div><div>Bill</div><div>Insure</div><div>Eligible Roles</div><div />
        </div>
        <div className="mt-2 space-y-2">
          {rows.map((row, idx) => (
            <div key={row.id || idx} className={`${COL_TEMPLATE} items-center`}>
              <div><Input value={row.name || ""} onChange={(e) => patchRow(idx, { name: e.target.value })} className="!py-1.5 !text-xs" /></div>
              <div><Input value={row.company || ""} onChange={(e) => onCompanyChange(idx, e.target.value)} className="!py-1.5 !text-xs" /></div>
              <div><Input value={row.companyType || ""} onChange={(e) => onCompanyTypeChange(idx, e.target.value)} className="!py-1.5 !text-xs" placeholder="Type" /></div>
              <div><Input value={row.title || ""} onChange={(e) => patchRow(idx, { title: e.target.value })} className="!py-1.5 !text-xs" /></div>
              <div>
                <Select value={row.salesRep || ""} onChange={(e) => patchRow(idx, { salesRep: e.target.value })} className="!py-1.5 !text-[10px]">
                  <option value="">Unassigned</option>
                  {SALES_REPS.map((rep: string) => <option key={rep} value={rep}>{rep}</option>)}
                </Select>
              </div>
              <div className="flex items-center justify-center">
                <label className="flex items-center gap-1 text-[10px] text-slate-400">
                  <input type="checkbox" checked={!!row.isAdjuster} onChange={(e) => patchRow(idx, { isAdjuster: e.target.checked })} />
                </label>
              </div>
              <div className="flex items-center justify-center"><input type="checkbox" checked={!!row.canRefer} onChange={(e) => updateCompanyCapability(row.company || "", idx, "canRefer", e.target.checked)} /></div>
              <div className="flex items-center justify-center"><input type="checkbox" checked={!!row.canBill} onChange={(e) => updateCompanyCapability(row.company || "", idx, "canBill", e.target.checked)} /></div>
              <div className="flex items-center justify-center"><input type="checkbox" checked={!!row.canInsure} onChange={(e) => updateCompanyCapability(row.company || "", idx, "canInsure", e.target.checked)} /></div>
              <div className="flex flex-wrap gap-1">
                {getEligibleRoleLabels(row.company || "", row.companyType || "").map((role) => (
                  <span key={`${row.id || idx}-${role}`} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">{role}</span>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <button onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))} className="text-rose-600 text-xs font-bold">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setRows((prev) => [...prev, { id: safeUid(), name: "", company: "", companyType: "", title: "", salesRep: "", isAdjuster: false, canRefer: true, canBill: false, canInsure: false }])}
            className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
          >+ Add Row</button>
          <div className="text-[10px] text-slate-400">Edits save automatically. Refer/Bill/Insure apply to all contacts at the same company.</div>
        </div>
      </div>
    </div>
  );
};
