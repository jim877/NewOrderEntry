// @ts-nocheck
// Step 3 of the Rush Guide — upcoming trips & events editor. Pure
// presentation atom: takes the events array slice + setRushGuideData
// updater + back/next handlers + a date label for the prompt copy.

import React from "react";
import { RUSH_EVENT_TYPES } from "../../config";
import { safeUid } from "../../utils/uid";

type Event = { id: string; name: string; type: string; date: string };

type Props = {
  events: Event[];
  setRushGuideData: (updater: (prev: any) => any) => void;
  onBack: () => void;
  onNext: () => void;
  estimatedReturnLabel: string;
};

export const RushGuideEventsStep: React.FC<Props> = ({
  events,
  setRushGuideData,
  onBack,
  onNext,
  estimatedReturnLabel,
}) => {
  const updateEvent = (id: string, patch: Partial<Event>) =>
    setRushGuideData((p) => ({
      ...p,
      events: (p.events || []).map((ev: Event) => (ev.id === id ? { ...ev, ...patch } : ev)),
    }));

  const removeEvent = (id: string) =>
    setRushGuideData((p) => ({ ...p, events: (p.events || []).filter((e: Event) => e.id !== id) }));

  const addEvent = () =>
    setRushGuideData((p) => ({
      ...p,
      events: [...(p.events || []), { id: safeUid(), type: "vacation_beach", date: "", name: "" }],
    }));

  return (
    <>
      <div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 mb-2">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Step 3: Upcoming Trips &amp; Events</h2>
        <p className="text-sm text-slate-500">
          Any travel or formal events before {estimatedReturnLabel}?
        </p>
      </div>

      <div className="space-y-3">
        {(events || []).map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-3 gap-3 relative"
          >
            <button
              onClick={() => removeEvent(evt.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 text-sm"
            >
              ×
            </button>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name</div>
              <input
                value={evt.name}
                onChange={(e) => updateEvent(evt.id, { name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</div>
              <select
                value={evt.type}
                onChange={(e) => updateEvent(evt.id, { type: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white"
              >
                {RUSH_EVENT_TYPES.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</div>
              <input
                type="date"
                value={evt.date}
                onChange={(e) => updateEvent(evt.id, { date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addEvent}
          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:border-teal-400 hover:text-teal-600"
        >
          + Add Trip or Event
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={onNext}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-md"
        >
          Generate Smart Checklist →
        </button>
      </div>
    </>
  );
};
