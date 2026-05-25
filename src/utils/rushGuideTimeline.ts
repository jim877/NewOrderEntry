// @ts-nocheck
// Build the Rush Guide timeline array fed to SdsDocument when rendering an
// SDS approval doc. Pure (modulo browser Date constructor) — derives entirely
// from the order shape. Returns null when neither a repair type nor a living
// situation has been set (the doc just omits the Rush Guide section).

// LIVING_SITUATION_MAP — maps the interview livingStatus answer to
// the rush-guide internal "situation" key. Stays in sync with the
// repair-type map below.
export const LIVING_SITUATION_MAP: Record<string, string> = {
  "Staying in home": "home",
  Hotel: "hotel",
  Temp: "temp",
  Moving: "moving",
};

// REPAIR_TYPE_MAP — maps the first selected repairsSummary entry to
// a rush-guide repair-type key used to look up timelines + advice.
export const REPAIR_TYPE_MAP: Record<string, string> = {
  "Just Cleaning": "cleaning",
  Paint: "paint",
  "Refinish Floors": "refinish_floors",
  "Replace Floors": "replace_floors",
  "Cosmetic Damage": "cosmetic",
  "Major Structural Damage": "structural",
  "Complete Rebuild": "rebuild",
};

export type HouseholdComposition = {
  babies: number;
  kids: number;
  elderly: number;
  adults: number;
  totalPeople: number;
  petCount: number;
  petNames: string;
};

// buildHouseholdComposition — pure derivation of the "who lives here"
// composition the Rush Guide needs. Age + type heuristics: 0-2 or
// /infant|baby/ -> baby; 3-17 or /child/ -> kid; 65+ or /elderly/ ->
// elderly. Adults default to customer count (min 1). Pet names format
// "Type Name" (whichever exists).
export const buildHouseholdComposition = (data: any): HouseholdComposition => {
  const household = data.household || [];
  const people = household.filter((m: any) => m.category === "person");
  const pets = household.filter((m: any) => m.category === "pet");
  const babies = people.filter((p: any) => {
    const age = parseInt(p.age);
    return /infant|baby/i.test(p.type) || (age >= 0 && age <= 2);
  }).length;
  const kids = people.filter((p: any) => {
    const age = parseInt(p.age);
    return /child/i.test(p.type) || (age > 2 && age <= 17);
  }).length;
  const elderly = people.filter((p: any) => {
    const age = parseInt(p.age);
    return /elderly/i.test(p.type) || age >= 65;
  }).length;
  const adults = Math.max(1, (data.customers || []).length);
  return {
    babies,
    kids,
    elderly,
    adults,
    totalPeople: adults + kids + babies,
    petCount: pets.length,
    petNames: pets.map((p: any) => [p.type, p.name].filter(Boolean).join(" ")).join(", "),
  };
};

import { rushAddDays, rushFormatDate, rushGetSeasons } from "./dateTime";
import { RUSH_REPAIR_TIMELINES } from "../config";

const REPAIR_MAP: Record<string, string> = {
  "Just Cleaning": "cleaning",
  "Paint": "paint",
  "Refinish Floors": "refinish_floors",
  "Replace Floors": "replace_floors",
  "Cosmetic Damage": "cosmetic",
  "Major Structural Damage": "structural",
  "Complete Rebuild": "rebuild",
};

const LIVING_MAP: Record<string, string> = {
  "Staying in home": "home",
  "Hotel": "hotel",
  "Temp": "temp",
  "Moving": "moving",
};

const EVENT_ITEMS: Record<string, string> = {
  vacation_beach: "Swimwear, resort wear, sandals, luggage",
  vacation_ski:   "Ski gear, thermal layers, boots, luggage",
  wedding:        "Formal attire, dress shoes, accessories",
  business:       "Business attire, briefcase, garment bags",
  sports:         "Uniforms, cleats, gear",
};

type TimelineEntry = {
  group: string;
  timeframe: string;
  desc?: string;
  items?: string[];
  address: string;
  warning?: string;
};

