// @ts-nocheck
// Order-type predicates + selection mutators. All take/return the orderTypes string array.
// Non-Restoration is a single string ("Non-Restoration") + an optional subtype like
// "Commercial Cleaning"; Restoration is an arbitrary subset of LOSS_TYPES (Fire/Water/...).

import { LOSS_TYPES, NON_RESTORATION_PRIMARY, NON_RESTORATION_SUBTYPES } from "../config";

export const getNonRestorationSubtype = (orderTypes: string[] = []) =>
  NON_RESTORATION_SUBTYPES.find((type) => (orderTypes || []).includes(type)) || "";

export const isNonRestorationSelected = (orderTypes: string[] = []) =>
  (orderTypes || []).includes(NON_RESTORATION_PRIMARY) || !!getNonRestorationSubtype(orderTypes);

export const hasRestorationOrderType = (orderTypes: string[] = []) =>
  (orderTypes || []).some((type) => LOSS_TYPES.includes(type));

export const projectTypeFromOrderTypes = (orderTypes: string[] = []) => {
  if (isNonRestorationSelected(orderTypes)) return "Non-Restoration Project";
  if (hasRestorationOrderType(orderTypes)) return "Restoration Project";
  return "";
};

export const hasPrimaryOrderTypeDecision = (orderTypes: string[] = []) =>
  isNonRestorationSelected(orderTypes) || hasRestorationOrderType(orderTypes);

export const hasRequiredNonRestorationSubtype = (orderTypes: string[] = []) =>
  !isNonRestorationSelected(orderTypes) || !!getNonRestorationSubtype(orderTypes);

// normalizeOrderTypes — dedupe, drop empties, prefer non-restoration canonical pair if both flavors present.
export const normalizeOrderTypes = (orderTypes: string[] = []) => {
  const unique = Array.from(new Set((orderTypes || []).filter(Boolean)));
  const subtype = getNonRestorationSubtype(unique);
  const nonRestoration = unique.includes(NON_RESTORATION_PRIMARY) || !!subtype;
  const restoration = unique.filter((type) => LOSS_TYPES.includes(type));
  if (nonRestoration) return [NON_RESTORATION_PRIMARY, ...(subtype ? [subtype] : [])];
  if (restoration.length) return restoration;
  return unique;
};

// Click handler for the "Non-Restoration" toggle: present → clear all; absent → set just non-restoration.
export const toggleNonRestorationPrimarySelection = (orderTypes: string[] = []) => {
  const normalized = normalizeOrderTypes(orderTypes);
  if (isNonRestorationSelected(normalized)) return [];
  return [NON_RESTORATION_PRIMARY];
};

// Click handler for a single restoration loss type toggle.
export const toggleRestorationTypeSelection = (orderTypes: string[] = [], type = "") => {
  if (!LOSS_TYPES.includes(type)) return normalizeOrderTypes(orderTypes);
  const normalized = normalizeOrderTypes(orderTypes);
  const activeRestoration = normalized.filter((item) => LOSS_TYPES.includes(item));
  if (activeRestoration.includes(type)) return activeRestoration.filter((item) => item !== type);
  return [...activeRestoration, type];
};

// Picking a non-restoration subtype (Commercial Cleaning, Residential Cleaning, Other) implies the primary.
export const selectNonRestorationSubtypeSelection = (orderTypes: string[] = [], subtype = "") => {
  if (!NON_RESTORATION_SUBTYPES.includes(subtype)) return normalizeOrderTypes(orderTypes);
  return [NON_RESTORATION_PRIMARY, subtype];
};
