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

export type RushGuideAddresses = {
  allAddresses: any[];
  primaryAddress: any;
  primaryAddrStr: string;
  tempAddress: any;
  tempAddrStr: string;
  hotelAddress: any;
  hotelAddrStr: string;
  rentalAddress: any;
  rentalAddrStr: string;
};

const formatAddrLine = (a: any) =>
  [a?.street, a?.city, a?.state, a?.zip].filter(Boolean).join(", ");

// buildRushGuideAddresses — pure derivation of the address strings
// the Rush Guide needs (primary, temp, hotel, rental). Uses the
// livingTimeline first when present (per-stay address overrides the
// type-matched address); falls back to the order's saved addresses.
export const buildRushGuideAddresses = (data: any): RushGuideAddresses => {
  const allAddresses = data.addresses || [];
  const livingTimeline = data.livingTimeline || [];
  const timelineHotel = livingTimeline.find((s: any) => s.type === "Hotel");
  const timelineRental = livingTimeline.find((s: any) => s.type === "Rental" || s.type === "Temp");

  const primaryAddress = allAddresses.find((a: any) => a.isPrimary) || allAddresses[0] || {};
  const tempAddress = allAddresses.find((a: any) => /temp|hotel|rental/i.test(a.type || "")) || {};
  const hotelAddress = allAddresses.find((a: any) => /hotel/i.test(a.type || "")) || {};
  const rentalAddress = allAddresses.find((a: any) => /temp|rental/i.test(a.type || "")) || {};

  return {
    allAddresses,
    primaryAddress,
    primaryAddrStr: formatAddrLine(primaryAddress),
    tempAddress,
    tempAddrStr: formatAddrLine(tempAddress),
    hotelAddress,
    hotelAddrStr: timelineHotel?.address || formatAddrLine(hotelAddress),
    rentalAddress,
    rentalAddrStr: timelineRental?.address || formatAddrLine(rentalAddress),
  };
};

// buildRushGuideConditions — pure derivation of the condition flag
// object the Rush Guide consumes. Y/Y string + true/false coercions
// match the order shape's mixed-bool conventions.
export const buildRushGuideConditions = (data: any) => ({
  wet: data.damageWasWet === "Y" || data.damageWasWet === true,
  mold: !!data.damageMoldMildew,
  structural: data.structuralElectricDamage === "Y",
  noLights: !!data.noLights,
  boarded: !!data.boardedUp,
});

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

import { rushAddDays, rushFormatDate, rushGetSeasons, parseLocalDate } from "./dateTime";
import { RUSH_REPAIR_TIMELINES } from "../config";
import { DURATION_DAYS, BAND_COLORS, SEASON_DATES } from "./rushGuideVisuals";

export type SeasonChange = {
  name: string;
  startDate: Date;
  items: string[];
  events: string[];
};

// computeRushSeasonChanges — walk SEASON_DATES and collect each
// seasonal transition that falls between `now` and `estimatedReturn`.
// Each entry's items list is enriched with interest-driven extras
// (summer_activities -> pool toys, winter_sports -> ski gear, etc.).
// Returns [] when estimatedReturn is null.
export const computeRushSeasonChanges = (
  now: Date,
  estimatedReturn: Date | null,
  interests: string[],
): SeasonChange[] => {
  if (!estimatedReturn) return [];
  const out: SeasonChange[] = [];
  SEASON_DATES.forEach((s: any) => {
    const changeDate = new Date(now.getFullYear(), s.month, s.day);
    if (changeDate <= now) changeDate.setFullYear(changeDate.getFullYear() + 1);
    if (changeDate <= now || changeDate > estimatedReturn) return;
    const enrichedItems = [...s.items];
    if (s.name === "Summer" && interests.includes("summer_activities")) enrichedItems.push("Pool toys, beach towels, water shoes");
    if (s.name === "Winter" && interests.includes("winter_sports")) enrichedItems.push("Skiing/snowboarding equipment, snow pants, goggles");
    if (s.name === "Spring" && interests.includes("graduation")) enrichedItems.push("Cap and gown, formal celebration attire");
    if (s.name === "Fall" && interests.includes("school")) enrichedItems.push("School backpacks, uniforms, kids sports gear");
    out.push({ name: s.name, startDate: changeDate, items: enrichedItems, events: s.events });
  });
  return out;
};

export type HolidayEvent = { id: string; name: string; date: Date; items: string[] };

const HOLIDAY_DEFS: { interestKey: string; id: string; name: string; month: number; day: number; items: string[] }[] = [
  {
    interestKey: "halloween", id: "holiday_halloween", name: "Halloween", month: 9, day: 31,
    items: ["Costumes and accessories", "Halloween decorations and party supplies"],
  },
  {
    interestKey: "thanksgiving", id: "holiday_thanksgiving", name: "Thanksgiving", month: 10, day: 27,
    items: ["Holiday table linens and servingware", "Fall decorations", "Formal holiday clothing"],
  },
  {
    interestKey: "christmas", id: "holiday_christmas", name: "Christmas / Hanukkah", month: 11, day: 25,
    items: ["Holiday clothing and formal wear", "Holiday decorations and ornaments", "Gift wrapping supplies", "Stockings and holiday bedding"],
  },
  {
    interestKey: "easter", id: "holiday_easter", name: "Easter / Passover", month: 3, day: 5,
    items: ["Spring formal attire", "Holiday table settings", "Children's Easter outfits"],
  },
  {
    interestKey: "graduation", id: "holiday_graduation", name: "Graduation", month: 4, day: 15,
    items: ["Cap and gown", "Formal celebration attire", "Photography outfits"],
  },
];