export const buildRushGuideTimeline = (data: any): TimelineEntry[] | null => {
  const firstRepair = (data.repairsSummary || "").split(", ").filter(Boolean)[0] || "";
  const repairId = REPAIR_MAP[firstRepair];
  const repairInfo = RUSH_REPAIR_TIMELINES.find((r: any) => r.id === repairId);
  const orderSit = LIVING_MAP[data.livingStatus] || "";
  if (!repairInfo && !orderSit) return null;

  const now = new Date();
  // Sync storage duration with repair timeline — use the longer of the two
  const storageDays = data.storageMonths ? Number(data.storageMonths) * 30 : 0;
  const repairDays = repairInfo ? repairInfo.days : 0;
  const effectiveDays = Math.max(repairDays, storageDays);
  const returnDate = effectiveDays > 0 ? rushAddDays(now, effectiveDays) : null;
  const storageRepairConflict = storageDays > 0 && repairDays > 0 && Math.abs(storageDays - repairDays) > 30;

  const allAddr = data.addresses || [];
  const primAddr = allAddr.find((a: any) => a.isPrimary) || allAddr[0] || {};
  const primAddrStr = [primAddr.street, primAddr.city, primAddr.state, primAddr.zip].filter(Boolean).join(", ");
  const tmpAddr = allAddr.find((a: any) => /temp|hotel|rental/i.test(a.type || "")) || {};
  const tmpAddrStr = [tmpAddr.street, tmpAddr.city, tmpAddr.state, tmpAddr.zip].filter(Boolean).join(", ");
  const rushAddr = (orderSit === "hotel" || orderSit === "temp") && tmpAddrStr ? tmpAddrStr : primAddrStr;

  // Build Rush items
  const household = data.household || [];
  const pets = household.filter((m: any) => m.category === "pet");
  const babies = household.filter((m: any) => /infant|baby/i.test(m.type)).length;
  const kids = household.filter((m: any) => /child/i.test(m.type)).length;
  const totalPeople = Math.max(1, (data.customers || []).length) + kids + babies;
  const rItems: string[] = [];
  rItems.push(`Clothing & undergarments for ${totalPeople} people`);
  rItems.push("Daily footwear, sneakers, and belts");
  if (orderSit === "hotel" || orderSit === "temp") rItems.push("Suitcases and overnight bags");
  if (babies > 0) rItems.push("Strollers, diaper bags, crib bedding");
  if (kids > 0) rItems.push("Favorite comfort toys");
  // Note: medications/medical devices are not group items — customer should set these aside
  if (pets.length > 0) rItems.push("Pet beds, leashes, and crates");

  const stItems: string[] = [];
  if (orderSit === "home") stItems.push("Temporary window shades, throw rugs, daily bedding");

  const timeline: TimelineEntry[] = [];
  timeline.push({ group: "Rush Delivery", timeframe: "24-72 hours", desc: rItems.slice(0, 3).join("; "), items: rItems, address: rushAddr });
  if (stItems.length > 0) timeline.push({ group: "Short-Term Home", timeframe: "1-4 weeks", desc: stItems.join("; "), items: stItems, address: primAddrStr });
  if (returnDate) {
    const seasons = rushGetSeasons(now, returnDate);
    if (seasons.length > 1) timeline.push({ group: "Seasonal Wardrobes", timeframe: "2-8 weeks", desc: `Transition clothing for ${seasons.map((s: any) => s.name).join(", ")}`, address: primAddrStr });
  }
  // Event deliveries — only those before the final return date
  (data.upcomingEvents || []).forEach((evt: any) => {
    if (!evt.date) return;
    const ed = new Date(evt.date);
    if (returnDate && ed > returnDate) return;
    const eDesc = EVENT_ITEMS[evt.type];
    if (eDesc) timeline.push({ group: evt.name || "Event", timeframe: rushFormatDate(ed), desc: eDesc, items: [eDesc], address: "" });
  });
  if (returnDate) {
    timeline.push({
      group: "Final Delivery",
      timeframe: `${effectiveDays} days (${rushFormatDate(returnDate)})`,
      desc: "All remaining items after repairs complete",
      address: primAddrStr,
      warning: storageRepairConflict ? `Storage (${data.storageMonths} mo) and repair estimate (${repairDays} days) differ — please reconcile` : undefined,
    });
  }
  return timeline;
};
