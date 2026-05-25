// @ts-nocheck
// Pure builder for the Rush Guide action plan — the four output arrays
// (rushItems / shortTermItems / seasonalWardrobes / eventDeliveries)
// plus the reminders list. Reads exclusively from order data + the
// rushGuide-local overrides. No React, no setState.

import { rushFormatDate } from "./dateTime";
import type { HouseholdComposition } from "./rushGuideTimeline";
import type { SeasonChange, HolidayEvent } from "./rushGuideTimeline";

export type SeasonalWardrobe = {
  id: string;
  season: string;
  date: string;
  rawDate: Date;
  items: string[];
  events: string[];
  assignedGroup: string;
};

export type EventDelivery = {
  id: string;
  name: string;
  date: string;
  items: string[];
  address: string;
};

export type RushGuideActionPlan = {
  rushItems: string[];
  shortTermItems: string[];
  seasonalWardrobes: SeasonalWardrobe[];
  eventDeliveries: EventDelivery[];
  reminders: string[];
};

// Mapping from event-type id to the list of items that event triggers.
// Used to enrich the per-event delivery card.
const EVENT_TYPE_ITEMS: Record<string, string[]> = {
  vacation_beach: [
    "Swimwear, resort wear, and sandals",
    "Beach bags, sunglasses, and sun hats",
    "Suitcases and travel luggage",
  ],
  vacation_ski: [
    "Ski gear, thermal layers, heavy coats, and boots",
    "Suitcases and travel luggage",
  ],
  wedding: [
    "Suits, formal dresses, dress shoes",
    "Ties, jewelry, and formal accessories",
  ],
  business: [
    "Business professional attire and dress shoes",
    "Briefcase, garment bags, and carry-on luggage",
  ],
  sports: [
    "Uniforms, cleats, and practice gear",
    "Sports equipment bags and gear",
  ],
};

const BASE_REMINDERS: string[] = [
  "Remove Valuables: Please remove any valuables or highly personal items from your textiles.",
  "No Need to Bag: You do not need to photograph, bag, or list any items — we will do that for you!",
];

