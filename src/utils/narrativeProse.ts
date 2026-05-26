// @ts-nocheck
// buildNarrativeProse — convert the structured `narrative` lines (grouped by section)
// + the order data into a paragraph-style summary used in the Save modal's "narrative" view.
// Pure: depends only on summarizeAddress for the address line.

import { summarizeAddress } from "./order";

export const buildNarrativeProse = (narrative: any[] = [], data: any = {}) => {
  // Bucket narrative lines by section so we can pluck them in display order.
  const g: Record<string, string[]> = {};
  narrative.forEach((l) => { (g[l.section] = g[l.section] || []).push(l.text); });

  const p: string[] = [];

  // Opening — loss description
  if (g["Loss"]) p.push(`This is a ${g["Loss"][0]}`);

  // Customer + Address
  const primary = (data.customers || []).find((c: any) => c.isPrimary) || (data.customers || [])[0];
  const primaryAddr = (data.addresses || []).find((a: any) => a.isPrimary) || (data.addresses || [])[0];
  if (primary && (primary.first || primary.last)) {
    const name = [primary.first, primary.last].filter(Boolean).join(" ");
    const role = primary.policyHolder ? "The policyholder" : "The customer";
    let custLine = `${role} is ${name}`;
    if (primaryAddr && primaryAddr.street) custLine += ` at ${summarizeAddress(primaryAddr)}`;
    if (primary.phone) custLine += `. They can be reached at ${primary.phone}`;
    if (primary.email) custLine += ` (${primary.email})`;
    p.push(custLine + ".");
  }

  // Additional contacts
  const others = (data.customers || []).filter((c: any, i: number) => i > 0 && (c.first || c.last));
  others.forEach((c: any) => {
    const name = [c.first, c.last].filter(Boolean).join(" ");
    const role = c.type || "additional contact";
    let line = `${name} is ${role === "Husband" || role === "Wife" ? `the ${role.toLowerCase()}` : `an ${role.toLowerCase()}`}`;
    if (c.email) line += ` (${c.email})`;
    if (c.phone) line += `, reachable at ${c.phone}`;
    p.push(line + ".");
  });

  // Referral + Insurance
  const refParts: string[] = [];
  if (g["Referral"])  refParts.push(`This order was referred by ${g["Referral"][0]}`);
  if (g["Sales Rep"]) refParts.push(`assigned to account manager ${g["Sales Rep"][0]}`);
  if (refParts.length) p.push(refParts.join(", ") + ".");

  if (g["Insurance"]) {
    let ins = `The insurance carrier is ${g["Insurance"][0]}`;
    if (g["Claim #"]) ins += `, claim #${g["Claim #"][0]}`;
    p.push(ins + ".");
  }

  // Other companies (skip Insurance — already covered)
  (data.vendors || []).forEach((v: any) => {
    if (v.company && v.type && !["Insurance"].includes(v.type)) {
      let line = `${v.company} is the ${v.type.toLowerCase()}`;
      if (v.contact) line += ` (contact: ${v.contact})`;
      p.push(line + ".");
    }
  });

  // Our services
  if (g["Services"]) p.push(`Our scope of work includes ${g["Services"][0].toLowerCase()}.`);

  // Conditions
  if (g["Conditions"]) p.push(`At the home, the site currently has ${g["Conditions"][0]}`);

  // Customer care
  const careParts: string[] = [];
  if (g["Considerations"]) careParts.push(g["Considerations"][0].toLowerCase());
  if (g["Pets"])           careParts.push(`has a pet (${g["Pets"][0]})`);
  if (g["Laundry"])        careParts.push(g["Laundry"][0].toLowerCase());
  if (careParts.length) p.push(`The customer is ${careParts.join(", ")}.`);

  // Living + Storage
  if (g["Living"]) {
    const liv = g["Living"][0];
    const livingNarrative =
      liv === "Staying in home" ? "staying in the home" :
      liv === "Hotel"           ? "staying in a hotel" :
      liv === "Temp"            ? "in a temporary home" :
      liv === "Moving"          ? "permanently relocating" :
      "in temporary housing";
    let living = `The customer is currently ${livingNarrative}`;
    if (g["Storage"]) living += ` and will need ${g["Storage"][0].toLowerCase()}`;
    p.push(living + ".");
  }

  // Structural repairs (not our work)
  if (g["Repairs"]) p.push(`Structural repairs to the home include ${g["Repairs"][0].toLowerCase()} (performed by the contractor, not our team).`);

  // Our packout
  if (g["Pack-out"]) p.push(`We will be picking up ${g["Pack-out"][0].toLowerCase()}.`);

  // Schedule
  if (g["Scheduled"]) p.push(`The next appointment is ${g["Scheduled"][0]}.`);

  // Event Instructions
  if (g["Event Instructions"]) p.push(`Event Instructions for next appointment: ${g["Event Instructions"][0]}`);

  return p;
};
