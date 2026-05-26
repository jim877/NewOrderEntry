// @ts-nocheck
// Delivery group cards (rendered under the Gantt timeline) — one card
// per delivery group. Each card shows: colored header (number + label
// + interview-group badge + "+N added" badge + Delete for custom
// deliveries), inline date + address pickers, the core item list,
// household-tag chips, merged seasonal sublists with their own remove
// buttons, a notes textarea, and merged event sublists.

import React from "react";
import { formatDateInputValue, rushFormatDate } from "../../utils/dateTime";
import { SUGGESTED_GROUP_HELP } from "../../config";

// Per-event-type item lists used by the merged-event sublist (the
// short copy variant). Keeping this here as a local map keeps the
// atom self-contained.
const EVENT_TYPE_LIST_ITEMS: Record<string, string[]> = {
  vacation_beach: ["Swimwear, resort wear, sandals", "Beach bags, sunglasses, luggage"],
  vacation_ski: ["Ski gear, thermal layers, boots, luggage"],
  wedding: ["Formal attire, dress shoes, accessories"],
  business: ["Business attire, briefcase, garment bags"],
  sports: ["Uniforms, cleats, gear"],
};

// Mapping from deliveryGroup.id to the interview-suggested groups
// that, when present, render a small badge in the card header.
const GROUP_BADGE_MAP: Record<string, string[]> = {
  rush: ["RD", "RFD"],
  rental: ["STD", "STFD"],
  "short-term": ["STD", "STFD"],
  final: ["LTD", "LTFD", "RFD", "STFD", "LTFD"],
};

type DeliveryGroup = {
  id: string;
  label: string;
  date: Date;
  icon: string;
  items: string[];
  location: string;
  address: string;
  color: string;
  householdTags?: string[];
};

type Wardrobe = {
  id: string;
  season: string;
  date: string;
  assignedGroup: string;
  items: string[];
};

type UpcomingEvent = {
  id: string;
  name?: string;
  type: string;
  date?: string;
};

type AddressChoice = {
  value: string;
  label: string;
};

type Member = { id: string; label: string; kind: "adult" | "child" | "baby" | "pet" };

type Props = {
  deliveryGroups: DeliveryGroup[];
  seasonalWardrobes: Wardrobe[];
  upcomingEvents: UpcomingEvent[];
  interviewGroups: string[];
  seasonOverrides: Record<string, any>;
  eventOverrides: Record<string, any>;
  deliveryNotes: Record<string, string>;
  setRushGuideData: (updater: (prev: any) => any) => void;
  addressChoiceValue: (dg: any) => string;
  addressPayloadFromChoice: (choice: string) => any;
  orderAddressChoices: { known: AddressChoice[]; placeholders: AddressChoice[] };
  removeCustomDelivery: (id: string) => void;
  deliveryDateVersion: number;
  membersForDelivery?: (dgId: string) => Member[];
  anyAssignmentSet?: boolean;
};

const memberKindIcon = (k: Member["kind"]) =>
  k === "adult" ? "👤" : k === "child" ? "🧒" : k === "baby" ? "👶" : "🐾";