// buildRushGuideActionPlan — assemble the four output lists in one
// pass over the inputs. Caller provides:
//   - household composition (babies/kids/elderly/petCount/totalPeople/petNames)
//   - orderSituation ("home" / "hotel" / "temp" / "moving" / "")
//   - hasRental — drives some rush-vs-short-term routing decisions
//   - now / estimatedReturn — used for date-relative grouping decisions
//   - repairInfo — when null AND no orderSituation AND no estimatedReturn, the
//     entire plan is skipped (just emits BASE_REMINDERS)
//   - considerations / packoutItems / conditions / interests — content drivers
//   - seasonChanges / holidayEvents — from computeRushSeasonChanges + ...HolidayEvents
//   - rawEvents — data.upcomingEvents (per-event delivery decisions)
//   - seasonOverrides / eventOverrides — rushGuideData-local override maps
export const buildRushGuideActionPlan = (input: {
  household: HouseholdComposition;
  orderSituation: string;
  hasRental: boolean;
  now: Date;
  estimatedReturn: Date | null;
  repairInfo: any;
  considerations: string[];
  packoutItems: string[];
  conditions: { wet: boolean; mold: boolean; structural: boolean; noLights: boolean; boarded: boolean };
  interests: string[];
  seasonChanges: SeasonChange[];
  holidayEvents: HolidayEvent[];
  rawEvents: any[];
  seasonOverrides: Record<string, any>;
  eventOverrides: Record<string, any>;
}): RushGuideActionPlan => {
  const {
    household,
    orderSituation,
    hasRental,
    now,
    estimatedReturn,
    repairInfo,
    considerations,
    packoutItems,
    conditions,
    interests,
    seasonChanges,
    holidayEvents,
    rawEvents,
    seasonOverrides,
    eventOverrides,
  } = input;

  const rushItems: string[] = [];
  const shortTermItems: string[] = [];
  const seasonalWardrobes: SeasonalWardrobe[] = [];
  const eventDeliveries: EventDelivery[] = [];
  const reminders: string[] = [...BASE_REMINDERS];

  // Plan generation is gated — when we don't know the repair type, the
  // living situation, OR the estimated return, we don't have enough
  // signal to recommend specifics.
  if (!repairInfo && !orderSituation && !estimatedReturn) {
    return { rushItems, shortTermItems, seasonalWardrobes, eventDeliveries, reminders };
  }

  const { babies, kids, elderly, petCount, totalPeople, petNames } = household;

  // Core essentials.
  rushItems.push(`Clothing & undergarments to last ${totalPeople} people a couple of weeks`);
  rushItems.push("Daily footwear, sneakers, and belts");

  // Living-situation-specific items + reminders.
  if (orderSituation === "hotel" || orderSituation === "temp") {
    rushItems.push("Suitcases, duffel bags, or overnight bags");
  }
  if (orderSituation === "home") {
    rushItems.push("Daily household essentials (towels, shower curtains)");
    shortTermItems.push("Temporary window shades (for privacy)");
    shortTermItems.push("Throw rugs and daily bedding");
    reminders.push("Since you are staying home, we will try to work as quietly as possible.");
  } else if (orderSituation === "hotel") {
    reminders.push("Hotels provide bedding and towels, so there is no need to rush those items.");
    rushItems.push("Favorite blankets or pillows for comfort");
  } else if (orderSituation === "temp") {
    reminders.push("Most rentals are furnished so you likely will not need full bedding or towels unless preferred.");
  }

  // Family composition (age-aware).
  if (babies > 0) {
    rushItems.push("Strollers, diaper bags, and car seats");
    rushItems.push("Crib bedding, baby blankets, and sleep sacks");
  }
  if (kids > 0) rushItems.push("Favorite comfort toys or stuffed animals");
  if (elderly > 0) {
    reminders.push(
      "We will be extra careful with fragile or sentimental items for elderly family members. Please set aside any medications, medical devices, or mobility aids that are needed immediately."
    );
  }
  if (petCount > 0) {
    rushItems.push(`Pet beds, leashes, and carrying crates${petNames ? ` (${petNames})` : ""}`);
  }

  // Considerations-driven items.
  if (considerations.includes("Pregnancy")) {
    rushItems.push("Maternity clothing and comfort items");
    reminders.push("All items will be cleaned with baby-safe, hypoallergenic products.");
  }
  if (considerations.includes("Premium Brands")) {
    reminders.push("Your high-end designer pieces will be routed for delicate hand-cleaning.");
  }

  // Packout items — what's being picked up affects what needs rushing.
  if (packoutItems.includes("Clothing")) rushItems.push("Prioritize your most-needed clothing for the Rush delivery");
  if (packoutItems.includes("Bedding") && orderSituation === "home") rushItems.push("Temporary bedding while yours is being cleaned");
  if (packoutItems.includes("Electronics")) rushItems.push("Identify any electronics you need immediately (chargers, laptops)");

  // Conditions-driven urgency.
  if (conditions.wet) reminders.push("URGENT: Wet items are being separated by color and treated immediately with anti-microbial.");
  if (conditions.mold) reminders.push("Mold-affected items require special handling with PPE — do not disturb.");
  if (conditions.boarded) reminders.push("Access may be limited — please confirm entry arrangements.");

  // Interests / activities.
  if (interests.includes("school")) rushItems.push("School backpacks, uniforms, and kids sports gear");
  if (interests.includes("workout")) rushItems.push("Workout clothes, sneakers, and gym equipment");
  if (interests.includes("work_from_home")) {
    if (hasRental) shortTermItems.push("Home office supplies, desk accessories, and work materials");
    else rushItems.push("Home office supplies, desk accessories, and work materials");
  }
  if (interests.includes("religious")) {
    if (hasRental) shortTermItems.push("Formal religious attire, prayer items, and head coverings");
    else rushItems.push("Formal religious attire, prayer items, and head coverings");
  }

  // Season-change group assignment. Default: rental exists -> short
  // (deliver to rental); no rental -> rush (if <30 days out) or
  // "separate" (needs its own delivery to a hotel/LTD).
  const defaultSeasonGroup = (dateMs: number) => {
    if (hasRental) return "short";
    const daysOut = (dateMs - now.getTime()) / 86400000;
    if (daysOut < 30) return "rush";
    return "separate";
  };

  seasonChanges.forEach((sc) => {
    const scId = `season_${sc.name.toLowerCase()}`;
    const assignedGroup = seasonOverrides?.[scId]?.group || defaultSeasonGroup(sc.startDate.getTime());
    seasonalWardrobes.push({
      id: scId,
      season: sc.name,
      date: rushFormatDate(sc.startDate),
      rawDate: sc.startDate,
      items: sc.items,
      events: sc.events,
      assignedGroup,
    });
  });

  holidayEvents.forEach((he) => {
    const assignedGroup = seasonOverrides?.[he.id]?.group || defaultSeasonGroup(he.date.getTime());
    seasonalWardrobes.push({
      id: he.id,
      season: he.name,
      date: rushFormatDate(he.date),
      rawDate: he.date,
      items: he.items,
      events: [],
      assignedGroup,
    });
  });

  // Merge seasonal items assigned to rush/short into those output arrays.
  seasonalWardrobes.forEach((sw) => {
    if (sw.assignedGroup === "rush") rushItems.push(...sw.items.map((i) => `[${sw.season}] ${i}`));
    if (sw.assignedGroup === "short") shortTermItems.push(...sw.items.map((i) => `[${sw.season}] ${i}`));
  });

  // Per-event deliveries.
  rawEvents.forEach((evt: any) => {
    if (!evt.date) return;
    const eventDate = new Date(evt.date);
    if (estimatedReturn && eventDate > estimatedReturn) {
      reminders.push(`Your trip "${evt.name}" falls after repairs are expected to finish.`);
      return;
    }
    const items = EVENT_TYPE_ITEMS[evt.type] ? [...EVENT_TYPE_ITEMS[evt.type]] : [];
    const override = eventOverrides?.[evt.id];
    const assignedGroup = override?.group || "event";
    const eventAddress = override?.address || "";
    if (assignedGroup === "rush") {
      rushItems.push(...items.map((i) => `[${evt.name}] ${i}`));
    } else if (assignedGroup === "short") {
      shortTermItems.push(...items.map((i) => `[${evt.name}] ${i}`));
    } else if (assignedGroup === "rental") {
      // Shown in the rental delivery section — no list to push to here.
    } else {
      eventDeliveries.push({
        id: evt.id,
        name: evt.name,
        date: rushFormatDate(eventDate),
        items,
        address: eventAddress,
      });
    }
  });

  return { rushItems, shortTermItems, seasonalWardrobes, eventDeliveries, reminders };
};
