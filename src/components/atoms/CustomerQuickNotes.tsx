// @ts-nocheck
import React from "react";
import { ToggleMulti } from "./ToggleMulti";
import { Input } from "./Input";
import { CUSTOMER_QUICK_NOTES } from "../../config";

// CustomerQuickNotes — quick-pick note pills + freeform notes textbox.
// The pills toggle a curated list; the input lets the user add custom text.
export const CustomerQuickNotes = ({ c, updateCust, onToggleQuickNote }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
    <div className="flex flex-wrap gap-1.5">
      {CUSTOMER_QUICK_NOTES.map((n) => (
        <ToggleMulti key={n} label={n} checked={(c.quickNotes || []).includes(n)} onChange={() => onToggleQuickNote(n)} />
      ))}
    </div>
    <Input value={c.note} onChange={(e) => updateCust(c.id, { note: e.target.value })} placeholder="Additional notes..." />
  </div>
);