// computeRushHolidayEvents — for each interests-opted holiday whose
// date falls between now and estimatedReturn, emit the holiday event
// the Gantt + delivery planner can consume. Years roll forward when
// the holiday has already passed in the current calendar year.
export const computeRushHolidayEvents = (
  now: Date,
  estimatedReturn: Date | null,
  interests: string[],
): HolidayEvent[] => {
  if (!estimatedReturn) return [];
  const out: HolidayEvent[] = [];
  HOLIDAY_DEFS.forEach((h) => {
    if (!interests.includes(h.interestKey)) return;
    const d = new Date(now.getFullYear(), h.month, h.day);
    if (d <= now) d.setFullYear(d.getFullYear() + 1);
    if (d > estimatedReturn) return;
    out.push({ id: h.id, name: h.name, date: d, items: h.items });
  });
  return out;
};

// computeEstimatedReturn — resolve the estimated repair-finish date
// from the order. Priority: explicit estimatedReturnDate > later of
// (repair timeline, storage months) > whichever single one is set.
// Returns { explicitReturn, repairReturn, storageReturn,
// estimatedReturn, storageRepairMismatch } so the call site can also
// surface "repair and storage windows don't match" warnings.
export const computeEstimatedReturn = (
  data: any,
  repairInfo: any,
  now: Date,
): {
  explicitReturn: Date | null;
  repairReturn: Date | null;
  storageReturn: Date | null;
  estimatedReturn: Date | null;
  storageRepairMismatch: boolean;
} => {
  const explicitReturn = parseLocalDate(data.estimatedReturnDate);
  const repairReturn = repairInfo ? rushAddDays(now, repairInfo.days) : null;
  const storageReturn = data.storageMonths
    ? rushAddDays(now, parseInt(data.storageMonths) * 30)
    : null;
  const estimatedReturn =
    explicitReturn
    || (repairReturn && storageReturn
      ? (repairReturn > storageReturn ? repairReturn : storageReturn)
      : repairReturn || storageReturn);
  const storageRepairMismatch = !!(
    repairReturn
    && storageReturn
    && Math.abs(repairReturn.getTime() - storageReturn.getTime()) > 30 * 24 * 60 * 60 * 1000
  );
  return { explicitReturn, repairReturn, storageReturn, estimatedReturn, storageRepairMismatch };
};

// resolveRushDeliveryAddresses — decide where the rush, rental, and
// final deliveries should go. Rush prefers hotel > rental > temp >
// primary; rental falls back through temp > primary; final is always
// the primary address. hasHotel/hasRental are derived from the timeline
// AND single-status (orderSituation) AND the resolved address strings.
export const resolveRushDeliveryAddresses = (
  livingTimeline: any[],
  orderSituation: string,
  hotelAddrStr: string,
  rentalAddrStr: string,
  tempAddrStr: string,
  primaryAddrStr: string,
) => {
  const hasHotel =
    livingTimeline.some((s: any) => s.type === "Hotel") || orderSituation === "hotel" || !!hotelAddrStr;
  const hasRental =
    livingTimeline.some((s: any) => s.type === "Rental" || s.type === "Temp")
    || orderSituation === "temp"
    || !!rentalAddrStr;
  const rushDeliverTo = hasHotel && hotelAddrStr
    ? hotelAddrStr
    : hasRental && rentalAddrStr
      ? rentalAddrStr
      : tempAddrStr || primaryAddrStr;
  const rentalDeliverTo = rentalAddrStr || tempAddrStr || primaryAddrStr;
  const finalDeliverTo = primaryAddrStr;
  return { hasHotel, hasRental, rushDeliverTo, rentalDeliverTo, finalDeliverTo };
};

// computeRushTimelineBands — the contiguous-no-gap Gantt bands shown
// in the Rush Guide timeline. One band per livingTimeline stay; start
// dates are calculated using explicit endDate first, then duration
// fallback. The last band runs to the explicit stay end, the
// estimatedReturn, or 90 days out.
export const computeRushTimelineBands = (
  livingTimeline: any[],
  now: Date,
  estimatedReturn: Date | null,
  allAddresses: any[],
): { type: string; startDate: Date; endDate: Date; address: string; color: string }[] => {
  if (livingTimeline.length === 0) return [];
  const starts: Date[] = [new Date(now)];
  for (let i = 0; i < livingTimeline.length - 1; i++) {
    const explicitEnd = parseLocalDate(livingTimeline[i].endDate);
    if (explicitEnd && explicitEnd > starts[i]) starts.push(explicitEnd);
    else {
      const days = (DURATION_DAYS as any)[livingTimeline[i].duration] || 30;
      starts.push(rushAddDays(starts[i], days));
    }
  }
  const totalEnd = estimatedReturn || rushAddDays(now, 90);
  const bands: { type: string; startDate: Date; endDate: Date; address: string; color: string }[] = [];
  livingTimeline.forEach((stay: any, i: number) => {
    const start = starts[i];
    const explicitEnd = parseLocalDate(stay.endDate);
    const end = i < livingTimeline.length - 1
      ? starts[i + 1]
      : (explicitEnd && explicitEnd > start ? explicitEnd : totalEnd);
    const addressFromType = stay.addressType
      ? (allAddresses.find((a: any) => (a.type || "").toLowerCase() === stay.addressType.toLowerCase()) || {})
      : {};
    const addressLine = stay.address
      || [addressFromType.street, addressFromType.city, addressFromType.state, addressFromType.zip].filter(Boolean).join(", ")
      || (stay.addressType ? `${stay.addressType} address TBD` : "");
    bands.push({
      type: stay.type,
      startDate: start,
      endDate: end,
      address: addressLine,
      color: (BAND_COLORS as any)[stay.type] || "bg-slate-400",
    });
  });
  return bands;
};

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
