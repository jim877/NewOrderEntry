// @ts-nocheck
import React from "react";

// CustomerActionMenu — modal sheet shown when the × on a customer card is clicked
// (only on the 2nd+ customer). Three actions: cancel, mark inactive, delete.
export const CustomerActionMenu = ({ c, customerDisplayName, onClose, onMarkInactive, onDelete }) => (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-sm font-bold text-slate-800">{customerDisplayName || "Customer"}</div>
        <div className="text-xs text-slate-500">{c.type || "No type set"}</div>
      </div>
      <div className="p-3 space-y-1">
        <button onClick={onClose} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={onMarkInactive} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50">Make Inactive</button>
        <button onClick={onDelete} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
      </div>
    </div>
  </div>
);
