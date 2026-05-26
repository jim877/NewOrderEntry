// @ts-nocheck
// Pure builder for the order narrative (the structured "section: text"
// lines shown in the Save Summary's Table view + used as the basis for the
// SDS approval document's narrative section). Reads exclusively from the
// order shape — no React, no closure deps.

import { hasMeaningfulValue, summarizeAddress } from "./order";
import { formatDateLabel } from "./dateTime";
import { stripEventSystemLines } from "./eventInstructions";

export type NarrativeLine = { section: string; text: string };

// buildOrderNarrative — assemble the per-section narrative lines. The
// ordering mirrors the way readers expect an intake summary to flow:
// loss → people → place → source → insurance → vendors → services →
// conditions → living/storage → repairs → packout → considerations →
// pets → interview answers → schedule → free-form notes.
export const buildOrderNarrative = (data: any): NarrativeLine[] => {
  const lines: NarrativeLine[] = [];

  // Loss type — primary loss + any causes/origins + secondary contaminants.
  if (data.primaryLossType) {
    let lossLine = `${data.primaryLossType} loss`;
    const causes = data.lossDetails?.[data.primaryLossType]?.causes || [];
    const origins = data.lossDetails?.[data.primaryLossType]?.origins || [];
    if (causes.length) lossLine += ` (${causes.join(", ").toLowerCase()})`;
    if (origins.length) lossLine += ` originating in ${origins.join(", ").toLowerCase()}`;
    if ((data.secondaryContaminants || []).length) {
      lossLine += `, with secondary ${(data.secondaryContaminants || []).join(", ").toLowerCase()}`;
    }
    lossLine += ".";
    lines.push({ section: "Loss", text: lossLine });
  }

  // Customers — primary first, then any named secondaries (with their type).
  const customers = (data.customers || []).filter((c: any) => hasMeaningfulValue(c.first) || hasMeaningfulValue(c.last));
  customers.forEach((c: any) => {
    const name = [c.first, c.last].filter(Boolean).join(" ");
    const details = [c.phone, c.email].filter(Boolean).join(", ");
    const role = c.isPrimary ? "Customer" : (c.type || "Contact");
    lines.push({ section: role, text: `${name}${details ? " — " + details : ""}` });
  });

  // Addresses — primary as "Address", others under their type label.
  const addrs = (data.addresses || []).filter((a: any) => !a.inactive && hasMeaningfulValue(a.street));
  addrs.forEach((a: any) => {
    const label = a.isPrimary ? "Address" : (a.type || "Address");
    lines.push({ section: label, text: summarizeAddress(a) });
  });

  // Source / sales rep.
  if (data.referrer || data.referringCompany) {
    lines.push({ section: "Referral", text: [data.referrer, data.referringCompany].filter(Boolean).join(" at ") });
  }
  if (data.salesRep) lines.push({ section: "Sales Rep", text: data.salesRep.split(",")[0] });

  // Insurance / claim.
  if (data.insuranceCompany) {
    let ins = data.insuranceCompany;
    if (data.insuranceAdjuster) ins += ` — Adjuster: ${data.insuranceAdjuster}`;
    lines.push({ section: "Insurance", text: ins });
  }
  if (data.claimNumber) lines.push({ section: "Claim #", text: data.claimNumber });

  // Other companies (vendors).
  (data.vendors || []).forEach((v: any) => {
    if (v.company || v.contact) {
      lines.push({ section: v.type || "Company", text: [v.company, v.contact].filter(Boolean).join(" — ") });
    }
  });

  // Services + condition flags.
  if ((data.serviceOfferings || []).length) {
    lines.push({ section: "Services", text: (data.serviceOfferings || []).join(", ") });
  }
  const conditions: string[] = [];
  if (data.damageWasWet === "Y" || data.damageWasWet === true) conditions.push("still wet");
  if (data.damageMoldMildew) conditions.push("visible mold");
  if (data.structuralElectricDamage === "Y") conditions.push("structural damage");
  if (data.noLights) conditions.push("no electricity");
  if (data.noHeat) conditions.push("no heat");
  if (data.boardedUp) conditions.push("boarded up");
  if (conditions.length) lines.push({ section: "Conditions", text: conditions.join(", ") + "." });

  // Living / storage / repairs / pack-out.
  if (data.livingStatus) lines.push({ section: "Living", text: data.livingStatus });
  if (data.storageNeeded === "Y") {
    lines.push({ section: "Storage", text: `Long-term storage${data.storageMonths ? `, approximately ${data.storageMonths} months` : ""}` });
  }
  if (data.repairsSummary) lines.push({ section: "Repairs", text: data.repairsSummary });
  if ((data.packoutSummary || []).length) {
    lines.push({ section: "Pack-out", text: (data.packoutSummary || []).join(", ") });
  }

  // Considerations (filtered to exclude Pets since pets gets its own line).
  const considerations = (data.sdsConsiderations || []).filter((c: string) => c !== "Pets");
  if (considerations.length) lines.push({ section: "Considerations", text: considerations.join(", ") });

  // Pets — prefer the free-form householdAnimals string; fall back to
  // assembling "Type Name" from household entries.
  const petStr = data.householdAnimals || (data.household || [])
    .filter((m: any) => m.category === "pet")
    .map((p: any) => [p.type, p.name].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");
  if (petStr) lines.push({ section: "Pets", text: petStr });

  // Interview Y/N answers with free-text notes.
  if (data.familyMedicalIssues === "Y") {
    lines.push({ section: "Medical", text: data.familyMedicalNote || "Medical issues reported" });
  }
  if (data.soapFragAllergies === "Y") {
    lines.push({ section: "Allergies", text: data.soapFragNote || "Soap/fragrance allergies reported" });
  }
  if (data.selfCleaning === "Y") {
    lines.push({ section: "Self-Clean", text: data.selfCleaningNote || "Customer will clean some items themselves" });
  }
  if (data.useDryCleaner && data.useDryCleaner !== "No") {
    lines.push({ section: "Dry Cleaner", text: data.useDryCleaner === "Yes" ? "Uses a dry cleaner" : "Rarely uses dry cleaner" });
  }
  if (data.howDryLaundry && data.howDryLaundry !== "Dryer") {
    lines.push({ section: "Laundry", text: data.howDryLaundry === "Air-Dry" ? "Customer air-dries clothing — do not machine dry" : "Customer prefers low heat drying" });
  }

  // Delivery + handling codes + schedule.
  if (data.processType) lines.push({ section: "Delivery", text: data.processType });
  if ((data.handlingCodes || []).length) {
    lines.push({ section: "Handling", text: (data.handlingCodes || []).join(", ") });
  }
  if (data.scheduleType || data.pickupDate) {
    const parts = [data.scheduleType, data.pickupDate ? formatDateLabel(data.pickupDate) : "", data.pickupTime].filter(Boolean);
    lines.push({ section: "Scheduled", text: parts.join(" — ") });
  }
  if (data.eventAssignee) lines.push({ section: "Assignee", text: data.eventAssignee });

  // Free-form notes (system event lines stripped so they don't double-count).
  const customNotes = stripEventSystemLines(data.eventInstructions || "").trim();
  if (customNotes) lines.push({ section: "Event Instructions", text: customNotes });

  return lines;
};
