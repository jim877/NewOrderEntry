// @ts-nocheck
// "Optional Deliveries to Consider" panel — shown when seasonal
// wardrobes or trip/event deliveries are NOT already assigned to one
// of the existing deliveryGroups. The two sections share the filter
// computation, so this single atom renders both.
//
// Each unassigned row shows the wardrobe/event details + per-row
// chip buttons that route it into a chosen deliveryGroup, with a
// "Create New Delivery" affordance that spawns a custom delivery.

import React from "react";
import { formatDateInputValue } from "../../utils/dateTime";

type Wardrobe = {
  id: string;
  season: string;
  date: string;
  rawDate: Date;
  items: string[];
  events: string[];
  assignedGroup: string;
};

type EventDelivery = {
  id: string;
  name: string;
  date: string;
  items: string[];
  address: string;
};

type DeliveryGroup = { id: string; label: string };

type Props = {
  seasonalWardrobes: Wardrobe[];
  eventDeliveries: EventDelivery[];
  deliveryGroups: DeliveryGroup[];
  hasRental: boolean;
  seasonOverrides: Record<string, any>;
  eventOverrides: Record<string, any>;
  setRushGuideData: (updater: (prev: any) => any) => void;
  createCustomDelivery: (label: string, dateStr: string, sourceId: string) => void;
  createCustomDeliveryForEvent: (label: string, dateStr: string, sourceId: string) => void;
};

export const RushGuideOptionalDeliveries: React.FC<Props> = ({
  seasonalWardrobes,
  eventDeliveries,
  deliveryGroups,
  hasRental,
  seasonOverrides,
  eventOverrides,
  setRushGuideData,
  createCustomDelivery,
  createCustomDeliveryForEvent,
}) => {
  const unassignedSeasons = seasonalWardrobes.filter((sw) => {
    const ovr = seasonOverrides[sw.id] || {};
    const grp = ovr.group || sw.assignedGroup;
    return !deliveryGroups.some((dg) => dg.id === grp);
  });
  const unassignedEvents = eventDeliveries.filter((evt) => {
    const ovr = eventOverrides[evt.id] || {};
    const grp = ovr.group || "event";
    return !deliveryGroups.some((dg) => dg.id === grp);
  });

  if (unassignedSeasons.length === 0 && unassignedEvents.length === 0) return null;

  const setSeasonGroup = (id: string, g: string) =>
    setRushGuideData((p: any) => ({
      ...p,
      seasonOverrides: {
        ...(p.seasonOverrides || {}),
        [id]: { ...((p.seasonOverrides || {})[id] || {}), group: g },
      },
    }));

  const setEventGroup = (id: string, g: string) =>
    setRushGuideData((p: any) => ({
      ...p,
      eventOverrides: {
        ...(p.eventOverrides || {}),
        [id]: { ...((p.eventOverrides || {})[id] || {}), group: g },
      },
    }));

  return (
    <>
      {unassignedSeasons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-bold text-slate-900">Optional Deliveries to Consider</div>
              <div className="text-xs text-slate-500">
                {hasRental
                  ? "These seasonal items can be delivered to the rental, or included in Rush/Final."
                  : "If repairs run long, you may need these items. Include in Rush for now, or keep as a separate delivery to the hotel if/when needed. If they return home in time, these go in the Final Delivery."}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {unassignedSeasons.map((sw) => (
              <div key={sw.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{sw.season}</div>
                      <div className="text-[10px] text-slate-500">
                        {sw.date}
                        {sw.events.length > 0 ? ` — ${sw.events.join(", ")}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {sw.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1" />
                        <span className="text-xs text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Add to existing delivery
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {deliveryGroups.map((dg, di) => (
                          <button
                            key={dg.id}
                            type="button"
                            onClick={() => setSeasonGroup(sw.id, dg.id)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all bg-white"
                          >
                            #{di + 1} {dg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-l border-slate-200 pl-2">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or</div>
                      <button
                        type="button"
                        onClick={() =>
                          createCustomDelivery(`${sw.season} Delivery`, formatDateInputValue(sw.rawDate), sw.id)
                        }
                        className="rounded-lg border-2 border-dashed border-violet-300 px-3 py-1.5 text-[10px] font-bold text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-all bg-white"
                      >
                        + Create New Delivery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unassignedEvents.length > 0 && (
        <div>
          <div className="text-lg font-bold text-slate-900 mb-3">Trip &amp; Event Deliveries</div>
          <div className="space-y-3">
            {unassignedEvents.map((evt) => (
              <div key={evt.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{evt.name}</div>
                      <div className="text-[10px] text-slate-500">{evt.date}</div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {evt.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1" />
                        <span className="text-xs text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Add to existing delivery
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {deliveryGroups.map((dg, di) => (
                          <button
                            key={dg.id}
                            type="button"
                            onClick={() => setEventGroup(evt.id, dg.id)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all bg-white"
                          >
                            #{di + 1} {dg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-l border-slate-200 pl-2">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or</div>
                      <button
                        type="button"
                        onClick={() => {
                          if (evt.date) {
                            createCustomDeliveryForEvent(evt.name || "Event Delivery", evt.date, evt.id);
                          } else {
                            setEventGroup(evt.id, "event");
                          }
                        }}
                        className="rounded-lg border-2 border-dashed border-indigo-300 px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all bg-white"
                      >
                        + Create New Delivery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
