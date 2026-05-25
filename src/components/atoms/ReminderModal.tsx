// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Select } from "./Select";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

type Draft = { assignee: string; date: string; time: string };

type Props = {
  draft: Draft;
  setDraft: (updater: (prev: Draft) => Draft) => void;
  currentUser: string;
  techs: string[];        // TECHS minus "Unassigned" — caller filters
  reminderEnabled: boolean; // when true, surface a Clear button
  onClose: () => void;
  onClear: () => void;    // wipes reminderEnabled + date + time
  onSave: () => void;     // applies the draft and closes (toast handled by caller)
};

// ReminderModal — Schedule Reminder sheet. Lets the user pick an assignee
// (defaults to currentUser), date + time. Footer has Cancel / optional Clear
// (when a reminder is already set) / Save Reminder.
export const ReminderModal = ({
  draft, setDraft, currentUser, techs, reminderEnabled, onClose, onClear, onSave,
}: Props) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Schedule Reminder</h3>
          <div className="text-sm text-sky-100 mt-1">Choose when to send a reminder.</div>
        </div>
        <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
      </div>
      <div className="p-6 space-y-4">
        <Field label="Reminder For">
          <Select value={draft.assignee} onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}>
            <option value="">{currentUser || "Select user..."}</option>
            {techs.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reminder Date">
            <DatePicker value={draft.date} onChange={(v: string) => setDraft((d) => ({ ...d, date: v }))} />
          </Field>
          <Field label="Reminder Time">
            <TimePicker value={draft.time} onChange={(v: string) => setDraft((d) => ({ ...d, time: v }))} />
          </Field>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
        {reminderEnabled && (
          <button className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClear}>Clear</button>
        )}
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Cancel</button>
        <button className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600" onClick={onSave}>Save Reminder</button>
      </div>
    </div>
  </div>
);