export const RushGuideDeliveryCards: React.FC<Props> = ({
  deliveryGroups,
  seasonalWardrobes,
  upcomingEvents,
  interviewGroups,
  seasonOverrides,
  eventOverrides,
  deliveryNotes,
  setRushGuideData,
  addressChoiceValue,
  addressPayloadFromChoice,
  orderAddressChoices,
  removeCustomDelivery,
  deliveryDateVersion,
  membersForDelivery,
  anyAssignmentSet,
}) => {
  const removeSeasonFromGroup = (swId: string) =>
    setRushGuideData((p: any) => ({
      ...p,
      seasonOverrides: {
        ...(p.seasonOverrides || {}),
        [swId]: { ...((p.seasonOverrides || {})[swId] || {}), group: "unassigned" },
      },
    }));

  const removeEventFromGroup = (evtId: string) =>
    setRushGuideData((p: any) => ({
      ...p,
      eventOverrides: {
        ...(p.eventOverrides || {}),
        [evtId]: { ...((p.eventOverrides || {})[evtId] || {}), group: "unassigned" },
      },
    }));

  const setNotes = (dgId: string, value: string) =>
    setRushGuideData((p: any) => ({
      ...p,
      deliveryNotes: { ...(p.deliveryNotes || {}), [dgId]: value },
    }));

  const setDateForGroup = (dg: DeliveryGroup, val: string) => {
    if (!val) return;
    if (dg.id.startsWith("custom_")) {
      setRushGuideData((p: any) => ({
        ...p,
        customDeliveries: (p.customDeliveries || []).map((cd: any) =>
          cd.id === dg.id ? { ...cd, dateStr: val } : cd
        ),
      }));
    } else {
      setRushGuideData((p: any) => ({
        ...p,
        groupOverrides: {
          ...(p.groupOverrides || {}),
          [dg.id]: { ...((p.groupOverrides || {})[dg.id] || {}), dateStr: val },
        },
      }));
    }
  };

  const setAddressForGroup = (dg: DeliveryGroup, choice: string) => {
    const payload = addressPayloadFromChoice(choice);
    if (dg.id.startsWith("custom_")) {
      setRushGuideData((p: any) => ({
        ...p,
        customDeliveries: (p.customDeliveries || []).map((cd: any) =>
          cd.id === dg.id ? { ...cd, ...payload } : cd
        ),
      }));
    } else {
      setRushGuideData((p: any) => ({
        ...p,
        groupOverrides: {
          ...(p.groupOverrides || {}),
          [dg.id]: { ...((p.groupOverrides || {})[dg.id] || {}), ...payload },
        },
      }));
    }
  };

  return (
    <div className="px-4 pb-4 space-y-3">
      {deliveryGroups.map((dg, i) => {
        const mergedSeasons = seasonalWardrobes.filter((sw) => {
          const ovr = seasonOverrides[sw.id] || {};
          return (ovr.group || sw.assignedGroup) === dg.id;
        });
        const mergedEvents = upcomingEvents.filter((evt) => {
          const ovr = eventOverrides[evt.id] || {};
          return ovr.group === dg.id;
        });
        const matchedInterviewGroups = (GROUP_BADGE_MAP[dg.id] || []).filter((g) =>
          interviewGroups.includes(g)
        );
        const badgeTip = matchedInterviewGroups
          .map((g) => `${g}: ${SUGGESTED_GROUP_HELP[g] || g}`)
          .join("\n");

        return (
          <div
            key={dg.id}
            id={`delivery-card-${dg.id}`}
            className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300"
          >
            <div className={`${dg.color} px-4 py-3 text-white flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm ring-2 ring-white/20">
                <span className="text-xl font-bold leading-none">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">
                  {dg.icon} {dg.label}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="min-w-[170px] flex-1 sm:flex-none">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/65">
                      Date
                    </span>
                    <input
                      type="date"
                      defaultValue={formatDateInputValue(dg.date)}
                      key={`date-${dg.id}-v${deliveryDateVersion}`}
                      onChange={(e) => setDateForGroup(dg, e.target.value)}
                      className="h-9 w-full rounded-lg border border-white/30 bg-white/95 px-3 text-[13px] font-bold text-slate-800 outline-none focus:border-white focus:ring-2 focus:ring-white/40"
                    />
                  </label>
                  <label className="min-w-0 flex-[2]">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/65">
                      Address
                    </span>
                    <select
                      value={addressChoiceValue(dg)}
                      onChange={(e) => setAddressForGroup(dg, e.target.value)}
                      className="h-9 w-full rounded-lg border border-white/30 bg-white/95 px-3 text-[13px] font-bold text-slate-800 outline-none focus:border-white focus:ring-2 focus:ring-white/40"
                    >
                      <option value="">{dg.address || `${dg.location || "Delivery"} address...`}</option>
                      {orderAddressChoices.known.length > 0 && (
                        <optgroup label="★ EXISTING ADDRESSES ON THIS ORDER ★">
                          {orderAddressChoices.known.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                              {choice.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="＋ ADD PLACEHOLDER (address TBD)">
                        {orderAddressChoices.placeholders.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                </div>
              </div>
              {matchedInterviewGroups.length > 0 && (
                <span
                  title={badgeTip}
                  className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold cursor-help"
                >
                  {matchedInterviewGroups.join("/")}
                </span>
              )}
              {(mergedSeasons.length > 0 || mergedEvents.length > 0) && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold">
                  +{mergedSeasons.length + mergedEvents.length} added
                </span>
              )}
              {dg.id.startsWith("custom_") && (
                <button
                  type="button"
                  onClick={() => removeCustomDelivery(dg.id)}
                  className="rounded-full bg-white/20 hover:bg-white/30 px-2 py-0.5 text-[9px] font-bold text-white"
                  title="Delete this delivery group"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="bg-white p-4 space-y-2">
              {/* Per-person manifest — pulled from the Timeline Builder matrix.
                  Default state (no boxes touched) shows everyone with a muted chip. */}
              {membersForDelivery && (() => {
                const assignedMembers = membersForDelivery(dg.id);
                if (assignedMembers.length === 0) {
                  return (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide shrink-0">For:</span>
                      <span className="text-[11px] text-slate-400 italic">No members assigned — use the Timeline Builder above to assign.</span>
                    </div>
                  );
                }
                const implicit = !anyAssignmentSet;
                return (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 flex-wrap">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide shrink-0">For:</span>
                    {assignedMembers.map((m) => (
                      <span
                        key={m.id}
                        title={implicit ? "Included by default (matrix above is untouched)" : "Assigned in the Timeline Builder matrix above"}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${implicit ? "bg-slate-50 text-slate-500 border border-slate-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
                      >
                        <span>{memberKindIcon(m.kind)}</span>
                        <span>{m.label}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}
              {/* Core items */}
              {dg.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded border-2 border-slate-300 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
              {dg.householdTags && dg.householdTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {dg.householdTags.map((tag, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Merged seasonal sublists */}
              {mergedSeasons.map((sw) => (
                <div
                  key={sw.id}
                  className="mt-2 rounded-lg border-l-4 border-violet-400 bg-violet-50/40 px-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-bold text-violet-700">
                      {sw.season} — {sw.date}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSeasonFromGroup(sw.id)}
                      className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[9px] font-bold text-violet-500 hover:bg-violet-50 hover:text-violet-700 transition-all"
                      title="Remove from this delivery"
                    >
                      Remove
                    </button>
                  </div>
                  {sw.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="w-3 h-3 rounded border border-violet-300 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              ))}
              {/* Notes textarea */}
              <textarea
                value={deliveryNotes?.[dg.id] || ""}
                onChange={(e) => setNotes(dg.id, e.target.value)}
                placeholder="Notes for this delivery group..."
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-blue-400 resize-none mt-2"
              />
              {/* Merged event sublists */}
              {mergedEvents.map((evt) => {
                const evtItems = EVENT_TYPE_LIST_ITEMS[evt.type] || [];
                return (
                  <div
                    key={evt.id}
                    className="mt-2 rounded-lg border-l-4 border-indigo-400 bg-indigo-50/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-bold text-indigo-700">
                        {evt.name || "Event"} —{" "}
                        {evt.date ? rushFormatDate(new Date(evt.date)) : ""}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEventFromGroup(evt.id)}
                        className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[9px] font-bold text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                        title="Remove from this delivery"
                      >
                        Remove
                      </button>
                    </div>
                    {evtItems.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="w-3 h-3 rounded border border-indigo-300 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
