// @ts-nocheck
// Pure derivations of the unique company/contact names that appear on the
// current order. Used by the order-attention / instructions resolver paths
// to look up saved guidance per entity, and elsewhere to feed pickers.
// Both helpers de-dupe via the normalize* helpers so case/whitespace
// variants collapse to a single canonical entry.

import { normalizeCompany, normalizeContact } from "./strings";
import { entryContactList } from "./companyEntry";

// getOrderCompanyNames — flatten the half-dozen "company" fields on the order
// (referring / billing / insurance / public-adjusting / independent /
// tpa / each additionalCompanies entry) into a unique list of display names.
// Preserves first-seen casing/spacing.
export const getOrderCompanyNames = (data: any): string[] => {
  const names = new Map<string, string>();
  const add = (value: any) => {
    const trimmed = (value || "").toString().trim();
    if (!trimmed) return;
    const key = normalizeCompany(trimmed);
    if (!names.has(key)) names.set(key, trimmed);
  };
  add(data.referringCompany);
  add(data.billingCompany);
  add(data.insuranceCompany);
  add(data.publicAdjustingCompany);
  add(data.independentAdjustingCo);
  add(data.tpaCompany);
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => add(entry?.company));
  return Array.from(names.values());
};

// getOrderContactNames — same shape but for contact names. Includes the
// per-additional-company contact lists in addition to the top-level role
// holders (referrer / billing / adjuster / public-adjuster / independent /
// tpa).
export const getOrderContactNames = (data: any): string[] => {
  const names = new Map<string, string>();
  const add = (value: any) => {
    const trimmed = (value || "").toString().trim();
    if (!trimmed) return;
    const key = normalizeContact(trimmed);
    if (!names.has(key)) names.set(key, trimmed);
  };
  add(data.referrer);
  add(data.billingContact);
  add(data.insuranceAdjuster);
  add(data.publicAdjuster);
  add(data.independentAdjuster);
  add(data.tpaContact);
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => {
    entryContactList(entry || {}).forEach((contact: any) => add(contact?.name));
  });
  return Array.from(names.values());
};
