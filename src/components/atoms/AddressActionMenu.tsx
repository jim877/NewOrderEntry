// @ts-nocheck
import React from "react";
import { summarizeAddress, hasMeaningfulValue } from "../../utils/order";

// AddressActionMenu — modal shown when the × on an address card is clicked.
// Three actions: cancel, make inactive (only if address has a street), delete.
export const AddressActionMenu = ({ addr, updateAddr, onRemove }) => (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => updateAddr(addr.id, { _showMenu: false })}>
    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-sm font-bold text-slate-800">{addr.type || "Address"}</div>
        <div className="text-xs text-slate-500">{summarizeAddress(addr)}</div>
      </div>
      <div className="p-3 space-y-1">
        <button onClick={() => updateAddr(addr.id, { _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        {hasMeaningfulValue(addr.street) && (
          <button onClick={() => updateAddr(addr.id, { inactive: true, isPrimary: false, isLossSite: false, _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50">Make Inactive</button>
        )}
        <button
          onClick={() => {
            const shouldDelete = !hasMeaningfulValue(addr.street) || window.confirm("Permanently delete this address?");
            if (shouldDelete) onRemove(addr.id);
            else updateAddr(addr.id, { _showMenu: false });
          }}
          className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >Delete</button>
      </div>
    </div>
  </div>
);
